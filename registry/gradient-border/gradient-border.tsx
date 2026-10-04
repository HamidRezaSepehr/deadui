'use client'

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type MouseEvent,
} from 'react'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// `useLayoutEffect` warns when it runs during SSR. The isomorphic swap keeps
// the sizing pass pre-paint in the browser (so the border never renders at the
// wrong size for even one frame) and silent on the server.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * A rotating layer must be at least as large as the box's DIAGONAL to keep
 * covering it at every angle — see the long note on `gradient-rotate` in
 * `app/globals.css`. The diagonal is `sqrt(w^2 + h^2)`, which CSS cannot
 * compute, so it is measured here.
 *
 * A `scale()` factor is the tempting alternative and is the wrong tool: a pill
 * at 10:1 needs a factor of ~10.5 and a bar at 19:1 needs ~19.2, i.e. up to
 * ~370x the raster area. The diagonal square is exact for EVERY aspect ratio
 * and, for a typical 325x244 card, is 406x406 = 0.66MB versus 3.9MB for the
 * 3.5x scale it replaces.
 *
 * The 1.02 factor is a hair of slack so the square's inscribed circle strictly
 * contains the card's farthest corner rather than exactly touching it.
 */
const DIAGONAL_SLACK = 1.02

/**
 * Root surface only: it owns the radius, the pointer handler, the CSS custom
 * properties, and `{...props}`. It is deliberately NOT clipped and NOT padded.
 *
 * The clipping box is a child. That extra level is what makes the `blur` prop
 * work: a `filter: blur()` on a descendant is cut off by an ancestor's
 * `overflow: hidden`, and neither a negative `z-index` nor `transform: scale()`
 * can escape an overflow clip. Keeping the root unclipped lets the ambient
 * glow sit outside the clip and actually glow.
 */
export const gradientBorderVariants = cva('relative isolate', {
  variants: {
    variant: {
      // The animation goes on the gradient LAYER, never on the root. The spec's
      // own cva puts `animate-gradient-rotate` on the root, which rotates the
      // content along with the border and defeats the masking entirely.
      rotating: '',
      pulsing: '',
      static: '',
      spotlight: 'group',
    },
    radius: {
      // Each radius also publishes its length as `--gb-radius` so the content
      // mask can subtract the border width and stay concentric with the outer
      // edge. A mask at the full radius leaves a wedge of gradient in each
      // corner, because the two corner arcs are then not concentric.
      sm: 'rounded-lg [--gb-radius:0.5rem]',
      md: 'rounded-xl [--gb-radius:0.75rem]',
      lg: 'rounded-2xl [--gb-radius:1rem]',
      full: 'rounded-full [--gb-radius:9999px]',
    },
  },
  defaultVariants: {
    variant: 'rotating',
    radius: 'md',
  },
})

export interface GradientBorderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gradientBorderVariants> {
  children: React.ReactNode

  // Configuration
  colors?: string[] // Default: ['#ff0080', '#7928ca', '#00dfd8']
  speed?: number // Animation duration in seconds. Default: 4
  width?: number // Border thickness in pixels. Default: 1
  blur?: number // Glow spread outside the border. Default: 0 (no glow)
  intensity?: number // Opacity of the gradient (0 to 1). Default: 1
}

interface GradientBorderStyleVars extends CSSProperties {
  '--gb-duration'?: string
  '--gb-intensity'?: number
  '--gb-radius'?: string
  '--mouse-x'?: string
  '--mouse-y'?: string
}

export function GradientBorder({
  children,
  className,
  variant = 'rotating',
  radius = 'md',
  colors = ['#ff0080', '#7928ca', '#00dfd8'],
  speed = 4,
  width = 1,
  blur = 0,
  intensity = 1,
  style,
  ...props
}: GradientBorderProps) {
  const borderRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  const isRotating = variant === 'rotating'
  const isPulsing = variant === 'pulsing'

  const gradient = useMemo(() => {
    const stops = colors.join(', ')
    switch (variant) {
      case 'spotlight':
        return `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${stops}, transparent 60%)`
      case 'static':
        return `linear-gradient(135deg, ${stops})`
      default:
        // Closed conic: repeating the first colour at the end keeps the sweep
        // seamless, so there is no visible seam where it wraps.
        return `conic-gradient(from 0deg, ${stops}, ${colors[0]})`
    }
  }, [variant, colors])

  // Size the rotating layer to the card's diagonal. Written straight to the
  // node (no state) so resizing never triggers a React render, and observed
  // rather than read on every frame so it costs nothing during the animation.
  useIsomorphicLayoutEffect(() => {
    const card = borderRef.current
    const glow = glowRef.current
    if (!card || !glow) return

    const size = () => {
      const w = card.offsetWidth
      const h = card.offsetHeight
      if (!w || !h) return
      const d = Math.ceil(Math.sqrt(w * w + h * h) * DIAGONAL_SLACK)
      glow.style.width = `${d}px`
      glow.style.height = `${d}px`
    }

    size()
    const observer = new ResizeObserver(size)
    observer.observe(card)
    return () => observer.disconnect()
  }, [])

  // Mouse position lives in CSS custom properties written straight onto the
  // node: no useState, no useReducer, so tracking costs zero React commits.
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (variant !== 'spotlight') return
    const card = borderRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }

  // `will-change` only where something actually animates — a permanent layer
  // promotion on a static gradient is wasted GPU memory. The centring uses the
  // standalone `translate` property, which composes with the keyframes'
  // `transform: rotate()` instead of being overwritten by it.
  const glowClass = cn(
    'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
    isRotating && 'animate-gradient-rotate will-change-transform',
    isPulsing && 'animate-gradient-pulse [will-change:opacity]'
  )

  return (
    <div
      ref={borderRef}
      onMouseMove={handleMouseMove}
      className={cn(gradientBorderVariants({ variant, radius }), className)}
      style={
        {
          '--gb-duration': `${speed}s`,
          '--gb-intensity': intensity,
          // Centred until the pointer arrives, so the first paint is already
          // a sensible border rather than relying on the gradient's implicit
          // default position.
          '--mouse-x': '50%',
          '--mouse-y': '50%',
          ...style,
        } as GradientBorderStyleVars
      }
      {...props}
    >
      {/*
        Ambient glow. Lives OUTSIDE the clipping box on purpose — that is the
        only way a blurred halo survives. Painted first, and the border box that
        follows is positioned, so the box composites on top with no z-index.
        Deliberately NOT rotated: it is a soft out-of-focus copy, and rotating
        it would only reintroduce the corner-coverage problem in a place where
        the eye cannot see it. It still pulses in sync, so a pulsing border
        breathes its glow too.
      */}
      {blur > 0 && (
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 rounded-[inherit]',
            isPulsing && 'animate-gradient-pulse [will-change:opacity]'
          )}
          style={{ background: gradient, filter: `blur(${blur}px)`, opacity: intensity }}
        />
      )}

      {/* Border box: the padding ring IS the border, and this is what clips. */}
      <div
        className="relative h-full w-full overflow-hidden rounded-[inherit]"
        style={{ padding: `${width}px` }}
      >
        {/*
          Glow layer, masked by the content layer below so only the padding
          ring shows. Only the rotating variant needs the oversized square; the
          others never move, so they can stay exactly card-sized.
        */}
        {isRotating ? (
          <div
            ref={glowRef}
            aria-hidden="true"
            className={cn(glowClass, 'rounded-[inherit]')}
            style={{ background: gradient, opacity: 'var(--gb-intensity)' }}
          />
        ) : (
          <div
            aria-hidden="true"
            className={cn(
              'absolute inset-0 rounded-[inherit]',
              isPulsing && 'animate-gradient-pulse [will-change:opacity]'
            )}
            style={{ background: gradient, opacity: 'var(--gb-intensity)' }}
          />
        )}

        {/* Content layer. Sits on top of the glow and masks its centre. */}
        <div
          className="relative h-full w-full bg-dead-950"
          style={{
            // Concentric with the outer edge, the way a real CSS border is:
            // outer radius minus the border width.
            borderRadius: `max(0px, calc(var(--gb-radius, 0.75rem) - ${width}px))`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
