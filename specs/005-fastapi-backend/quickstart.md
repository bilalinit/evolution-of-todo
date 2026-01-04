# Quickstart: FastAPI Backend

**Feature**: FastAPI Backend for Todo App
**Branch**: `005-fastapi-backend`
**Date**: 2025-12-31

---

## Prerequisites

- Python 3.11+
- UV package manager (install: `curl -LsSf https://astral.sh/uv/install.sh | sh`)
- Access to Neon PostgreSQL database
- BETTER_AUTH_SECRET from frontend environment

---

## Step 1: Initialize Backend Package

```bash
# Navigate to phase-2 directory
cd phase-2

# Create backend directory and initialize UV package
mkdir backend
cd backend
uv init --package backend

# This creates the src/backend/ structure automatically
```

---

## Step 2: Install Dependencies

```bash
# From phase-2/backend directory
uv add fastapi uvicorn sqlmodel asyncpg python-jose[cryptography] pydantic

# Development dependencies
uv add --dev pytest httpx pytest-asyncio

# Create requirements.txt for reference
uv export --format requirements-txt > requirements.txt
```

---

## Step 3: Environment Configuration

Create `.env` file in `phase-2/backend/`:

```bash
# Database (same as frontend)
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"

# JWT Secret (MUST match frontend Better Auth)
BETTER_AUTH_SECRET="your-32-char-secret-from-frontend"

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=true

# Optional: For production
# WORKERS=4
```

**⚠️ Security Note**: Never commit `.env` file. Add to `.gitignore`.

---

## Step 4: Create Core Files

### 4.1 Database Configuration (`src/backend/database.py`)

```python
from sqlmodel import SQLModel, create_engine
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Async engine for FastAPI
engine = AsyncEngine(create_engine(DATABASE_URL, echo=True))

async def get_session() -> AsyncSession:
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session

async def init_db():
    """Initialize database - create all tables"""
    async with engine.begin() as conn:
        from .models.task import Task  # Import models to register them
        await conn.run_sync(SQLModel.metadata.create_all)
```

### 4.2 JWT Authentication (`src/backend/auth/jwt.py`)

```python
import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
ALGORITHM = "HS256"

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Verify JWT token and return user_id"""
    if not SECRET_KEY:
        raise HTTPException(status_code=500, detail="JWT secret not configured")

    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(user_id: str = Depends(verify_token)) -> str:
    """Dependency for getting current authenticated user"""
    return user_id
```

### 4.3 Task Model (`src/backend/models/task.py`)

```python
from datetime import datetime, date
from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel
from enum import Enum

class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Category(str, Enum):
    WORK = "work"
    PERSONAL = "personal"
    SHOPPING = "shopping"
    HEALTH = "health"
    OTHER = "other"

class Task(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    priority: Priority = Field(default=Priority.MEDIUM)
    category: Category = Field(default=Category.OTHER)
    due_date: Optional[date] = Field(default=None)
    user_id: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TaskCreate(SQLModel):
    title: str
    description: Optional[str] = None
    priority: Priority = Priority.MEDIUM
    category: Category = Category.OTHER
    due_date: Optional[date] = None

class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[Priority] = None
    category: Optional[Category] = None
    due_date: Optional[date] = None
```

### 4.4 Task Routes (`src/backend/routes/tasks.py`)

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from ..database import get_session
from ..auth.jwt import get_current_user
from ..models.task import Task, TaskCreate, TaskUpdate, Priority, Category

router = APIRouter()

@router.get("/api/{user_id}/tasks")
async def get_tasks(
    user_id: str,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
    status: str = Query("all", enum=["pending", "completed", "all"]),
    priority: str = Query("all", enum=["low", "medium", "high", "all"]),
    category: str = Query("all", enum=["work", "personal", "shopping", "health", "other", "all"]),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at", enum=["created_at", "due_date", "priority", "title"]),
    order: str = Query("desc", enum=["asc", "desc"])
):
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Access denied")

    # Build query
    query = select(Task).where(Task.user_id == user_id)

    # Filters
    if status != "all":
        query = query.where(Task.completed == (status == "completed"))
    if priority != "all":
        query = query.where(Task.priority == priority)
    if category != "all":
        query = query.where(Task.category == category)
    if search:
        query = query.where(
            (Task.title.contains(search)) | (Task.description.contains(search))
        )

    # Sorting
    sort_column = getattr(Task, sort_by)
    if order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Execute
    result = await session.execute(query)
    tasks = result.scalars().all()

    # Get counts
    count_query = select(
        func.count(),
        func.count(Task.id).filter(Task.completed == True),
        func.count(Task.id).filter(Task.completed == False)
    ).where(Task.user_id == user_id)

    # Apply same filters to count query
    if status != "all":
        count_query = count_query.where(Task.completed == (status == "completed"))
    if priority != "all":
        count_query = count_query.where(Task.priority == priority)
    if category != "all":
        count_query = count_query.where(Task.category == category)
    if search:
        count_query = count_query.where(
            (Task.title.contains(search)) | (Task.description.contains(search))
        )

    count_result = await session.execute(count_query)
    total, completed, pending = count_result.first()

    return {
        "tasks": tasks,
        "total": total or 0,
        "completed_count": completed or 0,
        "pending_count": pending or 0
    }

@router.post("/api/{user_id}/tasks", status_code=201)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Access denied")

    task = Task(**task_data.dict(), user_id=user_id)
    session.add(task)
    await session.commit()
    await session.refresh(task)

    return {"task": task}

@router.get("/api/{user_id}/tasks/{task_id}")
async def get_task(
    user_id: str,
    task_id: UUID,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Access denied")

    task = await session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")

    return {"task": task}

@router.put("/api/{user_id}/tasks/{task_id}")
async def update_task(
    user_id: str,
    task_id: UUID,
    task_data: TaskUpdate,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Access denied")

    task = await session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")

    for field, value in task_data.dict(exclude_unset=True).items():
        setattr(task, field, value)

    task.updated_at = datetime.utcnow()
    await session.commit()
    await session.refresh(task)

    return {"task": task}

@router.delete("/api/{user_id}/tasks/{task_id}", status_code=204)
async def delete_task(
    user_id: str,
    task_id: UUID,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Access denied")

    task = await session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")

    await session.delete(task)
    await session.commit()

@router.patch("/api/{user_id}/tasks/{task_id}/complete")
async def toggle_complete(
    user_id: str,
    task_id: UUID,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Access denied")

    task = await session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")

    task.completed = not task.completed
    task.updated_at = datetime.utcnow()
    await session.commit()
    await session.refresh(task)

    return {"task": task}
```

### 4.5 Profile Routes (`src/backend/routes/profile.py`)

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_session
from ..auth.jwt import get_current_user
from ..models.task import Task

router = APIRouter()

@router.get("/api/{user_id}/profile")
async def get_profile(
    user_id: str,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Access denied")

    # Get user info (simplified - in real app, query Better Auth user table)
    user_info = {
        "id": user_id,
        "email": "user@example.com",  # Would come from Better Auth
        "name": "User Name"           # Would come from Better Auth
    }

    # Get task statistics
    count_query = select(
        func.count(),
        func.count(Task.id).filter(Task.completed == True),
        func.count(Task.id).filter(Task.completed == False)
    ).where(Task.user_id == user_id)

    result = await session.execute(count_query)
    total, completed, pending = result.first()

    return {
        "user": user_info,
        "stats": {
            "total_tasks": total or 0,
            "completed_tasks": completed or 0,
            "pending_tasks": pending or 0
        }
    }
```

### 4.6 Main Application (`src/backend/main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from .database import init_db
from .routes.tasks import router as tasks_router
from .routes.profile import router as profile_router

app = FastAPI(
    title="FastAPI Todo Backend",
    description="Backend API for Todo application with Better Auth JWT authentication",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": "2025-12-31T00:00:00Z"
    }

# Include routers
app.include_router(tasks_router)
app.include_router(profile_router)

# Startup event
@app.on_event("startup")
async def on_startup():
    await init_db()

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host=host, port=port)
```

---

## Step 5: Run the Backend

```bash
# Development mode with hot reload
cd phase-2/backend
uv run uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uv run uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4

# Or use the main.py directly
uv run python -m backend.main
```

---

## Step 6: Test the API

### Health Check
```bash
curl http://localhost:8000/health
```

### Create Task (requires JWT token)
```bash
# Get JWT token from frontend login
export JWT_TOKEN="your-jwt-token-from-better-auth"

# Get user_id from JWT (usually the sub claim)
export USER_ID="user-uuid"

curl -X POST http://localhost:8000/api/$USER_ID/tasks \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "This is a test task",
    "priority": "high",
    "category": "work"
  }'
```

### List Tasks
```bash
curl -X GET "http://localhost:8000/api/$USER_ID/tasks?status=pending&priority=high" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

---

## Step 7: Run Tests

```bash
# Create test directory
mkdir -p tests

# Create conftest.py
cat > tests/conftest.py << 'EOF'
import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine
from sqlalchemy.orm import sessionmaker
import os

# Use in-memory SQLite for testing
TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="session")
def test_engine():
    engine = create_engine(TEST_DATABASE_URL)
    SQLModel.metadata.create_all(engine)
    return engine

@pytest.fixture
def session(test_engine):
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = SessionLocal()
    yield session
    session.close()

@pytest.fixture
def client():
    from backend.main import app
    return TestClient(app)
EOF

# Run tests
uv run pytest tests/ -v
```

---

## Integration with Frontend

### Frontend Environment Variables
```bash
# In frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DEMO_MODE=false
```

### Frontend API Client (example)
```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function getTasks(token: string, userId: string) {
  const response = await fetch(`${API_BASE}/api/${userId}/tasks`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
```

---

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check DATABASE_URL format
   - Ensure SSL mode is set: `?sslmode=require`
   - Verify Neon project is active

2. **JWT verification failed**
   - Ensure BETTER_AUTH_SECRET matches frontend exactly
   - Check token expiration
   - Verify token contains "sub" claim

3. **CORS errors**
   - Add frontend URL to `allow_origins` in CORSMiddleware
   - Check for trailing slashes

4. **Port already in use**
   - Change PORT in .env or kill process: `lsof -i :8000`

### Debug Mode
```bash
# Enable SQL query logging
export DEBUG=true

# Run with verbose output
uv run uvicorn backend.main:app --reload --log-level debug
```

---

## Next Steps

1. ✅ **Basic Setup Complete** - You now have a working FastAPI backend
2. **Add Tests** - Write comprehensive tests for all endpoints
3. **Deploy** - Containerize with Docker for production
4. **Monitoring** - Add logging and metrics
5. **Events** - Plan for future Kafka/Dapr integration

**Ready for production deployment when:**
- All tests pass
- Environment variables properly configured
- CORS properly set for production domains
- Database migrations are automated