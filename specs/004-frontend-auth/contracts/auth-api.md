# Authentication API Contracts

**Feature**: 004-frontend-auth
**Date**: 2025-12-30
**Status**: Phase 1 API Contracts

---

## Overview

This document defines the API contracts for the Better Auth server implementation. All endpoints are served from `/api/auth/*` within the Next.js application.

---

## Base URL
```
/api/auth
```

---

## Endpoints

### 1. User Registration (Sign Up)

**Endpoint**: `POST /api/auth/sign-up/email`

**Purpose**: Create a new user account

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation**:
- `name`: 2-50 characters, required
- `email`: Valid email format, unique, required
- `password`: Minimum 8 characters, required

**Success Response** (201 Created):
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": false,
    "createdAt": "2025-12-30T21:30:00.000Z",
    "updatedAt": "2025-12-30T21:30:00.000Z"
  },
  "session": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-01-06T21:30:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Email already exists
- `500 Internal Server Error`: Server error

**Client Usage**:
```typescript
import { signUp } from "@/lib/auth/auth-client";

const result = await signUp("John Doe", "john@example.com", "securePassword123");
```

---

### 2. User Login (Sign In)

**Endpoint**: `POST /api/auth/sign-in/email`

**Purpose**: Authenticate existing user

**Request**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation**:
- `email`: Valid email format, required
- `password`: Minimum 8 characters, required

**Success Response** (200 OK):
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": true,
    "createdAt": "2025-12-30T21:30:00.000Z",
    "updatedAt": "2025-12-30T21:30:00.000Z"
  },
  "session": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-01-06T21:30:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid credentials
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

**Client Usage**:
```typescript
import { signIn } from "@/lib/auth/auth-client";

const result = await signIn("john@example.com", "securePassword123");
```

---

### 3. Get Current Session

**Endpoint**: `GET /api/auth/session`

**Purpose**: Retrieve current authenticated session

**Headers**:
```
Cookie: better-auth.session_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response** (200 OK):
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": true,
    "createdAt": "2025-12-30T21:30:00.000Z",
    "updatedAt": "2025-12-30T21:30:00.000Z"
  },
  "session": {
    "id": "789e4567-e89b-12d3-a456-426614174000",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-01-06T21:30:00.000Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: No valid session
- `404 Not Found`: Session expired or invalid

**Client Usage**:
```typescript
import { getSession } from "@/lib/auth/auth-client";

const session = await getSession();
```

---

### 4. Sign Out

**Endpoint**: `POST /api/auth/sign-out`

**Purpose**: Terminate current session

**Headers**:
```
Cookie: better-auth.session_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response** (200 OK):
```json
{
  "message": "Signed out successfully"
}
```

**Cookie Behavior**:
- Session cookie is cleared
- Session record is deleted from database

**Client Usage**:
```typescript
import { signOut } from "@/lib/auth/auth-client";

await signOut();
```

---

### 5. Verify Email

**Endpoint**: `GET /api/auth/verify-email`

**Purpose**: Verify user's email address

**Query Parameters**:
```
?token=verification-token-here
```

**Success Response** (200 OK):
```json
{
  "message": "Email verified successfully",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john@example.com",
    "emailVerified": true
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing or invalid token
- `404 Not Found`: Token expired or not found
- `500 Internal Server Error`: Server error

---

### 6. Forgot Password

**Endpoint**: `POST /api/auth/forgot-password`

**Purpose**: Request password reset email

**Request**:
```json
{
  "email": "john@example.com"
}
```

**Success Response** (200 OK):
```json
{
  "message": "Password reset email sent"
}
```

**Note**: This endpoint is available but not required for initial implementation.

---

### 7. Reset Password

**Endpoint**: `POST /api/auth/reset-password`

**Purpose**: Reset password using verification token

**Request**:
```json
{
  "token": "reset-token-here",
  "password": "newSecurePassword123"
}
```

**Success Response** (200 OK):
```json
{
  "message": "Password reset successfully"
}
```

**Note**: This endpoint is available but not required for initial implementation.

---

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `200` | OK | Successful operation |
| `201` | Created | User created successfully |
| `400` | Bad Request | Invalid input data |
| `401` | Unauthorized | Invalid or missing credentials |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | User/session not found |
| `409` | Conflict | Resource already exists |
| `500` | Internal Server Error | Server error |

---

## Response Headers

### Authentication Headers
```
Set-Cookie: better-auth.session_token=<token>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800
```

### Security Headers
```
Content-Type: application/json
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
```

---

## Error Response Format

**Standard Error**:
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "The email or password you entered is incorrect",
    "details": {
      "field": "password",
      "issue": "min_length"
    }
  }
}
```

**Validation Error**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "issue": "invalid_format",
        "message": "Must be a valid email address"
      },
      {
        "field": "password",
        "issue": "min_length",
        "message": "Must be at least 8 characters"
      }
    ]
  }
}
```

---

## Authentication Flow Diagrams

### Registration Flow
```
Client → POST /api/auth/sign-up/email
    ↓
Better Auth → Validate Input
    ↓
Better Auth → Create User + Account
    ↓
Better Auth → Generate Session
    ↓
Better Auth → Set Cookie
    ↓
Client ← 201 + User + Session
```

### Login Flow
```
Client → POST /api/auth/sign-in/email
    ↓
Better Auth → Validate Credentials
    ↓
Better Auth → Create Session
    ↓
Better Auth → Set Cookie
    ↓
Client ← 200 + User + Session
```

### Session Validation Flow
```
Client → GET /api/auth/session (with cookie)
    ↓
Better Auth → Validate Token
    ↓
Better Auth → Check Expiration
    ↓
Better Auth → Return User
    ↓
Client ← 200 + User + Session
```

---

## Integration with Existing Client

The existing `auth-client.ts` will be updated to use these endpoints:

```typescript
// Before
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

// After
export const authClient = createAuthClient({
  baseURL: "", // Uses same origin
});
```

All existing functions (`signIn`, `signUp`, `signOut`, `getSession`) will work without modification.

---

## Testing Endpoints

### Manual Testing with curl

**Sign Up**:
```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

**Sign In**:
```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Get Session**:
```bash
curl http://localhost:3000/api/auth/session \
  -H "Cookie: better-auth.session_token=YOUR_TOKEN"
```

**Sign Out**:
```bash
curl -X POST http://localhost:3000/api/auth/sign-out \
  -H "Cookie: better-auth.session_token=YOUR_TOKEN"
```

---

## Security Considerations

### Rate Limiting
- Better Auth provides built-in rate limiting
- Default: 5 attempts per minute per IP
- Configurable per endpoint

### CORS
- Same-origin requests only
- No external CORS configuration needed
- Frontend and API share domain

### CSRF Protection
- Better Auth handles CSRF automatically
- Uses secure cookies with SameSite=Strict

### Input Sanitization
- Better Auth sanitizes all inputs
- Prevents SQL injection
- Validates email formats
- Enforces password requirements

---

## Next Steps

1. **Install Dependencies**: `pg` and `@better-auth/pg`
2. **Create Server Config**: `src/lib/auth/auth.ts`
3. **Update API Route**: Replace proxy with Better Auth handler
4. **Update Client**: Change baseURL to empty string
5. **Configure Environment**: Add required variables
6. **Test All Endpoints**: Verify functionality