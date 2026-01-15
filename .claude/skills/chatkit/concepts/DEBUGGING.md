# ChatKit Debugging Guide

## Quick Diagnostic Checklist

### Backend Health Check
```bash
# 1. Check server starts
python -m uvicorn backend.main:app --reload

# 2. Test health endpoint
curl http://localhost:8000/

# 3. Check for import errors in logs
```

### Frontend Health Check
```bash
# 1. Check dev server starts
npm run start  # or npm run dev

# 2. Open browser console for errors
# 3. Check Network tab for /chatkit requests
```

---

## Error Database

### Backend Import Errors

| Error | Wrong Code | Correct Code |
|-------|------------|--------------|
| `ModuleNotFoundError: chatkit.stores` | `from chatkit.stores import Store` | `from chatkit.store import Store` |
| `ModuleNotFoundError: chatkit.models` | `from chatkit.models import ...` | `from chatkit.types import ...` |
| `ImportError: Event` | `from chatkit.server import Event` | Remove - doesn't exist |
| `ImportError: ClientToolCallOutputItem` | `from chatkit.types import ClientToolCallOutputItem` | Use `Any` type |
| `ImportError: FilePart` | `from chatkit.types import FilePart` | Use `Any` type |

### Backend Runtime Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Can't instantiate abstract class` | Missing Store methods | Implement ALL 14 methods including attachments |
| Agent doesn't remember conversation | Only current message passed | Use `ThreadItemConverter` for history |
| `TypeError: object is not subscriptable` | Wrong type access | Check item content structure |
| Messages overwrite each other | ID collision (non-OpenAI) | Implement ID mapping fix |
| `User ID required` | Missing context | Pass user context from endpoint |

### Frontend Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `FatalAppError: Invalid input at api` | Missing `getClientSecret()` | Implement session endpoint + `getClientSecret()` function |
| `Unrecognized key "name"` | Wrong prompt schema | Use `label` instead of `name` |
| `Unrecognized key "icon"` | Invalid property | Remove `icon` from prompts |
| Blank screen / no chat UI | Missing CDN | Add chatkit.js script to HTML |
| Blank screen but CDN loads | Wrong detection method | Use `customElements.get('openai-chatkit')` |
| React hooks order violation | Hook after conditional | Split into wrapper + child components |
| History not loading | Thread not persisted | Implement localStorage for thread ID |
| CORS error | Missing middleware | Add CORSMiddleware to FastAPI |
| `404 /api/chatkit/session` | Missing session endpoint | Add `/api/chatkit/session` to backend |
| `Session creation failed` | Missing OPENAI_API_KEY | Set `OPENAI_API_KEY` environment variable |
| `Invalid client_secret` | Token refresh failure | Implement `/api/chatkit/refresh` endpoint |

### Web Components Detection
ChatKit uses Web Components, not global objects. Check if loaded:

```tsx
// ✅ CORRECT - Use custom elements API
const customElement = customElements.get('openai-chatkit');
if (customElement) {
  // ChatKit is ready
}

// ❌ WRONG - This doesn't exist
const chatKitGlobal = window.ChatKit;
```

### React Hooks Pattern
For conditional loading, split components to avoid hooks violations:

```tsx
// ✅ CORRECT - Split components
function ChatKitWrapper() {
  const [ready, setReady] = useState(false);

  if (!ready) return <Loading />;

  return <ChatKitReadyComponent />;
}

function ChatKitReadyComponent() {
  const { control } = useChatKit({ /* config */ });
  return <ChatKit control={control} />;
}
```

---

## Diagnostic Scripts

### Check All Imports
```python
# save as check_imports.py and run
def check_imports():
    errors = []
    
    try:
        from chatkit.server import ChatKitServer, StreamingResult
        print("✓ chatkit.server imports OK")
    except ImportError as e:
        errors.append(f"✗ chatkit.server: {e}")

    try:
        from chatkit.store import Store
        print("✓ chatkit.store imports OK")
    except ImportError as e:
        errors.append(f"✗ chatkit.store: {e}")

    try:
        from chatkit.types import ThreadMetadata, ThreadItem, Page
        print("✓ chatkit.types imports OK")
    except ImportError as e:
        errors.append(f"✗ chatkit.types: {e}")

    try:
        from chatkit.agents import AgentContext, stream_agent_response, ThreadItemConverter
        print("✓ chatkit.agents imports OK")
    except ImportError as e:
        errors.append(f"✗ chatkit.agents: {e}")

    try:
        from agents import Agent, Runner
        print("✓ agents imports OK")
    except ImportError as e:
        errors.append(f"✗ agents: {e}")

    if errors:
        print("\n--- ERRORS ---")
        for e in errors:
            print(e)
    else:
        print("\n✓ All imports successful!")

if __name__ == "__main__":
    check_imports()
```

### Check Store Implementation
```python
# Verify all abstract methods are implemented
required_methods = [
    'generate_thread_id',
    'generate_item_id',
    'load_thread',
    'save_thread',
    'load_thread_items',
    'add_thread_item',
    'save_item',
    'load_item',
    'delete_thread_item',
    'load_threads',
    'delete_thread',
    'save_attachment',     # Often forgotten!
    'load_attachment',     # Often forgotten!
    'delete_attachment',   # Often forgotten!
]

def check_store(store_class):
    print(f"Checking {store_class.__name__}...")
    missing = []
    for method in required_methods:
        if not hasattr(store_class, method):
            missing.append(method)
        else:
            print(f"  ✓ {method}")
    
    if missing:
        print(f"\n✗ Missing methods: {missing}")
    else:
        print(f"\n✓ All methods implemented!")
```

### Debug Conversation Memory
```python
# Add to your server for debugging
async def _debug_conversation(self, thread, context):
    page = await self.store.load_thread_items(thread.id, None, 100, "asc", context)
    
    print(f"\n=== CONVERSATION DEBUG ===")
    print(f"Thread: {thread.id}")
    print(f"Items in store: {len(page.data)}")
    
    for i, item in enumerate(page.data):
        item_type = type(item).__name__
        text = ""
        if hasattr(item, 'content') and item.content:
            for part in item.content:
                if hasattr(part, 'text'):
                    text = part.text[:50] + "..." if len(part.text) > 50 else part.text
                    break
        print(f"  {i+1}. [{item_type}] ID={item.id[:12]}... | {text}")
    
    print(f"===========================\n")
```

---

## Network Debugging

### Check Request/Response in Browser
```javascript
// Add to browser console
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log('Fetch:', args[0]);
  const response = await originalFetch(...args);
  console.log('Response:', response.status, response.headers.get('content-type'));
  return response;
};
```

### Expected Response Types
- `POST /api/chatkit` for streaming: `text/event-stream`
- `POST /api/chatkit` for JSON: `application/json`

---

## Common Issues & Solutions

### 1. Agent Doesn't Remember Context
**Symptom**: Agent asks "What's your name?" every message

**Cause**: Only current message is being passed to agent

**Solution**: Use `ThreadItemConverter` to load history:
```python
self.converter = ThreadItemConverter()

# In respond():
page = await self.store.load_thread_items(thread.id, None, 100, "asc", context)
all_items = list(page.data)
if input:
    all_items.append(input)
agent_input = await self.converter.to_agent_input(all_items)
```

### 2. Messages Overwrite Each Other
**Symptom**: Only one assistant message visible, others disappear

**Cause**: Non-OpenAI provider ID collision

**Solution**: Map IDs to unique store-generated IDs:
```python
id_mapping: dict[str, str] = {}

async for event in stream_agent_response(agent_context, result):
    if event.type == "thread.item.added":
        if isinstance(event.item, AssistantMessageItem):
            old_id = event.item.id
            if old_id not in id_mapping:
                new_id = self.store.generate_item_id("message", thread, context)
                id_mapping[old_id] = new_id
            event.item.id = id_mapping[old_id]
    yield event
```

### 3. User Sees Other Users' Threads
**Symptom**: Data leak between users

**Cause**: Missing user isolation in store

**Solution**: Extract user ID and filter all queries:
```python
def _get_user_id_from_context(self, context: dict) -> str:
    user = context.get('user', {})
    user_id = user.get('id')
    if not user_id:
        raise ValueError("User ID required")
    return user_id

# In every query:
WHERE "userId" = %s
```

### 4. PostgreSQL Connection Errors
**Symptom**: `psycopg2.OperationalError: connection refused`

**Check**:
1. DATABASE_URL is set correctly
2. SSL mode is configured: `sslmode='require'`
3. Database is accessible from your network
4. Connection pool not exhausted

---

## Debug Endpoint

Add to your FastAPI app:

```python
@app.get("/debug/threads")
async def debug_threads(user_id: str = None):
    """Debug endpoint to inspect stored items"""
    result = {}
    
    if hasattr(store, '_threads'):  # MemoryStore
        for thread_id, state in store._threads.items():
            items = []
            for item in state.items:
                item_data = {"id": item.id, "type": type(item).__name__}
                if hasattr(item, 'content') and item.content:
                    content_parts = []
                    for part in item.content:
                        if hasattr(part, 'text'):
                            content_parts.append(str(part.text)[:100])
                    item_data["content"] = content_parts
                items.append(item_data)
            result[thread_id] = {"items": items, "count": len(items)}
    
    return result
```

## Tool Integration Debugging

### Tool-Specific Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `onClientTool not called` | Tool not defined in agent | Add tool to agent's `tools` array in backend |
| `Unknown tool: <name>` | Missing handler in frontend | Implement case in `onClientTool` switch |
| `Tool execution timeout` | Async operation too long | Add timeout: `Promise.race([tool(), timeout()])` |
| `Permission denied` | Browser API restrictions | Request permissions upfront, handle gracefully |
| `CORS error on tool call` | Browser blocking request | Ensure backend CORS allows frontend origin |
| `State not updating` | Missing React state | Use `useState` for UI changes in tool handler |

### Testing Tools

```javascript
// Mock tool handler for testing
const mockToolHandler = async ({ name, params }) => {
  console.log(`Tool called: ${name}`, params);
  return { success: true, mock: true };
};

// Test in browser console
const chatkit = document.querySelector('openai-chatkit');
await chatkit.setOptions({
  onClientTool: mockToolHandler
});
```

### Debug Tool Execution

```javascript
// Add to your onClientTool for debugging
onClientTool: async (toolCall) => {
  console.log('🔧 Tool call received:', toolCall);

  try {
    const result = await handleTool(toolCall);
    console.log('✅ Tool result:', result);
    return result;
  } catch (error) {
    console.error('❌ Tool error:', error);
    return { error: error.message };
  }
}
```

### Authentication Debugging

#### Check Session Endpoint
```bash
# Test session creation
curl -X POST http://localhost:8000/api/chatkit/session \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n"

# Should return: {"client_secret": "...", "session_id": "..."}
```

#### Check Token Refresh
```bash
# Test refresh endpoint
curl -X POST http://localhost:8000/api/chatkit/refresh \
  -H "Content-Type: application/json" \
  -d '{"current_token": "old-token"}' \
  -w "\nStatus: %{http_code}\n"
```

#### Frontend Auth Debug
```javascript
// Add to browser console to debug authentication
const originalFetch = window.fetch;
window.fetch = async (url, options) => {
  if (url.includes('/api/chatkit')) {
    console.log('🔐 ChatKit API call:', url, options);
  }
  const response = await originalFetch(url, options);
  if (url.includes('/api/chatkit')) {
    console.log('🔐 ChatKit API response:', response.status, await response.clone().json().catch(() => 'Not JSON'));
  }
  return response;
};
```

### Advanced Debugging Patterns

#### Context Injection Debugging
```javascript
// Check if context is being sent correctly
const originalFetch = window.fetch;
window.fetch = async (url, options) => {
  if (url.includes('/api/chatkit') && options?.body) {
    try {
      const parsed = JSON.parse(options.body);
      console.log('📤 Request metadata:', parsed.params?.input?.metadata);
    } catch {}
  }
  return originalFetch(url, options);
};
```

#### httpOnly Cookie Debugging
```bash
# Test cookie authentication
curl -X POST http://localhost:8000/api/chatkit/session \
  -H "Cookie: auth_token=your-jwt-token" \
  -w "\nStatus: %{http_code}\n"

# Check if cookies are being sent
curl -X POST http://localhost:3000/api/chatkit \
  -H "Cookie: auth_token=your-jwt-token" \
  -w "\nCookies sent: %{http_code}\n"
```

#### Script Loading Debugging
```typescript
// Check script loading status
console.log('Custom elements:', customElements);
console.log('ChatKit defined:', customElements.get('openai-chatkit'));
console.log('Waiting for:', customElements.whenDefined('openai-chatkit'));

// Manual script injection test
const script = document.createElement('script');
script.src = 'https://cdn.platform.openai.com/deployments/chatkit/chatkit.js';
script.onload = () => console.log('✅ Script loaded');
script.onerror = () => console.log('❌ Script failed');
document.body.appendChild(script);
```

### New Error Patterns

| Issue | Symptom | Debug Steps | Fix |
|-------|---------|-------------|-----|
| **Context not injected** | Agent missing user/page info | Check request metadata in console | Use custom fetch interceptor |
| **httpOnly cookie missing** | 401 on session creation | Check browser network tab for cookies | Add `credentials: 'include'` |
| **Script loading timeout** | "ChatKit not defined" after 10s | Check `customElements.whenDefined()` | Use enhanced detection pattern |
| **Text selection not working** | No "Ask" button appears | Check `window.getSelection()` returns text | Add event listeners properly |
| **Context injection fails** | Agent doesn't reference page | Verify metadata in request body | Check JSON parsing in fetch interceptor |

### Validation Checklist

- [ ] Backend starts without import errors
- [ ] `/` or `/health` endpoint returns 200
- [ ] `/api/chatkit` accepts POST requests
- [ ] Frontend renders chat UI (not blank)
- [ ] Messages can be sent and received
- [ ] Agent remembers previous context
- [ ] Messages appear separately (not merged)
- [ ] Thread persists on page refresh
- [ ] Different users see only their own threads
- [ ] **Context**: User info injected into agent instructions
- [ ] **Context**: Page context available to agent
- [ ] **Auth**: httpOnly cookies work (if using)
- [ ] **Auth**: Proxy route handles authentication
- [ ] **Tools**: `onClientTool` handler defined
- [ ] **Tools**: Agent has tools in `tools` array
- [ ] **Tools**: Composer tools render correctly
- [ ] **Tools**: Custom actions reach backend
- [ ] **Advanced**: Text selection "Ask" feature works
- [ ] **Advanced**: Script loading detection handles errors
