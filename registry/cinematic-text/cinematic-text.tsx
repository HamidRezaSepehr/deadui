'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { GSAP_DEFAULTS, SCROLL_TRIGGER_DEFAULTS } from '@/lib/animations'

// Register GSAP plugins once at module scope
gsap.registerPlugin(ScrollTrigger, SplitText)

export const cinematicTextVariants = cva(
  'inline-block will-change-transform',
  {
    variants: {
      variant: {
        'blur-in': 'opacity-0 blur-[10px]',
        'fade-up': 'opacity-0 translate-y-5',
        'slide-stagger': 'opacity-0 -translate-x-5',
        'scale-pop': 'opacity-0 scale-90',
      },
    },
    defaultVariants: {
      variant: 'blur-in',
    },
  }
)

export interface CinematicTextProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cinematicTextVariants> {
  children: string
  duration?: number
  delay?: number
  stagger?: number
  splitBy?: 'chars' | 'words' | 'lines'

  // New Scroll Configuration Props
  start?: string        // Default: 'top 85%' (e.g., 'top center', '30% bottom')
  end?: string          // Default: 'bottom top'
  once?: boolean        // Default: true (plays once). Set false to repeat every time it enters the viewport.
  scrub?: boolean | number // Default: false. If true, animation progress links to scroll.
  toggleActions?: string // GSAP toggleActions override, e.g. 'play none none reverse' (down only), 'none reverse none none' (up only). Defaults to 'play reverse play reverse' when once=false, otherwise once:true.
}

export function CinematicText({
  className,
  variant,
  children,
  duration = GSAP_DEFAULTS.duration,
  delay = 0,
  stagger = GSAP_DEFAULTS.stagger,
  splitBy = 'chars',
  start,
  end,
  once,
  scrub,
  toggleActions,
  ...props
}: CinematicTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !children) return

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      gsap.set(containerRef.current, { opacity: 1, filter: 'none', y: 0, x: 0, scale: 1 })
      return
    }

    const ctx = gsap.context(() => {
      // Create SplitText instance
      const split = new SplitText(containerRef.current, {
        type: splitBy,
        charsClass: 'split-char',
        wordsClass: 'split-word',
        linesClass: 'split-line',
      })

      // Define initial states based on variant
      const initialStates = {
        'blur-in': { opacity: 0, filter: 'blur(10px)' },
        'fade-up': { opacity: 0, y: 20 },
        'slide-stagger': { opacity: 0, x: -20 },
        'scale-pop': { opacity: 0, scale: 0.9 },
      }

      const targetElements = split[splitBy] || split.chars
      const variantKey = variant || 'blur-in'

      // Build ScrollTrigger config conditional on `scrub` (wins), an
      // explicit `toggleActions` override, or `once` (direction-agnostic
      // replay default when once=false).
      const scrollTriggerConfig = {
        trigger: containerRef.current,
        start: start || SCROLL_TRIGGER_DEFAULTS.start,
        end: end || SCROLL_TRIGGER_DEFAULTS.end,
        // Conditional logic (scrub takes precedence over everything):
        ...(scrub ? { scrub: typeof scrub === 'number' ? scrub : true } : {}),
        ...(!scrub && toggleActions ? { toggleActions } : {}),
        ...(!scrub && !toggleActions && once !== false ? { once: true } : {}),
        ...(!scrub &&
        !toggleActions &&
        once === false && {
          // Repeat every entry, either scroll direction (both-ways).
          toggleActions: 'play reverse play reverse',
        }),
      }

      gsap.from(targetElements, {
        ...initialStates[variantKey],
        duration,
        delay,
        stagger,
        ease: 'power3.out',
        scrollTrigger: scrollTriggerConfig,
      })

      gsap.to(containerRef.current, {
        opacity: 1,
        filter: 'none',
        y: 0,
        x: 0,
        scale: 1,
        duration,
        delay,
        ease: 'power3.out',
        scrollTrigger: scrollTriggerConfig,
      })
    }, containerRef)

    return () => ctx.revert()
  }, [children, variant, duration, delay, stagger, splitBy, start, end, once, scrub, toggleActions])

  return (
    <div
      ref={containerRef}
      className={cn(cinematicTextVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  )
}