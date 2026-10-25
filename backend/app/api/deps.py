from typing import List, Callable
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.core.exceptions import InvalidCredentialsException, PermissionDeniedException
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to retrieve and validate the authenticated user from the JWT token."""
    payload = decode_access_token(token)
    if not payload:
        raise InvalidCredentialsException("Invalid or expired session token")

    user_id = payload.get("sub")
    if not user_id:
        raise InvalidCredentialsException("Token payload missing subject identifier")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise InvalidCredentialsException("User associated with token no longer exists")

    return user


def require_roles(allowed_roles: List[UserRole]) -> Callable[[User], User]:
    """
    Role-Based Access Control (RBAC) dependency factory.
    Enforces that the current authenticated user possesses one of the allowed roles.
    """
    allowed_values = [r.value if isinstance(r, UserRole) else str(r) for r in allowed_roles]

    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_values:
            raise PermissionDeniedException(
                f"Access denied. Requires one of roles: {', '.join(allowed_values)}"
            )
        return current_user

    return role_checker
