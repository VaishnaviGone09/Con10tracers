"""
Evidence Service
Manages evidence creation, storage, and provenance tracking
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from app.database.postgres import db
from app.core.security import generate_evidence_id, hash_content
from app.core.config import is_demo_mode

logger = logging.getLogger(__name__)


class EvidenceService:
    """Service for evidence management and provenance"""
    
    def create_evidence(self, evidence_data: Dict[str, Any]) -> str:
        """Create new evidence with provenance tracking"""
        evidence_id = evidence_data.get('evidence_id') or generate_evidence_id()
        evidence_data['evidence_id'] = evidence_id
        evidence_data['timestamp'] = datetime.now()
        
        # Calculate integrity hash
        original_content = evidence_data.get('original_content', '')
        if original_content:
            evidence_data['integrity_hash'] = hash_content(original_content)
        
        # Initialize provenance
        if 'provenance' not in evidence_data:
            evidence_data['provenance'] = {
                'created_at': datetime.now().isoformat(),
                'chain_of_custody': []
            }
        
        db.create_evidence(evidence_data)
        logger.info(f"Created evidence: {evidence_id}")
        return evidence_id
    
    def get_evidence(self, evidence_id: str) -> Optional[Dict[str, Any]]:
        """Get evidence by ID"""
        return db.get_evidence(evidence_id)
    
    def get_evidence_by_case(self, case_id: str) -> List[Dict[str, Any]]:
        """Get all evidence for a case"""
        return db.get_evidence_by_case(case_id)
    
    def create_document_evidence(self, document_id: str, extracted_entities: List[Dict[str, Any]],
                                extracted_relationships: List[Dict[str, Any]], 
                                original_content: str) -> str:
        """Create evidence from document analysis"""
        evidence_data = {
            'source_id': document_id,
            'source_type': 'DOCUMENT',
            'original_content': original_content,
            'extracted_claim': f"Extracted {len(extracted_entities)} entities and {len(extracted_relationships)} relationships from document",
            'entity_ids': [e.get('entity_id') for e in extracted_entities if e.get('entity_id')],
            'relationship_ids': [r.get('relationship_id') for r in extracted_relationships if r.get('relationship_id')],
            'extraction_method': 'document_analysis_pipeline',
            'confidence': 0.8,
            'provenance': {
                'source_type': 'DOCUMENT',
                'source_reference': document_id,
                'extraction_timestamp': datetime.now().isoformat(),
                'extraction_method': 'document_analysis_pipeline',
                'entity_count': len(extracted_entities),
                'relationship_count': len(extracted_relationships)
            }
        }
        
        return self.create_evidence(evidence_data)
    
    def create_social_evidence(self, profile_id: str, platform: str, content: str,
                               entity_ids: List[str]) -> str:
        """Create evidence from social intelligence"""
        evidence_data = {
            'source_id': profile_id,
            'source_type': 'SOCIAL',
            'original_content': content,
            'extracted_claim': f"Social profile information from {platform}",
            'entity_ids': entity_ids,
            'extraction_method': 'social_intelligence',
            'confidence': 0.7,
            'provenance': {
                'source_type': 'SOCIAL',
                'source_reference': profile_id,
                'platform': platform,
                'extraction_timestamp': datetime.now().isoformat(),
                'extraction_method': 'social_intelligence'
            }
        }
        
        return self.create_evidence(evidence_data)
    
    def create_manual_evidence(self, investigator_id: str, content: str, 
                              entity_ids: List[str], notes: Optional[str] = None) -> str:
        """Create manually entered evidence"""
        evidence_data = {
            'source_id': investigator_id,
            'source_type': 'MANUAL',
            'original_content': content,
            'extracted_claim': notes or "Manually entered evidence",
            'entity_ids': entity_ids,
            'extraction_method': 'manual_entry',
            'confidence': 1.0,  # Manual entries have full confidence
            'provenance': {
                'source_type': 'MANUAL',
                'source_reference': investigator_id,
                'extraction_timestamp': datetime.now().isoformat(),
                'extraction_method': 'manual_entry',
                'investigator_id': investigator_id
            }
        }
        
        return self.create_evidence(evidence_data)
    
    def update_evidence_provenance(self, evidence_id: str, update_info: Dict[str, Any]) -> bool:
        """Update provenance chain for evidence"""
        evidence = db.get_evidence(evidence_id)
        if not evidence:
            return False
        
        provenance = evidence.get('provenance', {})
        chain_of_custody = provenance.get('chain_of_custody', [])
        
        # Add new entry to chain of custody
        chain_entry = {
            'timestamp': datetime.now().isoformat(),
            'action': update_info.get('action', 'updated'),
            'performed_by': update_info.get('performed_by', 'system'),
            'notes': update_info.get('notes', '')
        }
        
        chain_of_custody.append(chain_entry)
        provenance['chain_of_custody'] = chain_of_custody
        provenance['last_updated'] = datetime.now().isoformat()
        
        # Update evidence
        evidence['provenance'] = provenance
        return db.update_evidence(evidence_id, evidence)
    
    def verify_evidence_integrity(self, evidence_id: str) -> Dict[str, Any]:
        """Verify evidence integrity using hash"""
        evidence = db.get_evidence(evidence_id)
        if not evidence:
            return {'valid': False, 'error': 'Evidence not found'}
        
        stored_hash = evidence.get('integrity_hash')
        original_content = evidence.get('original_content', '')
        
        if not stored_hash:
            return {'valid': True, 'warning': 'No hash stored for verification'}
        
        current_hash = hash_content(original_content)
        
        is_valid = stored_hash == current_hash
        
        return {
            'valid': is_valid,
            'stored_hash': stored_hash,
            'current_hash': current_hash,
            'evidence_id': evidence_id
        }
    
    def get_evidence_by_entity(self, entity_id: str) -> List[Dict[str, Any]]:
        """Get all evidence related to a specific entity"""
        all_evidence = db.get_all_evidence() if hasattr(db, 'get_all_evidence') else []
        
        related_evidence = []
        for evidence in all_evidence:
            entity_ids = evidence.get('entity_ids', [])
            if entity_id in entity_ids:
                related_evidence.append(evidence)
        
        return related_evidence


# Global evidence service instance
evidence_service = EvidenceService()
