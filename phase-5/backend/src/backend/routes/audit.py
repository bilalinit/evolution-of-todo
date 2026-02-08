"""
Audit routes for retrieving audit logs.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from backend.database import get_session
from backend.middleware.auth import get_current_user, verify_user_ownership
from backend.models.audit_log import AuditLogResponse, EventType
from backend.services.audit_service import AuditService


router = APIRouter()


@router.get("/audit")
async def get_audit_log(
    user_id: str,
    event_type: Optional[EventType] = Query(None, description="Filter by event type"),
    entity_id: Optional[UUID] = Query(None, description="Filter by entity ID"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of logs"),
    offset: int = Query(0, ge=0, description="Number of logs to skip"),
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Get audit logs for a user with optional filtering.

    Returns audit entries ordered by timestamp (most recent first).

    Requires authentication and verifies user ownership.
    """
    # Verify user ownership
    await verify_user_ownership(user_id, current_user)

    # Create service
    audit_service = AuditService(session)

    # Get logs
    logs = await audit_service.get_logs(
        user_id=user_id,
        event_type=event_type,
        entity_id=entity_id,
        limit=limit,
        offset=offset
    )

    # Get total count
    total = await audit_service.get_log_count(user_id)

    # Convert to response format
    log_responses = [AuditLogResponse.from_audit_log(log) for log in logs]

    return {
        "logs": log_responses,
        "total": total,
        "limit": limit,
        "offset": offset
    }
