from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.exceptions import DuplicateResourceException, EntityNotFoundException
from app.models.department import Department
from app.schemas.department import DepartmentCreate, DepartmentUpdate


class DepartmentService:
    @staticmethod
    def list_departments(db: Session, is_active: Optional[bool] = None) -> List[Department]:
        query = db.query(Department)
        if is_active is not None:
            query = query.filter(Department.is_active == is_active)
        return query.order_by(Department.name.asc()).all()

    @staticmethod
    def get_by_id(db: Session, dept_id: str) -> Department:
        dept = db.query(Department).filter(Department.id == dept_id).first()
        if not dept:
            raise EntityNotFoundException("Department", dept_id)
        return dept

    @staticmethod
    def get_by_code(db: Session, code: str) -> Optional[Department]:
        return db.query(Department).filter(Department.code == code.upper().strip()).first()

    @staticmethod
    def create_department(db: Session, dept_in: DepartmentCreate) -> Department:
        existing_code = DepartmentService.get_by_code(db, dept_in.code)
        if existing_code:
            raise DuplicateResourceException("Department", "code")

        existing_name = db.query(Department).filter(Department.name == dept_in.name.strip()).first()
        if existing_name:
            raise DuplicateResourceException("Department", "name")

        dept = Department(
            name=dept_in.name.strip(),
            code=dept_in.code.upper().strip(),
            description=dept_in.description.strip() if dept_in.description else None,
            is_active=dept_in.is_active,
        )
        db.add(dept)
        db.commit()
        db.refresh(dept)
        return dept

    @staticmethod
    def seed_default_departments(db: Session) -> None:
        """Seed standard campus departments if table is empty."""
        defaults = [
            {"code": "IT", "name": "Information Technology Services", "description": "Campus Wi-Fi, lab computers, classroom projectors, smart boards"},
            {"code": "MAINT", "name": "Campus Facilities & Maintenance", "description": "Plumbing, furniture, civil repairs, painting, campus cleaning"},
            {"code": "ELEC", "name": "Electrical Infrastructure", "description": "Power outages, lights, fans, air conditioners, switches, generators"},
            {"code": "HOSTEL", "name": "Hostel Administration", "description": "Hostel room fixtures, water supply, laundry, security, mess/dining issues"},
            {"code": "ACAD", "name": "Academic Affairs", "description": "Timetables, course materials, grade grievances, examination inquiries"},
        ]
        for item in defaults:
            if not DepartmentService.get_by_code(db, item["code"]):
                dept = Department(
                    name=item["name"],
                    code=item["code"],
                    description=item["description"],
                    is_active=True,
                )
                db.add(dept)
        db.commit()
