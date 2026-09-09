"""
CON10TRACERS Main Application
FastAPI application for investigation intelligence platform
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings, is_demo_mode
from data.synthetic.demo_data import load_demo_data
from app.monitoring.scheduler import monitoring_scheduler
from app.api.routes_health import router as health_router
from app.api.routes_cases import router as cases_router
from app.api.routes_documents import router as documents_router
from app.api.routes_entities import router as entities_router
from app.api.routes_graph import router as graph_router
from app.api.routes_social import router as social_router
from app.api.routes_agent import router as agent_router
from app.api.routes_monitoring import router as monitoring_router
from app.api.routes_reports import router as reports_router


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""

    # Startup
    logger.info("Starting CON10TRACERS backend...")
    logger.info(f"Demo mode: {is_demo_mode()}")

    # Load synthetic demo data into the same database
    # used by the FastAPI application.
    if is_demo_mode():
        logger.info("Loading synthetic demo data into the application database...")
        load_demo_data()

    # Start monitoring scheduler if enabled
    if settings.MONITORING_ENABLED:
        monitoring_scheduler.start()
        logger.info("Monitoring scheduler started")

    yield

    # Shutdown
    logger.info("Shutting down CON10TRACERS backend...")

    # Stop monitoring scheduler
    if settings.MONITORING_ENABLED:
        monitoring_scheduler.stop()
        logger.info("Monitoring scheduler stopped")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Investigator-Assistance and Investigation-Intelligence Platform",
    lifespan=lifespan
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(
    health_router,
    prefix="/api",
    tags=["Health"]
)

app.include_router(
    cases_router,
    prefix="/api",
    tags=["Cases"]
)

app.include_router(
    documents_router,
    prefix="/api",
    tags=["Documents"]
)

app.include_router(
    entities_router,
    prefix="/api",
    tags=["Entities"]
)

app.include_router(
    graph_router,
    prefix="/api",
    tags=["Graph"]
)

app.include_router(
    social_router,
    prefix="/api",
    tags=["Social"]
)

app.include_router(
    agent_router,
    prefix="/api",
    tags=["Agent"]
)

app.include_router(
    monitoring_router,
    prefix="/api",
    tags=["Monitoring"]
)

app.include_router(
    reports_router,
    prefix="/api",
    tags=["Reports"]
)


@app.get("/")
async def root():
    """Root endpoint"""

    return {
        "message": "CON10TRACERS API",
        "version": settings.APP_VERSION,
        "status": "operational",
        "demo_mode": is_demo_mode()
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
