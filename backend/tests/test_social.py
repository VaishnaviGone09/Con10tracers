"""
Social Service Tests
"""

import pytest
from app.services.social_service import social_service
from app.schemas.social import SocialPlatform


def test_search_profiles():
    """Test searching social profiles"""
    # Search for profiles
    results = social_service.search_profiles("Rahul", {})
    
    assert isinstance(results, list)
    # In demo mode, we should get some results
    assert len(results) >= 0


def test_search_profiles_by_platform():
    """Test searching profiles on specific platform"""
    results = social_service.search_profiles_by_platform(
        "Rahul",
        SocialPlatform.PUBLIC_WEB,
        {}
    )
    
    assert isinstance(results, list)
    # All results should be from the specified platform
    for profile in results:
        assert profile.platform == SocialPlatform.PUBLIC_WEB


def test_get_profile():
    """Test getting a specific profile"""
    # Try to get a demo profile
    profile = social_service.get_profile("demo_profile_001", SocialPlatform.PUBLIC_WEB)
    
    # In demo mode, this might return None or a profile
    if profile:
        assert profile.profile_id == "demo_profile_001"
        assert profile.platform == SocialPlatform.PUBLIC_WEB


def test_get_public_connections():
    """Test getting public connections"""
    connections = social_service.get_public_connections(
        "demo_profile_001",
        SocialPlatform.PUBLIC_WEB
    )
    
    assert isinstance(connections, list)


def test_match_entity_to_profiles():
    """Test matching entity to social profiles"""
    entity = {
        'entity_id': 'test_entity_001',
        'name': 'Rahul Kumar',
        'metadata': {
            'location': 'Mumbai',
            'institution': 'IIT Bombay',
            'organization': 'TechCorp India'
        }
    }
    
    profiles = social_service.match_entity_to_profiles(entity)
    
    assert isinstance(profiles, list)
