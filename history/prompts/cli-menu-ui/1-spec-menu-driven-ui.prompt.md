---
id: 1
title: spec menu-driven ui transformation
stage: spec
date: 2025-12-28
surface: agent
model: claude-sonnet-4-5
feature: cli-menu-ui
branch: 002-cli-menu-ui
user: user
command: /sp.specify name the new branch "002-cli-todo-ui" and here are the specs : # Complete Analysis & Plan: Menu-Driven UI Transformation...
labels: ["specification", "ui-transformation", "cli-to-menu", "user-experience"]
links:
  spec: specs/002-cli-menu-ui/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-cli-menu-ui/spec.md
  - specs/002-cli-menu-ui/checklists/requirements.md
tests:
  - Validation checklist created and all items passed
  - Specification reviewed against quality criteria
---

## Prompt

name the new branch "002-cli-todo-ui" and here are the specs : # Complete Analysis & Plan: Menu-Driven UI Transformation

## Current Project Deep Analysis

### Existing Architecture

```
backend/
├── src/backend/
│   ├── models.py          # Task dataclass + TaskCreate/Update Pydantic models
│   ├── services.py        # TaskManager (5 methods: add, list, update, delete, toggle)
│   ├── cli.py             # CLIHandler (command parser + 7 handlers + 18 aliases)
│   ├── utils.py           # Validation + formatting (table, colors, messages)
│   ├── main.py            # Main loop with signal handling
│   └── exceptions.py      # Custom exception hierarchy
├── tests/                 # 91 tests (82% coverage)
└── docs/                  # README.md + MIGRATION.md
```

### Current User Flow

1. User types "help" → See commands → Type "add task_name" → See result
2. User types "list" → See table → Type next command

### Current Issues

- ❌ Must memorize commands
- ❌ No visual hierarchy
- ❌ Error-prone typing
- ❌ No guided workflows
- ❌ Basic table display only

---

## Target UI Structure & Examples

### 🎯 NEW MAIN MENU INTERFACE

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  📋 TODO APPLICATION v1.0                       │
│  ─────────────────────────────────────────────  │
│                                                 │
│  1. 📝 Add New Task                             │
│  2. 📋 View All Tasks                           │
│  3. ✏️  Update Existing Task                    │
│  4. ✅ Toggle Task Status                       │
│  5. 🗑️  Delete Task                            │
│  6. ❓ Help & Instructions                      │
│  7. 👋 Exit Application                         │
│                                                 │
│  Enter choice (1-7): █                          │
└─────────────────────────────────────────────────┘
```

### 🎯 NEW LIST VIEW INTERFACE

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  📋 YOUR TASKS (3 Total)                        │
│  ─────────────────────────────────────────────  │
│  ✅ Completed: 1  |  ☐ Pending: 2  |  33% Done  │
│                                                 │
│  [1] ☐ Buy groceries                            │
│      📅 Created: 2025-12-28 10:30:00            │
│                                                 │
│  [2] ☑ Complete homework                        │
│      📅 Created: 2025-12-28 10:31:00            │
│                                                 │
│  [3] ☐ Call dentist                             │
│      📅 Created: 2025-12-28 10:32:00            │
│                                                 │
│  ✨ Tip: Use menu option 3 to update tasks      │
└─────────────────────────────────────────────────┘
```

### 🎯 ADD TASK FLOW

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ➕ ADD NEW TASK                                │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Enter task description:                        │
│  > Buy groceries for weekend                    │
│                                                 │
│  [1] Save Task                                  │
│  [2] Cancel & Return to Menu                    │
│                                                 │
│  Enter choice (1-2): █                          │
└─────────────────────────────────────────────────┘

After saving:
┌─────────────────────────────────────────────────┐
│  ✅ Success! Task added: "Buy groceries..."    │
│  Press Enter to return to menu...              │
└─────────────────────────────────────────────────┘
```

### 🎯 UPDATE TASK FLOW (Two-Step)

**Step 1: Select Task**
```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ✏️  UPDATE TASK - Select Task                  │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Available Tasks:                               │
│  [1] ☐ Buy groceries for weekend                │
│  [2] ☑ Complete homework                        │
│  [3] ☐ Call dentist                             │
│                                                 │
│  Enter task number to update (1-3): █           │
└─────────────────────────────────────────────────┘
```

**Step 2: Edit Title**
```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ✏️  UPDATE TASK - Edit Title                   │
│  ─────────────────────────────────────────────  │
│  Current: Buy groceries for weekend             │
│                                                 │
│  Enter new title:                               │
│  > Buy groceries AND supplies                   │
│                                                 │
│  [1] Save Changes                               │
│  [2] Cancel                                     │
│                                                 │
│  Enter choice (1-2): █                          │
└─────────────────────────────────────────────────┘
```

### 🎯 DELETE CONFIRMATION

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  🗑️  DELETE TASK - CONFIRMATION                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  ⚠️  WARNING: This action cannot be undone!     │
│                                                 │
│  Task to delete:                                │
│  [3] ☐ Call dentist                             │
│                                                 │
│  Are you sure you want to delete this task?     │
│                                                 │
│  [1] Yes, Delete It                             │
│  [2] No, Keep It                                │
│                                                 │
│  Enter choice (1-2): █                          │
└─────────────────────────────────────────────────┘
```

### 🎯 TOGGLE CONFIRMATION

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ✅ TOGGLE TASK STATUS                          │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Task: [2] ☑ Complete homework                  │
│  Current Status: ✅ COMPLETED                    │
│                                                 │
│  This will change status to: ☐ PENDING          │
│                                                 │
│  Confirm status change?                         │
│                                                 │
│  [1] Yes, Toggle Status                         │
│  [2] No, Keep Current                           │
│                                                 │
│  Enter choice (1-2): █                          │
└─────────────────────────────────────────────────┘
```

### 🎯 HELP INTERFACE

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ❓ HELP & INSTRUCTIONS                         │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Welcome to Todo Application!                   │
│                                                 │
│  MENU OPTIONS:                                  │
│                                                 │
│  1. 📝 Add New Task                             │
│     → Create a new todo item                    │
│                                                 │
│  2. 📋 View All Tasks                           │
│     → See all tasks with completion status      │
│                                                 │
│  3. ✏️  Update Existing Task                    │
│     → Change task title                         │
│                                                 │
│  4. ✅ Toggle Task Status                       │
│     → Mark as done/undone                       │
│                                                 │
│  5. 🗑️  Delete Task                            │
│     → Remove task permanently                   │
│                                                 │
│  6. ❓ Help & Instructions                      │
│     → Show this help screen                     │
│                                                 │
│  7. 👋 Exit Application                         │
│     → Quit and save your work                   │
│                                                 │
│  Press Enter to return to menu...               │
└─────────────────────────────────────────────────┘
```

### 🎯 EMPTY STATE

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  📋 YOUR TASKS                                  │
│  ─────────────────────────────────────────────  │
│                                                 │
│  😊 No tasks yet!                               │
│                                                 │
│  Get started by adding your first task:         │
│  → Select option 1 from the main menu           │
│                                                 │
│  Your tasks will appear here with:              │
│  • Completion status (☐/☑)                     │
│  • Creation date                                │
│  • Easy-to-read formatting                      │
│                                                 │
│  Press Enter to return to menu...               │
└─────────────────────────────────────────────────┘
```

### 🎯 ERROR STATES

**Invalid Menu Choice:**
```
┌─────────────────────────────────────────────────┐
│  ❌ Error: Please enter a number between 1-7    │
│  Press Enter to try again...                    │
└─────────────────────────────────────────────────┘
```

**Task Not Found:**
```
┌─────────────────────────────────────────────────┐
│  ❌ Error: Task with ID 99 not found            │
│  Please check the task number and try again.    │
│  Press Enter to continue...                     │
└─────────────────────────────────────────────────┘
```

**Empty Input:**
```
┌─────────────────────────────────────────────────┐
│  ❌ Error: Task title cannot be empty           │
│  Please enter a valid task description.         │
│  Press Enter to try again...                    │
└─────────────────────────────────────────────────┘
```

---

## Detailed Implementation Plan

### 📋 PHASE 1: UI Component Creation

**File:** `src/backend/ui.py` (NEW)

**Purpose:** All visual rendering and UI logic

**Functions to Implement:**

```python
# ui.py - Complete Function List

def display_header() -> None:
    """Application banner with ASCII art"""

def display_main_menu() -> None:
    """Main menu with 7 options"""

def display_list_view(tasks: List[Task]) -> None:
    """Enhanced task list"""

def display_add_form() -> str:
    """Add task input form"""
    # Returns: validated task title or None (cancel)

def display_update_step1(tasks: List[Task]) -> Optional[int]:
    """Step 1: Select task to update"""
    # Returns: selected task_id or None

def display_update_step2(task: Task) -> Optional[str]:
    """Step 2: Enter new title"""
    # Returns: new title or None

def display_toggle_confirmation(task: Task) -> bool:
    """Toggle confirmation dialog"""
    # Returns: True (confirm) or False (cancel)

def display_delete_confirmation(task: Task) -> bool:
    """Delete confirmation dialog"""
    # Returns: True (confirm) or False (cancel)

def display_help() -> None:
    """Help screen with instructions"""

def display_exit_message() -> None:
    """Farewell message"""

def display_message(message: str, msg_type: str = "info") -> None:
    """Generic message display"""
    # Types: success, error, info, warning

def display_empty_state() -> None:
    """Empty task list message"""

def display_confirmation_prompt(prompt: str) -> bool:
    """Generic yes/no confirmation"""
    # Returns: True/False based on user choice

def display_pause() -> None:
    """Wait for user to press Enter"""
```

**Dependencies:**
- `from .models import Task`
- `from .utils import COLOR_* constants`

---

### 📋 PHASE 2: Enhanced Utilities

**File:** `src/backend/utils.py` (MODIFIED)

**Additions:**

```python
# New constants for UI
COLOR_HEADER = "\033[95m"      # Purple
COLOR_BORDER = "\033[96m"      # Cyan
COLOR_SUCCESS = "\033[92m"     # Green
COLOR_ERROR = "\033[91m"       # Red
COLOR_WARNING = "\033[93m"     # Yellow
COLOR_INFO = "\033[94m"        # Blue
COLOR_RESET = "\033[0m"

# Box drawing characters
BOX_CHARS = {
    'top_left': '┌', 'top_right': '┐',
    'bottom_left': '└', 'bottom_right': '┘',
    'horizontal': '─', 'vertical': '│',
    'cross': '┼', 't_left': '├', 't_right': '┤'
}

def create_box(title: str, content: List[str], width: int = 50) -> str:
    """Create a formatted box with title and content"""

def format_task_row(task: Task, index: int) -> str:
    """Format single task for list view"""

def get_progress_stats(tasks: List[Task]) -> str:
    """Calculate completion statistics"""

def validate_menu_choice(input_str: str, max_choice: int = 7) -> Tuple[bool, str]:
    """Validate menu input"""
    # Returns: (is_valid, error_message)

def sanitize_input(text: str) -> str:
    """Clean user input"""

def wrap_text(text: str, width: int) -> List[str]:
    """Wrap long text to fit width"""

def create_separator(width: int = 50) -> str:
    """Create horizontal separator"""
```

**Keep existing functions:**
- `validate_title()`
- `validate_task_id()`
- `format_success()`
- `format_error()`
- `format_info()`
- `format_table()` (can be adapted or deprecated)

---

### 📋 PHASE 3: Menu Router Transformation

**File:** `src/backend/cli.py` (MODIFIED)

**Transformation:** Command Parser → Menu Router

**Current Structure (REMOVE):**
```python
# OLD - To be removed
class CLIHandler:
    def __init__(self, task_manager):
        self.task_manager = task_manager
        self.commands = {
            "add": self.handle_add, "a": self.handle_add, "new": self.handle_add, ...
        }

    def parse_command(self, user_input: str) -> Tuple[str, List[str]]:
        # Command string parsing

    def execute_command(self, user_input: str) -> Tuple[bool, str, bool]:
        # Command routing logic

    def handle_add(self, args: List[str]) -> Tuple[bool, str, bool]:
        # Individual command handler
```

**New Structure (IMPLEMENT):**
```python
# NEW - Menu Router
class MenuHandler:
    def __init__(self, task_manager: TaskManager):
        self.task_manager = task_manager
        # UI will be imported in main.py, not needed here

    def route_menu_choice(self, choice: str) -> Tuple[bool, bool]:
        """
        Route menu selection to appropriate handler
        Returns: (success, should_exit)
        """
        handlers = {
            "1": self.handle_add_task,
            "2": self.handle_list_tasks,
            "3": self.handle_update_task,
            "4": self.handle_toggle_task,
            "5": self.handle_delete_task,
            "6": self.handle_help,
            "7": self.handle_exit
        }

        handler = handlers.get(choice)
        if not handler:
            return False, False

        return handler()

    def handle_add_task(self) -> Tuple[bool, bool]:
        """Complete add flow using UI"""
        # 1. Get title from UI
        # 2. Validate with services
        # 3. Show result via UI
        # Return: (success, stay_in_menu)

    def handle_list_tasks(self) -> Tuple[bool, bool]:
        """Complete list flow"""
        # 1. Get tasks from service
        # 2. Show via UI (empty state handled)
        # Return: (True, stay_in_menu)

    def handle_update_task(self) -> Tuple[bool, bool]:
        """Two-step update flow"""
        # 1. Get task selection from UI
        # 2. Get new title from UI
        # 3. Update via service
        # 4. Show result
        # Return: (success, stay_in_menu)

    def handle_toggle_task(self) -> Tuple[bool, bool]:
        """Toggle with confirmation"""
        # 1. Get task selection
        # 2. Show confirmation via UI
        # 3. Toggle via service
        # 4. Show result
        # Return: (success, stay_in_menu)

    def handle_delete_task(self) -> Tuple[bool, bool]:
        """Delete with confirmation"""
        # 1. Get task selection
        # 2. Show confirmation via UI
        # 3. Delete via service
        # 4. Show result
        # Return: (success, stay_in_menu)

    def handle_help(self) -> Tuple[bool, bool]:
        """Show help"""
        # UI.display_help()
        # Return: (True, stay_in_menu)

    def handle_exit(self) -> Tuple[bool, bool]:
        """Exit application"""
        # UI.display_exit_message()
        # Return: (True, exit_menu)
```

**Dependencies:**
- `services.py` (TaskManager)
- `models.py` (Task for type hints)

**Note:** No direct UI imports here - UI calls happen in main.py

---

### 📋 PHASE 4: Main Loop Update

**File:** `src/backend/main.py` (MODIFIED)

**Current Structure (SIMPLIFY):**
```python
# OLD
def main():
    task_manager = TaskManager()
    cli = CLIHandler(task_manager)

    display_header()
    print("Type 'help' for commands")

    while True:
        user_input = input("\nEnter command: ")
        success, message, should_exit = cli.execute_command(user_input)
        if message: print(message)
        if should_exit: break
```

**New Structure (IMPLEMENT):**
```python
# NEW
def main():
    # Import all components
    from .services import TaskManager
    from .cli import MenuHandler
    from . import ui
    from .utils import validate_menu_choice

    # Initialize
    task_manager = TaskManager()
    menu_handler = MenuHandler(task_manager)

    # Welcome
    ui.display_header()
    ui.display_message("Welcome to Todo Application!", "info")
    ui.display_pause()

    # Main menu loop
    while True:
        # Show menu and get choice
        ui.display_main_menu()
        user_choice = input("\nEnter your choice (1-7): ").strip()

        # Validate
        is_valid, error_msg = validate_menu_choice(user_choice)
        if not is_valid:
            ui.display_message(error_msg, "error")
            ui.display_pause()
            continue

        # Route to handler
        success, should_exit = menu_handler.route_menu_choice(user_choice)

        # Exit check
        if should_exit:
            break

        # Pause to show results
        if success:
            ui.display_pause()

    # Goodbye
    ui.display_exit_message()

# Signal Handling (Preserve)
import signal

def signal_handler(sig, frame):
    ui.display_message("\n\n👋 Goodbye! (Ctrl+C detected)", "info")
    exit(0)

signal.signal(signal.SIGINT, signal_handler)
```

---

### 📋 PHASE 5: Test Updates

**Files to Modify:**

1. **`tests/unit/test_cli.py` → `tests/unit/test_menu.py`**
   - Test menu routing
   - Test all 7 handlers
   - Test invalid choices

2. **`tests/unit/test_utils.py` (ADD)**
   - Test `create_box()`
   - Test `format_task_row()`
   - Test `get_progress_stats()`
   - Test `validate_menu_choice()`

3. **`tests/unit/test_ui.py` (NEW)**
   - Test UI function outputs
   - Test visual formatting
   - Test empty states

4. **`tests/integration/test_menu_flow.py` (MODIFY)**
   - Test complete user flows
   - Test menu → operation → result cycles
   - Test error handling

**Test Examples:**
```python
def test_menu_routing():
    handler = MenuHandler(mock_task_manager)
    success, exit = handler.route_menu_choice("1")  # Should call handle_add
    assert success == True
    assert exit == False

def test_create_box():
    result = create_box("Title", ["Line 1", "Line 2"])
    assert "┌" in result
    assert "Title" in result
    assert "Line 1" in result

def test_empty_list_view():
    tasks = []
    # Should call ui.display_empty_state()
    # Not ui.display_list_view()
```

---

## File Change Summary

| File          | Status    | Lines Changed | Purpose                  |
|---------------|-----------|---------------|--------------------------|
| ui.py         | NEW       | ~150 lines    | All visual rendering     |
| cli.py        | MODIFY    | ~80 lines     | Command → Menu router    |
| utils.py      | MODIFY    | ~40 lines     | UI formatting helpers    |
| main.py       | MODIFY    | ~30 lines     | Menu loop integration    |
| models.py     | UNCHANGED | 0             | No changes               |
| services.py   | UNCHANGED | 0             | No changes               |
| exceptions.py | UNCHANGED | 0             | No changes               |
| Tests         | MODIFY    | ~100 lines    | Update for new interface |

**Total Impact:** ~400 lines of new/modified code, ~200 lines removed (old command system)

---

## Success Metrics

### ✅ User Experience:
- Zero command memorization required
- All features discoverable via menu
- Guided flows prevent 90% of user errors
- Visual feedback for all actions

### ✅ Technical Quality:
- All existing tests pass (adapted)
- 100% business logic preservation
- Clean separation of concerns
- Extensible for future features

### ✅ Visual Standards:
- Consistent box borders
- Color-coded messages
- Progress indicators
- Professional appearance

---

## Response snapshot

Successfully created feature specification for menu-driven UI transformation. The specification includes:

1. **Branch Created**: `002-cli-menu-ui`
2. **Spec File**: `specs/002-cli-menu-ui/spec.md` with comprehensive requirements
3. **Quality Checklist**: All validation items passed ✅
4. **User Stories**: 3 prioritized stories (P1, P2, P3) with independent testability
5. **Functional Requirements**: 15 detailed requirements covering all UI interactions
6. **Success Criteria**: 8 measurable, technology-agnostic outcomes
7. **Edge Cases**: 6 identified scenarios for robust handling

The specification is ready for the planning phase (`/sp.plan`).

## Outcome

- ✅ Impact: Complete specification created for CLI-to-menu transformation
- 🧪 Tests: Validation checklist created and all items passed
- 📁 Files:
  - `specs/002-cli-menu-ui/spec.md` (main specification)
  - `specs/002-cli-menu-ui/checklists/requirements.md` (quality validation)
  - `history/prompts/cli-menu-ui/1-spec-menu-driven-ui.prompt.md` (this PHR)
- 🔁 Next prompts: `/sp.plan` to create implementation plan
- 🧠 Reflection: Specification successfully captures all requirements without implementation details, maintaining focus on user value and measurable outcomes.

## Evaluation notes (flywheel)

- Failure modes observed: None - specification process completed successfully
- Graders run and results (PASS/FAIL): ALL PASS
- Prompt variant (if applicable): Standard spec template with comprehensive feature details
- Next experiment (smallest change to try): Proceed to `/sp.plan` to generate implementation plan