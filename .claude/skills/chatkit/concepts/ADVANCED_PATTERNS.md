# ChatKit Advanced Patterns

This document covers advanced patterns derived from production ChatKit implementations, focusing on context injection, authentication, and enhanced user experiences.

## Context Injection & Personalization

### Frontend: Context Extraction & Injection

#### 1. Page Context Extraction
Extract current page information to provide to the AI agent:

```typescript
const getPageContext = useCallback(() => {
  if (typeof window === 'undefined') return null;

  const metaDescription = document.querySelector('meta[name="description"]')
    ?.getAttribute('content') || '';

  const mainContent = document.querySelector('article') ||
                     document.querySelector('main') ||
                     document.body;

  const headings = Array.from(mainContent.querySelectorAll('h1, h2, h3'))
    .slice(0, 5)
    .map(h => h.textContent?.trim())
    .filter(Boolean)
    .join(', ');

  return {
    url: window.location.href,
    title: document.title,
    path: window.location.pathname,
    description: metaDescription,
    headings: headings,
  };
}, []);
```

#### 2. Custom Fetch Interceptor
Inject authentication and context into every ChatKit request:

```typescript
const { control } = useChatKit({
  api: {
    url: `${backendUrl}/chatkit`,
    domainKey: domainKey,

    // Custom fetch to inject auth and context
    fetch: async (url: string, options: RequestInit) => {
      if (!isLoggedIn) {
        throw new Error('User must be logged in');
      }

      const pageContext = getPageContext();
      const userInfo = { id: userId, name: user.name };

      // Inject metadata into request body
      let modifiedOptions = { ...options };
      if (modifiedOptions.body && typeof modifiedOptions.body === 'string') {
        const parsed = JSON.parse(modifiedOptions.body);
        if (parsed.params?.input) {
          parsed.params.input.metadata = {
            userId, userInfo, pageContext,
            ...parsed.params.input.metadata,
          };
          modifiedOptions.body = JSON.stringify(parsed);
        }
      }

      return fetch(url, {
        ...modifiedOptions,
        headers: {
          ...modifiedOptions.headers,
          'X-User-ID': userId,
          'Content-Type': 'application/json',
        },
      });
    },
  },
});
```

### Backend: Context-Aware Agent

#### 1. Extract Context in respond()
```python
async def respond(self, thread, input, context):
    # Extract metadata from frontend
    metadata = context.get('metadata', {})
    user_info = metadata.get('userInfo', {})
    page_context = metadata.get('pageContext', {})

    # Build personalized instructions
    personalized_instructions = f"""
    You are a helpful assistant.

    ## User Context
    - Name: {user_info.get('name', 'Unknown')}
    - User ID: {user_info.get('id', 'Unknown')}

    ## Page Context
    - Current Page: {page_context.get('title', 'Unknown')}
    - URL: {page_context.get('url', 'Unknown')}
    - Description: {page_context.get('description', 'N/A')}
    - Key Topics: {page_context.get('headings', 'N/A')}

    ## Instructions
    Be helpful and reference the user's context and current page when relevant.
    """

    agent = Agent(
        name="Assistant",
        instructions=personalized_instructions,
        model=self.model
    )

    # ... continue with agent execution
```

## httpOnly Cookie Authentication

### Problem
httpOnly cookies cannot be read by JavaScript, making them secure against XSS attacks but requiring special handling for ChatKit.

### Solution: Next.js API Route Proxy

#### Backend: Session Endpoints with Cookie Auth
```python
@app.post("/api/chatkit/session")
async def create_session_with_cookie(request: Request):
    """Create ChatKit session using httpOnly cookie authentication."""
    auth_cookie = request.cookies.get("auth_token")

    if not auth_cookie:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Verify JWT and create session
    payload = verify_jwt_token(auth_cookie)
    user_id = payload.get("sub")

    openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    session = openai.chatkit.sessions.create({
        "model": "gpt-4o",
        "metadata": {"user_id": user_id, "auth_source": "httpOnly_cookie"}
    })

    return {
        "client_secret": session.client_secret,
        "session_id": session.id,
        "user_id": user_id
    }
```

#### Frontend: Next.js API Route Proxy
```typescript
// app/api/chatkit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const idToken = cookieStore.get("auth_token")?.value;

  if (!idToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const response = await fetch(`${API_BASE}/chatkit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
      "X-User-ID": request.headers.get("X-User-ID") || "",
    },
    body: await request.text(),
  });

  // Handle SSE streaming
  if (response.headers.get("content-type")?.includes("text/event-stream")) {
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  }

  return NextResponse.json(await response.json(), { status: response.status });
}
```

#### Frontend: Usage with Proxy
```typescript
const { control } = useChatKit({
  api: {
    url: "/api/chatkit", // Proxy handles auth
    domainKey: domainKey,

    fetch: async (input, options) => {
      const userId = user.sub;
      const pageContext = getPageContext();

      let modifiedOptions = { ...options };
      if (modifiedOptions.body && typeof modifiedOptions.body === 'string') {
        const parsed = JSON.parse(modifiedOptions.body);
        if (parsed.params?.input) {
          parsed.params.input.metadata = {
            ...parsed.params.input.metadata,
            userId,
            userInfo: { id: userId, name: user.name },
            pageContext,
          };
          modifiedOptions.body = JSON.stringify(parsed);
        }
      }

      return fetch(input, {
        ...modifiedOptions,
        credentials: 'include', // Include cookies
        headers: {
          ...modifiedOptions.headers,
          'X-User-ID': userId,
          'Content-Type': 'application/json',
        },
      });
    },
  },
});
```

## Text Selection "Ask" Feature

### Problem
Users want to ask questions about specific text they've selected on the page.

### Solution: Selection Detection + Ask Button

```typescript
const [selectedText, setSelectedText] = useState('');
const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });

useEffect(() => {
  const handleSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setSelectedText('');
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length > 0) {
      setSelectedText(selectedText);

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    }
  };

  document.addEventListener('selectionchange', handleSelection);
  document.addEventListener('mouseup', handleSelection);

  return () => {
    document.removeEventListener('selectionchange', handleSelection);
    document.removeEventListener('mouseup', handleSelection);
  };
}, []);

const handleAskSelectedText = useCallback(async () => {
  const pageContext = getPageContext();
  const messageText = `Can you explain this from "${pageContext.title}":\n\n"${selectedText}"`;

  if (!isOpen) {
    setIsOpen(true);
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  await sendUserMessage({
    text: messageText,
    newThread: false,
  });

  window.getSelection()?.removeAllRanges();
  setSelectedText('');
}, [selectedText, isOpen, sendUserMessage, getPageContext]);

// In component:
{selectedText && (
  <button
    onClick={handleAskSelectedText}
    style={{
      position: 'fixed',
      left: `${selectionPosition.x}px`,
      top: `${selectionPosition.y}px`,
      transform: 'translate(-50%, -100%)',
      zIndex: 1000,
    }}
  >
    Ask about this
  </button>
)}
```

## Enhanced Script Loading Detection

### Problem
Race conditions where React components try to render before ChatKit web components are defined.

### Solution: Robust Loading Detection

```typescript
const [scriptStatus, setScriptStatus] = useState<'pending' | 'ready' | 'error'>(
  typeof window !== 'undefined' && window.customElements?.get('openai-chatkit')
    ? 'ready'
    : 'pending'
);

useEffect(() => {
  if (typeof window === 'undefined' || scriptStatus !== 'pending') return;

  if (window.customElements?.get('openai-chatkit')) {
    setScriptStatus('ready');
    return;
  }

  customElements.whenDefined('openai-chatkit').then(() => {
    setScriptStatus('ready');
  }).catch(() => {
    setScriptStatus('error');
  });
}, []);

// Conditional rendering
{scriptStatus === 'ready' && <ChatKit control={control} />}
{scriptStatus === 'error' && <div>ChatKit failed to load</div>}
{scriptStatus === 'pending' && <div>Loading ChatKit...</div>}
```

## Production Deployment Checklist

### Security
- [ ] Use httpOnly cookies for authentication
- [ ] Implement JWT verification in session endpoints
- [ ] Add rate limiting to session creation
- [ ] Use HTTPS in production
- [ ] Register all domains in OpenAI allowlist

### Performance
- [ ] Pre-warm database connections on startup
- [ ] Use connection pooling for PostgreSQL
- [ ] Implement proper CORS origins (not "*")
- [ ] Add request timeouts

### User Experience
- [ ] Implement context injection for personalization
- [ ] Add text selection "Ask" feature
- [ ] Use enhanced script loading detection
- [ ] Persist thread IDs in localStorage
- [ ] Handle loading and error states gracefully

### Monitoring
- [ ] Log session creation failures
- [ ] Track context injection success rate
- [ ] Monitor script loading times
- [ ] Alert on authentication failures

## Common Pitfalls & Solutions

| Issue | Symptom | Root Cause | Solution |
|-------|---------|------------|----------|
| **Context not used** | Agent ignores user/page info | Metadata sent but not in prompt | Add context to agent instructions |
| **Cookie auth fails** | 401 errors despite valid token | Frontend can't read httpOnly cookies | Use Next.js proxy pattern |
| **Script loading timeout** | "ChatKit not defined" | Race condition | Use `whenDefined()` detection |
| **Selection not working** | No ask button appears | Event listeners not attached | Add both `selectionchange` and `mouseup` |
| **Metadata not parsed** | Agent missing context | JSON parsing error in fetch interceptor | Add try/catch and validation |

## Evidence & References

These patterns are derived from production implementations:
- `rag-agent/chatkit_server.py` - Context injection in agent prompts
- `robolearn-interface/src/components/ChatKitWidget/` - Text selection feature
- `web-dashboard/src/app/api/chatkit/route.ts` - httpOnly cookie proxy
- `web-dashboard/src/components/chat/ChatKitWidget.tsx` - Enhanced detection

## Integration with Other Skills

### Better Auth Integration
When using Better Auth with httpOnly cookies:
```typescript
// Session endpoint uses Better Auth session
@app.post("/api/chatkit/session")
async def create_session(request: Request):
    # Better Auth automatically sets httpOnly cookies
    auth_session = await get_session(request)
    user_id = auth_session.user.id

    # Create ChatKit session with user context
    # ...
```

### Neon DB Integration
For production stores with user isolation:
```python
# In store implementation
async def load_thread_items(self, thread_id, after, limit, order, context):
    user_id = context.get('user', {}).get('id')

    # Query with user isolation
    query = """
        SELECT * FROM chatkit_items
        WHERE thread_id = %s AND user_id = %s
        ORDER BY created_at DESC LIMIT %s
    """
    # ...
```

These patterns complete the ChatKit skill for production-ready implementations.