# Feature 58: Gooey Cursor Component

## Overview
Add a free `GooeyCursor` component that creates a grid-based, liquid cursor trail effect. It consists of invisible cells covering the viewport; when the mouse moves over them, they briefly light up. An SVG filter merges adjacent lit cells into a cohesive "blob" shape. Supports 8 distinct visual variants (Standard, Blurry, Noise, Outline, Displaced, Shadowed, Multi-Color, Radial Gradient) and an optional click explosion effect.

## Goals
1. Create `registry/gooey-cursor/gooey-cursor.tsx` using pure DOM manipulation and Web Animations API (no GSAP).
2. Implement the 8 specific SVG filter definitions found in the Codrops demos.
3. Support configurable props: `variant`, `columns`, `ttl`, `enableClickEffect`, `customColors`.
4. Handle Firefox compatibility (disable filter if unsupported/performance risk).
5. Create a test page `app/test-gooey-cursor/page.tsx` showcasing all 8 variants.
6. Create MDX documentation.
7. Execute the 4-step Release Workflow for `v0.1.35` and provide manual npm publish instructions.

## Technical Specifications

### 1. Variant Definitions
The component maps the `variant` prop to specific CSS vars and SVG filter IDs.

| Variant | Blend Mode | Radius | Background | Filter Type | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `standard` | `exclusion` | `0` | `#5cafc1` | Simple Blur+Matrix | Classic gooey merge |
| `blurry` | `overlay` | `0` | `#47ea82` | High Blur | Softer, cloud-like |
| `noise` | `overlay` | `0` | `#db970b` | Turbulence+Displace | Glitchy/distorted edges |
| `outline` | `exclusion` | `0` | `#f3d006` | Morphology Out | Hollow/outline look |
| `displaced` | `none` | `0` | `rgba(234,91,42,.8)` | Heavy Displace | Chaotic/wavy |
| `shadowed` | `none` | `50%` | `#c54733` | Double Blur+Shadow | Soft drop shadow |
| `multicolor` | `color-burn` | `50%` | Random Array | Simple Blur | Cells have random colors/scales |
| `radial` | `overlay` | `0` | `radial-gradient(...)` | Simple Blur | Gradient fill per cell |

### 2. Component Implementation (`registry/gooey-cursor/gooey-cursor.tsx`)

```tsx
"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export type GooeyVariant = 
  | 'standard' | 'blurry' | 'noise' | 'outline' 
  | 'displaced' | 'shadowed' | 'multicolor' | 'radial'

export interface GooeyCursorProps {
  variant?: GooeyVariant
  columns?: number
  ttl?: number // Time-to-live in seconds for cell visibility
  enableClickEffect?: boolean
  customColors?: string[] // Used primarily for 'multicolor' variant
  className?: string
}

// --- SVG Filter Templates ---
const FILTERS: Record<string, string> = {
  standard: `
    <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="3.2" />
    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -7" result="goo" />
    <feComposite in="SourceGraphic" in2="goo" operator="atop" />
  `,
  blurry: `
    <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="18" />
    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -7" result="goo" />
    <feComposite in="SourceGraphic" in2="goo" operator="atop" />
  `,
  noise: `
    <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="turbulence" />
    <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="30" xChannelSelector="R" yChannelSelector="G" result="displacement" />
    <feGaussianBlur in="displacement" stdDeviation="10" result="blur" />
    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -7" result="gooey" />
  `,
  outline: `
    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -7" result="gooey" />
    <feMorphology in="gooey" operator="dilate" radius="2" result="outline" />
    <feComposite in="outline" in2="gooey" operator="out" result="composite" />
  `,
  displaced: `
    <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="1" seed="0" result="turbulence" />
    <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="100" xChannelSelector="R" yChannelSelector="G" result="displacement" />
    <feGaussianBlur in="displacement" stdDeviation="5" result="blur" />
    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 15 -7" result="gooey" />
  `,
  shadowed: `
    <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="12" />
    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
    <feGaussianBlur in="goo" stdDeviation="9" result="shadow" />
    <feColorMatrix in="shadow" mode="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 8 -.2" result="shadow" />
    <feComposite in2="shadow" in="goo" result="goo" />
    <feComposite in2="goo" in="SourceGraphic" result="mix" />
  `,
  multicolor: `
    <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="3.2" />
    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -7" result="goo" />
    <feComposite in="SourceGraphic" in2="goo" operator="atop" />
  `,
  radial: `
    <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="3.2" />
    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -7" result="goo" />
    <feComposite in="SourceGraphic" in2="goo" operator="atop" />
  `,
}

// --- Style Presets ---
const STYLES: Record<GooeyVariant, Partial<CSSStyleDeclaration>> = {
  standard: { mixBlendMode: 'exclusion', borderRadius: '0px', background: '#5cafc1' },
  blurry: { mixBlendMode: 'overlay', borderRadius: '0px', background: '#47ea82' },
  noise: { mixBlendMode: 'overlay', borderRadius: '0px', background: '#db970b' },
  outline: { mixBlendMode: 'exclusion', borderRadius: '0px', background: '#f3d006' },
  displaced: { mixBlendMode: 'normal', borderRadius: '0px', background: 'rgba(234,91,42,0.8)' },
  shadowed: { mixBlendMode: 'normal', borderRadius: '50%', background: '#c54733' },
  multicolor: { mixBlendMode: 'color-burn', borderRadius: '50%', background: 'transparent' }, // Handled per-cell
  radial: { mixBlendMode: 'overlay', borderRadius: '0px', background: 'radial-gradient(#fddc6d 10%, transparent)' },
}

export function GooeyCursor({
  variant = 'standard',
  columns = 30,
  ttl = 0.2,
  enableClickEffect = true,
  customColors = ['#f8b369', '#64a196', '#db2715', '#ec7a49'],
  className,
}: GooeyCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const container = containerRef.current
    const inner = innerRef.current
    if (!container || !inner) return

    // Firefox Check
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1
    
    // Apply Filter
    if (!isFirefox) {
      inner.style.filter = `url(#gooey-${variant})`
    }

    let cells: HTMLElement[] = []
    let cols = columns
    let rows = 0
    let cellSize = 0

    const layout = () => {
      const winW = window.innerWidth
      const winH = window.innerHeight
      cellSize = winW / cols
      rows = Math.ceil(winH / cellSize)
      const totalCells = rows * cols

      inner.innerHTML = ''
      cells = []

      for (let i = 0; i < totalCells; i++) {
        const div = document.createElement('div')
        div.className = 'absolute opacity-0 transition-none will-change-[opacity]'
        
        // Base styles
        Object.assign(div.style, {
          width: `${cellSize}px`,
          height: `${cellSize}px`,
          backgroundColor: STYLES[variant].background || '#fff',
          borderRadius: STYLES[variant].borderRadius || '0',
        })

        // Multicolor/Radial specifics
        if (variant === 'multicolor') {
          const color = customColors[Math.floor(Math.random() * customColors.length)]
          div.style.backgroundColor = color
          div.style.transform = `scale(${0.5 + Math.random() * 1.5})`
        } else if (variant === 'radial') {
           // Keep default bg from style preset
        }

        inner.appendChild(div)
        cells.push(div)
      }
    }

    const getCellIndex = (x: number, y: number) => {
      const col = Math.floor(x / cellSize)
      const row = Math.floor(y / cellSize)
      if (col < 0 || col >= cols || row < 0 || row >= rows) return -1
      return row * cols + col
    }

    let lastCellIndex = -1

    const handleMove = (e: MouseEvent | PointerEvent) => {
      const idx = getCellIndex(e.clientX, e.clientY)
      if (idx === -1 || idx === lastCellIndex) return
      lastCellIndex = idx

      const cell = cells[idx]
      if (!cell) return

      // Fade In then Out
      cell.animate([
        { opacity: 0 },
        { opacity: 1, offset: 0.1 },
        { opacity: 0 }
      ], {
        duration: ttl * 1000,
        easing: 'ease-out'
      })
    }

    const handleClick = (e: MouseEvent | PointerEvent) => {
      if (!enableClickEffect) return
      
      const centerIdx = getCellIndex(e.clientX, e.clientY)
      if (centerIdx === -1) return

      // Explosion: Staggered animation radiating outwards
      // Simplified: Just pulse neighbors heavily
      const neighbors = [
        centerIdx,
        centerIdx - 1, centerIdx + 1, // Left/Right
        centerIdx - cols, centerIdx + cols, // Up/Down
      ]

      neighbors.forEach((nIdx, i) => {
        const cell = cells[nIdx]
        if (cell) {
          cell.animate([
            { opacity: 0, transform: 'scale(1)' },
            { opacity: 1, transform: 'scale(1.5)', offset: 0.2 },
            { opacity: 0, transform: 'scale(1)' }
          ], {
            duration: 600,
            delay: i * 50,
            easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          })
        }
      })
    }

    layout()
    
    window.addEventListener('resize', layout)
    window.addEventListener('pointermove', handleMove, { passive: true })
    if (enableClickEffect) {
      window.addEventListener('click', handleClick)
    }

    return () => {
      window.removeEventListener('resize', layout)
      window.removeEventListener('pointermove', handleMove)
      if (enableClickEffect) {
        window.removeEventListener('click', handleClick)
      }
    }
  }, [variant, columns, ttl, enableClickEffect, customColors])

  return (
    <>
      {/* Hidden SVG Defs for Filters */}
      <svg className="hidden absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          {Object.entries(FILTERS).map(([key, content]) => (
            <filter key={key} id={`gooey-${key}`} dangerouslySetInnerHTML={{ __html: content }} />
          ))}
        </defs>
      </svg>

      {/* Cursor Container */}
      <div
        ref={containerRef}
        className={cn(
          "fixed inset-0 z-[99] pointer-events-none",
          className
        )}
        style={{
          mixBlendMode: STYLES[variant].mixBlendMode as any,
        }}
      >
        <div
          ref={innerRef}
          className="relative w-full h-full grid"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
          }}
        >
          {/* Cells injected via JS */}
        </div>
      </div>
    </>
  )
}
```

### 3. Registry Update (registry.json)
{
  "name": "gooey-cursor",
  "title": "Gooey Cursor",
  "description": "A grid-based liquid cursor effect with 8 visual variants, SVG filters, and optional click explosions.",
  "tier": "free",
  "dependencies": [],
  "files": [
    {
      "path": "registry/gooey-cursor/gooey-cursor.tsx",
      "target": "components/ui/gooey-cursor.tsx"
    }
  ]
}

### 4. Test Page (app/test-gooey-cursor/page.tsx)
Create a page that cycles through the variants. Since it's a global cursor, we need buttons to switch state.

"use client"

import { useState } from "react"
import { GooeyCursor, type GooeyVariant } from "@/components/ui/gooey-cursor"

const VARIANTS: GooeyVariant[] = ['standard', 'blurry', 'noise', 'outline', 'displaced', 'shadowed', 'multicolor', 'radial']

export default function TestGooeyCursorPage() {
  const [currentVariant, setCurrentVariant] = useState<GooeyVariant>('standard')
  const [clickEnabled, setClickEnabled] = useState(true)

  return (
    <main className="min-h-screen bg-neutral-900 text-white p-8 relative overflow-hidden">
      <GooeyCursor 
        variant={currentVariant} 
        enableClickEffect={clickEnabled}
        columns={40}
      />
      
      <div className="relative z-10 max-w-4xl mx-auto pt-20">
        <h1 className="text-5xl font-bold mb-8">Gooey Cursor Playground</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {VARIANTS.map(v => (
            <button
              key={v}
              onClick={() => setCurrentVariant(v)}
              className={`p-4 rounded-xl border transition-all ${
                currentVariant === v 
                  ? 'bg-white text-black border-white' 
                  : 'bg-transparent border-white/20 hover:border-white/50'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-12">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={clickEnabled} 
              onChange={(e) => setClickEnabled(e.target.checked)}
              className="w-5 h-5 accent-white"
            />
            <span>Enable Click Explosion Effect</span>
          </label>
        </div>

        <div className="space-y-8 text-lg leading-relaxed opacity-80">
          <p>Move your mouse around. Notice how the cells merge together due to the SVG filter.</p>
          <p>Try clicking anywhere to see the explosion effect (if enabled).</p>
          <p>The "Multicolor" variant assigns random colors and scales to each cell upon resize.</p>
        </div>
      </div>
    </main>
  )
}

### 5. Documentation (app/docs/components/gooey-cursor/page.mdx)
Explain the concept: Grid of divs + SVG Filter = Liquid Blob.
Document the 8 variants and their visual differences.
Detail props: variant, columns (density), ttl (trail length), enableClickEffect.
Note: Uses mix-blend-mode, so it works best on solid backgrounds or images.


### 6. Release Workflow
Bump packages/cli/package.json to 0.1.35.
Commit, tag v0.1.35, push.
Provide manual npm publish commands at the end.
Verification Checklist
All 8 variants render correctly with distinct visual styles.
Mouse movement triggers cell opacity changes smoothly.
SVG filters successfully merge adjacent active cells.
Click effect triggers a staggered pulse when enabled.
Resizing window recalculates grid without errors.
No console errors in Firefox (filter gracefully degrades).
Build passes.
