'use client'

import React, { type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface RippleStyleVars extends CSSProperties {
  '--fill-color': string
}

export interface RippleProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  mainCircleSize?: number
  mainCircleOpacity?: number
  numCircles?: number
  color?: string
  fillColor?: string
}

export function Ripple({
  children,
  mainCircleSize = 100,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  color = 'var(--dead-accent, #ef4444)',
  fillColor,
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
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{ '--fill-color': fillColor ?? color } as RippleStyleVars}
      >
        {Array.from({ length: numCircles }, (_, i) => {
          const size = mainCircleSize + i * 40
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
                  backgroundColor: 'var(--fill-color)',
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