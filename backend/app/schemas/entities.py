"""
Entity Schemas
Data models for entities (people, organizations, locations, etc.)
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class EntityType(str, Enum):
    """Entity type enumeration"""
    PERSON = "PERSON"
    ALIAS = "ALIAS"
    PHONE = "PHONE"
    EMAIL = "EMAIL"
    VEHICLE = "VEHICLE"
    LOCATION = "LOCATION"
    ORGANIZATION = "ORGANIZATION"
    INSTITUTION = "INSTITUTION"
    SOCIAL_ACCOUNT = "SOCIAL_ACCOUNT"
    CASE = "CASE"
    EVENT = "EVENT"
    DOCUMENT = "DOCUMENT"
    EVIDENCE = "EVIDENCE"


class EntityBase(BaseModel):
    """Base entity model"""
    entity_type: EntityType
    name: Optional[str] = None
    value: Optional[str] = None  # For structured entities like phone, email
    metadata: Dict[str, Any] = Field(default_factory=dict)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    source_evidence_id: Optional[str] = None


class EntityCreate(EntityBase):
    """Schema for creating an entity"""
    pass


class EntityUpdate(BaseModel):
    """Schema for updating an entity"""
    name: Optional[str] = None
    value: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)


class Entity(EntityBase):
    """Complete entity model"""
    entity_id: str
    created_at: datetime
    updated_at: datetime
    case_ids: List[str] = Field(default_factory=list)
    
    class Config:
        from_attributes = True


class EntityResolutionRequest(BaseModel):
    """Request for entity resolution"""
    entity_a_id: str
    entity_b_id: str


class EntityResolutionResult(BaseModel):
    """Result of entity resolution analysis"""
    entity_a_id: str
    entity_b_id: str
    entity_a: Entity
    entity_b: Entity
    confidence_score: float = Field(ge=0.0, le=1.0)
    supporting_signals: List[str] = Field(default_factory=list)
    contradicting_signals: List[str] = Field(default_factory=list)
    status: str  # POSSIBLE_MATCH, LIKELY_MATCH, REQUIRES_REVIEW, NOT_MATCH
    explanation: str


class EntitySearchRequest(BaseModel):
    """Request for entity search"""
    entity_type: Optional[EntityType] = None
    name: Optional[str] = None
    value: Optional[str] = None
    case_id: Optional[str] = None
    limit: int = Field(default=50, ge=1, le=200)


class EntitySearchResponse(BaseModel):
    """Response for entity search"""
    entities: List[Entity]
    total: int
