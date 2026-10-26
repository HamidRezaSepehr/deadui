"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export interface NeedleFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Distance between needles in pixels */
  spacing?: number
  /** Length of needle relative to spacing (0.3 - 1.0) */
  lengthRatio?: number
  /** Radius of influence around cursor/finger */
  radius?: number
  /** Whether to animate an invisible attractor when idle */
  autoAnimate?: boolean
  /** Color of distant needles */
  colorBase?: string
  /** Color of nearby needles */
  colorHighlight?: string
}

const lerpAngle = (a: number, b: number, k: number) => {
  let d = b - a
  // Normalize delta to [-PI, PI] to ensure shortest rotation path
  d = ((d + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI
  return a + d * k
}

export function NeedleField({
  className,
  spacing = 28,
  lengthRatio = 0.7,
  radius = 220,
  autoAnimate = true,
  colorBase = "#2f6f6a",
  colorHighlight = "#ff8a3d",
  ...props
}: NeedleFieldProps) {
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
    let needles: { x: number; y: number; angle: number }[] = []
    let mouseX = -1e4
    let mouseY = -1e4
    let isActive = false
    let lastInteractionTime = 0
    let isVisible = false
    let rafId = 0
    const startTime = performance.now()

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // Resize Handler
    const handleResize = () => {
      const rect = container.getBoundingClientRect()
      width = rect.width
      height = rect.height
      if (!width || !height) return

      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)

      // Generate Grid
      const cols = Math.ceil(width / spacing) + 1
      const rows = Math.ceil(height / spacing) + 1
      const offsetX = (width - (cols - 1) * spacing) / 2
      const offsetY = (height - (rows - 1) * spacing) / 2

      needles = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          needles.push({
            x: offsetX + c * spacing,
            y: offsetY + r * spacing,
            angle: Math.random() * Math.PI * 2,
          })
        }
      }
      
      // Initial draw if not animating yet
      draw(performance.now())
    }

    // Draw Loop
    const draw = (time: number) => {
      if (!isVisible) return
      
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      let px = mouseX
      let py = mouseY

      // Auto-animate logic: If not active, move an invisible attractor
      if (!isActive && autoAnimate && !prefersReducedMotion) {
        const t = time - startTime
        px = width * (0.5 + 0.38 * Math.sin(t * 0.00031 + 1))
        py = height * (0.5 + 0.36 * Math.sin(t * 0.00047))
      } else if (!isActive) {
        // Center if stopped and no auto-animate
        px = width * 0.5
        py = height * 0.5
      }

      const halfLength = (spacing * lengthRatio) / 2
      // Smoothness factor: instant if reduced motion, otherwise gradual
      const lerpFactor = prefersReducedMotion ? 1 : 0.2

      // Bucketing for performance: Group by proximity to minimize state changes
      // Buckets: [Far, Mid-Far, Mid-Near, Near]
      const buckets: typeof needles[] = [[], [], [], []]

      for (const n of needles) {
        const dx = px - n.x
        const dy = py - n.y
        const dist = Math.hypot(dx, dy)
        
        // Target angle pointing to attractor
        const targetAngle = Math.atan2(dy, dx)
        n.angle = lerpAngle(n.angle, targetAngle, lerpFactor)

        // Influence factor: 0 at edge of radius, 1 at center
        const influence = Math.max(0, 1 - dist / radius)
        
        // Assign to bucket
        if (influence > 0.66) buckets[3].push(n)
        else if (influence > 0.33) buckets[2].push(n)
        else if (influence > 0.08) buckets[1].push(n)
        else buckets[0].push(n)
      }

      // Styles per bucket: [Color, Alpha, LineWidth]
      const styles: [string, number, number][] = [
        [colorBase, 0.38, 1.4],
        [colorBase, 0.8, 1.7],
        [colorHighlight, 0.8, 2.1],
        [colorHighlight, 1.0, 2.6],
      ]

      ctx.lineCap = "round"

      for (let i = 0; i < 4; i++) {
        if (buckets[i].length === 0) continue
        
        ctx.beginPath()
        for (const n of buckets[i]) {
          const cosA = Math.cos(n.angle) * halfLength
          const sinA = Math.sin(n.angle) * halfLength
          ctx.moveTo(n.x - cosA, n.y - sinA)
          ctx.lineTo(n.x + cosA, n.y + sinA)
        }
        
        ctx.strokeStyle = styles[i][0]
        ctx.globalAlpha = styles[i][1]
        ctx.lineWidth = styles[i][2]
        ctx.stroke()
      }
      
      ctx.globalAlpha = 1
    }

    // Animation Frame Loop
    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop)
      
      // Deactivate if no interaction for 2.6 seconds
      if (isActive && now - lastInteractionTime > 2600) {
        isActive = false
      }
      
      draw(now)
    }

    // Event Handlers
    const updatePointer = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
      isActive = true
      lastInteractionTime = performance.now()
    }

    const handleLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        isActive = false
      }
    }

    // Listeners
    container.addEventListener("pointermove", updatePointer, { passive: true })
    container.addEventListener("pointerdown", updatePointer, { passive: true })
    container.addEventListener("pointerleave", handleLeave)

    // Observers
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
      if (isVisible && !rafId) {
        rafId = requestAnimationFrame(loop)
      }
    })
    intersectionObserver.observe(container)

    // Init
    handleResize()

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      container.removeEventListener("pointermove", updatePointer)
      container.removeEventListener("pointerdown", updatePointer)
      container.removeEventListener("pointerleave", handleLeave)
    }
  }, [spacing, lengthRatio, radius, autoAnimate, colorBase, colorHighlight])

  return (
    <div
      ref={containerRef}
      className={cn("relative isolate w-full h-full overflow-hidden", className)}
      {...props}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 z-[-1] block h-full w-full pointer-events-none"
      />
      {/* Content slot */}
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {props.children}
      </div>
    </div>
  )
}
