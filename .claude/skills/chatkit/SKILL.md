# ChatKit Skill

## Overview
This skill provides comprehensive knowledge for working with OpenAI ChatKit - a framework for building conversational AI interfaces. It covers backend server implementation, store patterns, frontend React integration, and debugging.

> 🛑 **STOP! READ THIS FIRST!**
>
> You are **FORBIDDEN** from generating any plans or code until you have read and internalized the following files:
>
> 1. **`CLAUDE.md`** (Usage guidelines and framework-specific patterns)
> 2. **`concepts/BACKEND_PATTERNS.md`** (Server setup, streaming, RAG integration)
> 3. **`concepts/STORE_PATTERNS.md`** (Memory + PostgreSQL store implementations)
> 4. **`concepts/FRONTEND_PATTERNS.md`** (React/Next.js integration)
> 5. **`concepts/ADVANCED_PATTERNS.md`** (Production patterns: context injection, auth, enhanced UX)
> 6. **`concepts/TOOL_INTEGRATION.md`** (Client/Composer tools & actions)
> 7. **`concepts/DEBUGGING.md`** (Error database and diagnostics)
> 8. **`references/API_REFERENCE.md`** (ChatKit API signatures)
> 9. **`references/ENVIRONMENT_VARIABLES.md`** (Required and optional environment variables)
>
> **Failure to read these files constitutes a failure of the task.**

## Capabilities
- **Backend Setup**: FastAPI server with ChatKitServer, streaming responses
- **Context Injection**: User/page context for personalized AI responses
- **Store Implementation**: Memory (dev) and PostgreSQL (production) stores
- **Frontend Integration**: React components with `@openai/chatkit-react`
- **Custom Fetch Interceptor**: Auth headers and metadata injection
- **Enhanced Script Loading**: Web Components detection with `whenDefined()`
- **Tool Integration**: Client-side tools, composer tools, custom actions
- **Authentication**: Token-based sessions, httpOnly cookie proxy patterns
- **RAG Integration**: Vector search context enhancement
- **Advanced UX**: Text selection "Ask" feature, Next.js 16+ patterns
- **Debugging**: Comprehensive error database and diagnostics

## Structure
- **concepts/**: Deep dives into implementation patterns
  - `BACKEND_PATTERNS.md`: Server setup, streaming, RAG, context injection
  - `STORE_PATTERNS.md`: Memory + PostgreSQL stores
  - `FRONTEND_PATTERNS.md`: React integration, custom fetch, script loading
  - `ADVANCED_PATTERNS.md`: Production patterns, httpOnly cookies, text selection
  - `TOOL_INTEGRATION.md`: Client tools, composer tools, custom actions
  - `DEBUGGING.md`: Error database and diagnostics
- **references/**: API documentation and environment variables
  - `API_REFERENCE.md`: Complete API signatures and examples
  - `ENVIRONMENT_VARIABLES.md`: Required and optional environment variables

## Common Usage
1. **Backend**: "Create a ChatKit backend with FastAPI and PostgreSQL"
2. **Frontend**: "Add ChatKit to my React/Next.js app"
3. **Context Injection**: "Inject user/page context for personalized responses"
4. **Authentication**: "Set up httpOnly cookie proxy for secure auth"
5. **Enhanced UX**: "Add text selection Ask feature to ChatKit"
6. **Tools**: "Add client-side tools for email, modals, and browser APIs"
7. **Store**: "Implement a PostgreSQL store for ChatKit with user isolation"
8. **Debug**: "Why isn't my ChatKit conversation history working?"

## Technology Stack
- **Backend**: Python, FastAPI, OpenAI Agents SDK, `openai` package (for sessions)
- **Store**: PostgreSQL (Neon/Supabase) or in-memory
- **Frontend**: React, TypeScript, `@openai/chatkit-react`
- **AI**: OpenAI, Gemini, or other providers
- **Authentication**: Token-based with `client_secret` from session endpoints

## Critical Requirements
- **OpenAI API Key**: Required for session management (`OPENAI_API_KEY`)
- **Session Endpoints**: `/api/chatkit/session` and `/api/chatkit/refresh` required
- **OpenAI Package**: `uv add openai` for session creation
- **Frontend Auth**: Uses `getClientSecret()` function, not `domainKey`
- **CDN Script**: Must add ChatKit.js to HTML for web components
- **Domain Allowlist**: Register domains in OpenAI Platform dashboard
- **Context Injection**: Backend must extract metadata from frontend requests
