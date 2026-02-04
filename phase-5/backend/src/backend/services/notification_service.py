"""
Notification Service for in-app notifications.
Creates and manages user notifications.
"""
from typing import List, Optional, Callable
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from backend.models.notification import Notification
from backend.models.audit_log import EventType


class NotificationService:
    """Service for managing user notifications."""

    def __init__(
        self,
        session_factory=None,
        audit_service: Optional["AuditService"] = None,
        session: AsyncSession = None
    ):
        # Support both session_factory and session patterns
        # session_factory: for background services (scheduler)
        # session: for request-scoped services (routes)

        # Handle legacy call pattern: NotificationService(session, audit_service)
        # If first arg is AsyncSession instance, treat it as session, not session_factory
        if isinstance(session_factory, AsyncSession):
            self._session = session_factory
            self.session_factory = None
            self.audit = audit_service
        else:
            self.session_factory = session_factory
            self._session = session
            self.audit = audit_service

    def _get_session(self):
        """Get the appropriate session context manager."""
        if self._session:
            # For request-scoped usage, return a noop context that yields the existing session
            from contextlib import asynccontextmanager
            @asynccontextmanager
            async def use_existing_session():
                yield self._session
            return use_existing_session()
        else:
            # For background services, create a new session
            return self.session_factory()

    async def create(
        self,
        user_id: str,
        message: str,
        task_id: Optional[UUID] = None
    ) -> Notification:
        """
        Create a new notification.

        Args:
            user_id: Recipient user ID
            message: Notification message
            task_id: Optional related task ID

        Returns:
            Created Notification
        """
        async with self._get_session() as session:
            notif = Notification(
                user_id=user_id,
                message=message,
                task_id=task_id
            )
            session.add(notif)
            await session.commit()
            await session.refresh(notif)

            # Log to audit if service available
            if self.audit:
                await self.audit.log_event(
                    event_type=EventType.TASK_CREATED,  # Using generic created event
                    entity_type="notification",
                    entity_id=notif.id,
                    user_id=user_id,
                    data={"message": message, "task_id": str(task_id) if task_id else None}
                )

            return notif

    async def list(
        self,
        user_id: str,
        unread_only: bool = False,
        limit: int = 50,
        offset: int = 0
    ) -> List[Notification]:
        """
        List notifications for a user.

        Args:
            user_id: User ID to filter by
            unread_only: Only return unread notifications
            limit: Maximum number of notifications to return
            offset: Number of notifications to skip

        Returns:
            List of Notification objects
        """
        async with self._get_session() as session:
            query = select(Notification).where(Notification.user_id == user_id)

            if unread_only:
                query = query.where(Notification.read == False)

            query = query.order_by(Notification.created_at.desc())
            query = query.limit(limit).offset(offset)

            result = await session.execute(query)
            return list(result.scalars().all())

    async def mark_read(self, user_id: str, notification_id: UUID) -> bool:
        """
        Mark a notification as read.

        Args:
            user_id: User ID (for ownership verification)
            notification_id: Notification ID to mark as read

        Returns:
            True if marked, False if not found
        """
        async with self._get_session() as session:
            query = select(Notification).where(
                and_(
                    Notification.id == notification_id,
                    Notification.user_id == user_id
                )
            )
            result = await session.execute(query)
            notif = result.scalar_one_or_none()

            if notif:
                notif.read = True
                await session.commit()
                return True
            return False

    async def mark_all_read(self, user_id: str) -> int:
        """
        Mark all notifications as read for a user.

        Args:
            user_id: User ID

        Returns:
            Number of notifications marked as read
        """
        from datetime import datetime
        from sqlalchemy import update

        async with self._get_session() as session:
            stmt = (
                update(Notification)
                .where(and_(Notification.user_id == user_id, Notification.read == False))
                .values(read=True)
            )
            result = await session.execute(stmt)
            await session.commit()
            return result.rowcount

    async def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications for a user."""
        async with self._get_session() as session:
            query = select(func.count()).select_from(Notification).where(
                and_(Notification.user_id == user_id, Notification.read == False)
            )
            result = await session.execute(query)
            return result.scalar() or 0

    async def delete(self, user_id: str, notification_id: UUID) -> bool:
        """
        Delete a notification.

        Args:
            user_id: User ID (for ownership verification)
            notification_id: Notification ID to delete

        Returns:
            True if deleted, False if not found
        """
        async with self._get_session() as session:
            query = select(Notification).where(
                and_(
                    Notification.id == notification_id,
                    Notification.user_id == user_id
                )
            )
            result = await session.execute(query)
            notif = result.scalar_one_or_none()

            if notif:
                await session.delete(notif)
                await session.commit()
                return True
            return False
