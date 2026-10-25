# Feature 54: Cursor Trail Component

## Overview

Add a free `CursorTrail` component that creates a colorful, smooth, cursor-following SVG trail effect. It recreates the CodePen effect where multiple trails of different lengths and colors follow the pointer using eased SVG lines.

The original effect uses GSAP modifiers. This component must recreate the same visual behavior using pure React + SVG + `requestAnimationFrame`.

## Reference Behavior

The original CodePen creates multiple trails:

```js
createTrail("cyan", 30);
createTrail("yellow", 20);
createTrail("orange", 10);
```

Each trail is a chain of SVG `<line>` elements. Each line follows the previous line, and the first line follows the pointer.

The easing formula is:

```js
next = current + (target - current) * EASE
```

with default:

```js
EASE = 0.7
```

Each line is rendered from its own eased position to its leader position.

Equivalent React implementation:

```ts
segment.pos.x += (leader.x - segment.pos.x) * ease
segment.pos.y += (leader.y - segment.pos.y) * ease

line.x1 = segment.pos.x
line.y1 = segment.pos.y
line.x2 = leader.x
line.y2 = leader.y

leader = segment.pos
```

This produces the same visual result as the original GSAP modifier setup.

## Non-Negotiable Implementation Rules

1. Do **not** use GSAP.
2. Do **not** use Canvas.
3. Do **not** use Three.js or WebGL.
4. Use SVG `<line>` elements.
5. Use `requestAnimationFrame` for the animation loop.
6. Do **not** store pointer position in React state.
7. Pointer position must live in a plain object/ref updated by `pointermove` and `pointerdown`.
8. The SVG must be:
   - `fixed`
   - full viewport
   - `pointer-events-none`
   - `aria-hidden="true"`
9. Multiple trails must be supported.
10. Each trail must independently chain its segments.
11. All trails must be cleaned up on unmount.
12. The component must be fully configurable through props.

## Component API

Create:

`registry/cursor-trail/cursor-trail.tsx`

```tsx
"use client"

import { useEffect, useRef, type CSSProperties } from "react"
import { cn } from "@/lib/utils"

const SVG_NS = "http://www.w3.org/2000/svg"

export type CursorTrailLinecap = "butt" | "round" | "square"

export interface CursorTrailConfig {
  /**
   * Stroke color for this trail.
   */
  color?: string

  /**
   * Number of line segments in this trail.
   */
  length?: number

  /**
   * Stroke width for this trail.
   */
  strokeWidth?: number | string

  /**
   * Opacity for this trail.
   */
  opacity?: number | string

  /**
   * Easing factor for this trail.
   * Higher = faster follow, lower = longer lag.
   */
  ease?: number

  /**
   * Stroke linecap for this trail.
   */
  linecap?: CursorTrailLinecap

  /**
   * Optional CSS mix-blend-mode for this trail.
   */
  blendMode?: string
}

export interface CursorTrailProps {
  /**
   * Trail configurations.
   * If omitted, uses the default cyan/yellow/orange CodePen preset.
   */
  trails?: CursorTrailConfig[]

  /**
   * Default color for trails that do not specify one.
   */
  color?: string

  /**
   * Default length for trails that do not specify one.
   */
  length?: number

  /**
   * Default easing factor for trails that do not specify one.
   */
  ease?: number

  /**
   * Default stroke width for trails that do not specify one.
   */
  strokeWidth?: number | string

  /**
   * Default linecap for trails that do not specify one.
   */
  linecap?: CursorTrailLinecap

  /**
   * Default opacity for trails that do not specify one.
   */
  opacity?: number | string

  /**
   * Default mix-blend-mode for trails that do not specify one.
   */
  blendMode?: string

  /**
   * z-index for the fixed SVG layer.
   */
  zIndex?: number | string

  /**
   * Extra classes for the SVG element.
   */
  className?: string

  /**
   * Extra inline styles for the SVG element.
   */
  style?: CSSProperties

  /**
   * Disable the effect entirely.
   */
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
```

## Registry Update

Update `registry.json` with:

```json
{
  "name": "cursor-trail",
  "title": "Cursor Trail",
  "description": "A colorful SVG cursor trail effect with configurable trails, lengths, colors, easing, stroke width, opacity, and blend modes.",
  "tier": "free",
  "dependencies": [],
  "files": [
    {
      "path": "registry/cursor-trail/cursor-trail.tsx",
      "target": "components/ui/cursor-trail.tsx"
    }
  ]
}
```

## Test Page

Create:

`app/test-cursor-trail/page.tsx`

The test page must demonstrate:

- default CodePen preset
- single-color long trail
- thin fast trail
- rainbow trail
- blend mode trail
- enable/disable toggle

Use this exact test page:

```tsx
"use client"

import { useState } from "react"
import { CursorTrail, type CursorTrailConfig } from "@/components/ui/cursor-trail"

const presets: Record<string, CursorTrailConfig[] | undefined> = {
  Default: undefined,
  "Single Cyan": [{ color: "cyan", length: 45, strokeWidth: 50 }],
  "Thin Fast": [
    {
      color: "#ffffff",
      length: 70,
      strokeWidth: 8,
      ease: 0.35,
    },
  ],
  Rainbow: [
    { color: "#ef4444", length: 28, strokeWidth: 42 },
    { color: "#f59e0b", length: 22, strokeWidth: 36 },
    { color: "#22c55e", length: 18, strokeWidth: 30 },
    { color: "#3b82f6", length: 14, strokeWidth: 24 },
    { color: "#a855f7", length: 10, strokeWidth: 18 },
  ],
  "Blend Screen": [
    {
      color: "#22d3ee",
      length: 35,
      strokeWidth: 55,
      blendMode: "screen",
    },
    {
      color: "#f472b6",
      length: 25,
      strokeWidth: 45,
      blendMode: "screen",
    },
  ],
}

export default function TestCursorTrailPage() {
  const [preset, setPreset] = useState<keyof typeof presets>("Default")
  const [enabled, setEnabled] = useState(true)

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white md:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Cursor Trail
          </h1>
          <p className="mt-4 max-w-2xl text-neutral-400">
            Move your pointer around. This component recreates the CodePen SVG
            cursor trail using pure React and requestAnimationFrame, with no
            GSAP dependency.
          </p>
        </header>

        <div className="mb-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setEnabled((value) => !value)}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
          >
            {enabled ? "Disable" : "Enable"} trail
          </button>

          {Object.keys(presets).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setPreset(name)}
              className={
                preset === name
                  ? "rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
                  : "rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
              }
            >
              {name}
            </button>
          ))}
        </div>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="min-h-[320px] rounded-3xl border border-white/10 bg-neutral-900 p-8">
            <h2 className="text-xl font-semibold">Interactive Area</h2>
            <p className="mt-3 text-neutral-400">
              The trail is fixed to the viewport and ignores pointer events, so
              buttons and links underneath remain clickable.
            </p>
          </div>

          <div className="min-h-[320px] rounded-3xl border border-white/10 bg-neutral-900 p-8">
            <h2 className="text-xl font-semibold">Current Preset</h2>
            <p className="mt-3 font-mono text-emerald-300">{preset}</p>
            <p className="mt-6 text-sm text-neutral-500">
              Selected preset:{" "}
              {presets[preset]
                ? `${presets[preset]?.length} trail config(s)`
                : "default CodePen preset"}
            </p>
          </div>
        </section>

        <div className="h-[80vh]" />

        <section className="rounded-3xl border border-white/10 bg-neutral-900 p-8">
          <h2 className="text-2xl font-semibold">Scroll Test</h2>
          <p className="mt-3 text-neutral-400">
            The trail uses viewport coordinates, so it remains correct while
            scrolling.
          </p>
        </section>
      </div>

      {enabled && <CursorTrail trails={presets[preset]} />}
    </main>
  )
}
```

## Documentation Page

Create:

`app/docs/components/cursor-trail/page.mdx`

Use this documentation structure:

````mdx
# Cursor Trail

The `CursorTrail` component creates a colorful SVG cursor trail effect.

It recreates the popular CodePen cursor trail using pure React, SVG, and `requestAnimationFrame`.

## Installation

```bash
npx deadui@latest add cursor-trail
```

## Dependencies

None.

## Basic Usage

```tsx
import { CursorTrail } from "@/components/ui/cursor-trail"

export default function Example() {
  return <CursorTrail />
}
```

## Default Preset

With no props, the component uses the original CodePen-style preset:

```ts
[
  { color: "cyan", length: 30 },
  { color: "yellow", length: 20 },
  { color: "orange", length: 10 },
]
```

## Custom Trails

```tsx
<CursorTrail
  trails={[
    { color: "#22d3ee", length: 40, strokeWidth: 45 },
    { color: "#f472b6", length: 25, strokeWidth: 30 },
  ]}
/>
```

## Single Trail

```tsx
<CursorTrail
  trails={[
    {
      color: "white",
      length: 60,
      strokeWidth: 10,
      ease: 0.35,
    },
  ]}
/>
```

## Blend Mode

```tsx
<CursorTrail
  trails={[
    {
      color: "#22d3ee",
      length: 35,
      strokeWidth: 55,
      blendMode: "screen",
    },
  ]}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `trails` | `CursorTrailConfig[]` | default preset | Array of trail configurations |
| `color` | `string` | `"white"` | Default trail color |
| `length` | `number` | `20` | Default trail length |
| `ease` | `number` | `0.7` | Default easing factor |
| `strokeWidth` | `number \| string` | `60` | Default stroke width |
| `linecap` | `"butt" \| "round" \| "square"` | `"round"` | Default stroke linecap |
| `opacity` | `number \| string` | `1` | Default trail opacity |
| `blendMode` | `string` | `undefined` | Default CSS mix-blend-mode |
| `zIndex` | `number \| string` | `9999` | SVG layer z-index |
| `className` | `string` | `undefined` | Extra SVG classes |
| `style` | `CSSProperties` | `undefined` | Extra SVG styles |
| `disabled` | `boolean` | `false` | Disable the effect |

## Trail Config

| Prop | Type | Description |
|---|---|---|
| `color` | `string` | Stroke color |
| `length` | `number` | Number of segments |
| `strokeWidth` | `number \| string` | Stroke width |
| `opacity` | `number \| string` | Opacity |
| `ease` | `number` | Follow speed |
| `linecap` | `"butt" \| "round" \| "square"` | Stroke linecap |
| `blendMode` | `string` | CSS mix-blend-mode |

## Performance Notes

- Pointer position is stored outside React state.
- The animation runs in a single `requestAnimationFrame` loop.
- SVG attributes are updated directly through refs.
- The component cleans up all listeners and SVG nodes on unmount.

## Accessibility

The SVG layer is decorative:

```tsx
aria-hidden="true"
pointer-events-none
```

It never blocks clicks, taps, or scrolling.

## Important Notes

- Do not pass an inline `trails` array without memoization if the parent re-renders often.
- The component is viewport-fixed by design.
- It does not use GSAP.

Release Workflow
Read the current version from packages/cli/package.json.
Bump the patch version by one.
Use that same version for the git tag.
Commit, push branch, tag, and push tag.
Output GitHub Release UI instructions.
End with the exact manual npm publish commands.
Verification Checklist
Default preset matches the CodePen colors and lengths: cyan 30, yellow 20, orange 10.
Trails follow the pointer smoothly.
Each segment follows the previous segment.
First segment follows the pointer.
Multiple trails can have different colors and lengths.
strokeWidth, opacity, ease, linecap, and blendMode are configurable.
The SVG is fixed, full viewport, pointer-event-none, and aria-hidden.
No GSAP dependency is added.
No Canvas or WebGL is used.
Pointer position is not stored in React state.
Animation loop is cancelled on unmount.
Event listeners are removed on unmount.
SVG child nodes are removed on unmount.
npm run build passes.