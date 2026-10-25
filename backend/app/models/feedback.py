import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    submitted_by_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    rating = Column(Integer, nullable=False)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_feedback_rating_range"),
    )

    # Relationships
    complaint = relationship("Complaint", back_populates="feedback")
    submitted_by = relationship("User", back_populates="feedbacks")

    def __repr__(self) -> str:
        return f"<Feedback {self.rating} stars for Complaint {self.complaint_id}>"
