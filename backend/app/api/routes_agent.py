"""
Agent Route
API endpoints for LangGraph agent operations
"""

from fastapi import APIRouter, HTTPException

from app.schemas.agents import AgentQueryRequest, AgentQueryResponse
from app.agents.supervisor_agent import supervisor_agent

router = APIRouter()


@router.post("/agent/query", response_model=AgentQueryResponse)
async def query_agent(request: AgentQueryRequest):
    """Run an investigation query through the agent workflow"""
    try:
        result = supervisor_agent.run_investigation(
            query=request.query,
            case_id=request.investigation_id,
            options=request.options
        )
        
        return AgentQueryResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
