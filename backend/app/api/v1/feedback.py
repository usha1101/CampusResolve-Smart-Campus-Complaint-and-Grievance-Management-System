from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.services.feedback_service import FeedbackService

router = APIRouter(prefix="/complaints", tags=["Feedback"])


@router.post("/{id}/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_complaint_feedback(
    id: str,
    feedback_in: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit satisfaction rating and comments after a grievance is marked Resolved.
    Restricted to the student/staff member who originally filed the ticket.
    """
    feedback = FeedbackService.submit_feedback(db, id, feedback_in, current_user)
    return FeedbackResponse.model_validate(feedback)


@router.get("/{id}/feedback", response_model=FeedbackResponse)
def get_complaint_feedback(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """View rating and comments left for a resolved complaint."""
    feedback = FeedbackService.get_feedback(db, id)
    return FeedbackResponse.model_validate(feedback)
