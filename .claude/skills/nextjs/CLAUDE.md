# Next.js for Claude

## When to Use This Skill
Use this skill when users ask to:
- Create or modify Next.js applications.
- implementing routing, layouts, or pages.
- Handle data fetching or mutations.
- Optimize performance or SEO.

## How to Respond

### 1. Default to App Router
**ALWAYS** use the following command to start a new project:
```bash
npx create-next-app@latest frontend \
  --yes \
  --no-react-compiler \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --src-dir \
  --no-import-alias
```
This serves as the standard entry point.

**Note**: This process takes approximately 90 seconds. **ALWAYS** run this command in the background (e.g., using `WaitMsBeforeAsync` or your tool's background capabilities) to avoid blocking.

### 2. Component Architecture
- **Server Components by Default**: Do not use `"use client"` unless the component needs state (`useState`), effects (`useEffect`), or event listeners (`onClick`).
- **Composition**: Pass data from Server Components to Client Components as props.

### 3. Data Fetching
- Use `async/await` directly in Server Components.
- Use `fetch` with caching options for external APIs.
- Use direct DB calls (Prisma/Drizzle) in Server Components.
- **Do NOT** use `useEffect` for initial data fetching.

### 4. Server Actions
- Use Server Actions (`"use server"`) for form submissions and mutations instead of API routes where possible.

## Prohibited Patterns (Unless requested)
- ❌ `getServerSideProps` / `getStaticProps` (Pages Router specific).
- ❌ `pages/` directory for routes.
- ❌ JavaScript (Use TypeScript).

## Best Practices
- Use `next/image` for images.
- Use `next/font` for fonts.
- metadata API for SEO (export `metadata` object).
