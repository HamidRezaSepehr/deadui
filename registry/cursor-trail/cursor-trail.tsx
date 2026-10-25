"use client"

import { useEffect, useRef, type CSSProperties } from "react"
import { cn } from "@/lib/utils"

const SVG_NS = "http://www.w3.org/2000/svg"

export type CursorTrailLinecap = "butt" | "round" | "square"

export interface CursorTrailConfig {
  color?: string
  length?: number
  strokeWidth?: number | string
  opacity?: number | string
  ease?: number
  linecap?: CursorTrailLinecap
  blendMode?: string
}

export interface CursorTrailProps {
  trails?: CursorTrailConfig[]
  color?: string
  length?: number
  ease?: number
  strokeWidth?: number | string
  linecap?: CursorTrailLinecap
  opacity?: number | string
  blendMode?: string
  zIndex?: number | string
  className?: string
  style?: CSSProperties
  disabled?: boolean
}

interface Point {
  x: number
  y: number
}

interface Segment {
  el: SVGLineElement
  pos: Point
}

interface RuntimeTrail {
  segments: Segment[]
  ease: number
}

const DEFAULT_TRAILS: CursorTrailConfig[] = [
  { color: "cyan", length: 30 },
  { color: "yellow", length: 20 },
  { color: "orange", length: 10 },
]

export function CursorTrail({
  trails,
  color = "white",
  length = 20,
  ease = 0.7,
  strokeWidth = 60,
  linecap = "round",
  opacity = 1,
  blendMode,
  zIndex = 9999,
  className,
  style,
  disabled = false,
}: CursorTrailProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || disabled) return

    const pointer: Point = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }

    const runtimeTrails: RuntimeTrail[] = []
    const configs = trails && trails.length > 0 ? trails : DEFAULT_TRAILS

    for (const config of configs) {
      const trailLength = Math.max(0, Math.floor(config.length ?? length))
      if (trailLength === 0) continue

      const group = document.createElementNS(SVG_NS, "g")
      group.setAttribute("stroke", config.color ?? color)
      group.setAttribute("stroke-width", String(config.strokeWidth ?? strokeWidth))
      group.setAttribute("stroke-linecap", config.linecap ?? linecap)
      group.setAttribute("opacity", String(config.opacity ?? opacity))

      const trailBlendMode = config.blendMode ?? blendMode
      if (trailBlendMode) {
        group.style.setProperty("mix-blend-mode", trailBlendMode)
      }

      const segments: Segment[] = []

      for (let i = 0; i < trailLength; i += 1) {
        const line = document.createElementNS(SVG_NS, "line")
        const pos: Point = {
          x: pointer.x,
          y: pointer.y,
        }

        line.setAttribute("x1", String(pos.x))
        line.setAttribute("y1", String(pos.y))
        line.setAttribute("x2", String(pointer.x))
        line.setAttribute("y2", String(pointer.y))

        group.appendChild(line)
        segments.push({ el: line, pos })
      }

      svg.appendChild(group)
      runtimeTrails.push({
        segments,
        ease: config.ease ?? ease,
      })
    }

    const updatePointer = (event: PointerEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
    }

    window.addEventListener("pointermove", updatePointer, { passive: true })
    window.addEventListener("pointerdown", updatePointer, { passive: true })

    let frame = 0

    const tick = () => {
      for (const trail of runtimeTrails) {
        let leader: Point = pointer

        for (const segment of trail.segments) {
          segment.pos.x += (leader.x - segment.pos.x) * trail.ease
          segment.pos.y += (leader.y - segment.pos.y) * trail.ease

          segment.el.setAttribute("x1", String(segment.pos.x))
          segment.el.setAttribute("y1", String(segment.pos.y))
          segment.el.setAttribute("x2", String(leader.x))
          segment.el.setAttribute("y2", String(leader.y))

          leader = segment.pos
        }
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", updatePointer)
      window.removeEventListener("pointerdown", updatePointer)

      while (svg.firstChild) {
        svg.removeChild(svg.firstChild)
      }
    }
  }, [
    disabled,
    trails,
    color,
    length,
    ease,
    strokeWidth,
    linecap,
    opacity,
    blendMode,
  ])

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      shapeRendering="optimizeSpeed"
      className={cn("pointer-events-none fixed inset-0 h-full w-full", className)}
      style={{ zIndex, ...style }}
    />
  )
}