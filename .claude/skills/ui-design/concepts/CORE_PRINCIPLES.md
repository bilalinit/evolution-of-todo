# Core Design Principles: The "Anti-Slop" Standard

## 1. Typography: Character Over Safety
**Avoid generic choices** like Inter, Roboto, or Arial.
- **Strategy**: Choose fonts that elevate the specific context.
- **Examples**:
    - *Tech/Data*: `Space Grotesk`, `JetBrains Mono`, `DM Sans`.
    - *Editorial/Elegant*: `Playfair Display`, `Crimson Pro`, `Instrument Serif`.
    - *Modern/Startup*: `Outfit`, `Plus Jakarta Sans`, `Syne`.
- **Implementation**: Import from Google Fonts. Don't rely on system defaults.

## 2. Color & Theme: Bold & Cohesive
**Avoid timid, evenly-distributed palettes.**
- **Dominance**: Pick one STRONG background/theme color (e.g., deep charcoal, midnight blue, rich forest) and stick to it.
- **Accents**: Use sharp, high-contrast accents (neon lime, electric blue, sunset orange) sparingly but effectively.
- **Inspiration**: Draw from IDE themes (Dracula, Monokai) or cultural aesthetics (Bauhaus, Brutalism), not just "Bootstrap defaults."

## 3. Motion: Choreography
**Avoid scattered, meaningless motion.**
- **Staggered Reveals**: The most "delightful" interaction is a well-orchestrated page load.
    - Use `animation-delay` to stagger the entry of elements (Heading -> Subtext -> Cards).
- **CSS-First**: Use Tailwind's `animate-in` utilities or simple keyframes.
- **Feel**: Animations must ease-out usage (e.g., `cubic-bezier(0.16, 1, 0.3, 1)`).

## 4. Backgrounds & Atmosphere
**Avoid solid flat colors.**
- **Depth**: Layer CSS gradients. Use highly subtle noise textures or geometric patterns (`bg-[url('/pattern.svg')]`).
- **Contextual**: The background should tell a story.
    - *SaaS*: Subtle grid lines or radial glows.
    - *Consumer*: Abstract organic shapes or blurred orbs (`blur-3xl`).

## 5. Spacing & Layout (The Grid)
- **Rhythm**: Stick to the 4px grid (Tailwind `1` = `4px`).
- **Breathing Room**: Content needs space. `p-6` or `p-8` is often better than `p-4` for feature sections.
- **Containers**: Center content with `container mx-auto max-w-7xl px-4`.

## 6. Component Tokens (Reference)
Use these standard starting points to ensure consistency before customizing:
- **Buttons**:
  - Default: `bg-primary text-primary-foreground hover:opacity-90 transition-opacity`
  - Ghost: `hover:bg-accent hover:text-accent-foreground`
  - Outline: `border border-input hover:bg-accent`
- **Cards**:
  - `rounded-xl border bg-card text-card-foreground shadow-sm`
- **Inputs**:
  - `h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`

## 7. Glassmorphism & Modern Touches
- **Subtle Glass**: `bg-background/60 backdrop-blur-xl border-border/40` (Great for sticky navs).
- **Gradients**: Use extremely subtle gradients for backgrounds to avoid "flatness".
  - Example: `bg-gradient-to-b from-background to-muted/20`
