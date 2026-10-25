from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.complaint import ComplaintPriority, ComplaintStatus
from app.schemas.user import UserResponse
from app.schemas.department import DepartmentResponse
from app.schemas.feedback import FeedbackResponse


class AttachmentResponse(BaseModel):
    id: str
    complaint_id: str
    file_name: str
    file_url: str
    file_type: str
    file_size_bytes: int
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StatusHistoryResponse(BaseModel):
    id: str
    old_status: Optional[str] = None
    new_status: str
    changed_by_id: str
    changed_by: Optional[UserResponse] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ComplaintCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10)
    category: str = Field(..., min_length=2, max_length=80)
    priority: ComplaintPriority = ComplaintPriority.MEDIUM


class ComplaintStatusUpdate(BaseModel):
    new_status: ComplaintStatus
    notes: Optional[str] = Field(None, description="Mandatory for REJECTED and RESOLVED transitions")


class ComplaintAssign(BaseModel):
    department_id: str


class ComplaintSummaryResponse(BaseModel):
    id: str
    complaint_number: str
    title: str
    category: str
    priority: ComplaintPriority
    status: ComplaintStatus
    department_id: Optional[str] = None
    department: Optional[DepartmentResponse] = None
    submitted_by_id: str
    submitted_by: Optional[UserResponse] = None
    ai_summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ComplaintDetailResponse(ComplaintSummaryResponse):
    description: str
    ai_suggested_category: Optional[str] = None
    ai_suggested_dept_id: Optional[str] = None
    ai_suggested_department: Optional[DepartmentResponse] = None
    ai_confidence_score: Optional[float] = None
    attachments: List[AttachmentResponse] = []
    status_history: List[StatusHistoryResponse] = []
    feedback: Optional[FeedbackResponse] = None

    model_config = ConfigDict(from_attributes=True)


class PaginatedComplaintsResponse(BaseModel):
    items: List[ComplaintSummaryResponse]
    total: int
    page: int
    size: int
    pages: int
