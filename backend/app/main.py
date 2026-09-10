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

    print("========================================")
    print("CON10TRACERS STARTING")
    print("========================================")

    try:
        # Correct location of demo data
        from data.synthetic.demo_data import load_demo_data

        print("Loading synthetic demo data...")

        demo_data = load_demo_data()

        print("========================================")
        print("DEMO DATA LOADED SUCCESSFULLY")
        print(f"Cases: {len(demo_data.get('cases', []))}")
        print(f"Entities: {len(demo_data.get('entities', []))}")
        print(
            f"Relationships: "
            f"{len(demo_data.get('relationships', []))}"
        )
        print(
            f"Evidence: "
            f"{len(demo_data.get('evidence', []))}"
        )
        print(
            f"Social Profiles: "
            f"{len(demo_data.get('social_profiles', []))}"
        )
        print(
            f"Alerts: "
            f"{len(demo_data.get('alerts', []))}"
        )
        print("========================================")

    except Exception as e:
        print("========================================")
        print("ERROR LOADING DEMO DATA")
        print(str(e))
        print("========================================")

    yield


app = FastAPI(
    title="CON10TRACERS API",
    description="Investigation Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
)


# =========================================================
# CORS
# =========================================================

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


# =========================================================
# API ROUTES
# =========================================================

app.include_router(
    health_router,
    prefix="/api",
)

app.include_router(
    cases_router,
    prefix="/api",
)

app.include_router(
    documents_router,
    prefix="/api",
)

app.include_router(
    entities_router,
    prefix="/api",
)

app.include_router(
    graph_router,
    prefix="/api",
)

app.include_router(
    social_router,
    prefix="/api",
)

app.include_router(
    agent_router,
    prefix="/api",
)

app.include_router(
    monitoring_router,
    prefix="/api",
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
async def root():
    return {
        "name": "CON10TRACERS",
        "status": "running",
        "version": "1.0.0",
        "demo_mode": True,
    }
