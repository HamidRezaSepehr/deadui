// 🔒 PRO COMPONENT - Commercial License Required
// This component requires a valid Dead UI Pro license.
// Purchase at: https://deadui.dev/pro

'use client'

import { useEffect, useId, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface MeltingBlurTextProps {
  /** The sentence to melt. Split into one `<span>` per character. */
  children: string
  /** Distance from the lerped cursor at which a character starts to melt. */
  effectRadius?: number
  /** How far characters drip and how hard they blur inside the radius. */
  blurSpread?: number
  /** Gooey filter precision: `high` is the tightest, `low` the loosest. */
  blurQuality?: 'low' | 'medium' | 'high'
  /** Per-frame lerp factor. `0.05` lags, `0.5` is near-instant. */
  inertia?: number
  className?: string
}

/**
 * Inverted on purpose: a "high" quality blur is a small, tight stdDeviation
 * that costs more per pixel, "low" is a wide throw that reads as more goo.
 */
const DEVIATION: Record<'low' | 'medium' | 'high', number> = {
  high: 4,
  medium: 6,
  low: 10,
}

/** Alpha threshold that turns the gaussian blur into a hard gooey silhouette. */
const GOOEY_MATRIX = '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9'

export function MeltingBlurText({
  children,
  effectRadius = 60,
  blurSpread = 8,
  blurQuality = 'medium',
  inertia = 0.15,
  className,
}: MeltingBlurTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const charRefs = useRef<Array<HTMLSpanElement | null>>([])
  const filterId = useId()
  const shouldReduce = useReducedMotion()

  // Frame-rate state lives in refs, never in React state: a setState per frame
  // would re-render every character 60 times a second for no visual gain.
  const pointer = useRef({ x: 0, y: 0, active: false, seen: false })
  const current = useRef({ x: 0, y: 0 })
  const strength = useRef(0)
  const centers = useRef<Array<{ x: number; y: number } | null>>([])

  const chars = Array.from(children)

  // Group contiguous characters into word runs: `{ space, start, text }`.
  // `start` is the run's index inside `chars`, so character spans inside a
  // run keep refs aligned with the melt loop below.
  const runs: Array<{ space: boolean; start: number; text: string[] }> = []
  {
    let charIndex = 0
    for (const char of chars) {
      const space =
        char === ' ' || char === '\t' || char === '\n' || char === '\r'
      const last = runs[runs.length - 1]
      if (last && last.space === space) {
        last.text.push(char)
      } else {
        runs.push({ space, start: charIndex, text: [char] })
      }
      charIndex += 1
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const spans = charRefs.current.filter(
      (span): span is HTMLSpanElement => span !== null,
    )

    const clear = () => {
      for (const span of spans) {
        span.style.transform = ''
        span.style.filter = ''
      }
    }

    // The filter is written imperatively rather than through the `style`
    // prop: `useReducedMotion()` only knows its value on the client, and a
    // prop that differs from the server-rendered markup leaves React 19 with
    // an unpatchable hydration mismatch. Setting it here keeps the server and
    // client markup byte-identical.
    if (shouldReduce) {
      container.style.filter = ''
      clear()
      return
    }

    const measure = () => {
      centers.current = spans.map((span) => ({
        // offsetLeft/Top are layout coordinates, so the cached centres stay
        // valid across scroll — only the pointer has to be re-based each frame.
        x: span.offsetLeft + span.offsetWidth / 2,
        y: span.offsetTop + span.offsetHeight / 2,
      }))
    }
    measure()

    const onPointerMove = (event: PointerEvent) => {
      pointer.current.x = event.clientX
      pointer.current.y = event.clientY
      if (!pointer.current.seen) {
        // Snap on the first contact so the goo does not sweep in from a
        // corner; every frame after that is a lerp.
        const rect = container.getBoundingClientRect()
        current.current.x = event.clientX - rect.left
        current.current.y = event.clientY - rect.top
        pointer.current.seen = true
      }
      pointer.current.active = true
    }

    const onPointerLeave = () => {
      pointer.current.active = false
    }

    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerleave', onPointerLeave)

    const observer = new ResizeObserver(measure)
    observer.observe(container)

    const lerp = Math.min(Math.max(inertia, 0.001), 1)
    const radius = Math.max(effectRadius, 1)
    const spread = Math.max(blurSpread, 0)
    let frame = 0

    // The container-level gooey filter must only run while the melt is
    // active. Left on at rest, feGaussianBlur spreads each thin anti-aliased
    // stroke below the 9/19 alpha threshold and the feColorMatrix burns the
    // glyph away entirely — the "text is invisible until you select it" bug.
    let filterOn = false
    const syncFilter = (on: boolean) => {
      if (on !== filterOn) {
        container.style.filter = on ? `url(#${filterId})` : ''
        filterOn = on
      }
    }

    const tick = () => {
      const melting = pointer.current.active || strength.current >= 0.0005
      syncFilter(melting)

      if (melting) {
        const rect = container.getBoundingClientRect()
        const targetX = pointer.current.x - rect.left
        const targetY = pointer.current.y - rect.top

        current.current.x += (targetX - current.current.x) * lerp
        current.current.y += (targetY - current.current.y) * lerp
        strength.current +=
          ((pointer.current.active ? 1 : 0) - strength.current) * lerp

        const cx = current.current.x
        const cy = current.current.y

        for (let i = 0; i < spans.length; i++) {
          const center = centers.current[i]
          if (!center) continue

          const dx = cx - center.x
          const dy = cy - center.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const falloff = distance >= radius ? 0 : 1 - distance / radius
          const influence = falloff * falloff * strength.current

          if (influence < 0.002) {
            if (spans[i].style.transform !== '') {
              spans[i].style.transform = ''
              spans[i].style.filter = ''
            }
          } else {
            spans[i].style.transform = `translateY(${(influence * spread * 2).toFixed(2)}px)`
            spans[i].style.filter = `blur(${(influence * spread).toFixed(2)}px)`
          }
        }
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerleave', onPointerLeave)
      observer.disconnect()
      container.style.filter = ''
      clear()
    }
  }, [children, effectRadius, blurSpread, inertia, shouldReduce, filterId])

  return (
    <span
      ref={containerRef}
      className={cn(
        'relative inline-block will-change-[filter] text-2xl font-semibold leading-snug tracking-tight md:text-4xl',
        className
      )}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        style={{ position: 'absolute', width: 0, height: 0 }}
      >
        <filter
          id={filterId}
          x="-100%"
          y="-300%"
          width="300%"
          height="700%"
        >
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={DEVIATION[blurQuality]}
            result="blur"
          />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values={GOOEY_MATRIX}
            result="gooey"
          />
          <feComposite in="SourceGraphic" in2="gooey" operator="over" />
        </filter>
      </svg>

      {runs.map((run) =>
        run.space ? (
          // Real whitespace stays a plain inline span so the sentence still
          // has a soft wrap opportunity — and the ONLY one, because every
          // word below is wrapped in nowrap.
          <span key={run.start}>{run.text.join('')}</span>
        ) : (
          // Each word is an atomic nowrap run: adjacent inline-block glyph
          // spans let the browser break a word across lines, so bundling a
          // word this way forces the whole word onto the next line instead.
          <span
            key={run.start}
            className="inline-block whitespace-nowrap"
          >
            {run.text.map((char, offset) => (
              <span
                key={run.start + offset}
                ref={(element) => {
                  charRefs.current[run.start + offset] = element
                }}
                className="inline-block"
              >
                {char}
              </span>
            ))}
          </span>
        ),
      )}
    </span>
  )
}
