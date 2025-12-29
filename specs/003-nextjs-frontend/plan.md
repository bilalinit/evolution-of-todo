# Implementation Plan: Next.js Todo Web Application Frontend

**Branch**: `003-nextjs-frontend` | **Date**: 2025-12-29 | **Spec**: `specs/003-nextjs-frontend/spec.md`
**Input**: Feature specification from `/specs/003-nextjs-frontend/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This plan outlines the implementation of a comprehensive Todo Web Application frontend using Next.js 16+ (App Router), TypeScript, and Tailwind CSS. The application features user authentication, full task CRUD operations, search/filter/sort capabilities, and user profile management, all following the Modern Technical Editorial design system. The architecture prioritizes backend-agnostic API integration, optimistic UI updates, and smooth animations for an exceptional user experience.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16+ (App Router), React 18+
**Primary Dependencies**: Better Auth, React Query (TanStack Query), React Hook Form, Framer Motion, Sonner, Lucide React
**Storage**: Client-side state management with React Query, JWT tokens in secure cookies
**Testing**: Jest + React Testing Library (unit/integration), Playwright (e2e)
**Target Platform**: Modern web browsers (desktop + mobile), responsive down to 320px width
**Project Type**: Web application (frontend)
**Performance Goals**: 60fps animations, <500ms search/filter operations for 1000 tasks, <100ms UI feedback
**Constraints**: Mobile-first responsive design, accessibility compliance, SEO optimization
**Scale/Scope**: Single-user focused, scalable to multiple users with proper backend

## Constitution Check

✅ **PASSED** - All principles satisfied

### I. Universal Logic Decoupling
✅ **COMPLIANT**: Business logic (task CRUD, auth flows) is decoupled in `lib/api/` and `lib/auth/` layers. Presentation components only handle UI rendering and user interactions.

### II. AI-Native Interoperability (MCP-First)
✅ **COMPLIANT**: While this is the frontend, the API layer is designed for MCP compatibility. All API calls go through `lib/api/client.ts` abstraction, making it easy to swap between REST and MCP protocols.

### III. Strict Statelessness
✅ **COMPLIANT**: No local session storage. All state managed via React Query (server state) and React Hook Form (form state). Better Auth handles JWT tokens in secure HTTP-only cookies.

### IV. Event-Driven Decoupling
✅ **COMPLIANT**: Frontend uses optimistic updates for immediate feedback, with proper error handling and rollback mechanisms. Ready for future event-driven backend integration.

### V. Zero-Trust Multi-Tenancy
✅ **COMPLIANT**: All API calls include user_id from authenticated session. Frontend enforces route protection with AuthGuard component. No cross-user data access possible.

### Technology Stack Compliance
✅ **COMPLIANT**:
- Frontend: Next.js 16+, TypeScript, Tailwind CSS ✅
- Authentication: Better Auth with JWT ✅
- State Management: React Query + React Hook Form ✅
- Animations: Framer Motion ✅
- All dependencies are modern and approved

## Project Structure

### Documentation (this feature)

```text
specs/003-nextjs-frontend/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - technical decisions & validation
├── data-model.md        # Phase 1 output - TypeScript interfaces & types
├── quickstart.md        # Phase 1 output - setup & usage guide
├── contracts/           # Phase 1 output - API specifications
│   ├── openapi.yaml    # OpenAPI 3.0 specification
│   ├── graphql-schema.graphql # GraphQL alternative
│   └── rest-api.md     # Detailed REST API docs
└── tasks.md             # Phase 2 output - actionable tasks (TBD)
```

### Source Code Structure (frontend/ directory)

```text
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
│   │   │   │   └── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...all]/
│   │   │           └── route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                       # Reusable primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   └── Skeleton.tsx
│   │   ├── tasks/                    # Task-specific
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
│   │   │   ├── client.ts
│   │   │   ├── tasks.ts
│   │   │   └── types.ts
│   │   ├── auth/
│   │   │   ├── auth-client.ts
│   │   │   └── hooks.ts
│   │   ├── utils/
│   │   │   ├── date.ts
│   │   │   ├── validation.ts
│   │   │   ├── helpers.ts
│   │   │   └── animations.ts
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── useTasks.ts
│   │   ├── useTaskFilters.ts
│   │   └── useDebounce.ts
│   └── types/
│       ├── task.ts
│       ├── user.ts
│       └── api.ts
├── public/
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── .env.local
```

**Structure Decision**: Web application structure with route groups for authentication separation, dedicated layers for API integration, state management, and UI components. This follows Next.js App Router best practices and supports the constitution's decoupling principles.

## Complexity Tracking

> **No violations** - All approaches follow standard modern web development patterns

| Aspect | Approach | Rationale |
|--------|----------|-----------|
| **Route Groups** | `(auth)` and `(dashboard)` separation | Clean separation of protected vs public routes, automatic auth guard integration |
| **API Abstraction** | `lib/api/client.ts` layer | Backend-agnostic design, easy testing, future MCP compatibility |
| **Optimistic Updates** | React Query mutations with rollback | Immediate user feedback, better UX, handles network failures gracefully |
| **Component Architecture** | Layered approach (ui → tasks → pages) | Reusability, maintainability, clear separation of concerns |
| **State Management** | React Query + React Hook Form | Industry standard, excellent TypeScript support, minimal boilerplate |

## Implementation Phases

### Phase 1: Foundation (Week 1)
- ✅ **Research & Planning**: Complete (this document + artifacts)
- 🔄 **Project Setup**: Initialize Next.js, configure Tailwind, install dependencies
- 🔄 **Core UI Primitives**: Build reusable components (Button, Input, Badge, etc.)
- 🔄 **Layout Components**: Header, Footer, route group layouts

### Phase 2: Authentication (Week 1-2)
- 🔄 **Better Auth Integration**: Configure client, API routes, hooks
- 🔄 **Auth Components**: LoginForm, SignupForm, AuthGuard
- 🔄 **Protected Routes**: Dashboard layout with auth protection
- 🔄 **Session Management**: useSession hook, token handling

### Phase 3: Task CRUD (Week 2)
- 🔄 **Task Components**: TaskList, TaskItem, TaskForm (modal)
- 🔄 **API Integration**: Task API functions with React Query
- 🔄 **Optimistic Updates**: Toggle completion, create, update, delete
- 🔄 **Visual Feedback**: Loading states, error handling, toast notifications

### Phase 4: Organization Features (Week 3)
- 🔄 **Search & Filter**: TaskSearch with debounce, TaskFilters
- 🔄 **Sorting**: TaskSort with multiple criteria
- 🔄 **Empty States**: No tasks, no results, loading skeletons
- 🔄 **Responsive Design**: Mobile-first, testing down to 320px

### Phase 5: User Profile (Week 3)
- 🔄 **Profile Page**: User info, stats display
- 🔄 **Profile Update**: Name change functionality
- 🔄 **Password Change**: Secure password update flow
- 🔄 **Logout & Account**: Session termination, account actions

### Phase 6: Polish & Integration (Week 4)
- 🔄 **Animations**: Framer Motion integration, stagger effects
- 🔄 **Design System**: Modern Technical Editorial styling throughout
- 🔄 **Performance**: Bundle optimization, image optimization
- 🔄 **Testing**: Unit tests, integration tests, e2e tests

### Phase 7: Deployment (Week 4)
- 🔄 **Production Build**: Optimization, environment configuration
- 🔄 **Deployment**: Vercel/Netlify setup
- 🔄 **Monitoring**: Error tracking, performance monitoring

## Key Technical Decisions

### 1. API Layer Abstraction
**Decision**: Create `lib/api/client.ts` as the sole entry point for all backend communication
**Rationale**:
- Backend-agnostic design as specified
- Easy to switch between REST, GraphQL, or MCP
- Centralized error handling and authentication
- Simplifies testing with mock implementations

### 2. Optimistic UI Strategy
**Decision**: Use React Query mutations with manual optimistic updates
**Rationale**:
- Immediate feedback for user actions (<100ms target)
- Better perceived performance
- Proper rollback on failures
- Matches FR-017 requirement

### 3. Route Group Architecture
**Decision**: Use Next.js App Router route groups `(auth)` and `(dashboard)`
**Rationale**:
- Clean separation of concerns
- Automatic route protection via layout
- Better code organization
- Follows Next.js 16+ best practices

### 4. State Management Stack
**Decision**: React Query for server state, React Hook Form for forms
**Rationale**:
- Industry standard with excellent TypeScript support
- Minimal boilerplate, maximum type safety
- Built-in caching, optimistic updates, error handling
- Works seamlessly with Next.js App Router

### 5. Animation Approach
**Decision**: Framer Motion with custom variants for Modern Technical Editorial
**Rationale**:
- Declarative API for complex animations
- Hardware acceleration for 60fps
- Easy integration with React components
- Supports the required stagger and fade effects

## Risk Assessment & Mitigation

### High Priority Risks

1. **API Contract Mismatch**
   - **Risk**: Backend doesn't match defined contracts
   - **Mitigation**: Create mock API server for development, use TypeScript interfaces
   - **Contingency**: API client abstraction allows easy endpoint updates

2. **Authentication Complexity**
   - **Risk**: Better Auth configuration issues, token management bugs
   - **Mitigation**: Follow official Next.js examples, comprehensive testing
   - **Contingency**: Fallback to custom JWT implementation if needed

3. **Performance with Large Datasets**
   - **Risk**: Slow performance with 1000+ tasks
   - **Mitigation**: Client-side filtering with debouncing, virtual scrolling if needed
   - **Contingency**: Implement pagination or server-side filtering

### Medium Priority Risks

1. **Mobile Responsiveness**
   - **Risk**: Complex UI doesn't scale well to small screens
   - **Mitigation**: Mobile-first design, extensive testing on real devices
   - **Contingency**: Simplify UI for mobile, progressive enhancement

2. **Animation Performance**
   - **Risk**: Complex animations drop frames on low-end devices
   - **Mitigation**: Hardware acceleration, reduced motion preferences, performance testing
   - **Contingency**: Graceful degradation to simpler animations

3. **Type Safety Drift**
   - **Risk**: API response types don't match actual backend
   - **Mitigation**: Shared TypeScript types, strict TypeScript config
   - **Contingency**: Runtime validation, defensive programming

## Success Metrics

### Functional Requirements (All from spec)
- ✅ User authentication with JWT tokens
- ✅ Full task CRUD operations
- ✅ Search, filter, and sort capabilities
- ✅ User profile management
- ✅ Optimistic UI updates
- ✅ Modern Technical Editorial design system
- ✅ Responsive design (320px+)

### Performance Targets
- **Authentication Flow**: <30 seconds (SC-001)
- **Task Operations**: <100ms visual feedback (SC-002)
- **Search/Filter**: <500ms for 1000 tasks (SC-003)
- **User Success Rate**: 95% first-attempt success (SC-004)
- **Animation Performance**: 60fps maintained (SC-005)
- **Form Validation**: Real-time feedback (SC-006)
- **Mobile Compatibility**: 320px+ width (SC-007)
- **Error Recovery**: 90% retry success (SC-008)

### Code Quality Metrics
- **TypeScript Strict Mode**: 100% compliance
- **Test Coverage**: >80% unit tests, >90% critical paths
- **Bundle Size**: <200kb initial JS (gzipped)
- **Lighthouse Score**: >90 performance, >95 accessibility

## Next Steps

### Immediate Actions
1. **Initialize Project**: Run `npx create-next-app@latest frontend` with specified flags
2. **Install Dependencies**: Add all required packages from research.md
3. **Configure Design System**: Set up Tailwind with Modern Technical Editorial tokens
4. **Create Folder Structure**: Implement the architecture defined above

### Dependencies on External Work
- **Backend API**: Needs to implement the OpenAPI/REST contracts defined in `contracts/`
- **Better Auth**: Requires backend API routes for `/api/auth/[...all]/route.ts`
- **Database**: Backend needs PostgreSQL/SQLite setup for user and task data

### Command to Generate Tasks
Once setup is complete, run:
```bash
/sp.tasks
```
This will generate actionable implementation tasks based on this plan.

## Summary

This implementation plan provides a complete roadmap for building a production-ready Todo Web Application frontend. All technical decisions are validated against the project constitution, risks are identified and mitigated, and success metrics are clearly defined. The architecture supports backend-agnostic integration, optimistic user experience, and the Modern Technical Editorial design system.

**Ready for implementation** ✅

## Complexity Tracking

> **No constitution violations** - All approaches follow established best practices

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| **Route Groups** | Clean separation of auth vs protected routes | Single layout with conditional rendering would be more complex |
| **API Abstraction Layer** | Backend-agnostic design, future MCP compatibility | Direct API calls would couple components to specific endpoints |
| **Optimistic Updates** | Meet <100ms feedback requirement (SC-002) | Wait-for-server would feel sluggish |
| **Multi-layer Component Architecture** | Reusability and maintainability at scale | Flat structure would lead to code duplication |
