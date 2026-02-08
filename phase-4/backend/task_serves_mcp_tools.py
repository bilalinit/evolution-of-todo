#!/usr/bin/env python3
"""
MCP Server: Task Management Tools
Exposes task CRUD operations via Model Context Protocol

Fixed version using async tools to prevent event loop conflicts.
"""
import sys
from pathlib import Path
from typing import Optional
from uuid import UUID
from datetime import date, datetime

# Add backend to path for imports
backend_path = Path(__file__).parent / "src"
sys.path.insert(0, str(backend_path))

from mcp.server.fastmcp import FastMCP
from backend.database import async_session_factory
from backend.models.task import Task, Priority, Category
from backend.services.task_service import TaskService

# Create MCP server using FastMCP pattern
mcp = FastMCP("TaskManagementTools")

# Tool: Create Task
@mcp.tool()
async def create_task(
    user_id: str,
    title: str,
    description: Optional[str] = None,
    priority: str = "medium",
    category: str = "other",
    due_date: Optional[str] = None
) -> dict:
    """
    Create a new task for the user.

    Args:
        user_id: User ID from JWT (automatically provided)
        title: Task title (required)
        description: Optional task description
        priority: Task priority - low, medium, high (default: medium)
        category: Task category - work, personal, shopping, health, other (default: other)
        due_date: Optional due date in YYYY-MM-DD format

    Returns:
        dict: {"success": True, "data": {...}} or {"success": False, "error": "..."}
    """
    try:
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
    except Exception as e:
        return {"success": False, "error": str(e)}


# Tool: List Tasks
@mcp.tool()
async def list_tasks(
    user_id: str,
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
        user_id: User ID from JWT (automatically provided)
        status: Filter by completion (all, completed, pending)
        priority: Filter by priority
        category: Filter by category
        search: Search in title and description
        sort_by: Field to sort by (created_at, due_date, priority, title)
        order: Sort order (asc, desc)

    Returns:
        dict: {"success": True, "data": {...}, "count": ...}
    """
    try:
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
    except Exception as e:
        return {"success": False, "error": str(e)}


# Tool: Update Task
@mcp.tool()
async def update_task(
    user_id: str,
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
        user_id: User ID from JWT (automatically provided)
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
    try:
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
    except Exception as e:
        return {"success": False, "error": str(e)}


# Tool: Delete Task
@mcp.tool()
async def delete_task(user_id: str, task_id: str) -> dict:
    """
    Delete a task.

    Args:
        user_id: User ID from JWT (automatically provided)
        task_id: Task UUID

    Returns:
        dict: {"success": True, "deleted": True} or {"success": False, "error": "..."}
    """
    try:
        async with async_session_factory() as session:
            service = TaskService(session)
            await service.delete(user_id=user_id, task_id=UUID(task_id))
            return {"success": True, "deleted": True}
    except Exception as e:
        return {"success": False, "error": str(e)}


# Tool: Toggle Task
@mcp.tool()
async def toggle_task(user_id: str, task_id: str) -> dict:
    """
    Toggle task completion status.

    Args:
        user_id: User ID from JWT (automatically provided)
        task_id: Task UUID

    Returns:
        dict: {"success": True, "data": {...}} or {"success": False, "error": "..."}
    """
    try:
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
    except Exception as e:
        return {"success": False, "error": str(e)}


if __name__ == "__main__":
    mcp.run(transport="stdio")