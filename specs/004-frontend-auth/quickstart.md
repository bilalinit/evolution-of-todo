# Quickstart Guide: Better Auth Server Implementation

**Feature**: 004-frontend-auth
**Date**: 2025-12-30
**Status**: Phase 1 Quickstart

---

## Prerequisites

- Node.js 18+ installed
- Neon PostgreSQL database (connection string)
- Existing Next.js frontend in `phase-2/frontend/`

---

## Step 1: Install Dependencies

Navigate to the frontend directory and install required packages:

```bash
cd phase-2/frontend
npm install pg @better-auth/pg
```

**What this does**:
- `pg`: PostgreSQL client for Node.js
- `@better-auth/pg`: Better Auth's official PostgreSQL adapter

---

## Step 2: Configure Environment Variables

Create or update `.env.local` in `phase-2/frontend/`:

```bash
# Database Connection (Required)
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"

# Better Auth Secret (Required - minimum 32 characters)
BETTER_AUTH_SECRET="your-32-character-minimum-secret-key-here"

# Demo Mode (Optional - set to false for production)
NEXT_PUBLIC_DEMO_MODE=false
```

**Generate a secure secret**:
```bash
# Linux/macOS
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 3: Create Better Auth Server Configuration

Create `phase-2/frontend/src/lib/auth/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { pgAdapter } from "@better-auth/pg";
import { Pool } from "pg";

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Create Better Auth instance
export const auth = betterAuth({
  database: pgAdapter(pool),

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false // Can be enabled later
  },

  // Session configuration
  secret: process.env.BETTER_AUTH_SECRET,

  // Additional options for Next.js compatibility
  trustedOrigins: [
    "http://localhost:3000",
    "https://yourdomain.com"
  ],
});
```

---

## Step 4: Update API Route

Replace the content of `phase-2/frontend/src/app/api/auth/[...all]/route.ts`:

```typescript
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/auth";

export const GET = toNextJsHandler(auth);
export const POST = toNextJsHandler(auth);
```

**What changed**:
- Removed proxy logic to backend
- Added Better Auth's Next.js handler
- All auth endpoints now handled locally

---

## Step 5: Update Auth Client

Modify `phase-2/frontend/src/lib/auth/auth-client.ts`:

**Change the baseURL** (line 13):

```typescript
// BEFORE
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

// AFTER
export const authClient = createAuthClient({
  baseURL: "", // Uses same origin
});
```

**Keep everything else** - all existing functions work unchanged.

---

## Step 6: Start Development Server

```bash
npm run dev
```

**Expected output**:
```
✓ Ready in 3.2s
○ Compiling / ...
✓ Compiled / in 2s
```

---

## Step 7: Test Authentication

### Test 1: User Registration
1. Navigate to `http://localhost:3000/signup`
2. Enter test credentials:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
3. Click "Sign Up"
4. **Expected**: Redirected to `/tasks`, logged in

### Test 2: User Login
1. Sign out if logged in
2. Navigate to `http://localhost:3000/login`
3. Enter credentials from Test 1
4. Click "Sign In"
5. **Expected**: Redirected to `/tasks`, logged in

### Test 3: Session Persistence
1. While logged in, refresh the page (F5)
2. **Expected**: User remains logged in

### Test 4: Sign Out
1. While logged in, click "Sign Out"
2. **Expected**: Redirected to home page, no longer authenticated

---

## Step 8: Verify Database

Connect to Neon PostgreSQL and verify:

```sql
-- Check tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user', 'session', 'account', 'verification');

-- Check test user was created
SELECT id, name, email, email_verified FROM "user";
```

**Expected**: 4 tables exist, test user in `user` table

---

## Troubleshooting

### Error: "Database connection failed"
**Solution**: Verify `DATABASE_URL` format and SSL mode:
```
postgresql://user:pass@host:5432/db?sslmode=require
```

### Error: "Better Auth secret too short"
**Solution**: Generate a secret with minimum 32 characters:
```bash
openssl rand -base64 32
```

### Error: "Module not found: @better-auth/pg"
**Solution**: Ensure packages are installed:
```bash
npm install pg @better-auth/pg
```

### Error: "Session not persisting"
**Solution**: Check that `BETTER_AUTH_SECRET` is set in `.env.local`

### Demo mode still active
**Solution**: Set `NEXT_PUBLIC_DEMO_MODE=false` in `.env.local` and restart dev server

---

## Production Deployment

### Environment Variables
```bash
# Production .env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"
BETTER_AUTH_SECRET="very-long-random-secure-string-min-32-chars"
NEXT_PUBLIC_DEMO_MODE=false
```

### Build & Start
```bash
npm run build
npm start
```

### Database Migrations
Better Auth handles its own schema automatically. For application-specific tables (tasks, projects), use SQLModel migrations.

---

## Security Checklist

- [ ] `BETTER_AUTH_SECRET` is minimum 32 characters
- [ ] `.env.local` is in `.gitignore`
- [ ] `DATABASE_URL` uses SSL mode
- [ ] Demo mode disabled in production
- [ ] HTTPS in production
- [ ] Rate limiting enabled (Better Auth default)

---

## Next Steps

1. **Enable Email Verification**: Set `requireEmailVerification: true`
2. **Add OAuth Providers**: Google, GitHub, etc.
3. **Implement 2FA**: Better Auth supports TOTP
4. **Password Reset**: Built-in functionality available
5. **Audit Logging**: Use Better Auth hooks

---

## Rollback Instructions

If you need to revert to the proxy setup:

1. **Restore API Route**:
```typescript
// Original proxy implementation
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  // ... proxy logic
}
```

2. **Restore Client baseURL**:
```typescript
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});
```

3. **Remove packages**:
```bash
npm uninstall pg @better-auth/pg
```

4. **Auth falls back to demo mode or external backend**

---

## Support

For issues with:
- **Better Auth**: Check https://better-auth.com/docs
- **Neon PostgreSQL**: Check https://neon.tech/docs
- **Next.js**: Check https://nextjs.org/docs

**Remember**: This implementation maintains full compatibility with existing UI components and hooks. No changes needed to login/signup forms or auth hooks.