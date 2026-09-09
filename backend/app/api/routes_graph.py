"""
Graph Route
API endpoints for knowledge graph operations
"""

from fastapi import APIRouter, HTTPException

from app.schemas.graph import GraphData, GraphMetrics, TimelineResponse
from app.graph.graph_builder import graph_builder
from app.graph.graph_analysis import graph_analyzer

router = APIRouter()


@router.get("/graph/{case_id}", response_model=GraphData)
async def get_case_graph(case_id: str):
    """Get graph data for a case"""
    try:
        graph_data = graph_builder.get_case_graph(case_id)
        return GraphData(**graph_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/graph/{case_id}/metrics", response_model=GraphMetrics)
async def get_graph_metrics(case_id: str):
    """Get graph analysis metrics for a case"""
    try:
        metrics = graph_analyzer.calculate_metrics(case_id)
        return GraphMetrics(**metrics)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/timeline/{case_id}", response_model=TimelineResponse)
async def get_case_timeline(case_id: str):
    """Get timeline for a case"""
    try:
        # For demo, return empty timeline
        return TimelineResponse(
            case_id=case_id,
            events=[]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/graph/{case_id}/path")
async def find_shortest_path(case_id: str, source: str, target: str):
    """Find shortest path between two nodes"""
    try:
        path = graph_analyzer.find_shortest_path(case_id, source, target)
        return {"path": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

        
