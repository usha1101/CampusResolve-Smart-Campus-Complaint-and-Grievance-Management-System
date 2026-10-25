import uuid
from datetime import datetime, timezone
import enum
from sqlalchemy import Column, String, Text, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class ComplaintStatus(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"


class ComplaintPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_number = Column(String(32), unique=True, nullable=False, index=True)
    submitted_by_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(80), nullable=False)
    priority = Column(String(20), default=ComplaintPriority.MEDIUM.value, nullable=False)
    status = Column(String(30), default=ComplaintStatus.SUBMITTED.value, nullable=False, index=True)

    # AI Triage & Suggestion Fields
    ai_summary = Column(Text, nullable=True)
    ai_suggested_category = Column(String(80), nullable=True)
    ai_suggested_dept_id = Column(String(36), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    ai_confidence_score = Column(Float, nullable=True)

    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    submitted_by = relationship("User", back_populates="submitted_complaints", foreign_keys=[submitted_by_id])
    department = relationship("Department", back_populates="complaints", foreign_keys=[department_id])
    ai_suggested_department = relationship(
        "Department",
        back_populates="ai_suggested_complaints",
        foreign_keys=[ai_suggested_dept_id]
    )
    attachments = relationship(
        "ComplaintAttachment",
        back_populates="complaint",
        cascade="all, delete-orphan",
        order_by="ComplaintAttachment.uploaded_at.desc()"
    )
    status_history = relationship(
        "ComplaintStatusHistory",
        back_populates="complaint",
        cascade="all, delete-orphan",
        order_by="ComplaintStatusHistory.created_at.asc()"
    )
    feedback = relationship("Feedback", back_populates="complaint", uselist=False, cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Complaint {self.complaint_number} - {self.status}>"
