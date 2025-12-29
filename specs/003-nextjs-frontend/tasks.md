# Implementation Tasks: Next.js Todo Web Application Frontend

**Feature**: 003-nextjs-frontend
**Date**: 2025-12-29
**Plan**: `specs/003-nextjs-frontend/plan.md`
**Spec**: `specs/003-nextjs-frontend/spec.md`

## Overview

This document contains actionable implementation tasks organized by user story. Each task follows the strict checklist format and is designed to be independently executable. Tasks are grouped into phases based on user story priority and dependencies.

## Task Dependencies

```
Phase 1: Setup (Independent)
    ↓
Phase 2: Foundational (Blocks all user stories)
    ↓
Phase 3: User Story 1 - Authentication (P1) [Independent]
    ↓
Phase 4: User Story 2 - Task CRUD (P1) [Independent]
    ↓
Phase 5: User Story 3 - Organization (P2) [Depends on US2]
    ↓
Phase 6: User Story 4 - Profile (P3) [Independent]
    ↓
Phase 7: Polish & Cross-Cutting
```

## Parallel Execution Opportunities

- **US1 (Authentication)** and **US2 (Task CRUD)** can be developed in parallel after Phase 2
- **US4 (Profile)** can be developed in parallel with US1 and US2
- **US3 (Organization)** should follow US2 completion

## MVP Scope

**Recommended MVP**: Complete Phase 1, 2, and 3 (User Story 1) for basic authentication, then Phase 4 (User Story 2) for core task management. This provides a functional, testable application.

---

## Phase 1: Setup

**Goal**: Initialize project structure and development environment

### T001 Create phase-2 folder at repository root
- [x] T001 Create `phase-2` directory at project root level
- [x] T002 Initialize git repository in `phase-2` folder (if not already git repo) "skip this task we dont need it"
- [x] T003 Create `.gitignore` file with Next.js standard exclusions
- [x] T004 Create `README.md` in `phase-2` folder with project description

### T005 Initialize Next.js project using @skills/nextjs
- [x] T005 [P] Run `npx create-next-app@latest frontend --yes --no-react-compiler --typescript --eslint --tailwind --app --src-dir --no-import-alias` in `phase-2` folder
- [x] T006 Navigate to `phase-2/frontend` directory
- [x] T007 Verify project structure matches plan.md requirements
- [x] T008 Test initial build: `npm run build` should complete successfully

---

## Phase 2: Foundational

**Goal**: Install dependencies and configure core system (BLOCKS ALL USER STORIES)

### T009 Install all required dependencies
- [x] T009 Install Better Auth: `npm install better-auth`
- [x] T010 Install React Query: `npm install @tanstack/react-query`
- [x] T011 Install React Hook Form: `npm install react-hook-form`
- [x] T012 Install Framer Motion: `npm install framer-motion`
- [x] T013 Install Sonner: `npm install sonner`
- [x] T014 Install Lucide React: `npm install lucide-react`
- [x] T015 Verify all dependencies in package.json
- [x] T015a Install clsx and tailwind-merge: `npm install clsx tailwind-merge`
- [x] T015b Install font packages: `npm install @fontsource/playfair-display @fontsource/dm-sans @fontsource/jetbrains-mono`

### T016 Configure Modern Technical Editorial design system
- [x] T016 [P] Use `@skills/ui-design` skill to configure Tailwind with design tokens
- [x] T017 Configure custom fonts (Playfair Display, DM Sans, JetBrains Mono) in `src/app/globals.css`
- [x] T018 Set up color palette in `tailwind.config.ts` (cream background, espresso text, orange accents)
- [x] T019 Create design token constants in `src/lib/constants.ts`

### T020 Create project folder structure
- [x] T020 Create `src/app/(auth)/` route group
- [x] T021 Create `src/app/(dashboard)/` route group
- [x] T022 Create `src/components/ui/` directory
- [x] T023 Create `src/components/tasks/` directory
- [x] T024 Create `src/components/auth/` directory
- [x] T025 Create `src/components/profile/` directory
- [x] T026 Create `src/components/layout/` directory
- [x] T027 Create `src/lib/api/` directory
- [x] T028 Create `src/lib/auth/` directory
- [x] T029 Create `src/lib/utils/` directory
- [x] T030 Create `src/hooks/` directory
- [x] T031 Create `src/types/` directory

### T032 Configure environment variables
- [x] T032 Create `.env.local` file in `phase-2/frontend/`
- [x] T033 Add `NEXT_PUBLIC_API_URL=http://localhost:8000` to `.env.local`
- [x] T034 Add `BETTER_AUTH_SECRET=your-secret-key` to `.env.local`
- [x] T035 Add `BETTER_AUTH_URL=http://localhost:3000` to `.env.local`
- [x] T036 Add `.env.local` to `.gitignore`

---

## Phase 3: User Story 1 - Authentication Flow (P1)

**Goal**: Implement user authentication with signup, login, and route protection

**Independent Test**: Can be fully tested by attempting to access `/tasks` without auth (should redirect), then creating account and verifying access.

### T037 Configure Better Auth client
- [x] T037 [P] [US1] Create `src/lib/auth/auth-client.ts` with Better Auth configuration
- [x] T038 [P] [US1] Export `signIn`, `signUp`, `signOut` functions from auth-client
- [x] T039 [P] [US1] Create `useSession` hook in `src/lib/auth/hooks.ts`
- [x] T040 [P] [US1] Configure JWT token management and storage

### T041 Create Better Auth API routes
- [x] T041 [P] [US1] Create `src/app/api/auth/[...all]/route.ts` for Better Auth
- [x] T042 [P] [US1] Configure Better Auth with JWT plugin
- [x] T043 [P] [US1] Set up proper CORS and security headers

### T044 Build authentication components
- [x] T044 [P] [US1] Create `src/components/auth/LoginForm.tsx` with email/password fields
- [x] T045 [P] [US1] Create `src/components/auth/SignupForm.tsx` with name/email/password/confirm
- [x] T046 [P] [US1] Create `src/components/auth/AuthGuard.tsx` for route protection
- [x] T047 [P] [US1] Add form validation using React Hook Form
- [x] T048 [P] [US1] Add loading states and error handling

### T049 Create authentication pages
- [x] T049 [US1] Create `src/app/(auth)/login/page.tsx` with LoginForm
- [x] T050 [US1] Create `src/app/(auth)/signup/page.tsx` with SignupForm
- [x] T051 [US1] Create `src/app/(auth)/layout.tsx` for auth route group
- [x] T052 [US1] Create `src/app/page.tsx` (landing page) with redirect logic

### T053 Create dashboard layout with auth protection
- [x] T053 [US1] Create `src/app/(dashboard)/layout.tsx` with AuthGuard wrapper
- [x] T054 [US1] Create `src/components/layout/Header.tsx` with navigation and logout
- [x] T055 [US1] Add redirect to `/login` if not authenticated in dashboard layout
- [x] T056 [US1] Show loading skeleton while checking auth status
- [x] T056a [US1] Update root layout with Providers (React Query + Sonner)
- [x] T056b [US1] Update root layout metadata

### T057 Test authentication flow
- [x] T057 [US1] Test redirect: `/tasks` → `/login` when not authenticated
- [x] T058 [US1] Test signup: Create account → redirect to `/tasks`
- [x] T059 [US1] Test login: Valid credentials → redirect to `/tasks`
- [x] T060 [US1] Test logout: Click logout → redirect to landing page
- [x] T061 [US1] Test session persistence: Refresh page → still authenticated

### Build Verification
- [x] Build verification successful: `npm run build` completed without errors
- [x] All routes generated correctly: `/`, `/login`, `/signup`, `/tasks`, `/profile`, `/api/auth/[...all]`
- [x] TypeScript compilation passed

### Additional UI Components Created
- [x] Created `src/components/ui/Button.tsx` with loading states
- [x] Created `src/components/ui/Input.tsx` with error states
- [x] Created `src/components/ui/Card.tsx` with modern styling
- [x] Created `src/components/ui/Alert.tsx` for error messages
- [x] Created `src/components/ui/LoadingSpinner.tsx`
- [x] Created `src/lib/utils/helpers.ts` with utility functions
- [x] Created `src/app/providers.tsx` with React Query + Sonner
- [x] Created `src/app/(dashboard)/tasks/page.tsx` (placeholder)
- [x] Created `src/app/(dashboard)/profile/page.tsx` (placeholder)
- [x] Installed `clsx` and `tailwind-merge` dependencies

---

## Phase 4: User Story 2 - Task CRUD Operations (P1)

**Goal**: Implement full task management (create, read, update, delete, toggle completion)

**Independent Test**: Create task → mark complete → edit → delete → verify UI updates correctly.

### T062 Define TypeScript interfaces and types
- [x] T062 [P] [US2] Create `src/types/task.ts` with Task interface and enums
- [x] T063 [P] [US2] Create `src/types/user.ts` with User interface
- [x] T064 [P] [US2] Create `src/types/api.ts` with API response types
- [x] T065 [P] [US2] Create form data interfaces in `src/types/task.ts`

### T066 Create API client and task API functions
- [x] T066 [P] [US2] Create `src/lib/api/client.ts` with base HTTP client
- [x] T067 [P] [US2] Create `src/lib/api/types.ts` with API error class
- [x] T068 [P] [US2] Create `src/lib/api/tasks.ts` with CRUD functions
- [x] T069 [P] [US2] Add JWT authentication to all API requests
- [x] T070 [P] [US2] Implement error handling and validation

### T071 Create React Query hooks for tasks
- [x] T071 [P] [US2] Create `src/hooks/useTasks.ts` with useQuery and useMutation hooks
- [x] T072 [P] [US2] Implement optimistic updates for task operations
- [x] T073 [P] [US2] Add proper error handling and rollback logic
- [x] T074 [P] [US2] Create `src/hooks/useDebounce.ts` for search

### T075 Build UI primitives using @skills/ui-design
- [x] T075 [P] [US2] Use `@skills/ui-design` skill to create `src/components/ui/Button.tsx`
- [x] T076 [P] [US2] Use `@skills/ui-design` skill to create `src/components/ui/Input.tsx`
- [x] T077 [P] [US2] Use `@skills/ui-design` skill to create `src/components/ui/Select.tsx`
- [x] T078 [P] [US2] Use `@skills/ui-design` skill to create `src/components/ui/Badge.tsx`
- [x] T079 [P] [US2] Use `@skills/ui-design` skill to create `src/components/ui/Dialog.tsx`
- [x] T080 [P] [US2] Use `@skills/ui-design` skill to create `src/components/ui/Card.tsx`
- [x] T081 [P] [US2] Use `@skills/ui-design` skill to create `src/components/ui/Checkbox.tsx`
- [x] T082 [P] [US2] Use `@skills/ui-design` skill to create `src/components/ui/Skeleton.tsx`

### T083 Create task-specific components
- [x] T083 [P] [US2] Create `src/components/tasks/TaskForm.tsx` for create/edit (modal)
- [x] T084 [P] [US2] Create `src/components/tasks/TaskItem.tsx` with all visual elements
- [x] T085 [P] [US2] Create `src/components/tasks/TaskList.tsx` with empty state
- [x] T086 [P] [US2] Create `src/components/tasks/PriorityBadge.tsx`
- [x] T087 [P] [US2] Create `src/components/tasks/CategoryBadge.tsx`
- [x] T088 [P] [US2] Create `src/components/tasks/EmptyState.tsx`

### T089 Implement task operations with optimistic updates
- [x] T089 [US2] Implement "Add Task" button → opens TaskForm modal
- [x] T090 [US2] Implement TaskForm submission → POST to API → optimistic update
- [x] T091 [US2] Implement checkbox toggle → PATCH to API → immediate visual feedback
- [x] T092 [US2] Implement edit icon → opens pre-filled TaskForm modal
- [x] T093 [US2] Implement delete icon → confirmation dialog → DELETE → optimistic removal
- [x] T094 [US2] Add loading states for all operations
- [x] T095 [US2] Add error handling with toast notifications

### T096 Create tasks page
- [x] T096 [US2] Create `src/app/(dashboard)/tasks/page.tsx`
- [x] T097 [US2] Add "Add Task" button in page header
- [x] T098 [US2] Integrate TaskList with React Query
- [x] T099 [US2] Add loading skeletons for initial load
- [x] T100 [US2] Add error states and retry functionality

### T101 Test task CRUD operations
- [x] T101 [US2] Test create task with all fields
- [x] T102 [US2] Test create task with minimal fields
- [x] T103 [US2] Test toggle completion (checkbox) with visual feedback
- [x] T104 [US2] Test edit task with field updates
- [x] T105 [US2] Test delete task with confirmation
- [x] T106 [US2] Test optimistic updates (immediate UI, API in background)
- [x] T107 [US2] Test error handling (network failure, validation errors)

---

## Phase 5: User Story 3 - Task Organization & Discovery (P2)

**Goal**: Implement search, filter, and sort capabilities

**Dependencies**: Requires US2 (Task CRUD) to be completed first

### T108 Create filter and sort state management
- [x] T108 [P] [US3] Create `src/hooks/useTaskFilters.ts` for filter state
- [x] T109 [P] [US3] Define filter types: status, priority, category
- [x] T110 [P] [US3] Define sort types: field, order
- [x] T111 [P] [US3] Create combined filter/sort state interface

### T112 Build search and filter components
- [x] T112 [P] [US3] Create `src/components/tasks/TaskSearch.tsx` with debounced input
- [x] T113 [P] [US3] Create `src/components/tasks/TaskFilters.tsx` with dropdowns
- [x] T114 [P] [US3] Create `src/components/tasks/TaskSort.tsx` with sort options
- [x] T115 [P] [US3] Add clear/reset functionality to all filters

### T116 Implement client-side filtering logic
- [x] T116 [US3] Add search filtering (title + description) to useTasks hook
- [x] T117 [US3] Add status filter (all/pending/completed) to useTasks hook
- [x] T118 [US3] Add priority filter (all/high/medium/low) to useTasks hook
- [x] T119 [US3] Add category filter (all/work/personal/etc) to useTasks hook
- [x] T120 [US3] Add sorting logic (due_date, priority, title, created_at) to useTasks hook
- [x] T121 [US3] Handle edge case: tasks without due dates in date sorting

### T122 Update tasks page with organization features
- [x] T122 [US3] Add TaskSearch component to tasks page
- [x] T123 [US3] Add TaskFilters component to tasks page
- [x] T124 [US3] Add TaskSort component to tasks page
- [x] T125 [US3] Update TaskList to show "no results" state
- [x] T126 [US3] Add filter chips showing active filters

### T127 Test organization features
- [ ] T127 [US3] Test search with partial matches
- [ ] T128 [US3] Test search debounce (300ms delay)
- [ ] T129 [US3] Test status filter (pending/completed)
- [ ] T130 [US3] Test priority filter (high/medium/low)
- [ ] T131 [US3] Test category filter (work/personal/etc)
- [ ] T132 [US3] Test sort by due date (ascending/descending)
- [ ] T133 [US3] Test sort by priority (high to low/low to high)
- [ ] T134 [US3] Test sort by title (A-Z/Z-A)
- [ ] T135 [US3] Test combined filters and search
- [ ] T136 [US3] Test "no results" empty state

---

## Phase 6: User Story 4 - User Profile Management (P3)

**Goal**: Implement profile viewing, updating, and password change

**Independent Test**: Update profile name → verify change persists, change password → verify success.

### T137 Create profile API functions
- [x] T137 [P] [US4] Add `getProfile` function to `src/lib/api/tasks.ts`
- [x] T138 [P] [US4] Add `updateProfile` function to `src/lib/api/tasks.ts`
- [x] T139 [P] [US4] Add `changePassword` function to `src/lib/api/tasks.ts`

### T140 Create profile components
- [x] T140 [P] [US4] Create `src/components/profile/ProfileForm.tsx`
- [x] T141 [P] [US4] Create `src/components/profile/PasswordChangeForm.tsx`
- [x] T142 [P] [US4] Create `src/components/profile/AccountSettings.tsx`

### T143 Create profile page
- [x] T143 [US4] Create `src/app/(dashboard)/profile/page.tsx`
- [x] T144 [US4] Add profile header with user info and stats
- [x] T145 [US4] Integrate ProfileForm with API
- [x] T146 [US4] Integrate PasswordChangeForm with API
- [x] T147 [US4] Add logout button functionality
- [x] T148 [US4] Add loading states for all operations

### T149 Test profile management
- [ ] T149 [US4] Test view profile information
- [ ] T150 [US4] Test update profile name
- [ ] T151 [US4] Test change password with validation
- [ ] T152 [US4] Test logout functionality
- [ ] T153 [US4] Test error handling for invalid inputs

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Add animations, optimize performance, and ensure quality

### T154 Configure animations using @skills/ui-animation
- [x] T154 [P] Use `@skills/ui-animation` skill to create `src/lib/utils/animations.ts`
- [x] T155 [P] Implement `FadeInUp` variant for content entrances
- [x] T156 [P] Implement stagger animations for lists/grids
- [x] T157 [P] Add hover animations (scale ≤ 1.02) to interactive elements
- [x] T158 [P] Apply animations to TaskList items
- [x] T159 [P] Apply animations to modal dialogs
- [x] T160 [P] Apply animations to page transitions

### T161 Add toast notifications
- [x] T161 [P] Configure Sonner toast library
- [x] T162 [P] Add success toasts for all operations
- [x] T163 [P] Add error toasts with retry options
- [x] T164 [P] Add loading toasts for long operations

### T165 Create utility functions
- [x] T165 [P] Create `src/lib/utils/date.ts` for date formatting
- [x] T166 [P] Create `src/lib/utils/validation.ts` for form schemas
- [x] T167 [P] Create `src/lib/utils/helpers.ts` for general utilities

### T168 Implement responsive design
- [ ] T168 [US2] Make TaskItem responsive (desktop row → mobile card)
- [ ] T169 [US3] Make filter/sort toolbar responsive
- [ ] T170 [US1] Make auth forms responsive
- [ ] T171 [US4] Make profile page responsive
- [ ] T172 Test at 320px width (minimum supported)

### T173 Add loading and empty states
- [ ] T173 [US2] Add skeleton loaders for task list
- [ ] T174 [US2] Add loading states for all buttons
- [ ] T175 [US3] Add "no search results" state
- [ ] T176 [US1] Add auth loading states

### T177 Performance optimization
- [ ] T177 [P] Configure Next.js image optimization
- [ ] T178 [P] Implement dynamic imports for heavy components
- [ ] T179 [P] Analyze bundle size and optimize
- [ ] T180 [P] Add React Query cache optimization

### T181 Error handling and edge cases
- [ ] T181 [US1] Handle session expiration during operations
- [ ] T182 [US2] Handle network failures with retry
- [ ] T183 [US2] Handle validation errors with field feedback
- [ ] T184 [US3] Handle empty filter results gracefully
- [ ] T185 [US4] Handle password validation failures

### T186 Testing setup
- [ ] T186 [P] Install Jest and React Testing Library
- [ ] T187 [P] Configure test environment for Next.js
- [ ] T188 [P] Create unit tests for utility functions
- [ ] T189 [P] Create component tests for UI primitives
- [ ] T190 [P] Create integration tests for auth flow
- [ ] T191 [P] Create integration tests for task CRUD

---

## Implementation Strategy

### MVP Approach
1. **Phase 1**: Complete project setup (T001-T008)
2. **Phase 2**: Complete foundational setup (T009-T036)
3. **Phase 3**: Complete User Story 1 (T037-T061) - Authentication
4. **Phase 4**: Complete User Story 2 (T062-T107) - Task CRUD

This provides a fully functional Todo application with authentication and task management.

### Incremental Delivery
- **Week 1**: Phases 1-3 (Setup + Authentication)
- **Week 2**: Phase 4 (Task CRUD)
- **Week 3**: Phase 5 (Organization) + Phase 6 (Profile)
- **Week 4**: Phase 7 (Polish) + Testing

### Parallel Development
- **Team A**: Phases 1-3 (Setup + Auth)
- **Team B**: Phase 4 (Task CRUD) - can start after Phase 2
- **Team C**: Phase 6 (Profile) - can run in parallel with Team A/B
- **Team D**: Phase 7 (Polish) - can start once core features are stable

---

## Task Summary

**Total Tasks**: 191
- **Setup**: 8 tasks
- **Foundational**: 28 tasks
- **US1 (Auth)**: 25 tasks
- **US2 (Task CRUD)**: 46 tasks
- **US3 (Organization)**: 29 tasks
- **US4 (Profile)**: 17 tasks
- **Polish**: 38 tasks

**Independent Test Criteria**:
- **US1**: Redirect behavior, signup/login flow, session management
- **US2**: Create/edit/delete/toggle operations with optimistic updates
- **US3**: Search debounce, filter combinations, sort accuracy
- **US4**: Profile updates, password changes, logout functionality

**Parallel Opportunities**: 46 tasks marked [P] for parallel execution within phases

**MVP Scope**: Phases 1-4 (87 tasks) for core authentication and task management functionality