"""
Agent Schemas
Data models for LangGraph agent operations
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class InvestigationState(BaseModel):
    """State for investigation workflow"""
    query: str
    investigation_id: Optional[str] = None
    entities: List[Dict[str, Any]] = Field(default_factory=list)
    relationships: List[Dict[str, Any]] = Field(default_factory=list)
    social_results: List[Dict[str, Any]] = Field(default_factory=list)
    evidence: List[Dict[str, Any]] = Field(default_factory=list)
    graph_results: Optional[Dict[str, Any]] = None
    timeline: List[Dict[str, Any]] = Field(default_factory=list)
    obfuscation_results: List[Dict[str, Any]] = Field(default_factory=list)
    relevance_results: List[Dict[str, Any]] = Field(default_factory=list)
    citations: List[str] = Field(default_factory=list)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    warnings: List[str] = Field(default_factory=list)
    final_answer: Optional[str] = None
    next_agent: Optional[str] = None


class AgentQueryRequest(BaseModel):
    """Request for agent query"""
    query: str
    investigation_id: Optional[str] = None
    case_id: Optional[str] = None
    options: Dict[str, Any] = Field(default_factory=dict)


class AgentQueryResponse(BaseModel):
    """Response from agent query"""
    investigation_id: str
    final_answer: str
    entities: List[Dict[str, Any]]
    relationships: List[Dict[str, Any]]
    evidence: List[Dict[str, Any]]
    social_results: List[Dict[str, Any]]
    confidence: float
    warnings: List[str]
    citations: List[str]
