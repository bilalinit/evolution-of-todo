/**
 * Design Tokens - Modern Technical Editorial System
 *
 * These constants define the visual design system for the application.
 * All colors, typography, spacing, and animation values are defined here.
 */

// ============================================================================
// COLORS
// ============================================================================

export const COLORS = {
  // Primary Palette
  BACKGROUND: "#F9F7F2", // Cream background
  FOREGROUND: "#2A1B12", // Espresso text
  ACCENT: "#FF6B4A", // Orange accents

  // Supporting Colors
  MUTED: "#E8E4DD", // Muted cream
  MUTED_DARK: "#D4CFC5", // Darker muted cream
  WHITE: "#FFFFFF",
  BLACK: "#000000",

  // Technical Lines (borders, dividers)
  BORDER: "rgba(42, 27, 18, 0.1)",
  BORDER_STRONG: "rgba(42, 27, 18, 0.2)",

  // Status Colors
  SUCCESS: "#10B981",
  WARNING: "#F59E0B",
  ERROR: "#EF4444",
  INFO: "#3B82F6",

  // Semantic Colors
  OVERLAY: "rgba(42, 27, 18, 0.5)",
  HOVER: "rgba(255, 107, 74, 0.1)",

  // Dark Mode
  DARK_BACKGROUND: "#1a1510",
  DARK_FOREGROUND: "#F9F7F2",
  DARK_MUTED: "#2a1b12",
  DARK_BORDER: "rgba(249, 247, 242, 0.1)",
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const TYPOGRAPHY = {
  // Font Families
  FONT_SERIF: '"Playfair Display", serif',
  FONT_SANS: '"DM Sans", sans-serif',
  FONT_MONO: '"JetBrains Mono", monospace',

  // Font Sizes (rem)
  SIZE_XS: "0.75rem",    // 12px
  SIZE_SM: "0.875rem",   // 14px
  SIZE_BASE: "1rem",     // 16px
  SIZE_LG: "1.125rem",   // 18px
  SIZE_XL: "1.25rem",    // 20px
  SIZE_2XL: "1.5rem",    // 24px
  SIZE_3XL: "1.875rem",  // 30px
  SIZE_4XL: "2.5rem",    // 40px

  // Line Heights
  LEADING_TIGHT: "1.2",
  LEADING_NORMAL: "1.6",
  LEADING_LOOSE: "1.8",

  // Font Weights
  WEIGHT_NORMAL: 400,
  WEIGHT_MEDIUM: 500,
  WEIGHT_SEMIBOLD: 600,
  WEIGHT_BOLD: 700,

  // Letter Spacing
  TRACKING_TIGHT: "-0.02em",
  TRACKING_NORMAL: "0",
  TRACKING_WIDE: "0.05em",
} as const;

// ============================================================================
// SPACING & LAYOUT
// ============================================================================

export const SPACING = {
  // Base unit (4px grid)
  UNIT: 4,

  // Scale (multiples of 4px)
  XS: 4,    // 0.25rem
  SM: 8,    // 0.5rem
  MD: 16,   // 1rem
  LG: 24,   // 1.5rem
  XL: 32,   // 2rem
  "2XL": 48, // 3rem
  "3XL": 64, // 4rem

  // Layout
  CONTAINER_MAX_WIDTH: 1200,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 80,

  // Border Radius
  RADIUS_SM: 4,
  RADIUS_MD: 8,
  RADIUS_LG: 12,
  RADIUS_XL: 16,
  RADIUS_FULL: 9999,
} as const;

// ============================================================================
// ANIMATIONS
// ============================================================================

export const ANIMATION = {
  // Durations (ms)
  INSTANT: 0,
  FAST: 150,
  NORMAL: 300,
  SLOW: 600,
  SLOWER: 1000,

  // Easing
  EASE_OUT: "cubic-bezier(0.16, 1, 0.3, 1)",
  EASE_IN_OUT: "cubic-bezier(0.4, 0, 0.2, 1)",
  EASE_SPRING: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",

  // Physics (for spring animations)
  SPRING_DAMPING: 10,
  SPRING_STIFFNESS: 400,

  // Stagger Delays
  STAGGER_TINY: 50,
  STAGGER_SMALL: 100,
  STAGGER_MEDIUM: 150,
  STAGGER_LARGE: 200,
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
} as const;

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================

export const Z_INDEX = {
  BASE: 0,
  ABOVE: 1,
  DROPDOWN: 100,
  STICKY: 200,
  FIXED: 300,
  MODAL: 400,
  POPOVER: 500,
  TOOLTIP: 600,
  TOAST: 700,
  MAX: 9999,
} as const;

// ============================================================================
// UI PATTERNS
// ============================================================================

export const UI = {
  // Shadows
  SHADOW_SM: "0 1px 2px 0 rgba(42, 27, 18, 0.05)",
  SHADOW_MD: "0 4px 6px -1px rgba(42, 27, 18, 0.1), 0 2px 4px -1px rgba(42, 27, 18, 0.06)",
  SHADOW_LG: "0 10px 15px -3px rgba(42, 27, 18, 0.1), 0 4px 6px -2px rgba(42, 27, 18, 0.05)",

  // Hover Scale
  HOVER_SCALE: 1.02,

  // Focus Ring
  FOCUS_RING: "0 0 0 2px rgba(255, 107, 74, 0.3)",

  // Transitions
  TRANSITION_BASE: "all 0.2s ease",
  TRANSITION_SLOW: "all 0.4s ease",
} as const;

// ============================================================================
// APPLICATION CONSTANTS
// ============================================================================

export const APP = {
  // API
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  API_TIMEOUT: 30000,

  // Auth
  TOKEN_KEY: "todo_app_auth_token",
  SESSION_KEY: "todo_app_session",

  // UI
  PAGE_TITLE_SUFFIX: "• PlanStack",
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB

  // Validation
  MIN_PASSWORD_LENGTH: 8,
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 1000,

  // Performance
  DEBOUNCE_DELAY: 300,
  SEARCH_MIN_LENGTH: 2,

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
} as const;

// ============================================================================
// ENVIRONMENT
// ============================================================================

/**
 * Development mode flag - used to control debug logging
 * Only true in development environment, false in production
 */
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// ============================================================================
// COMBINED EXPORTS
// ============================================================================

export const DESIGN_SYSTEM = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  animation: ANIMATION,
  breakpoints: BREAKPOINTS,
  zIndex: Z_INDEX,
  ui: UI,
  app: APP,
} as const;

// Type exports for TypeScript
export type ColorKey = keyof typeof COLORS;
export type TypographyKey = keyof typeof TYPOGRAPHY;
export type SpacingKey = keyof typeof SPACING;
export type AnimationKey = keyof typeof ANIMATION;
export type BreakpointKey = keyof typeof BREAKPOINTS;
export type ZIndexKey = keyof typeof Z_INDEX;
export type UIKey = keyof typeof UI;
export type AppKey = keyof typeof APP;

// ============================================================================
// FEATURE DATA & CONTENT
// ============================================================================

// Hero Section Content
export const HERO_CONTENT = {
  headline: "FOCUS ON",
  accentText: "WHAT MATTERS",
  description: "A modern task management platform designed for clarity and productivity. Focus on what matters, sync instantly across devices, and stay secure by default.",
  primaryCTA: "Get Started",
  secondaryCTA: "Source Code",
} as const;

// Feature Cards Data
export const FEATURE_DATA = [
  {
    id: "zero-distractions",
    title: "Zero Distractions",
    description: "Clean, focused interface designed to minimize cognitive load and maximize productivity.",
    icon: "zap",
    benefits: ["Minimalist design", "Smart Filtering", "Instant Search"],
  },
  {
    id: "lightning-sync",
    title: "Lightning Sync",
    description: "Instant synchronization across all your devices with real-time updates.",
    icon: "lightning",
    benefits: ["Real-time updates", "Fast Performance", "Cross-platform"],
  },
  {
    id: "secure-by-default",
    title: "Secure by Default",
    description: "Enterprise-grade security with industry-standard data protection and secure authentication.",
    icon: "shield",
    benefits: ["Trust & Transparency", "Secure Authentication", "Data Privacy"],
  },
] as const;

// Tech Stack Data
export const TECH_STACK_DATA = [
  {
    id: "nextjs",
    name: "Next.js",
    version: "16.1.1",
    description: "React framework with App Router, Server Components, and optimal performance.",
    icon: "code",
    documentationUrl: "https://nextjs.org/docs",
  },
  {
    id: "fastapi",
    name: "FastAPI",
    version: "0.110+",
    description: "Modern Python backend framework with async support and automatic API documentation.",
    icon: "server",
    documentationUrl: "https://fastapi.tiangolo.com",
  },
  {
    id: "neon",
    name: "Neon PostgreSQL",
    version: "Serverless",
    description: "Serverless PostgreSQL with branching, autoscaling, and instant provisioning.",
    icon: "database",
    documentationUrl: "https://neon.tech/docs",
  },
  {
    id: "better-auth",
    name: "Better Auth",
    version: "1.4.9",
    description: "Authentication framework with JWT tokens, session management, and OAuth providers.",
    icon: "lock",
    documentationUrl: "https://better-auth.com",
  },
] as const;

// Navigation Links
export const NAVIGATION_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Tech", href: "#tech" },
  { label: "About", href: "https://github.com/bilalinit/evolution-of-todo/blob/main/README.md" },
] as const;

// Footer Data
export const FOOTER_DATA = {
  brandName: "PlanStack",
  copyright: "© 2026 PlanStack. All rights reserved.",
  linkGroups: [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Open Source", href: "https://github.com/bilalinit/evolution-of-todo.git" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "https://github.com/bilalinit/evolution-of-todo/blob/main/README.md" },
        { label: "linkedin", href: "https://www.linkedin.com/in/bilal-saeed-9aa904284/" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "https://github.com/bilalinit/evolution-of-todo/blob/main/README.md" },
        { label: "API", href: "https://github.com/bilalinit/evolution-of-todo/" },
        { label: "Support", href: "https://www.linkedin.com/in/bilal-saeed-9aa904284/" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "#privacy" },
        { label: "Terms", href: "#terms" },
        { label: "Security", href: "https://www.better-auth.com/" },
      ],
    },
  ],
  socialLinks: [
    { platform: "x", url: "https://twitter.com", label: "Twitter" },
    { platform: "linkedin", url: "https://www.linkedin.com/in/bilal-saeed-9aa904284/", label: "LinkedIn" },
    { platform: "github", url: "https://github.com/bilalinit/evolution-of-todo", label: "GitHub" },
  ],
} as const;