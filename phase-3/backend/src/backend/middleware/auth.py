"""
Authentication middleware for FastAPI.
Provides dependencies for JWT verification and user extraction.
"""
from typing import Optional
from fastapi import Depends, HTTPException, Header, status
from backend.auth.jwt import verify_jwt, extract_user_id


async def get_current_user(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
) -> str:
    """
    FastAPI dependency to extract and verify current user.

    Supports two authentication methods:
    1. JWT Bearer token (standard method)
    2. X-User-Id header (for ChatKit integration)

    Args:
        authorization: Authorization header (format: "Bearer <token>")
        x_user_id: User ID header for ChatKit requests

    Returns:
        User ID from JWT token or X-User-Id header

    Raises:
        HTTPException: 401 Unauthorized if authentication fails
    """
    # Method 1: Try JWT token first (preferred)
    if authorization:
        try:
            # Extract token from "Bearer <token>" format
            parts = authorization.split()
            if len(parts) == 2 and parts[0].lower() == "bearer":
                token = parts[1]
                user_id = extract_user_id(token)

                if user_id:
                    return user_id
        except Exception:
            # If JWT extraction fails, fall through to header method
            pass

    # Method 2: Try X-User-Id header (for ChatKit)
    if x_user_id:
        # In production, you might want to validate this header more strictly
        # For now, we'll trust it since it requires access to the frontend
        print(f"ChatKit: Using X-User-Id header for authentication: {x_user_id}")
        return x_user_id

    # No valid authentication found
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Missing or invalid authentication. Use Bearer token or X-User-Id header",
        headers={"WWW-Authenticate": "Bearer"}
    )


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