"""
Regex Extractor Tests
"""

import pytest
from app.nlp.regex_extractors import regex_extractor


def test_extract_phones():
    """Test phone number extraction"""
    text = "Call me at +91-9876543210 or 9876543210"
    phones = regex_extractor.extract_phones(text)
    
    assert len(phones) > 0
    assert any('+91-9876543210' in p['value'] for p in phones)


def test_extract_emails():
    """Test email extraction"""
    text = "Contact us at test@example.com or support@company.org"
    emails = regex_extractor.extract_emails(text)
    
    assert len(emails) > 0
    assert any('test@example.com' in e['value'] for e in emails)


def test_extract_vehicles():
    """Test vehicle registration extraction"""
    text = "The vehicle MH-01-AB-1234 was seen near the location"
    vehicles = regex_extractor.extract_vehicles(text)
    
    assert len(vehicles) > 0
    assert any('MH-01-AB-1234' in v['value'] for v in vehicles)


def test_extract_urls():
    """Test URL extraction"""
    text = "Visit https://example.com for more information"
    urls = regex_extractor.extract_urls(text)
    
    assert len(urls) > 0
    assert any('https://example.com' in u['value'] for u in urls)


def test_extract_social_usernames():
    """Test social username extraction"""
    text = "Follow @username on Twitter or instagram.com/user"
    usernames = regex_extractor.extract_social_usernames(text)
    
    assert len(usernames) > 0


def test_extract_dates():
    """Test date extraction"""
    text = "The incident occurred on 2024-01-15 and was reported on 01/15/2024"
    dates = regex_extractor.extract_dates(text)
    
    assert len(dates) > 0


def test_extract_all():
    """Test extracting all entity types"""
    text = """
    Contact John at john@example.com or call +91-9876543210.
    His vehicle MH-01-AB-1234 was seen on 2024-01-15.
    Visit https://example.com for more info.
    """
    
    all_entities = regex_extractor.extract_all(text)
    
    assert len(all_entities) > 0
    
    # Check that we got different types
    entity_types = set(e.get('entity_type') for e in all_entities if e.get('entity_type'))
    assert len(entity_types) > 0
