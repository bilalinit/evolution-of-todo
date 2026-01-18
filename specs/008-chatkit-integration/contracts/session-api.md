# ChatKit Session API Contracts

**Date**: 2026-01-16
**Status**: Design Complete
**Base URL**: `/api/chatkit`

## Overview

These endpoints handle ChatKit session management with Better Auth integration. All endpoints require authentication via JWT (Authorization header) or httpOnly cookies.

## Authentication

### JWT Token Flow
```
Frontend → Better Auth → JWT Token → API Headers
```

### Cookie Flow (Recommended)
```
Frontend → Better Auth → httpOnly Cookie → API (credentials: 'include')
```

## Endpoints

### 1. Create Session

**Endpoint**: `POST /api/chatkit/session`

**Purpose**: Create a new ChatKit session and return client secret for frontend initialization.

**Authentication**: Required (JWT or httpOnly cookie)

**Request**:
```http
POST /api/chatkit/session
Content-Type: application/json
Authorization: Bearer <jwt_token>
# OR
Cookie: auth_token=<httpOnly_cookie>
```

**Request Body**: None

**Success Response (200 OK)**:
```json
{
  "client_secret": "sk-chatkit-prod_abc123...",
  "session_id": "session_xyz789",
  "user_id": "user_123",
  "expires_at": "2026-01-16T11:30:00Z"
}
```

**Response Fields**:
- `client_secret`: ChatKit client secret for frontend initialization
- `session_id`: Unique session identifier
- `user_id`: Authenticated user ID (for validation)
- `expires_at`: Session expiration timestamp

**Error Responses**:

**401 Unauthorized**:
```json
{
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "No authentication token provided"
  }
}
```

**403 Forbidden**:
```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Token validation failed"
  }
}
```

**500 Internal Server Error**:
```json
{
  "error": {
    "code": "OPENAI_API_ERROR",
    "message": "Failed to create ChatKit session",
    "details": "OpenAI API key missing or invalid"
  }
}
```

**Implementation Notes**:
- Validates JWT from Authorization header or httpOnly cookie
- Extracts user ID from verified token
- Creates ChatKit session via OpenAI API
- Stores session metadata in database with user isolation
- Returns client secret for frontend ChatKit initialization

### 2. Refresh Session

**Endpoint**: `POST /api/chatkit/refresh`

**Purpose**: Refresh an expired or expiring ChatKit session.

**Authentication**: Required (JWT or httpOnly cookie)

**Request**:
```http
POST /api/chatkit/refresh
Content-Type: application/json
Authorization: Bearer <jwt_token>
# OR
Cookie: auth_token=<httpOnly_cookie>
```

**Request Body**:
```json
{
  "current_token": "sk-chatkit-prod_old_token..."
}
```

**Success Response (200 OK)**:
```json
{
  "client_secret": "sk-chatkit-prod_new_token...",
  "session_id": "session_new_xyz789",
  "user_id": "user_123",
  "expires_at": "2026-01-16T12:30:00Z"
}
```

**Error Responses**:

**400 Bad Request**:
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "current_token is required"
  }
}
```

**401 Unauthorized**:
```json
{
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authentication required"
  }
}
```

**404 Not Found**:
```json
{
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "Session does not exist or has expired"
  }
}
```

**500 Internal Server Error**:
```json
{
  "error": {
    "code": "OPENAI_API_ERROR",
    "message": "Failed to refresh ChatKit session"
  }
}
```

**Implementation Notes**:
- Validates current token format
- Checks session exists and belongs to authenticated user
- Creates new session via OpenAI API
- Invalidates old session if possible
- Returns new client secret

### 3. Get Session Info (Optional)

**Endpoint**: `GET /api/chatkit/session/{session_id}`

**Purpose**: Retrieve session metadata (useful for debugging/admin).

**Authentication**: Required (user must own the session)

**Request**:
```http
GET /api/chatkit/session/session_xyz789
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK)**:
```json
{
  "session_id": "session_xyz789",
  "user_id": "user_123",
  "status": "active",
  "created_at": "2026-01-16T10:30:00Z",
  "expires_at": "2026-01-16T11:30:00Z",
  "metadata": {
    "model": "gpt-4o",
    "user_context": {
      "id": "user_123",
      "name": "John Doe"
    }
  }
}
```

**Error Responses**:

**403 Forbidden**:
```json
{
  "error": {
    "code": "ACCESS_DENIED",
    "message": "Session does not belong to user"
  }
}
```

**404 Not Found**:
```json
{
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "Session not found"
  }
}
```

## OpenAPI Schema

```yaml
openapi: 3.0.0
info:
  title: ChatKit Session API
  version: 1.0.0
  description: Session management for OpenAI ChatKit integration

paths:
  /api/chatkit/session:
    post:
      summary: Create ChatKit session
      security:
        - bearerAuth: []
        - cookieAuth: []
      responses:
        '200':
          description: Session created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  client_secret:
                    type: string
                    description: ChatKit client secret
                  session_id:
                    type: string
                    description: Session identifier
                  user_id:
                    type: string
                    description: Authenticated user ID
                  expires_at:
                    type: string
                    format: date-time
                    description: Session expiration
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/ServerError'

  /api/chatkit/refresh:
    post:
      summary: Refresh ChatKit session
      security:
        - bearerAuth: []
        - cookieAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                current_token:
                  type: string
                  description: Current client secret
              required: [current_token]
      responses:
        '200':
          description: Session refreshed successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SessionResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/ServerError'

components:
  schemas:
    SessionResponse:
      type: object
      properties:
        client_secret:
          type: string
        session_id:
          type: string
        user_id:
          type: string
        expires_at:
          type: string
          format: date-time

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    cookieAuth:
      type: apiKey
      in: cookie
      name: auth_token

  responses:
    Unauthorized:
      description: Authentication required or failed
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: object
                properties:
                  code:
                    type: string
                    enum: [UNAUTHENTICATED, INVALID_TOKEN]
                  message:
                    type: string
    BadRequest:
      description: Bad request
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: object
                properties:
                  code:
                    type: string
                    enum: [INVALID_REQUEST]
                  message:
                    type: string
    ServerError:
      description: Internal server error
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: object
                properties:
                  code:
                    type: string
                    enum: [OPENAI_API_ERROR, DATABASE_ERROR]
                  message:
                    type: string
                  details:
                    type: string
```

## Implementation Examples

### FastAPI Implementation

```python
# backend/src/backend/main.py
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import openai
import os
from typing import Optional

app = FastAPI()
security = HTTPBearer()

# Initialize OpenAI client
openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def verify_auth(request: Request, credentials: Optional[HTTPAuthorizationCredentials] = None):
    """Verify JWT from header or httpOnly cookie"""
    # Your existing Better Auth verification logic
    token = None
    if credentials:
        token = credentials.credentials
    else:
        # Try to get from cookies
        token = request.cookies.get("auth_token")

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Verify JWT and return user_id
    user_id = verify_jwt_token(token)  # Your existing function
    return user_id

@app.post("/api/chatkit/session")
async def create_session(
    request: Request,
    user_id: str = Depends(verify_auth)
):
    """Create ChatKit session"""
    try:
        # Create session via OpenAI API
        session = openai_client.chatkit.sessions.create(
            model="gpt-4o",
            metadata={
                "user_id": user_id,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        )

        # Store session metadata in database (user-isolated)
        await store_session_metadata(
            session_id=session.id,
            user_id=user_id,
            client_secret=session.client_secret,
            expires_at=session.expires_at
        )

        return {
            "client_secret": session.client_secret,
            "session_id": session.id,
            "user_id": user_id,
            "expires_at": session.expires_at
        }

    except openai.OpenAIError as e:
        raise HTTPException(
            status_code=500,
            detail={
                "code": "OPENAI_API_ERROR",
                "message": f"Failed to create session: {str(e)}"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "code": "INTERNAL_ERROR",
                "message": str(e)
            }
        )

@app.post("/api/chatkit/refresh")
async def refresh_session(
    request: Request,
    refresh_data: dict,
    user_id: str = Depends(verify_auth)
):
    """Refresh ChatKit session"""
    current_token = refresh_data.get("current_token")

    if not current_token:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "INVALID_REQUEST",
                "message": "current_token is required"
            }
        )

    try:
        # Verify current session exists and belongs to user
        existing_session = await get_session_metadata(current_token)
        if not existing_session or existing_session.user_id != user_id:
            raise HTTPException(
                status_code=404,
                detail={
                    "code": "SESSION_NOT_FOUND",
                    "message": "Session not found or access denied"
                }
            )

        # Create new session
        session = openai_client.chatkit.sessions.create(
            model="gpt-4o",
            metadata={
                "user_id": user_id,
                "refreshed_from": existing_session.session_id,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        )

        # Store new session metadata
        await store_session_metadata(
            session_id=session.id,
            user_id=user_id,
            client_secret=session.client_secret,
            expires_at=session.expires_at
        )

        return {
            "client_secret": session.client_secret,
            "session_id": session.id,
            "user_id": user_id,
            "expires_at": session.expires_at
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "code": "OPENAI_API_ERROR",
                "message": f"Failed to refresh session: {str(e)}"
            }
        )
```

### Next.js API Route Implementation

```typescript
// frontend/src/app/api/chatkit/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/server';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHENTICATED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    // Call backend session endpoint
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/chatkit/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
      credentials: 'include',
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

// frontend/src/app/api/chatkit/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/server';

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHENTICATED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';

    const response = await fetch(`${backendUrl}/api/chatkit/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
      body: JSON.stringify(body),
      credentials: 'include',
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

## Frontend Integration

### React Hook Implementation

```typescript
// frontend/src/lib/chatkit/session.ts
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

### ChatKit Widget Integration

```typescript
// frontend/src/components/chat/ChatKitWidget.tsx
'use client';

import { useChatKit } from '@openai/chatkit-react';
import { createChatKitSession, refreshChatKitSession } from '@/lib/chatkit/session';
import { useEffect, useState } from 'react';

export function ChatKitWidget() {
  const [sessionError, setSessionError] = useState<string | null>(null);

  const { control } = useChatKit({
    api: {
      getClientSecret: async (existing) => {
        try {
          if (existing) {
            // Try to refresh existing token
            const refreshed = await refreshChatKitSession(existing);
            return refreshed.client_secret;
          }

          // Create new session
          const session = await createChatKitSession();
          return session.client_secret;

        } catch (error) {
          setSessionError(error instanceof Error ? error.message : 'Session failed');
          throw error;
        }
      },
      fetch: async (url, options) => {
        // Add user context to all requests
        const modifiedOptions = {
          ...options,
          credentials: 'include' as const,
          headers: {
            ...options?.headers,
            'Content-Type': 'application/json',
          },
        };

        return fetch(url, modifiedOptions);
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
      {/* @ts-ignore - ChatKit types may need adjustment */}
      <ChatKit control={control} />
    </div>
  );
}
```

## Error Handling Strategy

### Session Creation Failures

1. **Missing OPENAI_API_KEY**: Return clear error message
2. **Invalid JWT**: Return 401 with specific error code
3. **Network Issues**: Retry with exponential backoff
4. **Rate Limiting**: Return 429 with retry-after header

### Token Refresh Strategy

```typescript
// Automatic refresh on expiration
const { control } = useChatKit({
  api: {
    getClientSecret: async (existing) => {
      if (existing) {
        try {
          return await refreshChatKitSession(existing);
        } catch (error) {
          // If refresh fails, create new session
          console.warn('Token refresh failed, creating new session');
          const session = await createChatKitSession();
          return session.client_secret;
        }
      }
      return await createChatKitSession();
    },
  },
});
```

## Security Considerations

### Token Storage
- ✅ **Never** store client secrets in localStorage
- ✅ Use in-memory storage for session tokens
- ✅ Refresh tokens automatically before expiration
- ✅ Clear tokens on logout

### CORS Configuration
```python
# Backend CORS settings
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://yourapp.com",
        "https://www.yourapp.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Rate Limiting
```python
# Add rate limiting to session endpoints
from slowapi import Limiter

limiter = Limiter(key_func=lambda: request.client.host)

@app.post("/api/chatkit/session")
@limiter.limit("10/minute")
async def create_session(request: Request, user_id: str = Depends(verify_auth)):
    # Implementation
    pass
```

## Testing

### Unit Tests

```python
# Test session creation
def test_create_session_success(client, auth_token):
    response = client.post(
        "/api/chatkit/session",
        cookies={"auth_token": auth_token}
    )
    assert response.status_code == 200
    data = response.json()
    assert "client_secret" in data
    assert "session_id" in data
    assert data["user_id"] == "user_123"

def test_create_session_unauthorized(client):
    response = client.post("/api/chatkit/session")
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHENTICATED"
```

### Integration Tests

```typescript
// Test session flow
test('complete session lifecycle', async () => {
  // Create session
  const session = await createChatKitSession();
  expect(session.client_secret).toBeDefined();

  // Refresh session
  const refreshed = await refreshChatKitSession(session.client_secret);
  expect(refreshed.client_secret).not.toBe(session.client_secret);

  // Verify new token works
  expect(refreshed.session_id).toBeDefined();
});
```

## Deployment Checklist

- [ ] Set `OPENAI_API_KEY` environment variable
- [ ] Configure CORS origins for production domains
- [ ] Add domain allowlist in OpenAI Platform dashboard
- [ ] Set up rate limiting for session endpoints
- [ ] Configure monitoring for session creation failures
- [ ] Add logging for security auditing
- [ ] Test in staging environment
- [ ] Update API documentation

---

**Status**: ✅ Ready for Implementation
**Next**: Implement backend session endpoints and frontend integration