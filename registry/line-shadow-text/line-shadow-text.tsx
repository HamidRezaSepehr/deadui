'use client'

import { type CSSProperties, type HTMLAttributes } from 'react'
import { motion, type DOMMotionComponents, type MotionProps } from 'motion/react'
import { cn } from '@/lib/utils'

const motionElements = {
  article: motion.article,
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  li: motion.li,
  p: motion.p,
  section: motion.section,
  span: motion.span,
} as const

type MotionElementType = Extract<keyof DOMMotionComponents, keyof typeof motionElements>

export interface LineShadowTextProps
  extends Omit<HTMLAttributes<HTMLElement>, keyof MotionProps>,
    MotionProps {
  /** Plain text content — also mirrored into the decorative shadow layer. */
  children: string
  /** Colour of the line shadow. Default: "black" */
  shadowColor?: string
  /** Distance the shadow layer sits from the text. Default: "0.04em" */
  shadowOffset?: string
  /** Hatch tile size — the distance the shadow travels per cycle. Default: "0.06em" */
  shadowWidth?: string
  /** Angle of the diagonal lines in degrees. Default: 45 */
  angle?: number
  /** Length of one animation cycle, e.g. "2s". Default: "2s" */
  duration?: string
  /** Element to render. Default: "span" */
  as?: MotionElementType
}

export function LineShadowText({
  children,
  shadowColor = 'black',
  shadowOffset = '0.04em',
  shadowWidth = '0.06em',
  angle = 45,
  duration = '2s',
  className,
  as: Component = 'span',
  ...props
}: LineShadowTextProps) {
  const MotionComponent = motionElements[Component]

  return (
    <MotionComponent
      style={
        {
          '--shadow-color': shadowColor,
          '--shadow-offset': shadowOffset,
          '--shadow-width': shadowWidth,
          '--shadow-angle': `${angle}deg`,
          '--shadow-duration': duration,
        } as CSSProperties
      }
      className={cn(
        'relative z-0 inline-flex',
        'after:absolute after:top-[var(--shadow-offset)] after:left-[var(--shadow-offset)] after:content-[attr(data-text)]',
        'after:bg-[linear-gradient(var(--shadow-angle),transparent_45%,var(--shadow-color)_45%,var(--shadow-color)_55%,transparent_0)]',
        // Tile the gradient at the shadow's own width: the `line-shadow`
        // keyframe then advances the background by exactly one tile per cycle,
        // which makes the loop seamless by construction and keeps the props
        // (angle/width/colour) meaningful on the painted result.
        'after:[background-size:var(--shadow-width)_var(--shadow-width)]',
        'after:-z-10 after:bg-clip-text after:text-transparent',
        'after:animate-line-shadow',
        className
      )}
      data-text={children}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}
