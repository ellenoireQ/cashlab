from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime


class SaveAnalysisRequest(BaseModel):
    """Request model for saving analysis results"""
    analysis_type: str  # "anomaly", "overview", "trend", etc.
    team_id: str
    team_name: str
    data: dict[str, Any]  # The actual analysis data
    metadata: Optional[dict[str, Any]] = None


class AnalysisRecord(BaseModel):
    """Response model for saved analysis"""
    id: str
    team_id: str
    team_name: str
    analysis_type: str
    data: dict[str, Any]
    metadata: Optional[dict[str, Any]]
    created_at: str
    updated_at: str


class SaveAnalysisResponse(BaseModel):
    """Response for save operation"""
    success: bool
    message: str
    record: Optional[AnalysisRecord] = None
    error: Optional[str] = None


class GetAnalysisResponse(BaseModel):
    """Response for retrieving analysis"""
    success: bool
    records: list[AnalysisRecord] = []
    count: int = 0
