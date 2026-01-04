"""
UI Layer for Menu-Driven CLI Todo Application.

Provides all visual rendering functions for the menu-driven interface.
"""

from typing import List, Optional
from datetime import datetime

from .utils import (
    create_box,
    create_separator,
    wrap_text,
    sanitize_input,
    validate_menu_choice,
    validate_task_title_for_menu,
    format_task_row,
    get_progress_stats,
    COLOR_HEADER,
    COLOR_BORDER,
    COLOR_SUCCESS,
    COLOR_ERROR,
    COLOR_WARNING,
    COLOR_INFO,
    COLOR_RESET,
)


def display_header() -> None:
    """Display application banner with ASCII art."""
    header = f"""{COLOR_HEADER}
╔════════════════════════════════════════════════════════════╗
║                    📋 TODO APPLICATION                     ║
║                    Menu-Driven Interface                   ║
╚════════════════════════════════════════════════════════════╝{COLOR_RESET}
"""
    print(header)


def display_main_menu() -> None:
    """Display main menu with 7 options."""
    menu_items = [
        "📝 Add New Task",
        "📋 View All Tasks",
        "✏️  Update Task",
        "🔄 Toggle Task Status",
        "🗑️  Delete Task",
        "❓ Help & Instructions",
        "👋 Exit Application"
    ]

    content = [f"{i+1}. {item}" for i, item in enumerate(menu_items)]
    box = create_box(" MAIN MENU ", content, width=55)
    print(f"\n{COLOR_BORDER}{box}{COLOR_RESET}")


def display_help() -> None:
    """Display comprehensive help screen."""
    help_content = [
        "Welcome to Todo Application!",
        "",
        "Navigation:",
        "  • Use numbers 1-7 to select menu options",
        "  • Follow the guided prompts for each operation",
        "  • Press Enter to continue after each step",
        "",
        "Operations:",
        "  1. Add: Create new tasks with descriptions",
        "  2. View: See all tasks with status and dates",
        "  3. Update: Modify existing task titles",
        "  4. Toggle: Mark tasks as complete/incomplete",
        "  5. Delete: Remove tasks (with confirmation)",
        "  6. Help: Show this screen",
        "  7. Exit: Close the application",
        "",
        "Tips:",
        "  • All operations guide you step-by-step",
        "  • You can cancel any operation",
        "  • Tasks are saved automatically",
        "  • No commands to remember!"
    ]

    box = create_box(" HELP ", help_content, width=60)
    print(f"\n{COLOR_INFO}{box}{COLOR_RESET}")


def display_exit_message() -> None:
    """Display farewell message."""
    message = create_box(" GOODBYE! ", ["Thank you for using Todo Application!", "See you soon! 👋"], width=50)
    print(f"\n{COLOR_SUCCESS}{message}{COLOR_RESET}")


def display_message(message: str, msg_type: str = "info") -> None:
    """
    Display generic colored message.

    Args:
        message: Text to display
        msg_type: One of ["success", "error", "info", "warning"]
    """
    color_map = {
        "success": COLOR_SUCCESS,
        "error": COLOR_ERROR,
        "info": COLOR_INFO,
        "warning": COLOR_WARNING,
    }

    color = color_map.get(msg_type, COLOR_INFO)
    prefix = "✓" if msg_type == "success" else "✗" if msg_type == "error" else "ℹ"

    print(f"\n{color}{prefix} {message}{COLOR_RESET}")


def display_pause() -> None:
    """Wait for user to press Enter."""
    input(f"\n{COLOR_INFO}Press Enter to continue...{COLOR_RESET}")


def display_add_form() -> Optional[str]:
    """
    Guide user through task creation.

    Returns:
        Validated task title or None if cancelled
    """
    print(f"\n{COLOR_HEADER}=== Add New Task ==={COLOR_RESET}")

    while True:
        print(f"\n{COLOR_INFO}Enter task description (or leave empty to cancel):{COLOR_RESET}")
        user_input = input("> ").strip()

        if not user_input:
            display_message("Operation cancelled.", "info")
            return None

        # Validate input
        sanitized = sanitize_input(user_input)
        is_valid, error_msg = validate_task_title_for_menu(sanitized)

        if is_valid:
            # Show confirmation
            print(f"\n{COLOR_INFO}Task to add: {sanitized}{COLOR_RESET}")
            print(f"{COLOR_INFO}Save this task? (y/n):{COLOR_RESET}")
            confirm = input("> ").lower().strip()

            if confirm in ['y', 'yes']:
                display_message("Task saved successfully!", "success")
                return sanitized
            else:
                display_message("Task not saved. You can try again.", "info")
                continue
        else:
            display_message(error_msg, "error")
            display_pause()


def display_list_view(tasks: List['Task']) -> None:
    """
    Display formatted task list with statistics.

    Args:
        tasks: List of Task objects (can be empty)
    """
    if not tasks:
        display_empty_state()
        return

    # Progress statistics
    stats = get_progress_stats(tasks)
    stats_box = create_box(" PROGRESS ", [stats], width=50)
    print(f"\n{COLOR_SUCCESS}{stats_box}{COLOR_RESET}")

    # Task list
    task_lines = []
    for task in tasks:
        task_lines.append(format_task_row(task))

    task_box = create_box(" TASKS ", task_lines, width=65)
    print(f"\n{COLOR_BORDER}{task_box}{COLOR_RESET}")


def display_empty_state() -> None:
    """Display empty state message."""
    content = [
        "No tasks found!",
        "",
        "Get started by adding your first task.",
        "Select option 1 from the main menu."
    ]
    box = create_box(" NO TASKS ", content, width=45)
    print(f"\n{COLOR_INFO}{box}{COLOR_RESET}")


def display_update_step1(tasks: List['Task']) -> Optional[int]:
    """
    Select task to update.

    Args:
        tasks: List of available tasks

    Returns:
        Valid task ID or None if cancelled
    """
    if not tasks:
        display_message("No tasks available to update.", "warning")
        return None

    print(f"\n{COLOR_HEADER}=== Update Task - Step 1: Select Task ==={COLOR_RESET}")

    # Show task selection list
    selection_lines = []
    for task in tasks:
        status = "☑" if task.completed else "☐"
        selection_lines.append(f"[{task.id}] {status} {task.title}")

    box = create_box(" SELECT TASK ", selection_lines, width=60)
    print(f"\n{COLOR_BORDER}{box}{COLOR_RESET}")

    while True:
        print(f"\n{COLOR_INFO}Enter task ID to update (or 0 to cancel):{COLOR_RESET}")
        task_id_input = input("> ").strip()

        if task_id_input == "0":
            display_message("Update cancelled.", "info")
            return None

        is_valid, error_msg = validate_menu_choice(task_id_input, len(tasks))
        if not is_valid:
            display_message(error_msg, "error")
            continue

        # Check if task ID exists
        task_id = int(task_id_input)
        task_exists = any(task.id == task_id for task in tasks)

        if not task_exists:
            display_message(f"Task with ID {task_id} not found.", "error")
            continue

        return task_id


def display_update_step2(task: 'Task') -> Optional[str]:
    """
    Edit task title.

    Args:
        task: Task object to update

    Returns:
        New validated title or None if cancelled
    """
    print(f"\n{COLOR_HEADER}=== Update Task - Step 2: Edit Title ==={COLOR_RESET}")

    # Show current title
    current_box = create_box(" CURRENT TITLE ", [task.title], width=50)
    print(f"\n{COLOR_INFO}{current_box}{COLOR_RESET}")

    while True:
        print(f"\n{COLOR_INFO}Enter new task title (or leave empty to cancel):{COLOR_RESET}")
        new_title = input("> ").strip()

        if not new_title:
            display_message("Update cancelled.", "info")
            return None

        # Validate input
        sanitized = sanitize_input(new_title)
        is_valid, error_msg = validate_task_title_for_menu(sanitized)

        if is_valid:
            # Show confirmation
            print(f"\n{COLOR_INFO}New title: {sanitized}{COLOR_RESET}")
            print(f"{COLOR_INFO}Save changes? (y/n):{COLOR_RESET}")
            confirm = input("> ").lower().strip()

            if confirm in ['y', 'yes']:
                display_message("Task updated successfully!", "success")
                return sanitized
            else:
                display_message("Changes not saved. You can try again.", "info")
                continue
        else:
            display_message(error_msg, "error")
            display_pause()


def display_toggle_confirmation(task: 'Task') -> bool:
    """
    Confirm task status toggle.

    Args:
        task: Task object

    Returns:
        True if user confirms, False if cancelled
    """
    current_status = "COMPLETED" if task.completed else "PENDING"
    new_status = "PENDING" if task.completed else "COMPLETED"

    content = [
        f"Task: {task.title}",
        f"Current Status: {current_status}",
        f"New Status: {new_status}",
        "",
        "Are you sure you want to toggle this task?"
    ]

    box = create_box(" CONFIRM TOGGLE ", content, width=55)
    print(f"\n{COLOR_WARNING}{box}{COLOR_RESET}")

    print(f"\n{COLOR_WARNING}Enter 'yes' to confirm or anything else to cancel:{COLOR_RESET}")
    confirm = input("> ").lower().strip()

    if confirm == 'yes':
        display_message(f"Task status changed to {new_status}!", "success")
        return True
    else:
        display_message("Toggle cancelled.", "info")
        return False


def display_delete_confirmation(task: 'Task') -> bool:
    """
    Confirm task deletion.

    Args:
        task: Task object

    Returns:
        True if user confirms, False if cancelled
    """
    content = [
        f"⚠️  WARNING: DESTRUCTIVE OPERATION ⚠️",
        "",
        f"Task: {task.title}",
        f"ID: {task.id}",
        "",
        "This action cannot be undone!",
        "Are you absolutely sure?"
    ]

    box = create_box(" DELETE CONFIRMATION ", content, width=60)
    print(f"\n{COLOR_ERROR}{box}{COLOR_RESET}")

    print(f"\n{COLOR_ERROR}Type 'DELETE' to confirm or anything else to cancel:{COLOR_RESET}")
    confirm = input("> ").strip()

    if confirm == 'DELETE':
        display_message("Task deleted successfully!", "success")
        return True
    else:
        display_message("Deletion cancelled.", "info")
        return False


def display_confirmation_prompt(prompt: str) -> bool:
    """
    Generic confirmation dialog.

    Args:
        prompt: Question to ask

    Returns:
        True if user confirms, False if cancelled
    """
    print(f"\n{COLOR_WARNING}{prompt} (y/n):{COLOR_RESET}")
    response = input("> ").lower().strip()

    return response in ['y', 'yes']