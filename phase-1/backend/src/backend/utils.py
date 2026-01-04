"""
Validation and formatting utilities for the CLI Todo Application.

Includes UI constants, box drawing utilities, and input validation functions
for the menu-driven interface transformation.
"""

from typing import List, Any, Tuple, TYPE_CHECKING

if TYPE_CHECKING:
    from .models import Task


# ANSI Color Constants for UI
COLOR_HEADER = "\033[95m"    # Purple
COLOR_BORDER = "\033[96m"    # Cyan
COLOR_SUCCESS = "\033[92m"   # Green
COLOR_ERROR = "\033[91m"     # Red
COLOR_WARNING = "\033[93m"   # Yellow
COLOR_INFO = "\033[94m"      # Blue
COLOR_RESET = "\033[0m"      # Reset

# Box Drawing Characters
BOX_CHARS = {
    "top_left": "┌",
    "top_right": "┐",
    "bottom_left": "└",
    "bottom_right": "┘",
    "horizontal": "─",
    "vertical": "│",
    "tee_left": "├",
    "tee_right": "┤",
    "tee_top": "┬",
    "tee_bottom": "┴",
    "plus": "┼",
}




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


def validate_task_id_for_menu(task_id: str) -> Tuple[bool, str]:
    """
    Validate task ID for menu operations.

    Args:
        task_id: String representation of task ID

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not task_id or not task_id.strip():
        return False, "Please enter a task ID."

    # Handle negative numbers and non-numeric
    try:
        task_id_int = int(task_id)
        if task_id_int <= 0:
            return False, "Task ID must be a positive integer."
    except ValueError:
        return False, "Task ID must be a valid integer."

    return True, ""


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


# New UI Utility Functions for Menu-Driven Interface


def create_box(title: str, content: List[str], width: int = 50) -> str:
    """
    Create formatted box with title and content using box-drawing characters.

    Args:
        title: Box header text
        content: List of lines to display inside the box
        width: Box width (default 50)

    Returns:
        String with box-drawing characters
    """
    # Ensure width is reasonable
    width = max(20, min(width, 80))

    # Prepare content lines with proper padding
    processed_content = []
    for line in content:
        # Handle long lines by wrapping
        if len(line) > width - 4:  # Account for borders and padding
            wrapped_lines = wrap_text(line, width - 4)
            processed_content.extend(wrapped_lines)
        else:
            processed_content.append(line)

    # Build the box
    lines = []

    # Top border with title
    title_display = f" {title} " if title else ""
    top_line = (
        BOX_CHARS["top_left"]
        + BOX_CHARS["horizontal"] * (width - 2)
        + BOX_CHARS["top_right"]
    )
    if title_display and len(title_display) < width - 4:
        # Insert title in top border
        padding = width - 2 - len(title_display)
        left_pad = padding // 2
        right_pad = padding - left_pad
        top_line = (
            BOX_CHARS["top_left"]
            + BOX_CHARS["horizontal"] * left_pad
            + title_display
            + BOX_CHARS["horizontal"] * right_pad
            + BOX_CHARS["top_right"]
        )
    lines.append(top_line)

    # Content lines
    for line in processed_content:
        padded_line = line.ljust(width - 4)
        lines.append(f"{BOX_CHARS['vertical']} {padded_line} {BOX_CHARS['vertical']}")

    # Bottom border
    lines.append(
        BOX_CHARS["bottom_left"]
        + BOX_CHARS["horizontal"] * (width - 2)
        + BOX_CHARS["bottom_right"]
    )

    return "\n".join(lines)


def create_separator(width: int = 50) -> str:
    """
    Create a horizontal separator line.

    Args:
        width: Line width (default 50)

    Returns:
        Separator string
    """
    width = max(10, min(width, 100))
    return BOX_CHARS["horizontal"] * width


def wrap_text(text: str, width: int) -> List[str]:
    """
    Wrap long text to fit specified width.

    Args:
        text: Text to wrap
        width: Maximum line width

    Returns:
        List of wrapped lines
    """
    if width <= 0:
        return [text]

    words = text.split()
    if not words:
        return [""]

    lines = []
    current_line = []

    for word in words:
        # Check if adding this word would exceed width
        test_line = " ".join(current_line + [word]) if current_line else word
        if len(test_line) <= width:
            current_line.append(word)
        else:
            # Start new line
            if current_line:
                lines.append(" ".join(current_line))
            current_line = [word]

    # Add the last line
    if current_line:
        lines.append(" ".join(current_line))

    return lines


def sanitize_input(text: str) -> str:
    """
    Clean user input by removing control characters and normalizing whitespace.

    Args:
        text: Raw user input

    Returns:
        Sanitized text
    """
    if not text:
        return ""

    # Remove control characters (except tabs and newlines which we'll handle)
    sanitized = "".join(ch for ch in text if ord(ch) >= 32 or ch in "\t\n\r")

    # Strip leading/trailing whitespace
    sanitized = sanitized.strip()

    # Collapse multiple spaces into single spaces
    import re
    sanitized = re.sub(r'\s+', ' ', sanitized)

    return sanitized


def validate_menu_choice(input_str: str, max_choice: int = 7) -> Tuple[bool, str]:
    """
    Validate menu choice input.

    Args:
        input_str: User input string
        max_choice: Maximum valid choice number

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not input_str or not input_str.strip():
        return False, "Please enter a choice."

    if not input_str.isdigit():
        return False, "Please enter a valid number."

    choice = int(input_str)
    if choice < 1 or choice > max_choice:
        return False, f"Please enter a number between 1-{max_choice}."

    return True, ""


def validate_task_title_for_menu(title: str) -> Tuple[bool, str]:
    """
    Validate task title for menu-driven interface.

    Args:
        title: Task title to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not title:
        return False, "Task title cannot be empty."

    sanitized = sanitize_input(title)
    if not sanitized:
        return False, "Task title cannot be empty or whitespace-only."

    if len(sanitized) > 500:
        return False, "Task title cannot exceed 500 characters."

    return True, ""




def format_task_row(task: 'Task', index: int = 0) -> str:
    """
    Format single task for list display.

    Args:
        task: Task object
        index: Display index (optional)

    Returns:
        Formatted string with completion indicator and timestamp
    """
    status = "☑" if task.completed else "☐"
    created_str = task.created_at.strftime("%Y-%m-%d %H:%M:%S")

    if index > 0:
        return f"[{task.id}] {status} {task.title}\n    📅 Created: {created_str}"
    else:
        return f"[{task.id}] {status} {task.title}\n    📅 Created: {created_str}"


def get_progress_stats(tasks: List['Task']) -> str:
    """
    Calculate completion statistics.

    Args:
        tasks: List of tasks

    Returns:
        String with counts and percentage
    """
    if not tasks:
        return "No tasks available."

    total = len(tasks)
    completed = sum(1 for task in tasks if task.completed)
    pending = total - completed
    percentage = (completed / total * 100) if total > 0 else 0

    return f"✅ Completed: {completed} | ☐ Pending: {pending} | {percentage:.1f}% Done"
