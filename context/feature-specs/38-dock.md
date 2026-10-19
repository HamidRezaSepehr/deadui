# Feature 38: Dock Component

## Overview

Add a new free component, `Dock`, which replicates the iconic macOS-style magnifying dock. As the user's mouse moves over the dock, the icons smoothly scale up based on their proximity to the cursor, creating a beautiful, fluid, and interactive navigation experience.

## Goals

1. Create `registry/dock/dock.tsx` containing the `Dock` and `DockIcon` components, utilizing the exact Framer Motion physics (`useMotionValue`, `useSpring`, `useTransform`) provided in the reference.
2. Ensure the component is fully adjustable via props: `iconSize`, `iconMagnification`, `iconDistance`, `disableMagnification`, and `direction`.
3. Update `registry.json` to include the new component and its dependencies (`motion`, `class-variance-authority`).
4. Create a comprehensive test page `app/test-dock/page.tsx` showcasing different configurations.
5. Create the MDX documentation page `app/docs/components/dock/page.mdx`.
6. Execute the 4-step Release Workflow for `v0.1.14` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/dock/dock.tsx`)
Use the exact, optimized code provided. Ensure it imports from `motion/react` and `@/lib/utils`.

```tsx
"use client"

import React, { useRef, type PropsWithChildren } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react"
import type { MotionProps } from "motion/react"
import { cn } from "@/lib/utils"

export interface DockProps extends VariantProps<typeof dockVariants> {
  className?: string
  iconSize?: number
  iconMagnification?: number
  disableMagnification?: boolean
  iconDistance?: number
  direction?: "top" | "middle" | "bottom"
  children: React.ReactNode
}

const DEFAULT_SIZE = 40
const DEFAULT_MAGNIFICATION = 60
const DEFAULT_DISTANCE = 140
const DEFAULT_DISABLEMAGNIFICATION = false

const dockVariants = cva(
  "supports-backdrop-blur:bg-white/10 supports-backdrop-blur:dark:bg-black/10 mx-auto mt-8 flex h-[58px] w-max items-center justify-center gap-2 rounded-2xl border p-2 backdrop-blur-md"
)

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  (
    {
      className,
      children,
      iconSize = DEFAULT_SIZE,
      iconMagnification = DEFAULT_MAGNIFICATION,
      disableMagnification = DEFAULT_DISABLEMAGNIFICATION,
      iconDistance = DEFAULT_DISTANCE,
      direction = "middle",
      ...props
    },
    ref
  ) => {
    const mouseX = useMotionValue(Infinity)

    const renderChildren = () => {
      return React.Children.map(children, (child) => {
        if (
          React.isValidElement<DockIconProps>(child) &&
          child.type === DockIcon
        ) {
          return React.cloneElement(child, {
            ...child.props,
            mouseX: mouseX,
            size: iconSize,
            magnification: iconMagnification,
            disableMagnification: disableMagnification,
            distance: iconDistance,
          } as any)
        }
        return child
      })
    }

    return (
      <motion.div
        ref={ref}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        {...props}
        className={cn(dockVariants({ className }), {
          "items-start": direction === "top",
          "items-center": direction === "middle",
          "items-end": direction === "bottom",
        })}
      >
        {renderChildren()}
      </motion.div>
    )
  }
)
Dock.displayName = "Dock"

export interface DockIconProps extends Omit<
  MotionProps & React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  size?: number
  magnification?: number
  disableMagnification?: boolean
  distance?: number
  mouseX?: MotionValue<number>
  className?: string
  children?: React.ReactNode
  props?: PropsWithChildren
}

const DockIcon = ({
  size = DEFAULT_SIZE,
  magnification = DEFAULT_MAGNIFICATION,
  disableMagnification,
  distance = DEFAULT_DISTANCE,
  mouseX,
  className,
  children,
  ...props
}: DockIconProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const padding = Math.max(6, size * 0.2)
  const defaultMouseX = useMotionValue(Infinity)
  
  const distanceCalc = useTransform(mouseX ?? defaultMouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const targetSize = disableMagnification ? size : magnification
  
  const sizeTransform = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [size, targetSize, size]
  )

  const scaleSize = useSpring(sizeTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })

  return (
    <motion.div
      ref={ref}
      style={{ width: scaleSize, height: scaleSize, padding }}
      className={cn(
        "flex aspect-square cursor-pointer items-center justify-center rounded-full",
        disableMagnification && "hover:bg-muted-foreground/20 transition-colors",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center w-full h-full">
        {children}
      </div>
    </motion.div>
  )
}
DockIcon.displayName = "DockIcon"

export { Dock, DockIcon, dockVariants }
```

### 2. Registry Update (`registry.json`)
Add the new component entry:
```json
{
  "name": "dock",
  "title": "Dock",
  "description": "A macOS-style magnifying dock component with smooth Framer Motion physics.",
  "tier": "free",
  "dependencies": ["motion", "class-variance-authority", "clsx", "tailwind-merge"],
  "files": [
    {
      "path": "registry/dock/dock.tsx",
      "target": "components/ui/dock.tsx"
    }
  ]
}
```

### 3. Test Page (`app/test-dock/page.tsx`)
Create a page demonstrating:
1. **Default Dock**: Standard magnification with Lucide React icons.
2. **Disabled Magnification**: `disableMagnification={true}` to show a static, clean dock with simple hover states.
3. **Extreme Magnification**: High `iconMagnification` and wide `iconDistance` for a dramatic effect.
4. **Different Directions**: `direction="top"`, `"middle"`, and `"bottom"` to show alignment variations.

### 4. Documentation (`app/docs/components/dock/page.mdx`)
- Explain the required dependencies (`npm install motion class-variance-authority`).
- Detail the props: `iconSize`, `iconMagnification`, `iconDistance`, `disableMagnification`, and `direction`.
- Provide a clear, copy-pasteable code snippet using Lucide icons.

### 5. The 4-Step Release Workflow & Manual Publish
Execute the git workflow for `v0.1.14`, and **CRITICALLY**, provide the manual npm publish commands at the end of your response.

## Implementation Steps

1. Create `registry/dock/dock.tsx`.
2. Update `registry.json`.
3. Create `app/test-dock/page.tsx`.
4. Create `app/docs/components/dock/page.mdx`.
5. Bump `packages/cli/package.json` version to `0.1.14`.
6. Execute git commands: `add`, `commit`, `push`, `tag v0.1.14`, `push tag`.
7. Output GitHub Release UI instructions.
8. **Output the exact manual terminal commands to publish to npm.**
9. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] `Dock` and `DockIcon` render correctly with smooth spring physics.
- [ ] Icons scale up accurately based on mouse proximity (`iconDistance`).
- [ ] `disableMagnification` correctly turns off the spring effect and applies a simple hover state.
- [ ] Test page displays all variations clearly.
- [ ] Git tag `v0.1.14` is pushed.
- [ ] Manual npm publish instructions are clearly provided at the end.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `registry/dock/dock.tsx` (New)
2. `registry.json` (Update)
3. `app/test-dock/page.tsx` (New)
4. `app/docs/components/dock/page.mdx` (New)
5. `packages/cli/package.json` (Update version to 0.1.14)
6. `context/progress-tracker.md` (Update)