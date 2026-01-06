# Data Model: Frontend Design Implementation

**Feature**: 006-frontend-design
**Date**: 2026-01-05
**Status**: Phase 1 - Data Model

## Overview

This data model defines the client-side state structures and data flow for the frontend design implementation. Since this is a frontend-only feature, the data model focuses on UI state management rather than persistent storage.

## Client-Side State Entities

### 1. Authentication State

**Entity**: `AuthState`
**Purpose**: Manage user authentication status and session data
**Source**: Better Auth `useSession` hook

```typescript
interface AuthState {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  user: User | null;
  session: Session | null;
}

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

interface Session {
  token: string;
  expiresAt: Date;
}
```

**State Transitions**:
- `loading` → `authenticated` (successful login)
- `loading` → `unauthenticated` (no session found)
- `authenticated` → `unauthenticated` (logout)
- `unauthenticated` → `loading` (login initiated)

**Validation Rules**:
- Token must be valid JWT
- Session expiration checked on app load
- Auto-refresh if token expires within 5 minutes

### 2. Navigation State

**Entity**: `NavigationState`
**Purpose**: Track current page and navigation interactions
**Source**: Next.js App Router + React hooks

```typescript
interface NavigationState {
  currentPath: string;
  isMobileMenuOpen: boolean;
  isHovering: boolean;
}

type Path = '/' | '/tasks' | '/profile' | '/auth/signin' | '/auth/signup';
```

**State Transitions**:
- Path changes via Next.js `usePathname`
- Mobile menu toggle on hamburger click
- Hover state for navigation items (affects animation)

### 3. Feature Card State

**Entity**: `FeatureCardState`
**Purpose**: Track hover and interaction states for feature cards
**Source**: Component-level state

```typescript
interface FeatureCardState {
  cardId: string;
  isHovered: boolean;
  animationState: 'idle' | 'hovering' | 'exiting';
}

type FeatureId = 'zero-distractions' | 'lightning-sync' | 'secure-by-default';
```

**State Transitions**:
- `idle` → `hovering` (mouse enter)
- `hovering` → `exiting` (mouse leave)
- `exiting` → `idle` (animation complete)

**Validation Rules**:
- Hover state must trigger within 200ms
- Exit animation must complete before state reset

### 4. Tech Stack Display State

**Entity**: `TechStackState`
**Purpose**: Manage visibility and animation of technology items
**Source**: Intersection Observer + React state

```typescript
interface TechStackState {
  visibleItems: Set<string>;
  animationDelay: number;
}

type TechItem = 'nextjs' | 'fastapi' | 'neon' | 'better-auth';
```

**State Transitions**:
- Items added to `visibleItems` when scrolled into viewport
- Staggered animation delays (0.1s per item)

## Component Props Interfaces

### Navbar Component

```typescript
interface NavbarProps {
  authState: AuthState;
  navigationState: NavigationState;
  onLogin: () => void;
  onLogout: () => void;
  onMobileToggle: () => void;
}

interface NavbarActionsProps {
  authState: AuthState;
  onLogin: () => void;
  onLogout: () => void;
}
```

### Hero Component

```typescript
interface HeroProps {
  ctaActions: {
    primary: () => void;
    secondary: () => void;
  };
  animationDelay?: number;
}
```

### Feature Card Component

```typescript
interface FeatureCardProps {
  id: FeatureId;
  title: string;
  description: string;
  icon: React.ReactNode;
  state: FeatureCardState;
  onHoverChange: (isHovered: boolean) => void;
}
```

### Tech Stack Component

```typescript
interface TechStackItemProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  isVisible: boolean;
  animationDelay: number;
}

interface TechStackProps {
  items: TechStackItemProps[];
}
```

### Footer Component

```typescript
interface FooterProps {
  navigationLinks: FooterLink[];
  socialLinks: SocialLink[];
  copyright: string;
}

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  platform: 'x' | 'linkedin' | 'github';
  url: string;
  icon: React.ReactNode;
}
```

## Data Flow Patterns

### Authentication Flow

```
App Load → Better Auth Session Check
    ↓
Loading State (Navbar shows skeleton)
    ↓
Session Found? → Yes → Authenticated State
                → No → Unauthenticated State
    ↓
Navbar renders appropriate UI
```

### Feature Card Interaction Flow

```
User Hovers Card
    ↓
onHoverChange(true) → Update FeatureCardState
    ↓
Framer Motion detects state change
    ↓
Scale: 1.02, Y: -1px, Border color change
    ↓
User Leaves Card
    ↓
onHoverChange(false) → Update FeatureCardState
    ↓
Return to original state with smooth easing
```

### Tech Stack Scroll Flow

```
User Scrolls to Tech Stack Section
    ↓
Intersection Observer detects visibility
    ↓
Update TechStackState.visibleItems
    ↓
Staggered animation (0.1s delay per item)
    ↓
Each item fades in with line draw separator
```

## State Management Architecture

### Context Providers

```typescript
// Root layout
<AuthProvider>
  <NavbarProvider>
    <AnimationProvider>
      {children}
    </AnimationProvider>
  </NavbarProvider>
</AuthProvider>
```

### Custom Hooks

```typescript
// Authentication hook
function useAuthState(): AuthState {
  const { data: session, status } = useSession();
  return { status, user: session?.user || null, session };
}

// Navigation hook
function useNavigation(): NavigationState {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // ... implementation
}

// Animation hook
function useFeatureCard(id: FeatureId): FeatureCardState {
  const [state, setState] = useState<FeatureCardState>({
    cardId: id,
    isHovered: false,
    animationState: 'idle'
  });
  // ... implementation with Framer Motion
}
```

## Performance Considerations

### State Optimization

1. **Memoization**: Use `useMemo` for expensive calculations
2. **Lazy Initialization**: Defer heavy state until needed
3. **Batch Updates**: Group related state changes
4. **Selective Re-renders**: Use `React.memo` for pure components

### Animation Performance

1. **GPU Acceleration**: Only animate transforms and opacity
2. **Will Change**: Use `will-change` CSS for animated elements
3. **Layout Stability**: Avoid animating layout properties
4. **Reduced Motion**: Respect `prefers-reduced-motion` media query

## Validation & Error Handling

### State Validation

```typescript
function validateAuthState(state: AuthState): boolean {
  if (state.status === 'authenticated') {
    return state.user !== null && state.session !== null;
  }
  return true;
}

function validateFeatureCardState(state: FeatureCardState): boolean {
  return ['idle', 'hovering', 'exiting'].includes(state.animationState);
}
```

### Error Boundaries

```typescript
class NavbarErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <MinimalNavbar />; // Fallback UI
    }
    return this.props.children;
  }
}
```

## Testing Data

### Mock States

```typescript
// Auth states
export const MOCK_AUTHENTICATED: AuthState = {
  status: 'authenticated',
  user: { id: '123', email: 'test@example.com', name: 'Test User' },
  session: { token: 'mock-jwt', expiresAt: new Date(Date.now() + 3600000) }
};

export const MOCK_UNAUTHENTICATED: AuthState = {
  status: 'unauthenticated',
  user: null,
  session: null
};

// Feature card states
export const MOCK_HOVERED_CARD: FeatureCardState = {
  cardId: 'zero-distractions',
  isHovered: true,
  animationState: 'hovering'
};
```

---

**Status**: ✅ Complete
**Next**: Generate API contracts and quickstart documentation