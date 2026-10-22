# Feature 45: Morphing Text Component

## Overview
Add a free `MorphingText` component that creates a smooth, liquid-like text morphing effect using SVG filters and `requestAnimationFrame`. It is fully configurable, allowing control over timing, blur, and the SVG threshold.

## Goals
1. Create `registry/morphing-text/morphing-text.tsx` based on the provided reference, exposing `morphTime`, `cooldownTime`, `filterBlur`, and `threshold` as props.
2. Update `registry.json` (no external dependencies required).
3. Create test page and MDX docs.
4. Execute 4-step release for `v0.1.22` + manual npm publish instructions.

## Technical Specifications

### 1. Component (`registry/morphing-text/morphing-text.tsx`)
```tsx
"use client"
import { useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export interface MorphingTextProps {
  texts: string[]
  morphTime?: number
  cooldownTime?: number
  className?: string
  filterBlur?: string
  threshold?: number
}

export function MorphingText({
  texts,
  morphTime = 1.5,
  cooldownTime = 0.5,
  className,
  filterBlur = "0.6px",
  threshold = -140,
}: MorphingTextProps) {
  const textIndexRef = useRef(0)
  const morphRef = useRef(0)
  const cooldownRef = useRef(0)
  const timeRef = useRef(new Date())
  const text1Ref = useRef<HTMLSpanElement>(null)
  const text2Ref = useRef<HTMLSpanElement>(null)

  const setStyles = useCallback(
    (fraction: number) => {
      const [current1, current2] = [text1Ref.current, text2Ref.current]
      if (!current1 || !current2) return

      current2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`
      current2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`
      
      const invertedFraction = 1 - fraction
      current1.style.filter = `blur(${Math.min(8 / invertedFraction - 8, 100)}px)`
      current1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`
      
      current1.textContent = texts[textIndexRef.current % texts.length]
      current2.textContent = texts[(textIndexRef.current + 1) % texts.length]
    },
    [texts]
  )

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current
    cooldownRef.current = 0
    let fraction = morphRef.current / morphTime

    if (fraction > 1) {
      cooldownRef.current = cooldownTime
      fraction = 1
    }
    setStyles(fraction)
    if (fraction === 1) textIndexRef.current++
  }, [morphTime, cooldownTime, setStyles])

  const doCooldown = useCallback(() => {
    morphRef.current = 0
    const [current1, current2] = [text1Ref.current, text2Ref.current]
    if (current1 && current2) {
      current2.style.filter = "none"
      current2.style.opacity = "100%"
      current1.style.filter = "none"
      current1.style.opacity = "0%"
    }
  }, [])

  useEffect(() => {
    let animationFrameId: number
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const newTime = new Date()
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000
      timeRef.current = newTime
      
      cooldownRef.current -= dt
      if (cooldownRef.current <= 0) doMorph()
      else doCooldown()
    }
    animate()
    return () => cancelAnimationFrame(animationFrameId)
  }, [doMorph, doCooldown])

  return (
    <div className={cn("relative mx-auto h-16 w-full max-w-3xl text-center font-sans text-[40pt] leading-none font-bold md:h-24 lg:text-[6rem]", className)}>
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text1Ref}
      />
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text2Ref}
      />
      <svg id="filters" className="fixed h-0 w-0" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values={`1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 ${threshold}`}
            />
          </filter>
        </defs>
      </svg>
      <style>{`
        .relative.mx-auto {
          filter: url(#threshold) blur(${filterBlur});
        }
      `}</style>
    </div>
  )
}```

### 2. Registry Update (registry.json)
Add entry (no external dependencies).
### 3. Test & Docs
app/test-morphing-text/page.tsx: Showcases default, fast morphing, slow morphing, and custom threshold/blur variants.
app/docs/components/morphing-text/page.mdx: Documents props and the SVG filter mechanism.
### 4. Release Workflow
Bump packages/cli/package.json to 0.1.22.
Commit, tag v0.1.22, push.
Provide manual npm publish commands at the end.