# Feature 34: Scroll Progress Indicator

## Overview

Add a new free component, `ScrollProgress`, which visually indicates the user's scroll position on the page (from 0% at the top to 100% at the bottom). It provides two main variants: a horizontal bar (ideal for fixed top navbars) and a circular indicator (ideal for fixed top-left or top-right corners), both fully customizable with optional percentage text.

## Goals

1. Create `registry/scroll-progress/scroll-progress.tsx` with a high-performance scroll listener (using `requestAnimationFrame`).
2. Support two main variants: `horizontal` (solid or gradient) and `circular`.
3. Allow toggling of the percentage text display (`showPercentage`).
4. Create a comprehensive test page `app/test-scroll-progress/page.tsx` with a long scrollable area to demonstrate the component in action.
5. Create the MDX documentation page `app/docs/components/scroll-progress/page.mdx`.
6. Execute the 4-step Release Workflow for `v0.1.11` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/scroll-progress/scroll-progress.tsx`)
```tsx
'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface ScrollProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'horizontal' | 'circular'
  color?: 'default' | 'gradient' | string // 'default' = dead-accent, 'gradient' = dead-accent to dead-border, or custom hex/tailwind class
  showPercentage?: boolean
  size?: number // For circular variant: diameter in pixels (default: 48)
  strokeWidth?: number // For circular variant (default: 4)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Horizontal Variant ---
  if (variant === 'horizontal') {
    const bgClass = color === 'gradient' 
      ? 'bg-gradient-to-r from-dead-accent to-dead-border' 
      : color === 'default' 
        ? 'bg-dead-accent' 
        : color // custom class or hex

    return (
      <div className={cn('fixed top-0 left-0 w-full h-1 z-50', className)} {...props}>
        <div 
          className={cn('h-full transition-all duration-75 ease-out', bgClass)}
          style={{ width: `${progress}%` }}
        />
      </div>
    )
  }

  // --- Circular Variant ---
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const circleColor = color === 'gradient' ? 'url(#gradient)' : color === 'default' ? 'text-dead-accent' : color

  return (
    <div 
      className={cn('fixed z-50 flex items-center justify-center', className)}
      style={{ top: '1rem', right: '1rem' }} // Default top-right, can be overridden via className
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
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-dead-border/30"
        />
        {/* Progress Circle */}
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
```

### 2. Test Page (`app/test-scroll-progress/page.tsx`)
Create a page with a very tall container (e.g., `h-[300vh]`) to allow scrolling. Include:
1. **Horizontal Default**: Fixed at the top.
2. **Horizontal Gradient**: Fixed at the top, slightly thicker (`h-2`).
3. **Circular Default**: Fixed top-right, no percentage.
4. **Circular with Percentage**: Fixed top-left, showing the `%` text.
5. **Circular Gradient**: Fixed bottom-right, larger size.

### 3. Documentation (`app/docs/components/scroll-progress/page.mdx`)
- Explain the `variant`, `color`, `showPercentage`, `size`, and `strokeWidth` props.
- Provide clear code snippets for both horizontal (navbar integration) and circular (corner floating) use cases.
- Note that the component uses `requestAnimationFrame` for buttery-smooth 60fps performance without layout thrashing.

### 4. The 4-Step Release Workflow & Manual Publish
Execute the git workflow for `v0.1.11`, and **CRITICALLY**, provide the manual npm publish commands at the end of your response.

## Implementation Steps

1. Create `registry/scroll-progress/scroll-progress.tsx`.
2. Update `registry.json` to include the new component.
3. Create `app/test-scroll-progress/page.tsx` with a tall scrollable area.
4. Create `app/docs/components/scroll-progress/page.mdx`.
5. Bump `packages/cli/package.json` version to `0.1.11`.
6. Execute git commands: `add`, `commit`, `push`, `tag v0.1.11`, `push tag`.
7. Output GitHub Release UI instructions.
8. **Output the exact manual terminal commands to publish to npm.**
9. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] `ScrollProgress` accurately reflects 0% at the top and 100% at the bottom.
- [ ] Horizontal variant scales width smoothly.
- [ ] Circular variant calculates `strokeDashoffset` correctly and rotates smoothly.
- [ ] `showPercentage` renders cleanly centered inside the circular variant.
- [ ] Test page allows easy visual verification of all variations.
- [ ] Git tag `v0.1.11` is pushed.
- [ ] Manual npm publish instructions are clearly provided at the end.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `registry/scroll-progress/scroll-progress.tsx` (New)
2. `registry.json` (Update)
3. `app/test-scroll-progress/page.tsx` (New)
4. `app/docs/components/scroll-progress/page.mdx` (New)
5. `packages/cli/package.json` (Update version to 0.1.11)
6. `context/progress-tracker.md` (Update)