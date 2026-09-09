"""
Health Check Route
Provides health status and configuration information
"""

from fastapi import APIRouter
from typing import Dict, Any

from app.core.config import settings, is_demo_mode, has_gemini, has_neo4j, has_postgres

router = APIRouter()


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "demo_mode": is_demo_mode(),
        "services": {
            "gemini": has_gemini(),
            "neo4j": has_neo4j(),
            "postgresql": has_postgres()
        },
        "configuration": {
            "debug": settings.DEBUG,
            "monitoring_enabled": settings.MONITORING_ENABLED,
            "frontend_origin": settings.FRONTEND_ORIGIN
        }
    }
