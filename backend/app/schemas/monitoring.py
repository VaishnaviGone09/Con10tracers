"""
Monitoring Schemas
Data models for monitoring and alerts
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class AlertType(str, Enum):
    """Alert type enumeration"""
    NEW_ENTITY = "NEW_ENTITY"
    NEW_RELATIONSHIP = "NEW_RELATIONSHIP"
    CROSS_CASE_CONNECTION = "CROSS_CASE_CONNECTION"
    NETWORK_CHANGE = "NETWORK_CHANGE"
    UNUSUAL_INCREASE = "UNUSUAL_INCREASE"
    NEW_POTENTIAL_MATCH = "NEW_POTENTIAL_MATCH"
    NEW_SOCIAL_CONNECTION = "NEW_SOCIAL_CONNECTION"


class AlertLevel(str, Enum):
    """Alert level enumeration"""
    INFO = "INFO"
    REVIEW = "REVIEW"
    HIGH_PRIORITY_REVIEW = "HIGH_PRIORITY_REVIEW"


class AlertBase(BaseModel):
    """Base alert model"""
    alert_type: AlertType
    level: AlertLevel
    case_id: Optional[str] = None
    description: str
    details: Dict[str, Any] = Field(default_factory=dict)
    entity_ids: List[str] = Field(default_factory=list)


class AlertCreate(AlertBase):
    """Schema for creating an alert"""
    pass


class Alert(AlertBase):
    """Complete alert model"""
    alert_id: str
    timestamp: datetime
    acknowledged: bool = False
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class MonitoringRunRequest(BaseModel):
    """Request to run monitoring pipeline"""
    case_ids: Optional[List[str]] = None
    force_full_scan: bool = False


class MonitoringRunResponse(BaseModel):
    """Response from monitoring run"""
    run_id: str
    timestamp: datetime
    cases_processed: int
    alerts_generated: int
    alerts: List[Alert]
    status: str
