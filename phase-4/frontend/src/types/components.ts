/**
 * Component Interface Types
 *
 * Type definitions for all component props and interfaces used throughout
 * the Modern Technical Editorial landing page.
 */

import { ReactNode } from "react";

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

/**
 * Section Props Interface
 * Base contract for all section components
 */
export interface SectionProps {
  id?: string;
  className?: string;
  children?: ReactNode;
  animationDelay?: number;
}

/**
 * Page Layout Props Interface
 * Contract for page-level layout components
 */
export interface PageLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  authRequired?: boolean;
}

/**
 * Responsive Props Interface
 * Contract for components that need responsive behavior
 */
export interface ResponsiveProps {
  breakpoints?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  responsiveStyles?: Record<string, string>;
}

/**
 * Viewport State Interface
 * Contract for viewport-based state management
 */
export interface ViewportState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

// ============================================================================
// NAVIGATION COMPONENTS
// ============================================================================

/**
 * Navigation State Interface
 * Contract for navigation state management
 */
export interface NavigationState {
  currentPath: string;
  isMobileMenuOpen: boolean;
  isHovering: boolean;
}

/**
 * Navigation Actions Interface
 * Contract for navigation-related callbacks
 */
export interface NavigationActions {
  onNavigate: (path: string) => void;
  onMobileToggle: () => void;
  onHoverChange: (isHovering: boolean) => void;
}

/**
 * Navigation Link Interface
 * Contract for navigation link data
 */
export interface NavigationLink {
  label: string;
  href: string;
  requiresAuth?: boolean;
  icon?: React.ReactNode;
}

/**
 * Navbar Props Interface
 */
export interface NavbarProps {
  authState: any; // AuthState from auth types
  navigationState: NavigationState;
  onLogin: () => void;
  onLogout: () => void;
  onMobileToggle: () => void;
}

/**
 * Navbar Actions Props Interface
 */
export interface NavbarActionsProps {
  authState: any;
  onLogin: () => void;
  onLogout: () => void;
}

// ============================================================================
// HERO SECTION
// ============================================================================

/**
 * Hero Content Interface
 * Contract for hero section content
 */
export interface HeroContent {
  headline: string;
  subheadline?: string;
  description: string;
}

/**
 * Hero Actions Interface
 * Contract for hero CTA actions
 */
export interface HeroActions {
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
}

/**
 * Hero Props Interface
 * Complete contract for Hero component
 */
export interface HeroProps {
  content: HeroContent;
  actions: HeroActions;
  animationDelay?: number;
}

// ============================================================================
// FEATURE CARDS
// ============================================================================

/**
 * Feature Data Interface
 * Contract for individual feature card data
 */
export interface FeatureData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode | string;
  benefits: readonly string[];
}

/**
 * Feature Card State Interface
 * Contract for feature card interaction state
 */
export interface FeatureCardState {
  cardId: string;
  isHovered: boolean;
  animationState: 'idle' | 'hovering' | 'exiting';
}

/**
 * Feature Card Props Interface
 * Complete contract for FeatureCard component
 */
export interface FeatureCardProps {
  data: FeatureData;
  state: FeatureCardState;
  onHoverChange: (isHovered: boolean) => void;
  onClick?: () => void;
}

/**
 * Features Grid Props Interface
 * Contract for the features section container
 */
export interface FeaturesGridProps {
  features: FeatureData[];
  title: string;
  subtitle: string;
}

// ============================================================================
// TECH STACK
// ============================================================================

/**
 * Technology Item Interface
 * Contract for technology stack data
 */
export interface TechnologyItem {
  id: string;
  name: string;
  version?: string;
  description: string;
  icon: React.ReactNode;
  documentationUrl?: string;
}

/**
 * Tech Stack Item Props Interface
 * Contract for individual tech stack item component
 */
export interface TechStackItemProps {
  technology: TechnologyItem;
  isVisible: boolean;
  animationDelay: number;
}

/**
 * Tech Stack Section Props Interface
 * Contract for the tech stack section
 */
export interface TechStackSectionProps {
  technologies: TechnologyItem[];
  title: string;
}

// ============================================================================
// FOOTER
// ============================================================================

/**
 * Footer Link Interface
 * Contract for individual footer links
 */
export interface FooterLink {
  label: string;
  href: string;
  isExternal?: boolean;
}

/**
 * Footer Link Group Interface
 * Contract for grouped footer navigation links
 */
export interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

/**
 * Social Media Link Interface
 * Contract for social media links
 */
export interface SocialMediaLink {
  platform: 'x' | 'linkedin' | 'github';
  url: string;
  icon: React.ReactNode;
  label: string;
}

/**
 * Footer Props Interface
 * Complete contract for Footer component
 */
export interface FooterProps {
  brandName: string;
  linkGroups: FooterLinkGroup[];
  socialLinks: SocialMediaLink[];
  copyright: string;
  legalLinks?: FooterLink[];
}

// ============================================================================
// UI PRIMITIVES
// ============================================================================

/**
 * Button Variant Types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'technical';
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Button Props Interface
 */
export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * Card Props Interface
 */
export interface CardProps {
  title: string;
  description: string;
  icon: React.ReactNode | string;
  benefits: readonly string[];
}

/**
 * Tech Stack Item Props Interface
 */
export interface TechStackItemUIProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  version?: string;
  documentationUrl?: string;
}

// ============================================================================
// ANIMATION
// ============================================================================

/**
 * Animation Variant Interface
 * Contract for Framer Motion animation variants
 */
export interface AnimationVariant {
  initial: Record<string, any>;
  animate: Record<string, any>;
  exit?: Record<string, any>;
  transition?: Record<string, any>;
}

/**
 * Stagger Animation Config Interface
 * Contract for staggered animation configuration
 */
export interface StaggerConfig {
  staggerChildren: number;
  delayChildren?: number;
}

/**
 * Hover Animation Interface
 * Contract for hover animation configuration
 */
export interface HoverAnimation {
  scale?: number;
  y?: number;
  opacity?: number;
  transition?: Record<string, any>;
}

// ============================================================================
// ERROR & LOADING
// ============================================================================

/**
 * Loading State Interface
 * Contract for loading states across components
 */
export interface LoadingState {
  isLoading: boolean;
  type?: 'skeleton' | 'spinner' | 'pulse';
  message?: string;
}

/**
 * Error State Interface
 * Contract for error states across components
 */
export interface ErrorState {
  hasError: boolean;
  error?: Error;
  fallback?: React.ReactNode;
  onRetry?: () => void;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Click Event Interface
 * Standardized click event handler contract
 */
export interface ClickEvent {
  (event: React.MouseEvent<HTMLElement>): void;
}

/**
 * Hover Event Interface
 * Standardized hover event handler contract
 */
export interface HoverEvent {
  (isHovering: boolean): void;
}

/**
 * Keyboard Event Interface
 * Standardized keyboard event handler contract
 */
export interface KeyboardEvent {
  (event: React.KeyboardEvent<HTMLElement>): void;
}

// ============================================================================
// UTILITY INTERFACES
// ============================================================================

/**
 * WithChildren Interface
 * Utility interface for components that accept children
 */
export interface WithChildren {
  children?: React.ReactNode;
}

/**
 * WithClassName Interface
 * Utility interface for components that accept className
 */
export interface WithClassName {
  className?: string;
}

/**
 * WithTestId Interface
 * Utility interface for testable components
 */
export interface WithTestId {
  'data-testid'?: string;
}

/**
 * Optional Interface
 * Utility type for making all properties optional
 */
export type Optional<T> = {
  [P in keyof T]?: T[P];
};

// ============================================================================
// INTEGRATION INTERFACES
// ============================================================================

/**
 * Better Auth Integration Interface
 * Contract for Better Auth client integration
 */
export interface BetterAuthIntegration {
  client: any; // BetterAuthClient
  session: any; // Session type from Better Auth
  user: any; // User type from Better Auth
}

/**
 * Next.js Integration Interface
 * Contract for Next.js specific integrations
 */
export interface NextJSIntegration {
  router: any; // NextRouter
  pathname: string;
  searchParams: URLSearchParams;
}

/**
 * Framer Motion Integration Interface
 * Contract for Framer Motion integration
 */
export interface FramerMotionIntegration {
  motion: any; // Motion component factory
  AnimatePresence: any; // AnimatePresence component
  useAnimation: any; // useAnimation hook
  useInView: any; // useInView hook
}

// ============================================================================
// THEME & DESIGN TOKENS
// ============================================================================

/**
 * Color Palette Interface
 * Contract for design system colors
 */
export interface ColorPalette {
  background: string; // #F9F7F2
  surface: string; // #F0EBE0
  structure: string; // #E5E0D6
  textPrimary: string; // #2A1B12
  textSecondary: string; // #5C4D45
  accent: string; // #FF6B4A
  dark: string; // #2A2A2A
}

/**
 * Typography Scale Interface
 * Contract for typography system
 */
export interface TypographyScale {
  display: string; // Playfair Display
  heading: string; // Playfair Display
  body: string; // DM Sans
  technical: string; // JetBrains Mono
}

/**
 * Animation Tokens Interface
 * Contract for animation configuration
 */
export interface AnimationTokens {
  easing: {
    smooth: [number, number, number, number]; // [0.22, 1, 0.36, 1]
    easeOut: string;
  };
  timing: {
    instant: number; // 0.2s
    quick: number; // 0.4s
    standard: number; // 0.8s
    slow: number; // 1.2s
  };
  physics: {
    tightSpring: {
      type: string;
      stiffness: number;
      damping: number;
    };
  };
}

/**
 * Design System Interface
 * Complete contract for design system
 */
export interface DesignSystem {
  colors: ColorPalette;
  typography: TypographyScale;
  animation: AnimationTokens;
}