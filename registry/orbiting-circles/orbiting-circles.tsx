'use client'

import React from 'react'
import { cn } from '@/lib/utils'

/* The counter-rotation CSS for the whole component ships WITH the
   component (embedded <style>, not styled-jsx and not a globals.css
   change), so the exact file the CLI installs is fully self-contained
   in any Next.js consumer project.

   HOW UPRIGHTNESS WORKS (the critical requirement):
   1. OrbitItem's outer div is placed on the ring with the static
      transform `translate(-50%, -50%) rotate(angle) translateX(var(--orbit-radius))
      rotate(-angle)`.
      The leading `translate(-50%, -50%)` centres the item's box on the ring
      centre first (so the item's own centre — the counter-rotation pivot —
      lands EXACTLY on the circle of `--orbit-radius`, not radius + half the
      item), and the trailing `rotate(-angle)` unwinds the placement angle,
      so at ring rotation 0 the item's local axes are axis-aligned with the
      viewport (the icon sits upright at its starting position).
   2. The ring rotates `0 -> 360deg` (orbit-spin), carrying the item
      around. Without any correction the icon would spin with it.
   3. OrbitItem's INNER div counter-rotates `0 -> -360deg`
      (orbit-counter-spin) over the SAME duration, linearly, starting
      at the same time. `-θ + θ = 0` at every frame, so the icon never
      spins about its own centre.
   4. Reverse (counter-clockwise) rings: the counter target flips to
      `+360deg` via `--orbit-counter-target`. This is a KEYFRAME value
      change, not an `animation-direction: reverse`, because reversing
      the direction of a `0 -> -360` animation shifts its phase and the
      two cancelling rotations stop matching mid-cycle.

   Both rings are centred with negative margins (no translate on the
   animated transform), so with `animation: none` under reduced motion
   everything falls back to a static, upright, correctly-arranged
   diagram. `!important` is required because the animation is applied
   as an inline style, and only an !important rule beats an inline
   declaration. */
const ORBIT_CIRCLES_CSS = `
@keyframes orbit-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes orbit-counter-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(var(--orbit-counter-target, -360deg)); }
}
@media (prefers-reduced-motion: reduce) {
  .deadui-orbit-ring,
  .deadui-orbit-item-inner {
    animation: none !important;
  }
}
`

interface OrbitContextValue {
  duration: number
  reverse: boolean
}

const OrbitContext = React.createContext<OrbitContextValue>({
  duration: 20,
  reverse: false,
})

// --- Orbit ---

export interface OrbitProps extends React.HTMLAttributes<HTMLDivElement> {
  radius: number
  duration?: number // seconds per full revolution
  reverse?: boolean // counter-clockwise
  path?: boolean // show the ring border
  children: React.ReactNode
}

export function Orbit({
  radius,
  duration = 20,
  reverse = false,
  path = true,
  children,
  className,
  ...props
}: OrbitProps) {
  const direction = reverse ? 'reverse' : 'normal'

  return (
    <div
      className={cn(
        'deadui-orbit-ring absolute top-1/2 left-1/2 rounded-full border',
        path ? 'border-dead-border/20' : 'border-transparent',
        className
      )}
      style={
        {
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
          marginTop: `${-radius}px`,
          marginLeft: `${-radius}px`,
          '--orbit-radius': `${radius}px`,
          '--orbit-duration': `${duration}s`,
          animation: `orbit-spin ${duration}s linear infinite ${direction}`,
        } as React.CSSProperties
      }
      {...props}
    >
      <OrbitContext.Provider value={{ duration, reverse }}>
        {children}
      </OrbitContext.Provider>
    </div>
  )
}

// --- OrbitItem ---

export interface OrbitItemProps extends React.HTMLAttributes<HTMLDivElement> {
  angle: number // degrees clockwise from 3 o'clock (0 = right)
  children: React.ReactNode
}

export function OrbitItem({ angle, className, children, ...props }: OrbitItemProps) {
  const { duration, reverse } = React.useContext(OrbitContext)
  // Normal ring spins +360deg per cycle -> counter must be -360deg.
  // Reverse ring spins -360deg per cycle -> counter must be +360deg.
  const counterTarget = reverse ? 360 : -360

  return (
    <div
      className={cn('deadui-orbit-item absolute top-1/2 left-1/2', className)}
      style={{
        transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(var(--orbit-radius, 100px)) rotate(${-angle}deg)`,
      }}
      {...props}
    >
      <div
        className="deadui-orbit-item-inner flex items-center justify-center"
        style={
          {
            '--orbit-counter-target': `${counterTarget}deg`,
            animation: `orbit-counter-spin ${duration}s linear infinite`,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </div>
  )
}

// --- OrbitingCircles ---

export interface OrbitingCirclesProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function OrbitingCircles({ children, className, ...props }: OrbitingCirclesProps) {
  return (
    <div
      className={cn(
        'relative w-full h-full min-h-[400px] flex items-center justify-center overflow-hidden',
        className
      )}
      {...props}
    >
      <style dangerouslySetInnerHTML={{ __html: ORBIT_CIRCLES_CSS }} />
      {children}
    </div>
  )
}