'use client'

import { useEffect, useRef } from 'react'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const marqueeVariants = cva('flex overflow-hidden relative w-full', {
  variants: {
    direction: {
      horizontal: 'flex-row',
      vertical: 'flex-col h-[500px]', // Default height for vertical
    },
    blur: {
      none: '',
      edges: '',
      left: '',
      right: '',
    },
    bg: {
      none: '',
      surface: 'bg-dead-surface',
      elevated: 'bg-dead-elevated',
    },
    border: {
      none: '',
      default: 'border border-dead-border',
    },
  },
  defaultVariants: {
    direction: 'horizontal',
    blur: 'edges',
    bg: 'none',
    border: 'none',
  },
  compoundVariants: [
    {
      direction: 'horizontal',
      blur: 'edges',
      class: '[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]',
    },
    {
      direction: 'horizontal',
      blur: 'left',
      class: '[mask-image:linear-gradient(to_right,transparent,black_20%,black_100%)]',
    },
    {
      direction: 'horizontal',
      blur: 'right',
      class: '[mask-image:linear-gradient(to_right,black_0%,transparent_100%)]',
    },
    {
      direction: 'vertical',
      blur: 'edges',
      class: '[mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]',
    },
    {
      direction: 'vertical',
      blur: 'left',
      class: '[mask-image:linear-gradient(to_bottom,transparent,black_20%,black_100%)]',
    },
    {
      direction: 'vertical',
      blur: 'right',
      class: '[mask-image:linear-gradient(to_bottom,black_0%,transparent_100%)]',
    },
  ],
})

export interface MarqueeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof marqueeVariants> {
  children: React.ReactNode

  // Configuration
  speed?: number // Duration in seconds for one full loop (default: 30)
  gap?: number // Gap between items in pixels (default: 16)
  pauseOnHover?: boolean // Pause animation on hover (default: false)
  reverse?: boolean // Reverse scroll direction (default: false)
  repeat?: number // Number of times to duplicate content (default: 4)
  scrollLinked?: boolean // If true, disables auto-play and scrubs the strip from the container's own progress through the viewport (default: false)
  // If true, the loop keeps auto-playing and page-scroll velocity is added to
  // it: scrolling down drives the default direction (faster), scrolling up
  // reverses it, and the last scroll direction persists after scrolling stops
  // (default: false)
  scrollVelocity?: boolean
  itemClassName?: string // Applied to every repeated item wrapper (default: undefined)
}

export function Marquee({
  children,
  className,
  direction = 'horizontal',
  blur = 'edges',
  bg = 'none',
  border = 'none',
  speed = 30,
  gap = 16,
  pauseOnHover = false,
  reverse = false,
  repeat = 4,
  scrollLinked = false,
  scrollVelocity = false,
  itemClassName,
  ...props
}: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  // Scroll-linked mode: autoplay is off and the strip's offset is a bounded,
  // viewport-relative function of this container's own position on the page.
  // The container is "entered" when its top meets the bottom of the viewport
  // (fraction 0) and "left" when its bottom meets the top (fraction 1); that
  // 0->1 range maps onto exactly one period of travel. Because the track is
  // `repeat` identical copies, translating by exactly one period looks
  // identical to translating by zero, so the wrap is seamless — and because
  // the offset stays inside `[-period, 0]`, the container is always fully
  // covered as long as one spare period is rendered (the default `repeat` of 4
  // is ample). `reverse` travels the other way across that same safe window.
  // This keeps the effect visible for a strip embedded anywhere in a page,
  // unlike a raw `window.scrollY` offset, which walks the strip out of its box
  // as soon as the page scrolls past it.
  useEffect(() => {
    if (!scrollLinked || !trackRef.current) return
    const track = trackRef.current
    const box = track.parentElement
    if (!box) return

    const compute = () => {
      const period =
        (direction === 'vertical' ? track.scrollHeight : track.scrollWidth) / repeat
      if (period <= 0) return

      const rect = box.getBoundingClientRect()
      const span = window.innerHeight + rect.height
      const fraction = span > 0 ? (window.innerHeight - rect.top) / span : 0
      const clamped = Math.min(Math.max(fraction, 0), 1)
      const travel = clamped * period
      // Normal: 0 -> -period (the default travel direction). Reverse:
      // -period -> 0 (the opposite direction). Both stay in [-period, 0].
      const offset = reverse ? travel - period : -travel
      track.style.setProperty('--scroll-progress', `${offset}px`)
    }

    compute()
    window.addEventListener('scroll', compute, { passive: true })
    window.addEventListener('resize', compute)
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(compute)
    observer?.observe(track)
    return () => {
      window.removeEventListener('scroll', compute)
      window.removeEventListener('resize', compute)
      observer?.disconnect()
    }
  }, [scrollLinked, direction, repeat, reverse])

  // Velocity-linked mode: the loop always runs (no CSS keyframe) and is driven
  // from requestAnimationFrame so page-scroll velocity can be folded into its
  // speed and direction. Scrolling down drives the default direction (faster),
  // scrolling up reverses it; whichever direction was scrolled last keeps
  // moving at the base `speed` once scrolling stops. The travel distance is
  // wrapped at exactly one period, so the loop stays seamless.
  useEffect(() => {
    if (!scrollVelocity || scrollLinked || !trackRef.current) return
    const track = trackRef.current
    const root = track.parentElement
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let period = (direction === 'vertical' ? track.scrollHeight : track.scrollWidth) / repeat
    if (period <= 0) return

    let travel = 0
    let scrollDirection = 1 // +1 = scrolling down = default direction
    let scrollSpeed = 0 // signed px/s, used only for the velocity boost
    let lastScrollY = window.scrollY
    let lastScrollAt = performance.now()
    let lastFrame = performance.now()
    let frame = 0

    const apply = () => {
      const wrapped = ((travel % period) + period) % period
      track.style.transform =
        direction === 'vertical'
          ? `translate3d(0, ${-wrapped}px, 0)`
          : `translate3d(${-wrapped}px, 0, 0)`
    }

    const onScroll = () => {
      const now = performance.now()
      const delta = window.scrollY - lastScrollY
      const elapsed = Math.max(now - lastScrollAt, 1)
      if (delta !== 0) {
        scrollDirection = delta > 0 ? 1 : -1
        scrollSpeed = scrollSpeed * 0.7 + (delta / elapsed) * 1000 * 0.3
      }
      lastScrollY = window.scrollY
      lastScrollAt = now
    }

    const tick = (now: number) => {
      const elapsed = Math.min((now - lastFrame) / 1000, 0.05)
      lastFrame = now

      const paused =
        pauseOnHover && (root ? root.matches(':hover') : false)
      if (!paused) {
        const boost =
          now - lastScrollAt < 120
            ? Math.min(Math.abs(scrollSpeed) / 800, 6)
            : 0
        const base = period / speed
        // Positive travel moves the strip left (horizontal) / up (vertical);
        // `reverse` flips the default direction and scrollDirection flips it
        // again on upward scroll.
        const rate = (reverse ? -1 : 1) * base * scrollDirection * (1 + boost)
        travel += rate * elapsed
        apply()
      }

      frame = requestAnimationFrame(tick)
    }

    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            const next = (direction === 'vertical' ? track.scrollHeight : track.scrollWidth) / repeat
            if (next > 0) period = next
          })
    observer?.observe(track)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      observer?.disconnect()
      track.style.transform = ''
    }
  }, [scrollVelocity, scrollLinked, direction, speed, repeat, reverse, pauseOnHover])

  // NOTE on the seamless loop: each copy is a self-contained period. The
  // wrapper lays children out with the inter-item gap AND bakes a trailing
  // spacing equal to `gap` into itself (padding-right for horizontal,
  // padding-bottom for vertical). The track has no gap of its own, so the
  // children stay uniformly `gap`-spaced across copies while the distance
  // between two identical copies equals exactly one copy's width. The
  // keyframes then translate `-100% / repeat` = one full copy = one period,
  // so the wrap point is pixel-perfect with zero visual jump.
  const items = Array.from({ length: repeat }, (_, i) => (
    <div
      key={i}
      className={cn(
        // overflow-hidden ensures border-radius clips children
        'flex shrink-0 overflow-hidden',
        direction === 'vertical' && 'flex-col',
        direction === 'vertical' ? 'pb-[var(--gap)]' : 'pr-[var(--gap)]',
        itemClassName
      )}
      style={{ gap: `${gap}px` }}
    >
      {children}
    </div>
  ))

  const animationDirection = reverse ? 'reverse' : 'normal'
  const animationDuration = `${speed}s`

  return (
    <div
      className={cn(marqueeVariants({ direction, blur, bg, border }), className)}
      style={{
        ['--gap' as string]: `${gap}px`,
        ['--repeat' as string]: repeat,
      }}
      {...props}
    >
      <div
        ref={trackRef}
        className={cn(
          'flex shrink-0 will-change-transform',
direction === 'vertical'
             ? 'animate-marquee-vertical flex-col'
             : 'animate-marquee',
          pauseOnHover && 'hover:[animation-play-state:paused]',
          'motion-reduce:[animation:none]!'
        )}
        style={{
          ['--duration' as string]: animationDuration,
          ['--direction' as string]: animationDirection,
          ...(scrollLinked
            ? {
                animation: 'none',
                // The offset is a signed px value in [-period, 0] written by the
                // effect above; applying it in the default direction keeps the
                // track's spare copies covering the container for its whole
                // viewport traversal.
                transform:
                  direction === 'vertical'
                    ? 'translateY(var(--scroll-progress, 0px))'
                    : 'translateX(var(--scroll-progress, 0px))',
              }
            : scrollVelocity
              ? { animation: 'none' }
              : {}),
        }}
      >
        {items}
      </div>
    </div>
  )
}