# Feature 13: Staggered Grid Reveal

## Overview

Build a high-performance, declarative container component that animates its children sequentially (staggered) as they enter the viewport. Unlike scroll-scrubbing effects, this is a "trigger-once" or "trigger-every-time" entrance animation perfect for feature grids, image galleries, and testimonial sections. It uses Framer Motion (`motion/react`) for robust layout preservation and smooth `whileInView` detection.

## Goals

1. Create a reusable `StaggeredGrid` wrapper that automatically animates its direct children.
2. Support 7 distinct visual variants (fade-up, scale-in, blur-in, slide-left, slide-right, flip-x, flip-y).
3. Ensure the component does not break CSS Grid layouts (e.g., `col-span-2` items must remain intact).
4. Expose all timing, easing, and trigger configurations via a clean TypeScript props API.
5. Maintain 60fps performance by leveraging Framer Motion's optimized transform pipelines.

## Technical Specifications

### Directory Structure

```
registry/
└── staggered-grid/
    ├── staggered-grid.tsx   # Main component
    └── index.ts             # Barrel export
```

### Dependencies

- `motion` (already installed in Session 2 as `motion/react`)
- `class-variance-authority` (for variant definitions)
- `clsx`, `tailwind-merge` (for class merging)

### Component Props Interface

```typescript
import { type VariantProps, cva } from 'class-variance-authority'
import { type HTMLMotionProps } from 'motion/react'

export const staggeredGridVariants = cva(
  '',
  {
    variants: {
      variant: {
        'fade-up': { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } },
        'scale-in': { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } },
        'blur-in': { initial: { opacity: 0, filter: 'blur(10px)' }, animate: { opacity: 1, filter: 'blur(0px)' } },
        'slide-left': { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 } },
        'slide-right': { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 } },
        'flip-x': { initial: { opacity: 0, rotateX: 45 }, animate: { opacity: 1, rotateX: 0 } },
        'flip-y': { initial: { opacity: 0, rotateY: 45 }, animate: { opacity: 1, rotateY: 0 } },
      },
    },
    defaultVariants: {
      variant: 'fade-up',
    },
  }
)

export interface StaggeredGridProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof staggeredGridVariants> {
  children: React.ReactNode
  
  // Animation Configuration
  stagger?: number           // Delay between each child in seconds (default: 0.1)
  duration?: number          // Animation duration in seconds (default: 0.6)
  delay?: number             // Initial delay before the first item animates (default: 0)
  ease?: string              // Easing function (default: 'easeOut')
  
  // Trigger Configuration
  threshold?: number         // Viewport intersection threshold 0-1 (default: 0.1)
  once?: boolean             // Play only once (default: true). If false, replays when scrolling back.
  rootMargin?: string        // Root margin for IntersectionObserver (default: '0px')
  
  // Layout
  containerClassName?: string // Classes applied to the parent container
}
```

### Implementation Logic

1. **Child Wrapping Strategy:**
   - To animate children without breaking CSS Grid spans (e.g., `col-span-2`), we MUST NOT wrap them in an extra `div`. 
   - Instead, use `React.Children.map` to iterate over `children`.
   - For each valid child, use `React.cloneElement` to inject the `motion` properties, OR wrap it in a `motion.div` with `display: contents` (though `display: contents` has limited animation support).
   - *Best Practice:* The most robust way in Framer Motion is to require the user to pass `motion` components, OR we provide a `StaggeredItem` wrapper. 
   - *Simpler & Better Approach for Dead UI:* The `StaggeredGrid` component will render a `motion.div` container. It will map over `children` and wrap each in a `motion.div`. To prevent breaking grid layouts, the wrapper `motion.div` will use `className="contents"` (if the user's grid supports it) OR we simply instruct the user to use the `StaggeredItem` component we export alongside it.
   - *Final Decision:* Export two components: `StaggeredGrid` (the container) and `StaggeredItem` (the wrapper for each child). This is the cleanest, most flexible API and prevents all layout bugs.

2. **Staggered Animation:**
   - The `StaggeredGrid` container will use the `variants` prop to define the parent animation state.
   - `initial="hidden"`, `whileInView="visible"`, `viewport={{ once, amount: threshold }}`.
   - The `transition` on the parent will define the `staggerChildren` and `delayChildren`.

3. **Variant Application:**
   - The `StaggeredItem` will receive the `variant` prop from the parent (via context or direct prop) and apply the corresponding `initial` and `animate` states.

### Example Component Structure

```tsx
'use client'

import { createContext, useContext } from 'react'
import { motion, type HTMLMotionProps } from 'motion/react'
import { cn } from '@/lib/utils'
import { staggeredGridVariants, type StaggeredGridProps } from './staggered-grid'

// Context to pass variant down to items
const GridVariantContext = createContext<StaggeredGridProps['variant']>('fade-up')

export function StaggeredGrid({
  children,
  className,
  containerClassName,
  variant = 'fade-up',
  stagger = 0.1,
  duration = 0.6,
  delay = 0,
  ease = 'easeOut',
  threshold = 0.1,
  once = true,
  ...props
}: StaggeredGridProps) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  }

  return (
    <GridVariantContext.Provider value={variant}>
      <motion.div
        className={cn('w-full', containerClassName)}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount: threshold }}
        {...props}
      >
        {children}
      </motion.div>
    </GridVariantContext.Provider>
  )
}

export interface StaggeredItemProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
}

export function StaggeredItem({
  children,
  className,
  ...props
}: StaggeredItemProps) {
  const variant = useContext(GridVariantContext)
  
  // Map variant string to actual animation states
  const itemVariants = {
    hidden: staggeredGridVariants({ variant }).initial, // Note: cva returns strings, we need to map to objects. See fix below.
    visible: staggeredGridVariants({ variant }).animate,
  }

  // Fix: cva returns Tailwind classes. We need to map variant to Framer Motion objects directly.
  // Let's redefine the variant map inside the component for Framer Motion.
  const motionVariants = {
    'fade-up': { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } },
    'scale-in': { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } },
    'blur-in': { hidden: { opacity: 0, filter: 'blur(10px)' }, visible: { opacity: 1, filter: 'blur(0px)' } },
    'slide-left': { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } },
    'slide-right': { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } },
    'flip-x': { hidden: { opacity: 0, rotateX: 45 }, visible: { opacity: 1, rotateX: 0 } },
    'flip-y': { hidden: { opacity: 0, rotateY: 45 }, visible: { opacity: 1, rotateY: 0 } },
  }

  const currentVariant = motionVariants[variant || 'fade-up']

  return (
    <motion.div
      variants={currentVariant}
      transition={{ duration, ease }}
      className={cn('', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
```

## Implementation Steps

1. Create `registry/staggered-grid/` directory.
2. Create `staggered-grid.tsx` with the `StaggeredGrid` container and `StaggeredItem` wrapper logic. Ensure the `motionVariants` map is correctly typed and applied.
3. Create `index.ts` barrel export exporting both `StaggeredGrid` and `StaggeredItem`.
4. Create test page at `app/test-staggered-grid/page.tsx`.
   - Section 1: Default `fade-up` 3x3 grid of cards.
   - Section 2: `scale-in` variant with a faster `stagger` (0.05).
   - Section 3: `blur-in` variant with `once={false}` to show it replaying on scroll up.
   - Section 4: A mixed grid showing how `StaggeredItem` handles different content (images, text, tall cards) without breaking layout.
5. Verify build: `npm run build`.
6. Verify visually: `npm run dev`, navigate to `/test-staggered-grid`, scroll down to trigger the animations.
7. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] Component renders without errors.
- [ ] Children animate sequentially based on the `stagger` prop.
- [ ] All 7 variants produce distinct visual effects.
- [ ] `once={false}` correctly replays the animation when scrolling back up.
- [ ] The component does not break CSS Grid layouts (items retain their grid spans).
- [ ] `threshold` prop correctly adjusts when the animation triggers.
- [ ] `npm run build` passes with zero TypeScript errors.
- [ ] `progress-tracker.md` is updated.

## Constraints

- Do NOT use GSAP for this component; use `motion/react` as it is superior for React list staggering and layout preservation.
- Do NOT wrap children in a way that breaks CSS Grid `col-span` or `row-span` properties. The `StaggeredItem` must act as a transparent animation layer.
- Ensure `prefers-reduced-motion` is respected (Framer Motion handles this automatically if configured, but ensure no jarring flashes occur).

## Files to Create

1. `registry/staggered-grid/staggered-grid.tsx`
2. `registry/staggered-grid/index.ts`
3. `app/test-staggered-grid/page.tsx`

## Files to Update

1. `context/progress-tracker.md`