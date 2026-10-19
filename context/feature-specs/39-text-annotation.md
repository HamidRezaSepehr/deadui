# Feature 39: Text Annotation Component

## Overview

Add a new free component, `TextAnnotation`, which provides hand-drawn, sketchy annotation effects for text and elements using the `rough-notation` library. It supports all native annotation types, comprehensive styling options, synchronized group animations, and **automatic in-view triggering** via Intersection Observer.

## Goals

1. Create `registry/text-annotation/text-annotation.tsx` containing `TextAnnotation` and `TextAnnotationGroup` components that safely wrap the `rough-notation` API.
2. Expose all native `rough-notation` options as React props, plus new `inView` and `triggerOnce` props for scroll-based animations.
3. Update `registry.json` to include `rough-notation` as a dependency.
4. Create a comprehensive test page `app/test-text-annotation/page.tsx` showcasing all 8 annotation types, custom styling, and the in-view scroll trigger.
5. Create the MDX documentation page `app/docs/components/text-annotation/page.mdx`.
6. Execute the 4-step Release Workflow for `v0.1.15` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/text-annotation/text-annotation.tsx`)
```tsx
'use client'

import React, { useRef, useEffect, useState, type ReactNode } from 'react'
import { annotate, annotationGroup, type Annotation, type AnnotationGroup } from 'rough-notation'
import { cn } from '@/lib/utils'

export type AnnotationType = 
  | 'underline' 
  | 'box' 
  | 'circle' 
  | 'highlight' 
  | 'strike-through' 
  | 'crossed-off' 
  | 'bracket' 
  | 'multi-line'

export interface TextAnnotationProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  type: AnnotationType
  show?: boolean // Manual control
  inView?: boolean // Auto-trigger when element enters viewport
  triggerOnce?: boolean // Only animate the first time it enters viewport (default: true)
  color?: string
  iterations?: number
  strokeWidth?: number
  padding?: number
  multiline?: boolean
  animationDuration?: number
}

export function TextAnnotation({
  children,
  type,
  show = true,
  inView = false,
  triggerOnce = true,
  color,
  iterations,
  strokeWidth,
  padding,
  multiline,
  animationDuration,
  className,
  ...props
}: TextAnnotationProps) {
  const targetRef = useRef<HTMLSpanElement>(null)
  const annotationRef = useRef<Annotation | null>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!targetRef.current) return

    annotationRef.current = annotate(targetRef.current, {
      type,
      color,
      iterations,
      strokeWidth,
      padding,
      multiline,
      animationDuration,
    })

    return () => {
      if (annotationRef.current) {
        annotationRef.current.remove()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, color, iterations, strokeWidth, padding, multiline, animationDuration])

  // Manual show/hide control
  useEffect(() => {
    if (inView) return // Skip manual control if inView is active
    if (!annotationRef.current) return

    if (show) {
      annotationRef.current.show()
    } else {
      annotationRef.current.hide()
    }
  }, [show, inView])

  // In-view Intersection Observer
  useEffect(() => {
    if (!inView || !targetRef.current || !annotationRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            annotationRef.current?.show()
            if (triggerOnce) {
              hasAnimated.current = true
              observer.unobserve(entry.target)
            }
          } else if (!triggerOnce && hasAnimated.current) {
            // Optional: hide when out of view so it re-animates on next entry
            annotationRef.current?.hide()
          }
        })
      },
      { threshold: 0.5 } // Trigger when 50% of the element is visible
    )

    observer.observe(targetRef.current)

    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current)
      }
    }
  }, [inView, triggerOnce])

  return (
    <span
      ref={targetRef}
      className={cn('relative inline-block', className)}
      {...props}
    >
      {children}
    </span>
  )
}

// --- Group Component ---
export interface TextAnnotationGroupProps {
  children: ReactNode
  show?: boolean
  inView?: boolean
  triggerOnce?: boolean
}

// Context to allow nested TextAnnotations to register with the Group
const AnnotationContext = React.createContext<{
  register: (annotation: Annotation) => void
  unregister: (annotation: Annotation) => void
} | null>(null)

export function TextAnnotationGroup({ 
  children, 
  show = true, 
  inView = false,
  triggerOnce = true 
}: TextAnnotationGroupProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const groupRef = useRef<AnnotationGroup | null>(null)
  const targetRef = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (annotations.length === 0) return
    groupRef.current = annotationGroup(annotations)
  }, [annotations])

  useEffect(() => {
    if (inView || !groupRef.current) return
    if (show) {
      groupRef.current.show()
    } else {
      groupRef.current.hide()
    }
  }, [show, inView])

  useEffect(() => {
    if (!inView || !targetRef.current || !groupRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          entry.isIntersecting && groupRef.current?.show()
        )
        if (triggerOnce && entries[0]?.isIntersecting) {
          hasAnimated.current = true
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(targetRef.current)
    return () => observer.disconnect()
  }, [inView, triggerOnce])

  const register = (annotation: Annotation) => {
    setAnnotations((prev) => [...prev, annotation])
  }

  const unregister = (annotation: Annotation) => {
    setAnnotations((prev) => prev.filter((a) => a !== annotation))
  }

  return (
    <AnnotationContext.Provider value={{ register, unregister }}>
      <span ref={targetRef} className="inline">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as any, { inView: false, show: true }) // Let group handle triggering
          }
          return child
        })}
      </span>
    </AnnotationContext.Provider>
  )
}

// Hook for children to register themselves
export function useAnnotationRegistration() {
  const context = React.useContext(AnnotationContext)
  if (!context) {
    throw new Error('useAnnotationRegistration must be used within a TextAnnotationGroup')
  }
  return context
}
```
*(Note to AI: Update the `TextAnnotation` component to use `useAnnotationRegistration` when it detects it is inside a `TextAnnotationGroup`, so it can add itself to the group's array instead of managing its own show/hide state).*

### 2. Registry Update (`registry.json`)
```json
{
  "name": "text-annotation",
  "title": "Text Annotation",
  "description": "Hand-drawn, sketchy annotation effects for text using rough-notation.",
  "tier": "free",
  "dependencies": ["rough-notation"],
  "files": [
    {
      "path": "registry/text-annotation/text-annotation.tsx",
      "target": "components/ui/text-annotation.tsx"
    }
  ]
}
```

### 3. Test Page (`app/test-text-annotation/page.tsx`)
Create a page with enough vertical space to scroll, demonstrating:
1. **All 8 Types**: A grid showing each type.
2. **In-View Trigger**: A section far down the page that only animates when the user scrolls to it (`inView={true}`).
3. **Interactive Toggle**: A button that manually toggles the `show` prop.
4. **Annotation Group**: A paragraph with multiple nested annotations wrapped in `TextAnnotationGroup`, animating in sequence when scrolled into view.

### 4. Documentation (`app/docs/components/text-annotation/page.mdx`)
- Explain the required dependency: `npm install rough-notation`.
- Detail all props, emphasizing the new `inView` and `triggerOnce` props for scroll-based animations.
- Provide clear code snippets for single annotations and grouped annotations.

### 5. The 4-Step Release Workflow & Manual Publish
Execute the git workflow for `v0.1.15`, and **CRITICALLY**, provide the manual npm publish commands at the end of your response.

## Implementation Steps

1. Create `registry/text-annotation/text-annotation.tsx` with `TextAnnotation`, `TextAnnotationGroup`, Context, and Intersection Observer logic.
2. Update `registry.json`.
3. Create `app/test-text-annotation/page.tsx`.
4. Create `app/docs/components/text-annotation/page.mdx`.
5. Bump `packages/cli/package.json` version to `0.1.15`.
6. Execute git commands: `add`, `commit`, `push`, `tag v0.1.15`, `push tag`.
7. Output GitHub Release UI instructions.
8. **Output the exact manual terminal commands to publish to npm.**
9. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] `TextAnnotation` correctly initializes and cleans up `rough-notation` instances.
- [ ] The `inView` prop successfully triggers the animation via Intersection Observer.
- [ ] `triggerOnce` correctly prevents re-animation on subsequent scrolls (when true).
- [ ] `TextAnnotationGroup` successfully animates multiple nested annotations in sequence when in view.
- [ ] Test page displays all variations clearly with scrollable space.
- [ ] Git tag `v0.1.15` is pushed.
- [ ] Manual npm publish instructions are clearly provided at the end.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `registry/text-annotation/text-annotation.tsx` (New)
2. `registry.json` (Update)
3. `app/test-text-annotation/page.tsx` (New)
4. `app/docs/components/text-annotation/page.mdx` (New)
5. `packages/cli/package.json` (Update version to 0.1.15)
6. `context/progress-tracker.md` (Update)