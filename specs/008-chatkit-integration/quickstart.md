# ChatKit Integration Quickstart Guide

**Date**: 2026-01-16
**Status**: Complete
**Estimated Setup Time**: 15-30 minutes

## Prerequisites

### Required Accounts & Keys

1. **OpenAI Account** with API access
   - [OpenAI Platform Dashboard](https://platform.openai.com/)
   - API key with ChatKit permissions

2. **Existing Project Setup**
   - Next.js 16+ App Router (frontend)
   - FastAPI backend with Better Auth
   - Neon PostgreSQL database
   - OpenAI Agents SDK integration (existing)

### Environment Variables Required

```bash
# Backend (.env)
OPENAI_API_KEY=sk-...              # REQUIRED - OpenAI API key
DATABASE_URL=postgresql://...      # Existing Neon database
BETTER_AUTH_SECRET=...             # Existing Better Auth secret

# Frontend (.env.local)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000  # Your backend URL
```

## Step-by-Step Setup

### Step 1: Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Add OpenAI packages (required for ChatKit sessions and implementation)
uv add openai openai-chatkit

# Verify installation
uv list | grep openai
```

**Expected Output**:
```
openai v1.59.6
openai-chatkit v1.0.0
```

### Step 2: Frontend Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install ChatKit React component
npm install @openai/chatkit-react

# Verify installation
npm list @openai/chatkit-react
```

**Expected Output**:
```
frontend@0.1.0
└── @openai/chatkit-react@1.0.0
```

### Step 3: Database Migration

Create the ChatKit tables in your Neon PostgreSQL database:

```sql
-- Run this SQL in your Neon console or via migration tool
CREATE TABLE chatkit_thread (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chatkit_thread_user_id_check CHECK ("userId" ~ '^[a-zA-Z0-9_-]+$')
);

CREATE TABLE chatkit_thread_item (
    id VARCHAR(255) PRIMARY KEY,
    "threadId" VARCHAR(255) NOT NULL REFERENCES chatkit_thread(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'user_message', 'assistant_message', 'tool_call',
        'tool_result', 'system_message', 'error'
    )),
    content JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chatkit_thread_item_type_check CHECK (type ~ '^[a-z_]+$')
);

-- Performance indexes
CREATE INDEX idx_chatkit_thread_user ON chatkit_thread("userId");
CREATE INDEX idx_chatkit_thread_updated ON chatkit_thread("updatedAt");
CREATE INDEX idx_chatkit_item_thread ON chatkit_thread_item("threadId");
CREATE INDEX idx_chatkit_item_created ON chatkit_thread_item("createdAt");
CREATE INDEX idx_chatkit_item_type ON chatkit_thread_item(type);
```

**Verification**:
```sql
-- Check tables were created
\dt chatkit_*

-- Should show:
-- chatkit_thread
-- chatkit_thread_item
```

### Step 4: Backend Implementation

#### 4.1 Create Session Endpoints

Add to your existing `backend/src/backend/main.py`:

```python
# Add to imports
import openai
from datetime import datetime, timezone
from fastapi import HTTPException

# Initialize OpenAI client (add near top of file)
openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Add session creation endpoint
@app.post("/api/chatkit/session")
async def create_chatkit_session(request: Request):
    """Create ChatKit session for authenticated user"""
    try:
        # Extract user from Better Auth
        auth_header = request.headers.get("Authorization")
        token = auth_header.replace("Bearer ", "") if auth_header else None

        if not token:
            # Try cookies
            token = request.cookies.get("auth_token")

        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")

        # Verify JWT (use your existing function)
        user_id = verify_jwt_token(token)

        # Create ChatKit session
        session = openai_client.chatkit.sessions.create(
            model="gpt-4o",
            metadata={
                "user_id": user_id,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        )

        return {
            "client_secret": session.client_secret,
            "session_id": session.id,
            "user_id": user_id,
            "expires_at": session.expires_at
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "code": "OPENAI_API_ERROR",
                "message": f"Failed to create session: {str(e)}"
            }
        )

# Add session refresh endpoint
@app.post("/api/chatkit/refresh")
async def refresh_chatkit_session(request: Request, refresh_data: dict):
    """Refresh ChatKit session"""
    try:
        current_token = refresh_data.get("current_token")
        if not current_token:
            raise HTTPException(
                status_code=400,
                detail={"code": "INVALID_REQUEST", "message": "current_token required"}
            )

        # Extract and verify user
        auth_header = request.headers.get("Authorization")
        token = auth_header.replace("Bearer ", "") if auth_header else None

        if not token:
            token = request.cookies.get("auth_token")

        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")

        user_id = verify_jwt_token(token)

        # Create new session
        session = openai_client.chatkit.sessions.create(
            model="gpt-4o",
            metadata={
                "user_id": user_id,
                "refreshed": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        )

        return {
            "client_secret": session.client_secret,
            "session_id": session.id,
            "user_id": user_id,
            "expires_at": session.expires_at
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "code": "OPENAI_API_ERROR",
                "message": f"Failed to refresh session: {str(e)}"
            }
        )
```

#### 4.2 Verify Backend Setup

```bash
# Test backend starts without errors
cd backend
uv run python -m backend.main --help

# Should show FastAPI help without errors
```

### Step 5: Frontend Implementation

#### 5.1 Add ChatKit CDN Script

Update `frontend/src/app/layout.tsx`:

```tsx
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* ChatKit CDN Script - MUST be in body, not head */}
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

#### 5.2 Create ChatKit Session Utilities

Create `frontend/src/lib/chatkit/session.ts`:

```typescript
export async function createChatKitSession(): Promise<{
  client_secret: string;
  session_id: string;
}> {
  const response = await fetch('/api/chatkit/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // For httpOnly cookies
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create session');
  }

  return response.json();
}

export async function refreshChatKitSession(currentToken: string): Promise<{
  client_secret: string;
  session_id: string;
}> {
  const response = await fetch('/api/chatkit/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ current_token: currentToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to refresh session');
  }

  return response.json();
}
```

#### 5.3 Create ChatKit Widget Component

Create `frontend/src/components/chat/ChatKitWidget.tsx`:

```tsx
'use client';

import { useChatKit } from '@openai/chatkit-react';
import { createChatKitSession, refreshChatKitSession } from '@/lib/chatkit/session';
import { useState } from 'react';

export function ChatKitWidget() {
  const [sessionError, setSessionError] = useState<string | null>(null);

  const { control } = useChatKit({
    api: {
      getClientSecret: async (existing) => {
        try {
          if (existing) {
            const refreshed = await refreshChatKitSession(existing);
            return refreshed.client_secret;
          }
          const session = await createChatKitSession();
          return session.client_secret;
        } catch (error) {
          setSessionError(error instanceof Error ? error.message : 'Session failed');
          throw error;
        }
      },
      fetch: async (url, options) => {
        return fetch(url, {
          ...options,
          credentials: 'include' as const,
          headers: {
            ...options?.headers,
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
      greeting: 'Hello! How can I help you with your tasks?',
      prompts: [
        { label: 'Create a task', prompt: 'Create a task for tomorrow' },
        { label: 'Show my tasks', prompt: 'Show me my pending tasks' },
        { label: 'Urdu help', prompt: 'میرے ٹاسک دکھاؤ' },
      ],
    },
    composer: {
      placeholder: 'Ask me to create, list, or update tasks...',
    },
  });

  if (sessionError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-800">Session Error</h3>
        <p className="text-red-600 text-sm mt-1">{sessionError}</p>
        <p className="text-red-600 text-sm mt-2">
          Please ensure OPENAI_API_KEY is set in your backend environment.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[600px] border border-gray-200 rounded-lg overflow-hidden">
      {/* @ts-ignore - ChatKit types */}
      <ChatKit control={control} />
    </div>
  );
}
```

#### 5.4 Update Chat Page

Replace `frontend/src/app/chatbot/page.tsx`:

```tsx
'use client';

import { ChatKitWidget } from '@/components/chat/ChatKitWidget';
import { useAuth } from '@/lib/auth/auth-client'; // Your existing auth hook

export default function ChatbotPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Please log in to access the chat</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Task Assistant Chat</h1>
      <ChatKitWidget />

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>💡 Tip:</strong> You can create tasks, list your to-dos, and update them using natural language.
        Try saying "Create a task for tomorrow" or "Show my pending tasks".
      </div>
    </div>
  );
}
```

### Step 6: API Route Setup

Create the API routes for session management:

#### 6.1 Session Creation Route

Create `frontend/src/app/api/chatkit/session/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Call backend directly
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/chatkit/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const sessionData = await response.json();
    return NextResponse.json(sessionData);

  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create session' } },
      { status: 500 }
    );
  }
}
```

#### 6.2 Session Refresh Route

Create `frontend/src/app/api/chatkit/refresh/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';

    const response = await fetch(`${backendUrl}/api/chatkit/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const sessionData = await response.json();
    return NextResponse.json(sessionData);

  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to refresh session' } },
      { status: 500 }
    );
  }
}
```

## Step 7: Environment Configuration

### Backend Environment Variables

Add to your backend `.env` file:

```bash
# REQUIRED - OpenAI API key for ChatKit sessions
OPENAI_API_KEY=sk-...your-openai-key-here

# Verify the key has ChatKit permissions in OpenAI Platform
```

**Important**: Even if you're using other models (like Xiaomi mimo-v2-flash) for chat, you still need an OpenAI API key for ChatKit session management.

### Frontend Environment Variables

Add to `frontend/.env.local`:

```bash
# Your backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## Step 8: Domain Allowlist Setup

### Development

1. Go to [OpenAI Platform Dashboard](https://platform.openai.com/)
2. Navigate to **Security** → **Domain Allowlist**
3. Add:
   - `http://localhost:3000`
   - `http://localhost:3001` (if using different port)

### Production

Add your production domains:

- `https://yourapp.com`
- `https://www.yourapp.com`

## Step 9: Testing the Integration

### 9.1 Start Backend

```bash
cd backend
uv run python -m backend.main
```

**Expected Output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### 9.2 Start Frontend

```bash
cd frontend
npm run dev
```

**Expected Output**:
```
ready - started server on 0.0.0.0:3000
```

### 9.3 Test Session Creation

1. **Login** to your application (ensure Better Auth is working)
2. **Navigate** to `/chatbot`
3. **Open Browser DevTools** → Network tab
4. **Look for** `/api/chatkit/session` request
5. **Verify** response contains `client_secret` and `session_id`

**Expected Response**:
```json
{
  "client_secret": "sk-chatkit-prod_abc123...",
  "session_id": "session_xyz789",
  "user_id": "user_123",
  "expires_at": "2026-01-16T11:30:00Z"
}
```

### 9.4 Test ChatKit Loading

1. **Check Console** for any errors
2. **Verify** ChatKit UI appears
3. **Test** sending a message
4. **Confirm** agent responds with task management

### 9.5 Test MCP Tools

Try these commands in the chat:

- "Create a task for tomorrow"
- "Show my pending tasks"
- "میرے ٹاسک دکھاؤ" (Urdu: Show my tasks)

**Expected**: Tool calls should appear in the chat with proper formatting.

## Step 10: Troubleshooting

### Issue 1: "OPENAI_API_KEY missing"

**Symptom**: Session creation fails with error about missing API key

**Solution**:
```bash
# Check backend environment
echo $OPENAI_API_KEY

# If empty, add to backend/.env
echo "OPENAI_API_KEY=sk-..." >> backend/.env

# Restart backend
```

### Issue 2: ChatKit UI doesn't load

**Symptom**: Blank chat area, no ChatKit interface

**Check**:
1. **CDN Script**: Open DevTools → Sources → Look for `chatkit.js`
2. **Console Errors**: Check for script loading errors
3. **Script Placement**: Verify script is in `<body>`, not `<head>`

**Fix**:
```tsx
// Ensure this is in app/layout.tsx body
<Script
  src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
  strategy="afterInteractive"
/>
```

### Issue 3: "Session not found" errors

**Symptom**: ChatKit loads but can't send messages

**Check**:
1. **Session Expiry**: Sessions expire after ~1 hour
2. **Token Refresh**: Check `/api/chatkit/refresh` is working
3. **Network Issues**: Verify backend is reachable

**Debug**:
```typescript
// Add logging to ChatKitWidget
const { control } = useChatKit({
  api: {
    getClientSecret: async (existing) => {
      console.log('Getting client secret, existing:', existing);
      // ... rest of function
    },
  },
});
```

### Issue 4: Tool calls not working

**Symptom**: MCP tools don't execute or show errors

**Check**:
1. **MCP Server**: Verify `task_serves_mcp_tools.py` is running
2. **Tool Registration**: Check tools are properly registered
3. **Error Messages**: Look for MCP errors in backend logs

**Debug**:
```bash
# Check backend logs for MCP errors
tail -f backend.log | grep -i mcp
```

### Issue 5: CORS errors

**Symptom**: Browser blocks requests to backend

**Solution**:
```python
# In backend/main.py, ensure CORS is configured
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://yourapp.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Step 11: Production Deployment

### 11.1 Environment Variables

**Backend** (production):
```bash
OPENAI_API_KEY=sk-prod-...          # Production OpenAI key
DATABASE_URL=postgresql://...       # Production Neon database
BETTER_AUTH_SECRET=...              # Production auth secret
```

**Frontend** (production):
```bash
NEXT_PUBLIC_BACKEND_URL=https://api.yourapp.com
```

### 11.2 Domain Allowlist

Update OpenAI Platform with production domains:
- `https://yourapp.com`
- `https://www.yourapp.com`
- `https://api.yourapp.com` (if different)

### 11.3 Monitoring

Set up monitoring for:
- Session creation success rate
- ChatKit loading times
- MCP tool execution success
- Error rates by endpoint

### 11.4 Performance Optimization

1. **CDN**: Consider using a CDN for static assets
2. **Database**: Add connection pooling for Neon
3. **Caching**: Cache session metadata if needed
4. **Compression**: Enable gzip/brotli compression

## Success Checklist

- [ ] `OPENAI_API_KEY` set in backend environment
- [ ] Database tables created successfully
- [ ] Backend session endpoints return `client_secret`
- [ ] ChatKit CDN script loads in HTML body
- [ ] ChatKit UI appears on chat page
- [ ] Messages can be sent and received
- [ ] MCP tools execute correctly
- [ ] Session refresh works
- [ ] User isolation is working (users see only their data)
- [ ] Urdu language support works
- [ ] Mobile responsiveness is good
- [ ] Error handling is graceful

## Next Steps

1. **Customize Theme**: Adjust colors to match your brand
2. **Add Features**: Implement localStorage thread persistence
3. **Enhance Context**: Add user/page context injection
4. **Testing**: Write comprehensive tests
5. **Analytics**: Add usage tracking
6. **Feedback**: Gather user feedback and iterate

## Support

For issues with:
- **ChatKit**: Check [OpenAI ChatKit Docs](https://platform.openai.com/docs/chatkit)
- **OpenAI API**: Check [OpenAI Status](https://status.openai.com/)
- **Integration**: Review [research.md](./research.md) and [data-model.md](./data-model.md)

---

**Setup Complete!** 🎉

Your ChatKit integration should now be working. Test thoroughly in development before deploying to production.