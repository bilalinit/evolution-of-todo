# Animation Patterns

Reusable **Framer Motion** components and variants for the **Modern Technical Editorial** style.

## ⬆️ Fade In Up (Signature Entrance)
Used for Headings, text blocks, and images. Starts 30px down and floats up while fading in.

```tsx
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};

<motion.div variants={fadeInUp} initial="initial" animate="animate">
  <h1 className="font-serif text-6xl">Headline</h1>
</motion.div>
```

## ➖ Line Draw (Technical Aesthetic)
Used for dividers and underlines. Scales from 0 to 100% width.

```tsx
import { motion } from 'framer-motion';

const lineDraw = {
  initial: { scaleX: 0, originX: 0 },
  animate: { 
    scaleX: 1,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
  }
};

<div className="relative w-full h-px bg-espresso/10">
    <motion.div 
        variants={lineDraw} 
        initial="initial" 
        whileInView="animate" 
        viewport={{ once: true }}
        className="absolute inset-0 bg-espresso/20" 
    />
</div>
```

## 🌊 Staggered List
Used for grids, nav menus, and feature lists.

```tsx
import { motion } from 'framer-motion';

const container = {
  animate: {
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

<motion.ul variants={container} initial="initial" animate="animate">
  {items.map(i => (
    <motion.li key={i} variants={item}>{i}</motion.li>
  ))}
</motion.ul>
```

## 🖱️ Hover Interactions (Minimalist)
For interactive cards and buttons. Avoid bounce; favor subtle scale and smooth opacity.

```tsx
import { motion } from 'framer-motion';

<motion.button
  whileHover={{ scale: 1.02, y: -1 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
  className="btn-primary"
>
  Click Me
</motion.button>
```
## 🧩 Custom Components (Next.js Link, UI Libs)
When animating non-standard HTML tags (like `<Link>`), you MUST wrap them in `motion()` to avoid React prop warnings.

```tsx
import { motion } from 'framer-motion';
import Link from 'next/link';

const MotionLink = motion(Link);

<MotionLink
  href="/signup"
  whileHover={{ scale: 1.02 }}
  className="btn-primary"
>
  Get Started
</MotionLink>
```
