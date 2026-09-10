from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_health import router as health_router
from app.api.routes_cases import router as cases_router
from app.api.routes_documents import router as documents_router
from app.api.routes_entities import router as entities_router
from app.api.routes_graph import router as graph_router
from app.api.routes_social import router as social_router
from app.api.routes_agent import router as agent_router
from app.api.routes_monitoring import router as monitoring_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        from app.data.demo_data import load_demo_data

        load_demo_data()
        print("Demo data loaded successfully")

    except Exception as e:
        print(f"Demo data loading skipped: {e}")

    yield


app = FastAPI(
    title="CON10TRACERS API",
    description="Investigation Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
)


# Allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://con10tracers.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API routes
app.include_router(health_router, prefix="/api")
app.include_router(cases_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(entities_router, prefix="/api")
app.include_router(graph_router, prefix="/api")
app.include_router(social_router, prefix="/api")
app.include_router(agent_router, prefix="/api")
app.include_router(monitoring_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "name": "CON10TRACERS",
        "status": "running",
        "version": "1.0.0",
    }
