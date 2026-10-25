from fastapi import HTTPException, status


class EntityNotFoundException(HTTPException):
    def __init__(self, entity_name: str, identifier: str = ""):
        detail = f"{entity_name} {identifier} not found" if identifier else f"{entity_name} not found"
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class InvalidCredentialsException(HTTPException):
    def __init__(self, detail: str = "Incorrect email or password"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class PermissionDeniedException(HTTPException):
    def __init__(self, detail: str = "Operation not permitted for your role"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class InvalidStatusTransitionException(HTTPException):
    def __init__(self, current_status: str, target_status: str, reason: str = ""):
        detail = f"Cannot transition complaint from '{current_status}' to '{target_status}'"
        if reason:
            detail += f": {reason}"
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class DuplicateResourceException(HTTPException):
    def __init__(self, resource_name: str, field: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{resource_name} with this {field} already exists"
        )
