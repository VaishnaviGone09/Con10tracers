"""
Supervisor Agent
LangGraph-based supervisor that coordinates investigation workflow
"""

from typing import Dict, Any, List, Optional
import logging
from datetime import datetime

try:
    from langgraph.graph import StateGraph, END
    LANGGRAPH_AVAILABLE = True
except ImportError:
    LANGGRAPH_AVAILABLE = False
    logging.warning("LangGraph not available - agent workflow will be limited")

from app.schemas.agents import InvestigationState
from app.database.postgres import db
from app.services.entity_service import entity_service
from app.services.social_service import social_service
from app.services.evidence_service import evidence_service
from app.services.relevance_engine import relevance_engine
from app.services.obfuscation_service import obfuscation_service
from app.graph.graph_analysis import graph_analyzer
from app.core.security import generate_case_id

logger = logging.getLogger(__name__)


class SupervisorAgent:
    """Supervisor agent for investigation workflow"""
    
    def __init__(self):
        self.workflow = None
        if LANGGRAPH_AVAILABLE:
            self._build_workflow()
    
    def _build_workflow(self):
        """Build the LangGraph workflow"""
        try:
            workflow = StateGraph(InvestigationState)
            
            # Add nodes for each agent
            workflow.add_node("document_agent", self._document_agent)
            workflow.add_node("entity_agent", self._entity_agent)
            workflow.add_node("social_agent", self._social_agent)
            workflow.add_node("graph_agent", self._graph_agent)
            workflow.add_node("evidence_agent", self._evidence_agent)
            workflow.add_node("entity_resolution_agent", self._entity_resolution_agent)
            workflow.add_node("obfuscation_agent", self._obfuscation_agent)
            workflow.add_node("relevance_agent", self._relevance_agent)
            workflow.add_node("final_answer_agent", self._final_answer)
            
            # Define edges (linear flow for simplicity)
            workflow.set_entry_point("document_agent")
            workflow.add_edge("document_agent", "entity_agent")
            workflow.add_edge("entity_agent", "social_agent")
            workflow.add_edge("social_agent", "graph_agent")
            workflow.add_edge("graph_agent", "evidence_agent")
            workflow.add_edge("evidence_agent", "entity_resolution_agent")
            workflow.add_edge("entity_resolution_agent", "obfuscation_agent")
            workflow.add_edge("obfuscation_agent", "relevance_agent")
            workflow.add_edge("relevance_agent", "final_answer_agent")
            workflow.add_edge("final_answer_agent", END)
            
            self.workflow = workflow.compile()
            logger.info("LangGraph workflow built successfully")
        except Exception as e:
            logger.error(f"Error building LangGraph workflow: {e}")
            self.workflow = None
    
    def run_investigation(self, query: str, case_id: Optional[str] = None, 
                         options: Dict[str, Any] = None) -> Dict[str, Any]:
        """Run an investigation workflow"""
        if options is None:
            options = {}
        
        if not case_id:
            case_id = generate_case_id()
        
        # Initialize state
        initial_state = InvestigationState(
            query=query,
            investigation_id=case_id,
            confidence=0.0,
            warnings=[]
        )
        
        if self.workflow:
            try:
                # Run the workflow
                final_state = self.workflow.invoke(initial_state)
                return self._format_response(final_state)
            except Exception as e:
                logger.error(f"Error running LangGraph workflow: {e}")
                # Fallback to sequential execution
                return self._run_sequential_fallback(initial_state)
        else:
            # Fallback to sequential execution
            return self._run_sequential_fallback(initial_state)
    
    def _run_sequential_fallback(self, state: InvestigationState) -> Dict[str, Any]:
        """Sequential execution fallback when LangGraph is unavailable"""
        logger.info("Running sequential fallback investigation")
        
        # Run agents sequentially
        state = self._document_agent(state)
        state = self._entity_agent(state)
        state = self._social_agent(state)
        state = self._graph_agent(state)
        state = self._evidence_agent(state)
        state = self._entity_resolution_agent(state)
        state = self._obfuscation_agent(state)
        state = self._relevance_agent(state)
        state = self._final_answer(state)
        
        return self._format_response(state)
    
    def _document_agent(self, state: InvestigationState) -> InvestigationState:
        """Document processing agent"""
        logger.info("Document agent processing")
        
        # For demo, add some document-related information
        state.warnings.append("Document agent: Processing documents")
        
        return state
    
    def _entity_agent(self, state: InvestigationState) -> InvestigationState:
        """Entity extraction agent"""
        logger.info("Entity agent processing")
        
        # Search for entities based on query
        entities = db.search_entities({'name': state.query})
        state.entities = [e.dict() if hasattr(e, 'dict') else e for e in entities]
        
        return state
    
    def _social_agent(self, state: InvestigationState) -> InvestigationState:
        """Social intelligence agent"""
        logger.info("Social agent processing")
        
        # Search for social profiles
        profiles = social_service.search_profiles(state.query, {})
        state.social_results = [p.dict() if hasattr(p, 'dict') else p for p in profiles]
        
        return state
    
    def _graph_agent(self, state: InvestigationState) -> InvestigationState:
        """Graph analysis agent"""
        logger.info("Graph agent processing")
        
        # Get graph data for the case
        graph_data = graph_analyzer.calculate_metrics(state.investigation_id)
        state.graph_results = graph_data
        
        return state
    
    def _evidence_agent(self, state: InvestigationState) -> InvestigationState:
        """Evidence collection agent"""
        logger.info("Evidence agent processing")
        
        # Get evidence for the case
        evidence = db.get_evidence_by_case(state.investigation_id)
        state.evidence = [e.dict() if hasattr(e, 'dict') else e for e in evidence]
        
        return state
    
    def _entity_resolution_agent(self, state: InvestigationState) -> InvestigationState:
        """Entity resolution agent"""
        logger.info("Entity resolution agent processing")
        
        # Resolve entities if we have multiple entities
        if len(state.entities) > 1:
            for i in range(len(state.entities) - 1):
                entity_a = state.entities[i]
                entity_b = state.entities[i + 1]
                
                if entity_a.get('entity_id') and entity_b.get('entity_id'):
                    resolution = entity_service.resolve_entities(
                        entity_a['entity_id'],
                        entity_b['entity_id']
                    )
                    state.warnings.append(f"Entity resolution: {resolution.get('status', 'UNKNOWN')}")
        
        return state
    
    def _obfuscation_agent(self, state: InvestigationState) -> InvestigationState:
        """Obfuscation analysis agent"""
        logger.info("Obfuscation agent processing")
        
        # Analyze query for obfuscation
        result = obfuscation_service.analyze(state.query)
        if result.suspected_format:
            state.obfuscation_results = [result.dict()]
            state.warnings.append(f"Detected potential {result.suspected_format} encoding")
        
        return state
    
    def _relevance_agent(self, state: InvestigationState) -> InvestigationState:
        """Relevance scoring agent"""
        logger.info("Relevance agent processing")
        
        # Calculate relevance for entities
        relevance_results = []
        for entity in state.entities:
            entity_id = entity.get('entity_id')
            if entity_id:
                relevance = relevance_engine.calculate_relevance(
                    entity_id, state.investigation_id
                )
                relevance_results.append(relevance)
        
        state.relevance_results = relevance_results
        
        return state
    
    def _final_answer(self, state: InvestigationState) -> InvestigationState:
        """Final answer generation agent"""
        logger.info("Final answer agent processing")
        
        # Generate final answer based on collected information
        entity_count = len(state.entities)
        social_count = len(state.social_results)
        evidence_count = len(state.evidence)
        
        answer = f"Investigation completed for query: '{state.query}'\n"
        answer += f"Found {entity_count} entities, {social_count} social profiles, and {evidence_count} evidence items.\n"
        
        if state.relevance_results:
            high_priority = [r for r in state.relevance_results if r.get('priority') == 'HIGH']
            if high_priority:
                answer += f"\nHigh priority items: {len(high_priority)}\n"
        
        if state.warnings:
            answer += f"\nWarnings: {len(state.warnings)}\n"
        
        state.final_answer = answer
        state.confidence = 0.7  # Moderate confidence for demo
        
        return state
    
    def _format_response(self, state: InvestigationState) -> Dict[str, Any]:
        """Format the final response"""
        return {
            'investigation_id': state.investigation_id,
            'final_answer': state.final_answer,
            'entities': state.entities,
            'relationships': state.relationships,
            'social_results': state.social_results,
            'evidence': state.evidence,
            'graph_results': state.graph_results,
            'obfuscation_results': state.obfuscation_results,
            'relevance_results': state.relevance_results,
            'confidence': state.confidence,
            'warnings': state.warnings,
            'citations': state.citations
        }


# Global supervisor agent instance
supervisor_agent = SupervisorAgent()
