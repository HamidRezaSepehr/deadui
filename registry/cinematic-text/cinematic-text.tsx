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
  'inline-block will-change-[transform,opacity,color,filter]',
  {
    variants: {
      variant: {
        'blur-in': 'opacity-0 blur-[10px]',
        'fade-up': 'opacity-0 translate-y-5',
        'slide-stagger': 'opacity-0 -translate-x-5',
        'scale-pop': 'opacity-0 scale-90',
        'rise-color': 'opacity-0 translate-y-[25px]',
        'slide-left-color': 'opacity-0 -translate-x-[7px]',
        'scale-blur-color': 'opacity-0 translate-y-[15px] scale-50 blur-[2px]',
        'diagonal-blur-color':
          'opacity-0 -translate-x-[10px] translate-y-[20px] blur-[4px]',
        'flip-x-color': 'opacity-0 blur-[2px]',
        'heavy-flip-color': 'opacity-0 blur-[10px]',
        'flip-top-color': 'opacity-0 blur-[5px]',
        'mask-reveal': 'opacity-0 overflow-hidden',
      },
    },
    defaultVariants: {
      variant: 'blur-in',
    },
  }
)

// The "color reveal" pattern: text transitions from a dimmed gray to full
// white while opacity climbs from 0.3 to 1 (feature spec 27). GSAP cannot
// parse color-mix() as a colour, so both endpoints are tweened as complex
// strings — the two strings are structurally identical, so only the 0% → 100%
// percentage actually interpolates.
const COLOR_DIM = 'color-mix(in srgb, rgb(255, 255, 255) 0%, rgb(161, 161, 161))'
const COLOR_FULL =
  'color-mix(in srgb, rgb(255, 255, 255) 100%, rgb(161, 161, 161))'

const COLOR_VARIANT_TWEENS: Record<
  string,
  { from: gsap.TweenVars; to: gsap.TweenVars }
> = {
  'rise-color': {
    from: { opacity: 0.3, y: 25, color: COLOR_DIM },
    to: { opacity: 1, y: 0, color: COLOR_FULL },
  },
  'slide-left-color': {
    from: { opacity: 0.3, x: -7, color: COLOR_DIM },
    to: { opacity: 1, x: 0, color: COLOR_FULL },
  },
  'scale-blur-color': {
    from: { opacity: 0.3, y: 15, scale: 0.5, filter: 'blur(2px)', color: COLOR_DIM },
    to: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', color: COLOR_FULL },
  },
  'diagonal-blur-color': {
    from: {
      opacity: 0.3,
      x: -10,
      y: 20,
      filter: 'blur(4px)',
      color: COLOR_DIM,
    },
    to: {
      opacity: 1,
      x: 0,
      y: 0,
      filter: 'blur(0px)',
      color: COLOR_FULL,
    },
  },
  'flip-x-color': {
    from: {
      opacity: 0.3,
      transformPerspective: 800,
      rotationX: 45,
      filter: 'blur(2px)',
      color: COLOR_DIM,
    },
    to: {
      opacity: 1,
      transformPerspective: 800,
      rotationX: 0,
      filter: 'blur(0px)',
      color: COLOR_FULL,
    },
  },
  'heavy-flip-color': {
    from: {
      opacity: 0.3,
      transformPerspective: 600,
      rotationX: 30,
      x: -15,
      y: 40,
      filter: 'blur(10px)',
      color: COLOR_DIM,
    },
    to: {
      opacity: 1,
      transformPerspective: 600,
      rotationX: 0,
      x: 0,
      y: 0,
      filter: 'blur(0px)',
      color: COLOR_FULL,
    },
  },
  'flip-top-color': {
    from: {
      opacity: 0.3,
      transformPerspective: 900,
      rotationX: -20,
      y: -30,
      filter: 'blur(5px)',
      color: COLOR_DIM,
    },
    to: {
      opacity: 1,
      transformPerspective: 900,
      rotationX: 0,
      y: 0,
      filter: 'blur(0px)',
      color: COLOR_FULL,
    },
  },
}

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

      // Define initial states based on variant (the *-color variants are
      // handled by COLOR_VARIANT_TWEENS' fromTo below instead)
      const initialStates: Record<string, gsap.TweenVars> = {
        'blur-in': { opacity: 0, filter: 'blur(10px)' },
        'fade-up': { opacity: 0, y: 20 },
        'slide-stagger': { opacity: 0, x: -20 },
        'scale-pop': { opacity: 0, scale: 0.9 },
        'mask-reveal': { yPercent: 100 },
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

      if (variantKey in COLOR_VARIANT_TWEENS) {
        // Colour variants need BOTH endpoints pinned (dim → white), so a
        // fromTo is required — a plain from() would tween to the element's
        // natural computed colour instead of the 100% color-mix endpoint.
        const colorTween = COLOR_VARIANT_TWEENS[variantKey]
        gsap.fromTo(targetElements, colorTween.from, {
          ...colorTween.to,
          duration,
          delay,
          stagger,
          ease: 'power3.out',
          scrollTrigger: scrollTriggerConfig,
        })
      } else {
        gsap.from(targetElements, {
          ...initialStates[variantKey],
          duration,
          delay,
          stagger,
          ease: 'power3.out',
          scrollTrigger: scrollTriggerConfig,
        })
      }

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