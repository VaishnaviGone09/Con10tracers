"""
Case Schemas
Data models for investigation cases
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum


class CaseStatus(str, Enum):
    """Case status enumeration"""
    OPEN = "OPEN"
    ACTIVE = "ACTIVE"
    PENDING_REVIEW = "PENDING_REVIEW"
    CLOSED = "CLOSED"
    ARCHIVED = "ARCHIVED"


class CaseBase(BaseModel):
    """Base case model"""
    title: str
    description: Optional[str] = None
    status: CaseStatus = CaseStatus.OPEN
    priority: str = "MEDIUM"  # HIGH, MEDIUM, LOW
    investigators: List[str] = Field(default_factory=list)
    notes: Optional[str] = None


class CaseCreate(CaseBase):
    """Schema for creating a case"""
    pass


class CaseUpdate(BaseModel):
    """Schema for updating a case"""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[CaseStatus] = None
    priority: Optional[str] = None
    investigators: Optional[List[str]] = None
    notes: Optional[str] = None


class Case(CaseBase):
    """Complete case model"""
    case_id: str
    created_at: datetime
    updated_at: datetime
    entity_count: int = 0
    evidence_count: int = 0
    document_count: int = 0
    
    class Config:
        from_attributes = True


class CaseSummary(BaseModel):
    """Summary of a case"""
    case_id: str
    title: str
    status: CaseStatus
    priority: str
    created_at: datetime
    entity_count: int
    evidence_count: int
