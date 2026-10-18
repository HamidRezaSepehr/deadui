# Feature 32: Orbiting Circles Component

## Overview

Add a new free component, `OrbitingCircles`, which renders concentric rings with icons, images, or SVGs orbiting around a center point. The critical feature of this component is that orbiting items **must remain upright** (their top always points to the top of the viewport) and never spin around their own center as they move along the path.

## Goals

1. Create `registry/orbiting-circles/orbiting-circles.tsx` with a flexible, nested component structure (`OrbitingCircles` > `Orbit` > Items).
2. Implement the "counter-rotation" CSS technique to ensure items stay fixed upright while orbiting.
3. Allow full customization of ring radius, animation duration (speed), direction (clockwise/counter-clockwise), and visibility of the ring path (border).
4. Support any React node as an orbiting item (Icons, Images, SVGs, custom divs).
5. Create a comprehensive test page `app/test-orbiting-circles/page.tsx` showcasing different configurations.
6. Create the MDX documentation page `app/docs/components/orbiting-circles/page.mdx`.
7. Execute the 4-step Release Workflow for `v0.1.9` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Architecture
Use a nested structure for maximum flexibility:
- `<OrbitingCircles>`: The relative container.
- `<Orbit>`: Represents a single ring. Handles the rotation animation and the ring's visual border.
- **Items**: Children of `<Orbit>`. They are positioned absolutely and translated outward.

### 2. The "Upright Icon" Logic (Counter-Rotation)
This is the most critical part.
- The `<Orbit>` ring rotates 360deg over `duration`.
- Each item is placed at a specific angle using `transform: rotate(var(--angle)) translateX(var(--radius))`.
- The *content* inside the item must rotate **-360deg** over the same `duration` to cancel out the ring's rotation.
- If the ring is `reverse` (counter-clockwise), the content must rotate **360deg** (clockwise).

### 3. Component Implementation (`registry/orbiting-circles/orbiting-circles.tsx`)

```tsx
'use client'

import React from 'react'
import { cn } from '@/lib/utils'

// --- Orbit Component ---
export interface OrbitProps extends React.HTMLAttributes<HTMLDivElement> {
  radius: number
  duration?: number // in seconds
  reverse?: boolean
  path?: boolean // Show the circle border
  children: React.ReactNode
}

export function Orbit({
  radius,
  duration = 20,
  reverse = false,
  path = true,
  children,
  className,
  ...props
}: OrbitProps) {
  const direction = reverse ? 'reverse' : 'normal'
  const counterDirection = reverse ? 'normal' : 'reverse'

  return (
    <div
      className={cn('absolute top-1/2 left-1/2 rounded-full border border-dead-border/20', path && 'border-solid', !path && 'border-transparent')}
      style={{
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        transform: 'translate(-50%, -50%)',
        animation: `orbit-spin ${duration}s linear infinite ${direction}`,
      }}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child
        // Clone child to inject the counter-rotation style
        return React.cloneElement(child as React.ReactElement<any>, {
          style: {
            ...child.props.style,
            animation: `orbit-counter-spin ${duration}s linear infinite ${counterDirection}`,
          }
        })
      })}
    </div>
  )
}

// --- Main Component ---
export interface OrbitingCirclesProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function OrbitingCircles({ children, className, ...props }: OrbitingCirclesProps) {
  return (
    <div className={cn('relative w-full h-full min-h-[400px] flex items-center justify-center overflow-hidden', className)} {...props}>
      {children}
      {/* Inline styles for the keyframes to avoid needing tailwind config updates for this specific component */}
      <style jsx>{`
        @keyframes orbit-spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes orbit-counter-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
      `}</style>
    </div>
  )
}
```

### 4. Item Positioning
The user will wrap their icons in a simple `div` to position them on the ring. The documentation must show this pattern:
```tsx
<Orbit radius={100} duration={20}>
  {/* Position at 0 degrees (Right) */}
  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(0deg) translateX(100px)' }}>
    <Icon1 />
  </div>
  {/* Position at 120 degrees */}
  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(120deg) translateX(100px)' }}>
    <Icon2 />
  </div>
</Orbit>
```
*Note: The `Orbit` component above handles the ring rotation. The items inside need to be fixed to the ring. The cleanest way is to let the user position them absolutely within the `Orbit` div, and the `Orbit` component handles the counter-rotation of the children.*

**Revised Simpler API for Items:**
To make it easier for users, let's create an `OrbitItem` component or just instruct them to use a specific class.
Actually, the easiest way is:
The `Orbit` ring rotates.
The children are absolutely positioned at `top: 50%, left: 50%`.
The user provides a `--angle` CSS variable on the child.
The child's style is: `transform: translate(-50%, -50%) rotate(var(--angle)) translateX(var(--radius))`.
Wait, the `Orbit` already has the radius.
Let's refine:
The `Orbit` component renders the ring.
The children are placed at the center.
The `Orbit` component maps over children and applies:
`transform: rotate(var(--angle)) translateX(${radius}px)`
And then wraps the child in a counter-rotating div.

**Final API Design:**
```tsx
<OrbitingCircles>
  <Orbit radius={100} duration={20} path>
     <OrbitItem angle={0}><Icon1 /></OrbitItem>
     <OrbitItem angle={120}><Icon2 /></OrbitItem>
     <OrbitItem angle={240}><Icon3 /></OrbitItem>
  </Orbit>
</OrbitingCircles>
```
This is the most developer-friendly. `OrbitItem` handles the math.

### 5. Test Page (`app/test-orbiting-circles/page.tsx`)
Create a page demonstrating:
1. **Basic Orbit**: 3 icons on a single ring.
2. **Multi-Ring**: 2 concentric rings with different speeds and directions.
3. **Images**: Using `<img>` tags instead of icons.
4. **No Path**: Rings with `path={false}` (invisible tracks).

### 6. Documentation (`app/docs/components/orbiting-circles/page.mdx`)
- Explain the `Orbit` and `OrbitItem` components.
- Highlight the "upright icon" feature.
- Provide code snippets for basic and multi-ring setups.

### 7. The 4-Step Release Workflow & Manual Publish
Execute the git workflow for `v0.1.9`, and **CRITICALLY**, provide the manual npm publish commands at the end of your response.

## Implementation Steps

1. Create `registry/orbiting-circles/orbiting-circles.tsx` with `OrbitingCircles`, `Orbit`, and `OrbitItem` components.
2. Update `registry.json` to include the new component.
3. Create `app/test-orbiting-circles/page.tsx`.
4. Create `app/docs/components/orbiting-circles/page.mdx`.
5. Bump `packages/cli/package.json` version to `0.1.9`.
6. Execute git commands: `add`, `commit`, `push`, `tag v0.1.9`, `push tag`.
7. Output GitHub Release UI instructions.
8. **Output the exact manual terminal commands to publish to npm.**
9. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] Icons remain perfectly upright (top points up) while orbiting.
- [ ] Multiple rings can coexist with different speeds/directions.
- [ ] `path={false}` correctly hides the ring border.
- [ ] Test page displays all variations.
- [ ] Documentation is clear on how to use `OrbitItem`.
- [ ] Git tag `v0.1.9` is pushed.
- [ ] Manual npm publish instructions are clearly provided at the end.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `registry/orbiting-circles/orbiting-circles.tsx` (New)
2. `registry.json` (Update)
3. `app/test-orbiting-circles/page.tsx` (New)
4. `app/docs/components/orbiting-circles/page.mdx` (New)
5. `packages/cli/package.json` (Update version to 0.1.9)
6. `context/progress-tracker.md` (Update)