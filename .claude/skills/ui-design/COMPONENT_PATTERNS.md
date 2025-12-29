# Component Patterns

Standard UI components for **Modern Technical Editorial**.

## 🧱 Buttons (Technical & Pill)

### Technical Action (Sciemo Style)
Sharp corners, uppercase, technical.
```tsx
<button className="border border-[#2A1B12] bg-transparent hover:bg-[#2A1B12] hover:text-[#F9F7F2] px-6 py-3 font-mono text-xs uppercase tracking-widest transition-colors">
  Go to Case Study
</button>
```

### Primary Pill (Editorial Style)
Softer, for main CTAs.
```tsx
<button className="bg-[#FF6B4A] text-white rounded-full px-8 py-4 font-sans font-bold shadow-lg shadow-[#FF6B4A]/20 hover:-translate-y-1 transition-transform">
  Get Started
</button>
```

## 🔗 Connection Graphics (Sciemo Style)
Using SVG lines to connect elements.

```tsx
<div className="relative">
  <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-[#2A1B12]/20">
    <line x1="10%" y1="10%" x2="90%" y2="90%" />
    <circle cx="10%" cy="10%" r="4" fill="#FF6B4A" />
    <circle cx="90%" cy="90%" r="4" fill="#FF6B4A" />
  </svg>
  {/* Content... */}
</div>
```

## 📝 Inputs (Minimal Tech)
Boxy, technical feel.

```tsx
<div className="group">
  <label className="block font-mono text-[10px] uppercase tracking-widest mb-2 opacity-60">Email Address</label>
  <input 
    type="email" 
    className="w-full bg-[#F9F7F2] border border-[#2A1B12]/20 p-4 font-mono text-sm focus:border-[#FF6B4A] focus:outline-none transition-colors"
    placeholder="ENTER EMAIL..."
  />
</div>
```

## ⚡️ Technical Iconography rules
Do **NOT** hardcode raw SVGs unless necessary. Use **Lucide React** or **Heroicons** (Outline).

### Style Rules
1.  **Library**: `lucide-react` (preferred) or `heroicons/react/24/outline`.
2.  **Stroke**: Must be `stroke-width={2}` or `stroke-width={1.5}` (Technical feel).
3.  **No Fill**: Icons must be outlined. No solid fills.
4.  **Color**: Use `text-foreground` (Espresso) or `text-accent` (Orange).

```tsx
import { Zap, BarChart3 } from 'lucide-react';

<Zap className="w-5 h-5 text-accent" strokeWidth={2} />
<BarChart3 className="w-5 h-5 text-foreground" strokeWidth={2} />
```
