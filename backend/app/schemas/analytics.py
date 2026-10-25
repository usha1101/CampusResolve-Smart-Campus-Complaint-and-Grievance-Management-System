from typing import List, Dict, Optional
from pydantic import BaseModel


class StatusCount(BaseModel):
    status: str
    count: int


class CategoryCount(BaseModel):
    category: str
    count: int


class DepartmentMetricsResponse(BaseModel):
    department_id: str
    department_name: str
    department_code: str
    total_complaints: int
    open_complaints: int
    resolved_complaints: int
    avg_resolution_hours: Optional[float] = None


class AnalyticsOverviewResponse(BaseModel):
    total_complaints: int
    status_breakdown: Dict[str, int]
    priority_breakdown: Dict[str, int]
    avg_resolution_hours: Optional[float] = None
    departments_summary: List[DepartmentMetricsResponse]
