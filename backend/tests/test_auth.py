def test_register_student_success(client):
    payload = {
        "email": "newstudent@campus.edu",
        "password": "Password123!",
        "full_name": "Jordan Lee",
        "role": "STUDENT_STAFF",
        "phone": "+1234567890"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newstudent@campus.edu"
    assert data["full_name"] == "Jordan Lee"
    assert data["role"] == "STUDENT_STAFF"
    assert "password_hash" not in data


def test_register_duplicate_email_fails(client, seed_users):
    payload = {
        "email": "student@campus.edu",  # Already in seed_users
        "password": "AnotherPassword!",
        "full_name": "Impostor",
        "role": "STUDENT_STAFF"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


def test_login_success(client, seed_users):
    response = client.post("/api/v1/auth/login", json={
        "email": "student@campus.edu",
        "password": "StudentPass123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "student@campus.edu"


def test_login_invalid_password(client, seed_users):
    response = client.post("/api/v1/auth/login", json={
        "email": "student@campus.edu",
        "password": "WrongPassword!"
    })
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_get_current_user_profile(client, student_auth_headers):
    response = client.get("/api/v1/auth/me", headers=student_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "student@campus.edu"
    assert data["role"] == "STUDENT_STAFF"


def test_unauthenticated_request_fails(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_registration_preflight_success(client):
    """
    Ensure browser preflight OPTIONS request to /api/v1/auth/register
    from the deployed Vercel frontend succeeds with appropriate CORS headers.
    """
    origin = "https://campusresolve-pied.vercel.app"
    response = client.options(
        "/api/v1/auth/register",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        }
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == origin
    assert response.headers["access-control-allow-credentials"] == "true"
    assert "POST" in response.headers.get("access-control-allow-methods", "")
    assert "content-type" in response.headers.get("access-control-allow-headers", "").lower()


def test_registration_preflight_disallowed_origin(client):
    """
    Ensure unauthorized origins are rejected by CORS middleware on preflight.
    """
    origin = "https://unauthorized-domain.com"
    response = client.options(
        "/api/v1/auth/register",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        }
    )
    assert response.status_code == 400
    assert "Disallowed CORS" in response.text

