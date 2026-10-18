'use client'

import React, { type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

/** For the default accent color fallback (#ef4444), used in background fill. */
const DEFAULT_BG_ALPHA = 'rgba(239, 68, 68, 0.1)'

/**
 * Converts any CSS color string to an rgba() with the given alpha.
 * Falls back to a hardcoded rgba when it cannot parse the input.
 */
function toRgba(color: string, alpha: number): string {
  const normalized = color.trim()

  if (normalized.startsWith('var(--dead-accent') || normalized.startsWith('#')) {
    return DEFAULT_BG_ALPHA
  }

  if (normalized.startsWith('#')) {
    const hex = normalized.slice(1)
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16)
      const g = parseInt(hex[1] + hex[1], 16)
      const b = parseInt(hex[2] + hex[2], 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
  }

  if (normalized.startsWith('rgb(')) {
    return normalized.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`)
  }

  if (normalized.startsWith('hsl(')) {
    return normalized.replace('hsl(', 'hsla(').replace(')', `, ${alpha})`)
  }

  return DEFAULT_BG_ALPHA
}

export interface RippleProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  mainCircleSize?: number
  mainCircleOpacity?: number
  numCircles?: number
  color?: string
}

export function Ripple({
  children,
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  color = 'var(--dead-accent, #ef4444)',
  className,
  ...props
}: RippleProps) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden',
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 pointer-events-none select-none">
        {Array.from({ length: numCircles }, (_, i) => {
          const size = mainCircleSize + i * 70
          const opacity = Math.max(0, mainCircleOpacity - i * 0.03)
          const animationDelay = `${i * 0.06}s`

          return (
            <div
              key={i}
              className="absolute rounded-full border shadow-xl animate-ripple"
              style={
                {
                  width: `${size}px`,
                  height: `${size}px`,
                  opacity,
                  animationDelay,
                  borderWidth: '1px',
                  borderColor: color,
                  backgroundColor: toRgba(color, 0.1),
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) scale(1)',
                  '--initial-opacity': opacity,
                } as CSSProperties
              }
            />
          )
        })}
      </div>

      <div className="relative z-10 flex items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
}