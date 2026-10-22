# Feature 47: Gooey Search Input Component

## Overview
Add a free `GooeySearch` component that creates a liquid, morphing expansion effect for a search input. When clicked, the search icon detaches and moves in a configurable direction while the input expands in the opposite direction, connected by a gooey SVG filter.

## Goals
1. Create `registry/gooey/gooey-search.tsx` with configurable `direction` ('left', 'right', 'top', 'bottom').
2. Update `registry.json` with the new component and `motion` / `lucide-react` dependencies.
3. Create a test page `app/test-gooey-search/page.tsx` showcasing all directional variants.
4. Create the MDX documentation page `app/docs/components/gooey-search/page.mdx`.
5. Execute the 4-step Release Workflow for `v0.1.24` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/gooey/gooey-search.tsx`)
```tsx
"use client"
import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type GooeySearchDirection = "left" | "right" | "top" | "bottom"

export interface GooeySearchProps {
  direction?: GooeySearchDirection
  placeholder?: string
  className?: string
  onSearch?: (value: string) => void
}

export function GooeySearch({ 
  direction = "right", 
  placeholder = "Search...", 
  className,
  onSearch 
}: GooeySearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState("")

  const distance = 220

  const getIconTransform = () => {
    switch (direction) {
      case "left": return { x: -distance, y: 0 }
      case "right": return { x: distance, y: 0 }
      case "top": return { x: 0, y: -distance }
      case "bottom": return { x: 0, y: distance }
      default: return { x: distance, y: 0 }
    }
  }

  const getInputStyle = () => {
    // Input expands in the opposite direction of the icon
    const base = { position: "absolute" as const, height: "3.5rem", width: "14rem" }
    switch (direction) {
      case "left": return { ...base, left: "3.5rem", top: 0 }
      case "right": return { ...base, right: "3.5rem", top: 0 }
      case "top": return { ...base, top: "3.5rem", left: "50%", transform: "translateX(-50%)" }
      case "bottom": return { ...base, bottom: "3.5rem", left: "50%", transform: "translateX(-50%)" }
      default: return { ...base, right: "3.5rem", top: 0 }
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setValue("")
  }

  return (
    <div className={cn("relative flex items-center justify-center h-14 w-14", className)}>
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id="gooey-filter-search">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="gooey" />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="relative h-full w-full" style={{ filter: "url(#gooey-filter-search)" }}>
        {/* The Input */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={getInputStyle()}
          className="origin-center"
        >
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            onBlur={() => { if (!value) handleClose() }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onSearch) onSearch(value)
              if (e.key === "Escape") handleClose()
            }}
            className="h-full w-full rounded-full bg-primary text-primary-foreground px-6 text-sm outline-none placeholder:text-primary-foreground/50"
            autoFocus={isOpen}
          />
        </motion.div>

        {/* The Icon Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute top-0 left-0 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
          animate={isOpen ? getIconTransform() : { x: 0, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                key="search"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  )
}```

### 2. Registry Update (registry.json)
Add entry:
{
  "name": "gooey-search",
  "title": "Gooey Search",
  "description": "An expandable search input with a liquid, morphing gooey effect using SVG filters and Framer Motion.",
  "tier": "free",
  "dependencies": ["motion", "lucide-react"],
  "files": [
    {
      "path": "registry/gooey/gooey-search.tsx",
      "target": "components/ui/gooey-search.tsx"
    }
  ]
}