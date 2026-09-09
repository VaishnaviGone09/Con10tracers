"""
Document Schemas
Data models for document management and analysis
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class DocumentType(str, Enum):
    """Document type enumeration"""
    PDF = "PDF"
    TXT = "TXT"
    JSON = "JSON"
    CSV = "CSV"


class DocumentBase(BaseModel):
    """Base document model"""
    filename: str
    file_type: DocumentType
    title: Optional[str] = None
    description: Optional[str] = None
    case_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DocumentCreate(DocumentBase):
    """Schema for creating a document"""
    content: Optional[str] = None  # For text-based uploads
    file_size: Optional[int] = None


class Document(DocumentBase):
    """Complete document model"""
    document_id: str
    uploaded_at: datetime
    processed_at: Optional[datetime] = None
    file_path: Optional[str] = None
    content_hash: Optional[str] = None
    entity_count: int = 0
    status: str = "UPLOADED"  # UPLOADED, PROCESSING, PROCESSED, ERROR
    
    class Config:
        from_attributes = True


class DocumentAnalysisRequest(BaseModel):
    """Request for document analysis"""
    document_id: str
    extract_entities: bool = True
    extract_relationships: bool = True
    analyze_obfuscation: bool = True


class DocumentAnalysisResponse(BaseModel):
    """Response from document analysis"""
    document_id: str
    entities: List[Dict[str, Any]]
    relationships: List[Dict[str, Any]]
    obfuscation_results: List[Dict[str, Any]]
    evidence_count: int
    processing_time_seconds: float
