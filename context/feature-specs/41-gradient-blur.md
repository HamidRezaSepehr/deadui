# Feature 41: Gradient Blur Component

## Overview

Add a new free component, `GradientBlur`, which creates a smooth, multi-layered backdrop blur effect with gradient masking. This is perfect for elegantly fading out content at the top or bottom of a page, or inside specific scrollable containers, without harsh cutoff lines.

## Goals

1. Create `registry/gradient-blur/gradient-blur.tsx` based on the provided reference, but enhanced with configurable positioning (`fixed`, `absolute`, `sticky`), side (`top`, `bottom`), `variant`, and `height`.
2. Update `registry.json` to include the new component.
3. Create a comprehensive test page `app/test-gradient-blur/page.tsx` showcasing page-level fixed blurs and container-level absolute blurs.
4. Create the MDX documentation page `app/docs/components/gradient-blur/page.mdx`.
5. Execute the 4-step Release Workflow for `v0.1.17` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/gradient-blur/gradient-blur.tsx`)
```tsx
import React from "react"
import { cn } from "@/lib/utils"

const BLUR_VALUES_BOTTOM = [0.234375, 0.46875, 0.9375, 1.875, 3.75, 7.5, 15, 30]
const BLUR_VALUES_CENTER = [0.234375, 0.46875, 3.75, 30, 30, 3.75, 0.46875, 0.234375]
const STOPS = [0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100, 112.5, 125]
const STOPS_REVERSE = [-12.5, 0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100, 112.5]

export type GradientBlurVariant = "bottom-to-top" | "center-peak"
export type GradientBlurPosition = "fixed" | "absolute" | "sticky"
export type GradientBlurSide = "top" | "bottom"

export interface GradientBlurProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GradientBlurVariant
  position?: GradientBlurPosition
  side?: GradientBlurSide
  height?: string // e.g., "100px", "8rem"
  zIndex?: string // e.g., "z-50"
}

function getBlurValues(variant: GradientBlurVariant, reverse: boolean) {
  const values = variant === "center-peak" ? BLUR_VALUES_CENTER : BLUR_VALUES_BOTTOM
  return reverse ? [...values].reverse() : values
}

function getMask(i: number, reverse: boolean) {
  const stops = reverse ? STOPS_REVERSE : STOPS
  return `linear-gradient(rgba(0,0,0,0) ${stops[i]}%, rgb(0,0,0) ${stops[i + 1]}%, rgb(0,0,0) ${stops[i + 2]}%, rgba(0,0,0,0) ${stops[i + 3]}%)`
}

function GradientBlurLayers({ variant, reverse }: { variant: GradientBlurVariant; reverse: boolean }) {
  const blurValues = getBlurValues(variant, reverse)
  const layerStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  }

  return (
    <div className="absolute inset-0 bg-transparent">
      {blurValues.map((blur, i) => (
        <div
          key={i}
          style={{
            ...layerStyle,
            zIndex: i + 1,
            backdropFilter: `blur(${blur}px)`,
            WebkitBackdropFilter: `blur(${blur}px)`,
            maskImage: getMask(i, reverse),
            WebkitMaskImage: getMask(i, reverse),
          }}
        />
      ))}
    </div>
  )
}

export function GradientBlur({
  variant = "bottom-to-top",
  position = "fixed",
  side = "bottom",
  height = "100px",
  zIndex = "z-50",
  className,
  ...props
}: GradientBlurProps) {
  const reverse = side === "top"
  
  const positionClasses = {
    fixed: side === "top" ? "fixed top-0 left-0" : "fixed bottom-0 left-0",
    absolute: side === "top" ? "absolute top-0 left-0" : "absolute bottom-0 left-0",
    sticky: side === "top" ? "sticky top-0 left-0" : "sticky bottom-0 left-0",
  }

  return (
    <div
      className={cn(
        "w-full overflow-hidden pointer-events-none",
        positionClasses[position],
        zIndex,
        className
      )}
      style={{ height }}
      {...props}
    >
      <GradientBlurLayers variant={variant} reverse={reverse} />
    </div>
  )
}
```

### 2. Registry Update (`registry.json`)
```json
{
  "name": "gradient-blur",
  "title": "Gradient Blur",
  "description": "A smooth, multi-layered backdrop blur effect with gradient masking for elegant content fade-outs.",
  "tier": "free",
  "dependencies": [],
  "files": [
    {
      "path": "registry/gradient-blur/gradient-blur.tsx",
      "target": "components/ui/gradient-blur.tsx"
    }
  ]
}
```

### 3. Test Page (`app/test-gradient-blur/page.tsx`)
Create a page demonstrating:
1. **Fixed Bottom**: The default behavior, pinned to the bottom of the viewport over a long scrolling page.
2. **Fixed Top**: Pinned to the top of the viewport.
3. **Absolute (Container Level)**: A scrollable `div` with `relative` positioning and `overflow-y-auto`, with the blur set to `position="absolute"` and `side="bottom"` to fade out the bottom of *that specific container*.
4. **Center Peak Variant**: Demonstrating the `variant="center-peak"` effect.

### 4. Documentation (`app/docs/components/gradient-blur/page.mdx`)
- Explain the use cases (page-level fade vs. container-level fade).
- Detail the props: `variant`, `position`, `side`, `height`, and `zIndex`.
- Provide clear code snippets, emphasizing that `position="absolute"` requires a `relative` parent.

### 5. The 4-Step Release Workflow & Manual Publish
Execute the git workflow for `v0.1.17`, and **CRITICALLY**, provide the manual npm publish commands at the end of your response.

## Implementation Steps

1. Create `registry/gradient-blur/gradient-blur.tsx`.
2. Update `registry.json`.
3. Create `app/test-gradient-blur/page.tsx`.
4. Create `app/docs/components/gradient-blur/page.mdx`.
5. Bump `packages/cli/package.json` version to `0.1.17`.
6. Execute git commands: `add`, `commit`, `push`, `tag v0.1.17`, `push tag`.
7. Output GitHub Release UI instructions.
8. **Output the exact manual terminal commands to publish to npm.**
9. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] `GradientBlur` renders correctly with smooth, multi-layered backdrop blur.
- [ ] `position="absolute"` works correctly inside a `relative` scrollable container.
- [ ] `position="fixed"` and `position="sticky"` work correctly at the viewport level.
- [ ] `side="top"` correctly reverses the mask and blur values.
- [ ] Test page displays all variations clearly with scrollable areas.
- [ ] Git tag `v0.1.17` is pushed.
- [ ] Manual npm publish instructions are clearly provided at the end.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `registry/gradient-blur/gradient-blur.tsx` (New)
2. `registry.json` (Update)
3. `app/test-gradient-blur/page.tsx` (New)
4. `app/docs/components/gradient-blur/page.mdx` (New)
5. `packages/cli/package.json` (Update version to 0.1.17)
6. `context/progress-tracker.md` (Update)