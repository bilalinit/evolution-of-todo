/**
 * Animation Utility Functions and Variants
 *
 * Framer Motion animations following the Modern Technical Editorial design system.
 */

import { Variants } from 'framer-motion';

/**
 * Fade In Up Animation
 * Content enters from below with fade
 */
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

/**
 * Fade In Animation
 * Simple fade in without movement
 */
export const fadeIn: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

/**
 * Slide In From Left
 */
export const slideInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -30,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

/**
 * Slide In From Right
 */
export const slideInRight: Variants = {
  initial: {
    opacity: 0,
    x: 30,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

/**
 * Stagger Container
 * Use this as the container variant for staggered children
 */
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * Stagger List
 * Optimized for list items
 */
export const staggerList: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

/**
 * Scale On Hover
 * Gentle scale effect for interactive elements
 */
export const scaleOnHover: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.98,
  },
};

/**
 * Line Draw Animation
 * For technical lines and dividers
 */
export const lineDraw: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 0.8,
        ease: "easeInOut",
      },
      opacity: {
        duration: 0.4,
      },
    },
  },
};

/**
 * Pop In Animation
 * For badges and small indicators
 */
export const popIn: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

/**
 * Shake Animation
 * For error states or validation feedback
 */
export const shake: Variants = {
  animate: {
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

/**
 * Loading Pulse
 * For skeleton loaders and loading states
 */
export const loadingPulse: Variants = {
  animate: {
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * Page Transition
 * For route changes
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

/**
 * Modal Overlay
 */
export const modalOverlay: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Modal Content
 */
export const modalContent: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

/**
 * Button Press Effect
 * For interactive feedback
 */
export const buttonPress = {
  whileTap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

/**
 * Hover Lift Effect
 * For cards and interactive containers
 */
export const hoverLift = {
  whileHover: {
    y: -2,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};