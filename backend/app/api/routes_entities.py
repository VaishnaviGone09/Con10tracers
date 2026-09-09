"""
Entities Route
API endpoints for entity management and resolution
"""

from fastapi import APIRouter, HTTPException
from typing import List

from app.schemas.entities import Entity, EntityCreate, EntityUpdate, EntitySearchRequest, EntitySearchResponse, EntityResolutionRequest, EntityResolutionResult
from app.database.postgres import db
from app.services.entity_service import entity_service
from app.core.security import generate_entity_id

router = APIRouter()


@router.get("/entities", response_model=EntitySearchResponse)
async def search_entities(
    entity_type: str = None,
    name: str = None,
    value: str = None,
    case_id: str = None,
    limit: int = 50
):
    """Search entities with filters"""
    try:
        filters = {}
        if entity_type:
            filters['entity_type'] = entity_type
        if name:
            filters['name'] = name
        if value:
            filters['value'] = value
        if case_id:
            filters['case_id'] = case_id
        
        entities = db.search_entities(filters)
        entities = entities[:limit]
        
        return EntitySearchResponse(
            entities=[Entity(**entity) for entity in entities],
            total=len(entities)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/entities/{entity_id}", response_model=Entity)
async def get_entity(entity_id: str):
    """Get an entity by ID"""
    entity = db.get_entity(entity_id)
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    return Entity(**entity)


@router.post("/entities", response_model=Entity)
async def create_entity(entity_data: EntityCreate):
    """Create a new entity"""
    try:
        from datetime import datetime
        entity_id = generate_entity_id()
        entity_dict = entity_data.dict()
        entity_dict.update({
            'entity_id': entity_id,
            'created_at': datetime.now(),
            'updated_at': datetime.now(),
            'case_ids': []
        })
        entity_service.create_entity(entity_dict)
        entity = db.get_entity(entity_id)
        return Entity(**entity)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/entities/resolve", response_model=EntityResolutionResult)
async def resolve_entities(request: EntityResolutionRequest):
    """Resolve whether two entities might be the same"""
    try:
        result = entity_service.resolve_entities(request.entity_a_id, request.entity_b_id)
        return EntityResolutionResult(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/entities/{entity_id}/matches")
async def find_entity_matches(entity_id: str, threshold: float = 0.5):
    """Find potential matches for an entity"""
    try:
        matches = entity_service.find_potential_matches(entity_id, threshold)
        return {"matches": matches}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
