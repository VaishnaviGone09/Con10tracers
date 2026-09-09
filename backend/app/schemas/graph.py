"""
Graph Schemas
Data models for knowledge graph operations
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class GraphNode(BaseModel):
    """Graph node representation"""
    id: str
    label: str
    type: str
    properties: Dict[str, Any] = Field(default_factory=dict)


class GraphEdge(BaseModel):
    """Graph edge representation"""
    id: str
    source: str
    target: str
    relationship_type: str
    properties: Dict[str, Any] = Field(default_factory=dict)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)


class GraphData(BaseModel):
    """Complete graph data for a case"""
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class GraphMetrics(BaseModel):
    """Graph analysis metrics"""
    degree_centrality: Dict[str, float] = Field(default_factory=dict)
    betweenness_centrality: Dict[str, float] = Field(default_factory=dict)
    pagerank: Dict[str, float] = Field(default_factory=dict)
    communities: Dict[str, int] = Field(default_factory=dict)


class TimelineEvent(BaseModel):
    """Timeline event"""
    event_id: str
    timestamp: str
    description: str
    entity_ids: List[str] = Field(default_factory=list)
    evidence_ids: List[str] = Field(default_factory=list)
    event_type: str


class TimelineResponse(BaseModel):
    """Timeline response"""
    case_id: str
    events: List[TimelineEvent]
