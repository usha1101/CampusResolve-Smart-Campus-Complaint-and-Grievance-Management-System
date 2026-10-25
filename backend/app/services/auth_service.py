from typing import Optional
from sqlalchemy.orm import Session
from app.core.security import hash_password, verify_password, create_access_token
from app.core.exceptions import InvalidCredentialsException, DuplicateResourceException
from app.models.user import User, UserRole
from app.schemas.user import UserCreate
from app.schemas.auth import TokenResponse
from app.schemas.user import UserResponse


class AuthService:
    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email.lower().strip()).first()

    @staticmethod
    def get_by_id(db: Session, user_id: str) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def register_user(db: Session, user_in: UserCreate) -> User:
        existing = AuthService.get_by_email(db, user_in.email)
        if existing:
            raise DuplicateResourceException("User", "email")

        # Create new user
        user = User(
            email=user_in.email.lower().strip(),
            password_hash=hash_password(user_in.password),
            full_name=user_in.full_name.strip(),
            role=user_in.role.value if isinstance(user_in.role, UserRole) else str(user_in.role),
            department_id=user_in.department_id,
            phone=user_in.phone.strip() if user_in.phone else None,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> TokenResponse:
        user = AuthService.get_by_email(db, email)
        if not user:
            raise InvalidCredentialsException()

        if not verify_password(password, user.password_hash):
            raise InvalidCredentialsException()

        token = create_access_token(
            subject=user.id,
            role=user.role,
            extra_claims={"email": user.email, "full_name": user.full_name}
        )

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )
