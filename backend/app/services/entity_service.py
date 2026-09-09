"""
Entity Service
Business logic for entity operations including resolution
"""

from typing import List, Dict, Any, Optional
import logging
from difflib import SequenceMatcher

from app.database.postgres import db
from app.core.security import generate_entity_id

logger = logging.getLogger(__name__)


class EntityService:
    """Service for entity management and resolution"""
    
    def create_entity(self, entity_data: Dict[str, Any]) -> str:
        """Create a new entity"""
        entity_id = entity_data.get('entity_id') or generate_entity_id()
        entity_data['entity_id'] = entity_id
        
        db.create_entity(entity_data)
        logger.info(f"Created entity: {entity_id}")
        return entity_id
    
    def get_entity(self, entity_id: str) -> Optional[Dict[str, Any]]:
        """Get an entity by ID"""
        return db.get_entity(entity_id)
    
    def search_entities(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Search entities with filters"""
        return db.search_entities(filters)
    
    def resolve_entities(self, entity_a_id: str, entity_b_id: str) -> Dict[str, Any]:
        """
        Resolve whether two entities might be the same
        Returns explainable analysis with confidence score
        """
        entity_a = db.get_entity(entity_a_id)
        entity_b = db.get_entity(entity_b_id)
        
        if not entity_a or not entity_b:
            return {
                'error': 'One or both entities not found',
                'entity_a_id': entity_a_id,
                'entity_b_id': entity_b_id
            }
        
        # Calculate similarity signals
        signals = self._calculate_similarity_signals(entity_a, entity_b)
        
        # Determine overall confidence
        confidence = self._calculate_confidence(signals)
        
        # Determine status
        status = self._determine_status(confidence, signals)
        
        # Generate explanation
        explanation = self._generate_explanation(signals, status)
        
        return {
            'entity_a_id': entity_a_id,
            'entity_b_id': entity_b_id,
            'entity_a': entity_a,
            'entity_b': entity_b,
            'confidence_score': confidence,
            'supporting_signals': signals['supporting'],
            'contradicting_signals': signals['contradicting'],
            'status': status,
            'explanation': explanation
        }
    
    def _calculate_similarity_signals(self, entity_a: Dict, entity_b: Dict) -> Dict[str, Any]:
        """Calculate various similarity signals between entities"""
        supporting = []
        contradicting = []
        
        # Name similarity
        name_a = entity_a.get('name', '').lower().strip()
        name_b = entity_b.get('name', '').lower().strip()
        
        if name_a and name_b:
            similarity = SequenceMatcher(None, name_a, name_b).ratio()
            if similarity > 0.8:
                supporting.append(f"High name similarity ({similarity:.2f}): '{name_a}' vs '{name_b}'")
            elif similarity > 0.5:
                supporting.append(f"Moderate name similarity ({similarity:.2f}): '{name_a}' vs '{name_b}'")
            elif similarity < 0.3:
                contradicting.append(f"Low name similarity ({similarity:.2f}): '{name_a}' vs '{name_b}'")
        
        # Value similarity (for structured entities like phone, email)
        value_a = entity_a.get('value', '').lower().strip()
        value_b = entity_b.get('value', '').lower().strip()
        
        if value_a and value_b:
            if value_a == value_b:
                supporting.append(f"Identical values: '{value_a}'")
            elif value_a in value_b or value_b in value_a:
                supporting.append(f"Similar values: '{value_a}' vs '{value_b}'")
            else:
                contradicting.append(f"Different values: '{value_a}' vs '{value_b}'")
        
        # Location match
        location_a = entity_a.get('metadata', {}).get('location', '').lower()
        location_b = entity_b.get('metadata', {}).get('location', '').lower()
        
        if location_a and location_b:
            if location_a == location_b:
                supporting.append(f"Same location: '{location_a}'")
            elif location_a in location_b or location_b in location_a:
                supporting.append(f"Similar locations: '{location_a}' vs '{location_b}'")
        
        # Institution match
        institution_a = entity_a.get('metadata', {}).get('institution', '').lower()
        institution_b = entity_b.get('metadata', {}).get('institution', '').lower()
        
        if institution_a and institution_b:
            if institution_a == institution_b:
                supporting.append(f"Same institution: '{institution_a}'")
        
        # Organization match
        org_a = entity_a.get('metadata', {}).get('organization', '').lower()
        org_b = entity_b.get('metadata', {}).get('organization', '').lower()
        
        if org_a and org_b:
            if org_a == org_b:
                supporting.append(f"Same organization: '{org_a}'")
        
        # Entity type match
        type_a = entity_a.get('entity_type')
        type_b = entity_b.get('entity_type')
        
        if type_a != type_b:
            contradicting.append(f"Different entity types: {type_a} vs {type_b}")
        
        return {
            'supporting': supporting,
            'contradicting': contradicting
        }
    
    def _calculate_confidence(self, signals: Dict[str, Any]) -> float:
        """Calculate overall confidence score from signals"""
        supporting_count = len(signals['supporting'])
        contradicting_count = len(signals['contradicting'])
        
        # Base confidence
        confidence = 0.0
        
        # Add points for supporting signals
        confidence += supporting_count * 0.15
        
        # Subtract points for contradicting signals
        confidence -= contradicting_count * 0.2
        
        # Ensure within bounds
        confidence = max(0.0, min(1.0, confidence))
        
        return confidence
    
    def _determine_status(self, confidence: float, signals: Dict[str, Any]) -> str:
        """Determine resolution status based on confidence and signals"""
        if confidence >= 0.8:
            return 'LIKELY_MATCH'
        elif confidence >= 0.5:
            return 'POSSIBLE_MATCH'
        elif confidence >= 0.3:
            return 'REQUIRES_REVIEW'
        else:
            return 'NOT_MATCH'
    
    def _generate_explanation(self, signals: Dict[str, Any], status: str) -> str:
        """Generate human-readable explanation"""
        explanation_parts = []
        
        if signals['supporting']:
            explanation_parts.append("Supporting evidence: " + "; ".join(signals['supporting']))
        
        if signals['contradicting']:
            explanation_parts.append("Contradicting evidence: " + "; ".join(signals['contradicting']))
        
        status_explanations = {
            'LIKELY_MATCH': 'Entities are likely the same based on strong matching signals.',
            'POSSIBLE_MATCH': 'Entities may be the same but require additional verification.',
            'REQUIRES_REVIEW': 'Entities show some similarities but have significant differences requiring manual review.',
            'NOT_MATCH': 'Entities are unlikely to be the same based on available information.'
        }
        
        explanation_parts.append(status_explanations.get(status, 'Unable to determine match status.'))
        
        return " ".join(explanation_parts)
    
    def find_potential_matches(self, entity_id: str, threshold: float = 0.5) -> List[Dict[str, Any]]:
        """Find potential matches for an entity"""
        entity = db.get_entity(entity_id)
        if not entity:
            return []
        
        # Get all entities of the same type
        filters = {'entity_type': entity.get('entity_type')}
        all_entities = db.search_entities(filters)
        
        potential_matches = []
        
        for other_entity in all_entities:
            if other_entity.get('entity_id') == entity_id:
                continue
            
            # Resolve against this entity
            resolution = self.resolve_entities(entity_id, other_entity.get('entity_id'))
            
            if resolution.get('confidence_score', 0) >= threshold:
                potential_matches.append(resolution)
        
        # Sort by confidence
        potential_matches.sort(key=lambda x: x.get('confidence_score', 0), reverse=True)
        
        return potential_matches


# Global entity service instance
entity_service = EntityService()
