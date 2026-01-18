# ChatKit-2 Skill - Universal Integration Patterns

**Framework-agnostic patterns for ChatKit + OpenAI Agents SDK integration**

This skill provides universal, tested patterns for integrating OpenAI ChatKit with OpenAI Agents SDK across any backend/frontend framework and authentication system.

## When to Use This Skill

Use this skill when users need:
- **ChatKit integration** with OpenAI Agents SDK (any framework)
- **Custom ChatKitServer** implementation patterns (FastAPI, Express, Django, etc.)
- **Frontend integration** patterns (Next.js, React, Vue, Svelte, etc.)
- **User context injection** for personalized AI responses
- **Tool integration** with ChatKit conversations (MCP, function calling, etc.)
- **Data persistence** for chat threads and messages (any database)
- **Authentication patterns** for ChatKit sessions (any auth provider)

## Core Architecture

### System Flow
```
Frontend (Any Framework)
    ↓ HTTP + Auth
API Gateway/Proxy (Framework-specific)
    ↓ HTTP + Auth
Backend Server (Any Framework)
    ↓ Streaming SSE
OpenAI ChatKit SDK
    ↓ Agent Execution
OpenAI Agents SDK + Tools
    ↓ Response
ChatKit UI Component
```

### Key Components

1. **Frontend**: `@openai/chatkit-react` + CDN script loading (any framework)
2. **Backend**: Custom `ChatKitServer` subclass with `respond()` method (any backend)
3. **Store**: Database-backed store with user isolation (any database)
4. **Agents**: OpenAI Agents SDK with tool integration (any AI provider)
5. **Auth**: Authentication tokens passed through proxy (any auth system)

## Frontend Integration (React/Next.js)

### 1. CDN Script Loading (Critical)

**Location**: `app/layout.tsx` (Next.js 16+ App Router)

```typescript
import Script from 'next/script';

// In RootLayout body:
<Script
  src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
  strategy="afterInteractive"
/>
```

**Important**:
- Use `afterInteractive` strategy for Next.js 16+
- Script must be in `<body>`, not `<head>`
- No event handlers on Script component (Next.js 16+ limitation)

### 2. Enhanced Component Loading Detection

**Pattern**: Use `customElements.whenDefined()` for robust detection

```typescript
'use client'

import { useState, useEffect } from 'react'
import { ChatKit, useChatKit } from '@openai/chatkit-react'

export default function ChatBotPage() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if already defined
    if (customElements.get('openai-chatkit')) {
      setIsReady(true)
      return
    }

    // Wait for web component to be defined
    customElements.whenDefined('openai-chatkit')
      .then(() => {
        console.log('✅ ChatKit web component ready')
        setIsReady(true)
      })
      .catch((err) => {
        console.error('❌ ChatKit failed to load:', err)
        setError('ChatKit failed to load. Please refresh the page.')
      })

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (!customElements.get('openai-chatkit')) {
        setError('ChatKit took too long to load.')
      }
    }, 15000)

    return () => clearTimeout(timeout)
  }, [])
}
```

### 3. ChatKit Hook Configuration

**Pattern**: Use `url` + `domainKey` configuration with custom fetch interceptor

```typescript
const { control } = useChatKit({
  api: {
    url: '/api/chatkit',  // Next.js proxy route
    domainKey: 'local-dev', // Optional in development
  },
  theme: {
    colorScheme: 'light',
    color: {
      grayscale: { hue: 220, tint: 6, shade: -1 },
      accent: { primary: '#FF6B4A', level: 1 },
    },
    radius: 'round',
  },
  startScreen: {
    greeting: 'Hello! How can I help you today?',
    prompts: [
      { label: 'Get started', prompt: 'What can you help me with?' },
      { label: 'Ask a question', prompt: 'Tell me about your capabilities' },
    ],
  },
  composer: {
    placeholder: 'Ask me anything...',
  },
  onError: ({ error }) => {
    console.error('ChatKit error:', error)
  },
  onReady: () => {
    console.log('✅ ChatKit is ready')
  },
})
```

### 4. Next.js API Proxy Routes

**Required Endpoint** (single endpoint handles everything):
- `app/api/chatkit/route.ts` - ALL ChatKit operations

> [!CAUTION]
> Do NOT create `/session`, `/refresh`, `/threads` routes - they are NOT needed.

**Main Proxy Pattern** (`app/api/chatkit/route.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    // Get JWT token from your auth provider
    const token = await getJWTTokenFromAuth(request)

    // Forward to backend with auth header
    const backendResponse = await fetch(`${BACKEND_URL}/api/chatkit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: await request.arrayBuffer(),
    })

    // Handle streaming responses
    if (backendResponse.headers.get('content-type')?.includes('text/event-stream')) {
      return new Response(backendResponse.body, {
        status: backendResponse.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Handle JSON responses
    const data = await backendResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process ChatKit request' }, { status: 500 })
  }
}
```

## Backend Implementation (FastAPI)

### 1. ChatKit Server Subclass

**Pattern**: Extend `ChatKitServer` with custom `respond()` method

```python
from chatkit.server import ChatKitServer, StreamingResult
from chatkit.types import ThreadMetadata, UserMessageItem, ThreadStreamEvent
from chatkit.store import Store, Page
from agents import Runner
from agents.mcp import MCPServerStdio

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
        """Handle ChatKit requests and stream responses using agent system"""

        # Save thread to database
        if thread.id:
            await self.store.save_thread(thread, context)

        # Process user message with OpenAI Agents SDK
        if input_user_message:
            # Save user message
            await self.store.save_item(thread.id, input_user_message, context)

            # Extract message text
            user_text = self._extract_message_text(input_user_message)

            # Build conversation history
            history = self._build_conversation_history(thread.id)

            # Create MCP server for this request
            mcp_server = await self._create_mcp_server()

            try:
                # Run agent with MCP tools
                enhanced_input = f"[User: {context['user_id']}] {user_text}"
                result = await Runner.run(orchestrator_agent, enhanced_input, run_config=config)
                response_text = result.final_output

            finally:
                await mcp_server.cleanup()

        else:
            response_text = "Hello! I'm your AI Assistant. How can I help you?"

        # Create and save assistant response
        assistant_item = AssistantMessageItem(
            thread_id=thread.id,
            id=f"msg_{datetime.utcnow().timestamp()}",
            created_at=datetime.utcnow(),
            content=[AssistantMessageContent(text=response_text)],
        )

        await self.store.save_item(thread.id, assistant_item, context)

        # Stream response
        yield ThreadItemDoneEvent(item=assistant_item)
```

### 2. User Context Injection

**Pattern**: Extract user_id from JWT token and pass in context

```python
from fastapi import Depends, Header, HTTPException
from backend.auth.jwt import verify_token, get_user_id_from_token

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """Extract and validate user from Authorization header"""
    if not authorization:
        if os.getenv('ENVIRONMENT') == 'development':
            return {"sub": "dev-user-123", "id": "dev-user-123"}
        raise HTTPException(status_code=401, detail="Authorization required")

    token = authorization.replace("Bearer ", "")
    payload = await verify_token(token)
    return payload

@router.post("")
async def chatkit_endpoint(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Main ChatKit endpoint with user isolation"""
    user_id = get_user_id_from_token(current_user)

    # Create context with user information
    context = {
        "user_id": user_id,
        "request": request,
        "auth": current_user
    }

    # Process through ChatKit server
    result = await chatkit_server.process(await request.body(), context)

    if isinstance(result, StreamingResult):
        return StreamingResponse(result, media_type="text/event-stream")
    else:
        return Response(content=result.json, media_type="application/json")
```

### 3. PostgreSQL Store Implementation

**Pattern**: Database-backed store with user isolation

```python
class DatabaseStore(Store[dict]):
    def __init__(self):
        self._thread_items: dict[str, list[ThreadItem]] = {}
        self._thread_id_to_uuid: dict[str, str] = {}

    def _get_user_id_from_context(self, context: dict) -> str:
        return context.get("user_id")

    async def save_thread(self, thread: ThreadMetadata, context: dict) -> None:
        user_id = self._get_user_id_from_context(context)
        db_uuid = self._get_or_create_uuid(thread.id)

        with Session(engine) as session:
            # Check ownership and save to chat_sessions table
            session.execute(
                text("""
                    INSERT INTO chat_sessions (session_id, user_id, title, created_at, updated_at, metadata)
                    VALUES (:sid, :uid, :title, :created, :updated, :meta)
                """),
                {
                    "sid": db_uuid,
                    "uid": user_id,
                    "title": thread.metadata.get("title", "New Chat"),
                    "created": thread.created_at,
                    "updated": datetime.utcnow(),
                    "meta": json.dumps({"chatkit_thread_id": thread.id})
                }
            )
            session.commit()

    async def save_item(self, thread_id: str, item: ThreadItem, context: dict) -> None:
        """Save message to database with user isolation"""
        user_id = self._get_user_id_from_context(context)
        db_uuid = self._get_or_create_uuid(thread_id)

        # Extract content and determine sender type
        content = self._extract_item_content(item)
        sender_type = self._get_sender_type(item)

        with Session(engine) as session:
            session.execute(
                text("""
                    INSERT INTO chat_messages (message_id, session_id, user_id, content, sender_type, timestamp, metadata)
                    VALUES (:mid, :sid, :uid, :content, :stype, :ts, :meta)
                """),
                {
                    "mid": str(uuid4()),
                    "sid": db_uuid,
                    "uid": user_id,
                    "content": content,
                    "stype": sender_type,
                    "ts": datetime.utcnow(),
                    "meta": json.dumps({"chatkit_message_id": item.id})
                }
            )
            session.commit()
```

### 4. OpenAI Agents SDK Integration

**Pattern**: Dynamic MCP server creation per request

```python
from agents import Agent, AsyncOpenAI, OpenAIChatCompletionsModel, RunConfig
from agents.mcp import MCPServerStdio

# Configure client for Xiaomi model
client = AsyncOpenAI(
    api_key=os.environ.get("XIAOMI_API_KEY"),
    base_url="https://api.xiaomimimo.com/v1/"
)

model = OpenAIChatCompletionsModel(
    model="mimo-v2-flash",
    openai_client=client
)

config = RunConfig(model=model, model_provider=client)

# Create agent with instructions
orchestrator_agent = Agent(
    name="AI Assistant",
    instructions="""You are a helpful AI assistant with access to tools.

    **TOOL USAGE:**
    - Call tools immediately when users request actions that require tools
    - Don't describe what you'll do - just do it

    **LANGUAGE HANDLING:**
    - If user message contains URDU CHARACTERS → Respond in URDU
    - If user message is in English → Respond in ENGLISH
    """,
    model=model
)

async def _create_mcp_server(self):
    """Create dynamic MCP server for this request"""
    backend_dir = Path(__file__).parent
    project_root = backend_dir.parent.parent
    mcp_wrapper_path = backend_dir / "mcp_wrapper.py"

    server = MCPServerStdio(
        params={
            "command": "uv",
            "args": ["run", "python", str(mcp_wrapper_path)],
            "cwd": str(project_root)
        },
        client_session_timeout_seconds=60
    )

    await server.connect()
    return server
```

## Session Management

> [!IMPORTANT]
> ChatKit handles session management internally through the single `/api/chatkit` endpoint.
> You do NOT need to create separate `/session` or `/refresh` endpoints.

The `ChatKitServer.process()` method handles all session-related operations automatically.

## Database Schema

### Required Tables

```sql
-- Chat sessions table
CREATE TABLE chat_sessions (
    session_id UUID PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Chat messages table
CREATE TABLE chat_messages (
    message_id UUID PRIMARY KEY,
    session_id UUID REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sender_type VARCHAR(50) NOT NULL, -- 'user', 'assistant', 'tool'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Index for user isolation
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
```

## Import Paths

### Backend (Python)

```python
# Core ChatKit imports
from chatkit.server import ChatKitServer, StreamingResult
from chatkit.types import (
    ThreadMetadata,
    UserMessageItem,
    AssistantMessageItem,
    AssistantMessageContent,
    ThreadStreamEvent,
    ThreadItemDoneEvent
)
from chatkit.store import Store, Page

# OpenAI Agents SDK
from agents import Agent, AsyncOpenAI, OpenAIChatCompletionsModel, RunConfig, Runner
from agents.mcp import MCPServerStdio

# FastAPI
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from fastapi.responses import StreamingResponse, Response
```

### Frontend (TypeScript)

```typescript
// ChatKit React integration
import { ChatKit, useChatKit } from '@openai/chatkit-react'

// Next.js Script component for CDN
import Script from 'next/script'
```

## Common Patterns & Solutions

### 1. Web Components Detection

**Problem**: ChatKit script loading race conditions
**Solution**: Use `customElements.whenDefined()`

```typescript
// ✅ Correct
customElements.whenDefined('openai-chatkit').then(() => {
  setIsReady(true)
})

// ❌ Avoid
window.ChatKit // Not reliable
```

### 2. User Isolation

**Problem**: Multi-user access to same threads
**Solution**: Always extract user_id from JWT and filter queries

```python
# ✅ Correct - User isolation
async def load_threads(self, context: dict) -> Page[ThreadMetadata]:
    user_id = context.get("user_id")
    result = session.execute(
        text("SELECT * FROM chat_sessions WHERE user_id = :uid"),
        {"uid": user_id}
    )
```

### 3. Streaming Responses

**Problem**: ChatKit expects SSE format
**Solution**: Use `StreamingResponse` with proper headers

```python
# ✅ Correct streaming
return StreamingResponse(
    result,  # AsyncIterator
    media_type="text/event-stream",
    headers={
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
    }
)
```

### 4. Conversation History

**Problem**: Building context for agent
**Solution**: Extract from store and format for agent

```python
# Build history from thread items
conversation_history = []
for item in self.store._thread_items[thread.id][:-1]:
    if hasattr(item, 'content'):
        text = self._extract_message_text(item)
        sender = "User" if "User" in type(item).__name__ else "Assistant"
        conversation_history.append(f"{sender}: {text}")
```

### 5. Error Handling

**Problem**: ChatKit errors need proper formatting
**Solution**: Use try/catch with cleanup

```python
try:
    server = await self._create_mcp_server()
    result = await Runner.run(orchestrator_agent, input, run_config=config)
    response_text = result.final_output
except Exception as e:
    print(f"❌ Agent error: {str(e)}")
    response_text = f"I encountered an error: {str(e)}"
finally:
    if 'server' in locals():
        await server.cleanup()
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

## Environment Variables

### Required Backend Variables
```bash
OPENAI_API_KEY=sk-...           # For ChatKit Sessions API
XIAOMI_API_KEY=xm-...           # For Agents SDK with Xiaomi model
DATABASE_URL=postgresql://...   # Neon PostgreSQL connection
ENVIRONMENT=development         # or production
BETTER_AUTH_SECRET=...          # For authentication
```

### Required Frontend Variables
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NODE_ENV=development
```

## Testing & Debugging

### Health Check Endpoint
```python
@router.get("/health")
async def chatkit_health_check() -> Dict:
    return {
        "openai_key_configured": bool(os.getenv("OPENAI_API_KEY")),
        "session_endpoint_available": True,
        "store_implemented": True,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
```

### Debug Logging
- Enable debug logging in backend: `print(f"🔍 {message}")`
- Check browser console for ChatKit errors
- Monitor SSE stream in Network tab
- Verify JWT token in Authorization header

## File Reference

- `concepts/BACKEND_PATTERNS.md` - Complete FastAPI implementation
- `concepts/FRONTEND_PATTERNS.md` - React/Next.js integration
- `concepts/STORE_PATTERNS.md` - PostgreSQL store patterns
- `concepts/AGENTS_INTEGRATION.md` - OpenAI Agents SDK patterns
- `concepts/AUTH_PATTERNS.md` - JWT and session management
- `references/API_REFERENCE.md` - Complete API signatures
- `references/SCHEMA_REFERENCE.md` - Database schema details

## Production Considerations

### Security
- Always validate JWT tokens
- Use httpOnly cookies for session management
- Implement proper CORS policies
- Sanitize user input in agent prompts

### Performance
- Use connection pooling for PostgreSQL
- Implement caching for frequently accessed threads
- Use proper indexing on user_id columns
- Monitor SSE connection limits

### Scalability
- Consider Redis for session storage in production
- Implement rate limiting on ChatKit endpoints
- Use environment-specific configuration
- Monitor OpenAI API usage and costs

This skill provides accurate, production-tested patterns based on a working ChatKit implementation with OpenAI Agents SDK integration.