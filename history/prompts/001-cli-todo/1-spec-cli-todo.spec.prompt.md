---
id: 1
title: spec cli todo application
stage: spec
date: 2025-12-28
surface: agent
model: claude-sonnet-4-5
feature: 001-cli-todo
branch: 001-cli-todo
user: user
command: /sp.specify lets create specs, name the branch "001-cli-todo", here is the specs # Command-Line Todo Application - Detailed Specifications

## Overview

This document provides a comprehensive specification for a command-line todo application built using Python 3.13+. The application operates entirely in-memory (no persistent storage) and provides a text-based interface for managing tasks.

---

## Technology Stack

| Component | Requirement |
|-----------|-------------|
| **Language** | Python 3.13 or newer |
| **Package Manager** | UV |
| **AI Assistant** | Claude Code |

---

## Data Model

### Task Entity

Each task in the application is represented by the following data structure:

```python
@dataclass
class Task:
    id: int              # Unique identifier, auto-incremented
    title: str           # Task title/description (required, non-empty)
    completed: bool      # Completion status (default: False)
    created_at: datetime # Timestamp of creation
```

### Task Storage

- Tasks are stored in an in-memory list: `tasks: list[Task]`
- A global counter `next_id: int` tracks the next available task ID
- **No persistence**: All data is lost when the program exits

---

## Application Architecture

### Module Structure

Created using `uv init --package backend`:

```
backend/
├── pyproject.toml        # Project configuration and dependencies
├── README.md             # Project documentation
└── src/
    └── backend/
        ├── __init__.py       # Package initialization
        ├── main.py           # Entry point, main loop
        ├── models.py         # Task dataclass definition
        ├── task_manager.py   # Core CRUD operations
        ├── cli.py            # Command-line interface handlers
        └── utils.py          # Helper functions (validation, formatting)
```

### Core Components

1. **TaskManager Class**: Handles all task operations (add, delete, update, view, toggle)
2. **CLI Module**: Parses user input and displays output
3. **Main Loop**: Continuously prompts for user commands until exit

---

## Feature Specifications

### Feature 1: Add Task

#### Purpose
Create a new todo item and add it to the task list.

#### User Interaction
```
Command: add
Prompt: Enter task title: <user input>
Output: ✓ Task added successfully! (ID: <id>)
```

#### Implementation Details

| Aspect | Specification |
|--------|---------------|
| **Input Validation** | Title must be non-empty and non-whitespace |
| **ID Assignment** | Auto-increment from global counter |
| **Default Status** | `completed = False` |
| **Timestamp** | Set `created_at` to current datetime |

#### Error Handling
- Empty title → Display: `✗ Error: Task title cannot be empty.`
- Whitespace-only title → Display: `✗ Error: Task title cannot be empty.`

#### Method Signature
```python
def add_task(self, title: str) -> Task:
    """
    Add a new task to the list.

    Args:
        title: The task description (must be non-empty)

    Returns:
        The newly created Task object

    Raises:
        ValueError: If title is empty or whitespace-only
    """
```

---

### Feature 2: Delete Task

#### Purpose
Remove an existing task from the task list by its ID.

#### User Interaction
```
Command: delete
Prompt: Enter task ID to delete: <user input>
Output: ✓ Task "<title>" deleted successfully!
```

#### Implementation Details

| Aspect | Specification |
|--------|---------------|
| **Input Validation** | ID must be a valid positive integer |
| **Lookup** | Find task by ID in the task list |
| **Removal** | Remove the task object from the list |

#### Error Handling
- Invalid ID format → Display: `✗ Error: Please enter a valid task ID (number).`
- Task not found → Display: `✗ Error: No task found with ID <id>.`

#### Method Signature
```python
def delete_task(self, task_id: int) -> Task:
    """
    Delete a task by its ID.

    Args:
        task_id: The unique identifier of the task to delete

    Returns:
        The deleted Task object

    Raises:
        ValueError: If task_id is not a positive integer
        KeyError: If no task exists with the given ID
    """
```

---

### Feature 3: Update Task

#### Purpose
Modify the title of an existing task.

#### User Interaction
```
Command: update
Prompt: Enter task ID to update: <user input>
Current title: <current title>
Prompt: Enter new title (or press Enter to keep current): <user input>
Output: ✓ Task updated successfully!
```

#### Implementation Details

| Aspect | Specification |
|--------|---------------|
| **Input Validation** | ID must be valid; new title must be non-empty if provided |
| **Empty Input Handling** | If user presses Enter without input, keep current title |
| **Update Scope** | Only the `title` field is modifiable |

#### Error Handling
- Invalid ID format → Display: `✗ Error: Please enter a valid task ID (number).`
- Task not found → Display: `✗ Error: No task found with ID <id>.`
- Empty new title → Display: `✗ Error: Task title cannot be empty.`

#### Method Signature
```python
def update_task(self, task_id: int, new_title: str) -> Task:
    """
    Update the title of an existing task.

    Args:
        task_id: The unique identifier of the task to update
        new_title: The new title for the task

    Returns:
        The updated Task object

    Raises:
        ValueError: If task_id is invalid or new_title is empty
        KeyError: If no task exists with the given ID
    """
```

---

### Feature 4: View Task List

#### Purpose
Display all current tasks in a formatted, readable list.

#### User Interaction
```
Command: list
Output:
╔══════════════════════════════════════════════════════════════╗
║                        YOUR TASKS                            ║
╠════╦════════════════════════════════╦══════════╦═════════════╣
║ ID ║ Title                          ║ Status   ║ Created     ║
╠════╬════════════════════════════════╬══════════╬═════════════╣
║  1 ║ Buy groceries                  ║ ☐ Pending║ Dec 27, 10AM║
║  2 ║ Complete homework              ║ ☑ Done   ║ Dec 27, 11AM║
╚════╩════════════════════════════════╩══════════╩═════════════╝
Total: 2 tasks (1 completed, 1 pending)
```

#### Implementation Details

| Aspect | Specification |
|--------|---------------|
| **Empty List** | Display: `No tasks yet. Use 'add' to create your first task!` |
| **Sorting** | Display tasks in order of creation (by ID) |
| **Status Display** | `☑ Done` for completed, `☐ Pending` for incomplete |
| **Date Format** | `MMM DD, HH:MM AM/PM` format |

#### Method Signature
```python
def get_all_tasks(self) -> list[Task]:
    """
    Retrieve all tasks.

    Returns:
        A list of all Task objects, sorted by ID
    """
```

#### Display Helper
```python
def display_tasks(tasks: list[Task]) -> None:
    """
    Format and print the task list to console.

    Args:
        tasks: List of tasks to display
    """
```

---

### Feature 5: Mark as Complete (Toggle Status)

#### Purpose
Toggle the completion status of a task between completed and pending.

#### User Interaction
```
Command: toggle
Prompt: Enter task ID to toggle: <user input>
Output (if marked complete): ✓ Task "<title>" marked as complete!
Output (if marked pending): ✓ Task "<title>" marked as pending!
```

#### Implementation Details

| Aspect | Specification |
|--------|---------------|
| **Input Validation** | ID must be a valid positive integer |
| **Toggle Logic** | `completed = not completed` |
| **Feedback** | Indicate the new status in the output message |

#### Error Handling
- Invalid ID format → Display: `✗ Error: Please enter a valid task ID (number).`
- Task not found → Display: `✗ Error: No task found with ID <id>.`

#### Method Signature
```python
def toggle_task(self, task_id: int) -> Task:
    """
    Toggle the completion status of a task.

    Args:
        task_id: The unique identifier of the task to toggle

    Returns:
        The updated Task object

    Raises:
        ValueError: If task_id is not a positive integer
        KeyError: If no task exists with the given ID
    """
```

---

## Command-Line Interface

### Main Menu

```
═══════════════════════════════════════════
         📋 TODO APPLICATION
═══════════════════════════════════════════

Available Commands:
  add     - Create a new task
  list    - View all tasks
  update  - Modify a task's title
  delete  - Remove a task
  toggle  - Mark task complete/incomplete
  help    - Show this menu
  exit    - Quit the application

Enter command: _
```

### Command Mapping

| Command | Aliases | Action |
|---------|---------|--------|
| `add` | `a`, `new`, `create` | Add a new task |
| `list` | `l`, `ls`, `show`, `view` | Display all tasks |
| `update` | `u`, `edit`, `modify` | Update task title |
| `delete` | `d`, `del`, `remove`, `rm` | Delete a task |
| `toggle` | `t`, `done`, `complete`, `mark` | Toggle completion |
| `help` | `h`, `?` | Show help menu |
| `exit` | `quit`, `q`, `bye` | Exit application |

### Unknown Command Handling
```
✗ Unknown command: <input>. Type 'help' for available commands.
```

---

## Input/Output Formatting

### Color Codes (Optional Enhancement)

```python
class Colors:
    GREEN = '\033[92m'   # Success messages
    RED = '\033[91m'     # Error messages
    YELLOW = '\033[93m'  # Warnings
    BLUE = '\033[94m'    # Info/prompts
    RESET = '\033[0m'    # Reset to default
```

### Message Prefixes

| Type | Prefix |
|------|--------|
| Success | `✓` (green) |
| Error | `✗` (red) |
| Info | `ℹ` (blue) |
| Warning | `⚠` (yellow) |

---

## Entry Point

### main.py

```python
def main() -> None:
    """
    Application entry point.

    Initializes the TaskManager and runs the main command loop.
    Handles graceful exit on Ctrl+C.
    """
    print_welcome_banner()
    task_manager = TaskManager()

    while True:
        try:
            command = input("\nEnter command: ").strip().lower()
            handle_command(command, task_manager)
        except KeyboardInterrupt:
            print("\n\nGoodbye! 👋")
            break

if __name__ == "__main__":
    main()
```

---

## Error Handling Strategy

### Exception Hierarchy

```python
class TodoAppError(Exception):
    """Base exception for todo application."""
    pass

class TaskNotFoundError(TodoAppError):
    """Raised when a task with the given ID doesn't exist."""
    pass

class InvalidInputError(TodoAppError):
    """Raised when user input is invalid."""
    pass
```

### Global Error Handler

- All exceptions should be caught at the CLI level
- User-friendly error messages should be displayed
- The application should never crash from user input
- Use `try/except` blocks around all user interactions

---

## Testing Considerations

### Unit Test Cases

#### Add Task Tests
- [x] Successfully add a task with valid title
- [x] Reject empty title
- [x] Reject whitespace-only title
- [x] Verify auto-increment ID
- [x] Verify default completed status is False

#### Delete Task Tests
- [x] Successfully delete existing task
- [x] Handle non-existent task ID
- [x] Handle negative task ID
- [x] Handle non-numeric input

#### Update Task Tests
- [x] Successfully update task title
- [x] Handle non-existent task ID
- [x] Reject empty new title
- [x] Keep current title on empty input (Enter key)

#### View Task Tests
- [x] Display formatted list with tasks
- [x] Handle empty task list gracefully
- [x] Verify correct status icons

#### Toggle Task Tests
- [x] Toggle from pending to complete
- [x] Toggle from complete to pending
- [x] Handle non-existent task ID

---

## Sample Execution Flow

```
═══════════════════════════════════════════
         📋 TODO APPLICATION
═══════════════════════════════════════════

Available Commands:
  add     - Create a new task
  list    - View all tasks
  update  - Modify a task's title
  delete  - Remove a task
  toggle  - Mark task complete/incomplete
  help    - Show this menu
  exit    - Quit the application

Enter command: add
Enter task title: Buy groceries
✓ Task added successfully! (ID: 1)

Enter command: add
Enter task title: Complete Python homework
✓ Task added successfully! (ID: 2)

Enter command: list
╔════════════════════════════════════════════════════════════╗
║                        YOUR TASKS                          ║
╠════╦═══════════════════════════╦══════════╦════════════════╣
║ ID ║ Title                     ║ Status   ║ Created        ║
╠════╬═══════════════════════════╬══════════╬════════════════╣
║  1 ║ Buy groceries             ║ ☐ Pending║ Dec 27, 06:48AM║
║  2 ║ Complete Python homework  ║ ☐ Pending║ Dec 27, 06:48AM║
╚════╩═══════════════════════════╩══════════╩════════════════╝
Total: 2 tasks (0 completed, 2 pending)

Enter command: toggle
Enter task ID to toggle: 1
✓ Task "Buy groceries" marked as complete!

Enter command: update
Enter task ID to update: 2
Current title: Complete Python homework
Enter new title (or press Enter to keep current): Finish Python project
✓ Task updated successfully!

Enter command: delete
Enter task ID to delete: 1
✓ Task "Buy groceries" deleted successfully!

Enter command: exit
Goodbye! 👋
```

---

## Dependencies

### pyproject.toml

```toml
[project]
name = "todo-app"
version = "1.0.0"
description = "A command-line todo application"
requires-python = ">=3.13"
dependencies = []

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.uv]
dev-dependencies = [
    "pytest>=8.0.0",
    "pytest-cov>=4.1.0",
]
```

---

## Implementation Checklist

- [ ] Create project structure with UV
- [ ] Implement `models.py` with Task dataclass
- [ ] Implement `task_manager.py` with TaskManager class
- [ ] Implement `cli.py` with command handlers
- [ ] Implement `utils.py` with validation and formatting helpers
- [ ] Implement `main.py` with entry point and main loop
- [ ] Add comprehensive error handling
- [ ] Write unit tests for all features
- [ ] Test complete user flow manually

---

## Acceptance Criteria

1. **Add Task**: User can create tasks with valid titles; invalid inputs are rejected with clear error messages.
2. **Delete Task**: User can remove tasks by ID; non-existent IDs produce helpful errors.
3. **Update Task**: User can modify task titles; empty updates are handled gracefully.
4. **View Tasks**: All tasks are displayed in a formatted table with status indicators.
5. **Toggle Status**: User can mark tasks complete/incomplete; state persists within session.
6. **User Experience**: Application provides clear feedback, handles errors gracefully, and never crashes.
7. **Code Quality**: Code follows Python best practices, uses type hints, and is well-documented.
labels: ["spec","cli","todo","python"]
links:
  spec: specs/001-cli-todo/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-cli-todo/spec.md
  - specs/001-cli-todo/checklists/requirements.md
tests: []

---

## Prompt

lets create specs, name the branch "001-cli-todo", here is the specs # Command-Line Todo Application - Detailed Specifications

## Overview

This document provides a comprehensive specification for a command-line todo application built using Python 3.13+. The application operates entirely in-memory (no persistent storage) and provides a text-based interface for managing tasks.

---

## Technology Stack

| Component | Requirement |
|-----------|-------------|
| **Language** | Python 3.13 or newer |
| **Package Manager** | UV |
| **AI Assistant** | Claude Code |

---

## Data Model

### Task Entity

Each task in the application is represented by the following data structure:

```python
@dataclass
class Task:
    id: int              # Unique identifier, auto-incremented
    title: str           # Task title/description (required, non-empty)
    completed: bool      # Completion status (default: False)
    created_at: datetime # Timestamp of creation
```

### Task Storage

- Tasks are stored in an in-memory list: `tasks: list[Task]`
- A global counter `next_id: int` tracks the next available task ID
- **No persistence**: All data is lost when the program exits

---

## Application Architecture

### Module Structure

Created using `uv init --package backend`:

```
backend/
├── pyproject.toml        # Project configuration and dependencies
├── README.md             # Project documentation
└── src/
    └── backend/
        ├── __init__.py       # Package initialization
        ├── main.py           # Entry point, main loop
        ├── models.py         # Task dataclass definition
        ├── task_manager.py   # Core CRUD operations
        ├── cli.py            # Command-line interface handlers
        └── utils.py          # Helper functions (validation, formatting)
```

### Core Components

1. **TaskManager Class**: Handles all task operations (add, delete, update, view, toggle)
2. **CLI Module**: Parses user input and displays output
3. **Main Loop**: Continuously prompts for user commands until exit

---

## Feature Specifications

### Feature 1: Add Task

#### Purpose
Create a new todo item and add it to the task list.

#### User Interaction
```
Command: add
Prompt: Enter task title: <user input>
Output: ✓ Task added successfully! (ID: <id>)
```

#### Implementation Details

| Aspect | Specification |
|--------|---------------|
| **Input Validation** | Title must be non-empty and non-whitespace |
| **ID Assignment** | Auto-increment from global counter |
| **Default Status** | `completed = False` |
| **Timestamp** | Set `created_at` to current datetime |

#### Error Handling
- Empty title → Display: `✗ Error: Task title cannot be empty.`
- Whitespace-only title → Display: `✗ Error: Task title cannot be empty.`

#### Method Signature
```python
def add_task(self, title: str) -> Task:
    """
    Add a new task to the list.

    Args:
        title: The task description (must be non-empty)

    Returns:
        The newly created Task object

    Raises:
        ValueError: If title is empty or whitespace-only
    """
```

---

### Feature 2: Delete Task

#### Purpose
Remove an existing task from the task list by its ID.

#### User Interaction
```
Command: delete
Prompt: Enter task ID to delete: <user input>
Output: ✓ Task "<title>" deleted successfully!
```

#### Implementation Details

| Aspect | Specification |
|--------|---------------|
| **Input Validation** | ID must be a valid positive integer |
| **Lookup** | Find task by ID in the task list |
| **Removal** | Remove the task object from the list |

#### Error Handling
- Invalid ID format → Display: `✗ Error: Please enter a valid task ID (number).`
- Task not found → Display: `✗ Error: No task found with ID <id>.`

#### Method Signature
```python
def delete_task(self, task_id: int) -> Task:
    """
    Delete a task by its ID.

    Args:
        task_id: The unique identifier of the task to delete

    Returns:
        The deleted Task object

    Raises:
        ValueError: If task_id is not a positive integer
        KeyError: If no task exists with the given ID
    """
```

---

### Feature 3: Update Task

#### Purpose
Modify the title of an existing task.

#### User Interaction
```
Command: update
Prompt: Enter task ID to update: <user input>
Current title: <current title>
Prompt: Enter new title (or press Enter to keep current): <user input>
Output: ✓ Task updated successfully!
```

#### Implementation Details

| Aspect | Specification |
|--------|---------------|
| **Input Validation** | ID must be valid; new title must be non-empty if provided |
| **Empty Input Handling** | If user presses Enter without input, keep current title |
| **Update Scope** | Only the `title` field is modifiable |

#### Error Handling
- Invalid ID format → Display: `✗ Error: Please enter a valid task ID (number).`
- Task not found → Display: `✗ Error: No task found with ID <id>.`
- Empty new title → Display: `✗ Error: Task title cannot be empty.`

#### Method Signature
```python
def update_task(self, task_id: int, new_title: str) -> Task:
    """
    Update the title of an existing task.

    Args:
        task_id: The unique identifier of the task to update
        new_title: The new title for the task

    Returns:
        The updated Task object

    Raises:
        ValueError: If task_id is invalid or new_title is empty
        KeyError: If no task exists with the given ID
    """
```

---

### Feature 4: View Task List

#### Purpose
Display all current tasks in a formatted, readable list.

#### User Interaction
```
Command: list
Output:
╔══════════════════════════════════════════════════════════════╗
║                        YOUR TASKS                            ║
╠════╦════════════════════════════════╦══════════╦═════════════╣
║ ID ║ Title                          ║ Status   ║ Created     ║
╠════╬════════════════════════════════╬══════════╬═════════════╣
║  1 ║ Buy groceries                  ║ ☐ Pending║ Dec 27, 10AM║
║  2 ║ Complete homework              ║ ☑ Done   ║ Dec 27, 11AM║
╚════╩════════════════════════════════╩══════════╩═════════════╝
Total: 2 tasks (1 completed, 1 pending)
```

#### Implementation Details

| Aspect | Specification |
|--------|---------------|
| **Empty List** | Display: `No tasks yet. Use 'add' to create your first task!` |
| **Sorting** | Display tasks in order of creation (by ID) |
| **Status Display** | `☑ Done` for completed, `☐ Pending` for incomplete |
| **Date Format** | `MMM DD, HH:MM AM/PM` format |

#### Method Signature
```python
def get_all_tasks(self) -> list[Task]:
    """
    Retrieve all tasks.

    Returns:
        A list of all Task objects, sorted by ID
    """
```

#### Display Helper
```python
def display_tasks(tasks: list[Task]) -> None:
    """
    Format and print the task list to console.

    Args:
        tasks: List of tasks to display
    """
```

---

### Feature 5: Mark as Complete (Toggle Status)

#### Purpose
Toggle the completion status of a task between completed and pending.

#### User Interaction
```
Command: toggle
Prompt: Enter task ID to toggle: <user input>
Output (if marked complete): ✓ Task "<title>" marked as complete!
Output (if marked pending): ✓ Task "<title>" marked as pending!
```

#### Implementation Details

| Aspect | Specification |
|--------|---------------|
| **Input Validation** | ID must be a valid positive integer |
| **Toggle Logic** | `completed = not completed` |
| **Feedback** | Indicate the new status in the output message |

#### Error Handling
- Invalid ID format → Display: `✗ Error: Please enter a valid task ID (number).`
- Task not found → Display: `✗ Error: No task found with ID <id>.`

#### Method Signature
```python
def toggle_task(self, task_id: int) -> Task:
    """
    Toggle the completion status of a task.

    Args:
        task_id: The unique identifier of the task to toggle

    Returns:
        The updated Task object

    Raises:
        ValueError: If task_id is not a positive integer
        KeyError: If no task exists with the given ID
    """
```

---

## Command-Line Interface

### Main Menu

```
═══════════════════════════════════════════
         📋 TODO APPLICATION
═══════════════════════════════════════════

Available Commands:
  add     - Create a new task
  list    - View all tasks
  update  - Modify a task's title
  delete  - Remove a task
  toggle  - Mark task complete/incomplete
  help    - Show this menu
  exit    - Quit the application

Enter command: _
```

### Command Mapping

| Command | Aliases | Action |
|---------|---------|--------|
| `add` | `a`, `new`, `create` | Add a new task |
| `list` | `l`, `ls`, `show`, `view` | Display all tasks |
| `update` | `u`, `edit`, `modify` | Update task title |
| `delete` | `d`, `del`, `remove`, `rm` | Delete a task |
| `toggle` | `t`, `done`, `complete`, `mark` | Toggle completion |
| `help` | `h`, `?` | Show help menu |
| `exit` | `quit`, `q`, `bye` | Exit application |

### Unknown Command Handling
```
✗ Unknown command: <input>. Type 'help' for available commands.
```

---

## Input/Output Formatting

### Color Codes (Optional Enhancement)

```python
class Colors:
    GREEN = '\033[92m'   # Success messages
    RED = '\033[91m'     # Error messages
    YELLOW = '\033[93m'  # Warnings
    BLUE = '\033[94m'    # Info/prompts
    RESET = '\033[0m'    # Reset to default
```

### Message Prefixes

| Type | Prefix |
|------|--------|
| Success | `✓` (green) |
| Error | `✗` (red) |
| Info | `ℹ` (blue) |
| Warning | `⚠` (yellow) |

---

## Entry Point

### main.py

```python
def main() -> None:
    """
    Application entry point.

    Initializes the TaskManager and runs the main command loop.
    Handles graceful exit on Ctrl+C.
    """
    print_welcome_banner()
    task_manager = TaskManager()

    while True:
        try:
            command = input("\nEnter command: ").strip().lower()
            handle_command(command, task_manager)
        except KeyboardInterrupt:
            print("\n\nGoodbye! 👋")
            break

if __name__ == "__main__":
    main()
```

---

## Error Handling Strategy

### Exception Hierarchy

```python
class TodoAppError(Exception):
    """Base exception for todo application."""
    pass

class TaskNotFoundError(TodoAppError):
    """Raised when a task with the given ID doesn't exist."""
    pass

class InvalidInputError(TodoAppError):
    """Raised when user input is invalid."""
    pass
```

### Global Error Handler

- All exceptions should be caught at the CLI level
- User-friendly error messages should be displayed
- The application should never crash from user input
- Use `try/except` blocks around all user interactions

---

## Testing Considerations

### Unit Test Cases

#### Add Task Tests
- [x] Successfully add a task with valid title
- [x] Reject empty title
- [x] Reject whitespace-only title
- [x] Verify auto-increment ID
- [x] Verify default completed status is False

#### Delete Task Tests
- [x] Successfully delete existing task
- [x] Handle non-existent task ID
- [x] Handle negative task ID
- [x] Handle non-numeric input

#### Update Task Tests
- [x] Successfully update task title
- [x] Handle non-existent task ID
- [x] Reject empty new title
- [x] Keep current title on empty input (Enter key)

#### View Task Tests
- [x] Display formatted list with tasks
- [x] Handle empty task list gracefully
- [x] Verify correct status icons

#### Toggle Task Tests
- [x] Toggle from pending to complete
- [x] Toggle from complete to pending
- [x] Handle non-existent task ID

---

## Sample Execution Flow

```
═══════════════════════════════════════════
         📋 TODO APPLICATION
═══════════════════════════════════════════

Available Commands:
  add     - Create a new task
  list    - View all tasks
  update  - Modify a task's title
  delete  - Remove a task
  toggle  - Mark task complete/incomplete
  help    - Show this menu
  exit    - Quit the application

Enter command: add
Enter task title: Buy groceries
✓ Task added successfully! (ID: 1)

Enter command: add
Enter task title: Complete Python homework
✓ Task added successfully! (ID: 2)

Enter command: list
╔════════════════════════════════════════════════════════════╗
║                        YOUR TASKS                          ║
╠════╦═══════════════════════════╦══════════╦════════════════╣
║ ID ║ Title                     ║ Status   ║ Created        ║
╠════╬═══════════════════════════╬══════════╬════════════════╣
║  1 ║ Buy groceries             ║ ☐ Pending║ Dec 27, 06:48AM║
║  2 ║ Complete Python homework  ║ ☐ Pending║ Dec 27, 06:48AM║
╚════╩═══════════════════════════╩══════════╩════════════════╝
Total: 2 tasks (0 completed, 2 pending)

Enter command: toggle
Enter task ID to toggle: 1
✓ Task "Buy groceries" marked as complete!

Enter command: update
Enter task ID to update: 2
Current title: Complete Python homework
Enter new title (or press Enter to keep current): Finish Python project
✓ Task updated successfully!

Enter command: delete
Enter task ID to delete: 1
✓ Task "Buy groceries" deleted successfully!

Enter command: exit
Goodbye! 👋
```

---

## Dependencies

### pyproject.toml

```toml
[project]
name = "todo-app"
version = "1.0.0"
description = "A command-line todo application"
requires-python = ">=3.13"
dependencies = []

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.uv]
dev-dependencies = [
    "pytest>=8.0.0",
    "pytest-cov>=4.1.0",
]
```

---

## Implementation Checklist

- [ ] Create project structure with UV
- [ ] Implement `models.py` with Task dataclass
- [ ] Implement `task_manager.py` with TaskManager class
- [ ] Implement `cli.py` with command handlers
- [ ] Implement `utils.py` with validation and formatting helpers
- [ ] Implement `main.py` with entry point and main loop
- [ ] Add comprehensive error handling
- [ ] Write unit tests for all features
- [ ] Test complete user flow manually

---

## Acceptance Criteria

1. **Add Task**: User can create tasks with valid titles; invalid inputs are rejected with clear error messages.
2. **Delete Task**: User can remove tasks by ID; non-existent IDs produce helpful errors.
3. **Update Task**: User can modify task titles; empty updates are handled gracefully.
4. **View Tasks**: All tasks are displayed in a formatted table with status indicators.
5. **Toggle Status**: User can mark tasks complete/incomplete; state persists within session.
6. **User Experience**: Application provides clear feedback, handles errors gracefully, and never crashes.
7. **Code Quality**: Code follows Python best practices, uses type hints, and is well-documented.

## Response snapshot

✅ **SUCCESS: Specification created for CLI Todo Application**

**Branch**: `001-cli-todo` (created)
**Spec File**: `specs/001-cli-todo/spec.md`
**Checklist**: `specs/001-cli-todo/checklists/requirements.md`

**Validation Results**: All quality criteria passed ✅
- No implementation details in spec
- All requirements are testable and unambiguous
- Success criteria are measurable and technology-agnostic
- No [NEEDS CLARIFICATION] markers needed
- Ready for next phase: `/sp.clarify` or `/sp.plan`

**Key Features Defined**:
- 5 core operations: add, delete, update, list, toggle
- In-memory storage with auto-incrementing IDs
- Comprehensive error handling
- Formatted table display with status icons
- Command aliases and help system
- 6 measurable success criteria

The specification is now ready for architectural planning and implementation.

## Outcome

- ✅ Impact: High - This spec provides complete foundation for building the CLI todo application
- 🧪 Tests: 6 success criteria defined, 5 user stories with acceptance scenarios
- 📁 Files: 2 files created (spec.md + requirements.md checklist)
- 🔁 Next prompts: /sp.clarify (if needed) or /sp.plan (for architecture)
- 🧠 Reflection: Spec creation went smoothly - all quality criteria met without needing clarifications. The detailed user-provided specification gave clear requirements.

## Evaluation notes (flywheel)

- Failure modes observed: Script execution had shell interpretation issues, but manual approach worked
- Graders run and results (PASS/FAIL): PASS - All quality criteria met
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed to /sp.plan to create architectural design