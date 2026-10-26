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
