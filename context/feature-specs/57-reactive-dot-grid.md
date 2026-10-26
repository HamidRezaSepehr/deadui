# Feature 57: Reactive Dot Grid Card Component

## Overview
Add a free `ReactiveDotGrid` component that renders a card with an interactive background of dots arranged in a grid. When the user hovers over the card, dots near the cursor are repelled outward, increase in size, and change color (glow). When the cursor leaves, the dots smoothly return to their original positions using an easing/decay algorithm.

## Goals
1. Create `registry/reactive-dot-grid/reactive-dot-grid.tsx` using pure Canvas API.
2. Expose configuration props: `spacing`, `radius`, `colorActive`, `colorBase`, `borderRadius`.
3. Implement the "energy decay" logic to ensure smooth return animations.
4. Handle cleanup properly (cancel RAF, disconnect Observers).
5. Create a test page `app/test-reactive-dot-grid/page.tsx` showcasing different colors and densities.
6. Create MDX documentation.
7. Execute the 4-step Release Workflow for `v0.1.34` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/reactive-dot-grid/reactive-dot-grid.tsx`)

```tsx
"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export interface ReactiveDotGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Distance between dots in pixels */
  spacing?: number
  /** Radius of influence around the cursor in pixels */
  radius?: number
  /** Color of active/nearby dots (hex or rgb string) */
  colorActive?: string
  /** Color of inactive/faraway dots (hex or rgb string) */
  colorBase?: string
  /** Border radius of the card container */
  borderRadius?: string
}

// Helper to parse hex/rgb to [r, g, b] array
const parseColor = (color: string): [number, number, number] => {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return [77, 141, 255] // Default blue
  
  ctx.fillStyle = color
  const parsed = ctx.fillStyle
  
  if (parsed.startsWith("#")) {
    return [
      parseInt(parsed.slice(1, 3), 16),
      parseInt(parsed.slice(3, 5), 16),
      parseInt(parsed.slice(5, 7), 16),
    ]
  }
  
  const match = parsed.match(/[\d.]+/g)
  return match ? [Number(match[0]), Number(match[1]), Number(match[2])] : [77, 141, 255]
}

export function ReactiveDotGrid({
  className,
  children,
  spacing = 22,
  radius = 110,
  colorActive = "#4d8dff",
  colorBase = "rgba(160,190,240,.22)",
  borderRadius = "18px",
  ...props
}: ReactiveDotGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // State
    let width = 0
    let height = 0
    let dpr = 1
    let mouseX = -999
    let mouseY = -999
    let currentForce = 0 // Current energy level (decays to 0)
    let targetForce = 0 // Target energy level (1 when hovering, 0 when not)
    let rafId = 0
    let isVisible = true
    
    // Parse colors once
    const rgbActive = parseColor(colorActive)
    const rgbBase = parseColor(colorBase.split(',')[0]) // Take first part if rgba
    const baseAlpha = colorBase.includes('rgba') 
      ? parseFloat(colorBase.match(/[\d.]+\)$/)?.[0] || '0.22') 
      : 0.22

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      width = container.clientWidth
      height = container.clientHeight
      
      if (!width || !height) return

      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      
      draw()
    }

    const draw = () => {
      if (!isVisible) return
      
      // Cancel pending frame if we are redrawing manually due to resize
      if (rafId) cancelAnimationFrame(rafId)
      rafId = 0

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      // Smoothly interpolate force towards target
      // This creates the "spring back" effect when mouse leaves
      currentForce += (targetForce - currentForce) * 0.12
      
      // If reduced motion, disable interaction entirely
      const effectiveForce = prefersReducedMotion ? 0 : currentForce

      const cols = Math.ceil(width / spacing) + 1
      const rows = Math.ceil(height / spacing) + 1
      const offsetX = (width - (cols - 1) * spacing) / 2
      const offsetY = (height - (rows - 1) * spacing) / 2

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          let x = offsetX + i * spacing
          let y = offsetY + j * spacing
          let r = 1.2 // Base dot radius
          let t = 0   // Interaction intensity (0 to 1)

          const dx = x - mouseX
          const dy = y - mouseY
          const dist = Math.hypot(dx, dy)

          if (effectiveForce > 0 && dist < radius) {
            // Calculate interaction factor: squared falloff for sharper center
            t = Math.pow(1 - dist / radius, 2) * effectiveForce
            
            // Repulsion: push dots away from mouse
            const pushStrength = (t * 9) / (dist || 1)
            x += dx * pushStrength
            y += dy * pushStrength
            
            // Growth: dots get bigger near mouse
            r = 1.2 + t * 2.6
          }

          // Determine color and alpha
          if (t > 0.02) {
            // Active dot: blend towards active color, increase alpha
            const alpha = 0.25 + t * 0.75
            ctx.fillStyle = `rgba(${rgbActive[0]}, ${rgbActive[1]}, ${rgbActive[2]}, ${alpha.toFixed(2)})`
          } else {
            // Inactive dot: use base color and low alpha
            ctx.fillStyle = `rgba(${rgbBase[0]}, ${rgbBase[1]}, ${rgbBase[2]}, ${baseAlpha})`
          }

          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Continue animation loop only if there is still movement/energy
      if (Math.abs(targetForce - currentForce) > 0.004) {
        rafId = requestAnimationFrame(draw)
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
      targetForce = 1
      requestAnimationLoop()
    }

    const handlePointerEnter = (e: PointerEvent) => {
      handlePointerMove(e)
    }

    const handlePointerLeave = () => {
      targetForce = 0
      requestAnimationLoop()
    }

    const requestAnimationLoop = () => {
      if (!rafId && isVisible) {
        rafId = requestAnimationFrame(draw)
      }
    }

    // Event Listeners
    container.addEventListener("pointermove", handlePointerMove, { passive: true })
    container.addEventListener("pointerenter", handlePointerEnter, { passive: true })
    container.addEventListener("pointerleave", handlePointerLeave)

    // Observers
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
      if (isVisible) requestAnimationLoop()
    })
    intersectionObserver.observe(container)

    // Init
    resize()

    // Cleanup
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      container.removeEventListener("pointermove", handlePointerMove)
      container.removeEventListener("pointerenter", handlePointerEnter)
      container.removeEventListener("pointerleave", handlePointerLeave)
    }
  }, [spacing, radius, colorActive, colorBase, borderRadius])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative isolate overflow-hidden bg-[#0e1626] border border-white/10 text-white p-7",
        className
      )}
      style={{ borderRadius }}
      {...props}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 z-[-1] block h-full w-full pointer-events-none"
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
```

### 2. Registry Update (registry.json)
{
  "name": "reactive-dot-grid",
  "title": "Reactive Dot Grid",
  "description": "A card component with an interactive dot grid background that reacts to cursor proximity with repulsion and glow effects.",
  "tier": "free",
  "dependencies": [],
  "files": [
    {
      "path": "registry/reactive-dot-grid/reactive-dot-grid.tsx",
      "target": "components/ui/reactive-dot-grid.tsx"
    }
  ]
}

### 3. Test Page (app/test-reactive-dot-grid/page.tsx)
Create a page with 3 distinct examples:
Default Blue: Standard settings.
Dense Green: Smaller spacing, green highlights.
Sparse Purple: Larger spacing/radius, purple highlights.

import { ReactiveDotGrid } from "@/components/ui/reactive-dot-grid"

export default function TestReactiveDotGridPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-8">
      <div className="grid gap-8 md:grid-cols-3 w-full max-w-6xl">
        
        {/* Example 1: Default */}
        <ReactiveDotGrid className="h-64">
          <h3 className="text-xl font-bold mb-2">Magnetic Field</h3>
          <p className="text-sm opacity-70">Hover to see dots repel and glow.</p>
        </ReactiveDotGrid>

        {/* Example 2: Dense & Green */}
        <ReactiveDotGrid 
          className="h-64"
          spacing={14}
          radius={80}
          colorActive="#22c55e"
          colorBase="rgba(34, 197, 94, 0.1)"
        >
          <h3 className="text-xl font-bold mb-2">Bio Scan</h3>
          <p className="text-sm opacity-70">Higher density grid with green accents.</p>
        </ReactiveDotGrid>

        {/* Example 3: Sparse & Purple */}
        <ReactiveDotGrid 
          className="h-64"
          spacing={30}
          radius={150}
          colorActive="#a855f7"
          colorBase="rgba(168, 85, 247, 0.15)"
        >
          <h3 className="text-xl font-bold mb-2">Nebula Core</h3>
          <p className="text-sm opacity-70">Wider spread with strong purple glow.</p>
        </ReactiveDotGrid>

      </div>
    </main>
  )
}

### 4. Documentation (app/docs/components/reactive-dot-grid/page.mdx)
Explain the physics: Dots are repelled by the cursor within a certain radius.
Document props: spacing, radius, colorActive, colorBase, borderRadius.
Note performance optimizations: Animation stops when energy decays to zero; pauses when off-screen.
Mention accessibility: Respects prefers-reduced-motion.


### 5. Release Workflow
Bump packages/cli/package.json to 0.1.34.
Commit, tag v0.1.34, push.
Provide manual npm publish commands at the end.
Verification Checklist
Dots form a perfect grid inside the card.
Hovering causes dots to move away from the cursor.
Nearby dots become larger and brighter (change color).
Leaving the card causes dots to smoothly spring back.
No console errors on resize or scroll.
Build passes.