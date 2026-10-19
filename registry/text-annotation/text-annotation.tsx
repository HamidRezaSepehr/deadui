'use client'

import React, { useRef, useEffect, useState, useMemo, type ReactNode } from 'react'
import { annotate, annotationGroup } from 'rough-notation'
import { cn } from '@/lib/utils'

/**
 * rough-notation only exports the `annotate` and `annotationGroup` functions —
 * none of its model types (`RoughAnnotation`, `RoughAnnotationGroup`,
 * `RoughAnnotationType`) are re-exported from the package entry. They are
 * therefore derived here from the signatures of those two functions, which is
 * both type-accurate and immune to the library's internal type naming.
 */
type Annotation = ReturnType<typeof annotate>
type AnnotationGroup = ReturnType<typeof annotationGroup>
type AnnotationConfig = Parameters<typeof annotate>[1]
type NativeAnnotationType = AnnotationConfig['type']

export type AnnotationType =
  | 'underline'
  | 'box'
  | 'circle'
  | 'highlight'
  | 'strike-through'
  | 'crossed-off'
  | 'bracket'
  | 'multi-line'

/**
 * `multi-line` is the one type that does NOT exist natively in
 * rough-notation — the library instead has a `multiline: true` flag that makes
 * ANY type wrap its rectangles per line box. It is modelled here as an
 * `underline` with the flag forced on, so all eight documented types produce a
 * real, visible effect instead of silently rendering nothing (the library's
 * render switch has no `default` case, so an unknown type draws no paths at
 * all).
 */
const NATIVE_TYPE: Record<AnnotationType, NativeAnnotationType> = {
  underline: 'underline',
  box: 'box',
  circle: 'circle',
  highlight: 'highlight',
  'strike-through': 'strike-through',
  'crossed-off': 'crossed-off',
  bracket: 'bracket',
  'multi-line': 'underline',
}

interface AnnotationContextValue {
  register: (annotation: Annotation) => void
  unregister: (annotation: Annotation) => void
}

/**
 * Lets a nested `TextAnnotation` hand its instance to the enclosing
 * `TextAnnotationGroup`, so the group owns show/hide and can animate the set
 * sequentially. `null` means "standalone".
 */
const AnnotationContext = React.createContext<AnnotationContextValue | null>(null)

export interface TextAnnotationProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  type: AnnotationType
  /** Manual show/hide control. Ignored when `inView` is true. Default: true */
  show?: boolean
  /** Auto-trigger `.show()` when the element enters the viewport. Default: false */
  inView?: boolean
  /** Only animate the first time the element enters the viewport. Default: true */
  triggerOnce?: boolean
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

  // Read the latest `show` / `inView` from within the creation effect without
  // forcing the annotation to be torn down and rebuilt when they change.
  const showRef = useRef(show)
  const inViewRef = useRef(inView)
  useEffect(() => {
    showRef.current = show
    inViewRef.current = inView
  })

  const group = React.useContext(AnnotationContext)

  const nativeType = NATIVE_TYPE[type]
  const effectiveMultiline = type === 'multi-line' ? true : multiline

  /**
   * Lifecycle: create the instance on mount (and whenever any option changes),
   * tear it down on unmount. Options are re-applied by re-creating, which is
   * the only reliable way — rough-notation's setters do not cover `type` or
   * `multiline`, and a fresh annotation always starts hidden.
   */
  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const annotation = annotate(target, {
      type: nativeType,
      color,
      iterations,
      strokeWidth,
      padding,
      multiline: effectiveMultiline,
      animationDuration,
    } satisfies AnnotationConfig)

    annotationRef.current = annotation
    group?.register(annotation)

    if (!group) {
      // Restore the desired state that was lost by re-creating the instance.
      if (inViewRef.current) {
        if (hasAnimated.current) annotation.show()
      } else if (showRef.current) {
        annotation.show()
      }
    }

    return () => {
      group?.unregister(annotation)
      annotation.remove()
      if (annotationRef.current === annotation) annotationRef.current = null
    }
  }, [group, nativeType, color, iterations, strokeWidth, padding, effectiveMultiline, animationDuration])

  // Manual show/hide control — skipped when a group owns us or `inView` is on.
  useEffect(() => {
    if (group || inView) return
    if (!annotationRef.current) return

    if (show) {
      annotationRef.current.show()
    } else {
      annotationRef.current.hide()
    }
  }, [show, inView, group])

  // In-view Intersection Observer.
  useEffect(() => {
    if (group || !inView || !targetRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            annotationRef.current?.show()
            hasAnimated.current = true
            if (triggerOnce) {
              // Stop watching so re-entering the viewport cannot replay it.
              observer.unobserve(entry.target)
            }
          } else if (!triggerOnce) {
            // Leave the viewport without `triggerOnce`: hide so the next entry
            // re-animates from scratch.
            annotationRef.current?.hide()
          }
        })
      },
      { threshold: 0.5 } // Trigger when 50% of the element is visible
    )

    observer.observe(targetRef.current)

    return () => {
      observer.disconnect()
    }
  }, [group, inView, triggerOnce])

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

export interface TextAnnotationGroupProps {
  children: ReactNode
  /** Manual show/hide control for the whole group. Default: true */
  show?: boolean
  /** Animate the group when it enters the viewport. Default: false */
  inView?: boolean
  /** Only animate the group the first time it enters the viewport. Default: true */
  triggerOnce?: boolean
  className?: string
}

/**
 * Wraps nested `TextAnnotation`s in a single rough-notation annotation group so
 * they animate in sequence. It owns an IntersectionObserver of its own: when
 * `inView` is set, the WHOLE group reveals once 50% of it is visible.
 */
export function TextAnnotationGroup({
  children,
  show = true,
  inView = false,
  triggerOnce = true,
  className,
}: TextAnnotationGroupProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const groupRef = useRef<AnnotationGroup | null>(null)
  const targetRef = useRef<HTMLSpanElement>(null)
  const revealRef = useRef(false)

  // Build (and rebuild) the rough-notation group whenever membership changes.
  // Runs BEFORE the sync effect below so `groupRef` is current for it.
  useEffect(() => {
    if (annotations.length === 0) {
      groupRef.current = null
      return
    }
    groupRef.current = annotationGroup(annotations)
  }, [annotations])

  // Keep the group's visibility in step with `show` / `inView`, and re-apply it
  // after a rebuild (a newly registered member starts in a hidden state, so a
  // group that was already revealed must be re-shown).
  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    if (revealRef.current) {
      group.show()
    } else if (!inView) {
      if (show) group.show()
      else group.hide()
    }
    // `inView && !reveal`: leave hidden — the observer below reveals it.
  }, [annotations, show, inView])

  // In-view Intersection Observer for the group container.
  useEffect(() => {
    if (!inView || !targetRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealRef.current = true
            groupRef.current?.show()
            if (triggerOnce) observer.unobserve(entry.target)
          } else if (!triggerOnce) {
            revealRef.current = false
            groupRef.current?.hide()
          }
        })
      },
      { threshold: 0.5 } // Trigger when 50% of the element is visible
    )

    observer.observe(targetRef.current)
    return () => observer.disconnect()
  }, [inView, triggerOnce])

  const register = useMemo(
    () => (annotation: Annotation) => {
      setAnnotations((prev) => (prev.includes(annotation) ? prev : [...prev, annotation]))
    },
    []
  )

  const unregister = useMemo(
    () => (annotation: Annotation) => {
      setAnnotations((prev) => prev.filter((a) => a !== annotation))
    },
    []
  )

  const value = useMemo(() => ({ register, unregister }), [register, unregister])

  return (
    <AnnotationContext.Provider value={value}>
      <span ref={targetRef} className={cn('inline', className)}>
        {children}
      </span>
    </AnnotationContext.Provider>
  )
}

/**
 * For custom consumers that need to reach a group from a much deeper level.
 * Nested `TextAnnotation`s read the context directly so they can register
 * *optionally* (a `null` context simply means "standalone"), which is why the
 * null-checking branch lives with the component rather than behind this hook.
 */
export function useAnnotationRegistration() {
  const context = React.useContext(AnnotationContext)
  if (!context) {
    throw new Error('useAnnotationRegistration must be used within a TextAnnotationGroup')
  }
  return context
}
