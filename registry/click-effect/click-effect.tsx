'use client'

import { useEffect } from 'react'
import type { ClickEffectVariant, EffectConfig } from './effects'

export interface ClickEffectProps {
  /**
   * The effect to fire on every window click. `'none'` disables the listener.
   * @default 'virethos'
   */
  variant?: ClickEffectVariant
}

/**
 * Behavior-only component: it renders nothing and attaches a single `click`
 * listener to `window`, replaying the selected mo.js effect at the pointer's
 * `clientX` / `clientY`. Effects flagged `requiresGenerate` re-sample their
 * `rand(...)` values via `.tune(coords).generate().replay()`; effects flagged
 * `useRandomCoords` tune to the click point plus a random ±30px offset.
 *
 * The effect table is loaded with a dynamic `import()` inside the effect, not
 * a static import: `@mojs/core` executes browser-only DOM code (`self`,
 * `document`, `navigator`) at module evaluation time, so a static import would
 * crash server-side rendering. The type-only import above is erased at compile
 * time and costs nothing at runtime.
 */
export function ClickEffect({ variant = 'virethos' }: ClickEffectProps) {
  useEffect(() => {
    if (variant === 'none') return

    let disposed = false
    let table: EffectConfig[] | null = null

    const handleClick = (e: MouseEvent) => {
      const config = table?.find((ef) => ef.name === variant)
      if (!config) return

      const coords = { left: e.clientX, top: e.clientY }

      config.animations.forEach((wrapper) => {
        const { requiresGenerate, useRandomCoords, animation } = wrapper

        if (requiresGenerate && useRandomCoords) {
          const randomCoords = {
            left: e.clientX + (Math.random() * 60 - 30),
            top: e.clientY + (Math.random() * 60 - 30),
          }
          animation.tune(randomCoords).generate().replay()
        } else if (requiresGenerate) {
          animation.tune(coords).generate().replay()
        } else if (useRandomCoords) {
          const randomCoords = {
            left: e.clientX + (Math.random() * 60 - 30),
            top: e.clientY + (Math.random() * 60 - 30),
          }
          animation.tune(randomCoords).replay()
        } else {
          animation.tune(coords).replay()
        }
      })
    }

    import('./effects').then((module) => {
      if (disposed) return
      table = module.effects
    })

    window.addEventListener('click', handleClick)
    return () => {
      disposed = true
      window.removeEventListener('click', handleClick)
    }
  }, [variant])

  return null // Behavior-only component
}
