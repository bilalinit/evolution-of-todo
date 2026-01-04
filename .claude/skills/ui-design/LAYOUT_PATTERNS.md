# Layout Patterns

Structural patterns blending Editorial warmth with Technical precision.

## 🧭 Navigation Bar (Technical)
Thin lines, uppercase labels, technical feel. (Reference: Sciemo)

```tsx
<nav className="sticky top-0 z-50 w-full bg-[#F9F7F2] border-b border-[#2A1B12]/10">
  <div className="flex items-center justify-between px-6 py-4">
    <div className="font-serif text-2xl font-bold">Brand.</div>
    <div className="hidden md:flex gap-8">
      {['Product', 'Research', 'Company'].map(link => (
        <a key={link} href="#" className="font-mono text-xs uppercase tracking-widest hover:text-[#FF6B4A]">
          {link}
        </a>
      ))}
    </div>
    <button className="bg-[#FF6B4A] text-white px-5 py-2 text-sm font-mono uppercase tracking-wide hover:bg-[#E55A3D]">
      Book Demo
    </button>
  </div>
</nav>
```

## 🕸️ Wireframe Hero (Moonlet Style)
Massive typography with delicate technical lines extending horizontally.

```tsx
<section className="relative py-32 px-6 border-b border-[#2A1B12]/10 overflow-hidden">
  {/* Decorative Lines */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="h-px w-full bg-[#2A1B12]/5 top-1/3 absolute" />
    <div className="h-px w-full bg-[#2A1B12]/5 top-2/3 absolute" />
  </div>

  <div className="relative z-10 max-w-7xl mx-auto">
    <h1 className="font-serif text-[clamp(4rem,9vw,9rem)] leading-[0.9] tracking-tighter text-[#2A1B12]">
      A CONSTELLATION<br />
      <span className="text-[#FF6B4A] ml-[10%]">FOR GROWTH</span>
    </h1>
    
    <p className="mt-12 max-w-xl text-lg text-[#5C4D45] font-sans border-l-2 border-[#FF6B4A] pl-6">
      Providing blockchain networks, stakeholders, and institutions the tools for secure growth.
    </p>
  </div>
</section>
```

## 🦶 Massive Footer (Lipedema Guru Style)
Clean, spacious, massive logo at bottom.

```tsx
<footer className="bg-[#F0EBE0] pt-24 pb-8 px-6 border-t border-[#2A1B12]/10">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-24">
    {/* Columns */}
    <div>
      <h4 className="font-mono text-xs uppercase tracking-widest mb-6 opacity-60">Expertise</h4>
      <ul className="space-y-3 font-sans opacity-80">
        <li>Strategy</li>
        <li>Design</li>
      </ul>
    </div>
    {/* ... more columns ... */}
  </div>
  
  {/* Massive Logo */}
  <div className="w-full border-t border-[#2A1B12]/10 pt-8 text-center md:text-left">
    <h1 className="font-serif text-[15vw] leading-none opacity-90 tracking-tight">
      BrandName
    </h1>
  </div>
</footer>
```
