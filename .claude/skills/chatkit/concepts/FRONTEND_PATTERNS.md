# Frontend Integration Patterns

Complete React/Next.js frontend implementation for ChatKit integration.

> [!IMPORTANT]
> ChatKit uses a **single endpoint** architecture. All operations go through one `/api/chatkit` proxy route. Do NOT create separate `/session`, `/threads`, `/refresh` routes.

## Project Structure

### Required Files (Minimal)
```
app/
├── layout.tsx              # CDN script loading
├── chatbot/
│   └── page.tsx            # ChatKit component
└── api/
    └── chatkit/
        └── route.ts        # Single proxy (handles EVERYTHING)
```

> [!CAUTION]
> Do NOT create these - they are NOT needed:
> - `/api/chatkit/session/` ❌
> - `/api/chatkit/refresh/` ❌
> - `/api/chatkit/threads/` ❌

## Customization Required

> [!NOTE]
> This skill provides **ChatKit-specific patterns** that are universal. Your **auth provider and styling** will vary.

### Project-Specific (must adapt)

| Category | Item | Example Variations |
|----------|------|-------------------|
| **Auth** | Token endpoint URL | `http://localhost:3000/api/auth/token` |
| | Cookie names | `session`, `auth_token`, `better-auth.session_token` |
| **Backend** | Backend URL | `http://localhost:8000`, `https://api.myapp.com` |
| **Styling** | Theme colors | `#FF6B4A`, `#3B82F6` |
| | Fonts | `DM Sans`, `Inter`, `Roboto` |

### Universal (no changes needed)

- CDN script loading pattern
- `customElements.whenDefined()` for loading detection
- `useChatKit` with `url/domainKey` pattern
- Streaming response handling in proxy
- Error/loading state patterns

## CDN Script Loading

### Root Layout (app/layout.tsx)

```typescript
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* ChatKit CDN Script - REQUIRED */}
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

### Important Notes for Next.js

1. **Script Placement**: Must be in `<body>`, not `<head>`
2. **Strategy**: Use `afterInteractive` for App Router
3. **No Event Handlers**: Next.js 16+ doesn't allow onLoad on Script
4. **Loading Detection**: Use `customElements.whenDefined()` instead

## ChatKit Component

### Main Component (app/chatbot/page.tsx)

```typescript
'use client'

import { useState, useEffect } from 'react'
import { ChatKit, useChatKit } from '@openai/chatkit-react'

export default function ChatBotPage() {
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Enhanced loading detection
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

  // CRITICAL: Use url/domainKey pattern (NOT getClientSecret)
  const { control } = useChatKit({
    api: {
      url: '/api/chatkit',  // Single endpoint for everything
      domainKey: 'local-dev',
    },
    theme: {
      colorScheme: 'light',
      color: {
        grayscale: { hue: 220, tint: 6, shade: -1 },
        accent: { primary: '#FF6B4A', level: 1 },  // Customize this
      },
      radius: 'round',
    },
    startScreen: {
      greeting: 'Hello! How can I help you?',
      prompts: [
        { label: 'Example prompt 1', prompt: 'Do something' },
        { label: 'Example prompt 2', prompt: 'Do something else' },
      ],
    },
    composer: {
      placeholder: 'Type your message...',
    },
    onError: ({ error: chatError }) => {
      console.error('ChatKit error:', chatError)
      setError(`Chat error: ${chatError.message || String(chatError)}`)
    },
  })

  if (error) {
    return (
      <div className="error-container">
        <h2>ChatKit Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="loading-container">
        <h2>Loading ChatKit...</h2>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div style={{ height: 'calc(100vh - 64px)' }}>
      <ChatKit control={control} style={{ width: '100%', height: '100%', minHeight: '500px' }} />
    </div>
  )
}
```

## Next.js API Proxy Route

### Single Proxy (app/api/chatkit/route.ts)

> [!IMPORTANT]
> This ONE endpoint handles ALL ChatKit operations. ChatKit SDK routes everything through here.

```typescript
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

// TODO: Customize this for your auth provider
async function getJWTTokenFromAuth(request: NextRequest): Promise<string | null> {
  try {
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) {
      console.log('[ChatKit] No cookies in request')
      return null
    }

    // TODO: Replace with YOUR auth provider's token endpoint
    const response = await fetch('http://localhost:3000/api/auth/token', {
      method: 'GET',
      headers: { 'cookie': cookieHeader },
    })

    if (!response.ok) {
      console.log('[ChatKit] Failed to get JWT token:', response.status)
      return null
    }

    const data = await response.json()
    return data.token || null
  } catch (error) {
    console.error('[ChatKit] Error getting JWT token:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const backendResponse = await fetch(`${BACKEND_URL}/api/chatkit`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!backendResponse.ok) {
      const error = await backendResponse.text()
      return NextResponse.json({ error }, { status: backendResponse.status })
    }

    return NextResponse.json(await backendResponse.json())
  } catch (error) {
    console.error('ChatKit GET error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.arrayBuffer()
    const token = await getJWTTokenFromAuth(request)

    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
      console.log('[ChatKit] Forwarding token to backend')
    }

    const backendResponse = await fetch(`${BACKEND_URL}/api/chatkit`, {
      method: 'POST',
      headers,
      body,
    })

    const contentType = backendResponse.headers.get('content-type') || ''

    // Handle streaming response (for chat messages)
    if (contentType.includes('text/event-stream')) {
      if (!backendResponse.body) {
        return NextResponse.json({ error: 'No response body' }, { status: 500 })
      }

      return new Response(backendResponse.body, {
        status: backendResponse.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Handle JSON response (for thread operations)
    if (!backendResponse.ok) {
      const error = await backendResponse.text()
      return NextResponse.json({ error }, { status: backendResponse.status })
    }

    return NextResponse.json(await backendResponse.json())
  } catch (error) {
    console.error('ChatKit POST error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
```

## Common Pitfalls & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| ChatKit not loading | CDN script not in body | Move `<Script>` inside `<body>` |
| "useChatKit error" | Using `getClientSecret` pattern | Use `url/domainKey` pattern instead |
| Auth not working | JWT not forwarded | Check `getJWTTokenFromAuth` function |
| Blank screen | Component rendered before CDN loads | Use `customElements.whenDefined()` |
| Streaming not working | Response not passed through | Use `new Response(stream)` pattern |
| Cors errors | Backend URL wrong | Check `NEXT_PUBLIC_BACKEND_URL` |

## Quick Adaptation Checklist

When using this skill in a new project:

1. ☐ Add ChatKit CDN script to `layout.tsx`
2. ☐ Create `app/chatbot/page.tsx` with ChatKit component
3. ☐ Create `app/api/chatkit/route.ts` proxy
4. ☐ Update `getJWTTokenFromAuth()` for your auth provider
5. ☐ Update `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
6. ☐ Customize theme colors in `useChatKit()`
7. ☐ Install dependencies: `npm install @openai/chatkit-react`

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Production
NEXT_PUBLIC_BACKEND_URL=https://api.your-app.com
```

## Styling Tips

```css
/* Ensure ChatKit has proper sizing */
openai-chatkit {
  width: 100%;
  height: 100%;
  min-height: 500px;
  display: block;
}
```

This frontend implementation provides a complete, production-ready ChatKit integration with Next.js App Router.