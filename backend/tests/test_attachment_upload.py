import io
import pytest
from app.core.security import create_access_token, hash_password
from app.models.user import User, UserRole

# Minimal valid 1x1 pixel PNG bytes
VALID_PNG_BYTES = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00"
    b"\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff?\x00\x05\xfe\x02\xfe"
    b"\xa75\x81\x84\x00\x00\x00\x00IEND\xaeB`\x82"
)

# Minimal valid JPEG bytes
VALID_JPEG_BYTES = (
    b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00"
    b"\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19"
    b"\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' \",#\x1c\x1c(7),01444\x1f"
    b"\'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f"
    b"\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02"
    b"\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9"
)


def test_submit_complaint_without_photo_via_multipart(client, student_auth_headers):
    """Verify complaint can be submitted via multipart form-data without any file attached."""
    data = {
        "title": "Broken light fixture in staircase B",
        "description": "The third floor staircase fixture has been flickering and is now dark.",
        "category": "Electrical & Power",
        "priority": "HIGH",
    }
    response = client.post(
        "/api/v1/complaints/",
        data=data,
        headers=student_auth_headers,
    )
    assert response.status_code == 201
    res_data = response.json()
    assert res_data["title"] == data["title"]
    assert res_data["status"] == "SUBMITTED"
    assert len(res_data["attachments"]) == 0


def test_submit_complaint_with_valid_photo(client, student_auth_headers):
    """Verify complaint submitted with valid photo creates an attachment record and associates it."""
    data = {
        "title": "Severe pipe leakage in room 204",
        "description": "Water leaking steadily from under the bathroom sink. Puddle forming.",
        "category": "Facilities & Infrastructure",
        "priority": "URGENT",
    }
    files = {
        "image": ("pipe_leak.png", io.BytesIO(VALID_PNG_BYTES), "image/png")
    }

    response = client.post(
        "/api/v1/complaints/",
        data=data,
        files=files,
        headers=student_auth_headers,
    )
    assert response.status_code == 201
    res_data = response.json()
    assert res_data["title"] == data["title"]
    assert len(res_data["attachments"]) == 1

    attachment = res_data["attachments"][0]
    assert attachment["file_name"] == "pipe_leak.png"
    assert attachment["file_type"] == "image/png"
    assert attachment["file_size_bytes"] == len(VALID_PNG_BYTES)
    assert f"/api/v1/complaints/{res_data['id']}/attachments/" in attachment["file_url"]


def test_submit_complaint_rejects_invalid_file_type(client, student_auth_headers):
    """Verify submitting non-image file (e.g. plain text or executable) is rejected with 400 Bad Request."""
    data = {
        "title": "Invalid file upload test",
        "description": "Attempting to upload a plain text file disguised as a photo.",
        "category": "General",
        "priority": "LOW",
    }
    invalid_content = b"This is plain text and definitely not a valid JPEG/PNG image."
    files = {
        "image": ("malicious.txt", io.BytesIO(invalid_content), "text/plain")
    }

    response = client.post(
        "/api/v1/complaints/",
        data=data,
        files=files,
        headers=student_auth_headers,
    )
    assert response.status_code == 400
    assert "Invalid file format" in response.json()["detail"]


def test_submit_complaint_rejects_spoofed_extension(client, student_auth_headers):
    """Verify submitting text with a .jpg extension but invalid magic bytes is rejected."""
    data = {
        "title": "Spoofed extension test",
        "description": "Attempting to spoof .jpg with plain text bytes.",
        "category": "General",
        "priority": "LOW",
    }
    spoofed_content = b"FakeJPEGHeaderNotRealBytes"
    files = {
        "image": ("fake.jpg", io.BytesIO(spoofed_content), "image/jpeg")
    }

    response = client.post(
        "/api/v1/complaints/",
        data=data,
        files=files,
        headers=student_auth_headers,
    )
    assert response.status_code == 400
    assert "Invalid file format" in response.json()["detail"]


def test_submit_complaint_rejects_oversized_image(client, student_auth_headers):
    """Verify submitting an image larger than 5 MB is rejected with 400 Bad Request."""
    data = {
        "title": "Oversized image test",
        "description": "Attempting to upload an image exceeding 5MB.",
        "category": "General",
        "priority": "LOW",
    }
    # 5 MB + 100 KB
    oversized_bytes = b"\xff\xd8\xff" + b"X" * (5 * 1024 * 1024 + 100 * 1024)
    files = {
        "image": ("huge_photo.jpg", io.BytesIO(oversized_bytes), "image/jpeg")
    }

    response = client.post(
        "/api/v1/complaints/",
        data=data,
        files=files,
        headers=student_auth_headers,
    )
    assert response.status_code == 400
    assert "exceeds maximum allowed size" in response.json()["detail"]


def test_attachment_access_control(
    client,
    student_auth_headers,
    admin_auth_headers,
    seed_users,
    db_session
):
    """
    Verify strict object-level access control on uploaded attachments:
    - Complaint owner (Student) can view attachment.
    - Admin can view attachment.
    - Another student cannot view attachment (403 Forbidden).
    """
    # 1. Student 1 submits complaint with photo
    submit_res = client.post(
        "/api/v1/complaints/",
        data={
            "title": "Broken window in Room 101",
            "description": "Glass pane cracked due to high wind.",
            "category": "Facilities & Infrastructure",
            "priority": "MEDIUM",
        },
        files={"image": ("window.png", io.BytesIO(VALID_PNG_BYTES), "image/png")},
        headers=student_auth_headers,
    )
    assert submit_res.status_code == 201
    complaint_data = submit_res.json()
    complaint_id = complaint_data["id"]
    attachment_id = complaint_data["attachments"][0]["id"]

    # 2. Student 1 (owner) accesses attachment -> 200 OK
    view_owner_res = client.get(
        f"/api/v1/complaints/{complaint_id}/attachments/{attachment_id}/file",
        headers=student_auth_headers,
    )
    assert view_owner_res.status_code == 200
    assert view_owner_res.headers["content-type"] == "image/png"

    # 3. Admin accesses attachment -> 200 OK
    view_admin_res = client.get(
        f"/api/v1/complaints/{complaint_id}/attachments/{attachment_id}/file",
        headers=admin_auth_headers,
    )
    assert view_admin_res.status_code == 200

    # 4. Create another student (Student 2) who is NOT the owner
    student2 = User(
        email="unauthorized.student@campus.edu",
        password_hash=hash_password("Pass123!"),
        full_name="Other Student",
        role=UserRole.STUDENT_STAFF.value,
    )
    db_session.add(student2)
    db_session.commit()
    token2 = create_access_token(subject=student2.id, role=student2.role)
    student2_headers = {"Authorization": f"Bearer {token2}"}

    # 5. Student 2 tries to access Student 1's attachment -> 403 Forbidden
    unauthorized_res = client.get(
        f"/api/v1/complaints/{complaint_id}/attachments/{attachment_id}/file",
        headers=student2_headers,
    )
    assert unauthorized_res.status_code == 403
    assert "You can only view your own complaints" in unauthorized_res.json()["detail"]


def test_attachment_access_via_query_token(client, student_auth_headers, seed_users):
    """Verify attachment can be viewed via ?token= query parameter (for HTML <img> rendering)."""
    user = seed_users["student"]
    token = create_access_token(subject=user.id, role=user.role)

    submit_res = client.post(
        "/api/v1/complaints/",
        data={
            "title": "Stained carpet in hall",
            "description": "Carpet needs deep cleaning after paint spill.",
            "category": "Cleanliness",
            "priority": "LOW",
        },
        files={"image": ("carpet.jpg", io.BytesIO(VALID_JPEG_BYTES), "image/jpeg")},
        headers=student_auth_headers,
    )
    assert submit_res.status_code == 201
    complaint_id = submit_res.json()["id"]
    attachment_id = submit_res.json()["attachments"][0]["id"]

    # Request with ?token= query parameter and NO Authorization header
    query_token_res = client.get(
        f"/api/v1/complaints/{complaint_id}/attachments/{attachment_id}/file?token={token}"
    )
    assert query_token_res.status_code == 200
    assert query_token_res.headers["content-type"] == "image/jpeg"
