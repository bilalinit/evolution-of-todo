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

## Key Concepts

### 1. System Architecture
```
Frontend (React/Next.js)
    ↓ HTTP + JWT
Next.js API Routes (Proxy)
    ↓ HTTP + JWT
FastAPI Backend (ChatKitServer)
    ↓ Streaming SSE
OpenAI ChatKit SDK
    ↓ Agent Execution
OpenAI Agents SDK + MCP Tools
    ↓ Response
ChatKit UI Component
```

### 2. Critical Implementation Details

#### Frontend (Next.js 16+ App Router)
- **CDN Script**: Must be in `<body>` with `afterInteractive` strategy
- **Loading Detection**: Use `customElements.whenDefined('openai-chatkit')`
- **Authentication**: JWT tokens passed through Next.js proxy
- **API Route**: Single `/api/chatkit` endpoint handles ALL operations (no separate session/refresh needed)

#### Backend (FastAPI)
- **ChatKitServer Subclass**: Must implement `respond()` method
- **User Isolation**: Extract `user_id` from JWT token in context
- **PostgreSQL Store**: 14 required methods with user filtering
- **MCP Integration**: Dynamic server creation per request
- **Streaming**: Use `StreamingResponse` with SSE headers

#### OpenAI Agents SDK
- **Model**: Xiaomi "mimo-v2-flash" via AsyncOpenAI client
- **Configuration**: RunConfig with model and provider
- **MCP Tools**: MCPServerStdio with stdio transport
- **Language Detection**: Urdu/English based on character detection

### 3. Required Environment Variables
```bash
# Backend
OPENAI_API_KEY=sk-...           # For ChatKit Sessions API
XIAOMI_API_KEY=xm-...           # For Agents SDK
DATABASE_URL=postgresql://...   # Neon PostgreSQL
ENVIRONMENT=development

# Frontend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## Quick Reference

### Frontend Integration
```typescript
// app/layout.tsx
<Script
  src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
  strategy="afterInteractive"
/>

// app/chatbot/page.tsx
import { ChatKit, useChatKit } from '@openai/chatkit-react'

const { control } = useChatKit({
  api: { url: '/api/chatkit', domainKey: 'local-dev' },
  // ... theme config
})
```

### Backend Integration
```python
from chatkit.server import ChatKitServer
from agents import Runner

class MyChatKitServer(ChatKitServer[dict]):
    async def respond(self, thread, input_user_message, context):
        # Create MCP server
        server = await self._create_mcp_server()

        try:
            # Run agent with MCP tools
            result = await Runner.run(orchestrator_agent, input, run_config=config)
            response_text = result.final_output
        finally:
            await server.cleanup()

        # Stream response
        yield ThreadItemDoneEvent(item=assistant_item)
```

### User Context Injection
```python
# Extract user from JWT
async def get_current_user(authorization: str) -> dict:
    token = authorization.replace("Bearer ", "")
    payload = await verify_token(token)
    return payload

# Pass to ChatKit context
context = {
    "user_id": get_user_id_from_token(current_user),
    "request": request,
    "auth": current_user
}
```

## Common Patterns

### 1. Web Components Detection
```typescript
// ✅ Correct - Use whenDefined()
customElements.whenDefined('openai-chatkit').then(() => {
  setIsReady(true)
})

// ❌ Avoid - Not reliable
window.ChatKit
```

### 2. User Isolation
```python
# ✅ Correct - Filter by user_id
async def load_threads(self, context: dict):
    user_id = context.get("user_id")
    result = session.execute(
        text("SELECT * FROM chat_sessions WHERE user_id = :uid"),
        {"uid": user_id}
    )
```

### 3. Streaming Responses
```python
# ✅ Correct - SSE format
return StreamingResponse(
    result,  # AsyncIterator
    media_type="text/event-stream",
    headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
)
```

### 4. MCP Server Lifecycle
```python
# ✅ Correct - Create per request, cleanup always
server = await create_mcp_server()
try:
    orchestrator_agent.mcp_servers = [server]
    result = await Runner.run(orchestrator_agent, input, run_config=config)
finally:
    await server.cleanup()
    orchestrator_agent.mcp_servers = []
```

## File Structure

### Skill Directory
```
.claude/skills/chatkit-2/
├── CLAUDE.md              # This file - quick reference
├── SKILL.md               # Complete implementation guide
├── concepts/
│   ├── BACKEND_PATTERNS.md     # FastAPI + ChatKitServer
│   ├── FRONTEND_PATTERNS.md    # React/Next.js integration
│   ├── STORE_PATTERNS.md       # PostgreSQL store
│   ├── AGENTS_INTEGRATION.md   # OpenAI Agents SDK
│   └── AUTH_PATTERNS.md        # JWT + session management
└── references/
    ├── API_REFERENCE.md        # Complete API documentation
    └── SCHEMA_REFERENCE.md     # Database schema
```

### Project Structure (Example)
```
your-project/
├── backend/
│   ├── src/
│   │   ├── api/chatkit.py          # ChatKit server (single endpoint)
│   │   ├── agents.py               # OpenAI Agents SDK config
│   │   └── mcp_wrapper.py          # MCP server wrapper
│   └── pyproject.toml
├── frontend/
│   ├── src/app/
│   │   ├── layout.tsx              # CDN script loading
│   │   ├── chatbot/page.tsx        # ChatKit component
│   │   └── api/chatkit/route.ts    # Single proxy (handles ALL)
│   └── package.json
```

> [!CAUTION]
> Do NOT create `/api/chatkit/session`, `/api/chatkit/refresh`, or `/api/chatkit/threads` routes.

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

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "ChatKit failed to load" | CDN script not loaded | Check layout.tsx script placement |
| "OPENAI_API_KEY not found" | Missing environment variable | Set OPENAI_API_KEY in backend |
| "User ID not found in context" | JWT validation failed | Check authentication flow |
| "MCP server connection failed" | uv command not found | Ensure uv is installed |
| "Rate limit exceeded" | Too many requests | Implement exponential backoff |

### Debug Mode
```python
# Backend - Add debug prints
print(f"🔍 Debug: {message}")

# Frontend - Check browser console
console.log('✅ ChatKit ready')
console.error('❌ ChatKit error:', error)
```

## Testing

### Health Check
```bash
# Backend health
curl http://localhost:8000/api/chatkit/health

# Frontend proxy
curl http://localhost:3000/api/chatkit/health
```

### Integration Test
```python
# Test user isolation
async def test_user_isolation():
    store = DatabaseStore()

    # User A creates thread
    await store.save_thread(thread_a, {"user_id": "user-a"})

    # User B cannot access
    thread = await store.load_thread("thread-a", {"user_id": "user-b"})
    assert thread is None
```

## Production Deployment

### Security Checklist
- [ ] Use httpOnly cookies for session management
- [ ] Validate JWT tokens on every request
- [ ] Implement CORS policies
- [ ] Sanitize user input in agent prompts
- [ ] Use environment-specific API keys

### Performance Checklist
- [ ] Implement PostgreSQL connection pooling
- [ ] Use Redis for session caching (production)
- [ ] Monitor SSE connection limits
- [ ] Implement rate limiting
- [ ] Use proper database indexes

### Monitoring
```python
# Add logging to all operations
import logging
logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)
logger.info(f"User {user_id} created thread {thread_id}")
```

## Adapting for Your Project

When using this skill for your project:

1. **Authentication**: Replace the auth provider example with your specific system
2. **AI Provider**: Configure for your chosen model (Xiaomi, OpenAI, Anthropic, etc.)
3. **Database**: Adapt store patterns to your database (PostgreSQL, MongoDB, SQLite, etc.)
4. **MCP Tools**: Replace the example MCP tools with your specific tool implementations
5. **Framework**: Use the patterns that match your backend/frontend framework

## Support Channels

For issues or questions:
- Check `SKILL.md` for detailed patterns
- Review `concepts/` directory for specific components
- Consult `references/API_REFERENCE.md` for API details
- Use patterns as templates for your specific implementation

This skill provides production-ready patterns for ChatKit integration. All patterns are framework-agnostic and can be adapted to your specific backend, frontend, authentication, and AI provider requirements.