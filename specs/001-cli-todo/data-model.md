# Data Model: CLI Todo Application (Phase I - In-Memory)

## Entity Model

### Task Entity
Core todo item for in-memory storage (Phase I).

**Dataclass Definition**:
```python
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Task:
    id: int              # Unique identifier, auto-incremented
    title: str           # Task title/description (required, non-empty)
    completed: bool      # Completion status (default: False)
    created_at: datetime # Timestamp of creation
```

**Validation Rules**:
- `id`: Auto-increment integer (managed by TaskManager)
- `title`: 1-500 chars, non-empty, trimmed
- `completed`: Boolean, default False
- `created_at`: Auto-set on creation

## Storage Model

### In-Memory Storage
```python
# Global state (in TaskManager)
tasks: list[Task] = []          # List of all tasks
next_id: int = 1                # Auto-increment counter
current_user_id: str = "local_user"  # Single user context
```

**Scope**: Single-user, session-only (data lost on app exit)

## State Transitions

### Task Lifecycle
```
[Created] → (pending) → [Toggle] → (completed) → [Toggle] → (pending)
     ↓                                                      ↑
[Delete] → [Removed] ──────────────────────────────────────┘
```

**State Validation**:
- Cannot create task with `completed=True` (must start as pending)
- Toggle operation flips `completed` state
- Delete operation is irreversible (list removal)

## Data Flow

### Memory Operations
```python
# Add: tasks.append(Task(...))
# List: return tasks (sorted by id)
# Update: tasks[index].title = new_title
# Delete: tasks.pop(index)
# Toggle: tasks[index].completed = not tasks[index].completed
```

## Phase II Migration Path

### Database Schema (Future)
```sql
-- Future: SQLModel entities for Phase II
CREATE TABLE task (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(36) NOT NULL,        -- Added in Phase II
    title VARCHAR(500) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Migration Strategy
1. **Replace**: `@dataclass` → `SQLModel`
2. **Add**: `user_id` field for multi-user support
3. **Convert**: `list[Task]` → database queries
4. **Preserve**: Same service layer interface
5. **Add**: Database initialization step

## Pydantic Schemas (Validation)

### Input Validation Models
```python
from pydantic import BaseModel, Field, field_validator
from typing import Optional

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('Task title cannot be empty')
        return v

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError('Task title cannot be empty')
        return v
```

### Output Models (for CLI display)
```python
from dataclasses import dataclass
from datetime import datetime

@dataclass
class TaskDisplay:
    id: int
    title: str
    completed: bool
    created_at: datetime
```

## Storage Operations

### In-Memory TaskManager State
```python
@dataclass
class TaskManager:
    tasks: list[Task] = field(default_factory=list)
    next_id: int = 1

    # All operations work with this in-memory state
```

### Operation Patterns
```python
# Add: tasks.append(Task(id=next_id, ...)); next_id += 1
# List: sorted(tasks, key=lambda t: t.id)
# Update: tasks[index].title = new_title
# Delete: tasks.pop(index)
# Toggle: tasks[index].completed = not tasks[index].completed
```

## Phase II Migration Strategy

### From In-Memory to Database
1. **Replace**: `list[Task]` → SQLModel + SQLite
2. **Add**: `user_id: str` field
3. **Update**: TaskManager to use database session
4. **Preserve**: Same public interface (add_task, list_tasks, etc.)
5. **Add**: Database initialization and migration steps

### Data Migration
```python
# Phase I data: tasks = [Task(...), ...]
# Phase II migration:
for task in phase1_tasks:
    db_task = TaskModel(
        user_id="local_user",  # Assign user context
        title=task.title,
        completed=task.completed,
        created_at=task.created_at
    )
    session.add(db_task)
```

## Testing Considerations

### Unit Tests
- Task creation with validation
- List sorting and filtering
- Update operations
- Delete operations
- Toggle state changes

### Integration Tests
- Complete user flows
- Error handling
- Edge cases (empty list, invalid IDs)

This data model provides the foundation for Phase I in-memory implementation with a clear path to Phase II database persistence.