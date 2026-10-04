'use client'

import { useRef, type MouseEvent } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const magneticButtonVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium transition-colors duration-300',
  {
    variants: {
      variant: {
        default: 'bg-dead-50 text-dead-950 hover:bg-dead-400',
        outline: 'border border-dead-800 text-dead-50 hover:bg-dead-800',
        glow: 'bg-dead-red text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]',
        ghost: 'text-dead-400 hover:text-dead-50 hover:bg-dead-800',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
      },
      shape: {
        rounded: 'rounded-full',
        soft: 'rounded-lg',
        sharp: 'rounded-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      shape: 'rounded',
    },
  }
)

export interface MagneticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof magneticButtonVariants> {
  children: React.ReactNode
  magneticStrength?: number // Default: 0.4 (0 to 1, how strongly it pulls)
  elasticity?: number       // Default: 0.2 (spring stiffness/damping ratio)
}

export function MagneticButton({
  children,
  className,
  variant,
  size,
  shape,
  magneticStrength = 0.4,
  elasticity = 0.2,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const shouldReduceMotion = useReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // elasticity scales the spring stiffness so the default (0.2) reproduces
  // the spec spring exactly: { stiffness: 150, damping: 15, mass: 0.8 }.
  // Higher values = springier, more elastic snap-back; lower = stiffer.
  const { stiffness, damping, mass } = {
    stiffness: 150 * (elasticity / 0.2),
    damping: 15,
    mass: 0.8,
  }
  const springConfig = { stiffness, damping, mass }
  const xSpring = useSpring(x, springConfig)
  const ySpring = useSpring(y, springConfig)

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!ref.current || shouldReduceMotion) return
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const centerX = left + width / 2
    const centerY = top + height / 2

    const distanceX = clientX - centerX
    const distanceY = clientY - centerY

    x.set(distanceX * magneticStrength)
    y.set(distanceY * magneticStrength)
  }

  const handleMouseLeave = () => {
    if (shouldReduceMotion) return
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: shouldReduceMotion ? 0 : xSpring, y: shouldReduceMotion ? 0 : ySpring }}
      className={cn(magneticButtonVariants({ variant, size, shape }), className)}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  )
}