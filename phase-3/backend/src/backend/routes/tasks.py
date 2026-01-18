"""
Task routes for CRUD operations.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from uuid import UUID

from backend.database import get_session
from backend.middleware.auth import get_current_user, verify_user_ownership
from backend.models.task import (
    Task, TaskCreate, TaskUpdate, TaskListResponse, TaskDetailResponse,
    Priority, Category
)

router = APIRouter()


@router.get("/tasks", response_model=TaskListResponse)
async def get_tasks(
    user_id: str,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
    # Query parameters for filtering
    status: Optional[str] = Query(None, description="Filter by status: pending or completed"),
    priority: Optional[Priority] = Query(None, description="Filter by priority"),
    category: Optional[Category] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    sort_by: Optional[str] = Query("created_at", description="Sort field: created_at, due_date, priority, title"),
    order: Optional[str] = Query("desc", description="Sort order: asc or desc")
):
    """
    Get all tasks for a user with optional filtering and sorting.

    Requires authentication and verifies user ownership.
    """
    # Verify user ownership
    await verify_user_ownership(user_id, current_user)

    # Build query
    query = select(Task).where(Task.user_id == user_id)

    # Apply filters
    if status:
        completed = status.lower() == "completed"
        query = query.where(Task.completed == completed)

    if priority:
        query = query.where(Task.priority == priority)

    if category:
        query = query.where(Task.category == category)

    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                Task.title.ilike(search_pattern),
                Task.description.ilike(search_pattern)
            )
        )

    # Apply sorting
    sort_field = getattr(Task, sort_by, Task.created_at)
    if order.lower() == "asc":
        query = query.order_by(sort_field.asc())
    else:
        query = query.order_by(sort_field.desc())

    # Execute query
    result = await session.execute(query)
    tasks = result.scalars().all()

    return TaskListResponse.from_tasks(tasks)


@router.get("/tasks/{task_id}", response_model=TaskDetailResponse)
async def get_task(
    user_id: str,
    task_id: UUID,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Get a specific task by ID.

    Requires authentication and verifies user ownership.
    """
    # Verify user ownership
    await verify_user_ownership(user_id, current_user)

    # Query specific task
    query = select(Task).where(
        and_(
            Task.id == task_id,
            Task.user_id == user_id
        )
    )
    result = await session.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return TaskDetailResponse.from_task(task)


@router.post("/tasks", response_model=TaskDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Create a new task for the authenticated user.

    Requires authentication and verifies user ownership.
    """
    # Verify user ownership
    await verify_user_ownership(user_id, current_user)

    # Create task model
    task = Task(
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        category=task_data.category,
        due_date=task_data.due_date,
        user_id=user_id
    )

    # Add to database
    session.add(task)
    await session.commit()
    await session.refresh(task)

    return TaskDetailResponse.from_task(task)


@router.put("/tasks/{task_id}", response_model=TaskDetailResponse)
async def update_task(
    user_id: str,
    task_id: UUID,
    task_data: TaskUpdate,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Update an existing task.

    Requires authentication and verifies user ownership.
    """
    # Verify user ownership
    await verify_user_ownership(user_id, current_user)

    # Get existing task
    query = select(Task).where(
        and_(
            Task.id == task_id,
            Task.user_id == user_id
        )
    )
    result = await session.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Update fields
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.completed is not None:
        task.completed = task_data.completed
    if task_data.priority is not None:
        task.priority = task_data.priority
    if task_data.category is not None:
        task.category = task_data.category
    if task_data.due_date is not None:
        task.due_date = task_data.due_date

    # Update timestamp
    from datetime import datetime
    task.updated_at = datetime.utcnow()

    await session.commit()
    await session.refresh(task)

    return TaskDetailResponse.from_task(task)


@router.patch("/tasks/{task_id}/complete", response_model=TaskDetailResponse)
async def toggle_complete(
    user_id: str,
    task_id: UUID,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Toggle task completion status.

    Requires authentication and verifies user ownership.
    """
    # Verify user ownership
    await verify_user_ownership(user_id, current_user)

    # Get existing task
    query = select(Task).where(
        and_(
            Task.id == task_id,
            Task.user_id == user_id
        )
    )
    result = await session.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Toggle completion
    task.completed = not task.completed

    # Update timestamp
    from datetime import datetime
    task.updated_at = datetime.utcnow()

    await session.commit()
    await session.refresh(task)

    return TaskDetailResponse.from_task(task)


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: str,
    task_id: UUID,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Delete a task.

    Requires authentication and verifies user ownership.
    """
    # Verify user ownership
    await verify_user_ownership(user_id, current_user)

    # Get existing task
    query = select(Task).where(
        and_(
            Task.id == task_id,
            Task.user_id == user_id
        )
    )
    result = await session.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Delete task
    await session.delete(task)
    await session.commit()

    # No content returned for DELETE
    return