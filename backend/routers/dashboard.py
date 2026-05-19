from fastapi import APIRouter, HTTPException, status
from models import SaveAnalysisRequest, SaveAnalysisResponse, GetAnalysisResponse, AnalysisRecord
from database import get_supabase
from datetime import datetime
from typing import Optional
import uuid

router = APIRouter()


@router.post("/save-analysis", response_model=SaveAnalysisResponse)
async def save_analysis(request: SaveAnalysisRequest):
    """Save analysis results to database with team info"""
    try:
        supabase = get_supabase()
        
        if not supabase:
            # If Supabase not initialized, still return success but with warning
            return SaveAnalysisResponse(
                success=False,
                message="Database not initialized",
                error="Supabase credentials not configured"
            )
        
        # Generate unique ID for this analysis
        analysis_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        # Prepare data for insertion
        record = {
            "id": analysis_id,
            "team_id": request.team_id,
            "team_name": request.team_name,
            "analysis_type": request.analysis_type,
            "data": request.data,
            "metadata": request.metadata or {},
            "created_at": now,
            "updated_at": now,
        }
        
        # Insert into Supabase
        result = supabase.table("analysis_results").insert(record).execute()
        
        if result.data:
            saved_record = result.data[0]
            return SaveAnalysisResponse(
                success=True,
                message=f"Analysis saved successfully with ID: {analysis_id}",
                record=AnalysisRecord(**saved_record)
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save analysis to database"
            )
    
    except Exception as e:
        return SaveAnalysisResponse(
            success=False,
            message="Failed to save analysis",
            error=str(e)
        )


@router.get("/analysis/{team_id}", response_model=GetAnalysisResponse)
async def get_team_analysis(
    team_id: str,
    analysis_type: Optional[str] = None,
    limit: int = 50
):
    """Retrieve analysis results for a team"""
    try:
        supabase = get_supabase()
        
        if not supabase:
            return GetAnalysisResponse(
                success=False,
                records=[]
            )
        
        query = supabase.table("analysis_results").select("*").eq("team_id", team_id)
        
        if analysis_type:
            query = query.eq("analysis_type", analysis_type)
        
        result = query.order("created_at", desc=True).limit(limit).execute()
        
        records = [AnalysisRecord(**r) for r in result.data] if result.data else []
        
        return GetAnalysisResponse(
            success=True,
            records=records,
            count=len(records)
        )
    
    except Exception as e:
        return GetAnalysisResponse(
            success=False,
            records=[],
            count=0
        )


@router.delete("/analysis/{analysis_id}")
async def delete_analysis(analysis_id: str):
    """Delete a specific analysis record"""
    try:
        supabase = get_supabase()
        
        if not supabase:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database not initialized"
            )
        
        result = supabase.table("analysis_results").delete().eq("id", analysis_id).execute()
        
        return {
            "success": True,
            "message": f"Analysis {analysis_id} deleted"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
