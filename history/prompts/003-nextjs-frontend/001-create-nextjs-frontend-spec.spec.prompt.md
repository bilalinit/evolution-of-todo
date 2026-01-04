---
id: 001
title: create nextjs frontend spec
stage: spec
date: 2025-12-29
surface: agent
model: claude-sonnet-4-5
feature: 003-nextjs-frontend
branch: 003-nextjs-frontend
user: user
command: /sp.specify name the new branch "003-nextjs-frontend" and here is the specs: # Phase 2: Todo Web Application - Frontend Specifications

## Overview

This document provides comprehensive frontend specifications for the Phase 2 Todo web application. The frontend is built with **Next.js 16+ (App Router)**, **TypeScript**, and **Tailwind CSS**, following the **Modern Technical Editorial** design system.

> [!IMPORTANT]
> **Skills References for Claude Code:**
> - Use `@skills/nextjs` skill to initialize and structure the Next.js project
> - Use `@skills/ui-design` skill for all styling and component design
> - Use `@skills/ui-animation` skill for all animations and interactions

---

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Framework** | Next.js (App Router) | 16+ |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **Authentication** | Better Auth (with JWT Plugin) | Latest |
| **HTTP Client** | Native `fetch` | - |
| **Form Handling** | React Hook Form | 7.x |
| **State Management** | React Query (TanStack Query) | 5.x |
| **Icons** | Lucide React | Latest |
| **Toast/Notifications** | Sonner | Latest |
| **Animation** | Framer Motion | Latest |

---

## Project Initialization

> **Use `@skills/nextjs` to initialize the project using the standard Next.js command.**

```bash
npx create-next-app@latest frontend \
  --yes --no-react-compiler --typescript --eslint --tailwind --app --src-dir --no-import-alias
```

### Post-Initialization Dependencies

```bash
npm install framer-motion lucide-react sonner @tanstack/react-query react-hook-form better-auth
```

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group (unprotected)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/              # Protected route group
│   │   │   ├── tasks/
│   │   │   │   └── page.tsx          # Main tasks page
│   │   │   ├── profile/
│   │   │   │   └── page.tsx          # User profile page
│   │   │   └── layout.tsx            # Dashboard layout with header
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...all]/
│   │   │           └── route.ts      # Better Auth API routes
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                       # Reusable UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   └── Skeleton.tsx
│   │   ├── tasks/                    # Task-specific components
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskItem.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskFilters.tsx
│   │   │   ├── TaskSearch.tsx
│   │   │   ├── TaskSort.tsx
│   │   │   ├── PriorityBadge.tsx
│   │   │   ├── CategoryBadge.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── auth/                     # Auth components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── profile/                  # Profile components
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── PasswordChangeForm.tsx
│   │   │   └── AccountSettings.tsx
│   │   └── layout/                   # Layout components
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Sidebar.tsx
│   ├── lib/
│   │   ├── api/                      # API integration layer
│   │   │   ├── client.ts             # HTTP client configuration
│   │   │   ├── tasks.ts              # Task API functions
│   │   │   └── types.ts              # API response types
│   │   ├── auth/
│   │   │   ├── auth-client.ts        # Better Auth client config
│   │   │   └── hooks.ts              # Auth hooks (useSession, signIn, signOut)
│   │   ├── utils/
│   │   │   ├── date.ts               # Date formatting utilities
│   │   │   ├── validation.ts         # Form validation schemas
│   │   │   ├── helpers.ts            # General helpers
│   │   │   └── animations.ts         # Framer Motion variants
│   │   └── constants.ts              # App-wide constants
│   ├── hooks/                        # Custom React hooks
│   │   ├── useTasks.ts               # Task CRUD operations hook
│   │   ├── useTaskFilters.ts         # Filter state management
│   │   └── useDebounce.ts            # Debounce hook for search
│   └── types/                        # TypeScript type definitions
│       ├── task.ts
│       ├── user.ts
│       └── api.ts
├── public/                           # Static assets
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── .env.local                        # Environment variables
```

---

## Design System

> **Use `@skills/ui-design` for all styling. Consult `TOKENS.md`, `LAYOUT_PATTERNS.md`, and `COMPONENT_PATTERNS.md`.**

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| **Background** | `#F9F7F2` (Warm Cream) | Main page background |
| **Surface** | `#F0EBE0` (Darker Cream) | Cards, sections |
| **Structure** | `#E5E0D6` (Wireframe Grey) | Borders, dividers |
| **Text Primary** | `#2A1B12` (Espresso) | Headings, main text |
| **Text Secondary** | `#5C4D45` (Mocha) | Supporting text |
| **Primary Accent** | `#FF6B4A` (Vibrant Orange) | Buttons, highlights |

### Typography

| Type | Font | Usage |
|------|------|-------|
| **Serif** | Playfair Display | Headings, display text |
| **Sans** | DM Sans | Body text |
| **Mono** | JetBrains Mono | Labels, navigation, data |

### Animation System

> **Use `@skills/ui-animation` for all animations. Consult `MOTION_TOKENS.md` and `ANIMATION_PATTERNS.md`.**

**Animation Rules:**
1. Use `FadeInUp` for content entrances
2. Hover scales should not exceed `1.02`
3. Lists and grids must use stagger animations
4. Entrance animations should be slow and smooth (`0.8s`)

---

## Data Models

### Task Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | UUID from backend |
| `title` | string | Yes | Task title (1-200 chars) |
| `description` | string | No | Optional description (max 1000 chars) |
| `completed` | boolean | Yes | Completion status |
| `priority` | `'low' \| 'medium' \| 'high'` | Yes | Priority level |
| `category` | `'work' \| 'personal' \| 'shopping' \| 'health' \| 'other'` | Yes | Category tag |
| `due_date` | string | No | ISO 8601 date string |
| `created_at` | string | Yes | ISO 8601 timestamp |
| `updated_at` | string | Yes | ISO 8601 timestamp |
| `user_id` | string | Yes | Owner's user ID |

### User Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | UUID |
| `email` | string | Yes | User email |
| `name` | string | No | Display name |
| `image` | string | No | Profile image URL |
| `created_at` | string | Yes | Account creation timestamp |

### Session Entity

| Field | Type | Description |
|-------|------|-------------|
| `user` | User | Current user object |
| `token` | string | JWT token for API requests |
| `expires_at` | string | Token expiration timestamp |

### Filter & Sort Types

| Type | Values |
|------|--------|
| `TaskStatus` | `'all' \| 'pending' \| 'completed'` |
| `SortField` | `'created_at' \| 'due_date' \| 'priority' \| 'title'` |
| `SortOrder` | `'asc' \| 'desc'` |

---

## API Integration Layer

> All API calls go through `lib/api/client.ts` abstraction for backend-agnostic design.

### Backend API Endpoints (Reference)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{user_id}/tasks` | List all tasks for user |
| POST | `/api/{user_id}/tasks` | Create a new task |
| GET | `/api/{user_id}/tasks/{id}` | Get specific task |
| PUT | `/api/{user_id}/tasks/{id}` | Update task |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Toggle completion |

### API Client Guidelines

- Use `Authorization: Bearer <token>` header for all protected requests
- Handle 204 No Content responses for delete operations
- Create custom `ApiError` class for error handling
- Use environment variable `NEXT_PUBLIC_API_URL` for backend URL

---

## Page Specifications

### Landing Page (`/`)

**Purpose:** Welcome page for unauthenticated users, redirect for authenticated users.

**Layout:**
- Hero section with massive serif heading
- Subheading with value proposition
- Two CTA buttons: "Get Started" (signup) and "Login"
- Technical wireframe lines as decorative elements

**Behavior:**
- If user is authenticated → redirect to `/tasks`
- If not authenticated → show landing page

**Design Reference:** Use `@skills/ui-design` Wireframe Hero pattern (Moonlet style)

---

### Login Page (`/login`)

**Purpose:** User authentication with email/password.

**Form Fields:**
| Field | Type | Validation |
|-------|------|------------|
| Email | text | Required, valid email format |
| Password | password | Required, min 8 characters |

**Features:**
- Password visibility toggle
- "Forgot password?" link (optional for Phase 2)
- Link to signup page
- Loading state on submit button
- Error messages below fields

**Flow:**
1. User submits credentials
2. Better Auth validates and returns JWT
3. Token stored in secure cookie
4. Redirect to `/tasks`

---

### Signup Page (`/signup`)

**Purpose:** New user registration.

**Form Fields:**
| Field | Type | Validation |
|-------|------|------------|
| Name | text | Required, min 2 characters |
| Email | text | Required, valid email format |
| Password | password | Required, min 8 characters |
| Confirm Password | password | Must match password |

**Features:**
- Password strength indicator (optional)
- Link to login page
- Loading state on submit
- Auto-login after successful signup OR redirect to login

---

### Dashboard Layout (`/(dashboard)/layout.tsx`)

**Purpose:** Shared layout for all authenticated pages.

**Components:**
- **Header**: Logo, navigation links (Tasks, Profile), user menu with logout
- **Main Content Area**: Renders child pages
- **Footer** (optional): Minimal footer

**Auth Guard:**
- Wrap with `AuthGuard` component
- If not authenticated → redirect to `/login`
- Show loading skeleton while checking auth

---

### Tasks Page (`/tasks`)

**Purpose:** Main task management interface.

**Layout Sections:**
1. **Header Bar**: Page title, "Add Task" button
2. **Toolbar**: Search input, Filter dropdowns, Sort dropdown
3. **Task List**: Staggered list of task items
4. **Empty State**: When no tasks exist

**Task Item Elements:**
| Element | Description |
|---------|-------------|
| Checkbox | Toggle completion (optimistic update) |
| Title | Strikethrough + 60% opacity when completed |
| Description | First 100 chars, truncated |
| Priority Badge | Red (High), Yellow (Medium), Green (Low) |
| Category Badge | Icon + label |
| Due Date | Relative or formatted date |
| Actions | Edit (pencil), Delete (trash) icons |

**Interactions:**
- Click checkbox → toggle completion with API call
- Click edit → open TaskForm modal in edit mode
- Click delete → show confirmation dialog
- Click "Add Task" → open TaskForm modal in create mode

**States:**
- Loading: Show 3-5 skeleton items
- Empty: Show empty state with CTA
- Error: Show error message with retry option

---

### Profile Page (`/profile`)

**Purpose:** User account management.

**Layout Sections:**

#### 1. Profile Header
- User avatar (or initials placeholder)
- Display name
- Email address
- Member since date

#### 2. Profile Settings Form
| Field | Type | Validation |
|-------|------|------------|
| Name | text | Required, min 2 characters |
| Email | text | Required, valid email (read-only or editable) |

**Save Changes Button** with loading state

#### 3. Change Password Section
| Field | Type | Validation |
|-------|------|------------|
| Current Password | password | Required |
| New Password | password | Required, min 8 characters |
| Confirm New Password | password | Must match new password |

**Update Password Button** with loading state

#### 4. Account Actions
- **Logout Button**: Sign out and redirect to landing page
- **Delete Account** (optional): Confirmation dialog, permanent action

**Toast Notifications:**
- "Profile updated successfully"
- "Password changed successfully"
- Error messages for failures

---

## Feature Specifications

### Feature 1: Authentication

**Components:** `LoginForm`, `SignupForm`, `AuthGuard`

**Auth Client Setup (`lib/auth/auth-client.ts`):**
- Configure Better Auth client
- Export `signIn`, `signUp`, `signOut` functions
- Export `useSession` hook for auth state

**Auth Guard Behavior:**
- Check session on mount
- If no session → redirect to `/login`
- If session exists → render children
- Show loading state while checking

---

### Feature 2: Add Task

**Component:** `TaskForm` (used in modal/dialog)

**Form Fields:**
| Field | Type | Default | Validation |
|-------|------|---------|------------|
| title | text | - | Required, 1-200 chars |
| description | textarea | null | Max 1000 chars |
| priority | select | 'medium' | Required |
| category | select | 'other' | Required |
| due_date | date | null | Must be today or future |

**Flow:**
1. Open modal with fadeInUp animation
2. Fill form
3. Submit → API POST request
4. Success → toast notification, close modal, refresh list
5. Error → show error message

---

### Feature 3: View Task List

**Components:** `TaskList`, `TaskItem`, `EmptyState`

**Animation:** Use stagger animation with 0.1s delay between items

**Responsive Design:**
- Desktop: Full row with all elements visible
- Mobile: Stacked card layout

---

### Feature 4: Update Task

**Reuse:** `TaskForm` component with `mode: 'edit'` prop

**Flow:**
1. Click edit icon → open modal pre-filled with task data
2. Modify fields
3. Submit → API PUT request
4. Optimistic UI update
5. Toast confirmation

---

### Feature 5: Delete Task

**Dialog:** Confirmation required before deletion

**Flow:**
1. Click delete icon
2. Show dialog: "Delete '{title}'? This cannot be undone."
3. Confirm → API DELETE request
4. Optimistic UI removal
5. Toast: "Task deleted"

---

### Feature 6: Mark as Complete

**Interaction:** Click checkbox for instant toggle

**Visual States:**
| State | Checkbox | Title | Opacity |
|-------|----------|-------|---------|
| Pending | Empty | Normal | 100% |
| Completed | Checked (accent) | Strikethrough | 60% |

**Flow:**
1. Click checkbox
2. Immediate visual feedback
3. API PATCH request
4. If fails → revert state, show error toast

---

### Feature 7: Priorities & Categories

**Priority Badges:**
| Priority | Color | Style |
|----------|-------|-------|
| High | Red | `bg-red-100 text-red-800` |
| Medium | Yellow | `bg-yellow-100 text-yellow-800` |
| Low | Green | `bg-green-100 text-green-800` |

**Category Badges:**
| Category | Icon |
|----------|------|
| Work | Briefcase |
| Personal | User |
| Shopping | ShoppingCart |
| Health | Heart |
| Other | Tag |

---

### Feature 8: Search Tasks

**Component:** `TaskSearch`

**Behavior:**
- Debounced input (300ms delay)
- Client-side filtering by title and description
- Clear button (X) to reset
- Show "No results for 'query'" when no matches

---

### Feature 9: Filter Tasks

**Component:** `TaskFilters`

**Filter Options:**
| Filter | Options | Default |
|--------|---------|---------|
| Status | All, Pending, Completed | All |
| Priority | All, High, Medium, Low | All |
| Category | All, Work, Personal, Shopping, Health, Other | All |

**UI:** Dropdown selects with active filter chips

---

### Feature 10: Sort Tasks

**Component:** `TaskSort`

**Sort Options:**
| Sort By | Order Options |
|---------|---------------|
| Due Date | Earliest first / Latest first |
| Priority | High to Low / Low to High |
| Title | A-Z / Z-A |
| Created Date | Newest first / Oldest first |

**Behavior:** Tasks without due dates go to the end when sorting by due date

---

### Feature 11: User Profile

**Component:** `ProfileForm`, `PasswordChangeForm`

**Sections:**
1. View/edit display name
2. View email (read-only or editable)
3. Change password form
4. Logout button
5. Delete account (optional)

**Validation:**
- Name: Required, min 2 chars
- Current password: Required for password change
- New password: Min 8 chars, must match confirmation

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@host/dbname
```

---

## Implementation Checklist

### Phase 1: Project Setup
- [ ] Initialize Next.js using `@skills/nextjs`
- [ ] Configure Tailwind with design tokens from `@skills/ui-design`
- [ ] Set up fonts (Playfair Display, DM Sans, JetBrains Mono)
- [ ] Install all dependencies
- [ ] Create folder structure

### Phase 2: Core Components
- [ ] Build UI primitives (Button, Input, Select, Badge, Dialog, Card, Checkbox)
- [ ] Build layout components (Header, Footer)

### Phase 3: Pages
- [ ] Landing page with hero
- [ ] Login page with form
- [ ] Signup page with form
- [ ] Dashboard layout with auth guard
- [ ] Tasks page
- [ ] Profile page

### Phase 4: Authentication
- [ ] Configure Better Auth client
- [ ] Implement auth hooks (useSession, signIn, signOut)
- [ ] Create AuthGuard component
- [ ] Test login/signup flows

### Phase 5: Task Features
- [ ] TaskList with staggered animations
- [ ] TaskItem with all visual elements
- [ ] TaskForm for create/edit
- [ ] Delete confirmation dialog
- [ ] Mark as complete toggle
- [ ] PriorityBadge and CategoryBadge
- [ ] TaskSearch with debounce
- [ ] TaskFilters
- [ ] TaskSort

### Phase 6: Profile Features
- [ ] Profile page layout
- [ ] Edit profile form
- [ ] Change password form
- [ ] Logout functionality

### Phase 7: Integration & Polish
- [ ] Connect to API layer
- [ ] Add toast notifications
- [ ] Add loading and empty states
- [ ] Apply animations using `@skills/ui-animation`
- [ ] Responsive testing

---

## Summary

**Skills to use during implementation:**
- `@skills/nextjs` - Project initialization and Next.js patterns
- `@skills/ui-design` - Styling, colors, typography, components
- `@skills/ui-animation` - Animations and interactions

**Key Principles:**
- Backend-agnostic API layer
- Optimistic UI updates
- Modern Technical Editorial design system
- Smooth, editorial-paced animations" labels: ["spec", "nextjs", "frontend", "todo-app"]

links:
  spec: specs/003-nextjs-frontend/spec.md
  ticket: null
  adr: null
  pr: null

files:
  - specs/003-nextjs-frontend/spec.md
  - specs/003-nextjs-frontend/checklists/requirements.md

tests: []

---

## Prompt

name the new branch "003-nextjs-frontend" and here is the specs: # Phase 2: Todo Web Application - Frontend Specifications

## Overview

This document provides comprehensive frontend specifications for the Phase 2 Todo web application. The frontend is built with **Next.js 16+ (App Router)**, **TypeScript**, and **Tailwind CSS**, following the **Modern Technical Editorial** design system.

> [!IMPORTANT]
> **Skills References for Claude Code:**
> - Use `@skills/nextjs` skill to initialize and structure the Next.js project
> - Use `@skills/ui-design` skill for all styling and component design
> - Use `@skills/ui-animation` skill for all animations and interactions

---

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Framework** | Next.js (App Router) | 16+ |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **Authentication** | Better Auth (with JWT Plugin) | Latest |
| **HTTP Client** | Native `fetch` | - |
| **Form Handling** | React Hook Form | 7.x |
| **State Management** | React Query (TanStack Query) | 5.x |
| **Icons** | Lucide React | Latest |
| **Toast/Notifications** | Sonner | Latest |
| **Animation** | Framer Motion | Latest |

---

## Project Initialization

> **Use `@skills/nextjs` to initialize the project using the standard Next.js command.**

```bash
npx create-next-app@latest frontend \
  --yes --no-react-compiler --typescript --eslint --tailwind --app --src-dir --no-import-alias
```

### Post-Initialization Dependencies

```bash
npm install framer-motion lucide-react sonner @tanstack/react-query react-hook-form better-auth
```

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group (unprotected)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/              # Protected route group
│   │   │   ├── tasks/
│   │   │   │   └── page.tsx          # Main tasks page
│   │   │   ├── profile/
│   │   │   │   └── page.tsx          # User profile page
│   │   │   └── layout.tsx            # Dashboard layout with header
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...all]/
│   │   │           └── route.ts      # Better Auth API routes
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                       # Reusable UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   └── Skeleton.tsx
│   │   ├── tasks/                    # Task-specific components
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskItem.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskFilters.tsx
│   │   │   ├── TaskSearch.tsx
│   │   │   ├── TaskSort.tsx
│   │   │   ├── PriorityBadge.tsx
│   │   │   ├── CategoryBadge.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── auth/                     # Auth components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── profile/                  # Profile components
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── PasswordChangeForm.tsx
│   │   │   └── AccountSettings.tsx
│   │   └── layout/                   # Layout components
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Sidebar.tsx
│   ├── lib/
│   │   ├── api/                      # API integration layer
│   │   │   ├── client.ts             # HTTP client configuration
│   │   │   ├── tasks.ts              # Task API functions
│   │   │   └── types.ts              # API response types
│   │   ├── auth/
│   │   │   ├── auth-client.ts        # Better Auth client config
│   │   │   └── hooks.ts              # Auth hooks (useSession, signIn, signOut)
│   │   ├── utils/
│   │   │   ├── date.ts               # Date formatting utilities
│   │   │   ├── validation.ts         # Form validation schemas
│   │   │   ├── helpers.ts            # General helpers
│   │   │   └── animations.ts         # Framer Motion variants
│   │   └── constants.ts              # App-wide constants
│   ├── hooks/                        # Custom React hooks
│   │   ├── useTasks.ts               # Task CRUD operations hook
│   │   ├── useTaskFilters.ts         # Filter state management
│   │   └── useDebounce.ts            # Debounce hook for search
│   └── types/                        # TypeScript type definitions
│       ├── task.ts
│       ├── user.ts
│       └── api.ts
├── public/                           # Static assets
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── .env.local                        # Environment variables
```

---

## Design System

> **Use `@skills/ui-design` for all styling. Consult `TOKENS.md`, `LAYOUT_PATTERNS.md`, and `COMPONENT_PATTERNS.md`.**

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| **Background** | `#F9F7F2` (Warm Cream) | Main page background |
| **Surface** | `#F0EBE0` (Darker Cream) | Cards, sections |
| **Structure** | `#E5E0D6` (Wireframe Grey) | Borders, dividers |
| **Text Primary** | `#2A1B12` (Espresso) | Headings, main text |
| **Text Secondary** | `#5C4D45` (Mocha) | Supporting text |
| **Primary Accent** | `#FF6B4A` (Vibrant Orange) | Buttons, highlights |

### Typography

| Type | Font | Usage |
|------|------|-------|
| **Serif** | Playfair Display | Headings, display text |
| **Sans** | DM Sans | Body text |
| **Mono** | JetBrains Mono | Labels, navigation, data |

### Animation System

> **Use `@skills/ui-animation` for all animations. Consult `MOTION_TOKENS.md` and `ANIMATION_PATTERNS.md`.**

**Animation Rules:**
1. Use `FadeInUp` for content entrances
2. Hover scales should not exceed `1.02`
3. Lists and grids must use stagger animations
4. Entrance animations should be slow and smooth (`0.8s`)

---

## Data Models

### Task Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | UUID from backend |
| `title` | string | Yes | Task title (1-200 chars) |
| `description` | string | No | Optional description (max 1000 chars) |
| `completed` | boolean | Yes | Completion status |
| `priority` | `'low' \| 'medium' \| 'high'` | Yes | Priority level |
| `category` | `'work' \| 'personal' \| 'shopping' \| 'health' \| 'other'` | Yes | Category tag |
| `due_date` | string | No | ISO 8601 date string |
| `created_at` | string | Yes | ISO 8601 timestamp |
| `updated_at` | string | Yes | ISO 8601 timestamp |
| `user_id` | string | Yes | Owner's user ID |

### User Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | UUID |
| `email` | string | Yes | User email |
| `name` | string | No | Display name |
| `image` | string | No | Profile image URL |
| `created_at` | string | Yes | Account creation timestamp |

### Session Entity

| Field | Type | Description |
|-------|------|-------------|
| `user` | User | Current user object |
| `token` | string | JWT token for API requests |
| `expires_at` | string | Token expiration timestamp |

### Filter & Sort Types

| Type | Values |
|------|--------|
| `TaskStatus` | `'all' \| 'pending' \| 'completed'` |
| `SortField` | `'created_at' \| 'due_date' \| 'priority' \| 'title'` |
| `SortOrder` | `'asc' \| 'desc'` |

---

## API Integration Layer

> All API calls go through `lib/api/client.ts` abstraction for backend-agnostic design.

### Backend API Endpoints (Reference)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{user_id}/tasks` | List all tasks for user |
| POST | `/api/{user_id}/tasks` | Create a new task |
| GET | `/api/{user_id}/tasks/{id}` | Get specific task |
| PUT | `/api/{user_id}/tasks/{id}` | Update task |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Toggle completion |

### API Client Guidelines

- Use `Authorization: Bearer <token>` header for all protected requests
- Handle 204 No Content responses for delete operations
- Create custom `ApiError` class for error handling
- Use environment variable `NEXT_PUBLIC_API_URL` for backend URL

---

## Page Specifications

### Landing Page (`/`)

**Purpose:** Welcome page for unauthenticated users, redirect for authenticated users.

**Layout:**
- Hero section with massive serif heading
- Subheading with value proposition
- Two CTA buttons: "Get Started" (signup) and "Login"
- Technical wireframe lines as decorative elements

**Behavior:**
- If user is authenticated → redirect to `/tasks`
- If not authenticated → show landing page

**Design Reference:** Use `@skills/ui-design` Wireframe Hero pattern (Moonlet style)

---

### Login Page (`/login`)

**Purpose:** User authentication with email/password.

**Form Fields:**
| Field | Type | Validation |
|-------|------|------------|
| Email | text | Required, valid email format |
| Password | password | Required, min 8 characters |

**Features:**
- Password visibility toggle
- "Forgot password?" link (optional for Phase 2)
- Link to signup page
- Loading state on submit button
- Error messages below fields

**Flow:**
1. User submits credentials
2. Better Auth validates and returns JWT
3. Token stored in secure cookie
4. Redirect to `/tasks`

---

### Signup Page (`/signup`)

**Purpose:** New user registration.

**Form Fields:**
| Field | Type | Validation |
|-------|------|------------|
| Name | text | Required, min 2 characters |
| Email | text | Required, valid email format |
| Password | password | Required, min 8 characters |
| Confirm Password | password | Must match password |

**Features:**
- Password strength indicator (optional)
- Link to login page
- Loading state on submit
- Auto-login after successful signup OR redirect to login

---

### Dashboard Layout (`/(dashboard)/layout.tsx`)

**Purpose:** Shared layout for all authenticated pages.

**Components:**
- **Header**: Logo, navigation links (Tasks, Profile), user menu with logout
- **Main Content Area**: Renders child pages
- **Footer** (optional): Minimal footer

**Auth Guard:**
- Wrap with `AuthGuard` component
- If not authenticated → redirect to `/login`
- Show loading skeleton while checking auth

---

### Tasks Page (`/tasks`)

**Purpose:** Main task management interface.

**Layout Sections:**
1. **Header Bar**: Page title, "Add Task" button
2. **Toolbar**: Search input, Filter dropdowns, Sort dropdown
3. **Task List**: Staggered list of task items
4. **Empty State**: When no tasks exist

**Task Item Elements:**
| Element | Description |
|---------|-------------|
| Checkbox | Toggle completion (optimistic update) |
| Title | Strikethrough + 60% opacity when completed |
| Description | First 100 chars, truncated |
| Priority Badge | Red (High), Yellow (Medium), Green (Low) |
| Category Badge | Icon + label |
| Due Date | Relative or formatted date |
| Actions | Edit (pencil), Delete (trash) icons |

**Interactions:**
- Click checkbox → toggle completion with API call
- Click edit → open TaskForm modal in edit mode
- Click delete → show confirmation dialog
- Click "Add Task" → open TaskForm modal in create mode

**States:**
- Loading: Show 3-5 skeleton items
- Empty: Show empty state with CTA
- Error: Show error message with retry option

---

### Profile Page (`/profile`)

**Purpose:** User account management.

**Layout Sections:**

#### 1. Profile Header
- User avatar (or initials placeholder)
- Display name
- Email address
- Member since date

#### 2. Profile Settings Form
| Field | Type | Validation |
|-------|------|------------|
| Name | text | Required, min 2 characters |
| Email | text | Required, valid email (read-only or editable) |

**Save Changes Button** with loading state

#### 3. Change Password Section
| Field | Type | Validation |
|-------|------|------------|
| Current Password | password | Required |
| New Password | password | Required, min 8 characters |
| Confirm New Password | password | Must match new password |

**Update Password Button** with loading state

#### 4. Account Actions
- **Logout Button**: Sign out and redirect to landing page
- **Delete Account** (optional): Confirmation dialog, permanent action

**Toast Notifications:**
- "Profile updated successfully"
- "Password changed successfully"
- Error messages for failures

---

## Feature Specifications

### Feature 1: Authentication

**Components:** `LoginForm`, `SignupForm`, `AuthGuard`

**Auth Client Setup (`lib/auth/auth-client.ts`):**
- Configure Better Auth client
- Export `signIn`, `signUp`, `signOut` functions
- Export `useSession` hook for auth state

**Auth Guard Behavior:**
- Check session on mount
- If no session → redirect to `/login`
- If session exists → render children
- Show loading state while checking

---

### Feature 2: Add Task

**Component:** `TaskForm` (used in modal/dialog)

**Form Fields:**
| Field | Type | Default | Validation |
|-------|------|---------|------------|
| title | text | - | Required, 1-200 chars |
| description | textarea | null | Max 1000 chars |
| priority | select | 'medium' | Required |
| category | select | 'other' | Required |
| due_date | date | null | Must be today or future |

**Flow:**
1. Open modal with fadeInUp animation
2. Fill form
3. Submit → API POST request
4. Success → toast notification, close modal, refresh list
5. Error → show error message

---

### Feature 3: View Task List

**Components:** `TaskList`, `TaskItem`, `EmptyState`

**Animation:** Use stagger animation with 0.1s delay between items

**Responsive Design:**
- Desktop: Full row with all elements visible
- Mobile: Stacked card layout

---

### Feature 4: Update Task

**Reuse:** `TaskForm` component with `mode: 'edit'` prop

**Flow:**
1. Click edit icon → open modal pre-filled with task data
2. Modify fields
3. Submit → API PUT request
4. Optimistic UI update
5. Toast confirmation

---

### Feature 5: Delete Task

**Dialog:** Confirmation required before deletion

**Flow:**
1. Click delete icon
2. Show dialog: "Delete '{title}'? This cannot be undone."
3. Confirm → API DELETE request
4. Optimistic UI removal
5. Toast: "Task deleted"

---

### Feature 6: Mark as Complete

**Interaction:** Click checkbox for instant toggle

**Visual States:**
| State | Checkbox | Title | Opacity |
|-------|----------|-------|---------|
| Pending | Empty | Normal | 100% |
| Completed | Checked (accent) | Strikethrough | 60% |

**Flow:**
1. Click checkbox
2. Immediate visual feedback
3. API PATCH request
4. If fails → revert state, show error toast

---

### Feature 7: Priorities & Categories

**Priority Badges:**
| Priority | Color | Style |
|----------|-------|-------|
| High | Red | `bg-red-100 text-red-800` |
| Medium | Yellow | `bg-yellow-100 text-yellow-800` |
| Low | Green | `bg-green-100 text-green-800` |

**Category Badges:**
| Category | Icon |
|----------|------|
| Work | Briefcase |
| Personal | User |
| Shopping | ShoppingCart |
| Health | Heart |
| Other | Tag |

---

### Feature 8: Search Tasks

**Component:** `TaskSearch`

**Behavior:**
- Debounced input (300ms delay)
- Client-side filtering by title and description
- Clear button (X) to reset
- Show "No results for 'query'" when no matches

---

### Feature 9: Filter Tasks

**Component:** `TaskFilters`

**Filter Options:**
| Filter | Options | Default |
|--------|---------|---------|
| Status | All, Pending, Completed | All |
| Priority | All, High, Medium, Low | All |
| Category | All, Work, Personal, Shopping, Health, Other | All |

**UI:** Dropdown selects with active filter chips

---

### Feature 10: Sort Tasks

**Component:** `TaskSort`

**Sort Options:**
| Sort By | Order Options |
|---------|---------------|
| Due Date | Earliest first / Latest first |
| Priority | High to Low / Low to High |
| Title | A-Z / Z-A |
| Created Date | Newest first / Oldest first |

**Behavior:** Tasks without due dates go to the end when sorting by due date

---

### Feature 11: User Profile

**Component:** `ProfileForm`, `PasswordChangeForm`

**Sections:**
1. View/edit display name
2. View email (read-only or editable)
3. Change password form
4. Logout button
5. Delete account (optional)

**Validation:**
- Name: Required, min 2 chars
- Current password: Required for password change
- New password: Min 8 chars, must match confirmation

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@host/dbname
```

---

## Implementation Checklist

### Phase 1: Project Setup
- [ ] Initialize Next.js using `@skills/nextjs`
- [ ] Configure Tailwind with design tokens from `@skills/ui-design`
- [ ] Set up fonts (Playfair Display, DM Sans, JetBrains Mono)
- [ ] Install all dependencies
- [ ] Create folder structure

### Phase 2: Core Components
- [ ] Build UI primitives (Button, Input, Select, Badge, Dialog, Card, Checkbox)
- [ ] Build layout components (Header, Footer)

### Phase 3: Pages
- [ ] Landing page with hero
- [ ] Login page with form
- [ ] Signup page with form
- [ ] Dashboard layout with auth guard
- [ ] Tasks page
- [ ] Profile page

### Phase 4: Authentication
- [ ] Configure Better Auth client
- [ ] Implement auth hooks (useSession, signIn, signOut)
- [ ] Create AuthGuard component
- [ ] Test login/signup flows

### Phase 5: Task Features
- [ ] TaskList with staggered animations
- [ ] TaskItem with all visual elements
- [ ] TaskForm for create/edit
- [ ] Delete confirmation dialog
- [ ] Mark as complete toggle
- [ ] PriorityBadge and CategoryBadge
- [ ] TaskSearch with debounce
- [ ] TaskFilters
- [ ] TaskSort

### Phase 6: Profile Features
- [ ] Profile page layout
- [ ] Edit profile form
- [ ] Change password form
- [ ] Logout functionality

### Phase 7: Integration & Polish
- [ ] Connect to API layer
- [ ] Add toast notifications
- [ ] Add loading and empty states
- [ ] Apply animations using `@skills/ui-animation`
- [ ] Responsive testing

---

## Summary

**Skills to use during implementation:**
- `@skills/nextjs` - Project initialization and Next.js patterns
- `@skills/ui-design` - Styling, colors, typography, components
- `@skills/ui-animation` - Animations and interactions

**Key Principles:**
- Backend-agnostic API layer
- Optimistic UI updates
- Modern Technical Editorial design system
- Smooth, editorial-paced animations

## Response snapshot

✅ **SPECIFICATION PASSES ALL VALIDATION CHECKS**

The specification is ready for the next phase (`/sp.clarify` or `/sp.plan`).

## Outcome

- ✅ Impact: Created comprehensive specification for Next.js Todo frontend with 20 functional requirements, 4 prioritized user stories, and 8 measurable success criteria
- 🧪 Tests: Specification validated against quality checklist - all items passed
- 📁 Files: specs/003-nextjs-frontend/spec.md, specs/003-nextjs-frontend/checklists/requirements.md
- 🔁 Next prompts: /sp.clarify (if questions exist) or /sp.plan (to begin implementation planning)
- 🧠 Reflection: The specification successfully abstracts implementation details while providing clear, testable requirements. All success criteria are technology-agnostic and measurable.

## Evaluation notes (flywheel)

- Failure modes observed: Shell script execution issues required manual branch/spec creation
- Graders run and results (PASS/FAIL): PASS - specification meets all quality criteria
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A