# Feature 35: Spinning Text Component

## Overview

Add a new free component, `SpinningText`, which draws a continuous string of text perfectly along a circular path and rotates it continuously. This component uses native SVG `<textPath>` for flawless curvature, smooth performance, and crisp rendering at any size.

## Goals

1. Restructure `registry/spinning-text/spinning-text.tsx` to accept a single `text` string prop instead of an array of React nodes.
2. Implement SVG `<text>` and `<textPath>` to draw the text along a circular path.
3. Support configurable `duration` (speed), `direction` (clockwise/counter-clockwise), and `centerContent` (defaulting to a sleek black circle).
4. Create a comprehensive test page `app/test-spinning-text/page.tsx` showcasing different text lengths and center content variations.
5. Create the MDX documentation page `app/docs/components/spinning-text/page.mdx`.
6. Execute the 4-step Release Workflow for `v0.1.12` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/spinning-text/spinning-text.tsx`)
```tsx
'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface SpinningTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string // The text to be drawn along the circular path
  duration?: number // Duration of one full rotation in seconds
  direction?: 'clockwise' | 'counter-clockwise'
  centerContent?: React.ReactNode
}

export function SpinningText({
  text,
  duration = 10,
  direction = 'clockwise',
  centerContent = <div className="w-16 h-16 rounded-full bg-dead-black" />,
  className,
  ...props
}: SpinningTextProps) {
  const spinDirection = direction === 'counter-clockwise' ? 'reverse' : 'normal'

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      {...props}
    >
      {/* Rotating SVG Ring */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          animation: `spin ${duration}s linear infinite ${spinDirection}`,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Circular path: center at 50,50 with radius 40 */}
            <path
              id="circlePath"
              d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"
            />
          </defs>
          <text className="fill-current text-foreground text-[9px] font-semibold uppercase tracking-[0.2em]">
            <textPath href="#circlePath" startOffset="0%">
              {text}
            </textPath>
          </text>
        </svg>
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
1. **Basic Text**: A repeating string with separators (e.g., `"DEAD UI • ANIMATIONS • FREE COMPONENTS • "`).
2. **Custom Center**: Replacing the default black circle with a custom image, icon, or logo.
3. **Counter-Clockwise & Fast**: A variation with `direction="counter-clockwise"` and `duration={5}`.
4. **Different Sizes**: Demonstrating how the component scales perfectly when wrapped in different Tailwind size classes (e.g., `w-32 h-32` vs `w-64 h-64`).

### 3. Documentation (`app/docs/components/spinning-text/page.mdx`)
- Explain the `text` prop and recommend repeating the string with separators (like `•` or `★`) to ensure the circle is fully populated.
- Highlight the `duration`, `direction`, and `centerContent` props.
- Provide clear code snippets for basic and advanced usage.

### 4. The 4-Step Release Workflow & Manual Publish
Execute the git workflow for `v0.1.12`, and **CRITICALLY**, provide the manual npm publish commands at the end of your response.

## Implementation Steps

1. Create/Update `registry/spinning-text/spinning-text.tsx` with the SVG `textPath` implementation.
2. Update `registry.json` to include the new component.
3. Create `app/test-spinning-text/page.tsx`.
4. Create `app/docs/components/spinning-text/page.mdx`.
5. Bump `packages/cli/package.json` version to `0.1.12`.
6. Execute git commands: `add`, `commit`, `push`, `tag v0.1.12`, `push tag`.
7. Output GitHub Release UI instructions.
8. **Output the exact manual terminal commands to publish to npm.**
9. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] `SpinningText` draws the text perfectly along the circular path using SVG.
- [ ] The text rotates smoothly in the specified direction and duration.
- [ ] The `centerContent` defaults to a black circle but accepts custom React nodes.
- [ ] Test page displays variations with different text lengths and sizes.
- [ ] Git tag `v0.1.12` is pushed.
- [ ] Manual npm publish instructions are clearly provided at the end.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `registry/spinning-text/spinning-text.tsx` (Update)
2. `registry.json` (Update)
3. `app/test-spinning-text/page.tsx` (New)
4. `app/docs/components/spinning-text/page.mdx` (New)
5. `packages/cli/package.json` (Update version to 0.1.12)
6. `context/progress-tracker.md` (Update)