# Feature 48: Gooey Pagination Component

## Overview
Add a free `GooeyPagination` component that creates a liquid, morphing pagination effect using the exact same technique as the Aceternity Gooey Input: Framer Motion's `layoutId` combined with an SVG gooey filter. When the user clicks from one page to another, the active background smoothly stretches and morphs through ALL intermediate circles, creating a continuous liquid connection.

## Goals
1. Create `registry/gooey/gooey-pagination.tsx` using `layoutId` for the traveling active state.
2. Update `registry.json` with the new component and `motion` dependency.
3. Create a test page `app/test-gooey-pagination/page.tsx` demonstrating the travel effect across 5+ pages.
4. Create the MDX documentation page `app/docs/components/gooey-pagination/page.mdx`.
5. Execute the 4-step Release Workflow for `v0.1.25` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/gooey/gooey-pagination.tsx`)
```tsx
"use client"
import React, { useId, useMemo, useCallback } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

function GooeyFilter({ filterId, blur }: { filterId: string; blur: number }) {
  return (
    <svg className="absolute hidden h-0 w-0" aria-hidden>
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  )
}

export interface GooeyPaginationProps {
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  className?: string
  activeSize?: number
  inactiveSize?: number
  gap?: number
  gooeyBlur?: number
}

export function GooeyPagination({
  totalPages,
  currentPage,
  onPageChange,
  className,
  activeSize = 48,
  inactiveSize = 16,
  gap = 16,
  gooeyBlur = 8,
}: GooeyPaginationProps) {
  const reactId = useId()
  const safeId = reactId.replace(/:/g, "")
  const filterId = `gooey-pagination-filter-${safeId}`
  const activeLayoutId = `gooey-pagination-active-${safeId}`

  const transition = useMemo(
    () => ({
      duration: 0.5,
      type: "spring" as const,
      bounce: 0.3,
    }),
    []
  )

  const handlePageClick = useCallback(
    (page: number) => {
      if (page !== currentPage) {
        onPageChange(page)
      }
    },
    [currentPage, onPageChange]
  )

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <GooeyFilter filterId={filterId} blur={gooeyBlur} />
      
      <div
        className="relative flex items-center"
        style={{ filter: `url(#${filterId})`, gap: `${gap}px` }}
      >
        {pages.map((page) => {
          const isActive = page === currentPage
          const size = isActive ? activeSize : inactiveSize

          return (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className="relative flex items-center justify-center outline-none cursor-pointer"
              style={{ width: activeSize, height: activeSize }}
            >
              {/* The traveling active background with layoutId */}
              {isActive && (
                <motion.div
                  layoutId={activeLayoutId}
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={transition}
                  style={{
                    width: activeSize,
                    height: activeSize,
                  }}
                />
              )}

              {/* The visual circle / number */}
              <motion.div
                className={cn(
                  "relative z-10 flex items-center justify-center rounded-full bg-primary transition-all",
                  isActive
                    ? "text-primary-foreground font-bold"
                    : "text-primary-foreground/70 hover:bg-primary/80"
                )}
                animate={{
                  width: size,
                  height: size,
                }}
                transition={transition}
              >
                {isActive && <span className="text-lg">{page}</span>}
              </motion.div>
            </button>
          )
        })}
      </div>
    </div>
  )
}```

2. Registry Update (registry.json)
Add entry:

{
  "name": "gooey-pagination",
  "title": "Gooey Pagination",
  "description": "A liquid, morphing pagination component where the active state travels across pages using SVG filters and Framer Motion layoutId.",
  "tier": "free",
  "dependencies": ["motion"],
  "files": [
    {
      "path": "registry/gooey/gooey-pagination.tsx",
      "target": "components/ui/gooey-pagination.tsx"
    }
  ]
}

### 3. Test Page & Documentation
app/test-gooey-pagination/page.tsx: Showcase the pagination with 6 pages. Include a state to track currentPage and demonstrate clicking from page 1 to page 6 to show the gooey stretch effect across all intermediate dots.
app/docs/components/gooey-pagination/page.mdx: Document the props (totalPages, currentPage, onPageChange, activeSize, inactiveSize, gap, gooeyBlur) and explain how the layoutId and SVG filter create the liquid effect.

### 4. Release Workflow
Bump packages/cli/package.json to 0.1.25.
Commit, tag v0.1.25, push.
Provide manual npm publish commands at the end.