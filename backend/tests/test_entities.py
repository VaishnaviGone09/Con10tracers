"""
Entity Service Tests
"""

import pytest
from app.services.entity_service import entity_service
from app.core.security import generate_entity_id
from app.schemas.entities import EntityType


def test_create_entity():
    """Test creating an entity"""
    entity_data = {
        'entity_id': generate_entity_id(),
        'entity_type': EntityType.PERSON,
        'name': 'Test Person',
        'confidence': 0.9
    }
    
    entity_id = entity_service.create_entity(entity_data)
    assert entity_id is not None
    
    retrieved_entity = entity_service.get_entity(entity_id)
    assert retrieved_entity is not None
    assert retrieved_entity['name'] == 'Test Person'


def test_entity_resolution():
    """Test entity resolution"""
    # Create two similar entities
    entity_a_id = generate_entity_id()
    entity_b_id = generate_entity_id()
    
    entity_a = {
        'entity_id': entity_a_id,
        'entity_type': EntityType.PERSON,
        'name': 'Rahul Kumar',
        'metadata': {'location': 'Mumbai', 'institution': 'IIT Bombay'},
        'confidence': 0.9
    }
    
    entity_b = {
        'entity_id': entity_b_id,
        'entity_type': EntityType.PERSON,
        'name': 'R. Kumar',
        'metadata': {'location': 'Mumbai', 'institution': 'IIT Bombay'},
        'confidence': 0.85
    }
    
    entity_service.create_entity(entity_a)
    entity_service.create_entity(entity_b)
    
    # Resolve entities
    result = entity_service.resolve_entities(entity_a_id, entity_b_id)
    
    assert result['entity_a_id'] == entity_a_id
    assert result['entity_b_id'] == entity_b_id
    assert 'confidence_score' in result
    assert 'status' in result
    assert 'supporting_signals' in result
    assert 'contradicting_signals' in result


def test_search_entities():
    """Test searching entities"""
    # Create test entities
    entity_data = {
        'entity_id': generate_entity_id(),
        'entity_type': EntityType.PERSON,
        'name': 'Search Test Person',
        'confidence': 0.8
    }
    
    entity_service.create_entity(entity_data)
    
    # Search for entities
    results = entity_service.search_entities({'entity_type': EntityType.PERSON})
    assert len(results) > 0
    
    # Search with name filter
    results = entity_service.search_entities({'name': 'Search Test Person'})
    assert len(results) > 0
    assert results[0]['name'] == 'Search Test Person'
