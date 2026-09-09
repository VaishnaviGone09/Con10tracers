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

# Reports temporarily disabled because the reports package is not available
# from app.api.routes_reports import router as reports_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        from app.data.demo_data import load_demo_data
        load_demo_data()
        print("Demo data loaded")
    except Exception as e:
        print(f"Demo data loading skipped: {e}")

    yield


app = FastAPI(
    title="CON10TRACERS Backend",
    description="Investigator-Assistance and Investigation-Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
)


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


app.include_router(health_router)
app.include_router(cases_router)
app.include_router(documents_router)
app.include_router(entities_router)
app.include_router(graph_router)
app.include_router(social_router)
app.include_router(agent_router)
app.include_router(monitoring_router)

# Reports temporarily disabled
# app.include_router(reports_router)


@app.get("/")
async def root():
    return {
        "name": "CON10TRACERS",
        "status": "running",
        "version": "1.0.0",
    }
