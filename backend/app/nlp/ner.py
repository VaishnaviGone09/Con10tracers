"""
Named Entity Recognition
Uses spaCy for extracting people, organizations, locations, etc.
"""

from typing import List, Dict, Any
import logging
import re

try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    logging.warning("spaCy not available - NER will be limited")

from app.schemas.entities import EntityType

logger = logging.getLogger(__name__)


class NERExtractor:
    """Extracts named entities from text using spaCy"""
    
    def __init__(self):
        self.nlp = None
        if SPACY_AVAILABLE:
            try:
                # Try to load English model
                self.nlp = spacy.load("en_core_web_sm")
                logger.info("Loaded spaCy English model")
            except OSError:
                logger.warning("spaCy English model not found - NER will be limited")
            except Exception as e:
                logger.error(f"Error loading spaCy model: {e}")
    
    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """Extract entities from text"""
        entities = []
        
        if self.nlp is None:
            # Fallback to basic extraction if spaCy is not available
            return self._basic_extraction(text)
        
        try:
            doc = self.nlp(text)
            
            for ent in doc.ents:
                entity_type = self._map_spacy_label(ent.label_)
                if entity_type:
                    entities.append({
                        'entity_type': entity_type,
                        'name': ent.text,
                        'confidence': 0.8,  # spaCy doesn't provide confidence
                        'start': ent.start_char,
                        'end': ent.end_char,
                        'extraction_method': 'spacy_ner'
                    })
        except Exception as e:
            logger.error(f"Error in spaCy NER: {e}")
            # Fallback to basic extraction
            return self._basic_extraction(text)
        
        return entities
    
    def _map_spacy_label(self, spacy_label: str) -> str:
        """Map spaCy entity labels to our entity types"""
        mapping = {
            'PERSON': EntityType.PERSON,
            'ORG': EntityType.ORGANIZATION,
            'GPE': EntityType.LOCATION,  # Geopolitical entity
            'LOC': EntityType.LOCATION,
            'FAC': EntityType.LOCATION,  # Facility
            'NORP': EntityType.ORGANIZATION,  # Nationalities, religious, political groups
            'DATE': None,  # Handle separately
            'TIME': None,
            'PERCENT': None,
            'MONEY': None,
            'QUANTITY': None,
            'ORDINAL': None,
            'CARDINAL': None,
            'PRODUCT': None,
            'EVENT': EntityType.EVENT,
            'WORK_OF_ART': None,
            'LAW': None,
            'LANGUAGE': None
        }
        return mapping.get(spacy_label)
    
    def _basic_extraction(self, text: str) -> List[Dict[str, Any]]:
        """Basic entity extraction without spaCy"""
        entities = []
        
        # Very basic person name detection (capitalized words)
        words = text.split()
        for i, word in enumerate(words):
            if word and word[0].isupper() and len(word) > 1:
                # Check if it might be a name (simple heuristic)
                if i < len(words) - 1 and words[i + 1] and words[i + 1][0].isupper():
                    entities.append({
                        'entity_type': EntityType.PERSON,
                        'name': f"{word} {words[i + 1]}",
                        'confidence': 0.5,
                        'extraction_method': 'basic_heuristic'
                    })
        
        return entities


# Global NER extractor instance
ner_extractor = NERExtractor()
