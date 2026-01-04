# Research: Next.js Todo Web Application Frontend

**Feature**: 003-nextjs-frontend
**Date**: 2025-12-29
**Status**: Complete

## Overview

This research document resolves technical unknowns and validates technology choices for the Phase 2 Todo Web Application frontend, built with Next.js 16+ (App Router), TypeScript, and Tailwind CSS following the Modern Technical Editorial design system.

## Technical Unknowns Resolution

### 1. Next.js App Router vs Pages Router
**Decision**: App Router (Next.js 16+)
**Rationale**:
- App Router is the recommended approach for Next.js 16+
- Better support for React Server Components (RSC)
- Improved performance with server-side rendering
- Native support for route groups and protected routes
- Better TypeScript integration

**Alternatives Considered**: Pages Router (legacy approach)

### 2. Authentication Strategy
**Decision**: Better Auth with JWT Plugin
**Rationale**:
- Modern auth solution designed for Next.js App Router
- Built-in JWT support for API authentication
- Excellent TypeScript support
- Handles session management, password hashing, and security best practices
- Compatible with the constitution's requirement for JWT-based auth

**Alternatives Considered**: NextAuth.js, Auth.js, custom JWT implementation

### 3. State Management Approach
**Decision**: React Query (TanStack Query) + React Hook Form
**Rationale**:
- React Query handles server state, caching, and optimistic updates
- React Hook Form provides robust form handling with minimal re-renders
- Both libraries have excellent TypeScript support
- Works seamlessly with Next.js Server Components
- Supports the constitution's requirement for stateless services

**Alternatives Considered**: Zustand, Redux Toolkit, SWR

### 4. API Integration Layer
**Decision**: Native fetch + custom client abstraction
**Rationale**:
- No additional HTTP client dependencies needed
- Backend-agnostic design as specified in requirements
- Can easily switch between development and production APIs
- Supports JWT authentication headers
- Follows the constitution's principle of decoupling

**Alternatives Considered**: Axios, tRPC, GraphQL

### 5. Animation Library
**Decision**: Framer Motion
**Rationale**:
- Industry standard for React animations
- Declarative API for complex animations
- Supports the Modern Technical Editorial design system requirements
- Excellent performance with hardware acceleration
- Works with Next.js Server Components

**Alternatives Considered**: React Spring, CSS animations, GSAP

### 6. UI Component Library Strategy
**Decision**: Build custom components using Tailwind CSS
**Rationale**:
- Full control over Modern Technical Editorial design system
- No external component library dependencies
- Optimized for specific use cases (task management)
- Consistent with design tokens (colors, typography)
- Better performance (no unused component code)

**Alternatives Considered**: shadcn/ui, Headless UI, Radix UI

### 7. Toast/Notification System
**Decision**: Sonner
**Rationale**:
- Modern toast library designed for React
- Excellent TypeScript support
- Minimal API surface
- Supports the Modern Technical Editorial aesthetic
- Works well with Next.js App Router

**Alternatives Considered**: react-hot-toast, react-toastify

### 8. Form Validation Strategy
**Decision**: React Hook Form + Zod (implied)
**Rationale**:
- React Hook Form for form state management
- Zod schemas for type-safe validation
- Real-time validation feedback
- Minimal re-renders
- Integration with the Modern Technical Editorial design system

**Alternatives Considered**: Formik, Yup, native HTML5 validation

### 9. Responsive Design Approach
**Decision**: Mobile-first Tailwind CSS with breakpoints
**Rationale**:
- Tailwind's mobile-first breakpoint system
- Consistent with Modern Technical Editorial design
- Supports the requirement for 320px minimum width
- Easy to maintain and extend

**Alternatives Considered**: CSS Grid/Flexbox with media queries, styled-components

### 10. Data Fetching Strategy
**Decision**: React Server Components + SWR for client-side
**Rationale**:
- RSC for initial page loads and SEO
- SWR for client-side data updates and real-time features
- Supports optimistic updates as required
- Works with the constitution's stateless requirement

**Alternatives Considered**: Client-side only, pure Server Components

## Technology Stack Validation

### Framework & Language
- ✅ **Next.js 16+**: App Router, RSC support, TypeScript-first
- ✅ **TypeScript 5.x**: Strict typing, interfaces for all entities
- ✅ **Tailwind CSS 4.x**: Modern utility-first CSS

### Authentication & Security
- ✅ **Better Auth**: JWT strategy, secure cookie storage
- ✅ **Environment variables**: NEXT_PUBLIC_API_URL, BETTER_AUTH_SECRET
- ✅ **Route protection**: AuthGuard component for dashboard routes

### Data & State Management
- ✅ **React Query**: Server state, caching, optimistic updates
- ✅ **React Hook Form**: Form state, validation, performance
- ✅ **Native fetch**: HTTP client abstraction

### UI & UX
- ✅ **Framer Motion**: Animations, transitions, stagger effects
- ✅ **Lucide React**: Icon library
- ✅ **Sonner**: Toast notifications
- ✅ **Custom components**: Tailwind-styled, design system compliant

### Design System Compliance

#### Color Palette
- ✅ Background: `#F9F7F2` (Warm Cream)
- ✅ Surface: `#F0EBE0` (Darker Cream)
- ✅ Structure: `#E5E0D6` (Wireframe Grey)
- ✅ Text Primary: `#2A1B12` (Espresso)
- ✅ Text Secondary: `#5C4D45` (Mocha)
- ✅ Primary Accent: `#FF6B4A` (Vibrant Orange)

#### Typography
- ✅ **Serif**: Playfair Display (headings)
- ✅ **Sans**: DM Sans (body text)
- ✅ **Mono**: JetBrains Mono (labels, data)

#### Animation System
- ✅ **FadeInUp**: Content entrances
- ✅ **Stagger**: Lists and grids
- ✅ **Hover scales**: ≤ 1.02
- ✅ **Entrance duration**: 0.8s

## Architecture Decisions

### 1. Backend-Agnostic API Layer
**Decision**: Create `lib/api/client.ts` abstraction
**Rationale**: Allows switching between development backend, mock APIs, and production without code changes

### 2. Optimistic UI Updates
**Decision**: Implement for task operations (create, update, delete, toggle)
**Rationale**: Provides immediate feedback, improves perceived performance, aligns with FR-017

### 3. Route Groups Structure
**Decision**:
- `(auth)` group: `/login`, `/signup` (unprotected)
- `(dashboard)` group: `/tasks`, `/profile` (protected)
**Rationale**: Clean separation, automatic route protection, better code organization

### 4. Modal-Based Forms
**Decision**: TaskForm as modal/dialog for create/edit
**Rationale**:
- Reusable component
- Maintains context (no page navigation)
- Better mobile experience
- Supports animation requirements

### 5. Client-Side Search & Filter
**Decision**: Debounced search with client-side filtering
**Rationale**:
- Faster perceived performance
- Reduces API calls
- Works offline (cached data)
- Supports the 500ms requirement for 1000 tasks

## Performance Considerations

### 1. Bundle Optimization
- ✅ Tree-shaking with ES modules
- ✅ Dynamic imports for heavy components
- ✅ Image optimization with Next.js Image component

### 2. Rendering Strategy
- ✅ Server Components for static content
- ✅ Client Components for interactivity
- ✅ Streaming for slow data sources

### 3. Data Fetching
- ✅ React Query caching
- ✅ Stale-while-revalidate
- ✅ Request deduplication

## Security Considerations

### 1. Authentication
- ✅ JWT tokens in secure HTTP-only cookies
- ✅ Better Auth handles password hashing
- ✅ Session expiration management

### 2. Authorization
- ✅ AuthGuard protects all dashboard routes
- ✅ API calls include user_id from session
- ✅ Row-level security in backend (enforced)

### 3. Input Validation
- ✅ Client-side validation (React Hook Form)
- ✅ Server-side validation (API layer)
- ✅ Sanitization for XSS prevention

## Testing Strategy

### 1. Component Testing
- ✅ React Testing Library
- ✅ Jest for unit tests
- ✅ User-centric testing approach

### 2. Integration Testing
- ✅ End-to-end user flows
- ✅ API integration tests
- ✅ Authentication flow tests

### 3. Performance Testing
- ✅ Lighthouse CI
- ✅ Core Web Vitals monitoring
- ✅ Animation frame rate testing

## Deployment Considerations

### 1. Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
```

### 2. Build Configuration
- ✅ TypeScript strict mode
- ✅ ESLint for code quality
- ✅ Tailwind CSS optimization
- ✅ Image optimization

### 3. Runtime Requirements
- ✅ Node.js 18+ (Next.js 16+ requirement)
- ✅ Modern browser support (ES2020+)

## Risk Assessment

### High Priority Risks
1. **API Integration**: Backend may not match expected contract
   - Mitigation: Create mock API layer for development

2. **Authentication Flow**: Better Auth configuration complexity
   - Mitigation: Follow official Next.js App Router examples

3. **Performance**: Large task lists may impact performance
   - Mitigation: Virtual scrolling, pagination, client-side filtering

### Medium Priority Risks
1. **Mobile Responsiveness**: Complex UI may not scale well
   - Mitigation: Mobile-first design, extensive testing

2. **Animation Performance**: Complex animations may drop frames
   - Mitigation: Hardware acceleration, reduced motion preferences

3. **Type Safety**: API response types may drift
   - Mitigation: Shared types, strict TypeScript, API client abstraction

## Conclusion

All technical unknowns have been resolved with modern, production-ready technologies that align with:
- ✅ Feature specification requirements
- ✅ Project constitution principles
- ✅ Modern Technical Editorial design system
- ✅ Performance and security requirements

The technology stack is validated and ready for implementation.