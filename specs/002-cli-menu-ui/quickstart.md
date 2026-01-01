# Quickstart: CLI Menu UI Implementation

**Date**: 2025-12-28
**Feature**: 002-cli-menu-ui
**Purpose**: Rapid reference for implementation team

## Branch & Files

```bash
# Branch
git checkout 002-cli-menu-ui

# Key Files
specs/002-cli-menu-ui/
├── spec.md              # Complete feature specification
├── plan.md              # This implementation plan
├── research.md          # Phase 0 research & decisions
├── data-model.md        # Entity definitions & validation
├── quickstart.md        # This file
└── contracts/
    └── ui-contracts.md  # Function interfaces
```

## Implementation Checklist

### Phase 1: Core Files (Create/Modify)

#### ✅ NEW: `src/backend/ui.py`
```python
# Complete function list from contracts
def display_header() -> None
def display_main_menu() -> None
def display_list_view(tasks: List[Task]) -> None
def display_add_form() -> Optional[str]
def display_update_step1(tasks: List[Task]) -> Optional[int]
def display_update_step2(task: Task) -> Optional[str]
def display_toggle_confirmation(task: Task) -> bool
def display_delete_confirmation(task: Task) -> bool
def display_help() -> None
def display_exit_message() -> None
def display_message(message: str, msg_type: str = "info") -> None
def display_empty_state() -> None
def display_confirmation_prompt(prompt: str) -> bool
def display_pause() -> None
```

#### ✅ MODIFY: `src/backend/utils.py`
```python
# Add these constants and functions
COLOR_HEADER = "\033[95m"
COLOR_BORDER = "\033[96m"
COLOR_SUCCESS = "\033[92m"
COLOR_ERROR = "\033[91m"
COLOR_WARNING = "\033[93m"
COLOR_INFO = "\033[94m"
COLOR_RESET = "\033[0m"

BOX_CHARS = {...}

def create_box(title: str, content: List[str], width: int = 50) -> str
def format_task_row(task: Task, index: int) -> str
def get_progress_stats(tasks: List[Task]) -> str
def validate_menu_choice(input_str: str, max_choice: int = 7) -> Tuple[bool, str]
def sanitize_input(text: str) -> str
def wrap_text(text: str, width: int) -> List[str]
def create_separator(width: int = 50) -> str
```

#### ✅ MODIFY: `src/backend/cli.py`
```python
# Replace CLIHandler with MenuHandler
class MenuHandler:
    def __init__(self, task_manager: TaskManager)
    def route_menu_choice(self, choice: str) -> Tuple[bool, bool]
    def handle_add_task(self) -> Tuple[bool, bool]
    def handle_list_tasks(self) -> Tuple[bool, bool]
    def handle_update_task(self) -> Tuple[bool, bool]
    def handle_toggle_task(self) -> Tuple[bool, bool]
    def handle_delete_task(self) -> Tuple[bool, bool]
    def handle_help(self) -> Tuple[bool, bool]
    def handle_exit(self) -> Tuple[bool, bool]
```

#### ✅ MODIFY: `src/backend/main.py`
```python
# Update main() function
def main():
    # Import components
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

    # Main loop
    while True:
        ui.display_main_menu()
        user_choice = input("\nEnter your choice (1-7): ").strip()

        is_valid, error_msg = validate_menu_choice(user_choice)
        if not is_valid:
            ui.display_message(error_msg, "error")
            ui.display_pause()
            continue

        success, should_exit = menu_handler.route_menu_choice(user_choice)

        if should_exit:
            break

        if success:
            ui.display_pause()

    ui.display_exit_message()

# Preserve signal handling
import signal
def signal_handler(sig, frame):
    ui.display_message("\n\n👋 Goodbye! (Ctrl+C detected)", "info")
    exit(0)
signal.signal(signal.SIGINT, signal_handler)
```

### Phase 2: Test Updates

#### ✅ RENAME: `tests/unit/test_cli.py` → `tests/unit/test_menu.py`
```python
def test_menu_routing()
def test_menu_handlers()
def test_invalid_choices()
```

#### ✅ ADD: `tests/unit/test_utils.py`
```python
def test_create_box()
def test_format_task_row()
def test_get_progress_stats()
def test_validate_menu_choice()
def test_sanitize_input()
def test_wrap_text()
```

#### ✅ NEW: `tests/unit/test_ui.py`
```python
def test_display_header()
def test_display_main_menu()
def test_display_list_view()
def test_display_empty_state()
def test_display_message_types()
# ... all UI functions
```

#### ✅ MODIFY: `tests/integration/test_menu_flow.py`
```python
def test_add_task_flow()
def test_update_task_flow()
def test_delete_task_flow()
def test_toggle_task_flow()
def test_help_flow()
def test_exit_flow()
def test_error_handling()
```

## Implementation Order

### Step 1: Utilities (Foundation)
1. Add constants to `utils.py`
2. Implement `create_box()`
3. Implement `validate_menu_choice()`
4. Implement `sanitize_input()`
5. Test utilities

### Step 2: UI Components (Visual Layer)
1. Create `ui.py` with all display functions
2. Implement `display_header()` and `display_main_menu()`
3. Implement `display_list_view()` and `display_empty_state()`
4. Implement form functions (`display_add_form()`, etc.)
5. Implement confirmation dialogs
6. Test UI functions

### Step 3: Menu Router (Logic Layer)
1. Replace `CLIHandler` with `MenuHandler` in `cli.py`
2. Implement routing logic
3. Implement all 7 handler methods
4. Test routing and handlers

### Step 4: Main Loop Integration
1. Update `main.py` with new flow
2. Add signal handling
3. Test complete application flow

### Step 5: Test Migration
1. Update existing tests
2. Add new UI tests
3. Add integration tests
4. Verify 85%+ coverage

## Key Implementation Patterns

### Pattern 1: Input Validation
```python
# Always validate first
is_valid, error_msg = validate_menu_choice(user_input)
if not is_valid:
    ui.display_message(error_msg, "error")
    ui.display_pause()
    return False, False  # (success, should_exit)
```

### Pattern 2: Two-Step Operations
```python
# Step 1: Selection
task_id = ui.display_update_step1(tasks)
if task_id is None:
    return False, False  # Cancelled

# Step 2: Action
new_title = ui.display_update_step2(selected_task)
if new_title is None:
    return False, False  # Cancelled

# Execute
success = task_manager.update(task_id, new_title)
return success, False
```

### Pattern 3: Confirmation Dialogs
```python
# Always confirm destructive operations
if ui.display_delete_confirmation(task):
    success = task_manager.delete(task.id)
    if success:
        ui.display_message("Task deleted successfully", "success")
    return success, False
else:
    return False, False  # Cancelled
```

### Pattern 4: Empty State Handling
```python
tasks = task_manager.list()
if not tasks:
    ui.display_empty_state()
    return True, False
else:
    ui.display_list_view(tasks)
    return True, False
```

## Testing Strategy

### Unit Tests (Priority 1)
- Test each UI function in isolation
- Mock all I/O operations
- Verify output format exactly

### Integration Tests (Priority 2)
- Test complete user flows
- Mock TaskManager
- Verify end-to-end behavior

### Visual Tests (Priority 3)
- Capture actual output
- Compare against expected format
- Verify box drawing and colors

## Success Criteria Verification

### ✅ User Experience
- [ ] First-time user can add task in <30 seconds
- [ ] All 7 operations work via menu only
- [ ] Error rate <5% for menu input
- [ ] Task list comprehension <3 seconds

### ✅ Technical Quality
- [ ] 85%+ test coverage maintained
- [ ] All existing functionality preserved
- [ ] Clean separation of concerns
- [ ] No memory leaks

### ✅ Visual Standards
- [ ] Consistent box borders
- [ ] Color-coded messages
- [ ] Professional appearance
- [ ] Text wrapping works

## Common Pitfalls to Avoid

1. **Don't import UI in MenuHandler** - Import in main.py only
2. **Don't forget signal handling** - Preserve Ctrl+C behavior
3. **Don't skip validation** - Always validate user input
4. **Don't mix old/new patterns** - Remove all command parsing
5. **Don't forget empty states** - Handle zero-task scenarios
6. **Don't skip pause() calls** - Users need time to read output

## Constitutional Compliance Checklist

- ✅ **Universal Logic Decoupling**: TaskManager unchanged, UI separate
- ✅ **Strict Statelessness**: No session state, all in DB
- ✅ **Data Consistency**: SQLModel validation throughout
- ✅ **Multi-tenancy Ready**: Architecture supports future user_id
- ✅ **MCP Ready**: Service layer clean for future MCP exposure

## Deployment Notes

### Current Phase (CLI Only)
- No infrastructure changes needed
- Same deployment as existing CLI
- SQLite database preserved

### Future Phases
- **Phase II (Web)**: Add FastAPI, reuse TaskManager
- **Phase III (MCP)**: Add MCP server, reuse TaskManager
- **Phase IV (Kubernetes)**: Containerize, add PostgreSQL
- **Phase V (Scaling)**: Add Kafka, Dapr, horizontal scaling

## Support & Resources

- **Spec**: `specs/002-cli-menu-ui/spec.md`
- **Research**: `specs/002-cli-menu-ui/research.md`
- **Data Model**: `specs/002-cli-menu-ui/data-model.md`
- **Contracts**: `specs/002-cli-menu-ui/contracts/ui-contracts.md`
- **Constitution**: `.specify/memory/constitution.md`

## Next Steps

1. ✅ Research complete
2. ✅ Design complete
3. ✅ Contracts defined
4. 🔄 Ready for implementation
5. ⏳ Next: `/sp.tasks` to generate detailed task list