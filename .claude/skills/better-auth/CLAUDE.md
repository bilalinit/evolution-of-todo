# Better Auth for Claude

## When to Use This Skill
Use this skill when users ask about:
- **Authentication Setup**: Implementing Better Auth in any supported framework.
- **Configuration**: Setting up providers, adapters, and plugins.
- **Express/Node.js Integration**: Using `toNodeHandler` and `fromNodeHeaders`.
- **Frontend Integration**: Direct fetch patterns, React context, Vue composition.
- **Debugging**: Resolving auth errors, session issues, or type errors.
- **Best Practices**: Security, session management, and architecture.

## How to Respond
1. **Identify Framework**: Check if the user is using Next.js, Express, Remix, Astro, etc., and tailor the response.
2. **Check Integration Type**: Is the frontend separate from backend? If yes, see `concepts/FRONTEND_PATTERNS.md`.
3. **Check Plugins**: If the user asks for advanced features (Teams, MFA), suggest the appropriate Better Auth plugin.
4. **Use Standard Patterns**: Provide code snippets that follow the patterns in this skill.

## Key Concepts
- **Server Instance**: `betterAuth({ ... })` - The core server-side configuration.
- **Client Instance**: `createAuthClient({ ... })` - The client-side interaction layer (Next.js only).
- **Direct Fetch**: For separate frontends, use direct fetch with `credentials: 'include'`.
- **Secret Management**: Always remind users to set `BETTER_AUTH_SECRET` and provider secrets.
- **Database**: Better Auth supports pg.Pool, SQLite, Prisma, and URL-based connections.

## Framework-Specific Guidance

### Next.js
- Use `auth.handler` for API routes
- Use `auth.middleware` for middleware

### Express/Node.js
- Use `toNodeHandler(auth)` for mounting routes
- Use `fromNodeHeaders(req.headers)` for session verification
- CORS must be before auth handler, body parsers after

### Separate Frontend (React/Vue/Docusaurus)
- Use direct fetch with `credentials: 'include'`
- See `concepts/FRONTEND_PATTERNS.md` for context patterns

## Common Mistakes to Watch For
- Missing `credentials: 'include'` in frontend fetch calls.
- Wrong middleware order in Express (CORS → auth → body parsers).
- Using `account.additionalFields` instead of `user.additionalFields` (v1 API).
- Forgetting to run migrations (`npx @better-auth/cli migrate`) after schema changes.

## File Reference
- `concepts/IMPLEMENTATION_SUMMARY.md` - Core setup patterns
- `concepts/NEXTJS_PATTERNS.md` - Next.js API routes + Python backend
- `concepts/REAL_WORLD_SCENARIO.md` - Full implementation examples
- `concepts/FRONTEND_PATTERNS.md` - React/Vue frontend patterns
- `references/api_reference.md` - API signatures and helpers
- `references/ENVIRONMENT_VARIABLES.md` - Complete env var reference

## Refusal Criteria
- Do not invent non-existent plugins.
- Do not suggest deprecated internal APIs if a stable public API exists.
- Do not suggest `createAuthClient` for separate frontends (use direct fetch).