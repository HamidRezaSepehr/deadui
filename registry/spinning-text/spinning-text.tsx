'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface SpinningTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode[]
  radius?: number
  duration?: number
  direction?: 'clockwise' | 'counter-clockwise'
  centerContent?: React.ReactNode
}

export function SpinningText({
  children,
  radius = 120,
  duration = 10,
  direction = 'clockwise',
  centerContent = <div className="w-16 h-16 rounded-full bg-dead-black" />,
  className,
  ...props
}: SpinningTextProps) {
  const totalItems = React.Children.count(children)
  const angleStep = 360 / totalItems
  const spinDirection = direction === 'counter-clockwise' ? 'reverse' : 'normal'

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      style={{
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
      }}
      {...props}
    >
      <div
        className="absolute inset-0"
        style={{
          animation: `spin ${duration}s linear infinite ${spinDirection}`,
        }}
      >
        {React.Children.map(children, (child, index) => {
          if (child === null || child === undefined) return null
          return (
            <div
              key={index}
              className="absolute top-0 left-1/2 -translate-x-1/2 whitespace-nowrap"
              style={{
                transformOrigin: `center ${radius}px`,
                transform: `rotate(${index * angleStep}deg)`,
              }}
            >
              {child}
            </div>
          )
        })}
      </div>

      <div className="relative z-10 flex items-center justify-center">
        {centerContent}
      </div>
    </div>
  )
}