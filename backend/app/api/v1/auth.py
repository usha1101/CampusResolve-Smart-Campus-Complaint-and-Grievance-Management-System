from typing import Union
from fastapi import APIRouter, Depends, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.schemas.auth import TokenResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new student, staff member, or administrator."""
    user = AuthService.register_user(db, user_in)
    return UserResponse.model_validate(user)


@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and issue JWT bearer token.
    Supports both JSON body ({email, password}) and OAuth2 Form data (username=email, password).
    """
    content_type = request.headers.get("content_type", "")

    if "application/x-www-form-urlencoded" in content_type:
        form_data = await request.form()
        email = str(form_data.get("username", ""))
        password = str(form_data.get("password", ""))
    else:
        body = await request.json()
        email = body.get("email", "")
        password = body.get("password", "")

    return AuthService.authenticate(db, email=email, password=password)


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Retrieve profile and role information for the currently authenticated user."""
    return UserResponse.model_validate(current_user)
