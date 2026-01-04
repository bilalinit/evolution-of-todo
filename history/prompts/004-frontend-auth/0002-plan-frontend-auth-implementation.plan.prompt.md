---
id: 0002
title: Plan frontend auth implementation
stage: plan
date: 2025-12-30
surface: agent
model: claude-sonnet-4-5
feature: 004-frontend-auth
branch: 004-frontend-auth
user: User
command: /sp.plan # Implementation Plan: Frontend Better Auth Server Integration

---

## Summary

This plan converts the existing auth API route from a backend proxy to a fully functional Better Auth server running within the Next.js application. The implementation adds server-side Better Auth configuration, database connection, and updates the client configuration to use local API routes.

## Current State Analysis

### What Exists
- Better Auth client library (`better-auth` v1.4.9) installed
- Auth client configured in `src/lib/auth/auth-client.ts` pointing to external backend
- Auth hooks in `src/lib/auth/hooks.ts` using the client
- API route at `src/app/api/auth/[...all]/route.ts` that proxies to backend
- Login and signup UI components working with the auth client
- Demo mode with mock authentication data

### What Needs to Change
- Replace proxy API route with actual Better Auth server handler
- Create Better Auth server configuration with database connection
- Install `pg` package for PostgreSQL connection
- Update auth client to use same-origin (local) API routes
- Add required environment variables for database and secrets

---

## Implementation Phases

### Phase 0: Research & Analysis ✅ COMPLETE
**Duration**: ~30 minutes
**Output**: `research.md`

**Completed Tasks**:
- ✅ Better Auth + Next.js integration patterns
- ✅ Neon PostgreSQL connection requirements
- ✅ Database adapter selection (`@better-auth/pg`)
- ✅ Environment variable strategy
- ✅ API route handler patterns
- ✅ Client configuration updates
- ✅ Demo mode compatibility
- ✅ Security considerations

**Key Decisions**:
- Use `@better-auth/pg` adapter for Neon
- Update client baseURL to empty string
- Use `toNextJsHandler()` for API routes
- Maintain client-side demo mode
- Let Better Auth manage schema automatically

### Phase 1: Design & Contracts ✅ COMPLETE
**Duration**: ~45 minutes
**Outputs**: `data-model.md`, `contracts/`, `quickstart.md`

**Completed Tasks**:
- ✅ Data model documentation (Better Auth tables)
- ✅ Entity relationship diagrams
- ✅ API contract specifications
- ✅ Validation rules
- ✅ Security considerations
- ✅ Quickstart guide
- ✅ Troubleshooting section

**Key Deliverables**:
- Complete API endpoint specifications
- Database schema documentation
- Step-by-step setup instructions
- Rollback procedures

### Phase 2: Implementation ⏳ PENDING
**Duration**: ~2-3 hours
**Output**: `tasks.md` (created by `/sp.tasks`)

**Planned Tasks**:
1. Install dependencies: `pg` and `@better-auth/pg`
2. Create server configuration: `src/lib/auth/auth.ts`
3. Update API route: Replace proxy with `toNextJsHandler(auth)`
4. Update client config: Change baseURL to empty string
5. Configure environment: Add DATABASE_URL and BETTER_AUTH_SECRET
6. Manual testing: All auth flows

### Phase 3: Testing & Validation ⏳ PENDING
**Duration**: ~1-2 hours
**Test Cases**: 8 comprehensive test scenarios
**Validation Criteria**: Performance, compatibility, security metrics

---

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16.1.1 (App Router), Node.js 18+
**Primary Dependencies**:
- `better-auth` v1.4.9 (auth library)
- `pg` vlatest (PostgreSQL client)
- `@better-auth/pg` vlatest (Better Auth PostgreSQL adapter)

**Storage**: Neon PostgreSQL (serverless) via Better Auth adapter
**Target Platform**: Web application (Next.js 16+ App Router)
**Performance Goals**: Authentication operations <2 seconds, 100 concurrent requests

---

## Constitution Check ✅ PASS

All 5 constitutional principles satisfied:
- **I. Universal Logic Decoupling**: Auth logic in Better Auth library
- **II. AI-Native Interoperability**: Stateless HTTP API endpoints
- **III. Strict Statelessness**: All state in Neon PostgreSQL
- **IV. Event-Driven Decoupling**: Auth ops synchronous (security requirement)
- **V. Zero-Trust Multi-Tenancy**: Row-level security enforced

No violations detected. No complexity tracking required.

---

## Files Created/Modified

### Created:
- `specs/004-frontend-auth/research.md` - Phase 0 research
- `specs/004-frontend-auth/data-model.md` - Database schema
- `specs/004-frontend-auth/contracts/auth-api.md` - API specifications
- `specs/004-frontend-auth/quickstart.md` - Setup guide
- `specs/004-frontend-auth/plan.md` - This implementation plan

### To Be Modified (Phase 2):
- `phase-2/frontend/src/lib/auth/auth.ts` - NEW: Server config
- `phase-2/frontend/src/app/api/auth/[...all]/route.ts` - Replace proxy
- `phase-2/frontend/src/lib/auth/auth-client.ts` - Update baseURL
- `phase-2/frontend/package.json` - Add dependencies
- `phase-2/frontend/.env.local` - Add environment variables

### Unchanged:
- `src/lib/auth/hooks.ts` - Uses auth-client
- Login/Signup components - Use hooks
- Type definitions - Remain valid

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Database connection failure | Medium | High | Validate connection string, test SSL |
| Missing environment variables | Low | High | Clear error messages, comprehensive guide |
| Breaking existing auth hooks | Low | Medium | Maintain client compatibility |
| Better Auth config errors | Medium | Medium | Follow official docs, test each step |
| SSL connection issues | Medium | Medium | Use both connection string and pool SSL |

---

## Rollback Plan (3 minutes)

1. Restore API route: `git checkout phase-2/frontend/src/app/api/auth/[...all]/route.ts`
2. Restore client config: `git checkout phase-2/frontend/src/lib/auth/auth-client.ts`
3. Remove packages: `npm uninstall pg @better-auth/pg`
4. Clean environment: Remove DATABASE_URL and BETTER_AUTH_SECRET
5. Verify fallback: Demo mode or external backend restored

**Data loss risk**: None

---

## Success Metrics

### Technical
- ✅ Zero TypeScript compilation errors
- ✅ All auth operations <2 seconds
- ✅ 100 concurrent user support
- ✅ 99.9% uptime for auth endpoints

### User Experience
- ✅ Registration success rate >95%
- ✅ Login success rate >98%
- ✅ Session persistence across restarts
- ✅ No UI component changes required

### Security
- ✅ Passwords properly hashed
- ✅ HTTP-only, SameSite=Strict cookies
- ✅ No secrets in code
- ✅ Row-level security enforced

---

## Next Steps

1. **Execute Phase 2**: Run `/sp.tasks` to generate detailed implementation tasks
2. **Install packages**: Add `pg` and `@better-auth/pg` to package.json
3. **Create server config**: Implement `src/lib/auth/auth.ts`
4. **Update API route**: Replace proxy with Better Auth handler
5. **Update client**: Change baseURL to empty string
6. **Configure environment**: Add required variables
7. **Test thoroughly**: Verify all auth flows work correctly

**Status**: Ready for implementation. All Phase 0 and Phase 1 work completed.

## Response snapshot

Successfully completed Phase 0 (Research) and Phase 1 (Design & Contracts) for the frontend Better Auth server integration feature. Created comprehensive documentation including research decisions, data model, API contracts, and quickstart guide. Updated agent context with new technology stack. The implementation plan is ready for Phase 2 execution.

**Key Accomplishments**:
1. ✅ Resolved all technical unknowns through research
2. ✅ Designed complete data model for Better Auth tables
3. ✅ Defined API contracts for all authentication endpoints
4. ✅ Created step-by-step quickstart guide
5. ✅ Validated against constitutional principles (all pass)
6. ✅ Identified risks and mitigation strategies
7. ✅ Defined rollback procedures
8. ✅ Updated agent context with new technology

**Ready for Next Phase**: `/sp.tasks` to generate detailed implementation tasks

## Outcome

- ✅ Impact: High - Enables complete authentication functionality for frontend application
- 🧪 Tests: All constitutional gates passed, 8 test scenarios defined
- 📁 Files: 5 specification files created, 5 files to be modified in Phase 2
- 🔁 Next prompts: /sp.tasks (Phase 2 implementation)
- 🧠 Reflection: Comprehensive planning completed. All requirements captured. Ready for implementation.

## Evaluation notes (flywheel)

- Failure modes observed: None - all requirements clear
- Graders run and results (PASS/FAIL): PASS (constitutional check + completeness)
- Prompt variant: Standard plan workflow
- Next experiment: Execute Phase 2 implementation tasks
