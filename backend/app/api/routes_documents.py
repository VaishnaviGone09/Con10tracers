"""
Documents Route
API endpoints for document management and analysis
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List

from app.schemas.documents import Document, DocumentCreate, DocumentAnalysisRequest, DocumentAnalysisResponse
from app.database.postgres import db
from app.services.document_service import document_service

router = APIRouter()


@router.post("/documents/upload", response_model=Document)
async def upload_document(
    file: UploadFile = File(...),
    case_id: str = None,
    title: str = None
):
    """Upload a document"""
    try:
        # Read file content
        content = await file.read()
        
        # Determine file type
        file_type = file.filename.split('.')[-1].lower() if '.' in file.filename else 'txt'
        
        # Upload document
        document_id = document_service.upload_document(
            filename=file.filename,
            file_content=content,
            file_type=file_type,
            case_id=case_id,
            title=title
        )
        
        document = db.get_document(document_id)
        return Document(**document)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/documents/{document_id}", response_model=Document)
async def get_document(document_id: str):
    """Get a document by ID"""
    document = db.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return Document(**document)


@router.get("/cases/{case_id}/documents", response_model=List[Document])
async def get_case_documents(case_id: str):
    """Get all documents for a case"""
    documents = db.get_documents_by_case(case_id)
    return [Document(**doc) for doc in documents]


@router.post("/analysis/document", response_model=DocumentAnalysisResponse)
async def analyze_document(request: DocumentAnalysisRequest):
    """Analyze a document for entities and relationships"""
    try:
        result = document_service.analyze_document(request.document_id)
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return DocumentAnalysisResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
