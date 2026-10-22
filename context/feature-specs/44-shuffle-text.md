# Feature 44: Shuffle Text Component

## Overview
Add a free `ShuffleText` component using the `shuffle-letters` library. It shuffles text characters with customizable speed, direction, and character sets. It must support three distinct animation triggers: `load`, `inView`, and `hover`.

## Goals
1. Create `registry/shuffle-text/shuffle-text.tsx` wrapping the `shuffle-letters` API.
2. Expose triggers: `trigger="load" | "inView" | "hover"`.
3. Expose library options: `iterations`, `revealDirection` ('start' | 'end' | 'center' | 'random'), `characters`, `useOriginalCharsOnly`.
4. Update `registry.json` with `shuffle-letters` dependency.
5. Create test page and MDX docs.
6. Execute 4-step release for `v0.1.21` + manual npm publish instructions.

## Technical Specifications

### 1. Component (`registry/shuffle-text/shuffle-text.tsx`)
```tsx
"use client"

import React, { useRef, useEffect, useState } from "react"
import ShuffleLetters from "shuffle-letters"
import { cn } from "@/lib/utils"

export type ShuffleTrigger = "load" | "inView" | "hover"
export type RevealDirection = "start" | "end" | "center" | "random"

export interface ShuffleTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string
  trigger?: ShuffleTrigger
  iterations?: number
  revealDirection?: RevealDirection
  characters?: string
  useOriginalCharsOnly?: boolean
}

export function ShuffleText({
  text,
  trigger = "load",
  iterations = 10,
  revealDirection = "start",
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()",
  useOriginalCharsOnly = false,
  className,
  ...props
}: ShuffleTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const shuffleRef = useRef<any>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  // Initialize shuffle instance
  useEffect(() => {
    if (!containerRef.current) return
    shuffleRef.current = new ShuffleLetters(containerRef.current, {
      text,
      iterations,
      revealDirection,
      characters,
      useOriginalCharsOnly,
    })
    return () => shuffleRef.current?.destroy()
  }, [text, iterations, revealDirection, characters, useOriginalCharsOnly])

  // Trigger Logic
  useEffect(() => {
    if (trigger === "load") {
      shuffleRef.current?.start()
      setHasAnimated(true)
    }
  }, [trigger])

  useEffect(() => {
    if (trigger !== "inView" || !containerRef.current) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          shuffleRef.current?.start()
          setHasAnimated(true)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [trigger, hasAnimated])

  const handleHover = () => {
    if (trigger === "hover") {
      shuffleRef.current?.start()
    }
  }

  return (
    <span
      ref={containerRef}
      className={cn("inline-block cursor-default", className)}
      onMouseEnter={handleHover}
      {...props}
    >
      {text}
    </span>
  )
} ```


### 2. Registry Update (registry.json)

Add entry with dependency: "shuffle-letters".

### 3. Test & Docs

app/test-shuffle-text/page.tsx: Showcases load, inView (with scroll space), and hover variants.
app/docs/components/shuffle-text/page.mdx: Documents props and trigger behaviors.

### 4. Release Workflow

Bump packages/cli/package.json to 0.1.21.
Commit, tag v0.1.21, push.
Provide manual npm publish commands at the end.