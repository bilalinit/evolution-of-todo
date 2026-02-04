"""
Direct function tools for OpenAI Agents SDK
Bypasses MCP subprocess issues by using direct function integration
"""
import asyncio
import re
from typing import Optional, Any
from uuid import UUID
from datetime import date

from agents import function_tool
from backend.database import async_session_factory
from backend.models.task import Task
from backend.services.task_service import TaskService


def extract_user_id_from_context(context: Any) -> Optional[str]:
    """Extract user_id from agent context in format "[User: user_id] message"""
    try:
        if hasattr(context, 'message') and context.message:
            message = context.message
        elif isinstance(context, str):
            message = context
        else:
            return None

        match = re.search(r'\[User:\s*([^\]]+)\]', message)
        if match:
            return match.group(1).strip()
    except:
        pass
    return None


@function_tool
def create_task(
    context: str,
    title: str,
    description: Optional[str] = None,
    priority: str = "medium",
    category: str = "other",
    due_date: Optional[str] = None
) -> dict:
    """
    Create a new task for the authenticated user.

    Args:
        context: Agent context containing user_id in format "[User: user_id] message"
        title: Task title (1-200 characters)
        description: Optional description (max 1000 characters)
        priority: Priority level (low, medium, high)
        category: Task category (work, personal, shopping, health, other)
        due_date: Optional due date in ISO format

    Returns:
        dict: {"success": True, "data": {...}} or {"success": False, "error": "..."}
    """
    async def _create():
        user_id = extract_user_id_from_context(context)
        if not user_id:
            return {"success": False, "error": "User authentication required"}

        async with async_session_factory() as session:
            service = TaskService(session)

            # Parse date if provided
            due_date_obj = None
            if due_date:
                due_date_obj = date.fromisoformat(due_date)

            result = await service.create(
                user_id=user_id,
                title=title,
                description=description,
                priority=priority,
                category=category,
                due_date=due_date_obj
            )
            return {"success": True, "data": result.to_dict()}

    try:
        return asyncio.run(_create())
    except Exception as e:
        return {"success": False, "error": str(e)}


@function_tool
def list_tasks(
    context: str,
    status: str = "all",
    priority: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    order: str = "desc"
) -> dict:
    """
    List tasks with filtering and pagination.

    Args:
        context: Agent context containing user_id in format "[User: user_id] message"
        status: Filter by completion (all, completed, pending)
        priority: Filter by priority
        category: Filter by category
        search: Search in title and description
        sort_by: Field to sort by (created_at, due_date, priority, title)
        order: Sort order (asc, desc)

    Returns:
        dict: {"success": True, "data": {...}, "count": ...}
    """
    async def _list():
        user_id = extract_user_id_from_context(context)
        if not user_id:
            return {"success": False, "error": "User authentication required"}

        async with async_session_factory() as session:
            service = TaskService(session)
            result = await service.list(
                user_id=user_id,
                status=status,
                priority=priority,
                category=category,
                search=search,
                sort_by=sort_by,
                order=order
            )
            return {"success": True, "data": result, "count": result["total"]}

    try:
        return asyncio.run(_list())
    except Exception as e:
        return {"success": False, "error": str(e)}


@function_tool
def update_task(
    context: str,
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    completed: Optional[bool] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    due_date: Optional[str] = None
) -> dict:
    """
    Update an existing task.

    Args:
        context: Agent context containing user_id in format "[User: user_id] message"
        task_id: Task UUID
        title: New title (optional)
        description: New description (optional, None to clear)
        completed: Completion status (optional)
        priority: New priority (optional)
        category: New category (optional)
        due_date: New due date (optional, None to clear)

    Returns:
        dict: {"success": True, "data": {...}} or {"success": False, "error": "..."}
    """
    async def _update():
        user_id = extract_user_id_from_context(context)
        if not user_id:
            return {"success": False, "error": "User authentication required"}

        async with async_session_factory() as session:
            service = TaskService(session)

            # Parse date if provided
            due_date_obj = None
            if due_date:
                due_date_obj = date.fromisoformat(due_date)

            result = await service.update(
                user_id=user_id,
                task_id=UUID(task_id),
                title=title,
                description=description,
                completed=completed,
                priority=priority,
                category=category,
                due_date=due_date_obj
            )
            return {"success": True, "data": result.to_dict()}

    try:
        return asyncio.run(_update())
    except Exception as e:
        return {"success": False, "error": str(e)}


@function_tool
def delete_task(context: str, task_id: str) -> dict:
    """
    Delete a task.

    Args:
        context: Agent context containing user_id in format "[User: user_id] message"
        task_id: Task UUID

    Returns:
        dict: {"success": True, "deleted": True} or {"success": False, "error": "..."}
    """
    async def _delete():
        user_id = extract_user_id_from_context(context)
        if not user_id:
            return {"success": False, "error": "User authentication required"}

        async with async_session_factory() as session:
            service = TaskService(session)
            await service.delete(user_id=user_id, task_id=UUID(task_id))
            return {"success": True, "deleted": True}

    try:
        return asyncio.run(_delete())
    except Exception as e:
        return {"success": False, "error": str(e)}


@function_tool
def toggle_task(context: str, task_id: str) -> dict:
    """
    Toggle task completion status.

    Args:
        context: Agent context containing user_id in format "[User: user_id] message"
        task_id: Task UUID

    Returns:
        dict: {"success": True, "data": {...}} or {"success": False, "error": "..."}
    """
    async def _toggle():
        user_id = extract_user_id_from_context(context)
        if not user_id:
            return {"success": False, "error": "User authentication required"}

        async with async_session_factory() as session:
            service = TaskService(session)
            result = await service.toggle(user_id=user_id, task_id=UUID(task_id))
            return {
                "success": True,
                "data": {
                    "id": str(result.id),
                    "title": result.title,
                    "completed": result.completed,
                    "new_status": "completed" if result.completed else "pending"
                }
            }

    try:
        return asyncio.run(_toggle())
    except Exception as e:
        return {"success": False, "error": str(e)}


# Export all tools
ALL_TOOLS = [create_task, list_tasks, update_task, delete_task, toggle_task]