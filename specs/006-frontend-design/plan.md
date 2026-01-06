# Implementation Plan: Frontend Design Implementation

**Branch**: `006-frontend-design` | **Date**: 2026-01-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-frontend-design/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a complete Modern Technical Editorial landing page for the task management platform with state-managed authentication UI. The implementation will feature 6 core sections (Hero, Features, Tech Stack, Footer, Navbar) using Next.js 16+ App Router, TypeScript, Tailwind CSS, Framer Motion, and Better Auth integration. The design follows the Modern Technical Editorial aesthetic with cream backgrounds, orange accents, and typography hierarchy.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16.1.1 (App Router), Node.js 18+
**Primary Dependencies**: Framer Motion, Better Auth (client), Tailwind CSS, Lucide React icons
**Storage**: N/A (Client-side state management only)
**Target Platform**: Web (responsive: mobile, tablet, desktop)
**Project Type**: Web application (frontend landing page)
**Performance Goals**: 2-second page load, 200ms interaction response, 60fps animations
**Constraints**: Mobile-first design, 768px breakpoint, respect prefers-reduced-motion
**Scale/Scope**: Single landing page with 6 sections, state-managed navbar, 3 feature cards, 4 tech stack items

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Constitution Compliance Analysis

**I. Universal Logic Decoupling**: ✅ **PASS**
- Business logic (auth state, navigation) is decoupled from presentation layer
- Components are reusable and independent
- No business logic in UI components

**II. AI-Native Interoperability (MCP-First)**: ✅ **PASS**
- This is a frontend-only feature, no backend services
- All state management is client-side
- Ready for future MCP integration via Better Auth

**III. Strict Statelessness**: ✅ **PASS**
- No local memory storage of session state
- All auth state managed via Better Auth `useSession` hook
- State immediately available from provider

**IV. Event-Driven Decoupling**: ✅ **PASS**
- Frontend-only feature, no inter-service communication
- Ready for future event-driven architecture via Better Auth webhooks
- No direct synchronous coupling

**V. Zero-Trust Multi-Tenancy**: ✅ **PASS**
- Auth state is user-scoped via Better Auth
- No shared state between users
- All components respect authentication boundaries

### Technology Stack Integrity

**Frontend Stack**: ✅ **PASS**
- ✅ Next.js 16+ (App Router) - Required
- ✅ TypeScript - Required
- ✅ Tailwind CSS - Required
- ✅ Framer Motion - Added for animations
- ✅ Better Auth (client) - Required for auth
- ✅ Lucide React - Added for icons

**No Unauthorized Libraries**: ✅ **PASS**
- All dependencies are standard for Next.js 16+ projects
- Framer Motion is industry standard for React animations
- Lucide React is standard for technical iconography

### Security Protocols

**Authentication**: ✅ **PASS**
- Uses existing Better Auth JWT strategy
- No hardcoded secrets
- Session validation on every request

**Communication**: ✅ **PASS**
- All client-side, no internal service communication
- Ready for HTTPS in production

### Operational Standards

**Observability**: ✅ **PASS**
- All components follow consistent patterns
- Error boundaries implemented
- Loading states defined

**Deployment Portability**: ✅ **PASS**
- Container-native design
- Environment variable ready
- No platform-specific code

### Architectural Supremacy

**No Violations**: ✅ **PASS**
- No conflicts between spec requirements and constitution principles
- All requirements align with core principles
- No complexity violations requiring justification

**CONCLUSION**: ✅ **ALL GATES PASSED**
- Ready to proceed with Phase 0 research
- No constitution violations detected
- All technology choices comply with standards

## Project Structure

### Documentation (this feature)

```text
specs/006-frontend-design/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - Technical research & decisions
├── data-model.md        # Phase 1 output - State models & interfaces
├── quickstart.md        # Phase 1 output - Implementation guide
├── contracts/           # Phase 1 output - API contracts
│   ├── component-interfaces.ts  # TypeScript interfaces
│   └── schema.graphql           # GraphQL schema
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
phase-2/frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/           # Public routes (LANDING PAGE)
│   │   │   ├── page.tsx        # Landing page with hero, features, tech stack
│   │   │   └── layout.tsx      # Public layout with HomeNavbar + Footer
│   │   ├── (auth)/             # Auth routes
│   │   │   ├── signin/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/        # Protected routes (DASHBOARD)
│   │   │   ├── tasks/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── layout.tsx          # Root layout (with AuthProvider)
│   │   ├── loading.tsx         # Global loading
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx      # ✅ EXISTING - Dashboard header
│   │   │   ├── HomeNavbar.tsx  # 🆕 NEW - Landing page navbar (from this plan)
│   │   │   └── Footer.tsx      # 🆕 NEW - Landing page footer (from this plan)
│   │   ├── sections/           # Page sections (LANDING PAGE ONLY)
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── TechStack.tsx
│   │   │   └── index.ts
│   │   ├── ui/                 # UI primitives (shared)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Icons.tsx
│   │   │   └── Skeleton.tsx
│   │   ├── providers/          # Context providers
│   │   │   ├── AuthProvider.tsx
│   │   │   └── AnimationProvider.tsx
│   │   └── hooks/              # Custom hooks
│   │       ├── useAuth.ts
│   │       ├── useNavigation.ts
│   │       └── useViewport.ts
│   ├── lib/                    # Utilities
│   │   ├── auth.ts
│   │   ├── animations.ts
│   │   └── constants.ts
│   ├── types/                  # TypeScript definitions
│   │   ├── auth.ts
│   │   ├── components.ts
│   │   └── index.ts
│   └── utils/                  # Helper functions
│       ├── formatters.ts
│       └── validators.ts
├── public/                     # Static assets
├── tailwind.config.ts          # Design system
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
└── next.config.js              # Next.js config
```

**ARCHITECTURE CLARIFICATION**: ✅ **DUAL-NAVBAR APPROACH**
- **Existing**: `Header.tsx` → Dashboard routes (`/tasks`, `/profile`)
- **New**: `HomeNavbar.tsx` → Landing page routes (`/`, `/auth/*`)
- **Coexistence**: Both components serve different contexts

**Structure Decision**: ✅ **Selected - Option 2 (Web Application)**
- **Rationale**: This is a frontend-only feature for the existing Next.js project
- **Location**: `phase-2/frontend/` as specified in user input
- **Pattern**: Next.js 16+ App Router with modular component architecture
- **Separation**: Clear separation between layout, sections, UI primitives, and utilities

## Layout Architecture & Routing Strategy

### Dual-Navbar Implementation

**Problem**: Existing `Header.tsx` serves dashboard routes, but landing page needs its own navbar.

**Solution**: Route-based navbar selection using Next.js App Router groups.

### Route Groups & Component Mapping

```typescript
// src/app/(public)/layout.tsx
import { HomeNavbar } from '@/components/layout/HomeNavbar';
import { Footer } from '@/components/layout/Footer';

export default function PublicLayout({ children }) {
  return (
    <>
      <HomeNavbar />      {/* NEW: Landing page navbar */}
      <main>{children}</main> {/* Hero, Features, TechStack sections */}
      <Footer />          {/* NEW: Landing page footer */}
    </>
  );
}

// src/app/(dashboard)/layout.tsx
import { Header } from '@/components/layout/Header'; // EXISTING

export default function DashboardLayout({ children }) {
  return (
    <>
      <Header />          {/* EXISTING: Dashboard header */}
      <main>{children}</main> {/* Tasks, Profile pages */}
    </>
  );
}
```

### Navbar Comparison

| Feature | `Header.tsx` (Existing) | `HomeNavbar.tsx` (New) |
|---------|------------------------|------------------------|
| **Purpose** | Dashboard navigation | Landing page navigation |
| **Routes** | `/tasks`, `/profile` | `/`, `/auth/signin`, `/auth/signup` |
| **Logged Out** | Redirects to login | Shows "Sign In" + "Get Started" |
| **Logged In** | User menu + logout | User name + icon + navigation |
| **Design** | Standard dashboard | Modern Technical Editorial |
| **Animation** | Basic transitions | Framer Motion enhanced |

### State Management Flow

```typescript
// User visits landing page (/)
// ↓
// HomeNavbar checks auth state via useSession()
// ↓
// If unauthenticated: Show "Sign In" + "Get Started"
// If authenticated: Show user name + icon + "Tasks"/"Profile" links
// ↓
// User clicks "Get Started" → /auth/signup
// User clicks "Sign In" → /auth/signin
// User clicks "Tasks" → /tasks (switches to Header.tsx)
```

### Component Responsibilities

**HomeNavbar.tsx (NEW)**:
- ✅ Modern Technical Editorial styling
- ✅ Framer Motion animations
- ✅ Auth state awareness
- ✅ Landing page route navigation
- ❌ Dashboard route navigation (not needed)

**Header.tsx (EXISTING)**:
- ✅ Dashboard route navigation
- ✅ User menu with logout
- ✅ Mobile navigation
- ❌ Landing page styling (not needed)
- ❌ "Sign In"/"Get Started" buttons (not needed)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations detected** - All complexity is justified by feature requirements:

| Complexity Element | Justification | Why Simpler Alternatives Are Insufficient |
|-------------------|---------------|-------------------------------------------|
| **Framer Motion** | Required for premium animations per Modern Technical Editorial aesthetic | CSS animations alone cannot achieve physics-based springs and custom easing curves |
| **6 Component Categories** | Separation of concerns for maintainability and reusability | Monolithic components would be harder to test and reuse across sections |
| **State Management Context** | Auth state must be available globally without prop drilling | Local state would require passing auth through 3+ component levels |
| **TypeScript Interfaces** | Type safety for 20+ component props and state interfaces | Any would defeat the purpose of compile-time validation |
| **Responsive Design** | Must work across mobile, tablet, desktop (768px+ breakpoint) | Single layout would fail on mobile devices |

**Complexity Score**: Low-Medium
- **Lines of Code**: ~500 (components) + ~200 (types/utilities)
- **Component Count**: 15+ reusable components
- **State Complexity**: 3 state entities (Auth, Navigation, Animation)
- **Dependencies**: 3 new packages (Framer Motion, Lucide React)
