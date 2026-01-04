# The Design Protocol: Think Before You Render

To ensure "Premium" output from any AI model, you **MUST** follow this 4-step protocol before writing a single line of code. This prevents "auto-pilot" generic designs.

## Step 1: The Vibe Check (Mental Sandbox)
Before coding, define the "Soul" of the interface.
- **Micro-Copy**: What is the tone? (e.g., "Playful & Bouncy" vs "Stoic & High-Frequency").
- **Theme Selection**: Choose a preset from `THEMES.md` (e.g., "Anti-Slop" or "RPG").
- **Asset Selection**: Pick the specific fonts and primary colors *now*. Do not decide mid-code.

## Step 2: The Structural Blueprint
visualize the component hierarchy to ensure mobile responsiveness.
- **Mobile First**: "How does this look on iPhone SE?" (Stack vertically).
- **Desktop Expansion**: "How does it leverage width?" (Grid/Masonry).
- **Z-Index Strategy**: Identify sticky elements, modals, and dropdowns.

## Step 3: The "Anti-Slop" Audit
Critique your mental plan against `CLAUDE.md`:
- [ ] am I using generic gradients? -> **Fix**: Add noise or subtle patterns.
- [ ] Is the spacing too tight? -> **Fix**: Add 20% more padding.
- [ ] Is the typography boring? -> **Fix**: Swap Inter for generic Sans.
- [ ] Is the motion linear? -> **Fix**: Use `cubic-bezier` and staggered delays.

## Step 4: Execution Strategy
Only now do you write code.
1.  Scaffold the HTML structure (Semantic).
2.  Apply Layout classes (Grid/Flex).
3.  Apply "Paint" (Colors/Typography).
4.  Apply "Soul" (Animation/Interaction).

> **Enforcement**: When asked to design, start your response with a summary of Step 1 & 2.
