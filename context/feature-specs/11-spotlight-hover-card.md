# Feature 11: Spotlight Hover Card

## Overview

Build a high-performance, mouse-tracking spotlight card component. Unlike basic hover cards that just change color, this component tracks the cursor position and illuminates the area around the mouse with a radial gradient. It supports multiple glow modes (border, background, or both), optional 3D tilt physics, and is engineered for zero React re-renders during mouse movement by utilizing CSS custom properties.

## Goals

1. Create a reusable card component that tracks mouse position relative to its boundaries.
2. Implement a moving spotlight effect using CSS `radial-gradient` driven by CSS variables (`--mouse-x`, `--mouse-y`).
3. Provide multiple visual variations (Border Glow, Background Glow, Combined, 3D Tilt).
4. Ensure 60fps performance by updating DOM CSS variables directly, bypassing React state updates on `mousemove`.
5. Expose every visual parameter (colors, sizes, opacities, tilt intensity) via a clean TypeScript props API.

## Technical Specifications

### Directory Structure

```
registry/
└── spotlight-card/
    ├── spotlight-card.tsx   # Main component
    └── index.ts             # Barrel export
```

### Dependencies

- `clsx`, `tailwind-merge` (for class merging)
- `class-variance-authority` (for base styling variants)

### Component Props Interface

```typescript
import { type VariantProps, cva } from 'class-variance-authority'

export const spotlightCardVariants = cva(
  'relative overflow-hidden rounded-xl border transition-colors duration-300',
  {
    variants: {
      shape: {
        rounded: 'rounded-2xl',
        soft: 'rounded-lg',
        sharp: 'rounded-none',
      },
    },
    defaultVariants: {
      shape: 'rounded',
    },
  }
)

export interface SpotlightCardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spotlightCardVariants> {
  children: React.ReactNode
  
  // Spotlight Configuration
  spotlightColor?: string      // Default: 'rgba(255, 255, 255, 0.15)'
  spotlightSize?: number       // Diameter in pixels. Default: 300
  spotlightOpacity?: number    // 0 to 1. Default: 1
  
  // Glow Modes
  glowType?: 'border' | 'background' | 'both' | 'none' // Default: 'both'
  
  // Border Colors
  borderColor?: string         // Default: 'rgba(255, 255, 255, 0.1)'
  hoveredBorderColor?: string  // Default: 'rgba(255, 255, 255, 0.3)'
  
  // 3D Tilt Configuration
  enableTilt?: boolean         // Default: false
  tiltIntensity?: number       // Max rotation in degrees. Default: 10
}
```

### Implementation Logic (Crucial for Performance)

1. **Mouse Tracking without Re-renders:**
   - Use `onMouseMove` to calculate the cursor's X and Y position relative to the card's bounding box.
   - **DO NOT** use `useState` for mouse coordinates. This will cause a React re-render on every pixel of movement, destroying performance.
   - Instead, use `element.style.setProperty('--mouse-x', `${x}px`)` and `--mouse-y` to update CSS variables directly on the DOM node.
2. **CSS Radial Gradient:**
   - The component's background or border will use a CSS variable for the gradient position:
   - Background glow: `background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent var(--spotlight-size))`
   - Border glow: Use a pseudo-element (`::before`) with the same radial gradient, masked to the border, or use a clever `background-clip` technique. *Simpler approach for border:* Use a pseudo-element with a slightly larger size than the card, apply the radial gradient to it, and mask it out using the card's background color, leaving only the border visible.
3. **3D Tilt (Optional):**
   - If `enableTilt` is true, calculate the rotation based on the mouse position relative to the center of the card.
   - Apply `transform: perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)` directly via inline styles (still using CSS variables or direct style updates).
   - Add a `transition: transform 0.1s ease-out` for smoothness, but remove it during active mouse movement to prevent lag, then re-add it on `mouseleave` for the snap-back effect.

### Example Component Structure

```tsx
'use client'

import { useRef, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'
import { spotlightCardVariants, type SpotlightCardProps } from './spotlight-card'

export function SpotlightCard({
  children,
  className,
  shape,
  spotlightColor = 'rgba(255, 255, 255, 0.15)',
  spotlightSize = 300,
  spotlightOpacity = 1,
  glowType = 'both',
  borderColor = 'rgba(255, 255, 255, 0.1)',
  hoveredBorderColor = 'rgba(255, 255, 255, 0.3)',
  enableTilt = false,
  tiltIntensity = 10,
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    cardRef.current.style.setProperty('--mouse-x', `${x}px`)
    cardRef.current.style.setProperty('--mouse-y', `${y}px`)

    if (enableTilt) {
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateX = ((y - centerY) / centerY) * -tiltIntensity
      const rotateY = ((x - centerX) / centerX) * tiltIntensity
      
      cardRef.current.style.setProperty('--rotate-x', `${rotateX}deg`)
      cardRef.current.style.setProperty('--rotate-y', `${rotateY}deg`)
    }
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    // Reset tilt smoothly
    if (enableTilt) {
      cardRef.current.style.setProperty('--rotate-x', `0deg`)
      cardRef.current.style.setProperty('--rotate-y', `0deg`)
    }
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        spotlightCardVariants({ shape }),
        "group",
        className
      )}
      style={{
        ['--spotlight-color' as string]: spotlightColor,
        ['--spotlight-size' as string]: `${spotlightSize}px`,
        ['--spotlight-opacity' as string]: spotlightOpacity,
        ['--border-color' as string]: borderColor,
        ['--hovered-border-color' as string]: hoveredBorderColor,
        ['--rotate-x' as string]: '0deg',
        ['--rotate-y' as string]: '0deg',
        transform: enableTilt ? 'perspective(1000px) rotateX(var(--rotate-x)) rotateY(var(--rotate-y))' : undefined,
        transition: enableTilt ? 'transform 0.3s ease-out' : undefined,
      }}
      {...props}
    >
      {/* Background Glow Layer */}
      {(glowType === 'background' || glowType === 'both') && (
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent var(--spotlight-size))`,
            opacity: 'var(--spotlight-opacity)',
          }}
        />
      )}

      {/* Border Glow Layer */}
      {(glowType === 'border' || glowType === 'both') && (
        <div 
          className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--hovered-border-color), transparent var(--spotlight-size))`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: '1px', // Border thickness
          }}
        />
      )}

      {/* Base Border */}
      <div 
        className="absolute inset-0 rounded-[inherit] pointer-events-none"
        style={{ border: `1px solid var(--border-color)` }}
      />

      {/* Content */}
      <div className="relative z-10 h-full w-full p-6">
        {children}
      </div>
    </div>
  )
}
```

## Implementation Steps

1. Create `registry/spotlight-card/` directory.
2. Create `spotlight-card.tsx` with the logic above. Ensure the CSS variable approach is used for mouse tracking.
3. Create `index.ts` barrel export.
4. Create test page at `app/test-spotlight-card/page.tsx`.
   - Section 1: A 3x3 grid of cards (Linear style) showing how the spotlight affects adjacent cards.
   - Section 2: Single cards demonstrating each `glowType` (border, background, both, none).
   - Section 3: A card with `enableTilt={true}` to show the 3D effect.
   - Section 4: Cards with custom `spotlightColor` (e.g., red, blue) and `spotlightSize`.
5. Verify build: `npm run build`.
6. Verify visually: `npm run dev`, navigate to `/test-spotlight-card`, move mouse over cards to verify smooth 60fps spotlight and tilt.
7. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] Component renders without errors.
- [ ] Spotlight follows the cursor smoothly without lag.
- [ ] No React re-renders occur during mouse movement (check React DevTools Profiler).
- [ ] `glowType="border"` correctly illuminates only the border.
- [ ] `glowType="background"` correctly illuminates the card surface.
- [ ] `enableTilt` rotates the card in 3D space and snaps back smoothly on leave.
- [ ] Custom colors and sizes apply correctly.
- [ ] `npm run build` passes with zero TypeScript errors.
- [ ] `progress-tracker.md` is updated.

## Constraints

- **PERFORMANCE IS CRITICAL:** Do not use `useState` for mouse coordinates. Use CSS variables and direct DOM manipulation.
- Do not use GSAP or Framer Motion for the mouse tracking; native DOM + CSS is faster for this specific effect.
- Ensure the border glow uses a proper mask technique so it doesn't bleed into the background.

## Files to Create

1. `registry/spotlight-card/spotlight-card.tsx`
2. `registry/spotlight-card/index.ts`
3. `app/test-spotlight-card/page.tsx`

## Files to Update

1. `context/progress-tracker.md`