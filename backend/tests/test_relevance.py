"""
Relevance Engine Tests
"""

import pytest
from app.services.relevance_engine import relevance_engine
from app.core.security import generate_entity_id, generate_case_id
from app.schemas.entities import EntityType


def test_calculate_relevance():
    """Test relevance calculation"""
    # Create test entity
    entity_id = generate_entity_id()
    case_id = generate_case_id()
    
    # We need to create an entity in the database first
    from app.database.postgres import db
    from datetime import datetime
    
    entity_data = {
        'entity_id': entity_id,
        'entity_type': EntityType.PERSON,
        'name': 'Test Person',
        'confidence': 0.9,
        'case_ids': [case_id],
        'created_at': datetime.now(),
        'updated_at': datetime.now()
    }
    
    db.create_entity(entity_data)
    
    # Calculate relevance
    result = relevance_engine.calculate_relevance(entity_id, case_id)
    
    assert 'entity_id' in result
    assert 'case_id' in result
    assert 'relevance_score' in result
    assert 'priority' in result
    assert 'reasons' in result
    assert 'score_breakdown' in result
    
    assert 0.0 <= result['relevance_score'] <= 1.0
    assert result['priority'] in ['HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL']


def test_priority_determination():
    """Test priority determination from scores"""
    # Test HIGH priority
    assert relevance_engine._determine_priority(0.9) == 'HIGH'
    assert relevance_engine._determine_priority(0.8) == 'HIGH'
    
    # Test MEDIUM priority
    assert relevance_engine._determine_priority(0.7) == 'MEDIUM'
    assert relevance_engine._determine_priority(0.6) == 'MEDIUM'
    
    # Test LOW priority
    assert relevance_engine._determine_priority(0.5) == 'LOW'
    assert relevance_engine._determine_priority(0.4) == 'LOW'
    
    # Test INFORMATIONAL priority
    assert relevance_engine._determine_priority(0.3) == 'INFORMATIONAL'
    assert relevance_engine._determine_priority(0.0) == 'INFORMATIONAL'


def test_score_breakdown():
    """Test that score breakdown contains all components"""
    entity_id = generate_entity_id()
    case_id = generate_case_id()
    
    result = relevance_engine.calculate_relevance(entity_id, case_id)
    
    breakdown = result['score_breakdown']
    
    # Check that all expected components are present
    expected_components = [
        'evidence_strength',
        'cross_case_link',
        'temporal_relevance',
        'entity_match_confidence',
        'source_quality',
        'network_importance',
        'corroboration'
    ]
    
    for component in expected_components:
        assert component in breakdown
        assert 0.0 <= breakdown[component] <= 1.0
