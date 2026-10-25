import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import create_access_token, hash_password
from app.main import app
from app.models.user import User, UserRole
from app.models.department import Department
from app.services.department_service import DepartmentService

# Use isolated SQLite in-memory database with StaticPool so all threads share the same in-memory DB
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create fresh database tables for every test function and tear down after."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Seed default departments
    DepartmentService.seed_default_departments(db)

    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient with overridden get_db dependency pointing to test database."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def seed_users(db_session):
    """Seed test users for Student, Administrator, and Department Staff roles."""
    it_dept = db_session.query(Department).filter(Department.code == "IT").first()

    student = User(
        email="student@campus.edu",
        password_hash=hash_password("StudentPass123!"),
        full_name="Alex Student",
        role=UserRole.STUDENT_STAFF.value,
    )
    admin = User(
        email="admin@campus.edu",
        password_hash=hash_password("AdminPass123!"),
        full_name="Chief Admin",
        role=UserRole.ADMIN.value,
    )
    dept_staff = User(
        email="it.staff@campus.edu",
        password_hash=hash_password("StaffPass123!"),
        full_name="David Tech",
        role=UserRole.DEPT_STAFF.value,
        department_id=it_dept.id if it_dept else None,
    )

    db_session.add_all([student, admin, dept_staff])
    db_session.commit()
    db_session.refresh(student)
    db_session.refresh(admin)
    db_session.refresh(dept_staff)

    return {
        "student": student,
        "admin": admin,
        "dept_staff": dept_staff,
        "it_dept": it_dept,
    }


@pytest.fixture
def student_auth_headers(seed_users):
    user = seed_users["student"]
    token = create_access_token(subject=user.id, role=user.role)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_auth_headers(seed_users):
    user = seed_users["admin"]
    token = create_access_token(subject=user.id, role=user.role)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def dept_staff_auth_headers(seed_users):
    user = seed_users["dept_staff"]
    token = create_access_token(subject=user.id, role=user.role)
    return {"Authorization": f"Bearer {token}"}
