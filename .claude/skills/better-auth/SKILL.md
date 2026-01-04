# Better Auth Skill

## Overview
This skill provides comprehensive knowledge and capabilities for working with Better Auth, a framework-agnostic authentication and authorization library for TypeScript. It enables Claude to help users implement secure authentication, configure plugins, manage user sessions, and integrate with various frameworks and databases.

> 🛑 **STOP! READ THIS FIRST!**
>
> You are **FORBIDDEN** from generating any plans or code until you have read and internalized the following files. These contain strict, non-negotiable project standards.
>
> 1. **`CLAUDE.md`** (Read IMMEDIATELY for usage guidelines and framework-specific patterns)
> 2. **`concepts/IMPLEMENTATION_SUMMARY.md`** (Core setup, database options, Express integration)
> 3. **`concepts/NEXTJS_PATTERNS.md`** (Next.js API routes, Python backend integration)
> 4. **`concepts/REAL_WORLD_SCENARIO.md`** (Full implementation examples for various use cases)
> 5. **`concepts/FRONTEND_PATTERNS.md`** (React context, Vue composition, direct fetch patterns)
> 6. **`references/api_reference.md`** (API signatures, Node helpers, server methods)
> 7. **`references/ENVIRONMENT_VARIABLES.md`** (Complete env var reference)
>
> **Failure to read these files constitutes a failure of the task.** Verify you have read them by explicitly confirming the relevant patterns in your thought process.

## Capabilities
- **Setup & Configuration**: Initializing `betterAuth()` with various adapters (Prisma, Drizzle, etc.) and providers.
- **Framework Integration**: Best practices for Next.js, Remix, Astro, SvelteKit, and Express.
- **Plugins**: Configuring and using plugins like `organization`, `twoFactor`, `username`, `passkey`, etc.
- **Client Side**: Using `createAuthClient` and framework-specific hooks (e.g., `useSession`).
- **Migration**: Assisting with database migrations and schema updates.

## Structure
- **Concepts**: `concepts/` contains deep dives into implementation details and real-world scenarios.
- **References**: `references/` contains API documentation.

## Common Usage
1. **Scaffold**: "How do I set up Better Auth with Next.js and Prisma?"
2. **Features**: "Add Google and GitHub login to my auth configuration."
3. **Plugins**: "How do I enable the organization plugin?"
4. **Debugging**: "Why is my session not persisting?"

## Reference
See `references/api_reference.md` for detailed API signatures.