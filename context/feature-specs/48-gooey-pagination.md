# Feature 48: Gooey Pagination Component

## Overview
Add a free `GooeyPagination` component that creates a liquid, morphing pagination effect. The active page is a large circle displaying the number, while inactive pages are small dots. When navigating, the active state smoothly "travels" and stretches across intermediate pages using Framer Motion's `layoutId`, merged together by an SVG gooey filter.

## Goals
1. Create `registry/gooey/gooey-pagination.tsx` using `LayoutGroup` and `layoutId` for the traveling active state.
2. Update `registry.json` with the new component and `motion` dependency.
3. Create a test page `app/test-gooey-pagination/page.tsx` demonstrating the travel effect across 5+ pages.
4. Create the MDX documentation page `app/docs/components/gooey-pagination/page.mdx`.
5. Execute the 4-step Release Workflow for `v0.1.25` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/gooey/gooey-pagination.tsx`)
```tsx
"use client"
import React from "react"
import { motion, LayoutGroup } from "motion/react"
import { cn } from "@/lib/utils"

export interface GooeyPaginationProps {
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  className?: string
}

export function GooeyPagination({
  totalPages,
  currentPage,
  onPageChange,
  className,
}: GooeyPaginationProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Gooey SVG Filter */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id="gooey-filter-pagination">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="gooey" />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* LayoutGroup ensures layoutId animations work smoothly across siblings */}
      <LayoutGroup>
        <div
          className="relative flex items-center gap-4 p-2"
          style={{ filter: "url(#gooey-filter-pagination)" }}
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const isActive = page === currentPage
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className="relative flex items-center justify-center h-12 w-12 outline-none cursor-pointer"
              >
                {/* The traveling active background */}
                {isActive && (
                  <motion.div
                    layoutId="gooey-pagination-active"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                {/* The visual dot / number */}
                <div
                  className={cn(
                    "relative z-10 flex items-center justify-center rounded-full transition-all duration-300",
                    isActive
                      ? "h-12 w-12 text-primary-foreground font-bold text-lg"
                      : "h-4 w-4 bg-primary/50 hover:bg-primary/80"
                  )}
                >
                  {isActive && <span>{page}</span>}
                </div>
              </button>
            )
          })}
        </div>
      </LayoutGroup>
    </div>
  )
}```


### 2. Registry Update (registry.json)
Add entry:

{
  "name": "gooey-pagination",
  "title": "Gooey Pagination",
  "description": "A liquid, morphing pagination component where the active state travels across pages using SVG filters and Framer Motion.",
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
app/test-gooey-pagination/page.tsx: Showcase the pagination with 5 to 7 pages to clearly demonstrate the "traveling" gooey stretch effect when clicking from page 1 to page 5.
app/docs/components/gooey-pagination/page.mdx: Document the props and explain how the layoutId and SVG filter create the liquid effect.

### 4. Release Workflow
Bump packages/cli/package.json to 0.1.25.
Commit, tag v0.1.25, push.
Provide manual npm publish commands at the end.