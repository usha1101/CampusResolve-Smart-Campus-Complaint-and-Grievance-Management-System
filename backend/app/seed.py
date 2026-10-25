"""
Demo Data Seeder for CampusResolve.
Populates standard accounts for all 3 roles, active departments, and realistic sample grievances.
Usage: python -m app.seed
"""

from datetime import datetime, timezone, timedelta
from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.department import Department
from app.models.user import User, UserRole
from app.models.complaint import Complaint, ComplaintStatus, ComplaintPriority
from app.models.status_history import ComplaintStatusHistory
from app.models.feedback import Feedback
from app.services.department_service import DepartmentService
from app.utils.code_generator import generate_complaint_number


def seed_database():
    print("[INFO] Seeding database with demo data...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Departments
        DepartmentService.seed_default_departments(db)
        it_dept = db.query(Department).filter(Department.code == "IT").first()
        maint_dept = db.query(Department).filter(Department.code == "MAINT").first()
        elec_dept = db.query(Department).filter(Department.code == "ELEC").first()
        hostel_dept = db.query(Department).filter(Department.code == "HOSTEL").first()

        # 2. Seed Users
        users_data = [
            {
                "email": "admin@campus.edu",
                "password": "AdminPass123!",
                "full_name": "Dean of Administration",
                "role": UserRole.ADMIN.value,
                "dept": None,
                "phone": "+1-555-0100"
            },
            {
                "email": "it.staff@campus.edu",
                "password": "StaffPass123!",
                "full_name": "Alex Vance (IT Lead)",
                "role": UserRole.DEPT_STAFF.value,
                "dept": it_dept,
                "phone": "+1-555-0101"
            },
            {
                "email": "maint.staff@campus.edu",
                "password": "StaffPass123!",
                "full_name": "Carlos Gomez (Facilities)",
                "role": UserRole.DEPT_STAFF.value,
                "dept": maint_dept,
                "phone": "+1-555-0102"
            },
            {
                "email": "student@campus.edu",
                "password": "StudentPass123!",
                "full_name": "Sarah Connor",
                "role": UserRole.STUDENT_STAFF.value,
                "dept": None,
                "phone": "+1-555-0103"
            },
            {
                "email": "student2@campus.edu",
                "password": "StudentPass123!",
                "full_name": "Marcus Wright",
                "role": UserRole.STUDENT_STAFF.value,
                "dept": None,
                "phone": "+1-555-0104"
            }
        ]

        created_users = {}
        for u in users_data:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                user = User(
                    email=u["email"],
                    password_hash=hash_password(u["password"]),
                    full_name=u["full_name"],
                    role=u["role"],
                    department_id=u["dept"].id if u["dept"] else None,
                    phone=u["phone"]
                )
                db.add(user)
                db.flush()
                created_users[u["email"]] = user
            else:
                created_users[u["email"]] = existing

        student = created_users["student@campus.edu"]
        student2 = created_users["student2@campus.edu"]
        admin = created_users["admin@campus.edu"]
        it_staff = created_users["it.staff@campus.edu"]
        maint_staff = created_users["maint.staff@campus.edu"]

        # 3. Seed Realistic Complaints
        sample_complaints = [
            {
                "title": "Hostel Block B 3rd Floor Water Cooler Leaking",
                "desc": "The main drinking water cooler on the 3rd floor hallway has been leaking water across the floor for 2 days. Slipping hazard.",
                "cat": "Plumbing & Sanitation",
                "pri": ComplaintPriority.HIGH.value,
                "status": ComplaintStatus.IN_PROGRESS.value,
                "dept": maint_dept,
                "user": student,
                "ai_summary": "Active water leak at Hostel Block B 3rd floor cooler presenting a slipping hazard.",
                "ai_cat": "Facilities & Plumbing",
                "ai_dept": maint_dept,
                "hours_ago": 18,
                "history": [
                    ("SUBMITTED", None, student, "Submitted via student portal."),
                    ("IN_PROGRESS", "SUBMITTED", maint_staff, "Assigned to plumbing maintenance team. Parts sourced.")
                ]
            },
            {
                "title": "CS Lab 2 High-Latency Wi-Fi & Drops",
                "desc": "During afternoon coding sessions in CS Lab 2, Wi-Fi latency exceeds 800ms and disconnects repeatedly. Impairs practical examinations.",
                "cat": "Internet / Connectivity",
                "pri": ComplaintPriority.URGENT.value,
                "status": ComplaintStatus.RESOLVED.value,
                "dept": it_dept,
                "user": student,
                "ai_summary": "High Wi-Fi latency and dropouts in CS Lab 2 during lab sessions.",
                "ai_cat": "IT & Networking",
                "ai_dept": it_dept,
                "hours_ago": 48,
                "resolved_hours_ago": 12,
                "history": [
                    ("SUBMITTED", None, student, "Reported by class representative."),
                    ("IN_PROGRESS", "SUBMITTED", admin, "Routed to network engineering team."),
                    ("RESOLVED", "IN_PROGRESS", it_staff, "Replaced failed Cisco AP in Lab 2 and adjusted channel 6 interference.")
                ],
                "feedback": {
                    "rating": 5,
                    "comments": "The internet is super fast now, thanks team!"
                }
            },
            {
                "title": "Lecture Hall 101 Projector Display Flicker",
                "desc": "The digital projector in LH 101 exhibits severe green discoloration and flicker every few seconds when connected to HDMI.",
                "cat": "Classroom Equipment",
                "pri": ComplaintPriority.MEDIUM.value,
                "status": ComplaintStatus.SUBMITTED.value,
                "dept": None,
                "user": student2,
                "ai_summary": "HDMI projector in Lecture Hall 101 has green tint and flickering display.",
                "ai_cat": "Classroom AV",
                "ai_dept": it_dept,
                "hours_ago": 3,
                "history": [
                    ("SUBMITTED", None, student2, "Submitted after morning Physics lecture.")
                ]
            },
            {
                "title": "Request to paint dorm walls purple",
                "desc": "Can someone please repaint my single room dorm walls purple? I dislike the standard off-white color.",
                "cat": "General Request",
                "pri": ComplaintPriority.LOW.value,
                "status": ComplaintStatus.REJECTED.value,
                "dept": maint_dept,
                "user": student2,
                "ai_summary": "Student requesting custom wall paint color in dorm room.",
                "ai_cat": "Hostel Policy",
                "ai_dept": hostel_dept,
                "hours_ago": 36,
                "history": [
                    ("SUBMITTED", None, student2, "Initial submission."),
                    ("REJECTED", "SUBMITTED", admin, "Campus policy restricts custom wall painting in student residences.")
                ]
            }
        ]

        now = datetime.now(timezone.utc)
        for sc in sample_complaints:
            exists = db.query(Complaint).filter(Complaint.title == sc["title"]).first()
            if not exists:
                created_time = now - timedelta(hours=sc["hours_ago"])
                resolved_time = now - timedelta(hours=sc.get("resolved_hours_ago", 0)) if sc.get("resolved_hours_ago") else None

                complaint = Complaint(
                    complaint_number=generate_complaint_number(db),
                    submitted_by_id=sc["user"].id,
                    department_id=sc["dept"].id if sc["dept"] else None,
                    title=sc["title"],
                    description=sc["desc"],
                    category=sc["cat"],
                    priority=sc["pri"],
                    status=sc["status"],
                    ai_summary=sc["ai_summary"],
                    ai_suggested_category=sc["ai_cat"],
                    ai_suggested_dept_id=sc["ai_dept"].id if sc["ai_dept"] else None,
                    ai_confidence_score=0.92,
                    resolved_at=resolved_time,
                    created_at=created_time,
                    updated_at=now
                )
                db.add(complaint)
                db.flush()

                for h_status, h_old, h_user, h_notes in sc["history"]:
                    hist = ComplaintStatusHistory(
                        complaint_id=complaint.id,
                        old_status=h_old,
                        new_status=h_status,
                        changed_by_id=h_user.id,
                        notes=h_notes,
                        created_at=created_time
                    )
                    db.add(hist)

                if "feedback" in sc and sc["feedback"]:
                    fb = Feedback(
                        complaint_id=complaint.id,
                        submitted_by_id=sc["user"].id,
                        rating=sc["feedback"]["rating"],
                        comments=sc["feedback"]["comments"],
                        created_at=resolved_time + timedelta(hours=1) if resolved_time else now
                    )
                    db.add(fb)

        db.commit()
        print("[SUCCESS] Demo data seeded successfully!")
        print("\nDemo Credentials:")
        print("  - Administrator:    admin@campus.edu      / AdminPass123!")
        print("  - IT Dept Staff:    it.staff@campus.edu   / StaffPass123!")
        print("  - Maint Dept Staff: maint.staff@campus.edu / StaffPass123!")
        print("  - Student:          student@campus.edu    / StudentPass123!")
        print("  - Student 2:        student2@campus.edu   / StudentPass123!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
