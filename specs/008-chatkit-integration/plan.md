# Implementation Plan: ChatKit Integration with OpenAI Agents SDK & MCP Tools

**Branch**: `008-chatkit-integration` | **Date**: 2026-01-16 | **Spec**: [specs/008-chatkit-integration/spec.md](specs/008-chatkit-integration/spec.md)
**Input**: Feature specification from `/specs/008-chatkit-integration/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Integrate OpenAI ChatKit into the existing phase-3 application that currently has a working dual-agent system (Orchestrator + UrduSpecialist) with MCP tool integration. Replace the custom frontend chat interface with ChatKit's production-ready UI while preserving all existing OpenAI Agents SDK functionality, MCP tools, and authentication. This will provide a more robust, feature-rich chat experience with built-in features like thread persistence, tool call visualization, and enhanced UX patterns.

## Technical Context

**Language/Version**: Python 3.12, TypeScript 5.x, Next.js 16.1.1
**Primary Dependencies**:
- Backend: FastAPI, openai-agents 0.6.5+, mcp 1.25.0+, openai-chatkit, openai
- Frontend: @openai/chatkit-react, Next.js 16.1.1, Better Auth 1.4.9
- MCP: Existing task management tools (create_task, list_tasks, etc.)

**Storage**: PostgreSQL (Neon) for both app data and ChatKit thread persistence
**Testing**: pytest (backend), Jest/React Testing Library (frontend)
**Target Platform**: Linux server + Web (Next.js 16 App Router)
**Project Type**: Web application (backend + frontend)
**Performance Goals**: <200ms p95 for agent responses, streaming support for ChatKit
**Constraints**: Maintain existing authentication, preserve all MCP tools, zero breaking changes
**Scale/Scope**: Single-tenant, ~1000 users, 50+ tasks per user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Passes Constitution Requirements
- **Simplicity**: ChatKit replaces custom UI (reduces frontend complexity)
- **Single Source of Truth**: PostgreSQL remains the primary database
- **No Over-engineering**: Uses existing OpenAI infrastructure (session management)
- **Smallest Viable Change**: Backend changes are additive only
- **Testable**: Each integration point has clear acceptance criteria

### 📋 Architectural Decision Records Needed
- **ChatKit vs Custom UI**: Tradeoffs between using OpenAI's hosted UI vs building custom
- **Session Management**: Token-based authentication flow for ChatKit
- **Context Injection**: How to pass user/page context to ChatKit agent

## Project Structure

### Documentation (this feature)

```text
specs/008-chatkit-integration/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - ChatKit API research and compatibility analysis
├── data-model.md        # Phase 1 output - Thread storage schema extensions
├── quickstart.md        # Phase 1 output - Setup guide for developers
├── contracts/           # Phase 1 output - API contract changes (session endpoints)
│   └── session-api.md  # Session creation and refresh endpoints
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Web application in phase-3 folder (current structure maintained) i

phase-3/backend/
├── src/
│   ├── backend/
│   │   ├── main.py                    # + ChatKit session endpoints
│   │   ├── agents.py                  # + ChatKit-compatible agent wrapper
│   │   ├── chatkit_server.py          # NEW: ChatKitServer implementation
│   │   ├── chatkit_store.py           # NEW: PostgreSQL store for ChatKit
│   │   └── [existing files...]
│   └── [existing structure...]
├── task_serves_mcp_tools.py           # No changes needed
└── [existing files...]

phase-3/frontend/
├── src/
│   ├── app/
│   │   ├── chatbot/
│   │   │   └── page.tsx               # REPLACED: Will use ChatKit component
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts           # MODIFIED: Proxy for ChatKit backend
│   │   │   └── chatkit/
│   │   │       ├── session/route.ts   # NEW: Session creation endpoint
│   │   │       └── refresh/route.ts   # NEW: Token refresh endpoint
│   │   └── [existing files...]
│   ├── components/
│   │   ├── chat/
│   │   │   └── ChatKitWidget.tsx      # NEW: ChatKit integration component
│   │   └── [existing components...]
│   └── [existing structure...]
├── public/
│   └── [ChatKit CDN script will be added via next/script]
└── [existing files...]
```

**Structure Decision**: Maintain existing structure with additive changes only. ChatKit replaces the custom chat UI while preserving all backend agent logic and MCP tool integration.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A - No violations | ChatKit integration is additive and simplifies frontend | N/A |

## Phase 0: Research & Compatibility Analysis

### ChatKit Requirements Analysis

#### ✅ **Backend Compatibility**
- **OpenAI API Key**: ✅ **CRITICAL**: Required for session management (even when using other providers like Gemini/Anthropic)
- **Session Endpoints**: ✅ Need to add `/api/chatkit/session` and `/api/chatkit/refresh`
- **OpenAI Python Package**: ✅ Need to add `openai` package (separate from `openai-agents`)
- **ChatKit Server**: ✅ Need to implement `ChatKitServer` subclass

#### ✅ **Frontend Compatibility**
- **CDN Script**: ✅ **CRITICAL**: Must be added to HTML body (not head) for Next.js 16+ App Router
- **React Package**: ✅ Need to add `@openai/chatkit-react`
- **Token Authentication**: ✅ Replace domainKey with `getClientSecret()` function
- **Thread Persistence**: ✅ localStorage-based conversation history with thread ID management
- **Domain Allowlist**: ✅ Need to register domains in OpenAI Platform

#### ✅ **Existing Feature Preservation**
- **MCP Tools**: ✅ ChatKit can call existing MCP tools via OpenAI Agents SDK
- **Dual Agents**: ✅ Orchestrator + UrduSpecialist can be wrapped in ChatKitServer
- **User Isolation**: ✅ JWT-based user context can be passed to ChatKit
- **Better Auth**: ✅ Integration via httpOnly cookie proxy pattern

### Key Integration Points

1. **Session Management**: **CRITICAL**: OpenAI API key required (even when using other providers for chat)
2. **Store Implementation**: PostgreSQL store for thread persistence (reuse existing DB)
3. **Agent Integration**: Wrap existing agents in ChatKitServer.respond()
4. **Frontend Replacement**: ChatKit UI replaces custom chat interface
5. **Context Injection**: User/page context passed via custom fetch interceptor
6. **CDN Script Loading**: Must be added to HTML body with enhanced detection
7. **Thread Persistence**: localStorage-based conversation history with thread ID management

## Phase 1: Design & Architecture

### Data Model Extensions

#### New Tables for ChatKit
```sql
-- ChatKit threads table (extends existing conversation concept)
CREATE TABLE chatkit_thread (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- ChatKit thread items (messages, tool calls, etc.)
CREATE TABLE chatkit_thread_item (
    id VARCHAR(255) PRIMARY KEY,
    "threadId" VARCHAR(255) REFERENCES chatkit_thread(id) ON DELETE CASCADE,
    type VARCHAR(50),  -- 'user_message', 'assistant_message', 'tool_call'
    content JSONB,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_chatkit_thread_user ON chatkit_thread("userId");
CREATE INDEX idx_chatkit_thread_updated ON chatkit_thread("updatedAt");
CREATE INDEX idx_chatkit_item_thread ON chatkit_thread_item("threadId");
```

### API Contract Changes

#### New Backend Endpoints

**1. Session Creation** (`POST /api/chatkit/session`)
```python
# Request: None (uses JWT from cookies)
# Response:
{
    "client_secret": "sk-chatkit-...",
    "session_id": "session_123"
}
```

**2. Session Refresh** (`POST /api/chatkit/refresh`)
```python
# Request: { "current_token": "old-token" }
# Response:
{
    "client_secret": "sk-chatkit-...",
    "session_id": "session_456"
}
```

**3. ChatKit Proxy** (Modified existing `POST /api/chat`)
- Add support for ChatKit protocol format
- Maintain backward compatibility with current frontend
- Add context injection for user/page metadata

### Frontend Integration Pattern

#### ChatKit Configuration
```typescript
// New ChatKitWidget component
const { control } = useChatKit({
  api: {
    url: '/api/chatkit',  // Proxy to backend
    getClientSecret: async () => {
      const res = await fetch('/api/chatkit/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'  // For httpOnly cookies
      });
      const { client_secret } = await res.json();
      return client_secret;
    },
    fetch: async (url, options) => {
      // Inject user context and page metadata
      const userId = user.id;
      const pageContext = getPageContext();

      let modifiedOptions = { ...options };
      if (modifiedOptions.body && typeof modifiedOptions.body === 'string') {
        const parsed = JSON.parse(modifiedOptions.body);
        if (parsed.params?.input) {
          parsed.params.input.metadata = {
            userId,
            userInfo: { id: userId, name: user.name },
            pageContext,
            ...parsed.params.input.metadata,
          };
          modifiedOptions.body = JSON.stringify(parsed);
        }
      }

      return fetch(url, {
        ...modifiedOptions,
        credentials: 'include',
        headers: {
          ...modifiedOptions.headers,
          'Content-Type': 'application/json',
        },
      });
    },
  },
  theme: {
    colorScheme: 'light',
    color: {
      accent: { primary: '#FF6B4A', level: 1 },
    },
  },
  startScreen: {
    greeting: `Hello ${user.name}! How can I help you with your tasks?`,
    prompts: [
      { label: 'Create a task', prompt: 'Create a task for tomorrow' },
      { label: 'Show my tasks', prompt: 'Show me my pending tasks' },
      { label: 'Urdu help', prompt: 'میرے ٹاسک دکھاؤ' },
    ],
  },
  composer: {
    placeholder: 'Ask me to create, list, or update tasks...',
  },
  onClientTool: async ({ name, params }) => {
    // Handle client-side tools if needed
    switch (name) {
      case 'show_notification':
        // Show browser notification
        return { success: true };
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  },
});
```

### Backend Architecture

#### ChatKitServer Implementation
```python
# New file: backend/chatkit_server.py
from chatkit.server import ChatKitServer
from chatkit.types import ThreadMetadata, ThreadItem
from chatkit.agents import AgentContext, stream_agent_response, ThreadItemConverter
from agents import Runner, RunConfig
from agents.mcp import MCPServerStdio
import os

class TodoChatKitServer(ChatKitServer):
    def __init__(self, store, model, client):
        super().__init__(store)
        self.store = store
        self.model = model
        self.client = client
        self.converter = ThreadItemConverter()

    async def respond(self, thread, input, context):
        # Extract user context from metadata
        metadata = context.get('metadata', {})
        user_info = metadata.get('userInfo', {})
        user_id = user_info.get('id')

        if not user_id:
            raise ValueError("User ID required for data isolation")

        # Create agent instances (same as current main.py)
        from backend.agents import orchestrator as base_orchestrator, urdu_agent as base_urdu_agent

        urdu_agent = Agent(
            name=base_urdu_agent.name,
            instructions=base_urdu_agent.instructions,
            model=self.model
        )

        orchestrator = Agent(
            name=base_orchestrator.name,
            instructions=base_orchestrator.instructions,
            handoffs=[urdu_agent],
            model=self.model
        )

        # Load conversation history
        page = await self.store.load_thread_items(thread.id, None, 100, "asc", context)
        all_items = list(page.data)
        if input:
            all_items.append(input)

        # Convert to agent input format
        agent_input = await self.converter.to_agent_input(all_items) if all_items else []

        # Enhance input with user context
        enhanced_input = f"[User: {user_id}] {input.content[0].text if hasattr(input, 'content') and input.content else str(input)}"

        # Configure MCP server (same as current implementation)
        config = RunConfig(
            model=self.model,
            model_provider=self.client,
        )

        server = MCPServerStdio(
            params={
                "command": "uv",
                "args": ["run", "task_serves_mcp_tools.py"]
            },
            client_session_timeout_seconds=60
        )

        orchestrator.mcp_servers = [server]
        urdu_agent.mcp_servers = [server]

        try:
            await server.connect()

            result = await Runner.run(
                orchestrator,
                enhanced_input,
                run_config=config
            )

            # Stream response via ChatKit events
            response_text = result.final_output
            agent_name = result.last_agent.name if result.last_agent else "Unknown"

            # Extract tool calls
            tool_calls = []
            for call in getattr(result, 'used_tools', []):
                tool_calls.append({
                    "tool_name": call.name,
                    "arguments": getattr(call, 'arguments', {}),
                    "result": getattr(call, 'result', {}),
                })

            # Yield events for ChatKit streaming
            from chatkit.types import AssistantMessageItem, ThreadItemAddedEvent, ThreadItemDoneEvent

            assistant_item = AssistantMessageItem(
                id=self.store.generate_item_id("message", thread, context),
                thread_id=thread.id,
                created_at=datetime.now(timezone.utc),
                content=[{"type": "text", "text": response_text}]
            )

            yield ThreadItemAddedEvent(
                type="thread.item.added",
                item=assistant_item
            )

            yield ThreadItemDoneEvent(
                type="thread.item.done",
                item=assistant_item
            )

        finally:
            await server.cleanup()
            orchestrator.mcp_servers = []
            urdu_agent.mcp_servers = []
```

#### Store Implementation
```python
# New file: backend/chatkit_store.py
from chatkit.store import Store
from chatkit.types import ThreadMetadata, ThreadItem, Page
from chatkit.types import AssistantMessageItem, UserMessageItem
from backend.database import async_session_factory
from backend.models.task import Task  # Reuse existing models
import json
from datetime import datetime, timezone
import uuid

class PostgresChatKitStore(Store[dict]):
    """PostgreSQL store for ChatKit threads with user isolation"""

    def __init__(self):
        # Reuse existing database connection
        pass

    def _get_user_id_from_context(self, context: dict) -> str:
        """Extract user ID for data isolation"""
        user = context.get('metadata', {}).get('userInfo', {})
        user_id = user.get('id')
        if not user_id:
            raise ValueError("User ID required for data isolation")
        return user_id

    # Implement all 14 required methods...
    # (Detailed implementation in separate file)
```

### Security & Authentication

#### Authentication Flow
1. **User logs in** via Better Auth → JWT token stored in httpOnly cookie
2. **Frontend calls** `/api/chatkit/session` → Backend verifies JWT
3. **Backend creates** OpenAI ChatKit session → Returns `client_secret`
4. **Frontend initializes** ChatKit with `client_secret`
5. **All requests** include context via custom fetch interceptor

#### Domain Allowlist Requirements
- **Development**: `localhost:3000`
- **Production**: `yourapp.com`, `www.yourapp.com`
- **Registration**: OpenAI Platform Dashboard → Security → Domain Allowlist

## Phase 2: Implementation Tasks

### Backend Tasks

#### 2.1 Add Required Dependencies
```bash
# Add to pyproject.toml
uv add openai-chatkit openai
uv add openai-agents  # Already present
```

#### 2.1.1 Verify OpenAI API Key Setup
- [ ] **CRITICAL**: Verify `OPENAI_API_KEY` environment variable exists
- [ ] Test API key has ChatKit permissions in OpenAI Platform
- [ ] Add setup validation with clear error messages if key missing
- [ ] Document that key is required even when using Gemini/Anthropic for chat

#### 2.2 Implement ChatKit Store
- [ ] Create `backend/chatkit_store.py` with all 14 methods
- [ ] Implement user isolation in all queries
- [ ] Add JSON serialization for thread metadata
- [ ] Test with existing PostgreSQL database

#### 2.3 Implement ChatKit Server
- [ ] Create `backend/chatkit_server.py` extending `ChatKitServer`
- [ ] Integrate existing OpenAI Agents SDK logic
- [ ] Preserve MCP tool integration
- [ ] Add streaming support via events

#### 2.4 Add Session Endpoints
- [ ] Create `/api/chatkit/session` endpoint
- [ ] Create `/api/chatkit/refresh` endpoint
- [ ] Add JWT verification from httpOnly cookies
- [ ] Integrate with existing auth middleware

#### 2.5 Update Main Application
- [ ] Initialize ChatKit store in `main.py`
- [ ] Add ChatKit server instance
- [ ] Maintain backward compatibility with existing `/api/chat` endpoint

### Frontend Tasks

#### 2.6 Add Dependencies
```bash
npm install @openai/chatkit-react
```

#### 2.7 Add ChatKit CDN Script
- [ ] **CRITICAL**: Add ChatKit.js to HTML body (not head) for Next.js 16+ App Router
- [ ] Update `app/layout.tsx` to include ChatKit.js script in body
- [ ] Use Next.js Script component with `afterInteractive` strategy
- [ ] **CRITICAL**: Implement enhanced script loading detection using `customElements.whenDefined()`
- [ ] Add fallback detection for race conditions

#### 2.8 Create ChatKit Widget Component
- [ ] Create `components/chat/ChatKitWidget.tsx`
- [ ] Implement `useChatKit` hook with proper configuration
- [ ] Add custom fetch interceptor for context injection
- [ ] Implement `getClientSecret()` function
- [ ] Add localStorage-based thread persistence for conversation continuity

#### 2.9 Add API Routes
- [ ] Create `app/api/chatkit/session/route.ts`
- [ ] Create `app/api/chatkit/refresh/route.ts`
- [ ] Update existing `app/api/chat/route.ts` for compatibility

#### 2.10 Replace Chat Page
- [ ] Replace `app/chatbot/page.tsx` with ChatKit component
- [ ] Preserve existing styling and layout patterns
- [ ] Add enhanced features (text selection, etc.)

### Integration & Testing Tasks

#### 2.11 Integration Testing
- [ ] Test session creation flow
- [ ] Test MCP tool calls via ChatKit
- [ ] Test user isolation (different users see different threads)
- [ ] Test context injection (user/page metadata)
- [ ] Test error handling and recovery

#### 2.12 Security Testing
- [ ] Verify JWT validation in session endpoints
- [ ] Test CORS configuration
- [ ] Verify user isolation in store queries
- [ ] Test httpOnly cookie handling

#### 2.13 Performance Testing
- [ ] Test streaming performance
- [ ] Verify database query optimization
- [ ] Test concurrent user sessions
- [ ] Monitor memory usage with MCP servers

## Phase 3: Testing & Validation

### Backend Tests
```python
# Test session endpoints
def test_session_creation(client, auth_token):
    response = client.post("/api/chatkit/session", cookies={"auth_token": auth_token})
    assert response.status_code == 200
    assert "client_secret" in response.json()

# Test ChatKit store
@pytest.mark.asyncio
async def test_chatkit_store_user_isolation():
    # Verify users can't access each other's threads
    pass

# Test agent integration
@pytest.mark.asyncio
async def test_chatkit_with_mcp_tools():
    # Verify MCP tools work via ChatKit
    pass
```

### Frontend Tests
```typescript
// Test ChatKit initialization
test('ChatKit loads with correct configuration', async () => {
  const { result } = renderHook(() => useChatKit(mockConfig));
  await waitFor(() => expect(result.current.control).toBeDefined());
});

// Test session endpoint integration
test('session endpoint returns client_secret', async () => {
  const response = await fetch('/api/chatkit/session', {
    method: 'POST',
    credentials: 'include'
  });
  const data = await response.json();
  expect(data.client_secret).toBeDefined();
});
```

### Acceptance Criteria

#### ✅ Backend Acceptance Criteria
- [ ] **CRITICAL**: `OPENAI_API_KEY` environment variable is set and validated
- [ ] `/api/chatkit/session` returns valid `client_secret`
- [ ] `/api/chatkit/refresh` handles token refresh correctly
- [ ] ChatKitStore implements all 14 required methods
- [ ] User isolation works (different users can't see each other's threads)
- [ ] MCP tools work via ChatKit integration
- [ ] Existing agents (Orchestrator + UrduSpecialist) work unchanged
- [ ] Streaming responses work correctly
- [ ] Error handling is robust

#### ✅ Frontend Acceptance Criteria
- [ ] **CRITICAL**: ChatKit CDN script loads in HTML body (not head) for Next.js 16+
- [ ] **CRITICAL**: Enhanced script loading detection works using `customElements.whenDefined()`
- [ ] ChatKit UI loads and displays correctly
- [ ] Session creation works with httpOnly cookies
- [ ] Custom fetch interceptor injects context correctly
- [ ] **CRITICAL**: Thread persistence via localStorage works (survives page refresh)
- [ ] Thread IDs are properly managed and stored in localStorage
- [ ] Tool calls are displayed properly in UI
- [ ] Error states are handled gracefully
- [ ] Mobile responsiveness maintained
- [ ] Existing auth flow still works

#### ✅ Integration Acceptance Criteria
- [ ] Complete user flow: Login → ChatKit → MCP Tools → Logout
- [ ] Context injection: User info and page context reach agent
- [ ] Multi-user isolation: Users see only their own threads
- [ ] Backward compatibility: Existing frontend still works (optional)
- [ ] Performance: <200ms p95 for agent responses
- [ ] Security: No JWT leakage, proper CORS, user isolation

## Risk Analysis & Mitigation

### Top 3 Risks

#### 1. **OpenAI API Key Requirements**
- **Risk**: ChatKit requires `OPENAI_API_KEY` for session management (even when using other providers)
- **Blast Radius**: High - blocks entire integration
- **Mitigation**:
  - **CRITICAL**: Verify key exists before starting integration
  - Test key has ChatKit permissions in OpenAI Platform
  - Add setup validation with clear error messages
  - Document that key is required regardless of chat model provider
- **Kill Switch**: Fall back to custom frontend if session creation fails

#### 2. **MCP Tool Compatibility**
- **Risk**: ChatKit may not handle MCP tools correctly
- **Blast Radius**: High - breaks existing functionality
- **Mitigation**:
  - Test MCP tools extensively before full integration
  - Keep existing `/api/chat` endpoint as fallback
  - Implement proper error handling for tool failures
- **Kill Switch**: Revert to direct agent execution if ChatKit fails

#### 3. **CDN Script Loading Issues**
- **Risk**: ChatKit CDN script may not load properly in Next.js 16+ App Router
- **Blast Radius**: High - breaks entire frontend integration
- **Mitigation**:
  - **CRITICAL**: Add script to HTML body (not head) for Next.js 16+
  - Implement enhanced detection using `customElements.whenDefined()`
  - Add fallback detection for race conditions
  - Test script loading in development and production
- **Kill Switch**: Manual script injection if Next.js Script component fails

#### 4. **Thread Persistence Issues**
- **Risk**: localStorage-based thread persistence may fail or lose data
- **Blast Radius**: Medium - users lose conversation history
- **Mitigation**:
  - **CRITICAL**: Implement robust localStorage error handling
  - Add thread ID management and validation
  - Test persistence across page refreshes and browser sessions
  - Add fallback to server-side storage if localStorage fails
- **Kill Switch**: Disable localStorage persistence if critical errors occur

#### 5. **Context Injection Complexity**
- **Risk**: User/page context may not reach agent properly
- **Blast Radius**: Medium - reduces personalization
- **Mitigation**:
  - Test context injection in isolation
  - Add comprehensive logging
  - Validate metadata reaches agent instructions
- **Kill Switch**: Simplify to user-only context if page context fails

## Evaluation & Validation

### Definition of Done

#### Code Quality
- [ ] All ChatKit imports use correct paths (`chatkit.store` not `chatkit.stores`)
- [ ] Store implements ALL 14 required methods
- [ ] No breaking changes to existing APIs
- [ ] TypeScript types are properly defined
- [ ] Python code follows existing patterns

#### Testing
- [ ] Unit tests for new store methods
- [ ] Integration tests for session endpoints
- [ ] End-to-end tests for complete user flow
- [ ] Security tests for user isolation
- [ ] Performance tests for streaming

#### Documentation
- [ ] Setup guide in `specs/008-chatkit-integration/quickstart.md`
- [ ] API documentation for new endpoints
- [ ] Environment variable requirements documented
- [ ] Domain allowlist setup instructions
- [ ] Troubleshooting guide for common issues

#### Deployment
- [ ] **CRITICAL**: OPENAI_API_KEY environment variable configured and validated
- [ ] Domain allowlist updated in OpenAI Platform (localhost + production domains)
- [ ] Database migrations run for new tables
- [ ] CDN script loading tested in production build
- [ ] Production deployment tested
- [ ] Monitoring and logging configured

### Success Metrics
- **User Experience**: ChatKit UI loads in <2s, messages stream smoothly
- **Functionality**: All MCP tools work via ChatKit, user isolation maintained
- **Performance**: <200ms p95 for agent responses, <50MB memory per session
- **Reliability**: 99% success rate for session creation, <1% error rate
- **Security**: Zero JWT leaks, proper user isolation verified

## Next Steps

1. **Immediate**: Run `/sp.tasks` to generate detailed implementation tasks
2. **Setup**: Add required dependencies to backend and frontend
3. **Backend**: Implement ChatKitStore and ChatKitServer
4. **Frontend**: Add ChatKit CDN and create integration component
5. **Testing**: Comprehensive testing of all integration points
6. **Deployment**: Update production environment and deploy

---

**Generated**: 2026-01-16
**Model**: Claude Sonnet 4.5
**Integration Type**: ChatKit + OpenAI Agents SDK + MCP Tools
**Status**: Ready for implementation
