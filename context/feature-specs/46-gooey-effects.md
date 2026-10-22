# Feature 46: Gooey Menu Component

## Overview
Add a free `GooeyMenu` component that creates a liquid, morphing expansion effect using SVG filters (`feGaussianBlur` + `feColorMatrix`) combined with Framer Motion spring physics. It supports 5 distinct expansion directions.

## Goals
1. Create `registry/gooey/gooey-menu.tsx` with configurable `direction` ('top', 'bottom', 'left', 'right', 'radial').
2. Update `registry.json` with the new component and `motion` dependency.
3. Create a test page `app/test-gooey-menu/page.tsx` showcasing all directional variants.
4. Create the MDX documentation page `app/docs/components/gooey-menu/page.mdx`.
5. Execute the 4-step Release Workflow for `v0.1.23` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/gooey/gooey-menu.tsx`)
```tsx
"use client"
import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type GooeyDirection = "top" | "bottom" | "left" | "right" | "radial"
export interface GooeyMenuItem { 
  icon: React.ReactNode
  href?: string
  onClick?: () => void
  label?: string 
}

export interface GooeyMenuProps {
  items: GooeyMenuItem[]
  direction?: GooeyDirection
  mainIcon?: React.ReactNode
  className?: string
}

export function GooeyMenu({ 
  items, 
  direction = "top", 
  mainIcon = <Plus className="h-6 w-6" />, 
  className 
}: GooeyMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getItemStyle = (index: number, total: number) => {
    const distance = 80
    if (direction === "top") return { y: -(index + 1) * distance, x: 0 }
    if (direction === "bottom") return { y: (index + 1) * distance, x: 0 }
    if (direction === "left") return { x: -(index + 1) * distance, y: 0 }
    if (direction === "right") return { x: (index + 1) * distance, y: 0 }
    if (direction === "radial") {
      const angle = (index / total) * 2 * Math.PI - Math.PI / 2
      return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance }
    }
    return { x: 0, y: 0 }
  }

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Gooey SVG Filter */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id="gooey-filter-menu">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="gooey" />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Menu Container */}
      <div className="relative" style={{ filter: "url(#gooey-filter-menu)" }}>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {isOpen ? <X className="h-6 w-6" /> : mainIcon}
        </motion.button>

        <AnimatePresence>
          {isOpen && items.map((item, index) => {
            const style = getItemStyle(index, items.length)
            return (
              <motion.a
                key={index}
                href={item.href}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault()
                    item.onClick()
                  }
                }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{ x: style.x, y: style.y, opacity: 1, scale: 1 }}
                exit={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.05 }}
                className="absolute top-0 left-0 z-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md cursor-pointer"
                title={item.label}
              >
                {item.icon}
              </motion.a>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
} ```

### 2. Registry Update (registry.json)
Add entry:

{
  "name": "gooey-menu",
  "title": "Gooey Menu",
  "description": "An expandable menu with a liquid, morphing gooey effect using SVG filters and Framer Motion.",
  "tier": "free",
  "dependencies": ["motion", "lucide-react"],
  "files": [
    {
      "path": "registry/gooey/gooey-menu.tsx",
      "target": "components/ui/gooey-menu.tsx"
    }
  ]
}

### 3. Test Page & Documentation
app/test-gooey-menu/page.tsx: Showcase the menu in all 5 directions (top, bottom, left, right, radial) with 3-4 items each.
app/docs/components/gooey-menu/page.mdx: Document the direction prop, items array structure, and the underlying SVG filter mechanism.
### 4. Release Workflow
Bump packages/cli/package.json to 0.1.23.
Commit, tag v0.1.23, push.
Provide manual npm publish commands at the end.