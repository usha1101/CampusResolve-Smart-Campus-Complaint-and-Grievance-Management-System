import uuid
from datetime import datetime, timezone
import enum
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserRole(str, enum.Enum):
    STUDENT_STAFF = "STUDENT_STAFF"
    ADMIN = "ADMIN"
    DEPT_STAFF = "DEPT_STAFF"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(120), nullable=False)
    role = Column(String(30), default=UserRole.STUDENT_STAFF.value, nullable=False, index=True)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    department = relationship("Department", back_populates="staff_members")
    submitted_complaints = relationship(
        "Complaint",
        back_populates="submitted_by",
        foreign_keys="Complaint.submitted_by_id"
    )
    status_updates = relationship("ComplaintStatusHistory", back_populates="changed_by")
    feedbacks = relationship("Feedback", back_populates="submitted_by")

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role})>"
