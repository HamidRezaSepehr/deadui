'use client'

import type { CSSProperties } from 'react'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * The animated gradient, shared by every decorative layer (ring, glow, and the
 * `gradient-text` face).
 *
 * `--color-1` … `--color-5` are plain CSS custom properties that `deadui init`
 * writes into the project's stylesheet — they are deliberately NOT Tailwind
 * theme colours, so they never generate `bg-color-1` utilities and cannot
 * collide with the `dead-*` palette.
 *
 * `background-size: 200% auto` with a gradient that starts and ends on
 * `var(--color-1)` is what makes the sweep seamless: the `rainbow` keyframe
 * moves `background-position` from `0%` to `200%`, which shifts the paint box
 * by exactly one full gradient width, so the last frame is pixel-identical to
 * the first.
 *
 * `motion-reduce:animate-none` rather than a `motion-safe:` prefix on
 * `animate-rainbow`, because `animate-rainbow` is a CUSTOM utility: under
 * Tailwind v4 `init` writes it as a plain `@layer utilities` rule, and Tailwind
 * cannot attach a variant to a utility it did not generate itself — so
 * `motion-safe:animate-rainbow` would emit nothing and the border would never
 * animate at all. `animate-none` is a core utility in v3 and v4, so gating the
 * opt-out with it works in both. (In v4 the reduced-motion block `init` writes
 * is unlayered and also wins; belt and braces.)
 */
const RAINBOW_GRADIENT =
  '[background-image:linear-gradient(to_right,var(--color-1),var(--color-2),var(--color-3),var(--color-4),var(--color-5),var(--color-1))] ' +
  '[background-size:200%_auto] animate-rainbow motion-reduce:animate-none'

/**
 * The animated BORDER RING.
 *
 * Two mask layers, the first clipped to `content-box`, composited with
 * `exclude`: what survives is the padding ring and nothing else, so the gradient
 * reads as a border without a real `border` being involved (a real `border`
 * cannot be animated). `content-box` is only honoured because Tailwind's preflight
 * sets `box-sizing: border-box`, and `rounded-[inherit]` makes the ring concentric
 * with the button's own radius.
 *
 * LONGHANDS, NOT THE `mask` SHORTHAND, and this is load-bearing rather than
 * stylistic. `[mask: <image> content-box, <image>]` is how this trick is normally
 * written, but `mask` is a shorthand and therefore resets `mask-composite` back to
 * its initial `add`. Tailwind emits the `[mask-composite:exclude]` utility before
 * the `[mask:…]` one (arbitrary utilities are sorted, and `mask` is a shorthand so
 * it sorts later), so `add` wins the cascade and the layer paints as a solid fill
 * instead of a frame. It looks correct in Chrome purely by accident: Lightning CSS
 * compiles the prefixed `-webkit-mask` shorthand, which sets
 * `-webkit-mask-composite: xor` alongside it. Firefox exposes
 * `-webkit-mask-composite` as a plain alias of `mask-composite`, so `add` would win
 * there and the ring would vanish into a full gradient panel — same markup, same
 * classes, different engine.
 *
 * `mask-image` / `mask-clip` / `mask-composite` are independent longhands, so none
 * of them resets another and their order stops mattering. Lightning CSS then emits
 * the right prefixed fallback for each.
 *
 * `-webkit-mask-composite` uses different keywords from the standard property
 * (`xor`, not `exclude`), which is exactly why the prefixed fallback cannot be
 * written by hand here.
 */
const RAINBOW_RING =
  'pointer-events-none absolute inset-0 rounded-[inherit] ' +
  '[padding:var(--rainbow-border-width,1px)] ' +
  '[mask-image:linear-gradient(#fff_0_0),linear-gradient(#fff_0_0)] ' +
  '[mask-clip:content-box,border-box] ' +
  '[mask-composite:exclude] ' +
  RAINBOW_GRADIENT

/**
 * Root surface only: it owns the radius, `isolate`, `{...props}` and the CSS
 * custom properties. It is deliberately NOT clipped, NOT padded, and NOT
 * coloured.
 *
 * Two structural decisions, both forced by the `glow` variant:
 *
 * 1. **No `overflow-hidden` on the root.** A `filter: blur()` on a descendant is
 *    cut off by an ancestor's overflow clip, and neither a negative `z-index`
 *    nor `transform: scale()` escapes one. The halo has to live outside the
 *    clip to actually glow.
 * 2. **The colour lives on a separate face layer, not on the root.** With the
 *    root unclipped, the blurred halo is a positioned sibling of the root's own
 *    background — and a positioned descendant paints ABOVE it, so a halo painted
 *    into the button's face would wash the label out. `isolate` gives the root
 *    its own stacking context, but that does not help: negative `z-index`
 *    children still paint above the element's own background. An opaque face
 *    layer is what punches the middle back out.
 */
export const rainbowButtonVariants = cva(
  'relative isolate inline-flex items-center justify-center rounded-lg font-medium tracking-tight transition-[transform,background-color,color,box-shadow] duration-200 ease-out active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dead-red focus-visible:ring-offset-2 focus-visible:ring-offset-dead-950 disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      // Every entry is empty, exactly as `gradient-border`'s are: the look
      // belongs on the layers below, not on the root. See
      // `rainbowButtonFaceVariants` for the actual classes, and the note above
      // for why.
      variant: {
        default: '',
        outline: '',
        'gradient-text': '',
        glow: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

/**
 * Sizing lives on the FACE, not the root, and that placement is load-bearing.
 *
 * The face has to be in normal flow so the button's intrinsic width comes from
 * its label. An `absolute inset-0` face contributes nothing to layout, which
 * collapses the root to its bare padding — every button measured 40x40
 * regardless of label, with the text overflowing its own box. That is invisible
 * for the solid variants (an overflowing dark label on a dark background still
 * looks like a button) and catastrophic for `gradient-text`, where the label is
 * `color: transparent` and the only thing that makes it visible is the
 * background painted behind it — so any glyph outside the face's background box
 * simply vanishes.
 *
 * Putting the padding on the face (rather than keeping it on the root) is what
 * keeps the face exactly coincident with the root's box, so `rounded-[inherit]`
 * stays concentric with the ring's own radius instead of being inset by a
 * padding the ring is already occupying.
 */
export const rainbowButtonSizeVariants = cva('relative z-10 flex items-center justify-center', {
  variants: {
    size: {
      sm: 'h-8 px-3 text-xs',
      default: 'h-10 px-5 text-sm',
      lg: 'h-12 px-8 text-base',
      icon: 'size-10 p-0 text-sm',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

/**
 * The coloured layer. Split out of the root so the clipped ring and the
 * unclipped halo can be drawn underneath it.
 */
export const rainbowButtonFaceVariants = cva('rounded-[inherit]', {
  variants: {
    variant: {
      default: 'bg-dead-50 text-dead-950',
      outline: 'bg-transparent text-dead-50',
      // `background-clip: text` paints the element's own background only where
      // its text is, and `text-transparent` hands the glyphs over to it. The
      // text here is a flex child of this element, which is fine: the clip
      // applies to all text painted inside this element's box.
      'gradient-text':
        'bg-transparent text-transparent [-webkit-background-clip:text] [background-clip:text] ' +
        RAINBOW_GRADIENT,
      glow: 'bg-dead-50 text-dead-950',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

interface RainbowButtonStyleVars extends CSSProperties {
  '--speed'?: string
  '--rainbow-border-width'?: string
}

/** Which variants draw each decorative layer. */
const HAS_RING = new Set(['default', 'outline', 'glow'])
const HAS_GLOW = new Set(['default', 'glow'])

/**
 * The halo. `default` is a tight, low-opacity band nudged slightly downward;
 * `glow` is wider and far more opaque. Both use `rounded-[inherit]`, which on a
 * box larger than the button yields corners that are marginally too square —
 * invisible under a 12-24px blur, and cheaper than computing a radius that
 * offsets with the negative inset.
 */
const GLOW_CLASSES: Record<string, string> = {
  default: '-inset-1 -translate-y-0.5 rounded-[inherit] blur-md opacity-50',
  glow: '-inset-2 rounded-[inherit] blur-xl opacity-70',
}

export interface RainbowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof rainbowButtonVariants>,
    VariantProps<typeof rainbowButtonSizeVariants> {
  children: React.ReactNode

  /** Thickness of the animated ring in pixels. Default: 1. */
  borderWidth?: number
  /** Seconds for one full rainbow cycle. Default: 2. */
  speed?: number
}

export function RainbowButton({
  children,
  className,
  variant = 'default',
  size = 'default',
  borderWidth = 1,
  speed = 2,
  style,
  ...props
}: RainbowButtonProps) {
  const key = variant ?? 'default'

  return (
    <button
      className={cn(rainbowButtonVariants({ variant }), className)}
      style={
        {
          '--speed': `${speed}s`,
          '--rainbow-border-width': `${borderWidth}px`,
          ...style,
        } as RainbowButtonStyleVars
      }
      {...props}
    >
      {HAS_GLOW.has(key) && (
        <span
          aria-hidden="true"
          className={cn('pointer-events-none absolute', GLOW_CLASSES[key], RAINBOW_GRADIENT)}
        />
      )}

      {HAS_RING.has(key) && (
        <span aria-hidden="true" className={RAINBOW_RING} />
      )}

      <span
        className={cn(
          rainbowButtonSizeVariants({ size }),
          rainbowButtonFaceVariants({ variant })
        )}
      >
        {children}
      </span>
    </button>
  )
}