"""
Authentication middleware for FastAPI.
Provides dependencies for JWT verification and user extraction.
"""
from typing import Optional
from fastapi import Depends, HTTPException, Header, status
from backend.auth.jwt import verify_jwt, extract_user_id


async def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """
    FastAPI dependency to extract and verify current user from JWT.

    Args:
        authorization: Authorization header (format: "Bearer <token>")

    Returns:
        User ID from JWT token

    Raises:
        HTTPException: 401 Unauthorized if token missing or invalid
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Extract token from "Bearer <token>" format
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format. Use 'Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = parts[1]
    user_id = extract_user_id(token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return user_id


async def require_auth(authorization: Optional[str] = Header(None)) -> bool:
    """
    Simple authentication check.

    Args:
        authorization: Authorization header

    Returns:
        True if valid authentication

    Raises:
        HTTPException: 401 if authentication fails
    """
    await get_current_user(authorization)
    return True


async def verify_user_ownership(
    path_user_id: str,
    current_user: str = Depends(get_current_user)
) -> str:
    """
    Verify that the path user_id matches the authenticated user.

    Args:
        path_user_id: User ID from URL path
        current_user: Authenticated user ID from JWT

    Returns:
        User ID if ownership verified

    Raises:
        HTTPException: 403 Forbidden if user mismatch
        HTTPException: 404 Not Found if user doesn't exist
    """
    if path_user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: you can only access your own data"
        )

    return current_user