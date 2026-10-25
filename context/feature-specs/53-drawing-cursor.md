# Feature 53: Drawing Cursor Component

## Overview

Add a free `DrawingCursor` component: a canvas-based, "damn satisfying" trailing cursor. A chain of points follows the cursor using accumulated spring + friction physics, rendered as a smooth quadratic-Bézier polyline that tapers from thick (head) to thin (tail). Includes an idle Lissajous "intro" motion when the pointer hasn't moved.

Ported from `dev.to/uuuulala/coding-an-interactive-and-damn-satisfying-cursor` (Ksenia). Pure Canvas 2D — **no Three.js, no WebGL, no SVG, no external deps.**

## Corrections vs the original CodePen (the AI MUST keep these)

The original has four issues that break it as a reusable component. This spec fixes them; do **not** revert to the original behavior.

1. **Taper was being flattened.** The original calls `ctx.stroke()` inside the loop *without* `beginPath()` per segment, so every prior segment gets re-stroked at the newest (thinner) `lineWidth`, killing the taper. **Fix:** each segment must be its own `beginPath() → moveTo(prev) → quadraticCurveTo(...) → set lineWidth → stroke()`. This is what produces the thick-head/thin-tail look.
2. **`pageX/pageY` with a `position: fixed` canvas** offsets the trail by the scroll amount. **Fix:** use `clientX/clientY` (viewport-space) for `fit="viewport"`.
3. **No device-pixel-ratio handling** → blurry on retina. **Fix:** scale the backing store by DPR and `ctx.setTransform(dpr,0,0,dpr,0,0)` so drawing stays in CSS pixels. Toggleable via `respectDevicePixelRatio`.
4. **`params.mouseThreshold` is declared but never used** in the original. The real first-point lag is the hardcoded `.4 * spring`. **Fix:** expose it honestly as `headSpringFactor` (default `0.4`); drop `mouseThreshold` entirely.

## Two fit modes

- `fit="viewport"` (default): canvas is `position: fixed; inset: 0`, listens on `window`, pointer coords = `clientX/clientY`. Global custom cursor.
- `fit="parent"`: canvas is `position: absolute; inset: 0` inside a **positioned** ancestor (the user's card/section). Listens on the parent element only; the trail is active solely while the pointer is inside that parent (clears on leave, keeps simulating so it "flies" back on re-entry). Coords are parent-relative.

In both modes the canvas is `pointer-events-none` + `aria-hidden`, so it never blocks clicks/scroll.

## Physics (faithful to the tutorial, steps 3–5)

Per frame, for each trail point `i`:
```
prev   = i === 0 ? pointer : trail[i-1]
spring = i === 0 ? headSpringFactor * spring : spring
p.dx += (prev.x - p.x) * spring      // accumulate (step 5)
p.dy += (prev.y - p.y) * spring
p.dx *= friction                     // dampen (step 5)
p.dy *= friction
p.x  += p.dx
p.y  += p.dy
```

## Drawing (faithful to steps 4, 6, 7 + the taper fix)

`lineCap = "round"`. Walk segments 1..n-2 as quadratic curves whose control point is `trail[i]` and endpoint is the midpoint of `trail[i]`/`trail[i+1]`; start point is the previous endpoint (initially `trail[0]`). Final segment is a `lineTo(trail[n-1])`. Each segment's `lineWidth = widthFactor * (n - i)` (so head ≈ `widthFactor*(n-1)`, tail ≈ `widthFactor*1`). Optional head→tail color interpolation via `colorTail`.

## Idle / intro motion (faithful)

When `idleMotion` and the pointer hasn't moved (or `resumeIdleAfterMs` has elapsed since last move), drive `pointer` by the original Lissajous, scaled to the current canvas CSS size:
```
x = (0.5 + radiusX * cos(freqA*t) * sin(freqB*t)) * width
y = (0.5 + radiusY * cos(freqB*t) + radiusZ * cos(freqC*t)) * height
```
Defaults: radiusX `.3`, radiusY `.2`, radiusZ `.1`, freqA `.002`, freqB `.005`, freqC `.01`. `t` is the rAF timestamp.

## Props

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `fit` | `"viewport" \| "parent"` | `"viewport"` | global vs contained |
| `color` | `string` | `"#ffffff"` | head/solid stroke color (must contrast bg) |
| `colorTail` | `string?` | — | if set, interpolate head→tail along the trail |
| `pointsNumber` | `number` | `40` | trail length |
| `spring` | `number` | `0.4` | catch-up stiffness (lower = laggier) |
| `friction` | `number` | `0.5` | delta damping (higher = bouncier/longer) |
| `widthFactor` | `number` | `0.3` | per-segment width multiplier (thickness) |
| `headSpringFactor` | `number` | `0.4` | extra lag multiplier for the first point |
| `lineCap` | `CanvasLineCap` | `"round"` | stroke cap |
| `idleMotion` | `boolean` | `true` | enable intro Lissajous |
| `idleParams` | `{radiusX,radiusY,radiusZ,freqA,freqB,freqC}?` | originals | tune idle curve |
| `resumeIdleAfterMs` | `number?` | — | resume idle after N ms idle (undefined = never, faithful) |
| `respectDevicePixelRatio` | `boolean` | `true` | crisp retina rendering |
| `zIndex` | `number` | `9999` | stacking |
| `className` | `string?` | — | extra canvas classes |

Structural prop changes (`pointsNumber`, `fit`, etc.) reinitialize the trail (a brief visual reset) — documented, acceptable.

## Exact component code — `registry/drawing-cursor/drawing-cursor.tsx`

```tsx
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
```

## Registry — `registry.json`

```json
{
  "name": "drawing-cursor",
  "title": "Drawing Cursor",
  "description": "A canvas-based trailing cursor with spring/friction physics, a tapering Bézier stroke, optional head-to-tail gradient, idle intro motion, and viewport or contained (parent) fit modes.",
  "tier": "free",
  "dependencies": [],
  "files": [
    {
      "path": "registry/drawing-cursor/drawing-cursor.tsx",
      "target": "components/ui/drawing-cursor.tsx"
    }
  ]
}
```

## Test page — `app/test-drawing-cursor/page.tsx`

Must be `"use client"` (uses a toggle for the fullscreen demo). Show: default, gradient tail, thin/fast, thick/dreamy, idle disabled, resume-idle, and a fullscreen (`fit="viewport"`) instance toggled on/off so it doesn't permanently overlay the grid. Every `parent` demo lives in a `relative overflow-hidden` card with fixed height and some real content + an interactive button underneath (to prove `pointer-events-none` doesn't block clicks).

```tsx
"use client"

import { useState } from "react"
import { DrawingCursor } from "@/components/ui/drawing-cursor"

const Card = ({
  title,
  desc,
  children,
}: {
  title: string
  desc: string
  children: React.ReactNode
}) => (
  <div className="relative h-[320px] overflow-hidden rounded-3xl border border-white/10 bg-neutral-900">
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="max-w-sm text-sm text-neutral-400">{desc}</p>
      <button
        type="button"
        className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-200"
      >
        Click me (cursor never blocks me)
      </button>
    </div>
    {children}
  </div>
)

export default function TestDrawingCursorPage() {
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white md:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Drawing Cursor
            </h1>
            <p className="mt-3 max-w-2xl text-neutral-400">
              Spring + friction trail rendered as a tapering Bézier stroke.
              Hover inside each card. Toggle the global mode below.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFullscreen((v) => !v)}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
          >
            {fullscreen ? "Disable" : "Enable"} fullscreen cursor
          </button>
        </header>

        {fullscreen && (
          <DrawingCursor
            fit="viewport"
            color="#ffffff"
            widthFactor={0.35}
          />
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Default" desc="40 points, white, idle intro motion on.">
            <DrawingCursor fit="parent" color="#ffffff" />
          </Card>

          <Card
            title="Gradient tail"
            desc="Head-to-tail color interpolation via colorTail."
          >
            <DrawingCursor
              fit="parent"
              color="#34d399"
              colorTail="#6366f1"
              widthFactor={0.4}
            />
          </Card>

          <Card
            title="Thin & fast"
            desc="Fewer points, higher spring, lower friction."
          >
            <DrawingCursor
              fit="parent"
              color="#fbbf24"
              pointsNumber={20}
              spring={0.6}
              friction={0.35}
              widthFactor={0.18}
              idleMotion={false}
            />
          </Card>

          <Card
            title="Thick & dreamy"
            desc="Many points, low spring, high friction, slow lag."
          >
            <DrawingCursor
              fit="parent"
              color="#f472b6"
              pointsNumber={70}
              spring={0.25}
              friction={0.62}
              widthFactor={0.5}
              headSpringFactor={0.25}
            />
          </Card>

          <Card
            title="Resume idle after 1.5s"
            desc="Returns to Lissajous motion when the pointer rests."
          >
            <DrawingCursor
              fit="parent"
              color="#38bdf8"
              resumeIdleAfterMs={1500}
              widthFactor={0.3}
            />
          </Card>

          <Card
            title="No idle / crisp off"
            desc="Idle disabled and DPR scaling off (soft, retro look)."
          >
            <DrawingCursor
              fit="parent"
              color="#a3e635"
              idleMotion={false}
              respectDevicePixelRatio={false}
              widthFactor={0.45}
            />
          </Card>
        </div>

        <div className="h-[60vh]" />
        <section className="mx-auto max-w-3xl">
          <Card
            title="Scroll tracking"
            desc="Far down the page — parent coords must stay correct after scroll."
          >
            <DrawingCursor fit="parent" color="#ffffff" widthFactor={0.35} />
          </Card>
        </section>
      </div>
    </main>
  )
}
```

## Docs — `app/docs/components/drawing-cursor/page.mdx`

- One-paragraph mechanism: chained points + accumulated spring/friction + per-segment quadratic Bézier with tapering `lineWidth`.
- Explain `fit="viewport"` vs `fit="parent"` (parent requires a `relative`/positioned ancestor; trail clears on leave and flies back on re-entry).
- Document every prop in the table.
- Note `pointer-events-none` + `aria-hidden` (decorative, never blocks UI).
- Note the four corrections vs the original CodePen (taper fix, clientX, DPR, headSpringFactor replacing mouseThreshold).
- Touch support: `touchmove` handled passively.
- Performance: single rAF loop, no React state per move (all refs); structural prop changes reinitialize the trail.
- Color contrast reminder: `color` defaults to white — set it to contrast the background; `colorTail` enables gradient.

## Release workflow

1. Read current `version` in `packages/cli/package.json`; bump PATCH by one (expected `0.1.31` if prior was `0.1.30`). Use same value for tag.
2. Commit, push branch + tag.
3. End response with manual npm publish commands (build + `npm publish --access public`, 2FA reminder).

## Verification checklist

- [ ] Trail tapers thick→thin along its length (per-segment stroke works).
- [ ] Fast mouse movement = long, curvy, laggy trail; slow = tight dot (spring/friction feel).
- [ ] Idle Lissajous plays before any mouse move; stops on first move.
- [ ] `resumeIdleAfterMs` returns to idle after rest.
- [ ] `fit="parent"` only draws inside its card; clears on leave; tracks correctly after page scroll.
- [ ] The button under each parent canvas is clickable (pointer-events-none proven).
- [ ] `colorTail` produces a smooth head→tail gradient; absent = solid.
- [ ] Crisp on retina when `respectDevicePixelRatio` true.
- [ ] No Three.js / WebGL / SVG / external deps; no `useState` for pointer.
- [ ] rAF + listeners + ResizeObserver all cleaned up on unmount.
- [ ] `npm run build` passes.