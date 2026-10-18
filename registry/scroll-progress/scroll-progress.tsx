'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface ScrollProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'horizontal' | 'circular'
  color?: 'default' | 'gradient' | string
  showPercentage?: boolean
  size?: number
  strokeWidth?: number
}

export function ScrollProgress({
  variant = 'horizontal',
  color = 'default',
  showPercentage = false,
  size = 48,
  strokeWidth = 4,
  className,
  ...props
}: ScrollProgressProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let rafId: number

    const updateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const calculatedProgress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
      setProgress(calculatedProgress)
      rafId = requestAnimationFrame(updateProgress)
    }

    rafId = requestAnimationFrame(updateProgress)
    return () => cancelAnimationFrame(rafId)
  }, [])

  if (variant === 'horizontal') {
    const bgClass = color === 'gradient'
      ? 'bg-gradient-to-r from-dead-accent to-dead-border'
      : color === 'default'
        ? 'bg-dead-accent'
        : color

    return (
      <div className={cn('fixed top-0 left-0 w-full h-1 z-50', className)} {...props}>
        <div
          className={cn('h-full transition-all duration-75 ease-out', bgClass)}
          style={{ width: `${progress}%` }}
        />
      </div>
    )
  }

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const circleColor = color === 'gradient' ? 'url(#gradient)' : color === 'default' ? 'text-dead-accent' : color

  return (
    <div
      className={cn('fixed z-50 flex items-center justify-center', className)}
      style={{ top: '1rem', right: '1rem' }}
      {...props}
    >
      <svg width={size} height={size} className="-rotate-90">
        {color === 'gradient' && (
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--dead-accent)" />
              <stop offset="100%" stopColor="var(--dead-border)" />
            </linearGradient>
          </defs>
        )}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-dead-border/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={circleColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-75 ease-out"
        />
      </svg>
      {showPercentage && (
        <span className="absolute text-[10px] font-medium text-dead-muted">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  )
}