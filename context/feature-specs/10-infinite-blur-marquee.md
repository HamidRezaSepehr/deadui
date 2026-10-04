# Feature 10: Infinite Blur Marquee

## Overview

Build the ultimate, highly performant, and fully configurable infinite marquee component. Unlike basic marquees that only scroll left-to-right, this component must support multiple directions, dynamic speeds, hover interactions, scroll-linked scrubbing, and edge-blurring. It will serve as the foundational scrolling primitive for Dead UI.

## Goals

1. Create a single, robust `Marquee` component that handles all scrolling variations.
2. Ensure 60fps performance using GPU-accelerated CSS transforms (`translateX`/`translateY`).
3. Expose every possible configuration via a clean TypeScript props API.
4. Implement seamless infinite looping by mathematically duplicating children.
5. Add high-quality edge fading using CSS `mask-image` (not heavy JS filters).

## Technical Specifications

### Directory Structure

```
registry/
── marquee/
    ├── marquee.tsx   # Main component
    └── index.ts      # Barrel export
```

### Dependencies

- `clsx`, `tailwind-merge` (for class merging)
- `class-variance-authority` (for base styling variants)
- No heavy animation libraries required for the base loop (CSS is more performant for continuous linear scrolling), but we will use React state for hover pausing.

### Component Props Interface

```typescript
import { type VariantProps, cva } from 'class-variance-authority'

export const marqueeVariants = cva(
  'flex overflow-hidden relative w-full',
  {
    variants: {
      direction: {
        horizontal: 'flex-row',
        vertical: 'flex-col h-[500px]', // Default height for vertical
      },
      blur: {
        none: '',
        edges: '[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]',
        left: '[mask-image:linear-gradient(to_right,transparent,black_20%,black_100%)]',
        right: '[mask-image:linear-gradient(to_right,black_0%,transparent_100%)]',
      }
    },
    defaultVariants: {
      direction: 'horizontal',
      blur: 'edges',
    },
  }
)

export interface MarqueeProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof marqueeVariants> {
  children: React.ReactNode
  
  // Configuration
  speed?: number             // Duration in seconds for one full loop (default: 30)
  gap?: number               // Gap between items in pixels (default: 16)
  pauseOnHover?: boolean     // Pause animation on hover (default: false)
  reverse?: boolean          // Reverse scroll direction (default: false)
  repeat?: number            // Number of times to duplicate content (default: 4)
  scrollLinked?: boolean     // If true, disables auto-play and links to page scroll (default: false)
}
```

### Implementation Logic

1. **Seamless Looping:** 
   - The component must render the `children` multiple times (based on the `repeat` prop) to ensure the track is long enough to loop seamlessly without visual jumps.
   - Use a flex container. For horizontal, it's `flex-row`. For vertical, `flex-col`.
2. **CSS Animation:**
   - Use a CSS `@keyframes` defined in a `<style>` tag or Tailwind arbitrary values to translate the track.
   - Horizontal: `translateX(0)` to `translateX(calc(-100% / repeat))` (or calculate exact pixel width). *Better approach:* Use CSS variables. Set `--duration` and `--gap`.
   - Actually, the most robust way is to use a CSS variable for the animation duration and let CSS handle the `translateX(-50%)` if we duplicate the content exactly twice, or calculate the exact offset.
   - *Simplified robust approach:* Render children `repeat` times. Animate the container from `0` to `-100% / repeat` (if using percentages) or use a fixed pixel calculation. Let's use the standard "duplicate twice and translate -50%" for simplicity, OR "duplicate N times and translate -100%/N". Let's go with: Render children `repeat` times. Animate `translateX` from `0` to `calc(-100% / ${repeat})`.
3. **Pause on Hover:**
   - If `pauseOnHover` is true, add a state `isHovered`.
   - Apply `animation-play-state: paused` to the inner track when hovered.
4. **Edge Blur:**
   - Use Tailwind's arbitrary `mask-image` property (as defined in the `cva` variants above) to create the smooth fade-in/fade-out effect at the edges. This is GPU-accelerated and much faster than JS blur.
5. **Scroll Linked (Optional but powerful):**
   - If `scrollLinked` is true, disable the CSS animation. Instead, use a simple `useEffect` with a `scroll` event listener (or GSAP ScrollTrigger if preferred, but let's keep it dependency-free for this component) to translate the track based on `window.scrollY`. *Actually, to keep it simple and performant for MVP, let's stick to auto-scrolling first and mark scroll-linked as a future Pro feature, OR implement a basic CSS `animation-timeline: scroll()` if browser support allows. Let's stick to standard auto-scroll for the Free tier.* -> *Correction:* Let's implement basic scroll-linked using a simple React scroll listener that updates a CSS variable `--scroll-progress`.

### Example Component Structure

```tsx
'use client'

import { cn } from '@/lib/utils'
import { marqueeVariants, type MarqueeProps } from './marquee'

export function Marquee({
  children,
  className,
  direction = 'horizontal',
  blur = 'edges',
  speed = 30,
  gap = 16,
  pauseOnHover = false,
  reverse = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  // Render children 'repeat' times
  const items = Array.from({ length: repeat }, (_, i) => (
    <div key={i} className="flex shrink-0" style={{ gap: `${gap}px` }}>
      {children}
    </div>
  ))

  const animationDirection = reverse ? 'reverse' : 'normal'
  const animationDuration = `${speed}s`

  return (
    <div 
      className={cn(marqueeVariants({ direction, blur }), className)} 
      style={{ ['--gap' as string]: `${gap}px` }}
      {...props}
    >
      <div 
        className={cn(
          "flex shrink-0 animate-marquee",
          direction === 'vertical' && "flex-col",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
        style={{
          ['--duration' as string]: animationDuration,
          ['--direction' as string]: animationDirection,
          gap: `${gap}px`,
        }}
      >
        {items}
      </div>
    </div>
  )
}
```

*Note: You will need to add the `animate-marquee` keyframes to the global CSS or Tailwind config.*

**Tailwind Config Addition (for keyframes):**
```typescript
// tailwind.config.ts
theme: {
  extend: {
    keyframes: {
      marquee: {
        from: { transform: 'translateX(0)' },
        to: { transform: 'translateX(calc(-100% / var(--repeat, 4)))' }, // Need to pass repeat as CSS var
      },
      'marquee-vertical': {
        from: { transform: 'translateY(0)' },
        to: { transform: 'translateY(calc(-100% / var(--repeat, 4)))' },
      }
    },
    animation: {
      marquee: 'marquee var(--duration, 30s) linear infinite var(--direction, normal)',
      'marquee-vertical': 'marquee-vertical var(--duration, 30s) linear infinite var(--direction, normal)',
    }
  }
}
```

## Implementation Steps

1. **Update Tailwind Config:** Add the `marquee` and `marquee-vertical` keyframes and animations to `tailwind.config.ts`.
2. **Create Component:** Create `registry/marquee/marquee.tsx` with the props interface and logic above. Ensure the `repeat` prop is passed as a CSS variable `--repeat` so the keyframes can calculate the exact translation distance.
3. **Create Barrel Export:** Create `registry/marquee/index.ts`.
4. **Create Test Page:** Create `app/test-marquee/page.tsx`.
   - Section 1: Default horizontal marquee with logos/text.
   - Section 2: Vertical marquee.
   - Section 3: Marquee with `pauseOnHover={true}`.
   - Section 4: Marquee with `reverse={true}` and custom `speed={10}` (fast).
   - Section 5: Marquee with `blur="none"` to show the hard edges.
5. **Verify Build:** `npm run build`.
6. **Verify Visually:** Check all 5 sections on the test page. Ensure the loop is perfectly seamless (no jump when it restarts).
7. **Update Progress Tracker:** Mark Feature 10 as complete.

## Verification Checklist

- [ ] Component renders without errors.
- [ ] Horizontal marquee loops seamlessly left-to-right.
- [ ] Vertical marquee loops seamlessly top-to-bottom.
- [ ] `pauseOnHover` stops the animation smoothly.
- [ ] `reverse` changes the direction.
- [ ] `blur="edges"` creates a smooth fade on both sides.
- [ ] `speed` prop correctly changes the duration.
- [ ] `gap` prop correctly spaces the items.
- [ ] `npm run build` passes with zero TypeScript errors.
- [ ] `progress-tracker.md` is updated.

## Constraints

- Do NOT use GSAP or Framer Motion for the continuous loop; CSS animations are significantly more performant for infinite linear scrolling.
- Ensure the loop is mathematically seamless. The most common bug is a "jump" when the animation resets. Using `translateX(calc(-100% / var(--repeat)))` solves this if the content is duplicated exactly `repeat` times.
- The `mask-image` blur must use CSS variables or Tailwind arbitrary values, not heavy SVG filters.

## Files to Create

1. `registry/marquee/marquee.tsx`
2. `registry/marquee/index.ts`
3. `app/test-marquee/page.tsx`

## Files to Update

1. `tailwind.config.ts` (add keyframes)
2. `context/progress-tracker.md`