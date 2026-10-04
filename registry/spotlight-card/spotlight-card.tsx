'use client'

import { useEffect, useRef, type CSSProperties, type MouseEvent } from 'react'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Timing for the 3D tilt's `transform` transition.
 *
 * The transition is present while the card sits at rest and is restored on
 * `mouseleave`, which is what produces the eased snap-back to flat. During
 * active tracking the duration is swapped to `0ms` so the tilt follows the
 * cursor 1:1 — transitioning on every `mousemove` is what reads as lag.
 */
const TILT_RETURN_DURATION = '300ms'

/**
 * Border-only mask: two identical opaque layers, the first pinned to the
 * `content-box`, the second filling the `border-box`. `mask-composite:
 * exclude` (WebKit fallback `xor`) subtracts the content box from the border
 * box, so the gradient is painted only inside the 1px padding ring — the
 * border. Nothing bleeds into the card surface.
 */
const BORDER_MASK = 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)'

export const spotlightCardVariants = cva(
  'relative overflow-hidden rounded-xl border transition-colors duration-300',
  {
    variants: {
      shape: {
        rounded: 'rounded-2xl',
        soft: 'rounded-lg',
        sharp: 'rounded-none',
      },
    },
    defaultVariants: {
      shape: 'rounded',
    },
  }
)

export interface SpotlightCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spotlightCardVariants> {
  children: React.ReactNode

  // Spotlight Configuration
  spotlightColor?: string // Default: 'rgba(255, 255, 255, 0.15)'
  spotlightSize?: number // Diameter in pixels. Default: 300
  spotlightOpacity?: number // 0 to 1. Default: 1

  // Glow Modes
  glowType?: 'border' | 'background' | 'both' | 'none' // Default: 'both'

  // Border Colors
  borderColor?: string // Default: 'rgba(255, 255, 255, 0.1)'
  hoveredBorderColor?: string // Default: 'rgba(255, 255, 255, 0.3)'

  // 3D Tilt Configuration
  enableTilt?: boolean // Default: false
  tiltIntensity?: number // Max rotation in degrees. Default: 10
}

interface SpotlightCardStyleVars extends CSSProperties {
  '--mouse-x'?: string
  '--mouse-y'?: string
  '--spotlight-color'?: string
  '--spotlight-size'?: string
  '--spotlight-opacity'?: number
  '--border-color'?: string
  '--hovered-border-color'?: string
  '--rotate-x'?: string
  '--rotate-y'?: string
}

export function SpotlightCard({
  children,
  className,
  style,
  shape,
  spotlightColor = 'rgba(255, 255, 255, 0.15)',
  spotlightSize = 300,
  spotlightOpacity = 1,
  glowType = 'both',
  borderColor = 'rgba(255, 255, 255, 0.1)',
  hoveredBorderColor = 'rgba(255, 255, 255, 0.3)',
  enableTilt = false,
  tiltIntensity = 10,
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isTrackingRef = useRef(false)
  const prefersReducedMotionRef = useRef(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      prefersReducedMotionRef.current = query.matches
    }
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  // Mouse tracking writes CSS custom properties straight onto the DOM node.
  // No useState, no useReducer, no re-render: a mousemove costs one style
  // write on one element, so the spotlight stays locked to the cursor at 60fps.
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return

    // Until the tilt is active, getBoundingClientRect() IS the layout box, so
    // the spec's exact formula applies. Once the card is rotated the rect
    // becomes the rotated bounding box and the naive offset would drift by the
    // transform overflow, so anchor on the visual center and re-expand by the
    // untransformed layout size instead.
    const rect = card.getBoundingClientRect()
    const width = enableTilt ? card.offsetWidth || rect.width : rect.width
    const height = enableTilt ? card.offsetHeight || rect.height : rect.height
    const x = enableTilt
      ? e.clientX - (rect.left + rect.width / 2) + width / 2
      : e.clientX - rect.left
    const y = enableTilt
      ? e.clientY - (rect.top + rect.height / 2) + height / 2
      : e.clientY - rect.top

    card.style.setProperty('--mouse-x', `${x}px`)
    card.style.setProperty('--mouse-y', `${y}px`)

    if (enableTilt && !prefersReducedMotionRef.current) {
      const rotateX = ((y - height / 2) / (height / 2)) * -tiltIntensity
      const rotateY = ((x - width / 2) / (width / 2)) * tiltIntensity

      if (!isTrackingRef.current) {
        card.style.transitionDuration = '0ms'
        isTrackingRef.current = true
      }

      card.style.setProperty('--rotate-x', `${rotateX}deg`)
      card.style.setProperty('--rotate-y', `${rotateY}deg`)
    }
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card || !isTrackingRef.current) return
    isTrackingRef.current = false

    // Restore the transition *and* the flat rotation in the same style change
    // batch: CSS reads transition parameters from the after-change style, so
    // the return animates over TILT_RETURN_DURATION instead of snapping.
    card.style.transitionDuration = TILT_RETURN_DURATION
    card.style.setProperty('--rotate-x', '0deg')
    card.style.setProperty('--rotate-y', '0deg')
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        spotlightCardVariants({ shape }),
        'group',
        enableTilt && 'will-change-transform',
        className
      )}
      style={
        {
          '--mouse-x': '50%',
          '--mouse-y': '50%',
          '--spotlight-color': spotlightColor,
          '--spotlight-size': `${spotlightSize}px`,
          '--spotlight-opacity': spotlightOpacity,
          '--border-color': borderColor,
          '--hovered-border-color': hoveredBorderColor,
          '--rotate-x': '0deg',
          '--rotate-y': '0deg',
          // The visible hairline is drawn by the base-border layer below, so
          // the cva's own 1px border is collapsed to keep a single ring flush
          // with the card edge.
          borderWidth: 0,
          ...(enableTilt
            ? {
                transform:
                  'perspective(1000px) rotateX(var(--rotate-x)) rotateY(var(--rotate-y))',
                transition: `transform ${TILT_RETURN_DURATION} ease-out`,
              }
            : {}),
          ...style,
        } as SpotlightCardStyleVars
      }
      {...props}
    >
      {/* Background Glow Layer */}
      {(glowType === 'background' || glowType === 'both') && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent var(--spotlight-size))`,
              opacity: 'var(--spotlight-opacity)',
            }}
          />
        </div>
      )}

      {/* Border Glow Layer — masked to the 1px ring, never the card surface */}
      {(glowType === 'border' || glowType === 'both') && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
          style={{
            padding: '1px',
            mask: BORDER_MASK,
            WebkitMask: BORDER_MASK,
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
          }}
        >
          <div
            className="absolute inset-0 rounded-[inherit]"
            style={{
              background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--hovered-border-color), transparent var(--spotlight-size))`,
              opacity: 'var(--spotlight-opacity)',
            }}
          />
        </div>
      )}

      {/* Base Border */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ border: '1px solid var(--border-color)' }}
      />

      {/* Content */}
      <div className="relative z-10 h-full w-full p-6">{children}</div>
    </div>
  )
}
