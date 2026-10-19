'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface SpinningTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string // The text to be drawn along the circular path
  duration?: number // Duration of one full rotation in seconds
  direction?: 'clockwise' | 'counter-clockwise'
  centerContent?: React.ReactNode
}

export function SpinningText({
  text,
  duration = 10,
  direction = 'clockwise',
  centerContent = <div className="w-16 h-16 rounded-full bg-dead-950" />,
  className,
  ...props
}: SpinningTextProps) {
  const spinDirection = direction === 'counter-clockwise' ? 'reverse' : 'normal'
  const pathId = React.useId()

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      {...props}
    >
      {/* Rotating SVG Ring */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          animation: `spin ${duration}s linear infinite ${spinDirection}`,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Circular path: center at 50,50 with radius 40 */}
            <path
              id={pathId}
              d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"
            />
          </defs>
          <text className="fill-current text-foreground text-[9px] font-semibold uppercase tracking-[0.2em]">
            <textPath href={`#${pathId}`} startOffset="0%">
              {text}
            </textPath>
          </text>
        </svg>
      </div>

      {/* Static Center Content */}
      <div className="relative z-10 flex items-center justify-center">
        {centerContent}
      </div>
    </div>
  )
}