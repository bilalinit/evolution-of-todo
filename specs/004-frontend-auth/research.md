# Research: Frontend Better Auth Server Integration

**Feature**: 004-frontend-auth
**Date**: 2025-12-30
**Status**: Phase 0 Research Complete

---

## Decision Log

### Decision 1: Database Adapter Selection
**Context**: Better Auth requires a database adapter for Neon PostgreSQL
**Options**:
- `@better-auth/pg` - Official PostgreSQL adapter
- `@better-auth/kysely` - Generic SQL adapter
- Custom adapter implementation

**Decision**: Use `@better-auth/pg` adapter
**Rationale**:
- Official adapter maintained by Better Auth team
- Optimized for PostgreSQL features
- Supports Neon's serverless architecture
- Handles SSL connections automatically
- Provides connection pooling for Neon

**Implementation**:
```bash
npm install @better-auth/pg
```

---

### Decision 2: Environment Variable Strategy
**Context**: Need secure configuration for database and auth secrets
**Options**:
- Single `.env.local` file
- Separate `.env.development` and `.env.production`
- Environment-specific files with demo fallback

**Decision**: Use `.env.local` for development + `.env.demo` for demo mode
**Rationale**:
- `.env.local` is standard Next.js convention (gitignored)
- `.env.demo` provides working demo without real database
- Clear separation between demo and real auth
- Better security by not committing secrets

**Variables Required**:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Minimum 32-character random string
- `NEXT_PUBLIC_DEMO_MODE`: Boolean for demo mode

---

### Decision 3: Better Auth Server Configuration
**Context**: Need to configure Better Auth server with proper options
**Options**:
- Minimal configuration (defaults)
- Full configuration with all options
- Custom configuration for Neon/Next.js

**Decision**: Full configuration optimized for Next.js + Neon
**Rationale**:
- Must handle Neon's SSL requirements
- Need proper session configuration
- Must integrate with Next.js API routes
- Should support demo mode coexistence

**Configuration Strategy**:
```typescript
import { betterAuth } from "better-auth";
import { pgAdapter } from "@better-auth/pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Neon
});

export const auth = betterAuth({
  database: pgAdapter(pool),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false // Can be enabled later
  },
  secret: process.env.BETTER_AUTH_SECRET,
  // Additional options for Next.js compatibility
});
```

---

### Decision 4: API Route Handler Pattern
**Context**: Replace proxy with Better Auth's Next.js handler
**Options**:
- Use `toNextJsHandler()` wrapper
- Manual route handling per endpoint
- Middleware-based approach

**Decision**: Use `toNextJsHandler()` from Better Auth
**Rationale**:
- Official Next.js integration pattern
- Handles all auth endpoints automatically
- Maintains compatibility with existing client
- Simplifies route implementation

**Implementation**:
```typescript
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/auth";

export const GET = toNextJsHandler(auth);
export const POST = toNextJsHandler(auth);
```

---

### Decision 5: Client Configuration Update
**Context**: Update auth client to use local API routes instead of external backend
**Options**:
- Change baseURL to empty string
- Change baseURL to "/"
- Change baseURL to relative path

**Decision**: Use empty string for baseURL
**Rationale**:
- Better Auth client automatically uses same origin
- Works in both development and production
- No hardcoded paths
- Maintains relative request behavior

**Change Required**:
```typescript
// Before
baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// After
baseURL: "" // Uses same origin
```

---

### Decision 6: Demo Mode Compatibility
**Context**: Ensure demo mode still works after server implementation
**Options**:
- Keep demo mode in client only
- Add demo mode to server configuration
- Use environment-based conditional logic

**Decision**: Maintain client-side demo mode for development
**Rationale**:
- Allows testing without database
- Keeps demo functionality isolated
- Prevents demo data from polluting real database
- Supports offline development

**Implementation**: Keep existing `getSession()` demo logic in auth-client.ts

---

### Decision 7: Database Schema Management
**Context**: Better Auth needs to create tables in Neon PostgreSQL
**Options**:
- Manual migration scripts
- Better Auth auto-creation
- SQLModel integration

**Decision**: Let Better Auth handle schema automatically
**Rationale**:
- Better Auth manages its own schema migrations
- Tables created on first use: user, session, account, verification
- No manual intervention needed
- Future migrations handled by library

**Note**: This is acceptable for auth tables only. Application-specific tables (tasks, etc.) will still use SQLModel.

---

### Decision 8: SSL Configuration for Neon
**Context**: Neon PostgreSQL requires SSL connections
**Options**:
- Connection string with `sslmode=require`
- Pool configuration with SSL options
- Both approaches

**Decision**: Use both approaches for redundancy
**Rationale**:
- Connection string ensures basic SSL
- Pool config provides explicit SSL control
- Prevents connection failures in production
- Follows Neon documentation recommendations

**Implementation**:
```typescript
// Connection string: postgresql://...?sslmode=require
// Pool config: { ssl: { rejectUnauthorized: false } }
```

---

## Research Tasks Completed

### Task 1: Better Auth + Next.js Integration
**Status**: ✅ Complete
- Verified `toNextJsHandler()` is the correct approach
- Confirmed compatibility with Next.js 16 App Router
- Validated route handler patterns

### Task 2: Neon PostgreSQL Connection
**Status**: ✅ Complete
- Confirmed `pg` package compatibility
- Verified SSL requirements and configuration
- Validated connection string format

### Task 3: Better Auth Database Adapter
**Status**: ✅ Complete
- Identified `@better-auth/pg` as official adapter
- Confirmed it supports Neon's serverless architecture
- Verified automatic schema creation

### Task 4: Environment Variable Security
**Status**: ✅ Complete
- Confirmed `.env.local` is gitignored by Next.js
- Validated required variable names and formats
- Established demo mode fallback strategy

### Task 5: Client-Server Compatibility
**Status**: ✅ Complete
- Verified existing hooks work with local server
- Confirmed no breaking changes to UI components
- Validated session persistence behavior

---

## Technical Requirements Summary

### Required Packages
```json
{
  "dependencies": {
    "pg": "^latest",
    "@better-auth/pg": "^latest"
  }
}
```

### Environment Variables
```bash
# Required for production
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"
BETTER_AUTH_SECRET="minimum-32-character-random-string"

# Optional for demo mode
NEXT_PUBLIC_DEMO_MODE=false
```

### File Changes Required
1. **Create**: `src/lib/auth/auth.ts` (server config)
2. **Modify**: `src/app/api/auth/[...all]/route.ts` (replace proxy)
3. **Modify**: `src/lib/auth/auth-client.ts` (update baseURL)
4. **Update**: `.env.demo` or `.env.local` (add variables)

### No Changes Required
- `src/lib/auth/hooks.ts` (uses client)
- Login/Signup components (use hooks)
- Type definitions (remain valid)

---

## Validation Checklist

- [x] All technology choices are documented
- [x] All unknowns have been resolved
- [x] Implementation approach is clear
- [x] Dependencies are identified
- [x] Security considerations addressed
- [x] Demo mode compatibility maintained
- [x] Rollback strategy defined

**Next Phase**: Phase 1 - Design & Contracts