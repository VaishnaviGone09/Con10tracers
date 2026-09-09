"""
End-to-End Integration Test
Tests the complete investigation workflow
"""

import pytest
from app.database.postgres import db
from app.services.entity_service import entity_service
from app.services.social_service import social_service
from app.services.evidence_service import evidence_service
from app.services.relevance_engine import relevance_engine
from app.agents.supervisor_agent import supervisor_agent
from app.core.security import generate_case_id, generate_entity_id, generate_evidence_id
from app.schemas.entities import EntityType
from datetime import datetime


def test_complete_investigation_workflow():
    """Test complete investigation workflow from case to final answer"""
    
    # 1. Create a case
    case_id = generate_case_id()
    case_data = {
        'case_id': case_id,
        'title': 'Test Investigation Case',
        'description': 'End-to-end test case',
        'status': 'OPEN',
        'priority': 'MEDIUM',
        'investigators': ['Test Agent'],
        'created_at': datetime.now(),
        'updated_at': datetime.now(),
        'entity_count': 0,
        'evidence_count': 0,
        'document_count': 0
    }
    db.create_case(case_data)
    
    # 2. Create entities
    entity_id = generate_entity_id()
    entity_data = {
        'entity_id': entity_id,
        'entity_type': EntityType.PERSON,
        'name': 'Test Subject',
        'metadata': {'location': 'Test Location'},
        'confidence': 0.9,
        'case_ids': [case_id],
        'created_at': datetime.now(),
        'updated_at': datetime.now()
    }
    entity_service.create_entity(entity_data)
    
    # 3. Create evidence
    evidence_id = generate_evidence_id()
    evidence_data = {
        'evidence_id': evidence_id,
        'source_id': 'test_source',
        'original_content': 'Test evidence content',
        'extracted_claim': 'Test claim',
        'entity_ids': [entity_id],
        'relationship_ids': [],
        'extraction_method': 'manual',
        'confidence': 0.8,
        'case_id': case_id,
        'timestamp': datetime.now(),
        'provenance': {
            'source_type': 'MANUAL',
            'extraction_timestamp': datetime.now().isoformat()
        }
    }
    evidence_service.create_evidence(evidence_data)
    
    # 4. Search social profiles
    social_results = social_service.search_profiles("Test Subject", {})
    
    # 5. Calculate relevance
    relevance_result = relevance_engine.calculate_relevance(entity_id, case_id)
    
    # 6. Run agent investigation
    investigation_result = supervisor_agent.run_investigation(
        query="Test Subject investigation",
        case_id=case_id
    )
    
    # Verify results
    assert investigation_result['investigation_id'] == case_id
    assert 'final_answer' in investigation_result
    assert 'entities' in investigation_result
    assert 'social_results' in investigation_result
    assert 'evidence' in investigation_result
    assert 'confidence' in investigation_result
    
    # Verify relevance calculation
    assert relevance_result['entity_id'] == entity_id
    assert relevance_result['case_id'] == case_id
    assert 0.0 <= relevance_result['relevance_score'] <= 1.0
    
    print("End-to-end test completed successfully!")
    print(f"Investigation ID: {case_id}")
    print(f"Entities found: {len(investigation_result['entities'])}")
    print(f"Social profiles: {len(social_results)}")
    print(f"Relevance score: {relevance_result['relevance_score']:.3f}")


def test_entity_resolution_workflow():
    """Test entity resolution within workflow"""
    
    # Create two similar entities
    entity_a_id = generate_entity_id()
    entity_b_id = generate_entity_id()
    
    entity_a = {
        'entity_id': entity_a_id,
        'entity_type': EntityType.PERSON,
        'name': 'John Smith',
        'metadata': {'location': 'New York', 'organization': 'Tech Corp'},
        'confidence': 0.9,
        'case_ids': [],
        'created_at': datetime.now(),
        'updated_at': datetime.now()
    }
    
    entity_b = {
        'entity_id': entity_b_id,
        'entity_type': EntityType.PERSON,
        'name': 'J. Smith',
        'metadata': {'location': 'New York', 'organization': 'Tech Corp'},
        'confidence': 0.85,
        'case_ids': [],
        'created_at': datetime.now(),
        'updated_at': datetime.now()
    }
    
    entity_service.create_entity(entity_a)
    entity_service.create_entity(entity_b)
    
    # Resolve entities
    resolution = entity_service.resolve_entities(entity_a_id, entity_b_id)
    
    assert resolution['entity_a_id'] == entity_a_id
    assert resolution['entity_b_id'] == entity_b_id
    assert 'confidence_score' in resolution
    assert 'status' in resolution
    assert resolution['status'] in ['POSSIBLE_MATCH', 'LIKELY_MATCH', 'REQUIRES_REVIEW', 'NOT_MATCH']
    
    print(f"Entity resolution completed with status: {resolution['status']}")
    print(f"Confidence score: {resolution['confidence_score']:.3f}")


if __name__ == "__main__":
    # Run the end-to-end test
    test_complete_investigation_workflow()
    test_entity_resolution_workflow()
    print("\nAll end-to-end tests passed!")
