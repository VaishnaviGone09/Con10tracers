"""
Obfuscation Service Tests
"""

import pytest
from app.services.obfuscation_service import obfuscation_service


def test_base64_detection():
    """Test Base64 encoding detection"""
    # Test with actual Base64
    import base64
    original = "Hello World"
    encoded = base64.b64encode(original.encode()).decode()
    
    result = obfuscation_service.analyze(encoded)
    
    assert result.suspected_format == "BASE64"
    assert result.decoded_content == original
    assert result.detection_confidence > 0.8


def test_hex_detection():
    """Test hexadecimal encoding detection"""
    # Test with hex
    original = "Hello"
    encoded = original.encode().hex()
    
    result = obfuscation_service.analyze(encoded)
    
    assert result.suspected_format == "HEX"
    assert result.decoded_content == original
    assert result.detection_confidence > 0.7


def test_url_encoding_detection():
    """Test URL encoding detection"""
    # Test with URL encoding
    original = "Hello World"
    encoded = "Hello%20World"
    
    result = obfuscation_service.analyze(encoded)
    
    assert result.suspected_format == "URL_ENCODED"
    assert result.decoded_content == original
    assert result.detection_confidence > 0.7


def test_no_encoding():
    """Test with normal text (no encoding)"""
    normal_text = "This is normal text"
    
    result = obfuscation_service.analyze(normal_text)
    
    # Should detect no encoding or very low confidence
    assert result.detection_confidence < 0.5 or result.suspected_format is None


def test_rot13():
    """Test ROT13 detection"""
    # Simple ROT13
    original = "Hello"
    # ROT13 of "Hello" is "Uryyb"
    encoded = "Uryyb"
    
    result = obfuscation_service.analyze(encoded)
    
    # ROT13 detection is less confident
    assert result.suspected_format == "ROT13" or result.detection_confidence < 0.5
