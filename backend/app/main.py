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


# =========================================================
# LOGGING
# =========================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)


# =========================================================
# APPLICATION LIFESPAN
# =========================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown manager."""

    # -------------------------
    # STARTUP
    # -------------------------

    logger.info("Starting CON10TRACERS backend...")
    logger.info(f"Demo mode: {is_demo_mode()}")

    # Load synthetic demo data
    if is_demo_mode():
        logger.info(
            "Loading synthetic demo data into the application database..."
        )

        try:
            load_demo_data()
            logger.info("Synthetic demo data loaded successfully.")
        except Exception as exc:
            logger.exception(
                f"Failed to load synthetic demo data: {exc}"
            )

    # Start monitoring scheduler
    if settings.MONITORING_ENABLED:
        try:
            monitoring_scheduler.start()
            logger.info("Monitoring scheduler started")
        except Exception as exc:
            logger.exception(
                f"Failed to start monitoring scheduler: {exc}"
            )

    yield

    # -------------------------
    # SHUTDOWN
    # -------------------------

    logger.info("Shutting down CON10TRACERS backend...")

    if settings.MONITORING_ENABLED:
        try:
            monitoring_scheduler.stop()
            logger.info("Monitoring scheduler stopped")
        except Exception as exc:
            logger.exception(
                f"Failed to stop monitoring scheduler: {exc}"
            )


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Investigator-Assistance and "
        "Investigation-Intelligence Platform"
    ),
    lifespan=lifespan
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

# Allow the React/Vite frontend to communicate with FastAPI
# during local development.

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# API ROUTES
# =========================================================

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


# =========================================================
# ROOT ENDPOINT
# =========================================================

@app.get("/")
async def root():
    """Root endpoint."""

    return {
        "message": "CON10TRACERS API",
        "version": settings.APP_VERSION,
        "status": "operational",
        "demo_mode": is_demo_mode()
    }


# =========================================================
# RUN APPLICATION DIRECTLY
# =========================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
