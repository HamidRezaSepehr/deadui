'use client'

import { createContext, useContext } from 'react'
import { motion, type HTMLMotionProps } from 'motion/react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const staggeredGridVariants = cva(
  '',
  {
    variants: {
      variant: {
        'fade-up': { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } },
        'scale-in': { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } },
        'blur-in': { initial: { opacity: 0, filter: 'blur(10px)' }, animate: { opacity: 1, filter: 'blur(0px)' } },
        'slide-left': { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 } },
        'slide-right': { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 } },
        'flip-x': { initial: { opacity: 0, rotateX: 45 }, animate: { opacity: 1, rotateX: 0 } },
        'flip-y': { initial: { opacity: 0, rotateY: 45 }, animate: { opacity: 1, rotateY: 0 } },
      },
    },
    defaultVariants: {
      variant: 'fade-up',
    },
  }
)

export interface StaggeredGridProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragEnter' | 'onDragLeave' | 'onDragOver' | 'onDrop'>,
    VariantProps<typeof staggeredGridVariants> {
  children: React.ReactNode

  stagger?: number
  duration?: number
  delay?: number
  ease?: string

  threshold?: number
  once?: boolean
  rootMargin?: string

  containerClassName?: string
}

interface GridVariantContextValue {
  variant: StaggeredGridProps['variant']
  duration: number
  ease: string
}

const GridVariantContext = createContext<GridVariantContextValue>({
  variant: 'fade-up',
  duration: 0.6,
  ease: 'easeOut',
})

const motionVariants = {
  'fade-up': { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } },
  'scale-in': { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } },
  'blur-in': { hidden: { opacity: 0, filter: 'blur(10px)' }, visible: { opacity: 1, filter: 'blur(0px)' } },
  'slide-left': { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } },
  'slide-right': { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } },
  'flip-x': { hidden: { opacity: 0, rotateX: 45 }, visible: { opacity: 1, rotateX: 0 } },
  'flip-y': { hidden: { opacity: 0, rotateY: 45 }, visible: { opacity: 1, rotateY: 0 } },
} as const

export function StaggeredGrid({
  children,
  className,
  containerClassName,
  variant = 'fade-up',
  stagger = 0.1,
  duration = 0.6,
  delay = 0,
  ease = 'easeOut',
  threshold = 0.1,
  once = true,
  rootMargin = '0px',
  ...props
}: StaggeredGridProps) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  }

  const contextValue = { variant, duration, ease }

  return (
    <GridVariantContext.Provider value={contextValue}>
      <motion.div
        className={cn('w-full', containerClassName, className)}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount: threshold, margin: rootMargin }}
        {...(props as React.ComponentProps<typeof motion.div>)}
      >
        {children}
      </motion.div>
    </GridVariantContext.Provider>
  )
}

export interface StaggeredItemProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
}

export function StaggeredItem({
  children,
  className,
  ...props
}: StaggeredItemProps) {
  const { variant, duration, ease } = useContext(GridVariantContext)

  const currentVariant = motionVariants[variant || 'fade-up']

  return (
    <motion.div
      variants={currentVariant}
      transition={{ duration, ease }}
      className={cn('', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}