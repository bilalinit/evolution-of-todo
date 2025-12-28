# Phase II Migration Guide

This document outlines the migration path from Phase I (in-memory) to Phase II (database persistence).

## Current State (Phase I)

- **Storage**: In-memory list
- **Data Model**: Python dataclasses
- **Scope**: Single-user local CLI
- **Persistence**: None (session-only)

## Target State (Phase II)

- **Storage**: SQLite → Neon PostgreSQL
- **Data Model**: SQLModel
- **Scope**: Multi-user web + CLI
- **Persistence**: Database with migrations

## Migration Steps

### 1. Update Data Models

**Current (models.py):**
```python
@dataclass
class Task:
    id: int
    title: str
    completed: bool
    created_at: datetime
```

**Target (models.py):**
```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)  # NEW: Multi-user support
    title: str = Field(max_length=500)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
```

### 2. Update TaskManager

**Current (services.py):**
```python
@dataclass
class TaskManager:
    tasks: list[Task] = field(default_factory=list)
    next_id: int = 1

    def add_task(self, title: str) -> Tuple[bool, str, Optional[Task]]:
        # In-memory operations
        task = Task(id=self.next_id, ...)
        self.tasks.append(task)
        self.next_id += 1
        return True, "Success", task
```

**Target (services.py):**
```python
from sqlmodel import Session, select
from sqlalchemy.ext.asyncio import AsyncSession

class TaskManager:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add_task(self, user_id: str, title: str) -> Tuple[bool, str, Optional[Task]]:
        # Database operations
        task = Task(user_id=user_id, title=title)
        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)
        return True, f"Task added successfully! (ID: {task.id})", task

    async def list_tasks(self, user_id: str) -> Tuple[bool, str, List[Task]]:
        result = await self.session.exec(
            select(Task).where(Task.user_id == user_id).order_by(Task.id)
        )
        tasks = result.all()
        return True, "Tasks retrieved successfully.", list(tasks)
```

### 3. Update CLI Handler

**Current:**
```python
def handle_add(self, args: List[str]) -> Tuple[bool, str, bool]:
    title = " ".join(args)
    success, message, task = self.task_manager.add_task(title)
    # ...
```

**Target:**
```python
async def handle_add(self, args: List[str]) -> Tuple[bool, str, bool]:
    title = " ".join(args)
    success, message, task = await self.task_manager.add_task(self.user_id, title)
    # ...
```

### 4. Update Main Entry Point

**Current:**
```python
def main():
    task_manager = TaskManager()
    cli = CLIHandler(task_manager)
    # ...
```

**Target:**
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

async def main():
    # Database setup
    engine = create_async_engine("sqlite+aiosqlite:///todo.db")
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        task_manager = TaskManager(session)
        cli = CLIHandler(task_manager)
        # ...
```

### 5. Data Migration

**Migration Script:**
```python
# migrate.py
async def migrate_from_memory():
    """Migrate Phase I data to Phase II database."""

    # 1. Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    # 2. Load Phase I data (if any exists)
    # Note: Phase I data is session-only, so this would need to be
    # run while Phase I app is still running

    # 3. Insert into database
    async with async_session() as session:
        for task in phase1_tasks:
            db_task = Task(
                user_id="local_user",  # Assign user context
                title=task.title,
                completed=task.completed,
                created_at=task.created_at
            )
            session.add(db_task)
        await session.commit()
```

## Configuration Updates

### pyproject.toml
```toml
[project]
dependencies = [
    "sqlmodel>=0.0.30",
    "pydantic>=2.12.5",
    "sqlalchemy[asyncio]>=2.0.0",
    "aiosqlite>=0.19.0",  # For SQLite async
    # "asyncpg>=0.28.0",  # For PostgreSQL async
]
```

### Environment Variables
```bash
DATABASE_URL=sqlite+aiosqlite:///todo.db
# or for production:
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/todo
```

## API Layer Addition (Optional)

### FastAPI Endpoints
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class TaskCreate(BaseModel):
    title: str

@app.post("/tasks")
async def create_task(task: TaskCreate, user_id: str = "local_user"):
    success, message, db_task = await task_manager.add_task(user_id, task.title)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return db_task

@app.get("/tasks")
async def list_tasks(user_id: str = "local_user"):
    success, message, tasks = await task_manager.list_tasks(user_id)
    return tasks
```

## Testing Updates

### Update Tests for Async
```python
@pytest.mark.asyncio
async def test_add_task_async():
    async with async_session() as session:
        tm = TaskManager(session)
        success, message, task = await tm.add_task("user1", "Test")
        assert success is True
        assert task.title == "Test"
```

## Rollback Plan

If migration fails:

1. **Keep Phase I code** in separate branch
2. **Database rollback**: `alembic downgrade base`
3. **Revert to Phase I**: `git checkout phase1`
4. **No data loss**: Phase I was in-memory anyway

## Success Criteria for Phase II

- ✅ Database persistence working
- ✅ All Phase I tests still pass (with async updates)
- ✅ Multi-user support implemented
- ✅ FastAPI endpoints functional
- ✅ Data migration script tested
- ✅ Constitution compliance maintained

## Timeline

- **Week 1**: Database models and TaskManager updates
- **Week 2**: CLI async updates and testing
- **Week 3**: FastAPI layer and user auth
- **Week 4**: Data migration and deployment prep

---

**Next**: Start with `models.py` update to SQLModel