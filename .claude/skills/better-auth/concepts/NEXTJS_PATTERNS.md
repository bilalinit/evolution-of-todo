# Next.js Authentication Patterns

## Better Auth in Next.js API Routes

When using Better Auth directly in Next.js (no separate auth server):

### Setup

```typescript
// lib/auth.ts
import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 24 * 60 * 60, // 24 hours
    updateAge: 24 * 60 * 60,
  },
  user: {
    additionalFields: {
      // Custom user fields
      educationLevel: { type: 'string', required: false },
      programmingExperience: { type: 'string', required: false },
    },
  },
});
```

### API Route Handler

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### Client Usage

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

---

## Session Verification for Python Backend

When Next.js handles auth but Python backend needs to verify sessions:

### Option 1: JWT Tokens

```typescript
// In Next.js - generate JWT for Python backend
import jwt from 'jsonwebtoken';

export async function getBackendToken(session) {
  return jwt.sign(
    { userId: session.user.id, email: session.user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}
```

```python
# In Python backend - verify JWT
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def verify_token(credentials = Depends(security)):
    try:
        payload = jwt.decode(
            credentials.credentials,
            os.getenv('JWT_SECRET'),
            algorithms=['HS256']
        )
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### Option 2: Shared Database Session

Both Next.js and Python read from the same Neon database:

```python
# Python backend - verify session from shared DB
async def get_current_user(session_token: str):
    with get_connection() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT u.* FROM "user" u
            JOIN "session" s ON s."userId" = u.id
            WHERE s.token = %s AND s."expiresAt" > NOW()
        """, (session_token,))
        return cursor.fetchone()
```

---

## Architecture: Next.js + Python Backend

```
┌─────────────────────────────────┐
│         Next.js App             │
│  ┌──────────┐  ┌─────────────┐  │
│  │  Pages   │  │ API Routes  │  │────┐
│  │ (React)  │  │ (auth here) │  │    │
│  └──────────┘  └─────────────┘  │    │
└─────────────────────────────────┘    │
           │                           │
           │ API calls                 │ Shared DB
           ▼                           ▼
┌─────────────────────┐     ┌─────────────────┐
│   Python Backend    │────▶│  Neon PostgreSQL │
│   (FastAPI)         │     │  (shared users)  │
└─────────────────────┘     └─────────────────┘
```

---

## Environment Variables

### Next.js (.env.local)
```bash
DATABASE_URL="postgresql://...?sslmode=require"
BETTER_AUTH_SECRET="your-secret-32-chars"
JWT_SECRET="shared-with-python-backend"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_BACKEND_URL="http://localhost:8000"
```

### Python Backend (.env)
```bash
DATABASE_URL="postgresql://...?sslmode=require"
JWT_SECRET="shared-with-nextjs"
FRONTEND_URL="http://localhost:3000"
```
