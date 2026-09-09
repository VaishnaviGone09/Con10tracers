"""
Graph Agent
Handles graph analysis within the agent workflow
"""

from typing import Dict, Any
import logging

from app.schemas.agents import InvestigationState

logger = logging.getLogger(__name__)


class GraphAgent:
    """Agent for graph analysis"""
    
    def process(self, state: InvestigationState) -> InvestigationState:
        """Process graph analysis in the investigation state"""
        logger.info("Graph agent: Processing graph analysis")
        
        state.warnings.append("Graph agent: Graph analysis processed")
        
        return state


graph_agent = GraphAgent()
