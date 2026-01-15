# ChatKit for Claude

## When to Use This Skill
Use this skill when users ask about:
- **Backend Setup**: Creating ChatKit servers with FastAPI/Python
- **Store Implementation**: Memory or PostgreSQL stores for thread persistence
- **Frontend Integration**: React components and hooks
- **Authentication**: User context and multi-user isolation
- **Debugging**: Fixing ChatKit errors and issues

## How to Respond
1. **Identify Component**: Backend, frontend, or store?
2. **Check Framework**: FastAPI, Next.js, Vite?
3. **Check Store Type**: In-memory (dev) or PostgreSQL (prod)?
4. **Use Patterns**: Follow the exact patterns from concepts/ files

## Key Concepts

### Backend
- **ChatKitServer**: Base class to subclass with `respond()` method
- **ThreadItemConverter**: Convert stored items to agent input format
- **stream_agent_response**: Stream responses back to frontend
- **ID Collision Fix**: Required when using non-OpenAI providers (Gemini, etc.)
- **OpenAI Agents SDK**: Full integration with tools, guardrails, handoffs
- **Session Management**: Requires `/api/chatkit/session` and `/api/chatkit/refresh` endpoints
- **OpenAI Package**: `openai` package required for session creation (separate from `openai-chatkit`)
- **Context Injection**: Extract user/page metadata from frontend for personalized responses
- **httpOnly Cookie Auth**: Use cookies for secure authentication in production

### Store
- **14 Required Methods**: ALL must be implemented or abstract class error
- **User Isolation**: Extract `user.id` from context for multi-user
- **MemoryStore**: For development/testing
- **PostgreSQL Store**: For production with persistence

### Frontend
- **CDN Script Required**: Must add to HTML (body for Next.js 16+ App Router)
- **useChatKit Hook**: Core React integration
- **domainKey**: Required for local development (`'localhost'`)
- **Thread Persistence**: Use localStorage for thread IDs
- **Web Components**: ChatKit uses `customElements.get('openai-chatkit')`, not `window.ChatKit`
- **React Hooks**: Split components to avoid order violations when conditionally loading
- **Custom Fetch Interceptor**: Inject auth headers and metadata into every request
- **Page Context Extraction**: Send current page info to agent for context-aware responses
- **Text Selection "Ask"**: Allow users to select text and ask questions about it
- **Enhanced Script Loading**: Use `customElements.whenDefined()` for robust detection
- **httpOnly Cookie Proxy**: Next.js API route proxy for secure cookie authentication

### Tool Integration
- **Client Tools**: `onClientTool` for browser API access
- **Composer Tools**: UI buttons for interaction modes
- **Custom Actions**: Bidirectional server communication
- **OpenAI Agents SDK**: Agent tools work seamlessly with ChatKit

## Import Paths (Correct)
```python
# Backend
from chatkit.server import ChatKitServer, StreamingResult
from chatkit.store import Store  # SINGULAR, not 'stores'
from chatkit.types import ThreadMetadata, ThreadItem, Page
from chatkit.types import AssistantMessageItem, UserMessageItem
from chatkit.agents import AgentContext, stream_agent_response, ThreadItemConverter
```

```typescript
// Frontend
import { ChatKit, useChatKit } from '@openai/chatkit-react';
```

## Common Mistakes to Watch For
- Using `chatkit.stores` instead of `chatkit.store` (singular)
- Missing `domainKey: 'localhost'` in frontend config
- Forgetting to implement all 14 Store abstract methods
- Not passing user context for multi-user isolation
- Wrong middleware order in FastAPI (CORS must be first)
- Using `name` instead of `label` in prompts configuration
- **CDN in wrong location**: Next.js 16+ App Router needs Script in body, not head
- **Wrong detection method**: Using `window.ChatKit` instead of `customElements.get('openai-chatkit')`
- **React hooks violation**: Calling useChatKit after conditional return
- **Missing OpenAI package**: Forgetting `uv add openai` for session management
- **Missing session endpoints**: No `/api/chatkit/session` endpoint for frontend auth
- **Wrong authentication pattern**: Using old `domainKey` instead of `getClientSecret()` function
- **Missing context injection**: Agent doesn't receive user/page context for personalization
- **No custom fetch interceptor**: Missing metadata injection for production auth
- **httpOnly cookie issues**: Frontend can't read cookies, needs proxy pattern
- **Script loading race condition**: Rendering before ChatKit web components are defined
- **Text selection missing**: No "Ask about selected text" feature implementation
- **Context not in agent prompt**: Metadata sent but not used in agent instructions

## Framework-Specific Guidance

### FastAPI Backend
- Add CORS middleware FIRST
- Mount ChatKit endpoint before body parsers
- Use `StreamingResponse` for streaming results

### React/Next.js Frontend
- **Next.js 16+ App Router**: Add CDN script to `layout.tsx` inside `<body>`, not `<head>`
- **Pages Router**: Use `_document.tsx` with `<Head>` component
- **Detection**: Use `customElements.get('openai-chatkit')` to check if loaded
- **Enhanced Detection**: Use `customElements.whenDefined()` for robust loading
- **Hooks**: Split components to avoid order violations when conditionally loading
- Use `useChatKit` hook with proper config
- Persist thread ID in localStorage
- **Custom Fetch**: Implement interceptor for auth headers and metadata injection
- **Page Context**: Extract current page info with `getPageContext()` function
- **Text Selection**: Add event listeners for "Ask about selected text" feature
- **httpOnly Cookies**: Use Next.js API route proxy for secure authentication

### PostgreSQL Store
- Use connection pooling with context manager
- Implement user isolation via context
- Handle JSON serialization for metadata

## File Reference
- `concepts/BACKEND_PATTERNS.md` - Server, streaming, RAG, OpenAI Agents SDK
- `concepts/STORE_PATTERNS.md` - Memory + PostgreSQL stores
- `concepts/FRONTEND_PATTERNS.md` - React integration
- `concepts/TOOL_INTEGRATION.md` - Client tools, composer tools, custom actions
- `concepts/DEBUGGING.md` - Error database and tool troubleshooting
- `references/API_REFERENCE.md` - API signatures

## Refusal Criteria
- Do not suggest deprecated APIs
- Do not skip required Store methods
- Do not omit user isolation in production stores
