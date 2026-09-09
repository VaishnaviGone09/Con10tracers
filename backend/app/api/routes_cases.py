"""
Cases Route
API endpoints for case management
"""

from fastapi import APIRouter, HTTPException
from typing import List

from app.schemas.cases import Case, CaseCreate, CaseUpdate, CaseSummary
from app.database.postgres import db
from app.core.security import generate_case_id

router = APIRouter()


@router.get("/cases", response_model=List[CaseSummary])
async def get_cases():
    """Get all cases"""
    try:
        cases = db.get_all_cases()
        return [CaseSummary(**case) for case in cases]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cases/{case_id}", response_model=Case)
async def get_case(case_id: str):
    """Get a specific case by ID"""
    case = db.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return Case(**case)


@router.post("/cases", response_model=Case)
async def create_case(case_data: CaseCreate):
    """Create a new case"""
    try:
        case_id = generate_case_id()
        from datetime import datetime
        case_dict = case_data.dict()
        case_dict.update({
            'case_id': case_id,
            'created_at': datetime.now(),
            'updated_at': datetime.now(),
            'entity_count': 0,
            'evidence_count': 0,
            'document_count': 0
        })
        db.create_case(case_dict)
        return Case(**case_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/cases/{case_id}", response_model=Case)
async def update_case(case_id: str, case_data: CaseUpdate):
    """Update a case"""
    case = db.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    try:
        from datetime import datetime
        updates = case_data.dict(exclude_unset=True)
        updates['updated_at'] = datetime.now()
        db.update_case(case_id, updates)
        updated_case = db.get_case(case_id)
        return Case(**updated_case)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/cases/{case_id}")
async def delete_case(case_id: str):
    """Delete a case"""
    case = db.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    try:
        db.delete_case(case_id)
        return {"message": "Case deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
