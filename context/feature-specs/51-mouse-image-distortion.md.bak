# Feature 51: Mouse Image Distortion Component

## Overview
Add a free `MouseImageDistortion` component that renders a list of text rows. On hover, an image follows the cursor, and its shape dynamically warps (skews and scales) based on the cursor's movement velocity, creating a smooth, liquid-like distortion effect.

## Goals
1. Create `registry/mouse-image-distortion/mouse-image-distortion.tsx` using Framer Motion's `useMotionValue`, `useVelocity`, and `useSpring` to drive the distortion.
2. Expose full configurability: `velocityMultiplier`, `imageWidth`, `imageHeight`, `imageBorderRadius`, `textColor`, `textSize`, `rowPadding`, `rowBorderColor`, and `rowHoverBgColor`.
3. Update `registry.json` with the new component and `motion` dependency.
4. Create a test page `app/test-mouse-image-distortion/page.tsx` demonstrating the effect with a list of items.
5. Create the MDX documentation page `app/docs/components/mouse-image-distortion/page.mdx`.
6. Execute the 4-step Release Workflow for `v0.1.28` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/mouse-image-distortion/mouse-image-distortion.tsx`)
```tsx
"use client"
import React, { useState, useRef } from "react"
import { motion, useMotionValue, useSpring, useVelocity, useTransform } from "motion/react"
import { cn } from "@/lib/utils"

export interface DistortionItem {
  id: string
  title: string
  subtitle?: string
  imageUrl: string
}

export interface MouseImageDistortionProps {
  items: DistortionItem[]
  velocityMultiplier?: number
  imageWidth?: number
  imageHeight?: number
  imageBorderRadius?: string
  textColor?: string
  textSize?: string
  rowPadding?: string
  rowBorderColor?: string
  rowHoverBgColor?: string
  className?: string
}

export function MouseImageDistortion({
  items,
  velocityMultiplier = 0.05,
  imageWidth = 300,
  imageHeight = 200,
  imageBorderRadius = "12px",
  textColor = "text-foreground",
  textSize = "text-4xl",
  rowPadding = "py-6",
  rowBorderColor = "border-border",
  rowHoverBgColor = "bg-muted/50",
  className,
}: MouseImageDistortionProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth cursor following
  const springConfig = { damping: 25, stiffness: 150 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  // Velocity calculation for distortion
  const velocityX = useVelocity(smoothX)
  const velocityY = useVelocity(smoothY)

  // Transform velocity into skew and scale values
  const skewX = useTransform(velocityX, [-1000, 1000], [-15, 15])
  const skewY = useTransform(velocityY, [-1000, 1000], [-15, 15])
  const scale = useTransform(
    [velocityX, velocityY],
    ([vx, vy]) => 1 + Math.min(Math.abs(vx) + Math.abs(vy), 500) * (velocityMultiplier / 100)
  )

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX)
    mouseY.set(e.clientY)
  }

  const currentItem = items.find((item) => item.id === hoveredId)

  return (
    <div className={cn("relative w-full", className)} onMouseMove={handleMouseMove}>
      {/* Floating Image Layer */}
      {currentItem && (
        <motion.div
          className="pointer-events-none fixed z-50 overflow-hidden"
          style={{
            x: smoothX,
            y: smoothY,
            translateX: "-50%",
            translateY: "-50%",
            width: imageWidth,
            height: imageHeight,
            skewX,
            skewY,
            scale,
          }}
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${currentItem.imageUrl})`,
              borderRadius: imageBorderRadius,
            }}
          />
        </motion.div>
      )}

      {/* Text List Layer */}
      <div className="relative z-10 flex flex-col">
        {items.map((item) => (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={cn(
              "group relative flex flex-col cursor-pointer border-b transition-colors duration-300",
              rowPadding,
              rowBorderColor,
              hoveredId === item.id ? rowHoverBgColor : "bg-transparent"
            )}
          >
            <h3 className={cn("font-bold transition-colors duration-300", textSize, textColor)}>
              {item.title}
            </h3>
            {item.subtitle && (
              <p className={cn("text-sm transition-colors duration-300", textColor, "opacity-60")}>
                {item.subtitle}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}```

### 2. Registry Update (registry.json)
Add entry:

{
  "name": "mouse-image-distortion",
  "title": "Mouse Image Distortion",
  "description": "A list component where hovering reveals an image that follows the cursor and warps based on movement velocity.",
  "tier": "free",
  "dependencies": ["motion"],
  "files": [
    {
      "path": "registry/mouse-image-distortion/mouse-image-distortion.tsx",
      "target": "components/ui/mouse-image-distortion.tsx"
    }
  ]
}


### 3. Test Page & Documentation
app/test-mouse-image-distortion/page.tsx: Showcase a list of 5-6 items (e.g., portfolio projects or articles) with high-quality images, demonstrating the velocity warp.
app/docs/components/mouse-image-distortion/page.mdx: Document all configuration props and explain how velocityMultiplier controls the distortion intensity.


### 4. Release Workflow
Bump packages/cli/package.json to 0.1.28.
Commit, tag v0.1.28, push.
Provide manual npm publish commands at the end.