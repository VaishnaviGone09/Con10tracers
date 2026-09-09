"""
Relevance Engine Schemas
Data models for explainable relevance scoring
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class Priority(str, Enum):
    """Priority enumeration"""
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFORMATIONAL = "INFORMATIONAL"


class RelevanceScoreRequest(BaseModel):
    """Request for relevance scoring"""
    entity_id: str
    case_id: str
    evidence_ids: List[str] = Field(default_factory=list)
    context: Dict[str, Any] = Field(default_factory=dict)


class RelevanceScoreResponse(BaseModel):
    """Response from relevance scoring"""
    entity_id: str
    case_id: str
    relevance_score: float = Field(ge=0.0, le=1.0)
    priority: Priority
    reasons: List[str] = Field(default_factory=list)
    supporting_evidence_ids: List[str] = Field(default_factory=list)
    score_breakdown: Dict[str, float] = Field(default_factory=dict)  # Individual component scores
