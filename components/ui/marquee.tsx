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
      edges:
        '[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]',
      left: '[mask-image:linear-gradient(to_right,transparent,black_20%,black_100%)]',
      right: '[mask-image:linear-gradient(to_right,black_0%,transparent_100%)]',
    },
  },
  defaultVariants: {
    direction: 'horizontal',
    blur: 'edges',
  },
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
  scrollLinked?: boolean // If true, disables auto-play and links to page scroll (default: false)
}

export function Marquee({
  children,
  className,
  direction = 'horizontal',
  blur = 'edges',
  speed = 30,
  gap = 16,
  pauseOnHover = false,
  reverse = false,
  repeat = 4,
  scrollLinked = false,
  ...props
}: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollLinked || !trackRef.current) return
    const track = trackRef.current
    const onScroll = () => {
      track.style.setProperty('--scroll-progress', `${window.scrollY}px`)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [scrollLinked])

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
        'flex shrink-0',
        direction === 'vertical' && 'flex-col',
        direction === 'vertical' ? 'pb-[var(--gap)]' : 'pr-[var(--gap)]'
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
      className={cn(marqueeVariants({ direction, blur }), className)}
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
                transform:
                  direction === 'vertical'
                    ? 'translateY(calc(var(--scroll-progress, 0px) * -1))'
                    : 'translateX(calc(var(--scroll-progress, 0px) * -1))',
              }
            : {}),
        }}
      >
        {items}
      </div>
    </div>
  )
}