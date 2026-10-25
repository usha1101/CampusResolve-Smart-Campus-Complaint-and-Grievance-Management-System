import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False, index=True)
    code = Column(String(20), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    staff_members = relationship("User", back_populates="department")
    complaints = relationship("Complaint", back_populates="department", foreign_keys="Complaint.department_id")
    ai_suggested_complaints = relationship(
        "Complaint",
        back_populates="ai_suggested_department",
        foreign_keys="Complaint.ai_suggested_dept_id"
    )

    def __repr__(self) -> str:
        return f"<Department {self.code}: {self.name}>"
