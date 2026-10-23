# Feature 50: Paint Reveal Component

## Overview
Add a free `PaintReveal` component that acts as a container to hide content behind a solid overlay color. As the user moves their mouse (or touches the screen), a configurable "brush" erases the overlay, revealing the content underneath with a smooth, interactive paint effect.

## Goals
1. Create `registry/paint-reveal/paint-reveal.tsx` using an HTML5 `<canvas>` and `globalCompositeOperation = 'destination-out'`.
2. Expose fully configurable props: `brushSize` (diameter), `overlayColor`, and standard container props.
3. Update `registry.json` with the new component.
4. Create a test page `app/test-paint-reveal/page.tsx` demonstrating different colors, brush sizes, and content types.
5. Create the MDX documentation page `app/docs/components/paint-reveal/page.mdx`.
6. Execute the 4-step Release Workflow for `v0.1.27` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/paint-reveal/paint-reveal.tsx`)
```tsx
"use client"
import React, { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export interface PaintRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  brushSize?: number
  overlayColor?: string
}

export function PaintReveal({
  children,
  brushSize = 40,
  overlayColor = "#000000",
  className,
  ...props
}: PaintRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isReady, setIsReady] = useState(false)

  // Initialize and resize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeAndFill = () => {
      const { width, height } = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      
      ctx.scale(dpr, dpr)
      ctx.globalCompositeOperation = "source-over"
      ctx.fillStyle = overlayColor
      ctx.fillRect(0, 0, width, height)
      
      setIsReady(true)
    }

    resizeAndFill()
    window.addEventListener("resize", resizeAndFill)

    return () => window.removeEventListener("resize", resizeAndFill)
  }, [overlayColor])

  // Handle painting interaction
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || !isReady) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect()
      let clientX: number, clientY: number
      
      if ("touches" in e) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        clientX = (e as MouseEvent).clientX
        clientY = (e as MouseEvent).clientY
      }

      const x = clientX - rect.left
      const y = clientY - rect.top

      ctx.globalCompositeOperation = "destination-out"
      ctx.beginPath()
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
      ctx.fill()
    }

    container.addEventListener("mousemove", handleMove)
    container.addEventListener("touchmove", handleMove, { passive: true })

    return () => {
      container.removeEventListener("mousemove", handleMove)
      container.removeEventListener("touchmove", handleMove)
    }
  }, [isReady, brushSize])

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <div className="relative z-0">{children}</div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 cursor-crosshair touch-none"
      />
    </div>
  )
} ```

### 2. Registry Update (registry.json)
Add entry:

{
  "name": "paint-reveal",
  "title": "Paint Reveal",
  "description": "An interactive container that reveals its content as the user moves their mouse, erasing a solid overlay color.",
  "tier": "free",
  "dependencies": [],
  "files": [
    {
      "path": "registry/paint-reveal/paint-reveal.tsx",
      "target": "components/ui/paint-reveal.tsx"
    }
  ]
}


### 3. Test Page & Documentation
app/test-paint-reveal/page.tsx: Showcase the component with a large text heading, an image, and a card grid. Demonstrate different brushSize and overlayColor (e.g., bg-black, bg-blue-600).
app/docs/components/paint-reveal/page.mdx: Document the props and explain the canvas destination-out mechanism.


### 4. Release Workflow
Bump packages/cli/package.json to 0.1.27.
Commit, tag v0.1.27, push.
Provide manual npm publish commands at the end.