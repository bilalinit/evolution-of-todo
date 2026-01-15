# ChatKit Frontend Patterns

## Overview
This document covers frontend integration patterns for ChatKit using React and the `@openai/chatkit-react` library.

## Prerequisites

### 1. CDN Script (REQUIRED)
Add to your HTML. Without this, the chat UI won't render.

**Next.js 16+ App Router** (`app/layout.tsx`):
```tsx
import Script from 'next/script';

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
```

**Next.js Pages Router** (`pages/_document.tsx`):
```tsx
import { Html, Head, Main, NextScript } from 'next/document';
// Note: Do NOT put in <Head>. Put in <body>.

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
        <script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          async
        />
      </body>
    </Html>
  );
}
```

**Vite/CRA** (`index.html`):
```html
<head>
  <script src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js" async></script>
</head>
```

### 2. Install React Package
```bash
npm install @openai/chatkit-react
```

## Authentication Migration

> **⚠️ Breaking Change**: ChatKit has moved from `domainKey` to token-based authentication.

**Old Pattern (Deprecated):**
```typescript
api: {
  url: 'http://localhost:8000/api/chatkit',
  domainKey: 'localhost'  // ❌ No longer supported
}
```

**New Pattern (Required):**
```typescript
api: {
  async getClientSecret(existing) {
    const res = await fetch('/api/chatkit/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const { client_secret } = await res.json();
    return client_secret;
  }
}
```

**Backend Requirements:**
- `uv add openai` (for session management)
- `OPENAI_API_KEY` environment variable
- `/api/chatkit/session` endpoint
- `/api/chatkit/refresh` endpoint (for token refresh)

## Security & Deployment

### Domain Allowlisting (CRITICAL)

> **⚠️ Required for Production**: ChatKit requires domain registration in the OpenAI Platform dashboard.

**Why This Matters:**
- ChatKit will **refuse to load** on unregistered domains
- This is a security feature to prevent unauthorized usage
- Both development and production domains must be registered

**How to Configure:**

1. **Visit**: https://platform.openai.com/settings/organization/security/domain-allowlist

2. **Add Your Domains**:
   - **Development**: `localhost`, `127.0.0.1`
   - **Staging**: `staging.yourapp.com`
   - **Production**: `yourapp.com`, `www.yourapp.com`

3. **Wait for Propagation**: Changes may take a few minutes to take effect

### Common Domain Allowlisting Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `Invalid domain` error | Domain not registered | Add domain to OpenAI allowlist |
| `FatalAppError` on load | Missing domainKey | Add `domainKey: 'your-domain.com'` |
| Works on localhost, fails on deploy | Production domain not allowed | Add production domain to allowlist |
| `403 Forbidden` | Domain mismatch | Ensure domainKey matches registered domain |

### Security Best Practices

#### 1. Environment-Specific Configuration
```typescript
// config.ts
export const CHATKIT_CONFIG = {
  development: {
    domainKey: 'localhost',
    api: { url: 'http://localhost:8000/api/chatkit' }
  },
  production: {
    domainKey: 'yourapp.com',
    api: { url: 'https://api.yourapp.com/api/chatkit' }
  }
};
```

#### 2. Secure Session Management
```typescript
// Always use HTTPS in production
const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
const baseUrl = `${protocol}//${window.location.host}`;

// Pass user authentication context
const { control } = useChatKit({
  api: {
    async getClientSecret(existing) {
      const res = await fetch(`${baseUrl}/api/chatkit/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userAuthToken}` // Pass user auth
        },
        credentials: 'include' // Include cookies if needed
      });
      const { client_secret } = await res.json();
      return client_secret;
    }
  }
});
```

#### 3. Rate Limiting & Abuse Prevention
- Implement rate limiting on `/api/chatkit/session` endpoint
- Monitor session creation frequency per user/IP
- Use user authentication to prevent abuse

#### 4. Data Privacy
- ChatKit conversations may be logged by OpenAI
- Implement data retention policies
- Consider user consent for AI processing

### Deployment Checklist

- [ ] **Domain Registration**: All domains added to OpenAI allowlist
- [ ] **HTTPS**: Production uses HTTPS (required for security)
- [ ] **Environment Variables**: `OPENAI_API_KEY` set in production
- [ ] **CORS**: Backend allows frontend origin
- [ ] **Rate Limiting**: Session endpoints protected
- [ ] **Monitoring**: Error tracking configured
- [ ] **User Isolation**: Multi-user context properly implemented

### Production Debugging

#### Check Domain Registration
```javascript
// Add to browser console to debug domain issues
console.log('Current domain:', window.location.hostname);
console.log('DomainKey in use:', 'your-domain-key'); // Check your config
```

#### Verify Session Endpoint
```bash
# Test session creation with production domain
curl -X POST https://api.yourapp.com/api/chatkit/session \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n"
```

#### Monitor for Domain Errors
```typescript
// Add to frontend error handling
onError: ({ error }) => {
  if (error.message.includes('domain')) {
    console.error('Domain allowlisting issue:', error);
    // Alert user to contact support
  }
}
```

## Basic Usage

> **Next.js App Router**: ChatKit uses React hooks, so components must be client components. Add `'use client'` at the top.

```tsx
'use client';  // Required for Next.js App Router

import { ChatKit, useChatKit } from '@openai/chatkit-react';

function ChatComponent() {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        // Call backend session endpoint
        const res = await fetch('/api/chatkit/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
    theme: {
      colorScheme: 'dark',
    },
  });

  return <ChatKit control={control} className="h-full w-full" />;
}
```

## Configuration Options

### API Configuration

#### NEW: Token-Based Authentication (Recommended)
```typescript
api: {
  // Function to get client secret for authentication
  async getClientSecret(existing: string | null): Promise<string> {
    // existing: current token (for refresh), null for initial session
    if (existing) {
      // Refresh expired token
      const res = await fetch('/api/chatkit/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_token: existing }),
      });
      const { client_secret } = await res.json();
      return client_secret;
    }

    // Create new session
    const res = await fetch('/api/chatkit/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const { client_secret } = await res.json();
    return client_secret;
  },

  // Optional: Custom fetch for additional headers
  fetch?: (url: string, options: RequestInit) => Promise<Response>;

  // Optional: Custom URL (defaults to '/api/chatkit')
  url?: string;
}
```

#### OLD: Domain Key Authentication (Deprecated)
```typescript
api: {
  url: string;           // Backend ChatKit endpoint URL
  domainKey: string;     // 'localhost' for dev, your domain for prod
  headers?: Record<string, string>;  // Optional auth headers
}
```
> ⚠️ **Deprecated**: The `domainKey` approach is being phased out. Use `getClientSecret()` instead.

### Theme Configuration
```typescript
theme: {
  colorScheme: 'dark' | 'light';
  color: {
    grayscale: { hue: number; tint: number; shade: number };
    accent: { primary: string; level: number };
  };
  radius: 'round' | 'square';
}
```

### Start Screen Configuration
```typescript
startScreen: {
  greeting: string;
  prompts: Array<{
    label: string;    // Display text (NOT 'name'!)
    prompt: string;   // Text to send when clicked
  }>;
}
```

**IMPORTANT**: Use `label`, NOT `name`. Using `name` will cause errors.

### Composer Configuration
```typescript
composer: {
  placeholder: string;
}
```

## Thread Persistence

Store thread ID in localStorage to persist conversations:

```tsx
function ChatComponent() {
  const [initialThread, setInitialThread] = useState<string | null>(null);

  useEffect(() => {
    const savedThread = localStorage.getItem('chatkit-thread-id');
    setInitialThread(savedThread);
  }, []);

  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        const res = await fetch('/api/chatkit/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
    initialThread: initialThread,
    onThreadChange: ({ threadId }) => {
      if (threadId) {
        localStorage.setItem('chatkit-thread-id', threadId);
      }
    },
  });

  return <ChatKit control={control} />;
}
```

## Authenticated ChatKit

Pass user ID to backend for multi-user support:

```tsx
function AuthenticatedChat({ user }: { user: User }) {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        // Pass user ID as query parameter for user isolation
        const res = await fetch(`/api/chatkit/session?userId=${user.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
    startScreen: {
      greeting: `Hello ${user.name}! How can I help you?`,
      prompts: [
        { label: 'What is this about?', prompt: 'What is this about?' },
        {
          label: 'Help me understand',
          prompt: `Explain as a ${user.educationLevel} level learner`
        },
      ],
    },
  });

  return <ChatKit control={control} />;
}
```

## Full Component Example

A complete component with authentication, thread persistence, and custom styling:

```tsx
'use client';  // Required for Next.js App Router

import React, { useState, useEffect } from 'react';
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import styles from './ChatBot.module.css';

interface User {
  id: string;
  name: string;
  educationLevel: string;
  programmingExperience: string;
}

interface ChatBotProps {
  user: User;
  backendUrl?: string;
}

const ChatBotAuthenticated: React.FC<ChatBotProps> = ({ 
  user, 
  backendUrl = 'http://localhost:8000' 
}) => {
  const [initialThread, setInitialThread] = useState<string | null>(null);

  useEffect(() => {
    const savedThread = localStorage.getItem('chatkit-thread-id');
    setInitialThread(savedThread);
  }, []);

  const getPersonalizedGreeting = () => {
    if (user.programmingExperience?.includes('beginner')) {
      return `Hello ${user.name}! I'll explain things at a beginner-friendly level.`;
    }
    return `Hello ${user.name}! How can I help you today?`;
  };

  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        // Pass user context for multi-user isolation
        const res = await fetch(`/api/chatkit/session?userId=${user.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
    initialThread: initialThread,
    theme: {
      colorScheme: 'light',
      color: {
        grayscale: { hue: 220, tint: 6, shade: -1 },
        accent: { primary: '#3578e5', level: 1 },
      },
      radius: 'round',
    },
    startScreen: {
      greeting: getPersonalizedGreeting(),
      prompts: [
        { label: 'What is this about?', prompt: 'What is this about?' },
        { label: 'Help me understand', prompt: 'Help me understand a concept' },
      ],
    },
    composer: {
      placeholder: `Ask a question...`,
    },
    onThreadChange: ({ threadId }) => {
      if (threadId) {
        localStorage.setItem('chatkit-thread-id', threadId);
      }
    },
    onError: ({ error }) => console.error('ChatKit error:', error),
  });

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h2>Chat with {user.name}</h2>
        <button 
          onClick={() => {
            localStorage.removeItem('chatkit-thread-id');
            window.location.reload();
          }}
        >
          + New Chat
        </button>
      </div>
      <div className={styles.chatkitContainer}>
        <ChatKit control={control} className={styles.chatkitContainer} />
      </div>
    </div>
  );
};

export default ChatBotAuthenticated;
```

### CSS Module
```css
/* ChatBot.module.css */
.chatContainer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chatHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.chatkitContainer {
  flex: 1;
  overflow: hidden;
  min-height: 500px;
}
```

## Popup/Floating Chat Pattern

```tsx
function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        const res = await fetch('/api/chatkit/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
    theme: { colorScheme: 'dark' },
  });

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4361ee, #4cc9f0)',
            border: 'none',
            cursor: 'pointer',
            zIndex: 100,
          }}
        >
          💬
        </button>
      )}

      {/* Chat popup */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '420px',
          height: '600px',
          background: '#16213e',
          borderRadius: '1rem',
          boxShadow: '0 10px 50px rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Assistant</span>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <ChatKit control={control} className="h-full w-full" />
          </div>
        </div>
      )}
    </>
  );
}
```

## Error Handling

```tsx
const { control } = useChatKit({
  // ...config
  onError: ({ error }) => {
    console.error('ChatKit error:', error);
    // Show user-friendly error message
    // Log to analytics
  },
});
```

## Advanced Patterns

### Custom Fetch Interceptor with Context Injection

For production applications that need to inject authentication headers and page/user context into every request:

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

### Page Context Extraction

Extract current page context to provide to the AI agent:

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

### Text Selection "Ask" Feature

Allow users to select text on the page and ask questions about it:

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

// In your component:
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

### Enhanced Script Loading Detection

More robust detection for when ChatKit is ready:

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

// Only render when ready
{isOpen && scriptStatus === 'ready' && <ChatKit control={control} />}
{scriptStatus === 'error' && <div>ChatKit failed to load</div>}
{scriptStatus === 'pending' && <div>Loading ChatKit...</div>}
```

### httpOnly Cookie Proxy (Next.js)

When using httpOnly cookies for authentication (common in production):

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

  try {
    const response = await fetch(`${API_BASE}/chatkit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
        "X-User-ID": request.headers.get("X-User-ID") || "",
      },
      body: await request.text(),
    });

    // Handle SSE streaming responses
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
  } catch (error) {
    console.error("[ChatKit Proxy] Error:", error);
    return NextResponse.json({ error: "ChatKit proxy request failed" }, { status: 500 });
  }
}
```

Frontend usage with proxy:

```typescript
const { control } = useChatKit({
  api: {
    url: "/api/chatkit", // Proxy handles auth
    domainKey: domainKey,

    // Still need custom fetch for context injection
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
        credentials: 'include', // Include cookies for proxy auth
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

## Tool Integration

ChatKit supports rich tool integration for browser APIs, external services, and UI interactions.

**See `TOOL_INTEGRATION.md` for comprehensive guide including:**
- Client-side tools (`onClientTool`) - email, modals, geolocation, file system
- Composer tools - UI buttons for different interaction modes
- Custom actions - server communication
- OpenAI Agents SDK integration patterns
- Error handling and security
- Testing strategies

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Blank screen | Missing CDN script | Add `chatkit.js` to HTML head |
| `FatalAppError: Invalid input at api` | Missing `getClientSecret()` | Implement session endpoint + `getClientSecret()` function |
| `Unrecognized key "name"` | Wrong prompt schema | Use `label`, not `name` |
| `Unrecognized key "icon"` | Invalid property | Remove `icon` from prompts |
| CORS error | Missing backend CORS | Add CORSMiddleware to FastAPI |
| `404 /api/chatkit/session` | Missing session endpoint | Add `/api/chatkit/session` endpoint to backend |
| `Session creation failed` | Missing OPENAI_API_KEY | Set `OPENAI_API_KEY` environment variable |
