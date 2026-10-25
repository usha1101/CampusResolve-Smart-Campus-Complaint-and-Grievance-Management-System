from typing import List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.complaint import Complaint, ComplaintStatus, ComplaintPriority
from app.models.department import Department
from app.schemas.analytics import AnalyticsOverviewResponse, DepartmentMetricsResponse


class AnalyticsService:
    @staticmethod
    def get_overview(db: Session) -> AnalyticsOverviewResponse:
        total = db.query(Complaint).count()

        # Status breakdown
        status_counts: Dict[str, int] = {s.value: 0 for s in ComplaintStatus}
        status_rows = db.query(Complaint.status, func.count(Complaint.id)).group_by(Complaint.status).all()
        for status, count in status_rows:
            status_counts[status] = count

        # Priority breakdown
        priority_counts: Dict[str, int] = {p.value: 0 for p in ComplaintPriority}
        priority_rows = db.query(Complaint.priority, func.count(Complaint.id)).group_by(Complaint.priority).all()
        for priority, count in priority_rows:
            priority_counts[priority] = count

        # Calculate average resolution time for resolved complaints
        resolved_complaints = db.query(Complaint.created_at, Complaint.resolved_at).filter(
            Complaint.status == ComplaintStatus.RESOLVED.value,
            Complaint.resolved_at.isnot(None)
        ).all()

        avg_hours = None
        if resolved_complaints:
            total_seconds = sum((r.resolved_at - r.created_at).total_seconds() for r in resolved_complaints)
            avg_hours = round(total_seconds / (len(resolved_complaints) * 3600), 1)

        # Department metrics
        departments = db.query(Department).all()
        dept_summaries: List[DepartmentMetricsResponse] = []

        for d in departments:
            d_total = db.query(Complaint).filter(Complaint.department_id == d.id).count()
            d_resolved = db.query(Complaint).filter(
                Complaint.department_id == d.id,
                Complaint.status == ComplaintStatus.RESOLVED.value
            ).count()
            d_open = d_total - d_resolved

            # Department avg resolution hours
            d_resolved_rows = db.query(Complaint.created_at, Complaint.resolved_at).filter(
                Complaint.department_id == d.id,
                Complaint.status == ComplaintStatus.RESOLVED.value,
                Complaint.resolved_at.isnot(None)
            ).all()

            d_avg_hours = None
            if d_resolved_rows:
                d_sec = sum((r.resolved_at - r.created_at).total_seconds() for r in d_resolved_rows)
                d_avg_hours = round(d_sec / (len(d_resolved_rows) * 3600), 1)

            dept_summaries.append(
                DepartmentMetricsResponse(
                    department_id=d.id,
                    department_name=d.name,
                    department_code=d.code,
                    total_complaints=d_total,
                    open_complaints=d_open,
                    resolved_complaints=d_resolved,
                    avg_resolution_hours=d_avg_hours
                )
            )

        return AnalyticsOverviewResponse(
            total_complaints=total,
            status_breakdown=status_counts,
            priority_breakdown=priority_counts,
            avg_resolution_hours=avg_hours,
            departments_summary=dept_summaries
        )
