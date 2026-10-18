'use client'

import { useEffect, useRef } from 'react'
import type { ClickEffectVariant, EffectConfig } from './effects'

export interface ClickEffectProps {
  /**
   * The effect to fire on every click. `'none'` disables the listener.
   * @default 'virethos'
   */
  variant?: ClickEffectVariant
  /**
   * Where the effect lives:
   *
   * - `'page'` (default) — one click listener on `window`, bursts rendered in
   *   a fixed overlay that covers the viewport, so a click anywhere fires at
   *   the pointer.
   * - `'parent'` — the listener is attached to the component's own parent
   *   element instead of `window`, and the burst renders (and is clipped)
   *   inside that element. Only clicks on the parent or its descendants fire,
   *   which is what makes each card's effect its own. The parent should be
   *   `position: relative`.
   *
   * @default 'page'
   */
  scope?: 'page' | 'parent'
}

const OVERLAY_CLASS = {
  page: 'pointer-events-none fixed inset-0 z-[9999] overflow-hidden',
  parent: 'pointer-events-none absolute inset-0 z-10 overflow-hidden',
} as const

/**
 * Behavior-only component: it renders one invisible overlay and replays a
 * mo.js effect at the pointer on every click.
 *
 * The effect is built for, and rendered into, that overlay — mo.js positions
 * its shapes in the overlay's coordinate space, so each click is mapped to
 * `overlay.getBoundingClientRect()`-relative coordinates. Using the overlay
 * rather than raw `clientX` / `clientY` is what keeps the burst exactly on the
 * click: `clientX` / `clientY` are viewport coordinates, while an absolutely
 * positioned mo.js shape is laid out against its container, so the naive
 * version drifted by the scroll offset.
 *
 * The effect table is loaded with a dynamic `import()` inside the effect, not
 * a static import: `@mojs/core` executes browser-only DOM code (`self`,
 * `document`, `navigator`) at module evaluation time, so a static import would
 * crash server-side rendering. The type-only import above is erased at compile
 * time and costs nothing at runtime.
 */
export function ClickEffect({
  variant = 'virethos',
  scope = 'page',
}: ClickEffectProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay || variant === 'none') return

    let disposed = false
    let effect: EffectConfig | undefined

    const handleClick = (event: MouseEvent) => {
      if (!effect) return

      const { left, top } = overlay.getBoundingClientRect()
      const x = event.clientX - left
      const y = event.clientY - top

      effect.animations.forEach((wrapper) => {
        const { requiresGenerate, useRandomCoords, animation } = wrapper

        const coords = useRandomCoords
          ? { left: x + (Math.random() * 60 - 30), top: y + (Math.random() * 60 - 30) }
          : { left: x, top: y }

        if (requiresGenerate) {
          animation.tune(coords).generate().replay()
        } else {
          animation.tune(coords).replay()
        }
      })
    }

    const target: EventTarget | null =
      scope === 'parent' ? overlay.parentElement : window

    import('./effects').then((module) => {
      if (disposed) return
      effect = module.createEffect(variant, overlay)
    })

    target?.addEventListener('click', handleClick as EventListener)
    return () => {
      disposed = true
      target?.removeEventListener('click', handleClick as EventListener)
      // The mo.js nodes live inside this overlay, so clearing it both drops
      // the finished animations and stops them accumulating across variant
      // changes.
      overlay.replaceChildren()
    }
  }, [variant, scope])

  return <div ref={overlayRef} aria-hidden="true" className={OVERLAY_CLASS[scope]} />
}
