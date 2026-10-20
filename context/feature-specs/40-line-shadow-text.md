# Feature 40: Line Shadow Text Component

## Overview

Add a new free component, `LineShadowText`, which creates a mesmerizing, animated diagonal line shadow effect behind text. Inspired by Magic UI, this component uses Framer Motion and CSS pseudo-elements to create a highly performant, fully configurable typographic effect.

## Goals

1. Create `registry/line-shadow-text/line-shadow-text.tsx` based on the provided reference, but enhanced with configurable props for shadow offset, width, angle, and animation duration.
2. Update the CLI `init` command to inject the required `line-shadow` keyframe and animation into the user's `tailwind.config.ts`.
3. Update `registry.json` to include the new component and its `motion` dependency.
4. Create a comprehensive test page `app/test-line-shadow-text/page.tsx` showcasing different configurations.
5. Create the MDX documentation page `app/docs/components/line-shadow-text/page.mdx`.
6. Execute the 4-step Release Workflow for `v0.1.16` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/line-shadow-text/line-shadow-text.tsx`)
```tsx
"use client"

import React, { type CSSProperties, type HTMLAttributes } from "react"
import { motion, type DOMMotionComponents, type MotionProps } from "motion/react"
import { cn } from "@/lib/utils"

const motionElements = {
  article: motion.article,
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  li: motion.li,
  p: motion.p,
  section: motion.section,
  span: motion.span,
} as const

type MotionElementType = Extract<keyof DOMMotionComponents, keyof typeof motionElements>

export interface LineShadowTextProps
  extends Omit<HTMLAttributes<HTMLElement>, keyof MotionProps>,
    MotionProps {
  children: string
  shadowColor?: string
  shadowOffset?: string // e.g., "0.04em"
  shadowWidth?: string  // e.g., "0.06em"
  angle?: number        // e.g., 45
  duration?: string     // e.g., "2s"
  as?: MotionElementType
}

export function LineShadowText({
  children,
  shadowColor = "black",
  shadowOffset = "0.04em",
  shadowWidth = "0.06em",
  angle = 45,
  duration = "2s",
  className,
  as: Component = "span",
  ...props
}: LineShadowTextProps) {
  const MotionComponent = motionElements[Component]

  return (
    <MotionComponent
      style={
        {
          "--shadow-color": shadowColor,
          "--shadow-offset": shadowOffset,
          "--shadow-width": shadowWidth,
          "--shadow-angle": `${angle}deg`,
          "--shadow-duration": duration,
        } as CSSProperties
      }
      className={cn(
        "relative z-0 inline-flex",
        // Post-release fix: top/left offsets made the absolute mirror
        // shrink-to-fit to `width - shadowOffset`, re-wrapping the last word
        // onto a phantom line (its shadow painted a line below the text).
        // Fill the parent box and offset via paint-only translate instead:
        `after:absolute after:inset-0 after:content-[attr(data-text)]`,
        `after:[translate:var(--shadow-offset)_var(--shadow-offset)]`,
        `after:bg-[linear-gradient(var(--shadow-angle),transparent_45%,var(--shadow-color)_45%,var(--shadow-color)_55%,transparent_0)]`,
        "after:-z-10 after:bg-clip-text after:text-transparent",
        `after:animate-line-shadow`,
        className
      )}
      data-text={children}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}
```

### 2. Tailwind Config Injection (`packages/cli/src/commands/init.ts`)
Update the `init` command to inject the `line-shadow` animation into the user's `tailwind.config.ts`:
```javascript
keyframes: {
  // ... existing keyframes
  'line-shadow': {
    '0%': { backgroundPosition: '0 0' },
    // Post-release: travel direction is chosen per element (--shadow-travel-x/y,
    // set by the component from `angle`) — a fixed (1,1) travel freezes at 45°.
    '100%': { backgroundPosition: 'var(--shadow-travel-x, var(--shadow-width)) var(--shadow-travel-y, var(--shadow-width))' },
  }
},
animation: {
  // ... existing animations
  'line-shadow': 'line-shadow var(--shadow-duration, 2s) linear infinite',
}
```
*(Note to AI: Ensure the keyframe matches the standard Magic UI line shadow effect, which typically animates the `background-position` to create the moving line effect).*

### 3. Test Page (`app/test-line-shadow-text/page.tsx`)
Create a page demonstrating:
1. **Default**: Standard black shadow on a heading.
2. **Custom Color & Angle**: A vibrant accent color with a `60` degree angle (owner review: the original `90` example was replaced — 90° didn't look good).
3. **Different Elements**: Using the `as="h1"`, `as="p"`, and `as="span"` props.
4. **Custom Sizing**: Adjusted `shadowOffset` and `shadowWidth` for a bolder or subtler effect.

### 4. Documentation (`app/docs/components/line-shadow-text/page.mdx`)
- Explain the required dependency: `npm install motion`.
- Detail all props: `shadowColor`, `shadowOffset`, `shadowWidth`, `angle`, `duration`, and `as`.
- Provide clear code snippets for basic and advanced usage.

### 5. The 4-Step Release Workflow & Manual Publish
Execute the git workflow for `v0.1.16`, and **CRITICALLY**, provide the manual npm publish commands at the end of your response.

## Implementation Steps

1. Create `registry/line-shadow-text/line-shadow-text.tsx`.
2. Update `packages/cli/src/commands/init.ts` to inject the `line-shadow` keyframe.
3. Update `registry.json`.
4. Create `app/test-line-shadow-text/page.tsx`.
5. Create `app/docs/components/line-shadow-text/page.mdx`.
6. Bump `packages/cli/package.json` version to `0.1.16`.
7. Execute git commands: `add`, `commit`, `push`, `tag v0.1.16`, `push tag`.
8. Output GitHub Release UI instructions.
9. **Output the exact manual terminal commands to publish to npm.**
10. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] `LineShadowText` renders correctly with the animated pseudo-element shadow.
- [ ] All configurable props (`shadowColor`, `shadowOffset`, `shadowWidth`, `angle`, `duration`, `as`) work as expected.
- [ ] `init.ts` successfully injects the `line-shadow` keyframe into `tailwind.config.ts`.
- [ ] Test page displays all variations clearly.
- [ ] Git tag `v0.1.16` is pushed.
- [ ] Manual npm publish instructions are clearly provided at the end.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `registry/line-shadow-text/line-shadow-text.tsx` (New)
2. `packages/cli/src/commands/init.ts` (Update)
3. `registry.json` (Update)
4. `app/test-line-shadow-text/page.tsx` (New)
5. `app/docs/components/line-shadow-text/page.mdx` (New)
6. `packages/cli/package.json` (Update version to 0.1.16)
7. `context/progress-tracker.md` (Update)