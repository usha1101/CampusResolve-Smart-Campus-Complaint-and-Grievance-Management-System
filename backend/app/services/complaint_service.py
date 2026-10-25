from datetime import datetime, timezone
import math
import os
import uuid
from typing import Optional, List, Dict, Any, Tuple
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.exceptions import (
    EntityNotFoundException,
    PermissionDeniedException,
    InvalidStatusTransitionException,
)
from app.models.user import User, UserRole
from app.models.department import Department
from app.models.complaint import Complaint, ComplaintStatus, ComplaintPriority
from app.models.status_history import ComplaintStatusHistory
from app.models.attachment import ComplaintAttachment
from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintStatusUpdate,
    PaginatedComplaintsResponse,
    ComplaintSummaryResponse,
)
from app.utils.code_generator import generate_complaint_number
from app.services.gemini_service import GeminiService
from app.services.storage_service import StorageService, UPLOAD_DIR


class ComplaintService:
    @staticmethod
    def create_complaint(
        db: Session,
        complaint_in: ComplaintCreate,
        current_user: User,
        image_file: Optional[UploadFile] = None
    ) -> Complaint:
        """
        Creates a new complaint, generates a unique tracking number,
        runs defensive Gemini AI triage, stores optional photo evidence,
        and records initial history.
        """
        # 1. If photo evidence is provided, validate it strictly before modifying DB
        image_content = None
        safe_ext = None
        mime_type = None
        if image_file and hasattr(image_file, "filename") and image_file.filename:
            image_content, safe_ext, mime_type = StorageService.validate_image_file(image_file)

        complaint_number = generate_complaint_number(db)

        # Retrieve active department codes for AI context
        active_depts = db.query(Department).filter(Department.is_active == True).all()
        dept_code_map = {d.code: d.id for d in active_depts}
        available_codes = list(dept_code_map.keys())

        # Perform AI triage (never crashes complaint creation on failure)
        ai_triage = GeminiService.analyze_complaint(
            title=complaint_in.title,
            description=complaint_in.description,
            available_dept_codes=available_codes
        )

        ai_dept_id = None
        if ai_triage.suggested_department_code in dept_code_map:
            ai_dept_id = dept_code_map[ai_triage.suggested_department_code]

        complaint = Complaint(
            complaint_number=complaint_number,
            submitted_by_id=current_user.id,
            title=complaint_in.title.strip(),
            description=complaint_in.description.strip(),
            category=complaint_in.category.strip(),
            priority=complaint_in.priority.value if isinstance(complaint_in.priority, ComplaintPriority) else str(complaint_in.priority),
            status=ComplaintStatus.SUBMITTED.value,
            ai_summary=ai_triage.summary,
            ai_suggested_category=ai_triage.suggested_category,
            ai_suggested_dept_id=ai_dept_id,
            ai_confidence_score=ai_triage.confidence_score,
        )
        db.add(complaint)
        db.flush()

        # Add initial audit log
        history_entry = ComplaintStatusHistory(
            complaint_id=complaint.id,
            old_status=None,
            new_status=ComplaintStatus.SUBMITTED.value,
            changed_by_id=current_user.id,
            notes="Grievance initially submitted by user."
        )
        db.add(history_entry)

        # 2. Store attachment if provided
        if image_content and safe_ext and mime_type and image_file:
            attachment_id = str(uuid.uuid4())
            try:
                storage_rel_path, stored_filename = StorageService.save_image(
                    complaint_id=complaint.id,
                    original_filename=image_file.filename,
                    content=image_content,
                    mime_type=mime_type,
                    safe_ext=safe_ext,
                    custom_file_id=attachment_id
                )
                attachment = ComplaintAttachment(
                    id=attachment_id,
                    complaint_id=complaint.id,
                    file_name=os.path.basename(image_file.filename),
                    file_url=f"/api/v1/complaints/{complaint.id}/attachments/{attachment_id}/file",
                    file_type=mime_type,
                    file_size_bytes=len(image_content),
                )
                db.add(attachment)
            except Exception as e:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to store complaint photo attachment: {str(e)}"
                )

        db.commit()
        db.refresh(complaint)
        return complaint

    @staticmethod
    def get_by_id(db: Session, complaint_id: str, current_user: User) -> Complaint:
        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            raise EntityNotFoundException("Complaint", complaint_id)

        # Role-based object access check
        if current_user.role == UserRole.STUDENT_STAFF.value:
            if complaint.submitted_by_id != current_user.id:
                raise PermissionDeniedException("You can only view your own complaints.")
        elif current_user.role == UserRole.DEPT_STAFF.value:
            # Department staff can only access complaints assigned to their department
            if complaint.department_id != current_user.department_id:
                raise PermissionDeniedException("Complaint is not assigned to your department.")

        return complaint

    @staticmethod
    def list_complaints(
        db: Session,
        current_user: User,
        page: int = 1,
        size: int = 10,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        department_id: Optional[str] = None,
        search: Optional[str] = None,
        my_only: bool = False,
    ) -> PaginatedComplaintsResponse:
        query = db.query(Complaint)

        # Access Scope Filtering
        if current_user.role == UserRole.STUDENT_STAFF.value or my_only:
            query = query.filter(Complaint.submitted_by_id == current_user.id)
        elif current_user.role == UserRole.DEPT_STAFF.value:
            query = query.filter(Complaint.department_id == current_user.department_id)
        elif current_user.role == UserRole.ADMIN.value:
            if department_id:
                query = query.filter(Complaint.department_id == department_id)

        # Attribute Filters
        if status:
            query = query.filter(Complaint.status == status.upper())
        if priority:
            query = query.filter(Complaint.priority == priority.upper())
        if search:
            search_term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Complaint.complaint_number.ilike(search_term),
                    Complaint.title.ilike(search_term),
                    Complaint.description.ilike(search_term),
                    Complaint.category.ilike(search_term)
                )
            )

        total = query.count()
        pages = math.ceil(total / size) if total > 0 else 1
        items = query.order_by(Complaint.created_at.desc()).offset((page - 1) * size).limit(size).all()

        return PaginatedComplaintsResponse(
            items=[ComplaintSummaryResponse.model_validate(c) for c in items],
            total=total,
            page=page,
            size=size,
            pages=pages,
        )

    @staticmethod
    def assign_department(
        db: Session,
        complaint_id: str,
        department_id: str,
        admin_user: User
    ) -> Complaint:
        """Assigns a complaint to a specific campus department (Admin only)."""
        if admin_user.role != UserRole.ADMIN.value:
            raise PermissionDeniedException("Only Administrators can assign departments.")

        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            raise EntityNotFoundException("Complaint", complaint_id)

        dept = db.query(Department).filter(Department.id == department_id).first()
        if not dept:
            raise EntityNotFoundException("Department", department_id)

        old_dept_name = complaint.department.name if complaint.department else "Unassigned"
        complaint.department_id = department_id
        
        # Log history remark
        history_entry = ComplaintStatusHistory(
            complaint_id=complaint.id,
            old_status=complaint.status,
            new_status=complaint.status,
            changed_by_id=admin_user.id,
            notes=f"Department changed from '{old_dept_name}' to '{dept.name}'."
        )
        db.add(history_entry)

        db.commit()
        db.refresh(complaint)
        return complaint

    @staticmethod
    def transition_status(
        db: Session,
        complaint_id: str,
        status_update: ComplaintStatusUpdate,
        current_user: User
    ) -> Complaint:
        """
        Validates and transitions complaint status through the strict state machine:
        - SUBMITTED -> IN_PROGRESS (Admin or assigned Dept Staff; requires department assigned)
        - SUBMITTED -> REJECTED (Admin only, requires notes)
        - IN_PROGRESS -> RESOLVED (Admin or assigned Dept Staff; requires notes)
        - IN_PROGRESS -> REJECTED (Admin only, requires notes)
        """
        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            raise EntityNotFoundException("Complaint", complaint_id)

        current_status = complaint.status
        target_status = status_update.new_status.value if isinstance(status_update.new_status, ComplaintStatus) else str(status_update.new_status)
        notes = status_update.notes.strip() if status_update.notes else ""

        # Identity / Role checks
        is_admin = current_user.role == UserRole.ADMIN.value
        is_assigned_staff = (
            current_user.role == UserRole.DEPT_STAFF.value
            and complaint.department_id == current_user.department_id
        )

        if not (is_admin or is_assigned_staff):
            raise PermissionDeniedException("You do not have permission to change this complaint's status.")

        # Terminal state check
        if current_status in [ComplaintStatus.RESOLVED.value, ComplaintStatus.REJECTED.value]:
            raise InvalidStatusTransitionException(
                current_status,
                target_status,
                reason=f"Complaint is in a terminal state ({current_status}) and cannot be modified."
            )

        # Transition Rule Validation
        if current_status == ComplaintStatus.SUBMITTED.value:
            if target_status == ComplaintStatus.IN_PROGRESS.value:
                if not complaint.department_id:
                    raise InvalidStatusTransitionException(
                        current_status,
                        target_status,
                        reason="Complaint must be assigned to a department before moving to In Progress."
                    )
            elif target_status == ComplaintStatus.REJECTED.value:
                if not is_admin:
                    raise PermissionDeniedException("Only Administrators can reject complaints.")
                if not notes:
                    raise InvalidStatusTransitionException(
                        current_status,
                        target_status,
                        reason="Rejection reason notes are mandatory."
                    )
            else:
                raise InvalidStatusTransitionException(current_status, target_status)

        elif current_status == ComplaintStatus.IN_PROGRESS.value:
            if target_status == ComplaintStatus.RESOLVED.value:
                if not notes:
                    raise InvalidStatusTransitionException(
                        current_status,
                        target_status,
                        reason="Resolution notes explaining the fix are mandatory."
                    )
                complaint.resolved_at = datetime.now(timezone.utc)
            elif target_status == ComplaintStatus.REJECTED.value:
                if not is_admin:
                    raise PermissionDeniedException("Only Administrators can reject complaints.")
                if not notes:
                    raise InvalidStatusTransitionException(
                        current_status,
                        target_status,
                        reason="Rejection reason notes are mandatory."
                    )
            else:
                raise InvalidStatusTransitionException(current_status, target_status)
        else:
            raise InvalidStatusTransitionException(current_status, target_status)

        # Commit status transition
        complaint.status = target_status
        history_entry = ComplaintStatusHistory(
            complaint_id=complaint.id,
            old_status=current_status,
            new_status=target_status,
            changed_by_id=current_user.id,
            notes=notes if notes else f"Status transitioned to {target_status}."
        )
        db.add(history_entry)

        db.commit()
        db.refresh(complaint)
        return complaint

    @staticmethod
    def add_attachment(
        db: Session,
        complaint_id: str,
        file_name: str,
        file_url: str,
        file_type: str,
        file_size_bytes: int
    ) -> ComplaintAttachment:
        attachment = ComplaintAttachment(
            complaint_id=complaint_id,
            file_name=file_name,
            file_url=file_url,
            file_type=file_type,
            file_size_bytes=file_size_bytes,
        )
        db.add(attachment)
        db.commit()
        db.refresh(attachment)
        return attachment

    @staticmethod
    def get_attachment(
        db: Session,
        complaint_id: str,
        attachment_id: str,
        current_user: User
    ) -> Tuple[ComplaintAttachment, Optional[str], Optional[str]]:
        """
        Retrieves attachment with strict object-level access control:
        - Students can only view attachments on their own complaints.
        - Dept Staff can only view attachments for complaints assigned to their department.
        - Admins can view all attachments.
        Returns (attachment, local_file_path_or_none, signed_url_or_none).
        """
        complaint = ComplaintService.get_by_id(db, complaint_id, current_user)

        attachment = db.query(ComplaintAttachment).filter(
            ComplaintAttachment.id == attachment_id,
            ComplaintAttachment.complaint_id == complaint.id
        ).first()

        if not attachment:
            raise EntityNotFoundException("Attachment", attachment_id)

        # Check for Supabase signed URL
        signed_url = None
        ext_map = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
        safe_ext = ext_map.get(attachment.file_type, ".jpg")
        rel_storage_path = f"complaints/{complaint.id}/{attachment.id}{safe_ext}"

        if StorageService.is_supabase_configured():
            signed_url = StorageService.generate_signed_url(rel_storage_path)

        # Check local file
        local_path = None
        complaint_dir = os.path.join(UPLOAD_DIR, "complaints", complaint.id)
        if os.path.isdir(complaint_dir):
            for fname in os.listdir(complaint_dir):
                if fname.startswith(attachment.id):
                    candidate = os.path.join(complaint_dir, fname)
                    if os.path.isfile(candidate):
                        local_path = candidate
                        break

        return attachment, local_path, signed_url

