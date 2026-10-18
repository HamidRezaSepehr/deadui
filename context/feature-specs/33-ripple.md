# Feature 33: Ripple Component

## Overview

Add a new free component, `Ripple`, which creates a mesmerizing, expanding, and fading ripple effect behind centered content (such as text, icons, or buttons). This component is highly customizable, allowing developers to control the size, opacity, number of circles, and color of the ripples.

## Goals

1. Create `registry/ripple/ripple.tsx` based on the provided Magic UI reference, but enhanced to accept `children` for centered content and use Dead UI's color variables.
2. Update the CLI `init` command to inject the required `ripple` keyframe and animation into the user's `tailwind.config.ts`.
3. Create a comprehensive test page `app/test-ripple/page.tsx` showcasing different configurations (with text, with icons, different colors/sizes).
4. Create the MDX documentation page `app/docs/components/ripple/page.mdx`.
5. Execute the 4-step Release Workflow for `v0.1.10` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/ripple/ripple.tsx`)
```tsx
'use client'

import React, { type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export interface RippleProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  mainCircleSize?: number
  mainCircleOpacity?: number
  numCircles?: number
  color?: string // Defaults to Dead UI accent, but can be any CSS color
}

export function Ripple({
  children,
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  color = 'var(--dead-accent, #ef4444)',
  className,
  ...props
}: RippleProps) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden',
        className
      )}
      {...props}
    >
      {/* Ripple Effects Layer */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {Array.from({ length: numCircles }, (_, i) => {
          const size = mainCircleSize + i * 70
          const opacity = Math.max(0, mainCircleOpacity - i * 0.03)
          const animationDelay = `${i * 0.06}s`

          return (
            <div
              key={i}
              className="absolute rounded-full border shadow-xl animate-ripple"
              style={
                {
                  width: `${size}px`,
                  height: `${size}px`,
                  opacity,
                  animationDelay,
                  borderWidth: '1px',
                  borderColor: color,
                  // Create a subtle background fill using the same color at ~10% opacity
                  backgroundColor: color.replace(')', ', 0.1)').replace('rgb', 'rgba').replace('var(--dead-accent, #ef4444)', 'rgba(239, 68, 68, 0.1)'), 
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) scale(1)',
                  ['--initial-opacity' as string]: opacity,
                } as CSSProperties
              }
            />
          )
        })}
      </div>

      {/* Centered Content Layer */}
      <div className="relative z-10 flex items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
}
```
*(Note to AI: Simplify the backgroundColor logic to just use a standard Tailwind class like `bg-dead-accent/10` or inline `rgba` if a custom color is passed, to avoid complex string replacement).*

### 2. Tailwind Config Injection (`packages/cli/src/commands/init.ts`)
Update the `init` command to inject the `ripple` animation into the user's `tailwind.config.ts`:
```javascript
keyframes: {
  // ... existing keyframes
  ripple: {
    '0%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 'var(--initial-opacity, 0.24)' },
    '100%': { transform: 'translate(-50%, -50%) scale(2.5)', opacity: '0' },
  }
},
animation: {
  // ... existing animations
  ripple: 'ripple 3s cubic-bezier(0, 0.5, 0.5, 1) infinite',
}
```

### 3. Test Page (`app/test-ripple/page.tsx`)
Create a page demonstrating:
1. **Text in Center**: Large, bold text with a standard ripple.
2. **Icon in Center**: A large icon (e.g., from `lucide-react`) with a custom color (e.g., blue) ripple.
3. **Custom Sizes**: A smaller ripple (`mainCircleSize={100}`) and a larger one (`mainCircleSize={300}`).
4. **Button Integration**: A call-to-action button placed perfectly in the center of the ripple.

### 4. Documentation (`app/docs/components/ripple/page.mdx`)
- Explain the `children` prop for centered content.
- Highlight the customization props (`mainCircleSize`, `mainCircleOpacity`, `numCircles`, `color`).
- Provide clear code snippets.

### 5. The 4-Step Release Workflow & Manual Publish
Execute the git workflow for `v0.1.10`, and **CRITICALLY**, provide the manual npm publish commands at the end of your response.

## Implementation Steps

1. Create `registry/ripple/ripple.tsx`.
2. Update `packages/cli/src/commands/init.ts` to inject the `ripple` keyframe/animation.
3. Update `registry.json` to include the new component.
4. Create `app/test-ripple/page.tsx`.
5. Create `app/docs/components/ripple/page.mdx`.
6. Bump `packages/cli/package.json` version to `0.1.10`.
7. Execute git commands: `add`, `commit`, `push`, `tag v0.1.10`, `push tag`.
8. Output GitHub Release UI instructions.
9. **Output the exact manual terminal commands to publish to npm.**
10. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] `Ripple` component renders correctly with centered `children`.
- [ ] The ripple animation scales outward and fades smoothly without jumping.
- [ ] Custom `color` prop correctly changes the border and subtle background of the ripples.
- [ ] `init.ts` successfully injects the `ripple` keyframe into `tailwind.config.ts`.
- [ ] Test page displays all variations clearly.
- [ ] Git tag `v0.1.10` is pushed.
- [ ] Manual npm publish instructions are clearly provided at the end.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `registry/ripple/ripple.tsx` (New)
2. `packages/cli/src/commands/init.ts` (Update)
3. `registry.json` (Update)
4. `app/test-ripple/page.tsx` (New)
5. `app/docs/components/ripple/page.mdx` (New)
6. `packages/cli/package.json` (Update version to 0.1.10)
7. `context/progress-tracker.md` (Update)