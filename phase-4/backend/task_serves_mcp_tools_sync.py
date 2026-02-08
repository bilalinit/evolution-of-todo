#!/usr/bin/env python3
"""
MCP Server: Task Management Tools (Synchronous Version)
Exposes task CRUD operations via Model Context Protocol
Uses synchronous database operations to avoid event loop issues
"""
import sys
import re
from pathlib import Path
from typing import Optional, Any
from uuid import UUID

# Add backend to path for imports
backend_path = Path(__file__).parent / "src"
sys.path.insert(0, str(backend_path))

from mcp.server.fastmcp import FastMCP
from backend.database import sync_session_factory
from backend.models.task import Task
from backend.services.task_service import TaskService

# Create MCP server using FastMCP pattern
mcp = FastMCP("TaskManagementTools")

def extract_user_id_from_context(context: Any) -> Optional[str]:
    """
    Extract user_id from agent context.
    The agent input is formatted as: "[User: user_id] message"
    """
    try:
        if hasattr(context, 'message') and context.message:
            message = context.message
        elif isinstance(context, str):
            message = context
        else:
            return None

        # Extract user_id from format "[User: user_id]"
        match = re.search(r'\[User:\s*([^\]]+)\]', message)
        if match:
            return match.group(1).strip()
    except:
        pass
    return None

# Tool: Create Task
@mcp.tool()
def create_task(
    context: Any,
    title: str,
    description: Optional[str] = None,
    priority: str = "medium",
    category: str = "other",
    due_date: Optional[str] = None
) -> dict:
    """
    Create a new task for the authenticated user.
    """
    user_id = extract_user_id_from_context(context)
    if not user_id:
        return {"success": False, "error": "User authentication required"}

    try:
        with sync_session_factory() as session:
            service = TaskService(session)

            # Parse date if provided
            due_date_obj = None
            if due_date:
                from datetime import date
                due_date_obj = date.fromisoformat(due_date)

            # Use synchronous service methods
            import asyncio
            result = asyncio.run(service.create(
                user_id=user_id,
                title=title,
                description=description,
                priority=priority,
                category=category,
                due_date=due_date_obj
            ))
            return {"success": True, "data": result.to_dict()}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Tool: List Tasks
@mcp.tool()
def list_tasks(
    context: Any,
    status: str = "all",
    priority: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    order: str = "desc"
) -> dict:
    """
    List tasks with filtering and pagination.
    """
    user_id = extract_user_id_from_context(context)
    if not user_id:
        return {"success": False, "error": "User authentication required"}

    try:
        with sync_session_factory() as session:
            service = TaskService(session)
            import asyncio
            result = asyncio.run(service.list(
                user_id=user_id,
                status=status,
                priority=priority,
                category=category,
                search=search,
                sort_by=sort_by,
                order=order
            ))
            return {"success": True, "data": result, "count": result["total"]}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Tool: Update Task
@mcp.tool()
def update_task(
    context: Any,
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
    """
    user_id = extract_user_id_from_context(context)
    if not user_id:
        return {"success": False, "error": "User authentication required"}

    try:
        with sync_session_factory() as session:
            service = TaskService(session)

            # Parse date if provided
            due_date_obj = None
            if due_date:
                from datetime import date
                due_date_obj = date.fromisoformat(due_date)

            import asyncio
            result = asyncio.run(service.update(
                user_id=user_id,
                task_id=UUID(task_id),
                title=title,
                description=description,
                completed=completed,
                priority=priority,
                category=category,
                due_date=due_date_obj
            ))
            return {"success": True, "data": result.to_dict()}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Tool: Delete Task
@mcp.tool()
def delete_task(context: Any, task_id: str) -> dict:
    """
    Delete a task.
    """
    user_id = extract_user_id_from_context(context)
    if not user_id:
        return {"success": False, "error": "User authentication required"}

    try:
        with sync_session_factory() as session:
            service = TaskService(session)
            import asyncio
            asyncio.run(service.delete(user_id=user_id, task_id=UUID(task_id)))
            return {"success": True, "deleted": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Tool: Toggle Task
@mcp.tool()
def toggle_task(context: Any, task_id: str) -> dict:
    """
    Toggle task completion status.
    """
    user_id = extract_user_id_from_context(context)
    if not user_id:
        return {"success": False, "error": "User authentication required"}

    try:
        with sync_session_factory() as session:
            service = TaskService(session)
            import asyncio
            result = asyncio.run(service.toggle(user_id=user_id, task_id=UUID(task_id)))
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