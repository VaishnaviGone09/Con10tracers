"""
Social Intelligence Schemas
Data models for social profile and connection information
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class SocialPlatform(str, Enum):
    """Social platform enumeration"""
    X = "X"
    INSTAGRAM = "INSTAGRAM"
    TELEGRAM = "TELEGRAM"
    LINKEDIN = "LINKEDIN"
    FACEBOOK = "FACEBOOK"
    PUBLIC_WEB = "PUBLIC_WEB"


class SocialProfileBase(BaseModel):
    """Base social profile model"""
    platform: SocialPlatform
    username: Optional[str] = None
    display_name: Optional[str] = None
    public_url: Optional[str] = None
    location: Optional[str] = None
    institution: Optional[str] = None
    organization: Optional[str] = None
    bio: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    status: str = "PENDING_REVIEW"  # VERIFIED, LIKELY, UNCERTAIN, REQUIRES_REVIEW


class SocialProfileCreate(SocialProfileBase):
    """Schema for creating a social profile"""
    pass


class SocialProfile(SocialProfileBase):
    """Complete social profile model"""
    profile_id: str
    created_at: datetime
    updated_at: datetime
    evidence_id: Optional[str] = None
    signals: List[str] = Field(default_factory=list)
    
    class Config:
        from_attributes = True


class SocialConnection(BaseModel):
    """Social connection between profiles"""
    connection_id: str
    source_profile_id: str
    target_profile_id: str
    platform: SocialPlatform
    relationship_type: str  # FOLLOWS, FRIEND, CONNECTED, MENTIONED, etc.
    observed_at: datetime
    source_reference: Optional[str] = None
    evidence_id: Optional[str] = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)


class SocialSearchRequest(BaseModel):
    """Request for social profile search"""
    name: Optional[str] = None
    alias: Optional[str] = None
    username: Optional[str] = None
    institution: Optional[str] = None
    organization: Optional[str] = None
    location: Optional[str] = None
    platform: Optional[SocialPlatform] = None
    limit: int = Field(default=20, ge=1, le=100)


class SocialSearchResponse(BaseModel):
    """Response for social profile search"""
    profiles: List[SocialProfile]
    total: int
    search_signals: Dict[str, Any] = Field(default_factory=dict)
