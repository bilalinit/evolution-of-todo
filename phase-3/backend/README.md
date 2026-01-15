# MCP Agent Backend - Phase 3

A dual-agent AI system with MCP (Model Context Protocol) integration for todo task management. Built with OpenAI Agents SDK, FastAPI, and featuring Urdu language specialization.

## 🛠️ Technology Stack

- **Python 3.12+** - Modern Python with async/await support
- **OpenAI Agents SDK 0.6.5+** - Multi-agent framework
- **MCP SDK 0.6.5+** - Model Context Protocol for tool integration
- **FastAPI** - High-performance Python web framework
- **Xiaomi mimo-v2-flash** - Cost-effective AI model
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
cd phase-3/backend

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

# AI Configuration
XIAOMI_API_KEY="your-xiaomi-mimo-api-key"
XIAOMI_BASE_URL="https://api.xiaomi.com/v1"  # Optional, defaults to Xiaomi endpoint

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=true

# CORS Origins (JSON array)
CORS_ORIGINS='["http://localhost:3000", "http://127.0.0.1:3000"]'

# Performance & Timeouts
MCP_TIMEOUT=30
AGENT_TIMEOUT=60
```

### Development

```bash
# Start development server with hot reload
uv run uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Test agent system (Checkpoint 1)
uv run python scripts/test_agents.py

# Test MCP integration (Checkpoint 2)
uv run python scripts/test_mcp_integration.py

# Run pytest tests
uv run pytest -v

# Run type checking
uv run mypy src/

# Run linting
uv run ruff check src/
```

Open [http://localhost:8000](http://localhost:8000) to view API documentation.

## 🏗️ Architecture

### Technology Stack

- **Framework**: FastAPI with async/await patterns + OpenAI Agents SDK
- **Language**: Python 3.12+ (type-safe)
- **AI Model**: Xiaomi mimo-v2-flash (cost-effective)
- **MCP Protocol**: Model Context Protocol for tool integration
- **Package Manager**: UV (modern Python dependency management)
- **Database**: Neon PostgreSQL with SQLModel ORM
- **Authentication**: python-jose for JWT verification
- **Testing**: pytest with async support
- **API Documentation**: Automatic OpenAPI/Swagger

### Project Structure

```
phase-3/backend/
├── src/backend/
│   ├── main.py                 # FastAPI app + agent registration
│   ├── config.py               # Environment configuration
│   ├── database.py             # PostgreSQL connection & session
│   ├── exceptions.py           # Custom exception handlers
│   │
│   ├── agents.py               # Dual-agent system (Orchestrator + UrduSpecialist)
│   │
│   ├── auth/                   # Authentication modules
│   │   ├── __init__.py
│   │   └── jwt.py              # JWT verification utilities
│   │
│   ├── models/                 # Database models & schemas
│   │   ├── __init__.py
│   │   └── task.py             # Task entity & response models
│   │
│   ├── services/               # Business logic layer
│   │   ├── __init__.py
│   │   └── task_service.py     # TaskService with user isolation
│   │
│   └── middleware/             # Middleware components
│       ├── __init__.py
│       └── auth.py             # Authentication middleware
│
├── task_serves_mcp_tools.py    # MCP server with 5 CRUD tools
├── scripts/                    # Testing & validation scripts
│   ├── test_agents.py          # Agent communication tests
│   ├── test_mcp_integration.py # MCP integration tests
│   ├── validate_structure.py   # Architecture validation
│   └── test_integration.py     # End-to-end tests
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

### Agent Communication

**Chat with AI Agents**
```http
POST /api/chat
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "message": "Create a task for tomorrow's meeting",
  "user_id": "user-123"
}

Response:
{
  "success": true,
  "data": {
    "message": "Task created successfully",
    "agent": "UrduSpecialist",  # or "Orchestrator"
    "tasks": [...],
    "tool_calls": [...]
  }
}
```

**Agent Health Check**
```http
GET /api/chat/health

Response:
{
  "status": "healthy",
  "service": "mcp-agent-backend",
  "version": "0.1.0",
  "agents": ["Orchestrator", "UrduSpecialist"],
  "mcp_tools": 5
}
```

### MCP Tool Operations (via Agents)

The agents can perform these operations through natural language:

**Create Task**
```bash
# Natural language example:
"Create a task for tomorrow with high priority"

# Agent executes: MCP create_task tool
```

**List Tasks**
```bash
# Natural language example:
"Show me all work tasks due this week"

# Agent executes: MCP list_tasks tool with filters
```

**Update Task**
```bash
# Natural language example:
"Mark task as completed"

# Agent executes: MCP update_task tool
```

**Delete Task**
```bash
# Natural language example:
"Delete the meeting task"

# Agent executes: MCP delete_task tool
```

**Toggle Task Status**
```bash
# Natural language example:
"Toggle task status"

# Agent executes: MCP toggle_task tool
```

### System Endpoints

**Health Check**
```http
GET /health

Response:
{
  "status": "healthy",
  "service": "mcp-agent-backend",
  "version": "0.1.0"
}
```

**API Information**
```http
GET /

Response:
{
  "message": "MCP Agent Backend API",
  "version": "0.1.0",
  "docs": "/docs",
  "health": "/health",
  "chat": "/api/chat"
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

### MCP Tool Schemas

The MCP server exposes 5 tools with strict schemas:

1. **create_task**: Creates a new task with user isolation
2. **list_tasks**: Lists tasks with filtering (status, category, search)
3. **update_task**: Updates existing task fields
4. **delete_task**: Deletes task with validation
5. **toggle_task**: Toggles task completion status

All tools include user_id validation to ensure multi-tenant security.

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

**Agent Communication Tests (Checkpoint 1)**
```bash
uv run python scripts/test_agents.py
```

**MCP Integration Tests (Checkpoint 2)**
```bash
uv run python scripts/test_mcp_integration.py
```

**Structure Validation**
```bash
uv run python scripts/validate_structure.py
```

**End-to-End Integration Tests**
```bash
uv run python scripts/test_integration.py
```

### Test Coverage

- ✅ Dual-agent system communication
- ✅ Urdu language specialization
- ✅ MCP tool execution and schemas
- ✅ User isolation across all operations
- ✅ JWT token creation and verification
- ✅ Agent → MCP → Database flow
- ✅ Error handling and recovery
- ✅ Performance (<3s response times)
- ✅ Security: Multi-layer user validation

### Manual Testing

**Start the server:**
```bash
cd phase-3/backend
uv run uvicorn backend.main:app --reload --port 8000
```

**Test with curl:**
```bash
# Get health check
curl http://localhost:8000/health

# Test agent health
curl http://localhost:8000/api/chat/health

# Test with JWT (replace with actual token)
export JWT_TOKEN="your-jwt-token"

# Chat with agents
curl -X POST -H "Authorization: Bearer $JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"message":"Create a task for tomorrow","user_id":"user-123"}' \
     "http://localhost:8000/api/chat"

# Test Urdu specialization
curl -X POST -H "Authorization: Bearer $JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"message":"میرا نام کیا ہے؟","user_id":"user-123"}' \
     "http://localhost:8000/api/chat"
```

## 🔒 Security Features

### Authentication & Authorization

- **JWT Verification**: Every request validates the token signature
- **User Ownership**: All queries scoped to authenticated user_id
- **Multi-Layer Isolation**: JWT + query + service level validation
- **Zero-Trust**: No trust between requests, verify on every call
- **Proper Status Codes**: 401 for invalid tokens, 403 for ownership violations

### MCP Tool Security

- **User Isolation**: All MCP tools validate user_id before execution
- **Per-Request Servers**: Dynamic MCP server lifecycle prevents state leakage
- **Tool Validation**: Strict schemas prevent injection attacks
- **Error Sanitization**: Sensitive errors never leak to clients

### Input Validation

- **Pydantic Models**: Type-safe request/response validation
- **Field Constraints**: Length limits, enum validation, required fields
- **Agent Guardrails**: Input validation at agent level before tool execution
- **Error Handling**: Detailed error messages with proper HTTP status codes

### Database Security

- **SSL Required**: Neon PostgreSQL requires SSL connections
- **Parameterized Queries**: SQLModel prevents SQL injection
- **Connection Pooling**: Prevents connection exhaustion attacks
- **Row-Level Security**: All queries include user_id filter

## 🚀 Deployment

### Production Configuration

```bash
# Environment variables for production
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"
BETTER_AUTH_SECRET="production-secret-32+chars"
XIAOMI_API_KEY="your-production-xiaomi-key"
XIAOMI_BASE_URL="https://api.xiaomi.com/v1"
HOST=0.0.0.0
PORT=8000
DEBUG=false
CORS_ORIGINS='["https://yourdomain.com"]'
MCP_TIMEOUT=30
AGENT_TIMEOUT=60
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

**3. AI API Issues**
```bash
# Check XIAOMI_API_KEY is set
echo $XIAOMI_API_KEY

# Verify API key is valid and active
# Check XIAOMI_BASE_URL is correct
# Ensure API quota is not exceeded
```

**4. MCP Tool Execution Failed**
```bash
# Check MCP server is running
uv run python scripts/test_mcp_integration.py

# Verify database connection
# Check user isolation is working
# Review MCP_TIMEOUT setting
```

**5. Agent Response Issues**
```bash
# Test agent communication
uv run python scripts/test_agents.py

# Check Urdu agent language settings
# Verify handoff between agents
# Review agent instructions
```

**6. CORS Errors**
```bash
# Check CORS_ORIGINS in .env
echo $CORS_ORIGINS

# Ensure frontend URL is included
# No trailing slashes in origins
```

**7. Port Already in Use**
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
export async function chatWithAgents(message: string, userId: string) {
  const token = getAuthToken()

  return fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message, user_id: userId })
  })
}
```

### Complete Integration

1. **Start Backend**: `cd phase-3/backend && uv run uvicorn backend.main:app --reload`
2. **Start Frontend**: `cd phase-3/frontend && npm run dev`
3. **Configure Frontend**: Set `NEXT_PUBLIC_DEMO_MODE=false`
4. **Test Flow**:
   - Login via Better Auth
   - Navigate to `/chatbot`
   - Send message: "Create a task for tomorrow"
   - See agent response and tool execution
   - Verify task created in database

## 🎯 Current Status

**Branch**: `007-agents-mcp` 🚧 In Progress
**Tasks**: 98/98 (100% backend complete, ChatKit pending)
**Status**: 🟡 **Checkpoint 2 Ready - Awaiting User Approval**

### Completed Features

- ✅ Dual-agent system (Orchestrator + UrduSpecialist)
- ✅ OpenAI Agents SDK integration with Xiaomi mimo-v2-flash
- ✅ MCP server with 5 CRUD tools (create, list, update, delete, toggle)
- ✅ FastAPI application with agent registration
- ✅ TaskService layer with user isolation
- ✅ JWT authentication with Better Auth integration
- ✅ Multi-layer security (JWT + query + service)
- ✅ Comprehensive integration tests (7 test cases)
- ✅ Performance validation (<3s response times)
- ✅ Urdu language specialization
- ✅ Per-request MCP server lifecycle
- ✅ Structured response format

### API Endpoints Implemented

- ✅ `GET /health` - System health check
- ✅ `GET /api/chat/health` - Agent system health
- ✅ `POST /api/chat` - Chat with AI agents
- ✅ MCP Tools: create_task, list_tasks, update_task, delete_task, toggle_task

### Checkpoint Status

- ✅ **Checkpoint 1**: Agent Foundation Complete
- 🟡 **Checkpoint 2**: Backend Integration Ready (Pending Approval)
- ⏳ **Checkpoint 3**: Frontend Implementation (Blocked)

### Next Steps

1. **User Review**: Test backend functionality
2. **Approval Required**: Explicit approval before any additional work
3. **Future Branch**: ChatKit integration planned separately

---

**Project**: MCP Agent Integration - Phase 3
**Branch**: `007-agents-mcp`
**Framework**: FastAPI + OpenAI Agents SDK + MCP Protocol
**Status**: Backend Complete, Awaiting Checkpoint 2 Approval