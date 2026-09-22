"""
Sahm Backend — Token Service (Prompt 18)
High-Entropy Crockford Base32 Verification Token Generation & Canonicalization.

Design:
- Alphabet: 0123456789ABCDEFGHJKMNPQRSTVWXYZ (32 chars)
  Eliminates I, L, O, U to prevent visual confusion and accidental profanity.
- Formatted as: XXXX-XXXX-XXXX (12 chars, ~60 bits entropy)
- Anti-brute force: 1.15 quintillion possible combinations.
- Tolerant normalization: Maps 'I', 'L' -> '1', and 'O' -> '0' if human-typed.
"""
import hashlib
import re
import secrets
from typing import Optional

CROCKFORD_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
TRANSLATION_TABLE = str.maketrans({
    "I": "1",
    "i": "1",
    "L": "1",
    "l": "1",
    "O": "0",
    "o": "0",
})


def generate_verification_code(groups: int = 3, group_len: int = 4) -> str:
    """
    Generate a cryptographically secure Crockford Base32 verification code.
    Default: 3 groups of 4 chars -> 12 characters total (e.g. '7KX9-QM4P-82DZ').
    """
    chunks = []
    for _ in range(groups):
        chunk = "".join(secrets.choice(CROCKFORD_ALPHABET) for _ in range(group_len))
        chunks.append(chunk)
    return "-".join(chunks)


def normalize_code(raw_code: str) -> str:
    """
    Normalize human or scanner input:
    - Strip whitespace, hyphens, slashes
    - Uppercase
    - Translate confusing chars (I/L -> 1, O -> 0)
    - Re-format into XXXX-XXXX-XXXX if length is 12
    """
    if not raw_code:
        return ""

    # Strip URL prefixes if full URL passed (e.g. https://domain.edu/v/7KX9-QM4P-82DZ)
    clean = raw_code.strip()
    if "/v/" in clean:
        clean = clean.split("/v/")[-1]
    elif "/" in clean:
        clean = clean.split("/")[-1]

    # Remove non-alphanumeric except hyphens
    clean = re.sub(r"[^A-Za-z0-9]", "", clean).upper()

    # Apply Crockford normalization
    clean = clean.translate(TRANSLATION_TABLE)

    # Format if 12 chars
    if len(clean) == 12:
        return f"{clean[0:4]}-{clean[4:8]}-{clean[8:12]}"
    elif len(clean) == 8:
        return f"{clean[0:4]}-{clean[4:8]}"
    return clean


def extract_raw_token(code: str) -> str:
    """Returns token without hyphens."""
    norm = normalize_code(code)
    return norm.replace("-", "")


def hash_secret(secret: str, salt: str) -> str:
    """Hashes an optional verification secret with SHA-256 and institutional salt."""
    salted = f"{salt}:{secret}".encode("utf-8")
    return hashlib.sha256(salted).hexdigest()


def verify_secret(secret: Optional[str], secret_hash: Optional[str], salt: str) -> bool:
    """Constant-time verification of optional verification secret."""
    if not secret_hash:
        return True
    if not secret:
        return False
    computed = hash_secret(secret, salt)
    return secrets.compare_digest(computed, secret_hash)
