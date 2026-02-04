"""
Audit Service for tracking all task operations.
Logs events to database with stderr fallback on failure.
"""
import sys
from typing import Optional, Callable
from uuid import UUID
from datetime import datetime
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from backend.models.audit_log import AuditLog, EventType


class AuditService:
    """Service for logging audit events."""

    def __init__(
        self,
        session_factory=None,
        session: AsyncSession = None
    ):
        # Support both session_factory and session patterns
        # session_factory: for background services
        # session: for request-scoped services (routes)

        # Handle legacy call pattern: AuditService(session)
        # If first arg is AsyncSession instance, treat it as session, not session_factory
        if isinstance(session_factory, AsyncSession):
            self._session = session_factory
            self.session_factory = None
        else:
            self.session_factory = session_factory
            self._session = session

    def _get_session(self):
        """Get the appropriate session context manager."""
        if self._session:
            # For request-scoped usage, return a noop context that yields the existing session
            @asynccontextmanager
            async def use_existing_session():
                yield self._session
            return use_existing_session()
        else:
            # For background services, create a new session
            return self.session_factory()

    async def log_event(
        self,
        event_type: EventType,
        entity_type: str,
        entity_id: UUID,
        user_id: str,
        data: dict
    ) -> Optional[AuditLog]:
        """
        Log an audit event.

        Never blocks on failure - logs to stderr if DB fails.

        Args:
            event_type: Type of event (created, updated, completed, deleted)
            entity_type: Type of entity (e.g., 'task')
            entity_id: ID of the affected entity
            user_id: User who performed the action
            data: Event data snapshot

        Returns:
            AuditLog if successful, None if failed
        """
        async with self._get_session() as session:
            try:
                log = AuditLog(
                    event_type=event_type,
                    entity_type=entity_type,
                    entity_id=entity_id,
                    user_id=user_id,
                    timestamp=datetime.utcnow(),
                    data=data
                )
                session.add(log)
                await session.commit()
                await session.refresh(log)
                return log
            except Exception as e:
                # Never block main operation for audit failures
                print(f"Audit logging failed: {e}", file=sys.stderr)
                return None

    async def get_logs(
        self,
        user_id: str,
        event_type: Optional[EventType] = None,
        entity_id: Optional[UUID] = None,
        limit: int = 100,
        offset: int = 0
    ) -> list[AuditLog]:
        """
        Get audit logs for a user with optional filtering.

        Args:
            user_id: User ID to filter by
            event_type: Optional event type filter
            entity_id: Optional entity ID filter
            limit: Maximum number of logs to return
            offset: Number of logs to skip

        Returns:
            List of AuditLog entries
        """
        async with self._get_session() as session:
            query = select(AuditLog).where(AuditLog.user_id == user_id)

            if event_type:
                query = query.where(AuditLog.event_type == event_type)

            if entity_id:
                query = query.where(AuditLog.entity_id == entity_id)

            query = query.order_by(AuditLog.timestamp.desc())
            query = query.limit(limit).offset(offset)

            result = await session.execute(query)
            return list(result.scalars().all())

    async def get_log_count(self, user_id: str) -> int:
        """Get total count of audit logs for a user."""
        from sqlalchemy import func
        async with self._get_session() as session:
            query = select(func.count()).select_from(AuditLog).where(AuditLog.user_id == user_id)
            result = await session.execute(query)
            return result.scalar() or 0
