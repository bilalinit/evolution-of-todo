# Next.js Skill

## Overview
This skill provides expertise in building modern web applications with Next.js, focusing on the App Router architecture, Server Components, and TypeScript.

> 🛑 **STOP! READ THIS FIRST!**
>
> You are **FORBIDDEN** from generating any plans or code until you have read and internalized the following files. These contain strict, non-negotiable project standards.
>
> 1. **`CLAUDE.md`** (Read this IMMEDIATELY for mandatory CLI flags)
> 2. **`concepts/COMMANDS.md`** (Read for usage reference)
> 3. **`concepts/STRUCTURE.md`** (Read for file layout)
>
> **Failure to read these files constitutes a failure of the task.** Verify you have read them by explicitly confirming standard flags in your thought process.

## Capabilities
- **Architecture**: Deep understanding of App Router (`app/` directory), file conventions (`page.tsx`, `layout.tsx`, `loading.tsx`), and routing.
- **Rendering**: expertise in Server Components (RSC) vs Client Components.
- **Data Fetching**: Implementing Async Server Components and Server Actions for data mutation.
- **Styling**: Tailwind CSS integration and CSS Modules.
- **Optimization**: Image, Font, and Script optimization.

## Structure
- **Concepts**: `concepts/` contains reference guides.
- **Commands**: See `concepts/COMMANDS.md` for CLI operations.
- **File Structure**: See `concepts/STRUCTURE.md` for the standard project layout.

## Common Usage
1. **New Project**: "Start a new Next.js app." (Uses strict flags: `src/` dir, no alias, etc.)
2. **Components**: "Create a reusable Card component." (Default to Server Component unless interactivity is needed).
3. **Routing**: "Add a dashboard route with a layout."
4. **Data**: "Fetch data from my database in this page."

## Guidelines
- **App Router**: Always assume App Router unless Pages Router is explicitly requested.
- **TypeScript**: Always use TypeScript.
- **Server Actions**: Use Server Actions for form submissions and mutations.
