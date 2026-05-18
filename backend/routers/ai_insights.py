"""
AI Insights Router
Provides endpoints for AI-powered data analysis
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from services.ai.gemini_service import GeminiService
import os

router = APIRouter()


class AnalyzeRequest(BaseModel):
    """Request model for data analysis"""
    data: List[Dict[str, Any]]
    headers: List[str]
    analysis_type: Optional[str] = "general"


class AnalyzeResponse(BaseModel):
    """Response model for data analysis"""
    success: bool
    insights: Dict[str, Any]
    analysis_type: str
    error: Optional[str] = None


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="Analyze data with AI",
    description="Generate AI-powered insights from CSV data using Google Gemini"
)
async def analyze_data(request: AnalyzeRequest):
    """
    Analyze data and generate insights
    
    Analysis types:
    - general: Overall insights and recommendations
    - anomaly: Detect anomalies and outliers
    - trend: Identify trends and patterns
    """
    try:
        # Check if API key is configured
        if not os.getenv("GOOGLE_AI_API_KEY"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google AI API key not configured. Set GOOGLE_AI_API_KEY environment variable."
            )
        
        # Validate input
        if not request.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No data provided for analysis"
            )
        
        if not request.headers:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No headers provided"
            )
        
        # Initialize Gemini service
        gemini = GeminiService()
        
        # Analyze data
        result = gemini.analyze_data(
            data=request.data,
            headers=request.headers,
            analysis_type=request.analysis_type
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("error", "Analysis failed")
            )
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze data: {str(e)}"
        )


@router.post(
    "/summary",
    summary="Generate data summary",
    description="Generate a natural language summary of the dataset"
)
async def generate_summary(request: AnalyzeRequest):
    """Generate a brief summary of the data"""
    try:
        if not os.getenv("GOOGLE_AI_API_KEY"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google AI API key not configured"
            )
        
        if not request.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No data provided"
            )
        
        gemini = GeminiService()
        summary = gemini.generate_summary(
            data=request.data,
            headers=request.headers
        )
        
        return {
            "success": True,
            "summary": summary
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary: {str(e)}"
        )


@router.get(
    "/health",
    summary="Check AI service health",
    description="Check if Google AI API is configured and accessible"
)
async def health_check():
    """Check if AI service is properly configured"""
    api_key = os.getenv("GOOGLE_AI_API_KEY")
    dev_mode = os.getenv("DEVELOPMENT_MODE", "false").lower() == "true"
    
    return {
        "configured": bool(api_key),
        "service": "Google Gemini",
        "status": "ready" if api_key else "not_configured",
        "development_mode": dev_mode,
        "note": "Development mode returns preview data without calling AI API" if dev_mode else None
    }
