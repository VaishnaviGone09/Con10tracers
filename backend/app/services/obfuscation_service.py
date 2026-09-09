import base64
import binascii
import urllib.parse
import codecs
from dataclasses import dataclass
from typing import Optional


@dataclass
class ObfuscationResult:
    suspected_format: Optional[str]
    detection_confidence: float
    decoded_content: Optional[str]
    validation: str
    requires_review: bool


class ObfuscationService:
    """Service for detecting and decoding common obfuscation formats."""

    def analyze(self, content: str) -> ObfuscationResult:
        """Analyze content for common encoding/obfuscation techniques."""

        if not content:
            return ObfuscationResult(
                suspected_format=None,
                detection_confidence=0.0,
                decoded_content=None,
                validation="INVALID",
                requires_review=False,
            )

        methods = [
            ("BASE64", self._try_base64),
            ("HEX", self._try_hex),
            ("URL_ENCODED", self._try_url_decode),
            ("UNICODE_ESCAPE", self._try_unicode_escape),
            ("ROT13", self._try_rot13),
        ]

        best_result = None
        best_format = None

        for format_name, method in methods:
            result = method(content)

            if result["confidence"] > 0:
                if (
                    best_result is None
                    or result["confidence"]
                    > best_result["confidence"]
                ):
                    best_result = result
                    best_format = format_name

        if best_result is None or best_result["confidence"] < 0.5:
            return ObfuscationResult(
                suspected_format=None,
                detection_confidence=(
                    best_result["confidence"]
                    if best_result
                    else 0.0
                ),
                decoded_content=(
                    best_result["decoded"]
                    if best_result
                    else None
                ),
                validation=(
                    best_result["validation"]
                    if best_result
                    else "INVALID"
                ),
                requires_review=False,
            )

        return ObfuscationResult(
            suspected_format=best_format,
            detection_confidence=best_result["confidence"],
            decoded_content=best_result["decoded"],
            validation=best_result["validation"],
            requires_review=best_result["confidence"] < 0.8,
        )

    def _try_base64(self, content: str) -> dict:
        """Try to decode Base64."""

        try:
            cleaned = content.strip()

            if len(cleaned) < 4:
                return {
                    "confidence": 0.0,
                    "decoded": None,
                    "validation": "INVALID",
                }

            decoded_bytes = base64.b64decode(
                cleaned,
                validate=True,
            )

            decoded = decoded_bytes.decode(
                "utf-8",
                errors="ignore",
            )

            if decoded and self._is_valid_text(decoded):
                return {
                    "confidence": 0.9,
                    "decoded": decoded,
                    "validation": "VALID",
                }

            return {
                "confidence": 0.5,
                "decoded": decoded,
                "validation": "PARTIAL",
            }

        except Exception:
            return {
                "confidence": 0.0,
                "decoded": None,
                "validation": "INVALID",
            }

    def _try_hex(self, content: str) -> dict:
        """Try to decode hexadecimal text."""

        try:
            cleaned = content.strip()

            if len(cleaned) < 2 or len(cleaned) % 2 != 0:
                return {
                    "confidence": 0.0,
                    "decoded": None,
                    "validation": "INVALID",
                }

            decoded_bytes = bytes.fromhex(cleaned)

            decoded = decoded_bytes.decode(
                "utf-8",
                errors="ignore",
            )

            if decoded and decoded.isprintable():
                return {
                    "confidence": 0.85,
                    "decoded": decoded,
                    "validation": "VALID",
                }

            return {
                "confidence": 0.4,
                "decoded": decoded,
                "validation": "PARTIAL",
            }

        except (ValueError, UnicodeDecodeError, binascii.Error):
            return {
                "confidence": 0.0,
                "decoded": None,
                "validation": "INVALID",
            }

    def _try_url_decode(self, content: str) -> dict:
        """Try URL decoding."""

        try:
            decoded = urllib.parse.unquote(content)

            if decoded != content:
                if self._is_valid_text(decoded):
                    return {
                        "confidence": 0.8,
                        "decoded": decoded,
                        "validation": "VALID",
                    }

                return {
                    "confidence": 0.3,
                    "decoded": decoded,
                    "validation": "PARTIAL",
                }

            return {
                "confidence": 0.0,
                "decoded": decoded,
                "validation": "INVALID",
            }

        except Exception:
            return {
                "confidence": 0.0,
                "decoded": None,
                "validation": "INVALID",
            }

    def _try_unicode_escape(self, content: str) -> dict:
        """Try Unicode escape decoding."""

        try:
            if "\\u" not in content and "\\x" not in content:
                return {
                    "confidence": 0.0,
                    "decoded": None,
                    "validation": "INVALID",
                }

            decoded = codecs.decode(
                content,
                "unicode_escape",
            )

            if decoded != content and self._is_valid_text(decoded):
                return {
                    "confidence": 0.85,
                    "decoded": decoded,
                    "validation": "VALID",
                }

            return {
                "confidence": 0.4,
                "decoded": decoded,
                "validation": "PARTIAL",
            }

        except Exception:
            return {
                "confidence": 0.0,
                "decoded": None,
                "validation": "INVALID",
            }

    def _try_rot13(self, content: str) -> dict:
        """Try to decode ROT13."""

        try:
            decoded = ""

            for char in content:
                if "a" <= char <= "z":
                    decoded += chr(
                        (ord(char) - ord("a") + 13) % 26
                        + ord("a")
                    )
                elif "A" <= char <= "Z":
                    decoded += chr(
                        (ord(char) - ord("A") + 13) % 26
                        + ord("A")
                    )
                else:
                    decoded += char

            if (
                decoded != content
                and self._is_valid_text(decoded)
                and not self._is_valid_text(content)
            ):
                return {
                    "confidence": 0.6,
                    "decoded": decoded,
                    "validation": "VALID",
                }

            return {
                "confidence": 0.2,
                "decoded": decoded,
                "validation": "PARTIAL",
            }

        except Exception:
            return {
                "confidence": 0.0,
                "decoded": None,
                "validation": "INVALID",
            }

    def _is_valid_text(self, text: str) -> bool:
        """Check if text looks like readable text."""

        if not text:
            return False

        printable_ratio = sum(
            1 for char in text if char.isprintable()
        ) / len(text)

        if printable_ratio < 0.7:
            return False

        text_lower = text.lower()

        common_patterns = [
            "the",
            "and",
            "is",
            "in",
            "to",
            "of",
            "a",
            "for",
        ]

        pattern_count = sum(
            1
            for pattern in common_patterns
            if pattern in text_lower
        )

        return pattern_count >= 1 or len(text) >= 5


obfuscation_service = ObfuscationService()