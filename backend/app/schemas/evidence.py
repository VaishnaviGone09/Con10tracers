"""
Evidence Schemas
Data models for evidence and provenance
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class EvidenceBase(BaseModel):
    """Base evidence model"""
    source_id: Optional[str] = None  # Document ID or other source
    original_content: str
    extracted_claim: Optional[str] = None
    entity_ids: List[str] = Field(default_factory=list)
    relationship_ids: List[str] = Field(default_factory=list)
    extraction_method: str
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    provenance: Dict[str, Any] = Field(default_factory=dict)


class EvidenceCreate(EvidenceBase):
    """Schema for creating evidence"""
    pass


class Evidence(EvidenceBase):
    """Complete evidence model"""
    evidence_id: str
    timestamp: datetime
    case_id: Optional[str] = None
    
    class Config:
        from_attributes = True


class ProvenanceRecord(BaseModel):
    """Provenance record for evidence"""
    evidence_id: str
    source_type: str  # DOCUMENT, SOCIAL, MANUAL, SYSTEM
    source_reference: str
    extraction_timestamp: datetime
    extraction_method: str
    chain_of_custody: List[Dict[str, Any]] = Field(default_factory=list)
    integrity_hash: Optional[str] = None
