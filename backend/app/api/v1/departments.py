from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.schemas.department import DepartmentCreate, DepartmentResponse
from app.services.department_service import DepartmentService

router = APIRouter(prefix="/departments", tags=["Departments"])


@router.get("/", response_model=List[DepartmentResponse])
def get_departments(
    is_active: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List campus operational departments for selection."""
    departments = DepartmentService.list_departments(db, is_active=is_active)
    return [DepartmentResponse.model_validate(d) for d in departments]


@router.post("/", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(
    dept_in: DepartmentCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    """Create a new campus department (Administrator only)."""
    dept = DepartmentService.create_department(db, dept_in)
    return DepartmentResponse.model_validate(dept)
