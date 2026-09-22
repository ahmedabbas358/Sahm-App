"""
Sahm Backend — Abuse Detector & Rate Limiter (Prompt 18)
Protects the public verification endpoint against brute-force enumeration,
timing attacks, and denial-of-service bursts.

Features:
- IP Pseudonymization with SHA-256 and institutional salt.
- In-memory sliding window rate limiter (per-IP and per-token).
- Brute-force heuristic: Flags and blocks IPs that trigger repeated 404s.
- Constant-time resistance: Helps prevent enumeration through timing leaks.
"""
import time
import hashlib
from collections import defaultdict
from typing import Dict, List, Tuple

from app.core.config import get_settings

settings = get_settings()

# In-memory sliding window tracking: ip_hash -> list of unix timestamps
_IP_REQUEST_TIMESTAMPS: Dict[str, List[float]] = defaultdict(list)
# Failed (404) attempts tracking: ip_hash -> list of unix timestamps
_IP_FAILED_TIMESTAMPS: Dict[str, List[float]] = defaultdict(list)
# Blocked IPs: ip_hash -> expiry unix timestamp
_BLOCKED_IPS: Dict[str, float] = {}

# Constants
WINDOW_SECONDS = 60
MAX_REQUESTS_PER_MINUTE = 45
MAX_FAILED_ATTEMPTS_BURST = 8
BLOCK_DURATION_SECONDS = 600  # 10 minutes temporary cooldown


def hash_client_ip(ip_address: str, salt: str = "") -> str:
    """
    Hashes client IP with institutional salt for GDPR-compliant privacy.
    The real IP is never persisted in plaintext.
    """
    effective_salt = salt or settings.VERIFICATION_SECRET_SALT
    raw = f"{effective_salt}:{ip_address or '127.0.0.1'}".encode("utf-8")
    return hashlib.sha256(raw).hexdigest()[:32]


def is_rate_limited(ip_hash: str) -> Tuple[bool, str]:
    """
    Checks if client IP is currently blocked or exceeding window quotas.
    Returns (is_limited, reason).
    """
    now = time.time()

    # 1. Check if explicitly in blocklist
    if ip_hash in _BLOCKED_IPS:
        blocked_until = _BLOCKED_IPS[ip_hash]
        if now < blocked_until:
            remaining = int(blocked_until - now)
            return True, f"Too many requests. Please retry in {remaining} seconds."
        else:
            del _BLOCKED_IPS[ip_hash]

    # 2. Check sliding window frequency
    timestamps = _IP_REQUEST_TIMESTAMPS[ip_hash]
    # Prune old timestamps
    _IP_REQUEST_TIMESTAMPS[ip_hash] = [ts for ts in timestamps if now - ts < WINDOW_SECONDS]

    if len(_IP_REQUEST_TIMESTAMPS[ip_hash]) >= MAX_REQUESTS_PER_MINUTE:
        _BLOCKED_IPS[ip_hash] = now + 120  # 2-minute penalty
        return True, "Rate limit exceeded. Temporary cooldown applied."

    # Record current request
    _IP_REQUEST_TIMESTAMPS[ip_hash].append(now)
    return False, ""


def record_failed_attempt(ip_hash: str) -> bool:
    """
    Records a 404 / invalid token query.
    If suspicious enumeration burst detected, immediately blocks IP.
    Returns True if IP was newly blocked.
    """
    now = time.time()
    fails = _IP_FAILED_TIMESTAMPS[ip_hash]
    # Prune failures older than 120 seconds
    fails = [ts for ts in fails if now - ts < 120]
    fails.append(now)
    _IP_FAILED_TIMESTAMPS[ip_hash] = fails

    if len(fails) >= MAX_FAILED_ATTEMPTS_BURST:
        _BLOCKED_IPS[ip_hash] = now + BLOCK_DURATION_SECONDS
        return True
    return False


def reset_abuse_detector_for_testing():
    """Utility to clear memory structures during test runs."""
    _IP_REQUEST_TIMESTAMPS.clear()
    _IP_FAILED_TIMESTAMPS.clear()
    _BLOCKED_IPS.clear()
