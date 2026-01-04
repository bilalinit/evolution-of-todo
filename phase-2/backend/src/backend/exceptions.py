"""
Custom exception handlers for the application.
"""
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from typing import Dict, Any


class ValidationException(HTTPException):
    """Custom validation exception."""
    def __init__(self, message: str, details: Dict[str, Any] = None):
        super().__init__(
            status_code=400,
            detail={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": message,
                    "details": details or {}
                }
            }
        )


async def validation_exception_handler(request: Request, exc: ValidationError):
    """Handle Pydantic validation errors."""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })

    return JSONResponse(
        status_code=400,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Validation failed",
                "details": {"errors": errors}
            }
        }
    )


async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with consistent format."""
    if isinstance(exc.detail, dict) and "error" in exc.detail:
        # Already formatted
        content = exc.detail
    else:
        # Format as error response
        content = {
            "error": {
                "code": "HTTP_ERROR",
                "message": exc.detail,
                "details": {}
            }
        }

    return JSONResponse(
        status_code=exc.status_code,
        content=content,
        headers=getattr(exc, "headers", None)
    )