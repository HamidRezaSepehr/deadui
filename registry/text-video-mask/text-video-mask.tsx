'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

export interface TextVideoMaskProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** URL of the video that plays through the text mask. */
  videoSrc: string
  /**
   * The text (or arbitrary inline HTML) the video is clipped into. Because the
   * mask reads LUMINANCE, light content reveals the video and dark content hides
   * it — style these children with a light colour to keep them visible.
   */
  children: React.ReactNode
  /** Extra classes merged onto the mask's inner text wrapper. */
  textClassName?: string
}

/**
 * `TextVideoMask` clips a playing video into the shape of its `children` using
 * an SVG `<mask>` whose content is a `<foreignObject>`.
 *
 * Why `foreignObject`: the alternative is `background-clip: text`, which only
 * ever clips to a single element's own text and cannot carry a multi-element
 * layout (a heading plus a subheading, an icon beside a word, arbitrary nested
 * markup). A `<mask>` is a full render tree, so anything React can render — with
 * any Tailwind classes — can be the mask.
 *
 * The `<video>` is the masked element: `mask-image` (set inline, because the id
 * is generated per instance below) points at the `<mask>` in the sibling `<svg>`.
 *
 * Luminance, not geometry: a mask pixel is opaque where the mask content is
 * WHITE and transparent where it is BLACK, so the base `<rect>` is black (hide
 * everything) and the `foreignObject` paints the children in white (reveal only
 * the glyphs). Feeding this the other way round — a white rect — would show the
 * video everywhere *except* the letters. The wrapper defaults to `text-white`
 * for exactly this reason; pass `textClassName` to override it (a dark colour
 * punches a hole, `text-transparent` plus `-webkit-text-stroke` reveals only the
 * outline).
 *
 * `autoPlay`, `loop`, `muted` and `playsInline` are all required, not stylistic:
 * a browser will refuse to autoplay an unmuted video, and iOS Safari will only
 * play inline (never fullscreen) when `playsInline` is present.
 *
 * `React.useId()` gives every instance its own mask id. Ids are global on a
 * page, so a hard-coded `"text-mask"` would make two instances on one page share
 * (and fight over) a single mask definition.
 *
 * The `<svg>` is absolutely positioned and full-bleed rather than `w-0 h-0`: a
 * zero-sized viewport makes the `foreignObject`'s `100%` resolve to zero, and an
 * empty mask reveals nothing. It paints no visible content of its own — it
 * exists only to hold `<defs>`.
 */
export function TextVideoMask({
  videoSrc,
  children,
  className,
  textClassName,
  ...props
}: TextVideoMaskProps) {
  const maskId = React.useId()

  return (
    <div
      className={cn('relative h-full w-full overflow-hidden', className)}
      {...props}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          mask: `url(#${maskId})`,
          WebkitMask: `url(#${maskId})`,
        }}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      <svg
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <defs>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill="black" />
            <foreignObject width="100%" height="100%">
              <div
                className={cn(
                  'flex h-full w-full items-center justify-center text-center text-white',
                  textClassName
                )}
              >
                {children}
              </div>
            </foreignObject>
          </mask>
        </defs>
      </svg>
    </div>
  )
}
