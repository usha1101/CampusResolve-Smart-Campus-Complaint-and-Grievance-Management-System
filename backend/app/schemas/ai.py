from typing import Optional
from pydantic import BaseModel, Field


class GeminiTriageOutput(BaseModel):
    summary: str = Field(description="A concise 2-sentence summary of the grievance")
    suggested_category: str = Field(description="Predicted category e.g. Maintenance, IT, Hostel, Academic")
    suggested_department_code: Optional[str] = Field(None, description="Department code e.g. IT, ELEC, HST, ACAD")
    confidence_score: float = Field(0.8, ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")


class GeminiDraftAnalysisRequest(BaseModel):
    title: str = Field(..., min_length=3)
    description: str = Field(..., min_length=5)


class GeminiDraftAnalysisResponse(BaseModel):
    summary: str
    suggested_category: str
    suggested_department_code: Optional[str] = None
    confidence_score: float
