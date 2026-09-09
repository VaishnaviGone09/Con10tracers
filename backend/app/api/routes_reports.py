"""
Reports Route
API endpoints for report generation
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.database.postgres import db
from app.reports.pdf_generator import pdf_generator

router = APIRouter()


@router.post("/reports/{case_id}")
async def generate_report(case_id: str):
    """Generate a PDF report for a case"""
    try:
        # Get case data
        case = db.get_case(case_id)
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # For demo, create investigation data
        investigation_data = {
            'final_answer': f"Demo investigation report for case {case_id}",
            'entities': [],
            'social_results': [],
            'evidence': [],
            'graph_results': {},
            'relevance_results': [],
            'warnings': ['This is a demo report with synthetic data']
        }
        
        # Generate PDF
        filepath = pdf_generator.generate_case_report(case_id, case, investigation_data)
        
        if not filepath:
            raise HTTPException(status_code=500, detail="Failed to generate PDF report")
        
        # Return the file
        return FileResponse(
            filepath,
            media_type='application/pdf',
            filename=f"con10tracers_report_{case_id}.pdf"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
