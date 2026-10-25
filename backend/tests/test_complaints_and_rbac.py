def test_submit_complaint_and_ai_fallback(client, student_auth_headers):
    payload = {
        "title": "Room 302 Wi-Fi disconnects frequently during online tests",
        "description": "The campus Wi-Fi in Hostel Block C, Room 302 drops connection every 5 minutes. Unable to complete coursework.",
        "category": "Internet / Connectivity",
        "priority": "HIGH"
    }
    response = client.post("/api/v1/complaints/", json=payload, headers=student_auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["status"] == "SUBMITTED"
    assert data["complaint_number"].startswith("CMP-")
    # Verify AI triage produced a summary and suggested IT department
    assert data["ai_summary"] is not None
    assert len(data["status_history"]) == 1
    assert data["status_history"][0]["new_status"] == "SUBMITTED"


def test_rbac_student_cannot_view_all_complaints(client, student_auth_headers):
    # Only Admin should be allowed to call GET /api/v1/complaints/
    response = client.get("/api/v1/complaints/", headers=student_auth_headers)
    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]


def test_rbac_admin_can_view_all_complaints(client, admin_auth_headers):
    response = client.get("/api/v1/complaints/", headers=admin_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data


def test_complaint_lifecycle_and_state_machine(
    client,
    student_auth_headers,
    admin_auth_headers,
    dept_staff_auth_headers,
    seed_users
):
    it_dept_id = seed_users["it_dept"].id

    # 1. Student submits a grievance
    submit_res = client.post("/api/v1/complaints/", json={
        "title": "Lab 4 Projector bulb burnt out",
        "description": "Projector in CS Lab 4 does not turn on. Lectures disrupted.",
        "category": "Hardware",
        "priority": "URGENT"
    }, headers=student_auth_headers)
    assert submit_res.status_code == 201
    complaint_id = submit_res.json()["id"]

    # 2. Transitioning to IN_PROGRESS before department assignment must FAIL
    invalid_prog = client.patch(
        f"/api/v1/complaints/{complaint_id}/status",
        json={"new_status": "IN_PROGRESS"},
        headers=admin_auth_headers
    )
    assert invalid_prog.status_code == 400
    assert "must be assigned to a department" in invalid_prog.json()["detail"]

    # 3. Admin assigns complaint to IT department
    assign_res = client.patch(
        f"/api/v1/complaints/{complaint_id}/assign",
        json={"department_id": it_dept_id},
        headers=admin_auth_headers
    )
    assert assign_res.status_code == 200
    assert assign_res.json()["department_id"] == it_dept_id

    # 4. IT Staff moves complaint to IN_PROGRESS
    progress_res = client.patch(
        f"/api/v1/complaints/{complaint_id}/status",
        json={"new_status": "IN_PROGRESS", "notes": "Staff dispatched to inspect projector."},
        headers=dept_staff_auth_headers
    )
    assert progress_res.status_code == 200
    assert progress_res.json()["status"] == "IN_PROGRESS"

    # 5. Resolving WITHOUT notes must FAIL
    no_notes_res = client.patch(
        f"/api/v1/complaints/{complaint_id}/status",
        json={"new_status": "RESOLVED"},
        headers=dept_staff_auth_headers
    )
    assert no_notes_res.status_code == 400
    assert "Resolution notes" in no_notes_res.json()["detail"]

    # 6. Resolving WITH notes succeeds
    resolve_res = client.patch(
        f"/api/v1/complaints/{complaint_id}/status",
        json={"new_status": "RESOLVED", "notes": "Replaced projector lamp and tested with HDMI display."},
        headers=dept_staff_auth_headers
    )
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "RESOLVED"
    assert resolve_res.json()["resolved_at"] is not None

    # 7. Student submits 5-star feedback
    feedback_res = client.post(
        f"/api/v1/complaints/{complaint_id}/feedback",
        json={"rating": 5, "comments": "Resolved within hours, great work!"},
        headers=student_auth_headers
    )
    assert feedback_res.status_code == 201
    assert feedback_res.json()["rating"] == 5

    # 8. Duplicate feedback must FAIL (409)
    duplicate_feedback = client.post(
        f"/api/v1/complaints/{complaint_id}/feedback",
        json={"rating": 4},
        headers=student_auth_headers
    )
    assert duplicate_feedback.status_code == 409


def test_admin_analytics_overview(client, admin_auth_headers):
    response = client.get("/api/v1/analytics/overview", headers=admin_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_complaints" in data
    assert "status_breakdown" in data
    assert "departments_summary" in data


def test_get_departments_public(client):
    """Ensure unauthenticated users on register page can fetch departments."""
    response = client.get("/api/v1/departments/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(d["code"] == "IT" for d in data)
