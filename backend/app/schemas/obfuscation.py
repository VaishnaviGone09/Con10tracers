"""
Obfuscation Analysis Schemas
Data models for encoded/obfuscated content analysis
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class ObfuscationAnalysisRequest(BaseModel):
    """Request for obfuscation analysis"""
    content: str
    document_id: Optional[str] = None
    evidence_id: Optional[str] = None


class ObfuscationAnalysisResult(BaseModel):
    """Result of obfuscation analysis"""
    original_content: str
    suspected_format: Optional[str] = None  # BASE64, HEX, URL_ENCODED, UNICODE_ESCAPE, JSON_ESCAPE, ROT, etc.
    detection_confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    decoder_used: Optional[str] = None
    decoded_content: Optional[str] = None
    validation_status: str  # VALID, INVALID, PARTIAL, UNKNOWN
    requires_review: bool = True
    metadata: Dict[str, Any] = Field(default_factory=dict)
