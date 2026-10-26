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
  color?: string // Override cell background color (ignored for multicolor)
  mixBlendMode?: string // Override blend mode
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
  shadowed: { mixBlendMode: 'none', borderRadius: '50%', background: '#c54733' },
  multicolor: { mixBlendMode: 'normal', borderRadius: '50%', background: '#fff' },
  radial: { mixBlendMode: 'overlay', borderRadius: '0px', background: 'radial-gradient(#fddc6d 10%, transparent)' },
}

export function GooeyCursor({
  variant = 'standard',
  columns = 30,
  ttl = 0.2,
  enableClickEffect = true,
  customColors = ['#f8b369', '#64a196', '#db2715', '#ec7a49'],
  color,
  mixBlendMode,
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
        const colIndex = i % cols
        const rowIndex = Math.floor(i / cols)
        // Override color if provided (skip for multicolor which uses customColors)
        const cellBackground = (color && variant !== 'multicolor') ? color : (STYLES[variant].background || '#fff')
        Object.assign(div.style, {
          position: 'absolute',
          left: `${colIndex * cellSize}px`,
          top: `${rowIndex * cellSize}px`,
          width: `${cellSize}px`,
          height: `${cellSize}px`,
          background: cellBackground,
          borderRadius: STYLES[variant].borderRadius || '0',
        })

        // Multicolor/Radial specifics
        if (variant === 'multicolor') {
          const color = customColors[Math.floor(Math.random() * customColors.length)]
          div.style.backgroundColor = color
          div.style.transform = `scale(${0.5 + Math.random() * 1.5})`
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

      // Fade In then Out using Web Animations API (no GSAP)
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
      const centerCol = centerIdx % cols
      const centerRow = Math.floor(centerIdx / cols)

      // Ripple wave: animate all cells sorted by distance from click point
      const indexedCells = cells.map((cell, idx) => {
        const col = idx % cols
        const row = Math.floor(idx / cols)
        const dx = col - centerCol
        const dy = row - centerRow
        const dist = Math.sqrt(dx * dx + dy * dy)
        return { cell, idx, dist }
      })

      // Sort by distance for outward wave effect
      indexedCells.sort((a, b) => a.dist - b.dist)

      indexedCells.forEach(({ cell, idx, dist }) => {
        if (!cell) return
        const maxDist = Math.sqrt(cols * cols + rows * rows)
        const normalizedDist = maxDist > 0 ? dist / maxDist : 0
        cell.animate([
          { opacity: 0, transform: 'scale(1)' },
          { opacity: 1, transform: 'scale(1.8)', offset: 0.15 },
          { opacity: 0, transform: 'scale(1.2)' }
        ], {
          duration: 900,
          delay: normalizedDist * 400, // Wave delay based on distance
          easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        })
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
      <svg className="hidden absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          {Object.entries(FILTERS).map(([key, content]) => (
            <filter key={key} id={`gooey-${key}`} dangerouslySetInnerHTML={{ __html: content }} />
          ))}
        </defs>
      </svg>

      <div
        ref={containerRef}
        className={cn(
          "fixed inset-0 z-[99] pointer-events-none",
          className
        )}
        style={{
          mixBlendMode: (mixBlendMode || STYLES[variant].mixBlendMode) as any,
        }}
      >
        <div
          ref={innerRef}
          className="relative w-full h-full grid"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
          }}
        />
      </div>
    </>
  )
}
