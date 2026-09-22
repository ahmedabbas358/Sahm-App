"""
Sahm Backend — Direct Device-to-Device Transfer Provider (Prompt 22)
Manages local Wi-Fi / Direct LAN pairing, mutual confirmation phrases (e.g. BLUE-ORBIT-27),
and authenticated QR handshakes.
"""
import secrets
import hmac


class DirectTransferProvider:
    """Handles local peer discovery, mutual pairing codes, and visual confirmation phrases."""

    ADJECTIVES = [
        "BLUE", "SWIFT", "GOLDEN", "SILVER", "ROYAL", "EMERALD", "BRAVE",
        "BRIGHT", "CLEVER", "RAPID", "SHINING", "VIBRANT", "QUIET", "STEADY"
    ]

    NOUNS = [
        "ORBIT", "FALCON", "SHADOW", "CEDAR", "SUMMIT", "BEACON", "HORIZON",
        "HARBOR", "CANYON", "OASIS", "SHIELD", "CASTLE", "VOYAGE", "AURORA"
    ]

    @classmethod
    def generate_pairing_code(cls) -> str:
        """Generate a 6-digit high-entropy numeric pairing code (e.g. '849201')."""
        return f"{secrets.randbelow(900000) + 100000}"

    @classmethod
    def generate_verification_phrase(cls) -> str:
        """
        Generate a memorable 3-token human-verifiable phrase for mutual confirmation.
        Example: 'BLUE-ORBIT-27'
        """
        adj = secrets.choice(cls.ADJECTIVES)
        noun = secrets.choice(cls.NOUNS)
        num = secrets.randbelow(90) + 10
        return f"{adj}-{noun}-{num}"

    @classmethod
    def verify_phrase(cls, phrase_a: str, phrase_b: str) -> bool:
        """Constant-time comparison of visual verification phrases."""
        clean_a = phrase_a.strip().upper()
        clean_b = phrase_b.strip().upper()
        return hmac.compare_digest(clean_a, clean_b)

    @classmethod
    def generate_qr_handshake_payload(
        cls,
        session_id: str,
        pairing_code: str,
        phrase: str,
        sender_device: str,
    ) -> dict:
        """
        Generate compact JSON structure to encode in device-to-device pairing QR.
        """
        return {
            "type": "sahm_direct_handshake",
            "v": 1,
            "session_id": session_id,
            "code": pairing_code,
            "phrase": phrase,
            "sender": sender_device,
        }
