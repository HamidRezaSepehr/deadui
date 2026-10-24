# Feature 52: Mask Cursor Effect Component

## Overview
Port of `olivierlarose/cursor-hover-mask`. A wrapper that renders its `children` TWICE in two stacked layers with different text colors. The top layer is clipped by a circular CSS `mask-image` that follows the cursor (with adjustable spring lag) and grows when the container is hovered, producing a "color swap inside the cursor circle" effect.

## The exact mechanism (do not deviate)
- Base layer: normal flow, defines container size, color = `baseColorClass`.
- Mask layer: `position:absolute; inset:0; pointer-events:none; aria-hidden`, identical `children` + identical typography (`textClassName`), color = `maskColorClass`, clipped by:
  - `mask-image: radial-gradient(circle at center, #000 {edge}%, transparent {edge+feather}%)` (alpha-encoded circle; `#000`=opaque, `transparent`=hole).
  - `mask-repeat: no-repeat` (CRITICAL, else the circle tiles).
  - `mask-position` = springed relative cursor minus half the springed size (keeps circle centered on the lagged cursor and growing from center).
  - `mask-size` = springed size (px px).
- Hover on the CONTAINER toggles `isHovered`; size springs between `circleSize` and `hoverCircleSize` with an underdamped spring (overshoot ≈ the original's `backOut`).
- Cursor coords are RELATIVE to the container (subtract cached `getBoundingClientRect().left/top`); rect refreshed on scroll + resize + mount.
- Mouse position lives in `useMotionValue` updated by a window `mousemove` listener — NEVER in `useState` (no re-render per move).
- NO `mix-blend-mode` anywhere (the swap is pure mask overlay of differently-colored identical text).
- Render the mask layer only after the first pointer move (`ready` flag) to avoid a corner flash, and never when `disabled`.

## Contrast rule (document this to users)
The background must contrast with BOTH `baseColorClass` and `maskColorClass`. Defaults use a mid-gray bg so white↔black both read. On a dark theme, pair e.g. `text-white` ↔ `text-emerald-400` on `bg-black`.

## Props (all simple types → guaranteed compile)
| Prop | Type | Default | Meaning |
|---|---|---|---|
| `children` | ReactNode | — | the text/content (rendered in both layers) |
| `baseColorClass` | string | `"text-white"` | outside-circle text color |
| `maskColorClass` | string | `"text-black"` | inside-circle text color |
| `bgClassName` | string | `"bg-zinc-500"` | container bg (must contrast both colors) |
| `textClassName` | string | `"text-4xl md:text-6xl font-bold leading-tight"` | shared typography/layout for both layers |
| `containerClassName` | string | `""` | extra classes on the wrapper (e.g. padding to enlarge hotspot) |
| `circleSize` | number | `40` | resting circle diameter (px) |
| `hoverCircleSize` | number | `400` | expanded circle diameter (px) |
| `positionStiffness` | number | `120` | cursor-follow spring stiffness (lower = more lag) |
| `positionDamping` | number | `20` | cursor-follow spring damping |
| `positionMass` | number | `0.4` | cursor-follow spring mass |
| `sizeStiffness` | number | `120` | hover-grow spring stiffness |
| `sizeDamping` | number | `14` | hover-grow spring damping (lower = more overshoot) |
| `sizeMass` | number | `1` | hover-grow spring mass |
| `maskEdge` | number | `50` | opaque stop % of the radial gradient (circle radius within the size box) |
| `maskFeather` | number | `0` | soft-edge width in % (0 = hard circle) |
| `disabled` | boolean | `false` | render base only, attach no listeners |

## Exact component code — `registry/mask-cursor/mask-cursor.tsx`
```tsx
"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { cn } from "@/lib/utils"

export interface MaskCursorProps {
  children: React.ReactNode
  baseColorClass?: string
  maskColorClass?: string
  bgClassName?: string
  textClassName?: string
  containerClassName?: string
  circleSize?: number
  hoverCircleSize?: number
  positionStiffness?: number
  positionDamping?: number
  positionMass?: number
  sizeStiffness?: number
  sizeDamping?: number
  sizeMass?: number
  maskEdge?: number
  maskFeather?: number
  disabled?: boolean
}

export function MaskCursor({
  children,
  baseColorClass = "text-white",
  maskColorClass = "text-black",
  bgClassName = "bg-zinc-500",
  textClassName = "text-4xl md:text-6xl font-bold leading-tight",
  containerClassName = "",
  circleSize = 40,
  hoverCircleSize = 400,
  positionStiffness = 120,
  positionDamping = 20,
  positionMass = 0.4,
  sizeStiffness = 120,
  sizeDamping = 14,
  sizeMass = 1,
  maskEdge = 50,
  maskFeather = 0,
  disabled = false,
}: MaskCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rectRef = useRef({ left: 0, top: 0 })
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sizeMV = useMotionValue(circleSize)
  const [isHovered, setIsHovered] = useState(false)
  const [ready, setReady] = useState(false)

  // Measure container offset; refresh on scroll/resize so the circle tracks
  // the cursor correctly no longer than the component's position on screen.
  useEffect(() => {
    if (disabled) return
    const measure = () => {
      const r = containerRef.current?.getBoundingClientRect()
      if (r) rectRef.current = { left: r.left, top: r.top }
    }
    const onMove = (e: MouseEvent) => {
      measure() // keep rect fresh cheaply; also marks ready on first move
      mx.set(e.clientX - rectRef.current.left)
      my.set(e.clientY - rectRef.current.top)
      setReady((prev) => (prev ? prev : true))
    }
    measure()
    window.addEventListener("mousemove", onMove)
    window.addEventListener("scroll", measure, { passive: true })
    window.addEventListener("resize", measure)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("scroll", measure)
      window.removeEventListener("resize", measure)
    }
  }, [disabled, mx, my])

  // Drive the circle size from hover state.
  useEffect(() => {
    sizeMV.set(isHovered ? hoverCircleSize : circleSize)
  }, [isHovered, circleSize, hoverCircleSize, sizeMV])

  // Springed cursor position (adjustable lag) + springed size (adjustable overshoot).
  const sx = useSpring(mx, { stiffness: positionStiffness, damping: positionDamping, mass: positionMass })
  const sy = useSpring(my, { stiffness: positionStiffness, damping: positionDamping, mass: positionMass })
  const ss = useSpring(sizeMV, { stiffness: sizeStiffness, damping: sizeDamping, mass: sizeMass })

  const maskPosition = useTransform([sx, sy, ss], (latest) => {
    const [x, y, s] = latest as number[]
    return `${x - s / 2}px ${y - s / 2}px`
  })
  const maskSize = useTransform(ss, (s) => `${s}px ${s}px`)

  const maskImage = useMemo(
    () => `radial-gradient(circle at center, #000 ${maskEdge}%, transparent ${maskEdge + maskFeather}%)`,
    [maskEdge, maskFeather],
  )

  // Cast to any so FM applies the MotionValue-bearing webkit mask keys at runtime
  // without TS complaining about non-standard style properties.
  const maskStyle = {
    maskImage,
    WebkitMaskImage: maskImage,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition,
    WebkitMaskPosition: maskPosition,
    maskSize,
    WebkitMaskSize: maskSize,
  } as any

  const showMask = !disabled && ready

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
      className={cn("relative isolate w-full overflow-hidden", bgClassName, containerClassName)}
    >
      {/* Base layer: in normal flow, defines size */}
      <div className={cn("relative z-0", textClassName, baseColorClass)}>{children}</div>

      {/* Mask layer: identical text, different color, clipped to the cursor circle */}
      {showMask && (
        <motion.div
          aria-hidden
          className={cn("pointer-events-none absolute inset-0 z-10 select-none", textClassName, maskColorClass)}
          style={maskStyle}
        >
          {children}
        </motion.div>
      )}
    </div>
  )
}
```

## Registry — `registry.json`
```json
{
  "name": "mask-cursor",
  "title": "Mask Cursor",
  "description": "A cursor-following circular mask that swaps text color inside the circle, with adjustable lag, size, edge softness, and hover growth.",
  "tier": "free",
  "dependencies": ["motion"],
  "files": [
    { "path": "registry/mask-cursor/mask-cursor.tsx", "target": "components/ui/mask-cursor.tsx" }
  ]
}
```

## Test page — `app/test-mask-cursor/page.tsx`
```tsx
import { MaskCursor } from "@/components/ui/mask-cursor"

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col gap-16 py-24">
      {/* Example 1: faithful to the original demo (white <-> black on mid-gray) */}
      <MaskCursor
        bgClassName="bg-zinc-500"
        baseColorClass="text-white"
        maskColorClass="text-black"
        containerClassName="px-8 py-12"
      >
        <p>A visual designer — with skills that haven&apos;t been replaced by A.I (yet).</p>
      </MaskCursor>

      {/* Example 2: dark-theme friendly + customized sizing/lag/softness to prove configurability */}
      <MaskCursor
        bgClassName="bg-black"
        baseColorClass="text-white"
        maskColorClass="text-emerald-400"
        circleSize={24}
        hoverCircleSize={520}
        positionStiffness={90}
        positionDamping={16}
        sizeDamping={11}
        maskEdge={48}
        maskFeather={6}
        textClassName="text-5xl md:text-7xl font-black leading-none tracking-tight"
        containerClassName="px-8 py-16"
      >
        <p>Selectively skilled product designer.</p>
      </MaskCursor>
    </main>
  )
}
```

## Docs — `app/docs/components/mask-cursor/page.mdx`
- Explain the two-layer + circular `mask-image` mechanism in one paragraph.
- State the contrast rule (bg must contrast both colors) and the white↔black-on-gray vs white↔color-on-dark examples.
- Document every prop in the table above.
- Caveats: hover-based (no touch equivalent by default — wrap with `disabled` on coarse pointers if needed); children should be presentational text (the mask layer duplicates them, `aria-hidden` + `pointer-events-none`); the circle only appears after the first mouse move.
- Note the deliberate improvements over the source demo: relative-coordinate tracking (works mid-page), motion-value springs (no per-move re-render, adjustable lag), explicit `mask-repeat:no-repeat`.

## Release workflow
- Read the current `version` in `packages/cli/package.json`, bump the PATCH by one (expected `0.1.29` if the prior release was `v0.1.28`), set that as the new version and tag.
- Commit, push branch + tag.
- End the response with the manual npm publish commands (build + `npm publish --access public`, 2FA reminder).

## Verification checklist
- [ ] Hovering the block grows the circle; the text inside the circle shows `maskColorClass`, outside shows `baseColorClass`.
- [ ] The circle trails the cursor with adjustable lag and does NOT drift when the component is mid-page (scroll the test page and confirm tracking).
- [ ] Leaving the block shrinks the circle back with a slight overshoot.
- [ ] No React re-render on mousemove (verify React DevTools / no `useState` for mouse).
- [ ] No `mix-blend-mode` and no Three.js imports in the file.
- [ ] `disabled` renders base only with no listeners.
- [ ] `npm run build` passes.