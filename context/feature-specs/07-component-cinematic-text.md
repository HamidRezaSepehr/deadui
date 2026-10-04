# Feature 07: Component #1 — Cinematic Text Reveal

## Overview

Build the first animation component for Dead UI: a high-performance, scroll-triggered text reveal effect using GSAP SplitText and ScrollTrigger. This component splits a string of text into characters, words, or lines and animates them into view with a blur-to-focus and fade-up effect as the user scrolls. It must be fully typed, variant-driven, and SSR-safe.

## Goals

1. Create a reusable React component that accepts text content and animation props.
2. Implement GSAP SplitText logic to split text into granular elements.
3. Use GSAP ScrollTrigger to trigger the animation when the element enters the viewport.
4. Provide 4 distinct visual variants (`blur-in`, `fade-up`, `slide-stagger`, `scale-pop`).
5. Ensure the component respects `prefers-reduced-motion` and cleans up GSAP contexts on unmount.
6. Register the component in `registry.json` so the CLI can install it.

## Scope

### In Scope
- Component source code in `registry/cinematic-text/`
- Barrel export (`index.ts`)
- Registration in `registry.json`
- Basic local testing page to verify animation

### Out of Scope
- MDX documentation page (Session 10)
- Pro-tier features (this is a Free component)
- WebGL effects (reserved for Pro components)

## Technical Specifications

### Directory Structure

```
registry/
└── cinematic-text/
    ├── cinematic-text.tsx      # Main component
    └── index.ts                # Barrel export
```

### Dependencies

This component requires the following peer dependencies (already installed in Session 2):
- `gsap` (includes SplitText and ScrollTrigger plugins)
- `class-variance-authority` (for variants)
- `clsx` and `tailwind-merge` (for class merging)

### Component Code: `registry/cinematic-text/cinematic-text.tsx`

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { GSAP_DEFAULTS, SCROLL_TRIGGER_DEFAULTS } from '@/lib/animations'

// Register GSAP plugins once at module scope
gsap.registerPlugin(ScrollTrigger, SplitText)

export const cinematicTextVariants = cva(
  'inline-block will-change-transform',
  {
    variants: {
      variant: {
        'blur-in': 'opacity-0 blur-[10px]',
        'fade-up': 'opacity-0 translate-y-5',
        'slide-stagger': 'opacity-0 -translate-x-5',
        'scale-pop': 'opacity-0 scale-90',
      },
    },
    defaultVariants: {
      variant: 'blur-in',
    },
  }
)

export interface CinematicTextProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cinematicTextVariants> {
  children: string
  duration?: number
  delay?: number
  stagger?: number
  splitBy?: 'chars' | 'words' | 'lines'
}

export function CinematicText({
  className,
  variant,
  children,
  duration = GSAP_DEFAULTS.duration,
  delay = 0,
  stagger = GSAP_DEFAULTS.stagger,
  splitBy = 'chars',
  ...props
}: CinematicTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !children) return

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      gsap.set(containerRef.current, { opacity: 1, filter: 'none', y: 0, x: 0, scale: 1 })
      return
    }

    const ctx = gsap.context(() => {
      // Create SplitText instance
      const split = new SplitText(containerRef.current, {
        type: splitBy,
        charsClass: 'split-char',
        wordsClass: 'split-word',
        linesClass: 'split-line',
      })

      // Define initial states based on variant
      const initialStates = {
        'blur-in': { opacity: 0, filter: 'blur(10px)' },
        'fade-up': { opacity: 0, y: 20 },
        'slide-stagger': { opacity: 0, x: -20 },
        'scale-pop': { opacity: 0, scale: 0.9 },
      }

      const targetElements = split[splitBy] || split.chars

      gsap.from(targetElements, {
        ...initialStates[variant || 'blur-in'],
        duration,
        delay,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: SCROLL_TRIGGER_DEFAULTS.start,
          end: SCROLL_TRIGGER_DEFAULTS.end,
          toggleActions: SCROLL_TRIGGER_DEFAULTS.toggleActions,
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [children, variant, duration, delay, stagger, splitBy])

  return (
    <div
      ref={containerRef}
      className={cn(cinematicTextVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  )
}
```

### Barrel Export: `registry/cinematic-text/index.ts`

```typescript
export { CinematicText } from './cinematic-text'
export type { CinematicTextProps } from './cinematic-text'
export { cinematicTextVariants } from './cinematic-text'
```

### Registry Entry: `registry.json`

Add this entry to the `components` array in `registry.json`:

```json
{
  "name": "cinematic-text",
  "title": "Cinematic Text Reveal",
  "description": "GSAP SplitText + ScrollTrigger letter-by-letter reveal",
  "tier": "free",
  "dependencies": ["gsap"],
  "files": [
    {
      "path": "registry/cinematic-text/cinematic-text.tsx",
      "target": "components/ui/cinematic-text.tsx"
    }
  ],
  "variants": ["blur-in", "fade-up", "slide-stagger", "scale-pop"]
}
```

## Implementation Steps

1. **Create directory**: `mkdir -p registry/cinematic-text`
2. **Create component file**: Copy the TypeScript code above into `registry/cinematic-text/cinematic-text.tsx`
3. **Create barrel export**: Copy the export code into `registry/cinematic-text/index.ts`
4. **Update registry**: Add the JSON entry to `registry.json`
5. **Create test page**: Create `app/test-cinematic-text/page.tsx` to verify the component works locally.
6. **Verify build**: Run `npm run build` to ensure no TypeScript errors.
7. **Test animation**: Run `npm run dev`, navigate to `/test-cinematic-text`, and scroll to see the animation.
8. **Update progress tracker**: Mark Session 7 as complete in `context/progress-tracker.md`.

## Test Page Code: `app/test-cinematic-text/page.tsx`

```typescript
import { CinematicText } from '@/registry/cinematic-text'

export default function TestPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-dead-black p-8">
      <CinematicText variant="blur-in" className="text-6xl font-bold text-dead-white">
        Dead simple animations for React.
      </CinematicText>
      
      <CinematicText variant="fade-up" className="text-4xl font-semibold text-dead-muted">
        Scroll down to see more effects.
      </CinematicText>

      <div className="h-[50vh]" /> {/* Spacer for scrolling */}

      <CinematicText variant="slide-stagger" splitBy="words" className="text-5xl font-bold text-dead-accent">
        Each word slides in individually.
      </CinematicText>
    </div>
  )
}
```

## Verification Checklist

- [ ] `registry/cinematic-text/cinematic-text.tsx` exists with correct GSAP logic
- [ ] `registry/cinematic-text/index.ts` exports the component and types
- [ ] `registry.json` includes the `cinematic-text` entry with correct file paths
- [ ] `app/test-cinematic-text/page.tsx` exists and imports the component correctly
- [ ] `npm run build` completes with zero TypeScript errors
- [ ] `npm run dev` starts without errors
- [ ] Animation triggers on scroll in the test page
- [ ] All 4 variants work when changed in the test page
- [ ] `prefers-reduced-motion` is respected (animation skips if enabled)
- [ ] No memory leaks (GSAP context reverts on unmount)
- [ ] `progress-tracker.md` has been updated to reflect Session 7 completion

## Constraints

- Do NOT write MDX documentation yet (that's Session 10)
- Do NOT modify the CLI package (that's Session 8)
- Do NOT build other components yet (stay focused on this one)
- Ensure all GSAP plugins are registered inside the component or at module scope
- Ensure `useEffect` cleanup function calls `ctx.revert()` to prevent memory leaks
- If anything is unclear, ask BEFORE implementing — do not guess

## Success Criteria

1. The component renders without errors in both SSR and CSR environments.
2. The animation plays smoothly at 60fps when scrolled into view.
3. All 4 variants produce distinct visual effects.
4. The component is registered in `registry.json` and ready for CLI installation.
5. All verification checks pass.

## Files to Create

1. `registry/cinematic-text/cinematic-text.tsx`
2. `registry/cinematic-text/index.ts`
3. `app/test-cinematic-text/page.tsx`

## Files to Update

1. `registry.json` — Add cinematic-text entry
2. `context/progress-tracker.md` — Mark Session 7 as complete

## Next Steps After Completion

Once this session is verified:
- Session 8: Implement CLI Registry Fetch Logic (make the CLI actually copy files)
- Session 9: Implement Pro License Validation
- Session 10: Write MDX Documentation for Component #1