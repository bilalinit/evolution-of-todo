"""
Notification routes for in-app notifications.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from backend.database import get_session
from backend.middleware.auth import get_current_user, verify_user_ownership
from backend.models.notification import NotificationResponse, NotificationListResponse
from backend.services.notification_service import NotificationService
from backend.services.audit_service import AuditService


router = APIRouter()


@router.get("/notifications", response_model=NotificationListResponse)
async def get_notifications(
    user_id: str,
    unread_only: bool = Query(False, description="Only return unread notifications"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of notifications"),
    offset: int = Query(0, ge=0, description="Number of notifications to skip"),
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Get all notifications for a user with optional filtering.

    Requires authentication and verifies user ownership.
    """
    # Verify user ownership
    await verify_user_ownership(user_id, current_user)

    # Create services
    audit_service = AuditService(session)
    notification_service = NotificationService(session, audit_service)

    # Get notifications
    notifications = await notification_service.list(
        user_id=user_id,
        unread_only=unread_only,
        limit=limit,
        offset=offset
    )

    return NotificationListResponse.from_notifications(notifications)


@router.get("/notifications/unread-count")
async def get_unread_count(
    user_id: str,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Get the count of unread notifications for a user.

    Requires authentication and verifies user ownership.
    """
    # Verify user ownership
    await verify_user_ownership(user_id, current_user)

    # Create services
    audit_service = AuditService(session)
    notification_service = NotificationService(session, audit_service)

    # Get unread count
    count = await notification_service.get_unread_count(user_id)

    return {"count": count}


@router.post("/notifications/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    user_id: str,
    notification_id: UUID,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Mark a notification as read.

    Requires authentication and verifies user ownership.
    """
    # Verify user ownership
    await verify_user_ownership(user_id, current_user)

    # Create services
    audit_service = AuditService(session)
    notification_service = NotificationService(session, audit_service)

    # Mark as read
    success = await notification_service.mark_read(user_id, notification_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    # Get the updated notification
    from sqlalchemy import select, and_
    from backend.models.notification import Notification
    query = select(Notification).where(
        and_(
            Notification.id == notification_id,
            Notification.user_id == user_id
        )
    )
    result = await session.execute(query)
    notification = result.scalar_one_or_none()

    if notification:
        return NotificationResponse.from_notification(notification)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Notification not found"
    )


@router.post("/notifications/read-all")
async def mark_all_notifications_read(
    user_id: str,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Mark all notifications as read for a user.

    Requires authentication and verifies user ownership.
    """
    # Verify user ownership
    await verify_user_ownership(user_id, current_user)

    # Create services
    audit_service = AuditService(session)
    notification_service = NotificationService(session, audit_service)

    # Mark all as read
    count = await notification_service.mark_all_read(user_id)

    return {"marked_read": count}


@router.delete("/notifications/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    user_id: str,
    notification_id: UUID,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Delete a notification.

    Requires authentication and verifies user ownership.
    """
    # Verify user ownership
    await verify_user_ownership(user_id, current_user)

    # Create services
    audit_service = AuditService(session)
    notification_service = NotificationService(session, audit_service)

    # Delete notification
    success = await notification_service.delete(user_id, notification_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    return
