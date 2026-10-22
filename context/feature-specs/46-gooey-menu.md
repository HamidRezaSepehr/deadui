# Feature 46: Gooey Effects (Menu & Pagination)

## Overview
Add free `GooeyMenu` and `GooeyPagination` components using SVG filters (`feGaussianBlur` + `feColorMatrix`) combined with Framer Motion. This creates a liquid, morphing connection effect between elements.

## Goals
1. Create `registry/gooey/gooey-menu.tsx` with configurable `direction` ('top', 'bottom', 'left', 'right', 'radial').
2. Create `registry/gooey/gooey-pagination.tsx` where the active state smoothly "travels" between pages using Framer Motion `layoutId`, creating a gooey stretch effect.
3. Update `registry.json` (dependency: `motion`).
4. Create test page and MDX docs.
5. Execute 4-step release for `v0.1.23` + manual npm publish instructions.

## Technical Specifications

### 1. Gooey Menu (`registry/gooey/gooey-menu.tsx`)
```tsx
"use client"
import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

export type GooeyDirection = "top" | "bottom" | "left" | "right" | "radial"
export interface GooeyMenuItem { icon: React.ReactNode; href?: string; onClick?: () => void; label?: string }

export interface GooeyMenuProps {
  items: GooeyMenuItem[]
  direction?: GooeyDirection
  mainIcon?: React.ReactNode
  className?: string
}

export function GooeyMenu({ items, direction = "top", mainIcon = <span>+</span>, className }: GooeyMenuProps) {
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
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id="gooey-filter-menu">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="gooey" />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="relative" style={{ filter: "url(#gooey-filter-menu)" }}>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
          animate={{ rotate: isOpen ? 135 : 0 }}
        >
          {mainIcon}
        </motion.button>

        <AnimatePresence>
          {isOpen && items.map((item, index) => {
            const style = getItemStyle(index, items.length)
            return (
              <motion.a
                key={index}
                href={item.href}
                onClick={item.onClick}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{ x: style.x, y: style.y, opacity: 1, scale: 1 }}
                exit={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: index * 0.05 }}
                className="absolute top-0 left-0 z-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
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
}```

### 2. Gooey Pagination (registry/gooey/gooey-pagination.tsx)
``` tsx
"use client"
import React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

export interface GooeyPaginationProps {
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  className?: string
}

export function GooeyPagination({ totalPages, currentPage, onPageChange, className }: GooeyPaginationProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id="gooey-filter-pagination">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="gooey" />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="relative flex gap-2 p-2" style={{ filter: "url(#gooey-filter-pagination)" }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          const isActive = page === currentPage
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors",
                isActive ? "text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="gooey-active-page"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{page}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}```

(Note: The layoutId prop on the active indicator is the secret to making the active state "travel" and stretch across intermediate circles with a liquid gooey effect, exactly as requested).
### 3. Registry, Test & Docs
Update registry.json with both components and motion dependency.
app/test-gooey-effects/page.tsx: Showcase menu in all 5 directions + pagination with 5+ pages to demonstrate the traveling active state.
app/docs/components/gooey-effects/page.mdx: Document both components.
### 4. Release Workflow
Bump packages/cli/package.json to 0.1.23.
Commit, tag v0.1.23, push.
Provide manual npm publish commands at the end.