# Feature 49: Gooey Range Input Component

## Overview
Add a free `GooeyRange` component that creates a liquid, morphing slider effect. As the user drags the thumb, a value bubble smoothly tracks the position and "pops" upward with a gooey connection effect, powered by an SVG filter and React state.

## Goals
1. Create `registry/gooey/gooey-range.tsx` with fully configurable props (`min`, `max`, `step`, `color`, `thumbSize`, `popOffset`).
2. Update `registry.json` with the new component.
3. Create a test page `app/test-gooey-range/page.tsx` demonstrating different colors, sizes, and configurations.
4. Create the MDX documentation page `app/docs/components/gooey-range/page.mdx`.
5. Execute the 4-step Release Workflow for `v0.1.26` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/gooey/gooey-range.tsx`)
```tsx
"use client"
import React, { useState, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"

export interface GooeyRangeProps {
  min?: number
  max?: number
  step?: number
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  color?: string // Tailwind color class for background (e.g., "bg-primary")
  thumbSize?: number
  popOffset?: number // How far the bubble pops up when dragging
  className?: string
}

export function GooeyRange({
  min = 0,
  max = 100,
  step = 1,
  value: controlledValue,
  defaultValue = 50,
  onChange,
  color = "bg-primary",
  thumbSize = 28,
  popOffset = 38,
  className,
}: GooeyRangeProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [isDragging, setIsDragging] = useState(false)
  
  const value = controlledValue !== undefined ? controlledValue : internalValue
  const percentage = ((value - min) / (max - min)) * 100

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value)
      if (controlledValue === undefined) {
        setInternalValue(newValue)
      }
      onChange?.(newValue)
    },
    [controlledValue, onChange]
  )

  const uniqueFilterId = useMemo(() => `gooey-range-${Math.random().toString(36).substr(2, 9)}`, [])

  return (
    <div className={cn("relative w-full select-none", className)}>
      {/* Color-agnostic Gooey SVG Filter */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id={uniqueFilterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div
        className={cn("relative w-full h-10 rounded-full", color)}
        style={{ filter: `url(#${uniqueFilterId})` }}
      >
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          onPointerLeave={() => setIsDragging(false)}
          className="w-full h-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[28px] [&::-webkit-slider-thumb]:w-[28px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white/30 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-[28px] [&::-moz-range-thumb]:w-[28px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white/30 [&::-moz-range-thumb]:border-0"
          style={{ 
            ['--thumb-size' as string]: `${thumbSize}px` 
          }}
        />
        
        {/* Value Bubble */}
        <div
          className={cn(
            "absolute flex items-center justify-center rounded-full bg-white font-bold text-sm pointer-events-none transition-all duration-300 ease-out",
            isDragging ? "shadow-[0_0_0_8px_var(--tw-shadow-color)]" : "shadow-[0_0_0_4px_var(--tw-shadow-color)]"
          )}
          style={
            {
              width: `${thumbSize}px`,
              height: `${thumbSize}px`,
              lineHeight: `${thumbSize}px`,
              top: isDragging ? `-${popOffset}px` : "6px",
              left: `calc(${percentage}% - ${thumbSize / 2}px)`,
              ['--tw-shadow-color' as string]: 'currentColor', // Inherits from parent color class
            } as React.CSSProperties
          }
        >
          <span className={cn("text-xs", isDragging ? "text-foreground" : "text-foreground/70")}>
            {Math.round(value * 10) / 10}
          </span>
        </div>
      </div>
    </div>
  )
}```

### 2. Registry Update (registry.json)
Add entry:

{
  "name": "gooey-range",
  "title": "Gooey Range",
  "description": "A liquid, morphing range slider with a pop-up value bubble, powered by SVG filters.",
  "tier": "free",
  "dependencies": [],
  "files": [
    {
      "path": "registry/gooey/gooey-range.tsx",
      "target": "components/ui/gooey-range.tsx"
    }
  ]
}

### 3. Test Page & Documentation
app/test-gooey-range/page.tsx: Showcase the range input with default settings, custom colors (e.g., bg-blue-500, bg-emerald-500), different thumbSize, and different popOffset values.
app/docs/components/gooey-range/page.mdx: Document all props and explain the controlled vs. uncontrolled usage.

### 4. Release Workflow
Bump packages/cli/package.json to 0.1.26.
Commit, tag v0.1.26, push.
Provide manual npm publish commands at the end