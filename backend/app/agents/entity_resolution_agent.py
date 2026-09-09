"""
Entity Resolution Agent
Handles entity resolution within the agent workflow
"""

from typing import Dict, Any
import logging

from app.schemas.agents import InvestigationState

logger = logging.getLogger(__name__)


class EntityResolutionAgent:
    """Agent for entity resolution"""
    
    def process(self, state: InvestigationState) -> InvestigationState:
        """Process entity resolution in the investigation state"""
        logger.info("Entity resolution agent: Processing entity resolution")
        
        state.warnings.append("Entity resolution agent: Entity resolution processed")
        
        return state


entity_resolution_agent = EntityResolutionAgent()
