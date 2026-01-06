# Research: Frontend Design Implementation

**Feature**: 006-frontend-design
**Date**: 2026-01-05
**Status**: Phase 0 Complete

## Overview

This research document addresses technical decisions and best practices for implementing the Modern Technical Editorial landing page with state-managed authentication UI.

## Technical Context

**Frontend Stack**: Next.js 16+ (App Router), TypeScript, Tailwind CSS
**Authentication**: Better Auth with JWT strategy
**Animation**: Framer Motion
**Design System**: Modern Technical Editorial aesthetic
**State Management**: React hooks + Better Auth client

## Key Decisions & Research Findings

### Decision 1: Authentication State Management

**Decision**: Use Better Auth's `useSession` hook combined with React Context for global auth state

**Rationale**:
- Better Auth provides built-in `useSession` hook that returns current user and authentication status
- React Context enables prop-drilling avoidance across navbar and child components
- Follows React best practices for global state that doesn't require Redux complexity
- Compatible with Next.js App Router server components (use client directive for interactive parts)

**Alternatives Considered**:
- ✅ **Selected**: Better Auth `useSession` + React Context
- ❌ Zustand: Overkill for single auth state requirement
- ❌ Redux: Heavyweight for this scope
- ❌ Local component state: Would require prop drilling through multiple levels

**Implementation Pattern**:
```typescript
// Auth context provider at app level
const AuthProvider = ({ children }) => {
  const { data: session, status } = useSession();
  return (
    <AuthContext.Provider value={{ session, status }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Decision 2: Component Architecture

**Decision**: Modular component structure with dedicated sections and shared UI primitives

**Rationale**:
- Separation of concerns for maintainability
- Reusability of UI primitives (buttons, cards, etc.)
- Clear testing boundaries
- Follows Next.js App Router patterns

**Component Structure**:
```
src/components/
├── layout/
│   ├── Navbar.tsx          # State-managed navigation
│   └── Footer.tsx          # Footer with links
├── sections/
│   ├── Hero.tsx            # Hero section
│   ├── Features.tsx        # Core features grid
│   ├── TechStack.tsx       # Technology showcase
│   └── Footer.tsx          # Footer section
├── ui/
│   ├── Button.tsx          # Reusable button variants
│   ├── Card.tsx            # Feature cards
│   └── Icons.tsx           # Icon components
└── providers/
    └── AuthProvider.tsx    # Auth context
```

### Decision 3: Animation Strategy

**Decision**: Use Framer Motion with custom easing curves and physics-based animations

**Rationale**:
- Framer Motion provides GPU-accelerated transforms (x, y, scale, opacity)
- Custom easing curve `[0.22, 1, 0.36, 1]` creates premium feel
- Physics-based springs prevent janky JavaScript animations
- Staggered animations improve perceived performance

**Animation Patterns**:
- **FadeInUp**: For hero text, feature cards (0.8s duration)
- **LineDraw**: For dividers and technical separators (1.2s duration)
- **Stagger**: For feature grid items (0.1s delay per item)
- **Hover**: Subtle scale (1.02) and lift (-1px) for interactive elements

**Performance Considerations**:
- Use `whileInView` for lazy loading animations
- `viewport={{ once: true }}` to prevent re-animation
- GPU transforms only (no layout properties)

### Decision 4: Responsive Design Strategy

**Decision**: Mobile-first approach with 768px tablet breakpoint and Tailwind utilities

**Rationale**:
- Mobile-first ensures core experience works on smallest screens
- 768px is standard tablet breakpoint (matches user requirement)
- Tailwind's mobile-first responsive modifiers (`md:`, `lg:`) are intuitive
- Modern Technical Editorial aesthetic scales well across sizes

**Breakpoint Strategy**:
- **Mobile (<768px)**: Single column layouts, simplified navigation
- **Tablet/Desktop (≥768px)**: Multi-column grids, full navigation
- **Typography**: Use `clamp()` for fluid scaling (4rem-9rem for hero)

### Decision 5: Integration with Existing Better Auth

**Decision**: Leverage existing Better Auth setup from 004-frontend-auth branch

**Rationale**:
- Better Auth already configured with Neon PostgreSQL
- JWT strategy implemented and tested
- Session management working across routes
- No need to reinvent authentication flow

**Integration Points**:
- Use existing `auth.client.ts` for client-side auth operations
- Leverage existing middleware for route protection
- Reuse existing session validation patterns
- Extend existing auth UI components if needed

## Technology-Specific Best Practices

### Next.js 16+ App Router
- **Server Components**: Use for static content (hero text, tech stack data)
- **Client Components**: Use `use client` only for interactive elements (navbar, hover states)
- **Layouts**: Root layout provides auth provider wrapper
- **Loading States**: Use `loading.tsx` for smooth transitions

### TypeScript
- **Strict Typing**: All props and state must be typed
- **Interface Definitions**: For all component props
- **Auth Types**: Extend Better Auth session types if needed
- **Event Handlers**: Properly type all click/hover handlers

### Tailwind CSS
- **Custom Colors**: Configure design tokens in `tailwind.config.ts`
- **Typography**: Import and configure serif/sans/mono fonts
- **Animations**: Use Tailwind for transitions, Framer Motion for complex animations
- **Responsive**: Mobile-first modifiers

### Framer Motion
- **Installation**: `npm install framer-motion`
- **Wrapper Pattern**: `const MotionLink = motion(Link)` for Next.js Link
- **Layout Prop**: Use for structural changes (filtering, resizing)
- **Performance**: Avoid animating layout properties, use transforms

## Edge Cases & Error Handling

### Authentication Edge Cases
1. **Loading State**: Show skeleton UI while session loads
2. **Error State**: Handle auth failures gracefully
3. **Transition States**: Smooth transitions between logged-in/logged-out
4. **Session Expiry**: Handle token refresh automatically

### Responsive Edge Cases
1. **Touch Targets**: Ensure minimum 44px tap targets on mobile
2. **Font Scaling**: Use clamp() for fluid typography
3. **Layout Reflow**: Test horizontal scroll on narrow screens
4. **Navigation**: Mobile hamburger menu vs desktop horizontal nav

### Animation Edge Cases
1. **Reduced Motion**: Respect user's motion preferences
2. **Performance**: Monitor frame drops on low-end devices
3. **Browser Support**: Framer Motion fallbacks for older browsers
4. **Hydration**: Ensure server/client rendering consistency

## Testing Strategy

### Unit Tests
- **Components**: Test rendering with different auth states
- **Hooks**: Test useSession integration
- **Utilities**: Test animation utilities and helpers

### Integration Tests
- **Auth Flow**: Login → Navbar update → Logout
- **Responsive**: Test component layouts across breakpoints
- **Animation**: Verify animation triggers and timing

### E2E Tests
- **User Journey**: Complete landing page experience
- **Performance**: Load time and animation performance
- **Accessibility**: Keyboard navigation and screen reader support

## Dependencies & Installation

```bash
# Core dependencies
npm install framer-motion

# Already installed (from existing setup)
# - Next.js 16+
# - TypeScript
# - Tailwind CSS
# - Better Auth (client)
```

## Implementation Order

1. **Setup**: Install Framer Motion, configure design tokens
2. **Foundation**: Create UI primitives (Button, Card, Icons)
3. **Layout**: Build Navbar and Footer components
4. **Sections**: Implement Hero, Features, TechStack
5. **Integration**: Connect auth state to Navbar
6. **Animation**: Add Framer Motion animations
7. **Testing**: Verify responsive behavior and performance

## Success Metrics

- **Performance**: All components render within 2 seconds
- **UX**: 95% user comprehension within 10 seconds
- **Animation**: 200ms response time for interactions
- **Responsive**: Consistent experience across 5+ viewport sizes
- **Auth**: 100% state transition accuracy

---

**Research Status**: ✅ Complete
**Next Phase**: Phase 1 - Design & Contracts