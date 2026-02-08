"""
Task Service: Business logic for task operations
Service layer decoupled from API/MCP presentation layers
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from uuid import UUID
from datetime import date, datetime
from typing import Optional, List, Dict, Any

from backend.models.task import Task, TaskCreate, TaskUpdate, TaskListResponse


class TaskService:
    """Service layer for task operations - decoupled from API/MCP layers."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        user_id: str,
        title: str,
        description: Optional[str] = None,
        priority: str = "medium",
        category: str = "other",
        due_date: Optional[date] = None
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

        # Create task
        task = Task(
            user_id=user_id,
            title=title.strip(),
            description=description,
            priority=priority,
            category=category,
            due_date=due_date
        )
        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)
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
        due_date: Optional[date] = None
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

        Returns:
            Updated Task model

        Raises:
            ValueError: If task not found or validation fails
        """
        task = await self.get(user_id, task_id)
        if not task:
            raise ValueError("Task not found")

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

        task.updated_at = datetime.utcnow()
        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def delete(self, user_id: str, task_id: UUID) -> None:
        """
        Delete a task with ownership check.

        Args:
            user_id: User ID from JWT
            task_id: Task UUID

        Raises:
            ValueError: If task not found
        """
        task = await self.get(user_id, task_id)
        if not task:
            raise ValueError("Task not found")

        await self.session.delete(task)
        await self.session.commit()

    async def toggle(self, user_id: str, task_id: UUID) -> Task:
        """
        Toggle task completion status.

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

        task.completed = not task.completed
        task.updated_at = datetime.utcnow()
        await self.session.commit()
        await self.session.refresh(task)
        return task