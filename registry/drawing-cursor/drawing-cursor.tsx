"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export interface DrawingCursorIdleParams {
  radiusX?: number
  radiusY?: number
  radiusZ?: number
  freqA?: number
  freqB?: number
  freqC?: number
}

export interface DrawingCursorProps {
  fit?: "viewport" | "parent"
  color?: string
  colorTail?: string
  pointsNumber?: number
  spring?: number
  friction?: number
  widthFactor?: number
  headSpringFactor?: number
  lineCap?: CanvasLineCap
  idleMotion?: boolean
  idleParams?: DrawingCursorIdleParams
  resumeIdleAfterMs?: number
  respectDevicePixelRatio?: boolean
  zIndex?: number
  className?: string
}

type RGBA = [number, number, number, number]

function parseColor(input: string): RGBA | null {
  const s = input.trim()
  if (s.startsWith("#")) {
    let h = s.slice(1)
    if (h.length === 3 || h.length === 4)
      h = h
        .split("")
        .map((c) => c + c)
        .join("")
    if (h.length !== 6 && h.length !== 8) return null
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1
    return [r, g, b, a]
  }
  const m = s.match(/^rgba?\(([^)]+)\)$/i)
  if (m) {
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number)
    if (p.length < 3 || p.some(Number.isNaN)) return null
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]
  }
  return null
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function mixColor(a: RGBA, b: RGBA, t: number): string {
  return `rgba(${Math.round(lerp(a[0], b[0], t))}, ${Math.round(
    lerp(a[1], b[1], t),
  )}, ${Math.round(lerp(a[2], b[2], t))}, ${lerp(a[3], b[3], t).toFixed(3)})`
}

export function DrawingCursor({
  fit = "viewport",
  color = "#ffffff",
  colorTail,
  pointsNumber = 40,
  spring = 0.4,
  friction = 0.5,
  widthFactor = 0.3,
  headSpringFactor = 0.4,
  lineCap = "round",
  idleMotion = true,
  idleParams,
  resumeIdleAfterMs,
  respectDevicePixelRatio = true,
  zIndex = 9999,
  className,
}: DrawingCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const host =
      fit === "parent" ? (canvas.parentElement ?? window) : window

    const rx = idleParams?.radiusX ?? 0.3
    const ry = idleParams?.radiusY ?? 0.2
    const rz = idleParams?.radiusZ ?? 0.1
    const fa = idleParams?.freqA ?? 0.002
    const fb = idleParams?.freqB ?? 0.005
    const fc = idleParams?.freqC ?? 0.01

    const headRgb = parseColor(color)
    const tailRgb = colorTail ? parseColor(colorTail) : null
    const useGradient = Boolean(headRgb && tailRgb)

    const pointer = { x: 0, y: 0 }
    const size = { w: 1, h: 1 }
    const rect = { left: 0, top: 0 }
    const trail = Array.from({ length: pointsNumber }, () => ({
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
    }))

    let mouseMoved = false
    let lastMove = 0
    let pointerActive = fit === "viewport"
    let raf = 0

    const setup = () => {
      const r = canvas.getBoundingClientRect()
      if (fit === "parent") {
        rect.left = r.left
        rect.top = r.top
        size.w = r.width
        size.h = r.height
      } else {
        rect.left = 0
        rect.top = 0
        size.w = window.innerWidth
        size.h = window.innerHeight
      }
      const dpr = respectDevicePixelRatio ? window.devicePixelRatio || 1 : 1
      canvas.width = Math.max(1, Math.round(size.w * dpr))
      canvas.height = Math.max(1, Math.round(size.h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (!mouseMoved) {
        pointer.x = size.w * 0.5
        pointer.y = size.h * 0.5
        for (const p of trail) {
          p.x = pointer.x
          p.y = pointer.y
          p.dx = 0
          p.dy = 0
        }
      }
    }

    const setPointer = (cx: number, cy: number) => {
      pointer.x = fit === "viewport" ? cx : cx - rect.left
      pointer.y = fit === "viewport" ? cy : cy - rect.top
      mouseMoved = true
      lastMove = performance.now()
    }

    const onMouseMove = (e: MouseEvent) => setPointer(e.clientX, e.clientY)
    const onClick = (e: MouseEvent) => setPointer(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => {
      const t0 = e.touches[0]
      if (t0) setPointer(t0.clientX, t0.clientY)
    }
    const onEnter = () => {
      pointerActive = true
    }
    const onLeave = () => {
      pointerActive = false
    }
    const onScroll = () => {
      if (fit === "parent") {
        const r = canvas.getBoundingClientRect()
        rect.left = r.left
        rect.top = r.top
      }
    }
    const onResize = () => setup()

    setup()

    host.addEventListener("mousemove", onMouseMove as EventListener)
    host.addEventListener("click", onClick as EventListener)
    host.addEventListener("touchmove", onTouchMove as EventListener, {
      passive: true,
    })
    if (fit === "parent") {
      host.addEventListener("mouseenter", onEnter as EventListener)
      host.addEventListener("mouseleave", onLeave as EventListener)
      host.addEventListener("touchstart", onEnter as EventListener, {
        passive: true,
      })
      host.addEventListener("touchend", onLeave as EventListener, {
        passive: true,
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true, capture: true })
    window.addEventListener("resize", onResize)

    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== "undefined" && fit === "parent") {
      ro = new ResizeObserver(() => setup())
      ro.observe(canvas)
    }

    const segColor = (i: number, n: number): string => {
      if (!useGradient) return color
      return mixColor(headRgb!, tailRgb!, i / (n - 1))
    }

    const update = (t: number) => {
      raf = requestAnimationFrame(update)

      const idleNow =
        idleMotion &&
        (!mouseMoved ||
          (resumeIdleAfterMs != null &&
            performance.now() - lastMove > resumeIdleAfterMs))

      if (idleNow) {
        pointer.x = (0.5 + rx * Math.cos(fa * t) * Math.sin(fb * t)) * size.w
        pointer.y =
          (0.5 + ry * Math.cos(fb * t) + rz * Math.cos(fc * t)) * size.h
      }

      // physics
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i]
        const prev = i === 0 ? pointer : trail[i - 1]
        const k = i === 0 ? headSpringFactor * spring : spring
        p.dx += (prev.x - p.x) * k
        p.dy += (prev.y - p.y) * k
        p.dx *= friction
        p.dy *= friction
        p.x += p.dx
        p.y += p.dy
      }

      const visible = fit === "viewport" || pointerActive
      ctx.clearRect(0, 0, size.w, size.h)
      if (!visible) return

      const n = trail.length
      ctx.lineCap = lineCap
      let sx = trail[0].x
      let sy = trail[0].y

      for (let i = 1; i < n - 1; i++) {
        const xc = 0.5 * (trail[i].x + trail[i + 1].x)
        const yc = 0.5 * (trail[i].y + trail[i + 1].y)
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc)
        ctx.lineWidth = widthFactor * (n - i)
        ctx.strokeStyle = segColor(i, n)
        ctx.stroke()
        sx = xc
        sy = yc
      }

      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.lineTo(trail[n - 1].x, trail[n - 1].y)
      ctx.lineWidth = widthFactor
      ctx.strokeStyle = segColor(n - 1, n)
      ctx.stroke()
    }

    raf = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(raf)
      host.removeEventListener("mousemove", onMouseMove as EventListener)
      host.removeEventListener("click", onClick as EventListener)
      host.removeEventListener("touchmove", onTouchMove as EventListener)
      if (fit === "parent") {
        host.removeEventListener("mouseenter", onEnter as EventListener)
        host.removeEventListener("mouseleave", onLeave as EventListener)
        host.removeEventListener("touchstart", onEnter as EventListener)
        host.removeEventListener("touchend", onLeave as EventListener)
      }
      window.removeEventListener("scroll", onScroll, {
        capture: true,
      } as EventListenerOptions)
      window.removeEventListener("resize", onResize)
      ro?.disconnect()
    }
  }, [
    fit,
    color,
    colorTail,
    pointsNumber,
    spring,
    friction,
    widthFactor,
    headSpringFactor,
    lineCap,
    idleMotion,
    idleParams?.radiusX,
    idleParams?.radiusY,
    idleParams?.radiusZ,
    idleParams?.freqA,
    idleParams?.freqB,
    idleParams?.freqC,
    resumeIdleAfterMs,
    respectDevicePixelRatio,
  ])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none",
        fit === "viewport" ? "fixed inset-0" : "absolute inset-0 h-full w-full",
        className,
      )}
      style={{ zIndex }}
    />
  )
}