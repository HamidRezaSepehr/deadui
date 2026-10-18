# Feature 35: Spinning Text Component

## Overview

Add a new free component, `SpinningText`, which arranges text, icons, or images in a perfect circle and rotates them continuously. This component is highly configurable, allowing developers to customize the radius, rotation speed, direction, and the central content (defaulting to a sleek black circle).

## Goals

1. Create `registry/spinning-text/spinning-text.tsx` using a CSS transform-based approach for maximum flexibility (allowing any React node as a segment or separator).
2. Support configurable `radius`, `duration` (speed), and `direction` (clockwise/counter-clockwise).
3. Provide a `centerContent` prop to customize the middle of the circle (defaulting to a `bg-dead-black` circle).
4. Create a comprehensive test page `app/test-spinning-text/page.tsx` showcasing different variations (text-only, mixed text/icons, custom center content).
5. Create the MDX documentation page `app/docs/components/spinning-text/page.mdx`.
6. Execute the 4-step Release Workflow for `v0.1.12` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/spinning-text/spinning-text.tsx`)
```tsx
'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface SpinningTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode[] // Array of strings, icons, or images
  radius?: number // Radius of the circle in pixels
  duration?: number // Duration of one full rotation in seconds
  direction?: 'clockwise' | 'counter-clockwise'
  centerContent?: React.ReactNode
}

export function SpinningText({
  children,
  radius = 120,
  duration = 10,
  direction = 'clockwise',
  centerContent = <div className="w-16 h-16 rounded-full bg-dead-black" />,
  className,
  ...props
}: SpinningTextProps) {
  const totalItems = React.Children.count(children)
  const angleStep = 360 / totalItems
  const spinDirection = direction === 'counter-clockwise' ? 'reverse' : 'normal'

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      style={{
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
      }}
      {...props}
    >
      {/* Rotating Ring */}
      <div
        className="absolute inset-0"
        style={{
          animation: `spin ${duration}s linear infinite ${spinDirection}`,
        }}
      >
        {React.Children.map(children, (child, index) => {
          if (child === null || child === undefined) return null
          return (
            <div
              key={index}
              className="absolute top-0 left-1/2 -translate-x-1/2 whitespace-nowrap"
              style={{
                // Pivot around the center of the main circle
                transformOrigin: `center ${radius}px`,
                transform: `rotate(${index * angleStep}deg)`,
              }}
            >
              {child}
            </div>
          )
        })}
      </div>

      {/* Static Center Content */}
      <div className="relative z-10 flex items-center justify-center">
        {centerContent}
      </div>
    </div>
  )
}
```
*Note: This uses Tailwind's built-in `@keyframes spin`, so no custom Tailwind config injection is required!*

### 2. Test Page (`app/test-spinning-text/page.tsx`)
Create a page demonstrating:
1. **Basic Text**: Simple words separated by dots (e.g., `['DEAD', '•', 'UI', '•', 'ANIMATIONS', '•']`).
2. **Mixed Media**: Text segments alternating with small icon components (e.g., from `lucide-react`) as separators.
3. **Custom Center**: Replacing the default black circle with a custom image or a branded icon.
4. **Counter-Clockwise & Fast**: A variation with `direction="counter-clockwise"` and `duration={5}`.

### 3. Documentation (`app/docs/components/spinning-text/page.mdx`)
- Explain the `children` array pattern (how to mix text and icons).
- Highlight the `radius`, `duration`, `direction`, and `centerContent` props.
- Provide clear code snippets for basic and advanced (mixed media) usage.

### 4. The 4-Step Release Workflow & Manual Publish
Execute the git workflow for `v0.1.12`, and **CRITICALLY**, provide the manual npm publish commands at the end of your response.

## Implementation Steps

1. Create `registry/spinning-text/spinning-text.tsx`.
2. Update `registry.json` to include the new component.
3. Create `app/test-spinning-text/page.tsx`.
4. Create `app/docs/components/spinning-text/page.mdx`.
5. Bump `packages/cli/package.json` version to `0.1.12`.
6. Execute git commands: `add`, `commit`, `push`, `tag v0.1.12`, `push tag`.
7. Output GitHub Release UI instructions.
8. **Output the exact manual terminal commands to publish to npm.**
9. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] `SpinningText` forms a perfect circle and rotates smoothly.
- [ ] Icons and images can be used seamlessly as separators within the `children` array.
- [ ] The `centerContent` defaults to a black circle but accepts custom React nodes.
- [ ] `direction` and `duration` props correctly alter the animation.
- [ ] Test page displays all variations clearly.
- [ ] Git tag `v0.1.12` is pushed.
- [ ] Manual npm publish instructions are clearly provided at the end.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `registry/spinning-text/spinning-text.tsx` (New)
2. `registry.json` (Update)
3. `app/test-spinning-text/page.tsx` (New)
4. `app/docs/components/spinning-text/page.mdx` (New)
5. `packages/cli/package.json` (Update version to 0.1.12)
6. `context/progress-tracker.md` (Update)