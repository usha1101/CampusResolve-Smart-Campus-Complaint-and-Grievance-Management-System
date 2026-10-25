import random
import string
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.complaint import Complaint


def generate_complaint_number(db: Session) -> str:
    """
    Generates a unique, human-readable complaint tracking identifier.
    Format: CMP-YYYYMM-XXXX (e.g. CMP-202610-4821)
    """
    now = datetime.now(timezone.utc)
    prefix = f"CMP-{now.strftime('%Y%m')}-"
    
    for _ in range(10):
        # Generate 4 random uppercase alphanumeric characters (excluding confusing 0/O, 1/I)
        suffix = "".join(random.choices("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", k=4))
        candidate = f"{prefix}{suffix}"
        
        # Check collision in database
        exists = db.query(Complaint.id).filter(Complaint.complaint_number == candidate).first()
        if not exists:
            return candidate

    # Fallback with timestamp microsecond
    return f"{prefix}{now.strftime('%f')[:4]}"
