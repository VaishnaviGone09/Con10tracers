"""
Evidence Agent
Handles evidence collection within the agent workflow
"""

from typing import Dict, Any
import logging

from app.schemas.agents import InvestigationState

logger = logging.getLogger(__name__)


class EvidenceAgent:
    """Agent for evidence collection"""
    
    def process(self, state: InvestigationState) -> InvestigationState:
        """Process evidence collection in the investigation state"""
        logger.info("Evidence agent: Processing evidence collection")
        
        state.warnings.append("Evidence agent: Evidence collection processed")
        
        return state


evidence_agent = EvidenceAgent()
