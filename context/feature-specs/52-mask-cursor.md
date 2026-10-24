Below is a **complete from-scratch specification** and a **direct AI prompt** based on all files you shared:

- `page.js`
- `page.module.scss`
- `useMousePosition.js`
- `mask.svg`
- `globals.css`

This version explicitly includes the missing details from the SCSS and SVG mask:

- The effect uses a **masked overlay layer**, not blend modes.
- The overlay layer can have its **own background color**.
- The mask is a **black circle SVG** used as a CSS mask image.
- `mask-repeat: no-repeat` is mandatory.
- The circle is **container-relative**, so it works inside cards and mid-page.
- The cursor circle is **active only inside the card/container**.
- The circle **expands only when hovering a hotspot element** inside that card.
- Hotspots are marked with `data-mask-hotspot`.
- Colors, sizes, spring lag, expansion behavior, and mask image are configurable.

Save this as:

`context/feature-specs/52-mask-cursor.md`

---

```markdown
# Feature 52: Mask Cursor Effect Component

## Overview

Add a free `MaskCursor` component that recreates the Olivier Larose cursor hover mask effect exactly, but as a reusable, configurable React component.

The effect works by rendering the same children twice:

1. A base layer with the normal text/content color.
2. An absolutely positioned mask overlay layer with:
   - its own text color,
   - optional background color,
   - a circular CSS mask following the cursor.

The circular mask reveals the overlay layer only inside the cursor circle.

This creates the effect where text/content outside the circle uses the base style, while text/content inside the circle uses the masked style.

## Reference Behavior From Original Repo

The original implementation uses:

- Two stacked layers: `.mask` and `.body`
- `.mask` has:
  - `position: absolute`
  - its own `background`
  - its own `color`
  - `mask-image: url(mask.svg)`
  - `mask-repeat: no-repeat`
  - animated `mask-position`
  - animated `mask-size`
- `mask.svg` is a black circle:
  ```svg
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="black" />
  </svg>
  ```
- The mask circle follows the mouse.
- Hovering the inner text expands the mask circle from `40px` to `400px`.
- The original transition is:
  ```js
  { type: "tween", ease: "backOut", duration: 0.5 }
  ```

## Required Component Behavior For Dead UI

The reusable component must support card-based usage:

- The mask cursor is only active while the mouse is inside the `MaskCursor` container.
- When the mouse enters the container, the circle appears in its normal/resting size and follows the cursor.
- When the mouse hovers a hotspot element inside the container, the circle expands to the hover size.
- When the mouse leaves the hotspot, the circle returns to normal size.
- When the mouse leaves the container, the circle disappears.

Hotspot elements are identified by:

```html
data-mask-hotspot
```

Example:

```tsx
<a href="#" data-mask-hotspot>Hover me</a>
<button data-mask-hotspot>Hover me</button>
```

This allows page-wide usage where the cursor effect is active inside a section/card, but the expansion/color-swap only triggers for specific links or buttons.

## Non-Negotiable Implementation Rules

The AI must follow these rules exactly.

### 1. Do not use blend modes

The effect must not use:

- `mix-blend-mode`
- `mix-blend-difference`
- CSS blend tricks

The effect must be produced only by stacking two identical layers and masking the top layer.

### 2. Do not use Three.js

This component is pure CSS masking + React + Motion.

No:

- Three.js
- React Three Fiber
- WebGL
- shaders

### 3. Do not store mouse position in React state

The mouse position must not cause a React re-render on every mouse move.

Use Motion values:

```ts
useMotionValue
useSpring
useTransform
```

Only `isActive` and `isExpanded` may be React state.

### 4. The mask overlay layer must duplicate children

The component must render `children` twice:

- base layer
- mask overlay layer

The mask overlay layer must be:

```tsx
aria-hidden="true"
inert
pointer-events-none
absolute inset-0
z-10
select-none
```

This ensures the duplicated content is visual only and does not intercept clicks, hover, or focus.

### 5. The mask overlay layer must support its own background

The original `.mask` layer has:

```css
background: #ec4e39;
color: black;
```

Therefore the component must support:

```ts
maskBackground?: string
maskColor?: string
baseColor?: string
```

`maskBackground` must accept any CSS background value:

- color
- rgba
- gradient

Examples:

```tsx
maskBackground="transparent"
maskBackground="#ec4e39"
maskBackground="rgba(236, 78, 57, 0.9)"
maskBackground="linear-gradient(135deg, #ec4e39, #f59e0b)"
```

### 6. Default mask must be the original black circle SVG

Use the provided `mask.svg` as an inline data URI.

The default mask image must be equivalent to:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="50" fill="black" />
</svg>
```

Important:

- The circle fill must be `black`.
- The SVG is used as a CSS mask image.
- The black circle is opaque in the mask alpha channel.
- Outside the circle is transparent.

### 7. `mask-repeat: no-repeat` is mandatory

The mask style must include both standard and prefixed properties:

```ts
maskRepeat: "no-repeat",
WebkitMaskRepeat: "no-repeat",
```

Without this, the circle will tile.

### 8. Mask position must be container-relative

The original demo works because the container is full viewport at `0,0`.

This reusable component must work inside cards and mid-page.

Therefore mouse coordinates must be converted to container-relative coordinates:

```ts
const rect = container.getBoundingClientRect()
const relativeX = clientX - rect.left
const relativeY = clientY - rect.top
```

The rect must be refreshed on:

- mouse enter
- window resize
- window scroll

### 9. Circle size must be configurable

Required props:

```ts
circleSize?: number
hoverCircleSize?: number
```

Defaults:

```ts
circleSize = 40
hoverCircleSize = 400
```

Behavior:

- inactive container: size `0`
- active container, no hotspot: size `circleSize`
- active container, hotspot hovered: size `hoverCircleSize`

### 10. Movement must have adjustable lag/smoothing

Use springs for cursor following and size expansion.

Required props:

```ts
positionStiffness?: number
positionDamping?: number
positionMass?: number
sizeStiffness?: number
sizeDamping?: number
sizeMass?: number
```

Defaults:

```ts
positionStiffness = 120
positionDamping = 20
positionMass = 0.4
sizeStiffness = 120
sizeDamping = 14
sizeMass = 1
```

These values should produce:

- a smooth trailing circle
- a slight overshoot on expansion, similar to the original `backOut` feel

### 11. Hotspot expansion must be configurable

Required props:

```ts
expandOnHotspot?: boolean
hotspotSelector?: string
```

Defaults:

```ts
expandOnHotspot = true
hotspotSelector = "[data-mask-hotspot]"
```

Behavior:

- If `expandOnHotspot` is `false`, the circle remains at `circleSize` inside the container.
- If `true`, hovering any element matching `hotspotSelector` expands the circle to `hoverCircleSize`.

### 12. Custom mask image must be supported

Required prop:

```ts
maskImage?: string
```

This must be a full CSS mask image value.

Examples:

```tsx
maskImage="url('/mask.svg')"
maskImage={`url("data:image/svg+xml,...")`}
maskImage="radial-gradient(circle at center, black 45%, transparent 52%)"
```

If omitted, use the default black circle SVG data URI.

## Component API

```ts
export interface MaskCursorProps {
  children: React.ReactNode

  /**
   * Classes for the outer container/card.
   */
  containerClassName?: string

  /**
   * Classes for the base layer wrapper.
   */
  baseClassName?: string

  /**
   * Classes for the masked overlay layer wrapper.
   */
  maskClassName?: string

  /**
   * Classes applied identically to the inner content of both layers.
   * This is critical so the text/content aligns perfectly.
   */
  contentClassName?: string

  /**
   * Text/content color outside the mask circle.
   */
  baseColor?: string

  /**
   * Text/content color inside the mask circle.
   */
  maskColor?: string

  /**
   * Background of the masked overlay layer.
   * Use "transparent" for a pure text-color swap.
   * Use a color/gradient for the original spotlight effect.
   */
  maskBackground?: string

  /**
   * Full CSS mask-image value.
   * Defaults to inline black circle SVG.
   */
  maskImage?: string

  /**
   * Resting circle diameter in px.
   */
  circleSize?: number

  /**
   * Expanded circle diameter in px when hovering a hotspot.
   */
  hoverCircleSize?: number

  /**
   * Whether hovering a hotspot expands the circle.
   */
  expandOnHotspot?: boolean

  /**
   * Selector used to detect hotspot elements.
   */
  hotspotSelector?: string

  /**
   * Spring config for cursor position lag.
   */
  positionStiffness?: number
  positionDamping?: number
  positionMass?: number

  /**
   * Spring config for circle size expansion.
   */
  sizeStiffness?: number
  sizeDamping?: number
  sizeMass?: number

  /**
   * Disable the effect entirely.
   */
  disabled?: boolean
}
```

## Defaults

```ts
baseColor = "#ffffff"
maskColor = "#000000"
maskBackground = "transparent"
circleSize = 40
hoverCircleSize = 400
expandOnHotspot = true
hotspotSelector = "[data-mask-hotspot]"

positionStiffness = 120
positionDamping = 20
positionMass = 0.4

sizeStiffness = 120
sizeDamping = 14
sizeMass = 1
```

Default content classes:

```ts
contentClassName =
  "w-full max-w-[1000px] p-10 text-center text-[32px] leading-[1.1] md:text-[56px] md:leading-[1.05]"
```

Default base layer classes:

```ts
baseClassName = "relative z-0 flex w-full items-center justify-center"
```

Default mask layer classes:

```ts
maskClassName =
  "pointer-events-none absolute inset-0 z-10 flex w-full items-center justify-center select-none"
```

Default container classes:

```ts
containerClassName = "relative isolate w-full overflow-hidden"
```

## Exact Component Code

Create or replace:

`registry/mask-cursor/mask-cursor.tsx`

Use this exact implementation.

```tsx
"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { cn } from "@/lib/utils"

const DEFAULT_MASK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="black"/></svg>'

const DEFAULT_MASK_IMAGE = `url("data:image/svg+xml,${encodeURIComponent(
  DEFAULT_MASK_SVG,
)}")`

export interface MaskCursorProps {
  children: React.ReactNode

  containerClassName?: string
  baseClassName?: string
  maskClassName?: string
  contentClassName?: string

  baseColor?: string
  maskColor?: string
  maskBackground?: string
  maskImage?: string

  circleSize?: number
  hoverCircleSize?: number

  expandOnHotspot?: boolean
  hotspotSelector?: string

  positionStiffness?: number
  positionDamping?: number
  positionMass?: number

  sizeStiffness?: number
  sizeDamping?: number
  sizeMass?: number

  disabled?: boolean
}

export function MaskCursor({
  children,
  containerClassName,
  baseClassName,
  maskClassName,
  contentClassName =
    "w-full max-w-[1000px] p-10 text-center text-[32px] leading-[1.1] md:text-[56px] md:leading-[1.05]",
  baseColor = "#ffffff",
  maskColor = "#000000",
  maskBackground = "transparent",
  maskImage,
  circleSize = 40,
  hoverCircleSize = 400,
  expandOnHotspot = true,
  hotspotSelector = "[data-mask-hotspot]",
  positionStiffness = 120,
  positionDamping = 20,
  positionMass = 0.4,
  sizeStiffness = 120,
  sizeDamping = 14,
  sizeMass = 1,
  disabled = false,
}: MaskCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rectRef = useRef({ left: 0, top: 0 })
  const clientRef = useRef({ x: 0, y: 0 })

  const [isActive, setIsActive] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const rawSize = useMotionValue(0)

  const springX = useSpring(rawX, {
    stiffness: positionStiffness,
    damping: positionDamping,
    mass: positionMass,
  })

  const springY = useSpring(rawY, {
    stiffness: positionStiffness,
    damping: positionDamping,
    mass: positionMass,
  })

  const springSize = useSpring(rawSize, {
    stiffness: sizeStiffness,
    damping: sizeDamping,
    mass: sizeMass,
  })

  const maskPosition = useTransform(
    [springX, springY, springSize],
    (latest) => {
      const [x, y, size] = latest as number[]
      return `${x - size / 2}px ${y - size / 2}px`
    },
  )

  const maskSize = useTransform(springSize, (size) => `${size}px ${size}px`)

  const targetSize = isActive
    ? expandOnHotspot && isExpanded
      ? hoverCircleSize
      : circleSize
    : 0

  const syncPointer = useCallback(() => {
    rawX.set(clientRef.current.x - rectRef.current.left)
    rawY.set(clientRef.current.y - rectRef.current.top)
  }, [rawX, rawY])

  const measure = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    rectRef.current = {
      left: rect.left,
      top: rect.top,
    }

    syncPointer()
  }, [syncPointer])

  useEffect(() => {
    measure()

    const handleResize = () => measure()
    const handleScroll = () => measure()

    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll, {
      passive: true,
      capture: true,
    })

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll, {
        passive: true,
        capture: true,
      } as EventListenerOptions)
    }
  }, [measure])

  useEffect(() => {
    rawSize.set(targetSize)
  }, [targetSize, rawSize])

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return

    clientRef.current = {
      x: event.clientX,
      y: event.clientY,
    }

    measure()
    setIsActive(true)
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !isActive) return

    clientRef.current = {
      x: event.clientX,
      y: event.clientY,
    }

    syncPointer()
  }

  const handleMouseLeave = () => {
    if (disabled) return

    setIsActive(false)
    setIsExpanded(false)
  }

  const isHotspotTarget = useCallback(
    (node: EventTarget | null) => {
      if (!(node instanceof HTMLElement)) return false
      return Boolean(node.closest(hotspotSelector))
    },
    [hotspotSelector],
  )

  const handleMouseOver = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !expandOnHotspot) return

    if (isHotspotTarget(event.target)) {
      setIsExpanded(true)
    }
  }

  const handleMouseOut = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !expandOnHotspot) return

    const target = event.target as HTMLElement
    const hotspot = target.closest(hotspotSelector)
    const related = event.relatedTarget as HTMLElement | null

    if (hotspot && (!related || !hotspot.contains(related))) {
      setIsExpanded(false)
    }
  }

  const resolvedMaskImage = maskImage ?? DEFAULT_MASK_IMAGE

  if (disabled) {
    return (
      <div
        ref={containerRef}
        className={cn("relative isolate w-full overflow-hidden", containerClassName)}
      >
        <div
          className={cn(
            "relative z-0 flex w-full items-center justify-center",
            baseClassName,
          )}
          style={{ color: baseColor }}
        >
          <div className={contentClassName}>{children}</div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative isolate w-full overflow-hidden", containerClassName)}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      {/* Base layer */}
      <div
        className={cn(
          "relative z-0 flex w-full items-center justify-center",
          baseClassName,
        )}
        style={{ color: baseColor }}
      >
        <div className={contentClassName}>{children}</div>
      </div>

      {/* Mask overlay layer */}
      <motion.div
        aria-hidden="true"
        {...({ inert: "" } as any)}
        className={cn(
          "pointer-events-none absolute inset-0 z-10 flex w-full items-center justify-center select-none",
          maskClassName,
        )}
        style={
          {
            color: maskColor,
            background: maskBackground,
            maskImage: resolvedMaskImage,
            WebkitMaskImage: resolvedMaskImage,
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition,
            WebkitMaskPosition: maskPosition,
            maskSize,
            WebkitMaskSize: maskSize,
            willChange: "mask-position, mask-size",
          } as any
        }
      >
        <div className={contentClassName}>{children}</div>
      </motion.div>
    </div>
  )
}
```

## Registry Update

Update `registry.json` with this component entry.

```json
{
  "name": "mask-cursor",
  "title": "Mask Cursor",
  "description": "A cursor-following circular mask effect that reveals a differently styled overlay layer inside the circle, with card activation and hotspot expansion.",
  "tier": "free",
  "dependencies": ["motion"],
  "files": [
    {
      "path": "registry/mask-cursor/mask-cursor.tsx",
      "target": "components/ui/mask-cursor.tsx"
    }
  ]
}
```

## Test Page

Create or replace:

`app/test-mask-cursor/page.tsx`

The test page must demonstrate:

- multiple cards,
- each card has one hotspot,
- circle only active inside each card,
- circle expands only when hovering the hotspot,
- original spotlight style,
- transparent text-swap style,
- custom colors,
- custom sizes,
- custom soft-edge mask,
- slower spring lag,
- mid-page tracking after scroll.

Use this exact test page.

```tsx
import { MaskCursor } from "@/components/ui/mask-cursor"

export default function TestMaskCursorPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white md:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Mask Cursor
          </h1>
          <p className="mt-4 max-w-2xl text-neutral-400">
            Hover inside each card to activate the cursor circle. Hover the
            highlighted link or button to expand the mask effect.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          {/* 1. Original spotlight style */}
          <MaskCursor
            containerClassName="min-h-[360px] rounded-3xl border border-white/10 bg-[#0f0f0f] p-6"
            contentClassName="max-w-[520px] p-8 text-center text-3xl leading-tight md:text-5xl md:leading-[1.05]"
            baseColor="#afa18f"
            maskColor="#000000"
            maskBackground="#ec4e39"
            circleSize={36}
            hoverCircleSize={320}
          >
            <p>
              I&apos;m a{" "}
              <a
                href="#"
                data-mask-hotspot
                className="underline decoration-2 underline-offset-4"
              >
                selectively skilled
              </a>{" "}
              product designer with strong focus on high quality digital
              experiences.
            </p>
          </MaskCursor>

          {/* 2. Pure text color swap */}
          <MaskCursor
            containerClassName="min-h-[360px] rounded-3xl border border-white/10 bg-zinc-500 p-6"
            contentClassName="max-w-[520px] p-8 text-center text-3xl leading-tight md:text-5xl"
            baseColor="#ffffff"
            maskColor="#000000"
            maskBackground="transparent"
            circleSize={40}
            hoverCircleSize={360}
          >
            <p>
              The circle swaps text color only when hovering this{" "}
              <button
                type="button"
                data-mask-hotspot
                className="font-bold underline decoration-2 underline-offset-4"
              >
                hotspot button
              </button>
              .
            </p>
          </MaskCursor>

          {/* 3. Dark neon text swap */}
          <MaskCursor
            containerClassName="min-h-[360px] rounded-3xl border border-white/10 bg-black p-6"
            contentClassName="max-w-[520px] p-8 text-center text-3xl leading-tight md:text-5xl"
            baseColor="#ffffff"
            maskColor="#34d399"
            maskBackground="transparent"
            circleSize={28}
            hoverCircleSize={340}
            positionStiffness={90}
            positionDamping={18}
            sizeStiffness={110}
            sizeDamping={13}
          >
            <p>
              Neon masked text inside the circle. Activate it by hovering the{" "}
              <a
                href="#"
                data-mask-hotspot
                className="text-emerald-300 underline decoration-2 underline-offset-4"
              >
                emerald link
              </a>
              .
            </p>
          </MaskCursor>

          {/* 4. Soft edge mask */}
          <MaskCursor
            containerClassName="min-h-[360px] rounded-3xl border border-white/10 bg-neutral-900 p-6"
            contentClassName="max-w-[520px] p-8 text-center text-3xl leading-tight md:text-5xl"
            baseColor="#fbbf24"
            maskColor="#0f172a"
            maskBackground="rgba(56, 189, 248, 0.92)"
            maskImage="radial-gradient(circle at center, black 42%, transparent 54%)"
            circleSize={48}
            hoverCircleSize={380}
          >
            <p>
              Soft-edged mask using a radial gradient instead of the default SVG
              circle. Hover this{" "}
              <button
                type="button"
                data-mask-hotspot
                className="rounded-full bg-white/10 px-3 py-1 underline decoration-2 underline-offset-4"
              >
                soft hotspot
              </button>
              .
            </p>
          </MaskCursor>

          {/* 5. Large slow expansion */}
          <MaskCursor
            containerClassName="min-h-[360px] rounded-3xl border border-white/10 bg-indigo-950 p-6"
            contentClassName="max-w-[520px] p-8 text-center text-3xl leading-tight md:text-5xl"
            baseColor="#c7d2fe"
            maskColor="#ffffff"
            maskBackground="#4f46e5"
            circleSize={20}
            hoverCircleSize={460}
            positionStiffness={70}
            positionDamping={16}
            positionMass={0.6}
            sizeStiffness={80}
            sizeDamping={12}
            sizeMass={1.2}
          >
            <p>
              Larger, slower trailing circle with stronger lag. Hover the{" "}
              <a
                href="#"
                data-mask-hotspot
                className="font-bold underline decoration-2 underline-offset-4"
              >
                indigo hotspot
              </a>
              .
            </p>
          </MaskCursor>

          {/* 6. Minimal resting circle */}
          <MaskCursor
            containerClassName="min-h-[360px] rounded-3xl border border-white/10 bg-stone-200 p-6 text-stone-900"
            contentClassName="max-w-[520px] p-8 text-center text-3xl leading-tight md:text-5xl"
            baseColor="#1c1917"
            maskColor="#fafaf9"
            maskBackground="#1c1917"
            circleSize={18}
            hoverCircleSize={300}
          >
            <p>
              Minimal dark spotlight over light content. Hover this{" "}
              <button
                type="button"
                data-mask-hotspot
                className="rounded-full border border-stone-900 px-3 py-1 font-medium"
              >
                dark button
              </button>
              .
            </p>
          </MaskCursor>
        </div>

        {/* Scroll tracking test */}
        <div className="h-[100vh]" />

        <section className="mx-auto max-w-4xl">
          <MaskCursor
            containerClassName="min-h-[420px] rounded-3xl border border-white/10 bg-neutral-900 p-8"
            contentClassName="max-w-[760px] p-10 text-center text-4xl leading-tight md:text-6xl"
            baseColor="#ffffff"
            maskColor="#000000"
            maskBackground="#f97316"
            circleSize={32}
            hoverCircleSize={420}
          >
            <p>
              This card is far down the page. The circle must still track the
              cursor correctly after scrolling. Hover the{" "}
              <a
                href="#"
                data-mask-hotspot
                className="underline decoration-2 underline-offset-4"
              >
                orange hotspot
              </a>
              .
            </p>
          </MaskCursor>
        </section>
      </div>
    </main>
  )
}
```

## Documentation Page

Create or replace:

`app/docs/components/mask-cursor/page.mdx`

The docs must explain:

- the two-layer mask mechanism,
- `data-mask-hotspot`,
- card/container activation,
- color props,
- `maskBackground`,
- `maskImage`,
- spring props,
- that the mask layer is duplicated and inert,
- that the component does not use blend modes or WebGL.

Use this documentation structure.

````mdx
# Mask Cursor

The `MaskCursor` component creates a cursor-following circular mask effect.

It renders your content twice:

1. A base layer.
2. A masked overlay layer.

The overlay layer is clipped by a circular CSS mask that follows the cursor.

## Installation

```bash
npx deadui@latest add mask-cursor
```

## Dependencies

```bash
npm install motion
```

## Basic Usage

```tsx
import { MaskCursor } from "@/components/ui/mask-cursor"

export default function Example() {
  return (
    <MaskCursor
      containerClassName="min-h-[360px] rounded-3xl bg-zinc-500 p-6"
      baseColor="#ffffff"
      maskColor="#000000"
      maskBackground="transparent"
    >
      <p>
        Hover this{" "}
        <a href="#" data-mask-hotspot className="underline">
          hotspot
        </a>
        .
      </p>
    </MaskCursor>
  )
}
```

## How It Works

The component uses CSS masking:

```css
mask-image: url(...);
mask-repeat: no-repeat;
mask-position: follows cursor;
mask-size: animated circle size;
```

The top layer is duplicated content with different colors and optional background.

It does not use:

- `mix-blend-mode`
- Three.js
- WebGL

## Hotspots

Mark any element inside the component as a hotspot:

```tsx
<a href="#" data-mask-hotspot>
  Hover me
</a>

<button data-mask-hotspot>
  Hover me
</button>
```

The circle expands only when hovering a hotspot.

## Card Activation

The cursor circle is only active while the mouse is inside the `MaskCursor` container.

This makes it suitable for:

- cards,
- sections,
- page-wide wrappers,
- navigation areas.

## Colors

```tsx
<MaskCursor
  baseColor="#ffffff"
  maskColor="#000000"
  maskBackground="transparent"
>
  ...
</MaskCursor>
```

For the original spotlight style:

```tsx
<MaskCursor
  baseColor="#afa18f"
  maskColor="#000000"
  maskBackground="#ec4e39"
>
  ...
</MaskCursor>
```

`maskBackground` accepts any CSS background value:

```tsx
maskBackground="rgba(236, 78, 57, 0.9)"
maskBackground="linear-gradient(135deg, #ec4e39, #f59e0b)"
```

## Sizes

```tsx
<MaskCursor
  circleSize={40}
  hoverCircleSize={400}
>
  ...
</MaskCursor>
```

## Custom Mask Image

Default mask is an inline black circle SVG.

You can override it:

```tsx
<MaskCursor
  maskImage="radial-gradient(circle at center, black 45%, transparent 52%)"
>
  ...
</MaskCursor>
```

Or use a local asset:

```tsx
<MaskCursor maskImage="url('/mask.svg')">
  ...
</MaskCursor>
```

## Spring Controls

Cursor lag:

```tsx
<MaskCursor
  positionStiffness={120}
  positionDamping={20}
  positionMass={0.4}
>
  ...
</MaskCursor>
```

Expansion feel:

```tsx
<MaskCursor
  sizeStiffness={120}
  sizeDamping={14}
  sizeMass={1}
>
  ...
</MaskCursor>
```

Lower stiffness and damping create more lag and overshoot.

## Accessibility

The masked layer is duplicated for visual effect only.

It is marked:

```tsx
aria-hidden="true"
inert
pointer-events-none
```

Do not rely on the masked layer for interaction.

## Important Notes

- The effect is container-relative.
- It works inside cards and mid-page.
- The container rect is refreshed on scroll and resize.
- Mouse position is stored in Motion values, not React state.
- `mask-repeat: no-repeat` is required and included internally.
````

## Release Workflow

This is a from-scratch correction/reimplementation of Feature 52.

1. Delete or overwrite any existing incorrect Mask Cursor implementation.
2. Create `registry/mask-cursor/mask-cursor.tsx` using the exact code above.
3. Update `registry.json`.
4. Create/overwrite `app/test-mask-cursor/page.tsx`.
5. Create/overwrite `app/docs/components/mask-cursor/page.mdx`.
6. Read the current version from `packages/cli/package.json`.
7. Bump the patch version by one.
   - If current version is `0.1.29`, new version should be `0.1.30`.
   - Always read the actual file rather than assuming.
8. Commit and tag the new version.
9. Push branch and tag.
10. Provide GitHub Release instructions.
11. Provide manual npm publish commands.

## Verification Checklist

- [ ] Hovering inside a card activates the circle.
- [ ] The circle follows the cursor with adjustable lag.
- [ ] Hovering a `data-mask-hotspot` element expands the circle.
- [ ] Leaving the hotspot returns the circle to normal size.
- [ ] Leaving the card removes the circle.
- [ ] The base layer and mask layer text/content align perfectly.
- [ ] The mask layer has optional background color.
- [ ] The mask layer is `aria-hidden`, `inert`, and `pointer-events-none`.
- [ ] No `mix-blend-mode` is used.
- [ ] No Three.js/WebGL is used.
- [ ] No mouse position React state re-render occurs.
- [ ] `mask-repeat: no-repeat` is present.
- [ ] Both standard and `-webkit-` mask properties are set.
- [ ] The effect works after scrolling down the test page.
- [ ] `npm run build` passes.
```
