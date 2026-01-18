# API Reference

Complete API reference for ChatKit integration with OpenAI Agents SDK.

> [!IMPORTANT]
> ChatKit uses a **single endpoint** architecture. The main `POST /api/chatkit` endpoint handles ALL operations including thread creation, messages, sessions, and streaming. The separate `/session`, `/refresh`, `/threads/{id}` endpoints documented below are **DEPRECATED** and should NOT be implemented.

## Backend API (FastAPI)

### ChatKit Endpoints (Production)

#### Main ChatKit Endpoint (ONLY ENDPOINT NEEDED)
```
POST /api/chatkit
```

**Description**: Main endpoint for all ChatKit operations (messages, threads, streaming)

**Authentication**: Bearer token (JWT)

**Request Body**: ChatKit protocol buffer or JSON
- Thread creation
- Message sending
- Thread loading

**Response**:
- `200 OK`: Streaming response (SSE) for messages
- `200 OK`: JSON response for thread operations
- `400 Bad Request`: Invalid request
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Processing error

**Example**:
```bash
curl -X POST http://localhost:8000/api/chatkit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "message", "content": "Hello"}'
```

---

### DEPRECATED Endpoints (Do NOT implement)

> [!WARNING]
> The following endpoints are **NOT NEEDED**. ChatKit SDK handles all operations through the main `/api/chatkit` endpoint. These are documented only for reference if you encounter legacy code.

#### ~~Create Session~~ (DEPRECATED)
```
POST /api/chatkit/session
```

**Description**: Create a new ChatKit session using OpenAI ChatKit Sessions API

**Authentication**: Bearer token (JWT)

**Request Body**: None

**Response**:
```json
{
  "client_secret": "sk-chatkit-...",
  "session_id": "chatkit_user123_1234567890",
  "expires_at": "2024-01-17T10:00:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing authentication
- `500 Internal Server Error`: OpenAI API error or missing API key

#### ~~Refresh Session~~ (DEPRECATED)
```
POST /api/chatkit/refresh
```

**Description**: Refresh an expired ChatKit session

**Authentication**: Bearer token (JWT)

**Request Body**: None

**Response**: Same as create session endpoint

#### ~~List Threads~~ (DEPRECATED)
```
GET /api/chatkit/threads
```

**Description**: List all chat threads for the authenticated user

**Authentication**: Bearer token (JWT)

**Query Parameters**:
- `after` (optional): Cursor for pagination
- `limit` (optional): Number of threads to return (default: 50)
- `order` (optional): Sort order ("asc" or "desc", default: "desc")

**Response**:
```json
{
  "data": [
    {
      "id": "thread_abc123",
      "title": "My Chat Thread",
      "created_at": "2024-01-17T09:00:00Z",
      "metadata": {}
    }
  ],
  "has_more": false,
  "after": null
}
```

#### ~~Create Thread~~ (DEPRECATED)
```
POST /api/chatkit/threads
```

**Description**: Create a new chat thread

**Authentication**: Bearer token (JWT)

**Request Body**: None

**Response**:
```json
{
  "data": {
    "id": "thread_user123_1234567890",
    "title": "New Conversation",
    "created_at": "2024-01-17T09:00:00Z",
    "metadata": {}
  }
}
```

#### ~~Get Thread~~ (DEPRECATED)
```
GET /api/chatkit/threads/{thread_id}
```

**Description**: Get specific thread details

**Authentication**: Bearer token (JWT)

**Path Parameters**:
- `thread_id`: The thread identifier

**Response**:
```json
{
  "id": "thread_abc123",
  "title": "My Chat Thread",
  "created_at": "2024-01-17T09:00:00Z",
  "metadata": {}
}
```

**Error Responses**:
- `404 Not Found`: Thread not found or access denied

#### ~~Add Thread Item~~ (DEPRECATED)
```
POST /api/chatkit/threads/{thread_id}/items
```

**Description**: Add an item (message) to a thread

**Authentication**: Bearer token (JWT)

**Path Parameters**:
- `thread_id`: The thread identifier

**Request Body**:
```json
{
  "type": "message",
  "content": "Hello, how are you?",
  "role": "user"
}
```

**Response**:
```json
{
  "id": "msg_abc123",
  "thread_id": "thread_abc123",
  "created_at": "2024-01-17T09:00:00Z"
}
```

#### Health Check
```
GET /api/chatkit/health
```

**Description**: Check ChatKit configuration status

**Authentication**: None

**Response**:
```json
{
  "openai_key_configured": true,
  "session_endpoint_available": true,
  "store_implemented": true,
  "timestamp": "2024-01-17T09:00:00Z"
}
```

## Frontend API (Next.js)

### Proxy Endpoints

#### Main ChatKit Proxy
```
POST /api/chatkit
```

**Description**: Proxy endpoint that forwards requests to backend

**Authentication**: Uses Better Auth session cookies

**Request Body**: ChatKit protocol data

**Response**: Same as backend endpoint (streaming or JSON)

#### Session Proxy
```
POST /api/chatkit/session
```

**Description**: Proxy for session creation

**Authentication**: Bearer token or development bypass

**Response**: Same as backend session endpoint

#### Refresh Proxy
```
POST /api/chatkit/refresh
```

**Description**: Proxy for session refresh

**Authentication**: Bearer token or development bypass

**Response**: Same as backend refresh endpoint

## ChatKit React Component

### useChatKit Hook

```typescript
import { useChatKit } from '@openai/chatkit-react'

const { control } = useChatKit(config)
```

**Configuration Object**:
```typescript
interface ChatKitConfig {
  api: {
    url: string           // Backend API endpoint
    domainKey?: string     // Optional domain key for development
  }
  theme?: {
    colorScheme?: 'light' | 'dark'
    color?: {
      grayscale?: { hue: number, tint: number, shade: number }
      accent?: { primary: string, level: number }
    }
    radius?: 'none' | 'small' | 'medium' | 'large' | 'round'
    fontFamily?: {
      sans?: string
      serif?: string
      mono?: string
    }
  }
  startScreen?: {
    greeting?: string
    prompts?: Array<{ label: string, prompt: string }>
  }
  composer?: {
    placeholder?: string
  }
  onError?: (error: { error: Error }) => void
  onReady?: () => void
}
```

**Returns**:
```typescript
{
  control: ChatKitControl  // Control object for ChatKit component
}
```

### ChatKit Component

```typescript
import { ChatKit } from '@openai/chatkit-react'

<ChatKit control={control} style={{ width: '100%', height: '100%' }} />
```

**Props**:
- `control`: Control object from `useChatKit` hook
- `style`: Optional CSS styles for the component

## ChatKit Server (Python)

### ChatKitServer Class

```python
from chatkit.server import ChatKitServer

class MyChatKitServer(ChatKitServer[dict]):
    def __init__(self, store: Store):
        super().__init__(store=store)
        self.store = store

    async def respond(
        self,
        thread: ThreadMetadata,
        input_user_message: UserMessageItem | None,
        context: dict,
    ) -> AsyncIterator[ThreadStreamEvent]:
        """Handle ChatKit requests and stream responses"""
        # Implementation
        pass
```

**Methods**:

#### respond()
```python
async def respond(
    self,
    thread: ThreadMetadata,
    input_user_message: UserMessageItem | None,
    context: dict,
) -> AsyncIterator[ThreadStreamEvent]
```

**Parameters**:
- `thread`: `ThreadMetadata` - Thread information
- `input_user_message`: `UserMessageItem | None` - User message (None for thread load)
- `context`: `dict` - Request context (includes user_id, request, auth)

**Returns**: `AsyncIterator[ThreadStreamEvent]` - Stream of events

**Context Object**:
```python
{
    "user_id": str,           # Authenticated user ID
    "request": Request,       # FastAPI request object
    "auth": dict              # JWT token payload
}
```

### Store Interface

```python
from chatkit.store import Store, Page
from chatkit.types import ThreadMetadata, ThreadItem

class Store(Store[dict]):
    async def save_thread(self, thread: ThreadMetadata, context: dict) -> None
    async def load_thread(self, thread_id: str, context: dict) -> Optional[ThreadMetadata]
    async def load_threads(self, after: Optional[str], limit: int, order: str, context: dict) -> Page[ThreadMetadata]
    async def delete_thread(self, thread_id: str, context: dict) -> None
    async def load_thread_items(self, thread_id: str, after: Optional[str], limit: int, order: str, context: dict) -> Page[ThreadItem]
    async def add_thread_item(self, thread_id: str, item: ThreadItem, context: dict) -> None
    async def save_item(self, thread_id: str, item: ThreadItem, context: dict) -> None
    async def load_item(self, thread_id: str, item_id: str, context: dict) -> Optional[ThreadItem]
    async def delete_thread_item(self, thread_id: str, item_id: str, context: dict) -> None
    async def save_attachment(self, attachment_id: str, data: bytes, context: dict) -> None
    async def load_attachment(self, attachment_id: str, context: dict) -> Optional[bytes]
    async def delete_attachment(self, attachment_id: str, context: dict) -> None
```

## OpenAI Agents SDK

### Agent Class

```python
from agents import Agent

agent = Agent(
    name: str,
    instructions: str,
    model: Model,
    handoffs: Optional[List[Agent]] = None,
    tools: Optional[List[Callable]] = None
)
```

**Parameters**:
- `name`: Agent name
- `instructions`: System prompt/instructions
- `model`: Model instance (e.g., `OpenAIChatCompletionsModel`)
- `handoffs`: List of agents to hand off to
- `tools`: List of function tools

### Runner

```python
from agents import Runner

result = await Runner.run(
    agent: Agent,
    input: str,
    run_config: Optional[RunConfig] = None
)
```

**Parameters**:
- `agent`: Agent to run
- `input`: User input string
- `run_config`: Configuration for model and provider

**Returns**: `RunResult`

**RunResult Object**:
```python
class RunResult:
    final_output: str           # Final response text
    messages: List[Message]     # Conversation messages
    usage: Usage                # Token usage
```

### RunConfig

```python
from agents import RunConfig, OpenAIChatCompletionsModel, AsyncOpenAI

client = AsyncOpenAI(
    api_key="your-api-key",
    base_url="https://api.xiaomimimo.com/v1/"
)

model = OpenAIChatCompletionsModel(
    model="mimo-v2-flash",
    openai_client=client
)

config = RunConfig(
    model=model,
    model_provider=client
)
```

### MCP Server

```python
from agents.mcp import MCPServerStdio

server = MCPServerStdio(
    params={
        "command": "uv",
        "args": ["run", "python", "mcp_wrapper.py"],
        "cwd": "/path/to/project"
    },
    client_session_timeout_seconds=60
)

await server.connect()
agent.mcp_servers = [server]

# ... run agent ...

await server.cleanup()
```

## Data Types

### ThreadMetadata

```python
from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Dict, Any

@dataclass
class ThreadMetadata:
    id: str
    created_at: datetime
    metadata: Optional[Dict[str, Any]] = None
```

### UserMessageItem

```python
@dataclass
class UserMessageItem:
    thread_id: str
    id: str
    created_at: datetime
    content: List[Dict[str, Any]]  # [{"type": "input_text", "text": "..."}]
    inference_options: Dict[str, Any]
```

### AssistantMessageItem

```python
@dataclass
class AssistantMessageItem:
    thread_id: str
    id: str
    created_at: datetime
    content: List[AssistantMessageContent]
```

### AssistantMessageContent

```python
@dataclass
class AssistantMessageContent:
    text: str
```

### ThreadItemDoneEvent

```python
@dataclass
class ThreadItemDoneEvent:
    item: ThreadItem
```

### Page (Pagination)

```python
from typing import List, Optional, Generic, TypeVar

T = TypeVar('T')

@dataclass
class Page(Generic[T]):
    data: List[T]
    has_more: bool
    after: Optional[str]
```

## Error Types

### HTTP Errors

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | User doesn't have permission |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Application Errors

```python
class ChatKitError(Exception):
    """Base ChatKit error"""
    pass

class AuthenticationError(ChatKitError):
    """Authentication failed"""
    pass

class ValidationError(ChatKitError):
    """Request validation failed"""
    pass

class DatabaseError(ChatKitError):
    """Database operation failed"""
    pass

class AgentError(ChatKitError):
    """Agent execution failed"""
    pass
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for ChatKit Sessions | `sk-...` |
| `XIAOMI_API_KEY` | Xiaomi API key for Agents SDK | `xm-...` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `ENVIRONMENT` | Deployment environment | `development` |
| `BETTER_AUTH_SECRET` | Better Auth secret key | `your-secret-key` |
| `BETTER_AUTH_URL` | Better Auth base URL | `http://localhost:3000` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL for frontend | `http://localhost:8000` |
| `DATABASE_POOL_SIZE` | Connection pool size | `10` |
| `RATE_LIMIT_REQUESTS` | Requests per minute | `10` |

## WebSocket Events (Streaming)

### Server → Client Events

#### Thread Created
```json
{
  "type": "thread.created",
  "thread": {
    "id": "thread_abc123",
    "title": "New Chat",
    "created_at": "2024-01-17T09:00:00Z"
  }
}
```

#### Message Added
```json
{
  "type": "message.added",
  "message": {
    "id": "msg_abc123",
    "thread_id": "thread_abc123",
    "content": "Hello!",
    "role": "user",
    "created_at": "2024-01-17T09:00:00Z"
  }
}
```

#### Streaming Response
```json
{
  "type": "stream.delta",
  "thread_id": "thread_abc123",
  "delta": "Hello, how can I help you?"
}
```

#### Error Event
```json
{
  "type": "error",
  "error": {
    "code": "internal_error",
    "message": "Something went wrong"
  }
}
```

## Rate Limiting

### Default Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/chatkit` | 10 requests | 60 seconds |
| `/api/chatkit/session` | 5 requests | 60 seconds |
| `/api/chatkit/refresh` | 5 requests | 60 seconds |

### Custom Rate Limiting

```python
from fastapi import Depends, HTTPException
from datetime import datetime, timedelta
from collections import defaultdict

class RateLimiter:
    def __init__(self, max_requests: int = 10, window: int = 60):
        self.max_requests = max_requests
        self.window = window
        self.requests = defaultdict(list)

    async def __call__(self, user_id: str):
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=self.window)

        # Clean old requests
        self.requests[user_id] = [
            req_time for req_time in self.requests[user_id]
            if req_time > window_start
        ]

        # Check limit
        if len(self.requests[user_id]) >= self.max_requests:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded"
            )

        # Add current request
        self.requests[user_id].append(now)

# Usage
rate_limiter = RateLimiter(max_requests=10, window=60)

@router.post("")
async def chatkit_endpoint(
    current_user: dict = Depends(get_current_user),
    rate_limit: None = Depends(rate_limiter(current_user["id"]))
):
    # ... endpoint implementation
```

## Pagination

### Cursor-Based Pagination

**Request**:
```bash
GET /api/chatkit/threads?limit=20&after=thread_abc123&order=desc
```

**Response**:
```json
{
  "data": [...],
  "has_more": true,
  "after": "thread_xyz789"
}
```

**Usage Pattern**:
```typescript
// First page
const firstPage = await fetch('/api/chatkit/threads?limit=20')

// Next page
if (firstPage.has_more) {
  const nextPage = await fetch(
    `/api/chatkit/threads?limit=20&after=${firstPage.after}`
  )
}
```

## Authentication Flow

### JWT Token Flow

```
1. User logs in via Better Auth
2. Frontend gets session token
3. Frontend calls /api/auth/token to get JWT
4. Frontend includes JWT in Authorization header
5. Backend validates JWT and extracts user_id
6. Backend uses user_id for data isolation
```

### Development Mode

```
1. Set ENVIRONMENT=development
2. Frontend can make requests without auth
3. Backend uses first database user as fallback
4. All operations isolated to development user
```

## Dependencies

### Backend (Python)
```bash
# Core ChatKit + Agents SDK
uv add openai-chatkit
uv add openai-agents
uv add openai
uv add mcp

# Backend framework
uv add fastapi uvicorn

# Database (choose one for your project)
uv add sqlmodel psycopg2-binary  # PostgreSQL
# OR
uv add sqlmodel asyncpg          # Async PostgreSQL
# OR
uv add pymongo                   # MongoDB

# Authentication (choose one)
uv add pyjwt                     # JWT
# OR
uv add python-jose               # JWT alternative
```

### Frontend (TypeScript)
```bash
# Core ChatKit
npm install @openai/chatkit-react

# Next.js (if using Next.js)
npm install next react react-dom

# Authentication (choose one)
npm install better-auth
# OR
npm install next-auth

# UI/UX (optional)
npm install framer-motion lucide-react sonner
```

## Database Schema

### chat_sessions Table

| Column | Type | Description |
|--------|------|-------------|
| `session_id` | UUID | Primary key |
| `user_id` | VARCHAR(255) | User identifier |
| `title` | VARCHAR(255) | Thread title |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update time |
| `metadata` | JSONB | Additional metadata |

### chat_messages Table

| Column | Type | Description |
|--------|------|-------------|
| `message_id` | UUID | Primary key |
| `session_id` | UUID | Foreign key to chat_sessions |
| `user_id` | VARCHAR(255) | User identifier |
| `content` | TEXT | Message content |
| `sender_type` | VARCHAR(50) | 'user', 'assistant', 'tool' |
| `timestamp` | TIMESTAMP | Message time |
| `metadata` | JSONB | Additional metadata |

## Performance Metrics

### Expected Response Times

| Operation | Expected Time | Max Time |
|-----------|---------------|----------|
| Thread creation | 100-500ms | 2s |
| Message send | 500-2000ms | 5s |
| Thread list | 50-200ms | 1s |
| Agent response | 1000-5000ms | 30s |

### Monitoring Metrics

```python
# Example metrics to track
metrics = {
    "request_count": 0,
    "error_count": 0,
    "avg_response_time": 0,
    "active_connections": 0,
    "tokens_used": 0
}
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| ChatKit not loading | Check CDN script in layout.tsx |
| Authentication failed | Verify JWT token and Authorization header |
| Database connection error | Check DATABASE_URL and connection pool |
| Agent timeout | Increase timeout or check MCP server |
| Rate limiting | Implement exponential backoff |
| CORS errors | Configure proper CORS middleware |

### Debug Mode

```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Add debug prints
print(f"🔍 Debug: {message}")
```

This API reference provides complete documentation for all ChatKit integration components, from backend endpoints to frontend components and agent configurations.