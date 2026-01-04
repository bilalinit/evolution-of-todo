# UI Animation Skill: Modern Technical Editorial

## Overview
This skill defines the motion design language for the user's projects. It complements the `ui-design` skill by adding **clean, minimalistic interactions** using **Framer Motion**.

> 🛑 **MANDATORY REFERENCE**
>
> 1. **`MOTION_TOKENS.md`**: Physics constants (Spring 400/10) and Easing curves.
> 2. **`ANIMATION_PATTERNS.md`**: Code for FadeUp, LineDraw, and Stagger.

## Core Motion Principles

1.  **NO ABRUPT APPEARANCES**: Nothing should just "pop" into existence.
    *   Use `FadeInUp` for content.
    *   Use `LineDraw` for dividers.
2.  **PHYSICS OVER DURATION**: Interactive elements (buttons, hover states) must use **Smooth Eased Transitions** or **Tight Springs**.
    *   *Bad*: `transition: { type: "spring", stiffness: 400, damping: 10 }` (Too bouncy)
    *   *Good*: `transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }`
3.  **SUBTLETY OVER ACTION**: Motion should be felt, not seen. Hover scales should rarely exceed `1.02`. Rotation and "pop" effects are forbidden unless requested.
4.  **EDITORIAL PACING**: Entrances should be slow and smooth (`0.8s`). Avoid jarringly fast animations.
5.  **STAGGER EVERYTHING**: Lists and grids must cascade. Never animate a whole block as one rigid unit.

### When using React/Next.js:
- Install: `npm install framer-motion`
- Import: `import { motion } from 'framer-motion'`
- **CUSTOM COMPONENTS**: If animating Next.js `<Link>` or other library components, you MUST use the `motion()` wrapper (e.g., `const MotionLink = motion(Link)`) to prevent React DOM prop warnings.
- Replace HTML tags with `motion` tags (e.g., `motion.div`, `motion.button`).
- Copy variants directly from `ANIMATION_PATTERNS.md`.

### When using Vanilla CSS (Fallback):
- Use `transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1)` to mimic the Framer curve.
