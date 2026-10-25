from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.user import UserResponse


class FeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 (poor) to 5 (excellent)")
    comments: Optional[str] = None


class FeedbackResponse(BaseModel):
    id: str
    complaint_id: str
    submitted_by_id: str
    submitted_by: Optional[UserResponse] = None
    rating: int
    comments: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
