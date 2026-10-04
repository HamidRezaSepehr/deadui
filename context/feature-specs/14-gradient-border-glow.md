# Feature 14: Gradient Border Glow

## Overview

Build a high-performance, fully configurable animated gradient border component. This component wraps any content (cards, buttons, images) and applies a dynamic, glowing border effect. It supports multiple animation modes (rotating, pulsing, static, and spotlight) and is engineered using pure CSS gradients and masks to ensure zero JavaScript overhead during the animation loop.

## Goals

1. Create a reusable `GradientBorder` wrapper component that accepts any children.
2. Implement 4 distinct visual variants: `rotating` (classic spinning conic gradient), `pulsing` (breathing opacity), `static` (fixed gradient), and `spotlight` (mouse-tracking border glow).
3. Expose every visual parameter (colors, speed, border width, blur intensity, corner radius) via a clean TypeScript props API.
4. Ensure 60fps performance by offloading all animation to the GPU via CSS transforms and opacity.
5. Prevent layout shifts by using absolute positioning and proper box-sizing.

## Technical Specifications

### Directory Structure

```
registry/
└── gradient-border/
    ├── gradient-border.tsx   # Main component
    └── index.ts              # Barrel export
```

### Dependencies

- `clsx`, `tailwind-merge` (for class merging)
- `class-variance-authority` (for variant definitions)
- No heavy animation libraries required (pure CSS for rotating/pulsing/static; minimal React state for spotlight).

### Component Props Interface

```typescript
import { type VariantProps, cva } from 'class-variance-authority'

export const gradientBorderVariants = cva(
  'relative rounded-xl p-[1px] overflow-hidden',
  {
    variants: {
      variant: {
        rotating: 'animate-gradient-rotate',
        pulsing: 'animate-gradient-pulse',
        static: '',
        spotlight: 'group',
      },
      radius: {
        sm: 'rounded-lg',
        md: 'rounded-xl',
        lg: 'rounded-2xl',
        full: 'rounded-full',
      }
    },
    defaultVariants: {
      variant: 'rotating',
      radius: 'md',
    },
  }
)

export interface GradientBorderProps 
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  
  // Configuration
  colors?: string[]          // Array of hex/rgb colors for the gradient. Default: ['#ff0080', '#7928ca', '#00dfd8']
  speed?: number             // Animation duration in seconds (for rotating/pulsing). Default: 4
  width?: number             // Border thickness in pixels. Default: 1
  blur?: number              # Glow spread/blur outside the border. Default: 0 (no blur)
  intensity?: number         # Opacity of the gradient (0 to 1). Default: 1
}
```

### Implementation Logic

1. **The "Masking" Technique:**
   - The component consists of two layers:
     1. **The Glow Layer (Background):** An absolutely positioned `div` that fills the parent. It contains the `conic-gradient` or `linear-gradient`.
     2. **The Content Layer (Foreground):** A `div` with a solid background color (e.g., `bg-dead-black`) that sits on top of the Glow Layer, slightly smaller by the `width` prop. This masks the center of the gradient, leaving only the border visible.
2. **Rotating Variant:**
   - Apply a CSS `@keyframes` animation that rotates the Glow Layer from `0deg` to `360deg`.
   - Use `will-change: transform` to promote it to the GPU layer.
3. **Pulsing Variant:**
   - Animate the `opacity` of the Glow Layer from `0.3` to `1` and back.
4. **Spotlight Variant:**
   - Use a `radial-gradient` on the Glow Layer.
   - Track mouse position using CSS variables (`--mouse-x`, `--mouse-y`) updated via `onMouseMove` (same performant pattern as the Spotlight Card).
5. **Blur/Glow Effect:**
   - If `blur > 0`, apply a `filter: blur(${blur}px)` to a duplicate Glow Layer placed *behind* the main component to create an ambient outer glow.

### Example Component Structure

```tsx
'use client'

import { useRef, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'
import { gradientBorderVariants, type GradientBorderProps } from './gradient-border'

export function GradientBorder({
  children,
  className,
  variant = 'rotating',
  radius = 'md',
  colors = ['#ff0080', '#7928ca', '#00dfd8'],
  speed = 4,
  width = 1,
  blur = 0,
  intensity = 1,
  ...props
}: GradientBorderProps) {
  const borderRef = useRef<HTMLDivElement>(null)

  const gradientStyle = {
    background: variant === 'spotlight' 
      ? `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${colors.join(', ')}, transparent 60%)`
      : variant === 'static'
      ? `linear-gradient(135deg, ${colors.join(', ')})`
      : `conic-gradient(from 0deg, ${colors.join(', ')}, ${colors[0]})`,
    opacity: intensity,
    animationDuration: variant !== 'static' && variant !== 'spotlight' ? `${speed}s` : undefined,
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (variant !== 'spotlight' || !borderRef.current) return
    const rect = borderRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    borderRef.current.style.setProperty('--mouse-x', `${x}px`)
    borderRef.current.style.setProperty('--mouse-y', `${y}px`)
  }

  return (
    <div
      ref={borderRef}
      onMouseMove={handleMouseMove}
      className={cn(gradientBorderVariants({ variant, radius }), className)}
      style={{ padding: `${width}px` }}
      {...props}
    >
      {/* Outer Blur Glow (if enabled) */}
      {blur > 0 && (
        <div 
          className="absolute inset-0 rounded-[inherit] -z-10"
          style={{ 
            ...gradientStyle, 
            filter: `blur(${blur}px)`,
            transform: 'scale(1.05)' // Prevent blur clipping
          }} 
        />
      )}

      {/* Main Gradient Border */}
      <div 
        className="absolute inset-0 rounded-[inherit]"
        style={gradientStyle}
      />

      {/* Inner Content Mask */}
      <div className="relative h-full w-full rounded-[inherit] bg-dead-black z-10">
        {children}
      </div>
    </div>
  )
}
```

*Note: You will need to add the `gradient-rotate` and `gradient-pulse` keyframes to the Tailwind config.*

**Tailwind Config Addition:**
```typescript
// tailwind.config.ts
theme: {
  extend: {
    keyframes: {
      'gradient-rotate': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
      },
      'gradient-pulse': {
        '0%, 100%': { opacity: '0.4' },
        '50%': { opacity: '1' },
      }
    },
    animation: {
      'gradient-rotate': 'gradient-rotate var(--duration, 4s) linear infinite',
      'gradient-pulse': 'gradient-pulse var(--duration, 4s) ease-in-out infinite',
    }
  }
}
```

## Implementation Steps

1. **Update Tailwind Config:** Add the `gradient-rotate` and `gradient-pulse` keyframes and animations.
2. **Create Component:** Create `registry/gradient-border/gradient-border.tsx` with the props interface, CSS variable injection, and masking logic.
3. **Create Barrel Export:** Create `registry/gradient-border/index.ts`.
4. **Create Test Page:** Create `app/test-gradient-border/page.tsx`.
   - Section 1: Default Rotating Border (Rainbow colors).
   - Section 2: Pulsing Border (Slow speed, high blur).
   - Section 3: Static Border (Fixed linear gradient).
   - Section 4: Spotlight Border (Mouse tracking).
   - Section 5: Custom Colors & Width (e.g., Dead UI red accent, 4px width).
5. **Verify Build:** `npm run build`.
6. **Verify Visually:** Check all 5 sections. Ensure the rotating border is perfectly smooth and doesn't cause scroll jank.
7. **Update Progress Tracker:** Mark Feature 14 as complete.

## Verification Checklist

- [ ] Component renders without errors.
- [ ] Rotating border spins smoothly at 60fps.
- [ ] Pulsing border fades in and out smoothly.
- [ ] Spotlight border tracks the mouse accurately.
- [ ] `blur` prop creates a soft outer glow without clipping.
- [ ] `width` prop correctly adjusts border thickness.
- [ ] Custom `colors` array applies correctly.
- [ ] `npm run build` passes with zero TypeScript errors.
- [ ] `progress-tracker.md` is updated.

## Constraints

- Do NOT use GSAP or Framer Motion for the continuous rotation/pulsing; CSS animations are significantly more performant.
- Ensure the inner content mask perfectly aligns with the outer border (no sub-pixel rendering gaps).
- The spotlight variant MUST use CSS variables for mouse tracking, not React state.

## Files to Create

1. `registry/gradient-border/gradient-border.tsx`
2. `registry/gradient-border/index.ts`
3. `app/test-gradient-border/page.tsx`

## Files to Update

1. `tailwind.config.ts` (add keyframes)
2. `context/progress-tracker.md`