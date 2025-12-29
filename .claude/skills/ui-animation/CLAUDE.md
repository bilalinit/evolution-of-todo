# CLAUDE.md - UI Animation Skill

## ⚡️ Usage Guidelines
Enable this skill when the user asks to:
- "Animate this page"
- "Add interactions"
- "Make it smooth"
- "Add Framer Motion"

## 🛡️ Core Constraints
1.  **NEVER** use default standard easing (`ease-in-out`). Always use the custom curve `[0.22, 1, 0.36, 1]`.
2.  **NEVER** over-animate. Text should generally just Fade Up. Do not make it spin, flip, or bounce unless explicitly asked.
3.  **NO BOUNCY HOVERS**: Avoid low-damping springs (`damping: 10`). Use high damping (`30+`) or smooth easing duration instead.
4.  **NO DOM PROP LEAKAGE**: Never pass `whileHover` or `whileTap` directly to custom components (like `<Link>`). You MUST wrap them first: `const MotionLink = motion(Link)`.
5.  **ALWAYS** use `layout` prop in Framer Motion for structural changes (filtering lists, resizing cards).

## 🔍 Discovery
- **Physics**: `MOTION_TOKENS.md`
- **Code**: `ANIMATION_PATTERNS.md`

## ❌ Common Mistakes
- Using `duration` for hover effects (Use rigid springs instead).
- Animating `opacity` linearly (Use ease-out).
- Creating "janky" Javascript animations instead of GPU-accelerated transforms (`x`, `y`, `scale`, `opacity`).
