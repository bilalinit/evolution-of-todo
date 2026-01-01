# UI Contracts: CLI Menu Interface

**Date**: 2025-12-28
**Feature**: 002-cli-menu-ui
**Type**: Function Interface Contracts & User Interaction Protocols

## Function Contracts

### UI Layer Functions

#### `display_header() -> None`
**Purpose**: Display application banner with ASCII art
**Contract**:
- **Output**: Multi-line ASCII art with application name and version
- **Side Effects**: Prints to stdout
- **State**: No state changes
- **Error Handling**: None (display only)

#### `display_main_menu() -> None`
**Purpose**: Display main menu with 7 options
**Contract**:
- **Output**: Formatted box with numbered options and emoji icons
- **Format**:
  ```
  ┌─────────────────────────────────────────────────┐
  │  📋 TODO APPLICATION v1.0                       │
  │  1. 📝 Add New Task                             │
  │  2. 📋 View All Tasks                           │
  │  ...                                            │
  │  7. 👋 Exit Application                         │
  └─────────────────────────────────────────────────┘
  ```
- **Side Effects**: Prints to stdout
- **Dependencies**: `create_box()`, `create_separator()`

#### `display_list_view(tasks: List[Task]) -> None`
**Purpose**: Display formatted task list with statistics
**Contract**:
- **Input**: List of Task objects (can be empty)
- **Output**:
  - If tasks exist: Box with progress stats + formatted task rows
  - If empty: Empty state message
- **Format Requirements**:
  - Progress: "✅ Completed: X | ☐ Pending: Y | Z% Done"
  - Tasks: "[ID] ☐/☑ Title\n    📅 Created: timestamp"
- **Side Effects**: Prints to stdout
- **Dependencies**: `get_progress_stats()`, `format_task_row()`, `display_empty_state()`

#### `display_add_form() -> Optional[str]`
**Purpose**: Guide user through task creation
**Contract**:
- **Output**: Formatted input form
- **User Interaction**:
  1. Display form header
  2. Prompt for task description
  3. Display save/cancel options
  4. Wait for user choice
- **Return Value**:
  - `str`: Validated task title (if user saves)
  - `None`: If user cancels
- **Validation**: Uses `sanitize_input()` and `validate_title()`
- **Error Handling**: Re-prompts on invalid input

#### `display_update_step1(tasks: List[Task]) -> Optional[int]`
**Purpose**: Select task to update
**Contract**:
- **Input**: List of available tasks
- **Output**: Formatted task selection list
- **Return Value**:
  - `int`: Valid task ID (if user selects)
  - `None`: If user cancels
- **Validation**: Ensures selected ID exists in provided list
- **Error Handling**: Re-prompts on invalid selection

#### `display_update_step2(task: Task) -> Optional[str]`
**Purpose**: Edit task title
**Contract**:
- **Input**: Task object to update
- **Output**: Formatted edit form showing current title
- **Return Value**:
  - `str`: New validated title (if user saves)
  - `None`: If user cancels
- **Validation**: Uses `sanitize_input()` and `validate_title()`

#### `display_toggle_confirmation(task: Task) -> bool`
**Purpose**: Confirm task status toggle
**Contract**:
- **Input**: Task object
- **Output**: Confirmation dialog showing current and proposed status
- **Return Value**:
  - `True`: User confirms toggle
  - `False`: User cancels
- **Format**: Shows current status, proposed status, and yes/no options

#### `display_delete_confirmation(task: Task) -> bool`
**Purpose**: Confirm task deletion
**Contract**:
- **Input**: Task object
- **Output**: Warning dialog with task details
- **Return Value**:
  - `True`: User confirms deletion
  - `False`: User cancels
- **Format**: Shows warning about irreversible action and task details

#### `display_help() -> None`
**Purpose**: Display comprehensive help screen
**Contract**:
- **Output**: Formatted help with all menu options and descriptions
- **Content**: Welcome message + detailed option explanations
- **Side Effects**: Prints to stdout

#### `display_exit_message() -> None`
**Purpose**: Display farewell message
**Contract**:
- **Output**: Friendly goodbye message
- **Side Effects**: Prints to stdout

#### `display_message(message: str, msg_type: str = "info") -> None`
**Purpose**: Display generic colored message
**Contract**:
- **Input**:
  - `message`: Text to display
  - `msg_type`: One of ["success", "error", "info", "warning"]
- **Output**: Color-coded message
- **Colors**:
  - success: Green
  - error: Red
  - info: Blue
  - warning: Yellow
- **Side Effects**: Prints to stdout

#### `display_pause() -> None`
**Purpose**: Wait for user to press Enter
**Contract**:
- **Output**: "Press Enter to continue..." prompt
- **User Interaction**: Blocks until Enter key pressed
- **Side Effects**: Clears input buffer

### Utility Function Contracts

#### `create_box(title: str, content: List[str], width: int = 50) -> str`
**Purpose**: Create formatted box with title and content
**Contract**:
- **Input**:
  - `title`: Box header text
  - `content`: List of lines to display
  - `width`: Box width (default 50)
- **Output**: String with box-drawing characters
- **Format**: Uses Unicode box characters (┌, ┐, └, ┘, ─, │)

#### `format_task_row(task: Task, index: int) -> str`
**Purpose**: Format single task for list display
**Contract**:
- **Input**: Task object and display index
- **Output**: Formatted string with completion indicator and timestamp
- **Format**: "[ID] ☐/☑ Title\n    📅 Created: ISO timestamp"

#### `get_progress_stats(tasks: List[Task]) -> str`
**Purpose**: Calculate completion statistics
**Contract**:
- **Input**: List of tasks
- **Output**: String with counts and percentage
- **Format**: "✅ Completed: X | ☐ Pending: Y | Z% Done"

#### `validate_menu_choice(input_str: str, max_choice: int = 7) -> Tuple[bool, str]`
**Purpose**: Validate menu input
**Contract**:
- **Input**: User input string and maximum valid choice
- **Output**:
  - `(True, "")` if valid
  - `(False, error_message)` if invalid
- **Validation**: Numeric check, range check

#### `sanitize_input(text: str) -> str`
**Purpose**: Clean user input
**Contract**:
- **Input**: Raw user text
- **Output**: Sanitized text
- **Operations**: Strip whitespace, remove control chars, collapse spaces

#### `wrap_text(text: str, width: int) -> List[str]`
**Purpose**: Wrap long text to fit width
**Contract**:
- **Input**: Text and maximum width
- **Output**: List of wrapped lines
- **Algorithm**: Word-based wrapping at spaces

## User Interaction Contracts

### Menu Navigation Protocol
```
1. Display main menu
2. Prompt: "Enter your choice (1-7): "
3. Validate input
4. If invalid: Show error, pause, return to step 1
5. If valid: Route to handler
6. Execute operation
7. Show results
8. Pause
9. Return to step 1 (unless exit selected)
```

### Add Task Flow
```
1. Display add form
2. Prompt: "Enter task description: "
3. User enters title
4. Display save/cancel options
5. User chooses
6. If save: Validate → Save → Show success
7. If cancel: Return to menu
8. Pause
9. Return to menu
```

### Update Task Flow
```
1. Display task selection (step 1)
2. User selects task ID
3. If invalid: Show error, return to step 1
4. Display edit form (step 2)
5. User enters new title
6. Display save/cancel options
7. User chooses
8. If save: Validate → Update → Show success
9. If cancel: Return to menu
10. Pause
11. Return to menu
```

### Delete Task Flow
```
1. Display task selection
2. User selects task ID
3. If invalid: Show error, return to step 1
4. Display confirmation dialog
5. User chooses yes/no
6. If yes: Delete → Show success
7. If no: Return to menu
8. Pause
9. Return to menu
```

### Toggle Task Flow
```
1. Display task selection
2. User selects task ID
3. If invalid: Show error, return to step 1
4. Display confirmation dialog
5. User chooses yes/no
6. If yes: Toggle → Show success
7. If no: Return to menu
8. Pause
9. Return to menu
```

## Error Handling Contracts

### Invalid Menu Choice
**Scenario**: User enters "9" or "abc"
**Response**:
```
❌ Error: Please enter a number between 1-7
Press Enter to try again...
```
**Behavior**: Return to menu display

### Task Not Found
**Scenario**: User selects task ID that doesn't exist
**Response**:
```
❌ Error: Task with ID 99 not found
Please check the task number and try again.
Press Enter to continue...
```
**Behavior**: Return to previous step

### Empty Input
**Scenario**: User enters empty string for task title
**Response**:
```
❌ Error: Task title cannot be empty
Please enter a valid task description.
Press Enter to try again...
```
**Behavior**: Re-prompt for input

### Cancel Operation
**Scenario**: User chooses "Cancel" during operation
**Response**:
```
Operation cancelled. Returning to menu...
```
**Behavior**: Return to main menu immediately

## State Management Contracts

### Application State
- **No global state**: All state stored in database
- **No session state**: Each operation independent
- **No memory state**: Data loaded fresh for each operation

### Operation State
- **Add**: Temporary title storage during input
- **Update**: Temporary selection and new title storage
- **Toggle/Delete**: Temporary selection storage
- **All**: Cleared after operation completes

## Performance Contracts

### Response Time Targets
- **Menu Display**: <50ms
- **Task List Display**: <100ms (for <100 tasks)
- **Input Validation**: <10ms
- **Database Operations**: <50ms
- **Total Operation**: <200ms

### Memory Targets
- **Application**: <50MB resident memory
- **Task List**: <10MB for 1000 tasks
- **Operation**: <5MB peak during operation

### Startup Targets
- **Cold Start**: <1 second to first menu
- **Warm Start**: <500ms to first menu

## Testing Contracts

### Unit Test Coverage
- **UI Functions**: 100% coverage
- **Utility Functions**: 100% coverage
- **Validation Functions**: 100% coverage

### Integration Test Scenarios
- **Happy Path**: All operations complete successfully
- **Error Paths**: All error conditions handled
- **Cancel Paths**: All cancel operations work
- **Edge Cases**: Empty lists, long titles, special characters

### Visual Regression
- **Output Format**: Exact box drawing character matching
- **Color Codes**: ANSI escape sequence verification
- **Text Wrapping**: Line length compliance