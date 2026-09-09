"""
Monitoring Route
API endpoints for monitoring and alerts
"""

from fastapi import APIRouter, HTTPException
from typing import List

from app.schemas.monitoring import MonitoringRunRequest, MonitoringRunResponse, Alert
from app.monitoring.scheduler import monitoring_scheduler

router = APIRouter()


@router.post("/monitoring/run", response_model=MonitoringRunResponse)
async def run_monitoring(request: MonitoringRunRequest):
    """Run monitoring pipeline manually"""
    try:
        result = monitoring_scheduler.run_monitoring_cycle()
        return MonitoringRunResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/alerts", response_model=List[Alert])
async def get_alerts(limit: int = 100):
    """Get recent alerts"""
    try:
        alerts = monitoring_scheduler.get_alerts(limit)
        return [Alert(**alert) for alert in alerts]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str, acknowledged_by: str):
    """Acknowledge an alert"""
    try:
        success = monitoring_scheduler.acknowledge_alert(alert_id, acknowledged_by)
        if success:
            return {"message": "Alert acknowledged successfully"}
        else:
            raise HTTPException(status_code=404, detail="Alert not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
