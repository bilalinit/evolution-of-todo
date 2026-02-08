"""
Task Service: Business logic for task operations
Service layer decoupled from API/MCP presentation layers
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from uuid import UUID
from datetime import date, datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
from dateutil.relativedelta import relativedelta

from backend.models.task import Task, TaskCreate, TaskUpdate, TaskListResponse
from backend.models.notification import Notification
from backend.utils.event_publisher import (
    publish_task_created,
    publish_task_completed,
)


class TaskService:
    """Service layer for task operations - decoupled from API/MCP layers."""

    def __init__(self, session: AsyncSession):
        self.session = session

    def _calculate_next_due_date(self, rule: str, current_due_date: date) -> Optional[date]:
        """
        Calculate the next due date based on recurrence rule.

        Uses dateutil.relativedelta for reliable date calculation that handles
        month/year boundaries correctly (e.g., Jan 31 + 1 month = Feb 28/29).

        Args:
            rule: Recurrence rule (daily, weekly, monthly, yearly)
            current_due_date: Current task due date

        Returns:
            Next due date or None if rule is invalid
        """
        if rule == "daily":
            return current_due_date + timedelta(days=1)
        elif rule == "weekly":
            return current_due_date + timedelta(weeks=1)
        elif rule == "monthly":
            return current_due_date + relativedelta(months=1)
        elif rule == "yearly":
            return current_due_date + relativedelta(years=1)
        return None

    async def create_next_recurring_task(self, task: Task) -> Optional[Task]:
        """
        Create the next instance of a recurring task.

        Checks if recurring_end_date has passed before creating the next instance.

        Args:
            task: The completed recurring task

        Returns:
            New Task instance or None if recurrence ended
        """
        # Check if this is a recurring task
        if not task.recurring_rule:
            return None

        # Check if recurrence has ended
        if task.recurring_end_date:
            # Compare dates only (ignore time portion)
            end_date = task.recurring_end_date.date() if task.recurring_end_date else None
            if end_date and task.due_date and end_date <= task.due_date:
                # Recurrence period has ended
                return None

        # Calculate next due date
        next_due = self._calculate_next_due_date(task.recurring_rule, task.due_date)
        if not next_due:
            return None

        # Check if next due date equals or exceeds recurring_end_date
        # If next_due == recurring_end_date, don't create the task (constraint requires end_date > due_date)
        if task.recurring_end_date:
            end_date = task.recurring_end_date.date()
            if next_due >= end_date:
                # Next due date is at or beyond recurrence end date
                return None

        # Create next instance with naive UTC timestamps
        now_utc = datetime.now(timezone.utc).replace(tzinfo=None)

        # Helper to strip timezone from datetime if present
        def make_naive(dt: Optional[datetime]) -> Optional[datetime]:
            return dt.replace(tzinfo=None) if dt and dt.tzinfo else dt

        new_task = Task(
            user_id=task.user_id,
            title=task.title,
            description=task.description,
            priority=task.priority,
            category=task.category,
            due_date=next_due,
            recurring_rule=task.recurring_rule,
            recurring_end_date=make_naive(task.recurring_end_date),
            parent_task_id=task.id,
            reminder_at=make_naive(task.reminder_at),
            reminder_sent=False,  # Reset reminder sent for new instance
            tags=task.tags or [],
            created_at=now_utc,
            updated_at=now_utc
        )

        self.session.add(new_task)
        await self.session.commit()
        await self.session.refresh(new_task)
        return new_task

    async def create(
        self,
        user_id: str,
        title: str,
        description: Optional[str] = None,
        priority: str = "medium",
        category: str = "other",
        due_date: Optional[date] = None,
        recurring_rule: Optional[str] = None,
        recurring_end_date: Optional[datetime] = None,
        reminder_at: Optional[datetime] = None,
        tags: Optional[List[str]] = None
    ) -> Task:
        """
        Create a new task for a user.

        Args:
            user_id: User ID from JWT
            title: Task title (1-200 chars)
            description: Optional description (max 1000 chars)
            priority: Priority level (low, medium, high)
            category: Task category (work, personal, shopping, health, other)
            due_date: Optional due date
            recurring_rule: Optional recurrence rule (daily, weekly, monthly, yearly)
            recurring_end_date: Optional end date for recurrence
            reminder_at: Optional reminder datetime (UTC)
            tags: Optional list of tag strings

        Returns:
            Created Task model

        Raises:
            ValueError: If validation fails
        """
        # Validation
        if not title or len(title.strip()) == 0:
            raise ValueError("Task title cannot be empty")
        if len(title) > 200:
            raise ValueError("Title exceeds 200 characters")
        if description and len(description) > 1000:
            raise ValueError("Description exceeds 1000 characters")

        # Recurring task validation
        if recurring_rule and not due_date:
            raise ValueError("Recurring tasks must have a due date")

        if recurring_rule and recurring_rule not in ["daily", "weekly", "monthly", "yearly"]:
            raise ValueError("Invalid recurring rule. Must be: daily, weekly, monthly, or yearly")

        if recurring_end_date and due_date and recurring_end_date.date() <= due_date:
            raise ValueError("Recurring end date must be after due date")

        # Tag validation
        if tags:
            if len(tags) > 50:
                raise ValueError("Maximum 50 tags allowed")
            for tag in tags:
                if not isinstance(tag, str):
                    raise ValueError("Tags must be strings")
                if len(tag) > 50:
                    raise ValueError("Each tag must be 50 characters or less")

        # Create task
        task = Task(
            user_id=user_id,
            title=title.strip(),
            description=description,
            priority=priority,
            category=category,
            due_date=due_date,
            recurring_rule=recurring_rule,
            recurring_end_date=recurring_end_date,
            reminder_at=reminder_at,
            tags=tags or []
        )
        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)

        # Publish task-created event for audit logging, WebSocket broadcast
        await publish_task_created(
            user_id=user_id,
            task_id=str(task.id),
            title=task.title,
            description=task.description,
            priority=task.priority.value,
            due_date=task.due_date.isoformat() if task.due_date else None,
            reminder_at=task.reminder_at.isoformat() if task.reminder_at else None,
            recurring_rule=task.recurring_rule,
            recurring_end_date=task.recurring_end_date.isoformat()
            if task.recurring_end_date else None,
            tags=task.tags or [],
        )

        return task

    async def get(self, user_id: str, task_id: UUID) -> Optional[Task]:
        """
        Get single task by ID with user ownership check.

        Args:
            user_id: User ID from JWT
            task_id: Task UUID

        Returns:
            Task model or None if not found/not owned
        """
        query = select(Task).where(
            and_(
                Task.id == task_id,
                Task.user_id == user_id
            )
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def list(
        self,
        user_id: str,
        status: str = "all",
        priority: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        order: str = "desc"
    ) -> Dict[str, Any]:
        """
        List tasks with filtering, sorting, and statistics.

        Args:
            user_id: User ID from JWT
            status: Filter by completion (all, completed, pending)
            priority: Filter by priority
            category: Filter by category
            search: Search in title and description
            sort_by: Field to sort by
            order: Sort order (asc, desc)

        Returns:
            Dict with tasks list and statistics
        """
        query = select(Task).where(Task.user_id == user_id)

        # Status filter
        if status == "completed":
            query = query.where(Task.completed == True)
        elif status == "pending":
            query = query.where(Task.completed == False)

        # Priority filter
        if priority:
            query = query.where(Task.priority == priority)

        # Category filter
        if category:
            query = query.where(Task.category == category)

        # Search filter
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Task.title.ilike(search_pattern),
                    Task.description.ilike(search_pattern)
                )
            )

        # Sorting
        sort_field = getattr(Task, sort_by, Task.created_at)
        if order == "asc":
            query = query.order_by(sort_field.asc())
        else:
            query = query.order_by(sort_field.desc())

        # Execute query
        result = await self.session.execute(query)
        tasks = result.scalars().all()

        # Calculate stats
        completed_count = sum(1 for t in tasks if t.completed)

        return {
            "tasks": [task.to_dict() for task in tasks],
            "total": len(tasks),
            "completed_count": completed_count,
            "pending_count": len(tasks) - completed_count
        }

    async def update(
        self,
        user_id: str,
        task_id: UUID,
        title: Optional[str] = None,
        description: Optional[str] = None,
        completed: Optional[bool] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None,
        due_date: Optional[date] = None,
        recurring_rule: Optional[str] = None,
        recurring_end_date: Optional[datetime] = None,
        reminder_at: Optional[datetime] = None,
        tags: Optional[List[str]] = None
    ) -> Task:
        """
        Update existing task with ownership check.

        Args:
            user_id: User ID from JWT
            task_id: Task UUID
            title: New title (optional)
            description: New description (optional, None to clear)
            completed: Completion status (optional)
            priority: New priority (optional)
            category: New category (optional)
            due_date: New due date (optional, None to clear)
            recurring_rule: New recurrence rule (optional)
            recurring_end_date: New recurring end date (optional)
            reminder_at: New reminder datetime (optional)
            tags: New tags list (optional)

        Returns:
            Updated Task model

        Raises:
            ValueError: If task not found or validation fails
        """
        task = await self.get(user_id, task_id)
        if not task:
            raise ValueError("Task not found")

        # Track previous completion state for event publishing
        was_completed_before = task.completed

        # Apply updates with validation
        if title is not None:
            if not title or len(title.strip()) == 0:
                raise ValueError("Task title cannot be empty")
            if len(title) > 200:
                raise ValueError("Title exceeds 200 characters")
            task.title = title.strip()

        if description is not None:
            if description and len(description) > 1000:
                raise ValueError("Description exceeds 1000 characters")
            task.description = description

        if completed is not None:
            task.completed = completed

        if priority is not None:
            task.priority = priority

        if category is not None:
            task.category = category

        if due_date is not None:
            task.due_date = due_date

        if recurring_rule is not None:
            if recurring_rule and recurring_rule not in ["daily", "weekly", "monthly", "yearly"]:
                raise ValueError("Invalid recurring rule. Must be: daily, weekly, monthly, or yearly")
            if recurring_rule and not task.due_date and not due_date:
                raise ValueError("Recurring tasks must have a due date")
            task.recurring_rule = recurring_rule

        if recurring_end_date is not None:
            # Check against current due_date or new due_date
            check_due_date = due_date or task.due_date
            if check_due_date and recurring_end_date.date() <= check_due_date:
                raise ValueError("Recurring end date must be after due date")
            task.recurring_end_date = recurring_end_date

        if reminder_at is not None:
            # If reminder time is being changed to a future time, reset flags
            # and delete existing notification so it triggers again at new time
            old_reminder = task.reminder_at
            task.reminder_at = reminder_at

            # Check if time changed and is in the future
            if old_reminder != reminder_at:
                now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
                reminder_naive = reminder_at.replace(tzinfo=None) if reminder_at and reminder_at.tzinfo else reminder_at
                if reminder_naive and reminder_naive > now_utc:
                    # Reset flag so reminder service will send it again
                    task.reminder_sent = False

                    # Delete existing notification so a fresh one is created
                    existing_notif = await self.session.execute(
                        select(Notification).where(
                            and_(
                                Notification.task_id == task_id,
                                Notification.user_id == user_id
                            )
                        )
                    )
                    notif = existing_notif.scalar_one_or_none()
                    if notif:
                        await self.session.delete(notif)

        if tags is not None:
            if len(tags) > 50:
                raise ValueError("Maximum 50 tags allowed")
            for tag in tags:
                if not isinstance(tag, str):
                    raise ValueError("Tags must be strings")
                if len(tag) > 50:
                    raise ValueError("Each tag must be 50 characters or less")
            task.tags = tags

        task.updated_at = datetime.utcnow()  # Naive UTC datetime for database
        await self.session.commit()
        await self.session.refresh(task)

        # If task was just completed, publish task-completed event for recurring task generation
        if not was_completed_before and task.completed:
            await publish_task_completed(
                user_id=user_id,
                task_id=str(task.id),
                title=task.title,
                recurring_rule=task.recurring_rule,
                recurring_end_date=task.recurring_end_date.isoformat()
                if task.recurring_end_date else None,
            )

        return task

    async def delete(self, user_id: str, task_id: UUID) -> None:
        """
        Delete a task with ownership check.

        Also deletes all related notifications first to avoid foreign key violations.

        Args:
            user_id: User ID from JWT
            task_id: Task UUID

        Raises:
            ValueError: If task not found
        """
        task = await self.get(user_id, task_id)
        if not task:
            raise ValueError("Task not found")

        # Delete related notifications first (foreign key constraint)
        notifications_query = select(Notification).where(Notification.task_id == task_id)
        notifications_result = await self.session.execute(notifications_query)
        notifications = notifications_result.scalars().all()

        for notification in notifications:
            await self.session.delete(notification)

        await self.session.delete(task)
        await self.session.commit()

    async def toggle(self, user_id: str, task_id: UUID) -> Task:
        """
        Toggle task completion status.

        If toggling to completed and the task is recurring, publishes an event
        for the recurring-service to create the next instance.

        Args:
            user_id: User ID from JWT
            task_id: Task UUID

        Returns:
            Updated Task model

        Raises:
            ValueError: If task not found
        """
        task = await self.get(user_id, task_id)
        if not task:
            raise ValueError("Task not found")

        is_completing = not task.completed
        task.completed = not task.completed
        task.updated_at = datetime.utcnow()  # Naive UTC datetime for database

        await self.session.commit()
        await self.session.refresh(task)

        # Publish task-completed event for recurring task generation
        # The recurring-service will handle creating the next instance
        if is_completing:
            await publish_task_completed(
                user_id=user_id,
                task_id=str(task.id),
                title=task.title,
                recurring_rule=task.recurring_rule,
                recurring_end_date=task.recurring_end_date.isoformat()
                if task.recurring_end_date else None,
            )

        return task