"""
Sahm Backend — Cryptographic Engine for Package Envelope Encryption (Prompt 22)
Provides DEK generation, AES-256-GCM encryption/decryption, key wrapping,
crypto-shredding on revocation, and Merkle tree root hash generation.
"""
import os
import hmac
import hashlib
import base64
import secrets
from typing import Tuple, List, Optional
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes


class CryptoEngine:
    """Handles envelope encryption, data integrity, and key destruction."""

    @staticmethod
    def generate_dek() -> bytes:
        """Generate a cryptographically secure 256-bit (32-byte) Data Encryption Key."""
        return AESGCM.generate_key(bit_length=256)

    @staticmethod
    def encrypt_payload(payload_bytes: bytes, dek: bytes) -> Tuple[bytes, bytes]:
        """
        Encrypt payload using AES-256-GCM with a random 96-bit (12-byte) nonce.
        Returns: (ciphertext_with_tag, nonce)
        """
        aesgcm = AESGCM(dek)
        nonce = secrets.token_bytes(12)
        ciphertext = aesgcm.encrypt(nonce, payload_bytes, associated_data=None)
        return ciphertext, nonce

    @staticmethod
    def decrypt_payload(ciphertext: bytes, nonce: bytes, dek: bytes) -> bytes:
        """
        Decrypt AES-256-GCM ciphertext using the provided nonce and DEK.
        Raises InvalidTag if tampered with.
        """
        aesgcm = AESGCM(dek)
        return aesgcm.decrypt(nonce, ciphertext, associated_data=None)

    @staticmethod
    def wrap_dek(dek: bytes, wrapping_secret: str, salt: Optional[bytes] = None) -> str:
        """
        Wrap DEK using PBKDF2-HMAC-SHA256 key derivation and AES-GCM encryption.
        Returns base64 encoded string containing: salt (16B) + nonce (12B) + encrypted_dek.
        """
        if salt is None:
            salt = secrets.token_bytes(16)

        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100_000,
        )
        kek = kdf.derive(wrapping_secret.encode("utf-8"))
        aesgcm = AESGCM(kek)
        nonce = secrets.token_bytes(12)
        encrypted_dek = aesgcm.encrypt(nonce, dek, associated_data=b"sahm_dek_wrap")

        envelope = salt + nonce + encrypted_dek
        return base64.b64encode(envelope).decode("utf-8")

    @staticmethod
    def unwrap_dek(wrapped_dek_b64: str, wrapping_secret: str) -> bytes:
        """
        Unwrap DEK from base64 envelope.
        """
        raw_envelope = base64.b64decode(wrapped_dek_b64.encode("utf-8"))
        if len(raw_envelope) < 28:
            raise ValueError("Invalid wrapped DEK envelope length")

        salt = raw_envelope[:16]
        nonce = raw_envelope[16:28]
        encrypted_dek = raw_envelope[28:]

        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100_000,
        )
        kek = kdf.derive(wrapping_secret.encode("utf-8"))
        aesgcm = AESGCM(kek)
        return aesgcm.decrypt(nonce, encrypted_dek, associated_data=b"sahm_dek_wrap")

    @staticmethod
    def calculate_sha256(data: bytes) -> str:
        """Compute standard hex SHA-256 digest of byte data."""
        return hashlib.sha256(data).hexdigest()

    @staticmethod
    def calculate_merkle_root(leaf_hashes: List[str]) -> str:
        """
        Compute Merkle tree root hash from a list of SHA-256 leaf hashes.
        Returns hex digest.
        """
        if not leaf_hashes:
            return hashlib.sha256(b"").hexdigest()
        if len(leaf_hashes) == 1:
            return leaf_hashes[0]

        current_level = [bytes.fromhex(h) for h in leaf_hashes]

        while len(current_level) > 1:
            next_level = []
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                if i + 1 < len(current_level):
                    right = current_level[i + 1]
                else:
                    right = left  # Duplicate last element if odd
                combined = hashlib.sha256(left + right).digest()
                next_level.append(combined)
            current_level = next_level

        return current_level[0].hex()

    @staticmethod
    def crypto_shred(package_obj) -> bool:
        """
        Crypto-shredding: destroy wrapped DEK and mark key destroyed.
        Renders the encrypted payload permanently indecipherable.
        """
        package_obj.wrapped_dek_base64 = None
        package_obj.is_key_destroyed = True
        return True
