"""
Relationship Extractor
Extracts relationships between entities from text
"""

from typing import List, Dict, Any, Optional
import logging
import re

from app.schemas.entities import EntityType

logger = logging.getLogger(__name__)


class RelationshipExtractor:
    """Extracts relationships between entities"""
    
    # Relationship patterns (simplified)
    RELATIONSHIP_PATTERNS = {
        'PERSON_PHONE': [
            r'(?:called|phoned|contacted|dialed)\s+([a-zA-Z\s]+?)\s+(?:at|on)\s+(\+?\d[\d\s\-\(\)]+)',
            r'([a-zA-Z\s]+?)\s+(?:called|phoned)\s+(\+?\d[\d\s\-\(\)]+)',
        ],
        'PERSON_EMAIL': [
            r'(?:emailed|mailed|sent\s+(?:an\s+)?email\s+to)\s+([a-zA-Z\s]+?)\s+(?:at\s+)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',
        ],
        'PERSON_LOCATION': [
            r'([a-zA-Z\s]+?)\s+(?:lives?\s+(?:in|at)|located\s+(?:in|at)|was\s+(?:seen|found)\s+(?:in|at))\s+([a-zA-Z\s]+?)(?:,|\.|$)',
        ],
        'PERSON_ORGANIZATION': [
            r'([a-zA-Z\s]+?)\s+(?:works?\s+(?:for|at)|is\s+(?:a\s+)?(?:employee|member)\s+(?:of|at))\s+([a-zA-Z\s]+?)(?:,|\.|$)',
        ],
        'PERSON_VEHICLE': [
            r'([a-zA-Z\s]+?)\s+(?:drove|owns?|drives?)\s+(?:a\s+)?([A-Z0-9\-]+?)(?:,|\.|$)',
        ],
    }
    
    def extract_relationships(self, text: str, entities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract relationships from text given extracted entities"""
        relationships = []
        
        # Group entities by type
        entities_by_type = {}
        for entity in entities:
            entity_type = entity.get('entity_type')
            if entity_type:
                if entity_type not in entities_by_type:
                    entities_by_type[entity_type] = []
                entities_by_type[entity_type].append(entity)
        
        # Extract relationships based on patterns
        for rel_type, patterns in self.RELATIONSHIP_PATTERNS.items():
            for pattern in patterns:
                matches = re.finditer(pattern, text, re.IGNORECASE)
                for match in matches:
                    relationship = self._parse_relationship_match(rel_type, match, entities_by_type)
                    if relationship:
                        relationships.append(relationship)
        
        # Extract co-occurrence relationships (entities mentioned together)
        relationships.extend(self._extract_co_occurrences(text, entities))
        
        return relationships
    
    def _parse_relationship_match(self, rel_type: str, match, entities_by_type: Dict) -> Optional[Dict[str, Any]]:
        """Parse a regex match into a relationship"""
        try:
            if rel_type == 'PERSON_PHONE':
                person_name = match.group(1).strip()
                phone = match.group(2).strip()
                
                # Find matching entities
                person_entity = self._find_entity_by_name(person_name, entities_by_type.get(EntityType.PERSON, []))
                phone_entity = self._find_entity_by_value(phone, entities_by_type.get(EntityType.PHONE, []))
                
                if person_entity and phone_entity:
                    return {
                        'source_entity_id': person_entity.get('entity_id'),
                        'target_entity_id': phone_entity.get('entity_id'),
                        'relationship_type': 'HAS_PHONE',
                        'confidence': 0.8,
                        'extraction_method': 'regex_relationship'
                    }
            
            elif rel_type == 'PERSON_EMAIL':
                person_name = match.group(1).strip()
                email = match.group(2).strip().lower()
                
                person_entity = self._find_entity_by_name(person_name, entities_by_type.get(EntityType.PERSON, []))
                email_entity = self._find_entity_by_value(email, entities_by_type.get(EntityType.EMAIL, []))
                
                if person_entity and email_entity:
                    return {
                        'source_entity_id': person_entity.get('entity_id'),
                        'target_entity_id': email_entity.get('entity_id'),
                        'relationship_type': 'HAS_EMAIL',
                        'confidence': 0.85,
                        'extraction_method': 'regex_relationship'
                    }
            
            # Add more relationship types as needed
            
        except Exception as e:
            logger.error(f"Error parsing relationship match: {e}")
        
        return None
    
    def _find_entity_by_name(self, name: str, entities: List[Dict]) -> Optional[Dict]:
        """Find an entity by name (fuzzy match)"""
        name_lower = name.lower()
        for entity in entities:
            entity_name = entity.get('name', '').lower()
            if entity_name and (name_lower in entity_name or entity_name in name_lower):
                return entity
        return None
    
    def _find_entity_by_value(self, value: str, entities: List[Dict]) -> Optional[Dict]:
        """Find an entity by value"""
        value_lower = value.lower()
        for entity in entities:
            entity_value = entity.get('value', '').lower()
            if entity_value and entity_value == value_lower:
                return entity
        return None
    
    def _extract_co_occurrences(self, text: str, entities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract relationships based on entity co-occurrence in text"""
        relationships = []
        
        # Group entities by sentence/paragraph
        sentences = re.split(r'[.!?]+', text)
        
        for sentence in sentences:
            sentence_entities = []
            for entity in entities:
                entity_name = entity.get('name') or entity.get('value')
                if entity_name and entity_name.lower() in sentence.lower():
                    sentence_entities.append(entity)
            
            # Create relationships between co-occurring entities
            for i, entity_a in enumerate(sentence_entities):
                for entity_b in sentence_entities[i+1:]:
                    if entity_a.get('entity_id') != entity_b.get('entity_id'):
                        # Determine relationship type based on entity types
                        rel_type = self._infer_relationship_type(entity_a, entity_b)
                        if rel_type:
                            relationships.append({
                                'source_entity_id': entity_a.get('entity_id'),
                                'target_entity_id': entity_b.get('entity_id'),
                                'relationship_type': rel_type,
                                'confidence': 0.6,  # Lower confidence for co-occurrence
                                'extraction_method': 'co_occurrence'
                            })
        
        return relationships
    
    def _infer_relationship_type(self, entity_a: Dict, entity_b: Dict) -> Optional[str]:
        """Infer relationship type based on entity types"""
        type_a = entity_a.get('entity_type')
        type_b = entity_b.get('entity_type')
        
        # Define type mappings
        type_pairs = {
            (EntityType.PERSON, EntityType.PHONE): 'HAS_PHONE',
            (EntityType.PHONE, EntityType.PERSON): 'BELONGS_TO',
            (EntityType.PERSON, EntityType.EMAIL): 'HAS_EMAIL',
            (EntityType.EMAIL, EntityType.PERSON): 'BELONGS_TO',
            (EntityType.PERSON, EntityType.VEHICLE): 'HAS_VEHICLE',
            (EntityType.VEHICLE, EntityType.PERSON): 'BELONGS_TO',
            (EntityType.PERSON, EntityType.LOCATION): 'LOCATED_AT',
            (EntityType.LOCATION, EntityType.PERSON): 'CONTAINS',
            (EntityType.PERSON, EntityType.ORGANIZATION): 'AFFILIATED_WITH',
            (EntityType.ORGANIZATION, EntityType.PERSON): 'EMPLOYS',
            (EntityType.PERSON, EntityType.INSTITUTION): 'AFFILIATED_WITH',
            (EntityType.INSTITUTION, EntityType.PERSON): 'ASSOCIATED_WITH',
            (EntityType.PERSON, EntityType.PERSON): 'CONNECTED_TO',
            (EntityType.PERSON, EntityType.SOCIAL_ACCOUNT): 'HAS_SOCIAL_ACCOUNT',
            (EntityType.SOCIAL_ACCOUNT, EntityType.PERSON): 'BELONGS_TO',
        }
        
        return type_pairs.get((type_a, type_b)) or type_pairs.get((type_b, type_a)) or 'RELATED_TO'


# Global relationship extractor instance
relationship_extractor = RelationshipExtractor()
