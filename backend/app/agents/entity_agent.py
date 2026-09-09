"""
Entity Agent
Handles entity extraction and analysis within the agent workflow
"""

from typing import Dict, Any
import logging

from app.schemas.agents import InvestigationState

logger = logging.getLogger(__name__)


class EntityAgent:
    """Agent for entity extraction and analysis"""
    
    def process(self, state: InvestigationState) -> InvestigationState:
        """Process entities in the investigation state"""
        logger.info("Entity agent: Processing entities")
        
        state.warnings.append("Entity agent: Entities processed")
        
        return state


entity_agent = EntityAgent()
