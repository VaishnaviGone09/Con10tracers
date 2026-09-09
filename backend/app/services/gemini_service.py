"""
Gemini Service
Integrates Google Gemini API with graceful fallback
"""

from typing import Optional, Dict, Any
import logging

from app.core.config import has_gemini, settings

logger = logging.getLogger(__name__)


class GeminiService:
    """Service for Gemini API integration"""
    
    def __init__(self):
        self.client = None
        self.is_available = has_gemini()
        
        if self.is_available:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.client = genai.GenerativeModel('gemini-pro')
                logger.info("Gemini API initialized successfully")
            except ImportError:
                logger.warning("Google Generative AI library not installed")
                self.is_available = False
            except Exception as e:
                logger.error(f"Error initializing Gemini API: {e}")
                self.is_available = False
        else:
            logger.info("Gemini API not configured - running in demo mode")
    
    def generate_summary(self, text: str, max_length: int = 200) -> str:
        """Generate a summary of text"""
        if not self.is_available or not self.client:
            return self._demo_summary(text, max_length)
        
        try:
            prompt = f"Summarize the following text in {max_length} characters or less:\n\n{text}"
            response = self.client.generate_content(prompt)
            return response.text[:max_length]
        except Exception as e:
            logger.error(f"Error generating summary with Gemini: {e}")
            return self._demo_summary(text, max_length)
    
    def interpret_entities(self, entities: list) -> str:
        """Interpret extracted entities"""
        if not self.is_available or not self.client:
            return self._demo_interpretation(entities)
        
        try:
            entity_text = "\n".join([f"- {e.get('name', e.get('value', 'Unknown'))} ({e.get('entity_type', 'Unknown')})" 
                                   for e in entities])
            prompt = f"Interpret the following extracted entities and provide a brief analysis:\n\n{entity_text}"
            response = self.client.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error interpreting entities with Gemini: {e}")
            return self._demo_interpretation(entities)
    
    def explain_investigation(self, investigation_data: Dict[str, Any]) -> str:
        """Generate explanation for investigation results"""
        if not self.is_available or not self.client:
            return self._demo_explanation(investigation_data)
        
        try:
            summary = f"Investigation query: {investigation_data.get('query', 'Unknown')}\n"
            summary += f"Entities found: {len(investigation_data.get('entities', []))}\n"
            summary += f"Social profiles: {len(investigation_data.get('social_results', []))}\n"
            summary += f"Evidence items: {len(investigation_data.get('evidence', []))}\n"
            
            prompt = f"Provide a brief explanation of this investigation:\n\n{summary}"
            response = self.client.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error explaining investigation with Gemini: {e}")
            return self._demo_explanation(investigation_data)
    
    def _demo_summary(self, text: str, max_length: int) -> str:
        """Demo fallback for summary generation"""
        if not text:
            return "No text to summarize"
        
        # Simple truncation for demo
        summary = text[:max_length]
        if len(text) > max_length:
            summary += "..."
        return summary
    
    def _demo_interpretation(self, entities: list) -> str:
        """Demo fallback for entity interpretation"""
        if not entities:
            return "No entities to interpret"
        
        entity_types = {}
        for entity in entities:
            entity_type = entity.get('entity_type', 'Unknown')
            entity_types[entity_type] = entity_types.get(entity_type, 0) + 1
        
        interpretation = f"Found {len(entities)} entities:\n"
        for entity_type, count in entity_types.items():
            interpretation += f"- {entity_type}: {count}\n"
        
        return interpretation
    
    def _demo_explanation(self, investigation_data: Dict[str, Any]) -> str:
        """Demo fallback for investigation explanation"""
        query = investigation_data.get('query', 'Unknown')
        entity_count = len(investigation_data.get('entities', []))
        social_count = len(investigation_data.get('social_results', []))
        evidence_count = len(investigation_data.get('evidence', []))
        
        explanation = f"Investigation for '{query}' completed.\n"
        explanation += f"Found {entity_count} entities, {social_count} social profiles, and {evidence_count} evidence items.\n"
        explanation += "Review the detailed results for more information."
        
        return explanation


# Global Gemini service instance
gemini_service = GeminiService()
