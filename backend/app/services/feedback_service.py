from sqlalchemy.orm import Session
from app.core.exceptions import (
    EntityNotFoundException,
    PermissionDeniedException,
    DuplicateResourceException,
    InvalidStatusTransitionException,
)
from app.models.user import User
from app.models.complaint import Complaint, ComplaintStatus
from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate


class FeedbackService:
    @staticmethod
    def submit_feedback(
        db: Session,
        complaint_id: str,
        feedback_in: FeedbackCreate,
        current_user: User
    ) -> Feedback:
        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            raise EntityNotFoundException("Complaint", complaint_id)

        # Only the student who submitted the complaint can leave feedback
        if complaint.submitted_by_id != current_user.id:
            raise PermissionDeniedException("Only the author of this complaint can submit feedback.")

        # Feedback is only allowed on RESOLVED complaints
        if complaint.status != ComplaintStatus.RESOLVED.value:
            raise InvalidStatusTransitionException(
                complaint.status,
                "FEEDBACK_SUBMITTED",
                reason="Feedback can only be submitted after the complaint is marked Resolved."
            )

        # Check duplicate feedback
        existing = db.query(Feedback).filter(Feedback.complaint_id == complaint_id).first()
        if existing:
            raise DuplicateResourceException("Feedback", "complaint_id")

        feedback = Feedback(
            complaint_id=complaint_id,
            submitted_by_id=current_user.id,
            rating=feedback_in.rating,
            comments=feedback_in.comments.strip() if feedback_in.comments else None,
        )
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        return feedback

    @staticmethod
    def get_feedback(db: Session, complaint_id: str) -> Feedback:
        feedback = db.query(Feedback).filter(Feedback.complaint_id == complaint_id).first()
        if not feedback:
            raise EntityNotFoundException("Feedback for complaint", complaint_id)
        return feedback
