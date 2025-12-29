# Phase 2 - Next.js Todo Web Application Frontend

## Overview

This phase contains the Next.js frontend application for the Todo Web Application, built with:

- **Next.js 16+** (App Router)
- **TypeScript 5.x**
- **Tailwind CSS**
- **Modern Technical Editorial Design System**

## Project Structure

```
phase-2/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                # App Router routes
│   │   ├── components/         # React components
│   │   ├── lib/                # Utilities & API
│   │   ├── hooks/              # Custom hooks
│   │   └── types/              # TypeScript definitions
│   ├── public/                 # Static assets
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── package.json
└── README.md
```

## Quick Start

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   BETTER_AUTH_SECRET=your-secret-key
   BETTER_AUTH_URL=http://localhost:3000
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open browser**:
   Navigate to `http://localhost:3000`

## Features

- ✅ User authentication (signup, login, logout)
- ✅ Task CRUD operations (create, read, update, delete)
- ✅ Search and filter capabilities
- ✅ User profile management
- ✅ Optimistic UI updates
- ✅ Modern Technical Editorial design system
- ✅ Responsive design (320px+)

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript compilation
npm run test         # Run tests
```

## API Integration

The frontend expects a backend API at `NEXT_PUBLIC_API_URL` with RESTful endpoints for authentication and task management.

## Documentation

- **Specification**: `specs/003-nextjs-frontend/spec.md`
- **Plan**: `specs/003-nextjs-frontend/plan.md`
- **Tasks**: `specs/003-nextjs-frontend/tasks.md`
- **Data Model**: `specs/003-nextjs-frontend/data-model.md`
- **Contracts**: `specs/003-nextjs-frontend/contracts/`

## Status

**Phase**: 1 - Setup (Complete)
**Next**: Phase 2 - Foundational Configuration