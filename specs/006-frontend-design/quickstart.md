# Quickstart Guide: Frontend Design Implementation

**Feature**: 006-frontend-design
**Date**: 2026-01-05
**Status**: Phase 1 - Quickstart

## Overview

This guide provides step-by-step instructions for implementing the Modern Technical Editorial landing page with state-managed authentication UI. Follow these steps to set up, develop, and test the feature.

## Prerequisites

### Required Environment
- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 1.22+ or pnpm 8+
- Git for version control

### Existing Setup (from previous branches)
- ✅ Next.js 16+ with App Router
- ✅ TypeScript configured
- ✅ Tailwind CSS with custom design tokens
- ✅ Better Auth authentication setup
- ✅ Neon PostgreSQL database connection

## Installation Steps

### 1. Install Dependencies

```bash
# Navigate to frontend directory
cd phase-2/frontend

# Install Framer Motion for animations
npm install framer-motion

# Verify installation
npm list framer-motion
```

### 2. Configure Design Tokens

Update `tailwind.config.ts` with Modern Technical Editorial colors:

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F9F7F2',    // Warm Cream
        surface: '#F0EBE0',       // Darker Cream
        structure: '#E5E0D6',     // Wireframe Grey
        foreground: '#2A1B12',    // Espresso
        muted: '#5C4D45',         // Mocha
        accent: '#FF6B4A',        // Vibrant Orange
        dark: '#2A2A2A',          // Charcoal
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'line-draw': 'lineDraw 1.2s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        lineDraw: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### 3. Set Up Font Imports

Add to `src/app/globals.css` or root layout:

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap');
```

## Project Structure

### Directory Layout

```
src/
├── app/
│   ├── (public)/              # Public routes (landing page)
│   │   ├── page.tsx           # Main landing page
│   │   └── layout.tsx         # Public layout
│   ├── (auth)/                # Authentication routes
│   │   ├── signin/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/           # Protected routes
│   │   ├── tasks/page.tsx
│   │   └── profile/page.tsx
│   ├── layout.tsx             # Root layout (with AuthProvider)
│   └── loading.tsx            # Global loading state
├── components/
│   ├── layout/
│   │   ├── Header.tsx         # ✅ EXISTING - Dashboard navigation
│   │   ├── HomeNavbar.tsx     # 🆕 NEW - Landing page navigation
│   │   └── Footer.tsx         # 🆕 NEW - Landing page footer
│   ├── sections/
│   │   ├── Hero.tsx           # Hero section
│   │   ├── Features.tsx       # Features grid
│   │   ├── TechStack.tsx      # Technology showcase
│   │   └── index.ts           # Section exports
│   ├── ui/
│   │   ├── Button.tsx         # Reusable button variants
│   │   ├── Card.tsx           # Feature cards
│   │   ├── Icons.tsx          # Icon components
│   │   └── Skeleton.tsx       # Loading skeletons
│   ├── providers/
│   │   ├── AuthProvider.tsx   # Auth context
│   │   └── AnimationProvider.tsx # Animation context
│   └── hooks/
│       ├── useAuth.ts         # Authentication hook
│       ├── useNavigation.ts   # Navigation hook
│       └── useViewport.ts     # Responsive hook
├── lib/
│   ├── auth.ts                # Better Auth client
│   ├── animations.ts          # Animation utilities
│   └── constants.ts           # App constants
├── types/
│   ├── auth.ts                # Auth types
│   ├── components.ts          # Component prop types
│   └── index.ts               # Type exports
└── utils/
    ├── formatters.ts          # String formatters
    └── validators.ts          # Input validators
```

## Component Implementation

### Step 1: Create Auth Provider

```typescript
// src/components/providers/AuthProvider.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'better-auth/react';
import { AuthState } from '@/types/auth';

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const authState: AuthState = {
    status,
    user: session?.user || null,
    session: session || null,
  };

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Step 2: Create HomeNavbar Component

**IMPORTANT**: This creates a NEW navbar for the landing page. Your existing `Header.tsx` remains for dashboard routes.

```typescript
// src/components/layout/HomeNavbar.tsx
'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const MotionLink = motion(Link);

export function HomeNavbar() {
  const authState = useAuth();
  const pathname = '/'; // Use usePathname() in real implementation

  return (
    <nav className="sticky top-0 z-50 w-full bg-background border-b border-structure/20">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Brand */}
        <MotionLink
          href="/"
          className="font-serif text-2xl font-bold text-foreground"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          TodoFlow.
        </MotionLink>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 items-center">
          <MotionLink
            href="/tasks"
            className="font-mono text-xs uppercase tracking-widest hover:text-accent transition-colors"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            Tasks
          </MotionLink>
          <MotionLink
            href="/profile"
            className="font-mono text-xs uppercase tracking-widest hover:text-accent transition-colors"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            Profile
          </MotionLink>
        </div>

        {/* User Actions - State Dependent */}
        <div className="flex items-center gap-4">
          {authState.status === 'authenticated' ? (
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-foreground">
                {authState.user?.name || authState.user?.email}
              </span>
              <motion.div
                className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-mono text-xs"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {(authState.user?.name || authState.user?.email)?.[0]?.toUpperCase()}
              </motion.div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                href="/auth/signin"
                className="font-mono text-xs uppercase tracking-widest px-4 py-2"
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                href="/auth/signup"
                className="font-mono text-xs uppercase tracking-widest px-4 py-2"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
```

### Step 3: Set Up Route-Based Layouts

**IMPORTANT**: This ensures the correct navbar is used for each route context.

```typescript
// src/app/(public)/layout.tsx
import { HomeNavbar } from '@/components/layout/HomeNavbar';
import { Footer } from '@/components/layout/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />          {/* EXISTING: Dashboard header */}
      <main>{children}</main> {/* Tasks, Profile pages */}
    </>
  );
}

// src/app/layout.tsx (Root Layout)
import { AuthProvider } from '@/components/providers/AuthProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Step 4: Create Hero Section

```typescript
// src/components/sections/Hero.tsx
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Hero() {
  return (
    <section className="relative py-32 px-6 border-b border-structure/10 overflow-hidden">
      {/* Decorative Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-px w-full bg-structure/5 top-1/3 absolute" />
        <div className="h-px w-full bg-structure/5 top-2/3 absolute" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <motion.h1
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="font-serif text-[clamp(3rem,8vw,7rem)] leading-[0.9] tracking-tighter text-foreground"
        >
          MASTER YOUR
          <br />
          <span className="text-accent ml-[5%]">TASKS TODAY</span>
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          className="mt-8 max-w-2xl mx-auto text-lg text-muted font-sans border-l-2 border-accent pl-6 text-left"
        >
          A modern task management platform designed for clarity and productivity.
          Focus on what matters, sync instantly across devices, and stay secure by default.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
          className="mt-12 flex gap-4 justify-center flex-wrap"
        >
          <Button
            variant="primary"
            size="large"
            href="/auth/signup"
            className="font-sans font-bold rounded-full px-8 py-4 shadow-lg shadow-accent/20 hover:-translate-y-1 transition-transform"
          >
            Start Free Trial
          </Button>
          <Button
            variant="secondary"
            size="large"
            href="#demo"
            className="font-sans font-bold px-8 py-4"
          >
            Watch Demo
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
```

### Step 4: Create Features Grid

```typescript
// src/components/sections/Features.tsx
'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Zap, Shield, Lightning } from 'lucide-react';

const features = [
  {
    id: 'zero-distractions',
    title: 'Zero Distractions',
    description: 'Clean, focused interface designed to minimize cognitive load and maximize productivity.',
    icon: <Zap className="w-6 h-6 text-accent" strokeWidth={2} />,
    benefits: ['Minimalist design', 'Focus mode', 'Keyboard shortcuts'],
  },
  {
    id: 'lightning-sync',
    title: 'Lightning Sync',
    description: 'Instant synchronization across all your devices with real-time updates.',
    icon: <Lightning className="w-6 h-6 text-accent" strokeWidth={2} />,
    benefits: ['Real-time updates', 'Offline support', 'Cross-platform'],
  },
  {
    id: 'secure-by-default',
    title: 'Secure by Default',
    description: 'Enterprise-grade security with end-to-end encryption and zero-knowledge architecture.',
    icon: <Shield className="w-6 h-6 text-accent" strokeWidth={2} />,
    benefits: ['End-to-end encryption', 'JWT authentication', 'Row-level security'],
  },
];

const container = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export function Features() {
  return (
    <section className="py-24 px-6 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-4xl md:text-5xl text-foreground mb-2"
          >
            Core Features
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-mono text-sm uppercase tracking-widest text-muted"
          >
            Built for Focus
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div key={feature.id} variants={item}>
              <Card
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                benefits={feature.benefits}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
```

### Step 5: Create UI Primitives

```typescript
// src/components/ui/Button.tsx
'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'technical';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-[#E55A3D]',
  secondary: 'border border-foreground text-foreground hover:bg-foreground hover:text-background',
  technical: 'border border-structure text-foreground hover:bg-foreground hover:text-background',
};

const sizeStyles: Record<ButtonSize, string> = {
  small: 'px-3 py-1.5 text-xs',
  medium: 'px-5 py-2.5 text-sm',
  large: 'px-8 py-4 text-base',
};

export function Button({
  variant = 'primary',
  size = 'medium',
  href,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = `font-mono uppercase tracking-widest transition-all ${variantStyles[variant]} ${sizeStyles[className.includes('rounded-full') ? 'large' : size]}`;

  if (href) {
    const MotionLink = motion(Link);
    return (
      <MotionLink
        href={href}
        className={`${baseClasses} ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.button
      className={`${baseClasses} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
```

```typescript
// src/components/ui/Card.tsx
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface CardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
}

export function Card({ title, description, icon, benefits }: CardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="bg-background border border-structure/30 p-8 rounded-lg cursor-pointer h-full flex flex-col"
      whileHover={{ scale: 1.02, y: -1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className={`mb-4 p-3 rounded-lg transition-colors ${isHovered ? 'bg-accent/10' : 'bg-surface'}`}>
        {icon}
      </div>

      <h3 className="font-serif text-xl text-foreground mb-2">{title}</h3>
      <p className="text-muted mb-4 flex-grow">{description}</p>

      <ul className="font-mono text-xs space-y-1 text-foreground/80">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isHovered ? 'bg-accent' : 'bg-structure'}`} />
            {benefit}
          </li>
        ))}
      </ul>

      {/* Technical line at bottom */}
      <div className="mt-6 h-px bg-structure/20">
        <motion.div
          className="h-full bg-accent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.div>
  );
}
```

## Testing Strategy

### Unit Tests

```typescript
// src/components/__tests__/Navbar.test.tsx
import { render, screen } from '@testing-library/react';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/components/providers/AuthProvider';

// Mock the auth hook
jest.mock('@/components/providers/AuthProvider');

describe('Navbar', () => {
  it('renders sign in and get started buttons when unauthenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      status: 'unauthenticated',
      user: null,
      session: null,
    });

    render(<Navbar />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('renders user name and avatar when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      status: 'authenticated',
      user: { name: 'Test User', email: 'test@example.com' },
      session: { token: 'test-token' },
    });

    render(<Navbar />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// src/app/__tests__/landing-page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import LandingPage from '@/app/page';

describe('Landing Page', () => {
  it('renders all main sections', async () => {
    render(<LandingPage />);

    await waitFor(() => {
      expect(screen.getByText('MASTER YOUR')).toBeInTheDocument();
      expect(screen.getByText('Core Features')).toBeInTheDocument();
      expect(screen.getByText('Modern Technical Stack')).toBeInTheDocument();
    });
  });

  it('has working CTAs', async () => {
    render(<LandingPage />);

    const ctaButton = screen.getByText('Start Free Trial');
    expect(ctaButton.closest('a')).toHaveAttribute('href', '/auth/signup');
  });
});
```

### E2E Tests

```typescript
// cypress/e2e/landing-page.cy.ts
describe('Landing Page User Journey', () => {
  it('completes full user flow', () => {
    cy.visit('/');

    // Hero section
    cy.contains('MASTER YOUR TASKS TODAY').should('be.visible');
    cy.contains('Start Free Trial').click();

    // Should redirect to signup
    cy.url().should('include', '/auth/signup');

    // Go back and test features
    cy.visit('/');
    cy.get('[data-testid="feature-card"]').first().trigger('mouseover');
    cy.get('[data-testid="feature-card"]').first().should('have.css', 'transform');
  });

  it('handles responsive behavior', () => {
    cy.viewport(375, 667); // iPhone SE
    cy.visit('/');

    // Mobile menu should be accessible
    cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible');
  });
});
```

## Performance Optimization

### 1. Code Splitting

```typescript
// Dynamic imports for heavy components
const TechStack = dynamic(() => import('@/components/sections/TechStack'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

### 2. Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={120}
  height={40}
  priority={true} // Above-the-fold content
/>
```

### 3. Animation Performance

```typescript
// Use will-change for animated elements
<motion.div
  style={{ willChange: 'transform, opacity' }}
  animate={{ opacity: 1, y: 0 }}
/>
```

## Deployment Checklist

- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Better Auth secrets set up
- [ ] Tailwind styles built
- [ ] TypeScript compilation passes
- [ ] All tests pass
- [ ] Build succeeds (`npm run build`)
- [ ] Performance audit completed
- [ ] Accessibility checks passed
- [ ] Responsive design verified

## Troubleshooting

### Common Issues

1. **Framer Motion not working**: Ensure `'use client'` directive is present
2. **Auth state not updating**: Check AuthProvider is in root layout
3. **Tailwind styles missing**: Run `npm run build` to regenerate
4. **TypeScript errors**: Run `npm run type-check`

### Debug Commands

```bash
# Check installed versions
npm list framer-motion next react react-dom

# Run type checking
npm run type-check

# Run tests
npm run test

# Build for production
npm run build

# Analyze bundle
npm run analyze
```

---

**Status**: ✅ Complete
**Next**: Begin implementation following this quickstart guide