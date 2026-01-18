# Research: MCP Agent Integration

**Date**: 2026-01-13
**Branch**: 007-agents-mcp
**Feature**: Phase 3 MCP Agent Integration Specification

## Executive Summary
This research document resolves all technical unknowns identified in the Phase 3 MCP Agent Integration specification. Findings are based on existing codebase analysis, skill documentation review, and integration patterns.

---

## Decision 1: OpenAI Agents SDK Integration with FastAPI

**Decision**: Use OpenAI Agents SDK with Xiaomi mimo-v2-flash model, integrated via FastAPI endpoints using `AsyncOpenAI` client.

**Rationale**:
- Existing backend uses FastAPI with async architecture
- OpenAI Agents SDK skill provides complete integration patterns for FastAPI
- Xiaomi mimo-v2-flash model is cost-effective and specified in requirements
- AsyncOpenAI client supports non-blocking operations essential for FastAPI

**Implementation Pattern**:
```python
# agents.py
from agents import Agent, Runner, OpenAIChatCompletionsModel
from agents import AsyncOpenAI

# Create Xiaomi client
client = AsyncOpenAI(
    api_key=os.environ["XIAOMI_API_KEY"],
    base_url="https://api.xiaomimimo.com/v1/"
)

# Create model
model = OpenAIChatCompletionsModel(
    model="mimo-v2-flash",
    openai_client=client
)

# Define agents
orchestrator = Agent(name="Orchestrator", model=model, ...)
urdu_agent = Agent(name="UrduSpecialist", model=model, ...)
```

**Integration with FastAPI**:
```python
# main.py
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest, user_id: str = Depends(get_current_user)):
    # Create MCP server per request
    # Run agents with user context
    # Return structured response
```

**Alternatives Considered**:
- ❌ Direct OpenAI API: No agent orchestration capabilities
- ❌ LangChain: More complex, unnecessary for this use case
- ✅ OpenAI Agents SDK: Purpose-built for agent workflows

---

## Decision 2: MCP Server Lifecycle Management

**Decision**: Create MCP server per request with dynamic lifecycle management, following the "Dynamic Server Lifecycle" pattern from MCP Integration skill.

**Rationale**:
- **Security**: Prevents cross-user data contamination
- **Resource Management**: Ensures proper cleanup and prevents memory leaks
- **Flexibility**: Allows different tool configurations per request
- **Constitution Compliance**: Supports "Strict Statelessness" principle

**Implementation Pattern**:
```python
# main.py
async def run_agents_with_mcp(user_input: str, user_id: str) -> dict:
    # Create fresh server per request
    server = MCPServerStdio(
        params={
            "command": "uv",
            "args": ["run", "task_serves_mcp_tools.py"]
        },
        client_session_timeout_seconds=60
    )

    # Assign to agents
    orchestrator.mcp_servers = [server]
    urdu_agent.mcp_servers = [server]

    try:
        await server.connect()
        # Run with user context
        enhanced_input = f"[User: {user_id}] {user_input}"
        result = await Runner.run(orchestrator, enhanced_input)
        return parse_result(result)
    finally:
        await server.cleanup()
```

**Alternatives Considered**:
- ❌ Static server: Risk of memory leaks and cross-user contamination
- ❌ Connection pooling: Over-complex for current requirements
- ✅ Per-request server: Clean, secure, follows MCP patterns

---

## Decision 3: User Isolation & JWT Integration

**Decision**: Implement multi-layer user isolation using existing JWT system + MCP tool parameter enforcement.

**Rationale**:
- **Constitution**: Zero-Trust Multi-Tenancy requires query-level isolation
- **Existing Pattern**: Backend already has `verify_user_ownership()` middleware
- **MCP Pattern**: All tools must require `user_id` parameter
- **Security**: Defense in depth - multiple validation layers

**Implementation Pattern**:
```python
# task_serves_mcp_tools.py
@mcp.tool()
def create_task(user_id: str, title: str, description: str = None) -> dict:
    """
    Create a task for the authenticated user.

    Args:
        user_id: User ID from JWT (auto-provided by MCP framework)
        title: Task title
        description: Optional task description
    """
    # Service layer enforces user isolation
    service = TaskService()
    try:
        result = service.create(user_id=user_id, title=title, description=description)
        return {"success": True, "data": result.to_dict()}
    except Exception as e:
        return {"success": False, "error": str(e)}
```

**JWT Flow**:
1. Frontend: Better Auth manages session, extracts JWT
2. API Client: Adds `Authorization: Bearer <token>` header
3. FastAPI: `get_current_user()` validates JWT, extracts user_id
4. Agent Context: User ID injected into agent input
5. MCP Tools: User ID passed as required parameter
6. Service Layer: Applies user_id filter to all queries

**Alternatives Considered**:
- ❌ Trust agent to enforce isolation: Security risk
- ❌ Database-level RLS: Complex, not supported by current setup
- ✅ Multi-layer validation: Secure, follows existing patterns

---

## Decision 4: Frontend Chatbot Integration

**Decision**: Create `/chatbot` page using existing Next.js patterns, connecting to backend `/api/chat` endpoint with real-time communication.

**Rationale**:
- **Existing Infrastructure**: Uses same API client and auth system
- **User Experience**: Consistent with existing task dashboard design
- **Real-time**: Supports streaming responses for agent interactions
- **Type Safety**: Full TypeScript support with existing type definitions

**Implementation Pattern**:
```typescript
// frontend/src/app/chatbot/page.tsx
"use client"

import { useSession } from "@/hooks/useAuth"
import { useChat } from "@/hooks/useChat" // New hook
import { ChatInput } from "@/components/chat/ChatInput"
import { ChatMessages } from "@/components/chat/ChatMessages"

export default function ChatbotPage() {
  const { session } = useSession()
  const { messages, sendMessage, isLoading } = useChat()

  return (
    <div className="space-y-6">
      <ChatMessages messages={messages} />
      <ChatInput
        onSend={sendMessage}
        disabled={isLoading || !session}
      />
    </div>
  )
}

// New hook for chat functionality
// frontend/src/hooks/useChat.ts
export function useChat() {
  const queryClient = useQueryClient()

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const token = await getJwtToken()
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      })
      return response.json()
    },
    onSuccess: (response) => {
      // Update message thread
    }
  })
}
```

**Real-time Communication**:
- **Option A**: Standard HTTP request/response (simpler)
- **Option B**: Server-Sent Events for streaming responses (better UX)
- **Decision**: Start with Option A, upgrade to Option B if needed

**Alternatives Considered**:
- ❌ Separate chat service: Over-engineering
- ❌ WebSocket complexity: Unnecessary for current requirements
- ✅ HTTP + potential SSE: Simple, scalable, follows existing patterns

---

## Decision 5: Agent Coordination & Routing

**Decision**: Orchestrator agent analyzes user input and routes to Urdu agent based on language detection and content analysis.

**Rationale**:
- **Language Specialization**: Urdu agent optimized for Urdu responses
- **Efficiency**: Orchestrator handles routing, Urdu agent handles language
- **User Experience**: Seamless handoff without user awareness
- **Scalability**: Easy to add more specialized agents later

**Implementation Pattern**:
```python
# agents.py
orchestrator = Agent(
    name="Orchestrator",
    instructions="""You are a task management coordinator. Analyze user requests and route appropriately:

    1. Urdu Language: Route to UrduSpecialist for any Urdu content or requests
    2. Task Operations: Use MCP tools for CRUD operations
    3. General Queries: Handle directly with your knowledge

    Always maintain context about which agent is responding.
    """,
    handoffs=[urdu_agent],
    model=model
)

urdu_agent = Agent(
    name="UrduSpecialist",
    instructions="""You respond EXCLUSIVELY in Urdu language.
    - Use cultural context and appropriate tone
    - Access MCP tools when users request task operations
    - Maintain Urdu language throughout all responses
    - If user switches to English, politely continue in Urdu
    """,
    model=model
)
```

**Routing Logic**:
- **Language Detection**: Check for Urdu script/characters
- **Content Analysis**: Determine if task operation vs. general query
- **Agent Attribution**: Always include which agent responded

**Alternatives Considered**:
- ❌ Manual routing: Poor user experience
- ❌ Single agent with language switching: Complex, less specialized
- ✅ Dual-agent with handoff: Clean separation, optimal specialization

---

## Decision 6: Performance & Scaling Requirements

**Decision**: Target response times of <3 seconds for agent interactions, with connection pooling and request timeouts.

**Rationale**:
- **User Experience**: Sub-3-second responses maintain engagement
- **Resource Management**: Prevents hanging requests
- **Constitution**: Supports "Strict Statelessness" and horizontal scaling
- **MCP Lifecycle**: Per-request servers need reasonable timeouts

**Performance Targets**:
- **Agent Response**: <2 seconds (model inference)
- **MCP Tool Operations**: <500ms (database queries)
- **Total Request**: <3 seconds end-to-end
- **Concurrent Users**: Support 100+ concurrent sessions

**Implementation Strategies**:
```python
# Connection pooling
engine = create_async_engine(
    db_url,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=20,
    max_overflow=50
)

# Request timeouts
server = MCPServerStdio(
    params={...},
    client_session_timeout_seconds=30  # Reasonable timeout
)

# Agent timeout
result = await Runner.run(
    agent,
    input_text,
    run_config=RunConfig(
        model=model,
        model_provider=client,
        timeout=30.0  # Agent timeout
    )
)
```

**Alternatives Considered**:
- ❌ No timeouts: Risk of hanging requests
- ❌ Overly aggressive timeouts: Poor user experience
- ✅ Balanced timeouts: Good UX with resource protection

---

## Decision 7: Error Handling & Resilience

**Decision**: Implement comprehensive error handling following MCP patterns with structured responses and graceful degradation.

**Rationale**:
- **User Experience**: Clear error messages instead of crashes
- **Debugging**: Structured errors help identify issues
- **Resilience**: System continues functioning despite individual failures
- **Constitution**: Supports "Universal Logic Decoupling" with proper error separation

**Error Categories**:
1. **Authentication Errors**: Invalid/expired tokens
2. **MCP Server Errors**: Server initialization failures
3. **Tool Execution Errors**: Database or business logic errors
4. **Agent Errors**: Model inference failures
5. **Network Errors**: Connection issues

**Implementation Pattern**:
```python
# Main error handler
@app.exception_handler(Exception)
async def global_error_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal error",
            "type": type(exc).__name__,
            "message": str(exc) if settings.debug else "An error occurred"
        }
    )

# MCP tool error pattern
@mcp.tool()
def safe_operation(user_id: str, ...) -> dict:
    try:
        result = service.operation(user_id, ...)
        return {"success": True, "data": result}
    except ValidationError as e:
        return {"success": False, "error": "Invalid input", "details": str(e)}
    except PermissionError as e:
        return {"success": False, "error": "Access denied"}
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return {"success": False, "error": "Operation failed"}
```

**Alternatives Considered**:
- ❌ Basic error handling: Poor user experience
- ❌ Overly verbose errors: Security risk
- ✅ Structured, categorized errors: Secure and debuggable

---

## Summary of Key Findings

| Unknown | Resolution | Impact |
|---------|------------|--------|
| OpenAI SDK Integration | AsyncOpenAI + Xiaomi model | High - Core architecture |
| MCP Server Lifecycle | Per-request creation | High - Security & resources |
| User Isolation | Multi-layer JWT validation | Critical - Security requirement |
| Frontend Integration | HTTP + existing patterns | Medium - Implementation detail |
| Agent Coordination | Orchestrator handoff | High - User experience |
| Performance | <3s target with pooling | Medium - Scalability |
| Error Handling | Structured + graceful | High - Reliability |

**Next Steps**: Proceed to Phase 1 design with confidence that all technical unknowns are resolved.