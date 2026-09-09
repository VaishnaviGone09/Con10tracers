"""
Security Module
Handles security-related utilities
"""

import hashlib
import secrets
from typing import Optional


def generate_evidence_id() -> str:
    """Generate a unique evidence ID"""
    return f"evi_{secrets.token_hex(16)}"


def generate_entity_id() -> str:
    """Generate a unique entity ID"""
    return f"ent_{secrets.token_hex(16)}"


def generate_case_id() -> str:
    """Generate a unique case ID"""
    return f"case_{secrets.token_hex(16)}"


def generate_document_id() -> str:
    """Generate a unique document ID"""
    return f"doc_{secrets.token_hex(16)}"


def generate_alert_id() -> str:
    """Generate a unique alert ID"""
    return f"alt_{secrets.token_hex(16)}"


def hash_content(content: str) -> str:
    """Hash content for integrity checking"""
    return hashlib.sha256(content.encode()).hexdigest()


def sanitize_input(text: str) -> str:
    """Basic input sanitization"""
    if not text:
        return ""
    # Remove null bytes and control characters
    return "".join(char for char in text if ord(char) >= 32 or char in "\n\r\t")


def is_safe_filename(filename: str) -> bool:
    """Check if filename is safe"""
    if not filename:
        return False
    # Basic safety check
    dangerous_chars = ["..", "/", "\\", "\x00"]
    return not any(char in filename for char in dangerous_chars)
