"""
Validation and formatting utilities for the CLI Todo Application.
"""

from typing import List, Any


def validate_title(title: str) -> str:
    """
    Validate and sanitize task title.

    Args:
        title: The task title to validate

    Returns:
        Sanitized title

    Raises:
        ValueError: If title is empty or whitespace-only
    """
    if not title or not title.strip():
        raise ValueError("Task title cannot be empty")

    sanitized = title.strip()
    if len(sanitized) > 500:
        raise ValueError("Task title cannot exceed 500 characters")

    return sanitized


def validate_task_id(task_id: str) -> int:
    """
    Validate and parse task ID.

    Args:
        task_id: String representation of task ID

    Returns:
        Integer task ID

    Raises:
        ValueError: If task_id is not a valid positive integer
    """
    try:
        task_id_int = int(task_id)
        if task_id_int <= 0:
            raise ValueError("Task ID must be a positive integer")
        return task_id_int
    except ValueError as e:
        # If it's already our custom error, re-raise it
        if "positive integer" in str(e):
            raise e
        # Otherwise, it's a conversion error
        raise ValueError("Task ID must be a valid integer")


def format_table(tasks: List[Any]) -> str:
    """
    Format tasks as a table for CLI display.

    Args:
        tasks: List of tasks to display

    Returns:
        Formatted table string
    """
    if not tasks:
        return "No tasks found."

    # Calculate column widths
    id_width = max(len("ID"), max(len(str(task.id)) for task in tasks))
    status_width = max(len("Status"), 8)  # "✓" or "✗"
    title_width = max(len("Title"), max(len(task.title) for task in tasks))

    # Header
    header = f"{'ID':<{id_width}}  {'Status':<{status_width}}  {'Title':<{title_width}}  {'Created':<19}"
    separator = "-" * len(header)

    # Rows
    rows = []
    for task in tasks:
        status = "✓" if task.completed else "✗"
        created_str = task.created_at.strftime("%Y-%m-%d %H:%M:%S")
        row = f"{task.id:<{id_width}}  {status:<{status_width}}  {task.title:<{title_width}}  {created_str:<19}"
        rows.append(row)

    return "\n".join([header, separator] + rows)


def format_success(message: str) -> str:
    """
    Format a success message with green indicator.

    Args:
        message: Success message

    Returns:
        Formatted success message
    """
    return f"✓ {message}"


def format_error(message: str) -> str:
    """
    Format an error message with red indicator.

    Args:
        message: Error message

    Returns:
        Formatted error message
    """
    return f"✗ {message}"


def format_info(message: str) -> str:
    """
    Format an informational message.

    Args:
        message: Info message

    Returns:
        Formatted info message
    """
    return f"ℹ {message}"
