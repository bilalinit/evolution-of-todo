# Motion Tokens: Modern Technical Editorial

Physics-based animation tokens for a clean, minimalistic feel.
Prioritize **Spring Physics** over rigid durations for interactive elements.
Prioritize **Smooth Easing** (`[0.22, 1, 0.36, 1]`) for entrances.

## 🎢 Physics & Curves

### Physics & Curves (Interactive)
- **Smooth Hover**: `transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }`
  *   *Usage*: Most standard hovers (scale, color). No bounce.
- **Tight Spring**: `type: "spring", stiffness: 300, damping: 30`
  *   *Usage*: High-precision movement (nav menus, searches). Zero overshoot.
- **Subtle Glide**: `transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }`
  *   *Usage*: Card reveals, subtle slides.

### Easing (Entrances)
Used for page loads, modals, and sliding elements.
- **Editorial Ease**: `cubic-bezier(0.22, 1, 0.36, 1)` or `[0.22, 1, 0.36, 1]`
  *   *Feel*: Starts quick, lands very softly. Premium feel.
- **Line Draw Ease**: `cubic-bezier(0.22, 1, 0.36, 1)` (Same as above, but applied to scaleX)

## ⏱️ Timing Scales

- **Instant**: `0.2s` (Color changes, opacity hints)
- **Quick**: `0.4s` (Hover transitions, small slides)
- **Standard**: `0.8s` (Element entrances, fade-ups)
- **Slow**: `1.2s` (Line drawings, complex layouts)
- **Page Load**: `0.6s` (Global stagger delay)

## 🌊 Stagger Constants

- **List Item Delay**: `0.1s` per item.
- **Section Delay**: `0.2s` between major blocks.
