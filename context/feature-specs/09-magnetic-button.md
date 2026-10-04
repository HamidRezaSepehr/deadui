# Feature 09: Magnetic Elastic Button (Free)

## Overview

Build a highly interactive, physics-based button that magnetically pulls toward the user's cursor when hovering within a certain radius, and snaps back with an elastic spring effect when the cursor leaves. This component introduces mouse-tracking physics to Dead UI, a critical pattern for premium, interactive websites.

## Goals

1. Create a reusable React button component that tracks mouse position relative to its center.
2. Apply magnetic pull using Framer Motion (`motion/react`) transforms.
3. Implement elastic spring physics for the snap-back effect.
4. Provide multiple visual variants using `class-variance-authority` (cva).
5. Ensure the component is fully accessible (keyboard focusable, proper ARIA attributes).

## Technical Specifications

### Directory Structure

```
registry/
└── magnetic-button/
    ├── magnetic-button.tsx   # Main component
    └── index.ts              # Barrel export
```

### Dependencies

- `motion` (already installed in Session 2)
- `class-variance-authority`, `clsx`, `tailwind-merge` (for variants and class merging)

### Component Props Interface

```typescript
import { type VariantProps, cva } from 'class-variance-authority'

export const magneticButtonVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium transition-colors duration-300',
  {
    variants: {
      variant: {
        default: 'bg-dead-white text-dead-black hover:bg-dead-muted',
        outline: 'border border-dead-border text-dead-white hover:bg-dead-surface',
        glow: 'bg-dead-accent text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]',
        ghost: 'text-dead-muted hover:text-dead-white hover:bg-dead-surface',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
      },
      shape: {
        rounded: 'rounded-full',
        soft: 'rounded-lg',
        sharp: 'rounded-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      shape: 'rounded',
    },
  }
)

export interface MagneticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof magneticButtonVariants> {
  children: React.ReactNode
  magneticStrength?: number // Default: 0.4 (0 to 1, how strongly it pulls)
  elasticity?: number       // Default: 0.2 (spring stiffness/damping ratio)
}
```

### Implementation Logic

1. **Refs & State:** Use `useRef` for the button container. Use `motion` from `motion/react` for the animated wrapper.
2. **Mouse Tracking:** 
   - On `onMouseMove`, calculate the distance from the cursor to the center of the button.
   - Apply a transform: `x = distanceX * magneticStrength`, `y = distanceY * magneticStrength`.
3. **Snap Back:** 
   - On `onMouseLeave`, reset `x` and `y` to `0`.
   - Use a spring transition: `{ type: "spring", stiffness: 150, damping: 15, mass: 0.8 }`.
4. **Accessibility:** 
   - Ensure the button remains fully focusable via keyboard.
   - Do not apply magnetic transforms on `:focus-visible` (use CSS or check `e.type` to only apply mouse physics on mouse events, or just let it be, but ensure keyboard users can still click it easily). *Best practice: Only apply magnetic effect on mouse hover, not keyboard focus.*

### Example Component Structure

```typescript
'use client'

import { useRef, type MouseEvent } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { cn } from '@/lib/utils'
import { magneticButtonVariants, type MagneticButtonProps } from './magnetic-button'

export function MagneticButton({
  children,
  className,
  variant,
  size,
  shape,
  magneticStrength = 0.4,
  elasticity = 0.2,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const springConfig = { damping: 15, stiffness: 150, mass: 0.8 }
  const xSpring = useSpring(x, springConfig)
  const ySpring = useSpring(y, springConfig)

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const centerX = left + width / 2
    const centerY = top + height / 2
    
    const distanceX = clientX - centerX
    const distanceY = clientY - centerY
    
    x.set(distanceX * magneticStrength)
    y.set(distanceY * magneticStrength)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: xSpring, y: ySpring }}
      className={cn(magneticButtonVariants({ variant, size, shape }), className)}
      {...props}
    >
      {children}
    </motion.button>
  )
}
```

### Test Page Updates: `app/test-magnetic-button/page.tsx`

Create a new test page to demonstrate the button.
- Show all 4 variants (Default, Outline, Glow, Ghost).
- Show all 3 sizes (sm, md, lg).
- Add a section with a high `magneticStrength` (e.g., 0.8) to show the extreme pull effect.
- Add plenty of surrounding text/content so the user can see how it interacts with the page layout.

## Implementation Steps

1. Create `registry/magnetic-button/` directory.
2. Create `magnetic-button.tsx` with the logic above.
3. Create `index.ts` barrel export.
4. Create `app/test-magnetic-button/page.tsx`.
5. Verify build: `npm run build`.
6. Verify visually: `npm run dev`, navigate to `/test-magnetic-button`, hover over buttons to test the magnetic pull and snap-back.
7. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] Component renders without errors.
- [ ] Button pulls toward the cursor smoothly on hover.
- [ ] Button snaps back to center elastically on mouse leave.
- [ ] All 4 variants (default, outline, glow, ghost) render correctly.
- [ ] All 3 sizes (sm, md, lg) render correctly.
- [ ] Button is fully clickable and keyboard accessible (Tab + Enter/Space).
- [ ] `prefers-reduced-motion` is respected (optional: disable spring animation if reduced motion is preferred, or just leave it as it's a micro-interaction).
- [ ] `npm run build` passes with zero TypeScript errors.
- [ ] `progress-tracker.md` is updated.

## Constraints

- Do NOT use GSAP for this component; use `motion/react` (Framer Motion) as it is better suited for mouse-tracking and spring physics.
- Do NOT apply the magnetic effect to the inner text/children, only to the button container itself.
- Ensure the button does not cause layout shifts (it uses `transform`, which is GPU-accelerated and safe).

## Files to Create

1. `registry/magnetic-button/magnetic-button.tsx`
2. `registry/magnetic-button/index.ts`
3. `app/test-magnetic-button/page.tsx`

## Files to Update

1. `context/progress-tracker.md` — Mark Feature 09 as complete.