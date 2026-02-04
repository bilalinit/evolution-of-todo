/**
 * Animation Utilities
 *
 * Framer Motion animation variants and utilities for the Modern Technical Editorial design system.
 * Follows the animation principles from the UI Animation skill.
 */

import { Variants } from 'framer-motion';
import { ANIMATION } from './constants';

// ============================================================================
// CORE ANIMATION VARIANTS
// ============================================================================

/**
 * Fade In Up (Signature Entrance)
 * Used for headings, text blocks, and images. Starts 30px down and fades in.
 * Uses the smooth easing curve [0.22, 1, 0.36, 1]
 */
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 30
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION.SLOW / 1000, // 0.6s
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

/**
 * Line Draw (Technical Aesthetic)
 * Used for dividers and underlines. Scales from 0 to 100% width.
 */
export const lineDraw: Variants = {
  initial: {
    scaleX: 0,
    originX: 0
  },
  animate: {
    scaleX: 1,
    transition: {
      duration: ANIMATION.SLOW / 1000, // 1.2s
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

/**
 * Stagger Container
 * Use this as the container variant for staggered children.
 * Each child animates in with 0.1s delay.
 */
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: ANIMATION.STAGGER_SMALL / 1000, // 0.1s
      delayChildren: 0.1
    }
  }
};

/**
 * Stagger List
 * Optimized for list items with tighter timing.
 */
export const staggerList: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

/**
 * Fade In
 * Simple fade in without movement. Used for overlays and subtle reveals.
 */
export const fadeIn: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: ANIMATION.FAST / 1000, // 0.4s
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

// ============================================================================
// INTERACTIVE VARIANTS
// ============================================================================

/**
 * Hover Scale (Minimalist)
 * Subtle scale effect for interactive elements. Rarely exceeds 1.02.
 */
export const hoverScale: Variants = {
  initial: {
    scale: 1
  },
  hover: {
    scale: 1.02,
    y: -1,
    transition: {
      duration: ANIMATION.FAST / 1000, // 0.4s
      ease: [0.16, 1, 0.3, 1]
    }
  },
  tap: {
    scale: 0.98
  }
};

/**
 * Button Press Effect
 * For interactive feedback on buttons.
 */
export const buttonPress = {
  whileTap: {
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
};

/**
 * Card Lift
 * For cards and containers. Lifts slightly on hover.
 */
export const cardLift: Variants = {
  initial: {
    y: 0
  },
  hover: {
    y: -2,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

// ============================================================================
// LAYOUT ANIMATIONS
// ============================================================================

/**
 * Slide In Left
 * Content slides in from the left.
 */
export const slideInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -30
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION.FAST / 1000, // 0.4s
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

/**
 * Slide In Right
 * Content slides in from the right.
 */
export const slideInRight: Variants = {
  initial: {
    opacity: 0,
    x: 30
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION.FAST / 1000, // 0.4s
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

/**
 * Pop In
 * For badges, indicators, and small elements.
 * Uses spring physics for a snappy feel.
 */
export const popIn: Variants = {
  initial: {
    scale: 0,
    opacity: 0
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

// ============================================================================
// SPECIALIZED ANIMATIONS
// ============================================================================

/**
 * Loading Pulse
 * For skeleton loaders and loading states.
 */
export const loadingPulse: Variants = {
  animate: {
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

/**
 * Shake
 * For error states or validation feedback.
 */
export const shake: Variants = {
  animate: {
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut"
    }
  }
};

/**
 * Page Transition
 * For route changes and page loads.
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 10
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

// ============================================================================
// MODAL ANIMATIONS
// ============================================================================

/**
 * Modal Overlay
 * Background overlay for modals.
 */
export const modalOverlay: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

/**
 * Modal Content
 * Modal content with spring physics.
 */
export const modalContent: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

// ============================================================================
// CUSTOM HOOKS & HELPERS
// ============================================================================

/**
 * Stagger Configuration
 * Creates a stagger configuration for container animations.
 */
export function createStaggerConfig(staggerChildren: number = 0.1, delayChildren: number = 0) {
  return {
    transition: {
      staggerChildren,
      delayChildren
    }
  };
}

/**
 * Delayed Animation
 * Wraps a variant with a delay.
 */
export function withDelay(variants: Variants, delay: number): Variants {
  return {
    ...variants,
    animate: {
      ...variants.animate,
      transition: {
        ...(variants.animate as any).transition,
        delay: delay / 1000
      }
    }
  };
}

/**
 * Custom Easing
 * Applies custom easing curve to any variant.
 */
export function withCustomEasing(variants: Variants, ease: number[]): Variants {
  return {
    ...variants,
    animate: {
      ...variants.animate,
      transition: {
        ...(variants.animate as any).transition,
        ease: ease
      }
    }
  };
}