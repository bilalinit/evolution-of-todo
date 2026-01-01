# Data Model: CLI Menu UI Transformation

**Date**: 2025-12-28
**Feature**: 002-cli-menu-ui
**Constitution Compliance**: ✅ All entities use SQLModel with strict typing

## Entities

### Task Entity

**Purpose**: Represents a single todo item in the system

**SQLModel Definition**:
```python
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(min_length=1, max_length=500)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

**Field Specifications**:
- `id`: Auto-incrementing primary key, used for task selection in UI
- `title`: User-provided task description, validated for non-empty content
- `completed`: Boolean status for completion tracking
- `created_at`: Timestamp for display and potential future sorting/filtering

**Validation Rules**:
- **Title**: Must be 1-500 characters, non-empty after sanitization
- **Completed**: Boolean only, default false
- **ID**: Positive integer for existing tasks, null for new tasks

**State Transitions**:
- **Create**: `null` → `Task(id, title, false, now)`
- **Update**: `Task(id, old_title, status, created)` → `Task(id, new_title, status, created)`
- **Toggle**: `Task(id, title, false, created)` ↔ `Task(id, title, true, created)`
- **Delete**: `Task(...)` → `null` (permanent removal)

## Relationships

**Current Scope**: Single entity (Task)
- No relationships required for CLI transformation
- Future: User entity for multi-tenant support (constitutional requirement)

## Validation Layer

### Input Sanitization

**Function**: `sanitize_input(text: str) -> str`
- **Purpose**: Clean user input before processing
- **Operations**:
  - Strip leading/trailing whitespace
  - Remove control characters
  - Collapse multiple spaces
  - Validate UTF-8 encoding

### Menu Choice Validation

**Function**: `validate_menu_choice(input_str: str, max_choice: int = 7) -> Tuple[bool, str]`
- **Purpose**: Ensure menu input is valid
- **Rules**:
  - Must be numeric
  - Must be within range 1-max_choice
  - Must not be empty
- **Returns**: (is_valid, error_message)

### Task Title Validation

**Function**: `validate_title(title: str) -> Tuple[bool, str]`
- **Purpose**: Ensure task titles are appropriate
- **Rules**:
  - Minimum 1 character after sanitization
  - Maximum 500 characters
  - Cannot be empty or whitespace-only
- **Returns**: (is_valid, error_message)

## Data Flow

### User Operation: Add Task
```
User Input → sanitize_input() → validate_title() → TaskManager.add() → Database
```

### User Operation: List Tasks
```
TaskManager.list() → [Task] → format_task_row() → display_list_view() → User
```

### User Operation: Update Task
```
User Selection → validate_task_id() → TaskManager.get() → display_update_step2()
→ sanitize_input() → validate_title() → TaskManager.update() → Database
```

### User Operation: Toggle Task
```
User Selection → validate_task_id() → TaskManager.get() → display_toggle_confirmation()
→ TaskManager.toggle() → Database
```

### User Operation: Delete Task
```
User Selection → validate_task_id() → TaskManager.get() → display_delete_confirmation()
→ TaskManager.delete() → Database
```

## Database Schema

### Current (SQLite)
```sql
CREATE TABLE task (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(500) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Future (PostgreSQL - Constitution Compliant)
```sql
CREATE TABLE task (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID NOT NULL  -- For multi-tenant support
);
```

## Constitutional Compliance

### ✅ Universal Logic Decoupling
- **Business Logic**: TaskManager service layer (unchanged)
- **Presentation**: New UI layer for CLI
- **Data**: SQLModel entities

### ✅ Strict Statelessness
- **No Session State**: All state in database
- **Ephemeral Operations**: Each command independent
- **Persistence**: Immediate DB writes

### ✅ Data Consistency & Schema
- **Typing**: Strict Python type hints
- **Validation**: Pydantic/SQLModel validation
- **Persistence**: SQLModel code-first approach

### ✅ Zero-Trust Multi-Tenancy (Future Ready)
- **Current**: Single user (CLI)
- **Architecture**: Prepared for user_id scoping
- **Future**: Row-level security when multi-user

## Testing Data Requirements

### Test Fixtures
- **Empty State**: No tasks in database
- **Single Task**: One pending task
- **Multiple Tasks**: Mixed completed/pending states
- **Edge Cases**: Long titles, special characters, empty input

### Mock Data
```python
# Sample tasks for testing
Task(id=1, title="Buy groceries", completed=False, created_at=datetime(2025,12,28,10,30))
Task(id=2, title="Complete homework", completed=True, created_at=datetime(2025,12,28,10,31))
Task(id=3, title="Call dentist", completed=False, created_at=datetime(2025,12,28,10,32))
```

## Migration Considerations

### From Current CLI to Menu UI
- **Data**: No migration needed (same Task model)
- **Interface**: Command parser → Menu router
- **User Experience**: Command memorization → Visual guidance

### Future: CLI → Web → MCP
- **Phase I (Current)**: CLI menu transformation
- **Phase II**: FastAPI web interface (reuse TaskManager)
- **Phase III**: MCP tools for AI agents (reuse TaskManager)
- **Data**: Single source of truth, multiple presentation layers