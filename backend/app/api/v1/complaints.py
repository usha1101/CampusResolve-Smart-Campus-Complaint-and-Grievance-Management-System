import os
from typing import Optional
from fastapi import APIRouter, Depends, status, Query, Request, HTTPException
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.core.exceptions import InvalidCredentialsException
from app.api.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.complaint import ComplaintPriority
from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintStatusUpdate,
    ComplaintAssign,
    ComplaintDetailResponse,
    PaginatedComplaintsResponse,
)
from app.services.complaint_service import ComplaintService

router = APIRouter(prefix="/complaints", tags=["Complaints"])


@router.post("/", response_model=ComplaintDetailResponse, status_code=status.HTTP_201_CREATED)
async def submit_complaint(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.STUDENT_STAFF, UserRole.ADMIN]))
):
    """
    Submit a new grievance with optional photo evidence.
    Supports both JSON body and multipart/form-data with optional 'image' file.
    Automatically triggers Google Gemini AI triage in the backend for automated
    categorization, summarization, and suggested department assignment.
    """
    content_type = request.headers.get("content-type", "")
    image_file = None

    if "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        title = form.get("title")
        description = form.get("description")
        category = form.get("category")
        priority_val = form.get("priority", "MEDIUM")

        if not title or not description or not category:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="title, description, and category are required fields."
            )

        try:
            priority = ComplaintPriority(priority_val)
        except ValueError:
            priority = ComplaintPriority.MEDIUM

        complaint_in = ComplaintCreate(
            title=str(title),
            description=str(description),
            category=str(category),
            priority=priority,
        )

        raw_file = form.get("image") or form.get("file")
        if raw_file and hasattr(raw_file, "filename") and raw_file.filename:
            image_file = raw_file
    else:
        body = await request.json()
        complaint_in = ComplaintCreate(**body)

    complaint = ComplaintService.create_complaint(
        db=db,
        complaint_in=complaint_in,
        current_user=current_user,
        image_file=image_file,
    )
    return ComplaintDetailResponse.model_validate(complaint)


@router.get("/my", response_model=PaginatedComplaintsResponse)
def get_my_complaints(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=50),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve complaints submitted by the currently logged-in user."""
    return ComplaintService.list_complaints(
        db=db,
        current_user=current_user,
        page=page,
        size=size,
        status=status,
        priority=priority,
        search=search,
        my_only=True
    )


@router.get("/assigned", response_model=PaginatedComplaintsResponse)
def get_assigned_complaints(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=50),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    dept_user: User = Depends(require_roles([UserRole.DEPT_STAFF, UserRole.ADMIN]))
):
    """Retrieve grievances assigned to the logged-in department staff member's department."""
    return ComplaintService.list_complaints(
        db=db,
        current_user=dept_user,
        page=page,
        size=size,
        status=status,
        priority=priority,
        search=search
    )


@router.get("/", response_model=PaginatedComplaintsResponse)
def list_all_complaints(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=50),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    department_id: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    """List all campus complaints across all departments with rich filters (Administrator only)."""
    return ComplaintService.list_complaints(
        db=db,
        current_user=admin_user,
        page=page,
        size=size,
        status=status,
        priority=priority,
        department_id=department_id,
        search=search
    )


@router.get("/{id}", response_model=ComplaintDetailResponse)
def get_complaint_details(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve complete details for a complaint including attachments,
    audit history timeline, and feedback.
    """
    complaint = ComplaintService.get_by_id(db, id, current_user)
    return ComplaintDetailResponse.model_validate(complaint)


@router.patch("/{id}/assign", response_model=ComplaintDetailResponse)
def assign_department(
    id: str,
    assign_in: ComplaintAssign,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    """Assign or reassign a complaint to an operational department (Administrator only)."""
    complaint = ComplaintService.assign_department(db, id, assign_in.department_id, admin_user)
    return ComplaintDetailResponse.model_validate(complaint)


@router.patch("/{id}/status", response_model=ComplaintDetailResponse)
def update_complaint_status(
    id: str,
    status_update: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.DEPT_STAFF]))
):
    """
    Update complaint status through the strict state machine:
    - SUBMITTED -> IN_PROGRESS
    - IN_PROGRESS -> RESOLVED (Mandatory resolution notes)
    - Any -> REJECTED (Admin only, mandatory rejection notes)
    """
    complaint = ComplaintService.transition_status(db, id, status_update, current_user)
    return ComplaintDetailResponse.model_validate(complaint)


@router.get("/{id}/attachments/{attachment_id}/file")
def get_attachment_file(
    id: str,
    attachment_id: str,
    request: Request,
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Securely serves or redirects to the complaint photo attachment.
    Requires authenticated user (via Authorization Bearer header or ?token= query param).
    Enforces object-level authorization:
    - Complaint owner (Student) can view
    - Assigned Department Staff can view
    - Admin can view
    - Unauthorized access is denied with 403 Forbidden.
    """
    auth_header = request.headers.get("Authorization")
    user = None
    token_str = None
    if auth_header and auth_header.startswith("Bearer "):
        token_str = auth_header[7:]
    elif token:
        token_str = token

    if token_str:
        payload = decode_access_token(token_str)
        if payload and payload.get("sub"):
            user = db.query(User).filter(User.id == payload["sub"]).first()

    if not user:
        raise InvalidCredentialsException("Authentication required to access grievance attachments.")

    attachment, local_path, signed_url = ComplaintService.get_attachment(
        db=db,
        complaint_id=id,
        attachment_id=attachment_id,
        current_user=user
    )

    if signed_url:
        return RedirectResponse(signed_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)

    if local_path and os.path.isfile(local_path):
        return FileResponse(
            local_path,
            media_type=attachment.file_type,
            filename=attachment.file_name
        )

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Attachment file content not found on server."
    )

