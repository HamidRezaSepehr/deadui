'use client'

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { cn } from '@/lib/utils'

function findScrollableParent(el: HTMLElement | null): HTMLElement | Window {
  let current = el?.parentElement ?? null
  while (current) {
    if (current === document.body || current === document.documentElement) {
      return window
    }
    const { overflowY, overflow } = getComputedStyle(current)
    if (/(auto|scroll)/.test(overflowY + overflow) && current.scrollHeight > current.clientHeight) {
      return current
    }
    current = current.parentElement
  }
  return window
}

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
  const [position, setPosition] = useState<'fixed' | 'sticky'>('fixed')
  const rootRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLElement | Window | null>(null)

  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const container = findScrollableParent(el)
    scrollContainerRef.current = container
    if (container !== window) setPosition('sticky')
  }, [])

  useEffect(() => {
    let rafId: number

    const getScrollProgress = () => {
      const container = scrollContainerRef.current
      if (container instanceof HTMLElement) {
        const { scrollTop, scrollHeight, clientHeight } = container
        const maxScroll = scrollHeight - clientHeight
        return maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0
      }
      if (typeof window !== 'undefined') {
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
        return scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
      }
      return 0
    }

    const updateProgress = () => {
      setProgress(getScrollProgress())
      rafId = requestAnimationFrame(updateProgress)
    }

    rafId = requestAnimationFrame(updateProgress)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const isCustomColor = color !== 'default' && color !== 'gradient'

  if (variant === 'horizontal') {
    const bgClass = isCustomColor ? '' : color === 'gradient'
      ? 'bg-gradient-to-r from-red-500 to-yellow-500'
      : 'bg-white'

    return (
      <div
        ref={rootRef}
        className={cn(`${position} top-0 left-0 w-full h-1 z-50`, className)}
        {...props}
      >
        <div
          className={cn('h-full', bgClass)}
          style={
            isCustomColor
              ? { width: `${progress}%`, backgroundColor: color }
              : { width: `${progress}%` }
          }
        />
      </div>
    )
  }

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  let circleStrokeValue = color
  let circleColorClass = ''
  if (color === 'gradient') {
    circleStrokeValue = 'url(#gradient)'
  } else if (color === 'default') {
    circleStrokeValue = 'currentColor'
    circleColorClass = 'text-white'
  }

  return (
    <div
      ref={rootRef}
      className={cn(`${position} z-50 flex items-center justify-center`, className)}
      style={{ top: '1rem', right: '1rem' }}
      {...props}
    >
      <svg width={size} height={size} className="-rotate-90">
        {color === 'gradient' && (
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#eab308" />
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
          className="text-white/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={circleStrokeValue}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={circleColorClass}
        />
      </svg>
      {showPercentage && (
        <span className="absolute text-[10px] font-medium text-white">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  )
}