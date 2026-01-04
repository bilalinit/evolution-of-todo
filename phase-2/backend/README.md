# Todo Backend - FastAPI Application

A modern, async Python backend built with FastAPI, SQLModel, and JWT authentication. Designed to integrate seamlessly with the Next.js frontend for a complete full-stack todo application.

## 🛠️ Technology Stack

- **Python 3.11+** - Modern Python with async/await support
- **FastAPI** - High-performance Python web framework
- **SQLModel** - Type-safe ORM for Python with async support
- **Neon Serverless PostgreSQL** - Cloud-native PostgreSQL database
- **UV** - Modern Python package manager
- **python-jose** - JWT token handling
- **pytest** - Async testing framework
- **Better Auth Integration** - JWT compatibility with frontend

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- UV package manager
- Neon PostgreSQL database
- BETTER_AUTH_SECRET from frontend

### Installation

```bash
# Navigate to backend directory
cd phase-2/backend

# Install UV (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv sync

# Set up environment variables
cp .env.example .env
# Edit .env with your values
```

### Environment Configuration

Create `.env` file with the following variables:

```bash
# Database (same as frontend)
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"

# JWT Secret (MUST match frontend Better Auth)
BETTER_AUTH_SECRET="your-32-char-secret-from-frontend"

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=true

# CORS Origins (JSON array)
CORS_ORIGINS='["http://localhost:3000", "http://127.0.0.1:3000"]'
```

### Development

```bash
# Start development server with hot reload
uv run uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
uv run pytest -v

# Run type checking
uv run mypy src/

# Run linting
uv run ruff check src/
```

Open [http://localhost:8000](http://localhost:8000) to view API documentation.

## 🏗️ Architecture

### Technology Stack

- **Framework**: FastAPI with async/await patterns
- **Language**: Python 3.11+ (type-safe)
- **Package Manager**: UV (modern Python dependency management)
- **Database**: Neon PostgreSQL with SQLModel ORM
- **Authentication**: python-jose for JWT verification
- **Testing**: pytest with async support
- **API Documentation**: Automatic OpenAPI/Swagger

### Project Structure

```
phase-2/backend/
├── src/backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Environment configuration
│   ├── database.py             # PostgreSQL connection & session
│   ├── exceptions.py           # Custom exception handlers
│   │
│   ├── auth/                   # Authentication modules
│   │   ├── __init__.py
│   │   └── jwt.py              # JWT verification utilities
│   │
│   ├── models/                 # Database models & schemas
│   │   ├── __init__.py
│   │   └── task.py             # Task entity & response models
│   │
│   ├── routes/                 # API endpoints
│   │   ├── __init__.py
│   │   ├── tasks.py            # Task CRUD endpoints
│   │   └── profile.py          # Profile & statistics endpoints
│   │
│   └── middleware/             # Middleware components
│       ├── __init__.py
│       └── auth.py             # Authentication middleware
│
├── scripts/                    # Utility scripts
│   ├── test_backend.py         # Backend verification script
│   ├── integration_test.py     # Comprehensive API tests
│   ├── init_db.py              # Database initialization
│   └── add_indexes.py          # Database indexes setup
│
├── pyproject.toml              # UV project configuration
├── uv.lock                     # Dependency lock file
└── .env.example                # Environment template
```

## 🔐 Authentication

### JWT Integration

The backend uses JWT tokens signed with the same secret as Better Auth:

```python
# auth/jwt.py
from jose import jwt, JWTError

def verify_token(token: str) -> str:
    """Verify JWT and return user_id"""
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    return payload["sub"]  # user_id
```

### Authentication Middleware

All protected routes use the `get_current_user` dependency:

```python
# middleware/auth.py
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Extract and verify user_id from JWT"""
    return verify_token(credentials.credentials)
```

### User Ownership Enforcement

Every database query is scoped to the authenticated user:

```python
# routes/tasks.py
async def get_tasks(
    user_id: str,
    current_user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Access denied")

    # All queries include user_id filter
    query = select(Task).where(Task.user_id == user_id)
```

## 📡 API Endpoints

### Task Management

**List Tasks with Filtering**
```http
GET /api/{user_id}/tasks
Query Params: status, priority, category, search, sort_by, order
Authorization: Bearer <jwt_token>
```

**Get Single Task**
```http
GET /api/{user_id}/tasks/{task_id}
Authorization: Bearer <jwt_token>
```

**Create Task**
```http
POST /api/{user_id}/tasks
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Task title",
  "description": "Optional description",
  "priority": "low|medium|high",
  "category": "work|personal|shopping|health|other",
  "due_date": "2025-01-15"
}
```

**Update Task**
```http
PUT /api/{user_id}/tasks/{task_id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Updated title",
  "completed": true
}
```

**Toggle Completion**
```http
PATCH /api/{user_id}/tasks/{task_id}/complete
Authorization: Bearer <jwt_token>
```

**Delete Task**
```http
DELETE /api/{user_id}/tasks/{task_id}
Authorization: Bearer <jwt_token>
```

### Profile & Statistics

**Get User Profile**
```http
GET /api/{user_id}/profile
Authorization: Bearer <jwt_token>

Response:
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "User Name"
  },
  "stats": {
    "total_tasks": 15,
    "completed_tasks": 8,
    "pending_tasks": 7
  }
}
```

### System Endpoints

**Health Check**
```http
GET /health

Response:
{
  "status": "healthy",
  "service": "todo-backend",
  "version": "0.1.0"
}
```

**API Information**
```http
GET /

Response:
{
  "message": "Todo Backend API",
  "version": "0.1.0",
  "docs": "/docs",
  "health": "/health"
}
```

## 🗄️ Database

### Models

**Task Entity**
```python
class Task(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    priority: Priority = Field(default=Priority.MEDIUM)
    category: Category = Field(default=Category.OTHER)
    due_date: Optional[date] = Field(default=None)
    user_id: str = Field(index=True)  # References Better Auth user.id
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**Database Schema**
```sql
CREATE TABLE IF NOT EXISTS task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    priority VARCHAR(10) NOT NULL,
    category VARCHAR(20) NOT NULL,
    due_date DATE,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_user_id ON task(user_id);
CREATE INDEX idx_task_completed ON task(completed);
```

### Connection Management

**Async Engine with Connection Pooling**
```python
# database.py
engine = create_async_engine(
    db_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_recycle=300,  # Recycle connections every 5 minutes
)
```

**Neon Pooler Integration**
- Automatically adds `-pooler` to Neon database hostnames
- Prevents `InvalidCachedStatementError`
- Handles connection caching on Neon's side

## 🧪 Testing

### Test Scripts

**Backend Verification**
```bash
uv run python scripts/test_backend.py
```

**Integration Tests**
```bash
uv run python scripts/integration_test.py
```

### Test Coverage

- ✅ Database connection and operations
- ✅ JWT token creation and verification
- ✅ API endpoint functionality
- ✅ Authentication failure scenarios
- ✅ Input validation and error handling
- ✅ User ownership enforcement

### Manual Testing

**Start the server:**
```bash
cd phase-2/backend
uv run uvicorn backend.main:app --reload --port 8000
```

**Test with curl:**
```bash
# Get health check
curl http://localhost:8000/health

# Test API with JWT (replace with actual token)
export JWT_TOKEN="your-jwt-token"
export USER_ID="user-123"

# List tasks
curl -H "Authorization: Bearer $JWT_TOKEN" \
     "http://localhost:8000/api/$USER_ID/tasks"

# Create task
curl -X POST -H "Authorization: Bearer $JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"Test Task","priority":"high"}' \
     "http://localhost:8000/api/$USER_ID/tasks"
```

## 🔒 Security Features

### Authentication & Authorization

- **JWT Verification**: Every request validates the token signature
- **User Ownership**: All queries scoped to authenticated user_id
- **Zero-Trust**: No trust between requests, verify on every call
- **Proper Status Codes**: 401 for invalid tokens, 403 for ownership violations

### Input Validation

- **Pydantic Models**: Type-safe request/response validation
- **Field Constraints**: Length limits, enum validation, required fields
- **Error Handling**: Detailed error messages with proper HTTP status codes

### Database Security

- **SSL Required**: Neon PostgreSQL requires SSL connections
- **Parameterized Queries**: SQLModel prevents SQL injection
- **Connection Pooling**: Prevents connection exhaustion attacks

## 🚀 Deployment

### Production Configuration

```bash
# Environment variables for production
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"
BETTER_AUTH_SECRET="production-secret-32+chars"
HOST=0.0.0.0
PORT=8000
DEBUG=false
CORS_ORIGINS='["https://yourdomain.com"]'
```

### Running in Production

```bash
# Using uvicorn directly
uv run uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4

# Using the main.py directly
uv run python -m backend.main
```

### Docker Deployment

```dockerfile
FROM python:3.11-slim
WORKDIR /app

# Install UV
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.cargo/bin:$PATH"

# Copy project files
COPY pyproject.toml uv.lock ./
COPY src/ ./src/

# Install dependencies
RUN uv sync --frozen

# Expose port
EXPOSE 8000

# Run application
CMD ["uv", "run", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📊 Performance & Monitoring

### Performance Optimizations

- **Async Everything**: Non-blocking I/O throughout
- **Connection Pooling**: Efficient database connection reuse
- **Query Optimization**: Proper indexes on user_id and common filters
- **Response Models**: Only send necessary data to client

### Logging

```python
# Built-in logging
logger.info(f"User {user_id} created task {task_id}")
logger.error(f"Database connection failed: {error}")
```

### Health Monitoring

- **/health endpoint**: For load balancer health checks
- **Database connectivity**: Verified on startup
- **Connection pool status**: Ready for monitoring tools

## 🔧 Troubleshooting

### Common Issues

**1. Database Connection Failed**
```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Verify Neon project is active
# Ensure SSL mode is set: ?sslmode=require
```

**2. JWT Verification Failed**
```bash
# Check BETTER_AUTH_SECRET matches frontend
echo $BETTER_AUTH_SECRET

# Verify token length (32+ characters)
# Ensure token hasn't expired
```

**3. CORS Errors**
```bash
# Check CORS_ORIGINS in .env
echo $CORS_ORIGINS

# Ensure frontend URL is included
# No trailing slashes in origins
```

**4. Port Already in Use**
```bash
# Kill process on port 8000
lsof -i :8000
kill -9 <PID>

# Or change PORT in .env
```

### Debug Mode

```bash
# Enable debug logging
export DEBUG=true

# Run with verbose output
uv run uvicorn backend.main:app --reload --log-level debug
```

## 📚 API Documentation

### Automatic OpenAPI Docs

Once the server is running, access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### Example API Flow

1. **Authentication**: Login via frontend to get JWT token
2. **Authorization**: Include token in `Authorization: Bearer <token>` header
3. **Task Operations**: Use user_id from JWT (sub claim) in URL path
4. **Response**: All endpoints return JSON with proper status codes

## 🤝 Integration with Frontend

### Frontend Configuration

```typescript
// frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DEMO_MODE=false
```

### API Client Example

```typescript
// frontend/lib/api.ts
export async function getTasks(userId: string) {
  const token = getAuthToken()

  return fetch(`${API_BASE}/api/${userId}/tasks`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
}
```

### Complete Integration

1. **Start Backend**: `cd phase-2/backend && uv run uvicorn backend.main:app --reload`
2. **Start Frontend**: `cd phase-2/frontend && npm run dev`
3. **Configure Frontend**: Set `NEXT_PUBLIC_DEMO_MODE=false`
4. **Test Flow**: Login → Create task → Verify in database → See in frontend

## 🎯 Current Status

**Branch**: `005-fastapi-backend` ✅ Complete
**Tasks**: 24/24 (100% complete)
**Status**: ✅ **Production Ready**

### Completed Features

- ✅ FastAPI application setup
- ✅ UV package management
- ✅ SQLModel ORM with Neon PostgreSQL
- ✅ JWT authentication with Better Auth integration
- ✅ Complete CRUD API (8 endpoints)
- ✅ User ownership enforcement
- ✅ Input validation and error handling
- ✅ Comprehensive testing suite
- ✅ Security features (CORS, validation, auth)
- ✅ Database connection pooling
- ✅ Automatic API documentation

### API Endpoints Implemented

- ✅ `GET /health` - Health check
- ✅ `GET /api/{user_id}/tasks` - List tasks with filters
- ✅ `GET /api/{user_id}/tasks/{task_id}` - Get single task
- ✅ `POST /api/{user_id}/tasks` - Create task
- ✅ `PUT /api/{user_id}/tasks/{task_id}` - Update task
- ✅ `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle completion
- ✅ `DELETE /api/{user_id}/tasks/{task_id}` - Delete task
- ✅ `GET /api/{user_id}/profile` - User profile and statistics

---

**Project**: Todo Full-Stack Application
**Phase**: 2 (Complete ✅)
**Framework**: FastAPI + Python 3.11+
**Status**: Production Ready