'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
} from 'react'
import { motion, type MotionStyle, type TargetAndTransition } from 'motion/react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Structural classes for a single trail image.
 *
 * The spec's cva string is kept verbatim, and it is applied to the TRAIL ITEM,
 * not to the container: `pointer-events-none` and `will-change-transform` are
 * both trail-item concerns (the item must never intercept a click, and it is
 * the thing whose transform is animated every frame). The container keeps the
 * spec's example classes instead (`relative w-full h-full overflow-hidden`),
 * because `fixed top-0` on the container would take it out of flow entirely and
 * it would collapse to the size of its (empty) content box.
 *
 * `position` is overridden back to `absolute` at the call site with `cn()`, so
 * the item is laid out against the container's padding box and clipped by the
 * container's `overflow-hidden` — which is what a trail inside a panel needs.
 * The `left`/`top` from the cva are in any case overridden by the inline
 * position of each item (an inline style outranks any class).
 */
export const imageTrailVariants = cva(
  'fixed top-0 left-0 pointer-events-none will-change-transform',
  {
    variants: {
      // Variants are handled dynamically via Motion (see `EFFECT_VARIANTS`),
      // but we keep cva for base structural classes.
    },
    defaultVariants: {},
  }
)

export type TrailEffect =
  | 'fade-scale'
  | 'rotate-scale'
  | '3d-rotate'
  | 'blur-fade'
  | 'clip-circle'
  | 'skew-fade'

/** Ordered effect list, so a consumer can build a switcher without hand-typing it. */
export const TRAIL_EFFECTS: readonly TrailEffect[] = [
  'fade-scale',
  'rotate-scale',
  '3d-rotate',
  'blur-fade',
  'clip-circle',
  'skew-fade',
]

export interface ImageTrailProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image URLs to cycle through. One is spawned per accepted move. */
  images: string[]

  // Behavior
  /** Which of the six Codrops-inspired styles to play. Default: 'fade-scale' */
  effect?: TrailEffect
  /** Max images visible at once. Default: 6 */
  trailSize?: number
  /** Min mouse movement (px) between spawns. Default: 15 */
  velocityThreshold?: number
  /** Min ms between spawns, so a fast flick cannot flood the trail. Default: 50 */
  spawnRate?: number

  // Styling
  /** Width/height in pixels. Default: 120 */
  imageSize?: number
  /** Animation duration in seconds. Also the item's lifetime. Default: 0.8 */
  duration?: number
  /** Tailwind radius class. Default: 'rounded-lg' */
  borderRadius?: string
}

export interface TrailItem {
  /** Monotonic. `performance.now()` alone can collide at sub-millisecond rates. */
  id: number
  x: number
  y: number
  imageIndex: number
  /** `performance.now()` at spawn, in the same clock the prune sweep reads. */
  timestamp: number
}

/**
 * One entry per effect.
 *
 * `style` is merged onto the trail item's inline style. The spec uses it for
 * one thing — `3d-rotate`'s `transformPerspective` — and the same number is
 * ALSO read back off the active definition to decide whether the CONTAINER
 * needs a `perspective`. See `THE 3D PERSPECTIVE` below; the short version is
 * that Blink does not implement the standalone `transform-perspective`
 * property, so the spec's "on the parent or element" note has exactly one half
 * that can be honoured.
 *
 * Typed as `MotionStyle` rather than `React.CSSProperties` because
 * `transform-perspective` is CSS Transforms 2 and csstype (which
 * `CSSProperties` is built on) does not model it. `MotionStyle` is the exact
 * type of the `style` prop this object is spread into.
 */
export interface TrailEffectDefinition {
  initial: TargetAndTransition
  animate: TargetAndTransition
  style?: MotionStyle
}

/** The six Codrops-inspired variants, verbatim from the spec. */
export const EFFECT_VARIANTS: Record<TrailEffect, TrailEffectDefinition> = {
  'fade-scale': {
    initial: { opacity: 1, scale: 1 },
    animate: { opacity: 0, scale: 0.4 },
  },
  'rotate-scale': {
    initial: { opacity: 1, scale: 1, rotate: 0 },
    animate: { opacity: 0, scale: 0.4, rotate: 45 },
  },
  '3d-rotate': {
    initial: { opacity: 1, rotateX: 0, rotateY: 0 },
    animate: { opacity: 0, rotateX: 90, rotateY: 45 },
    // The spec's value, verbatim. `3d-rotate` is the only entry that asks for
    // a perspective, and the component promotes this number to the container's
    // `perspective` — see THE 3D PERSPECTIVE below for why it cannot live
    // here.
    style: { transformPerspective: 800 },
  },
  'blur-fade': {
    initial: { opacity: 1, filter: 'blur(0px)' },
    animate: { opacity: 0, filter: 'blur(8px)' },
  },
  'clip-circle': {
    initial: { opacity: 1, clipPath: 'circle(50% at 50% 50%)' },
    animate: { opacity: 0, clipPath: 'circle(0% at 50% 50%)' },
  },
  'skew-fade': {
    initial: { opacity: 1, skewX: 0, skewY: 0 },
    animate: { opacity: 0, skewX: 20, skewY: 10 },
  },
}

/** How often expired items are swept out of the queue. */
const PRUNE_INTERVAL_MS = 50

/* ------------------------------------------------------------------ *
 * Reduced motion
 * ------------------------------------------------------------------ */

/**
 * `useSyncExternalStore` rather than motion's `useReducedMotion`.
 *
 * `useReducedMotion` seeds its state from a module-level flag that is `null`
 * during a server render and gets filled in on the first client render, so a
 * reduced-motion browser hydrates a different tree than the server sent. This
 * form takes an explicit server snapshot, so the first client render always
 * matches the server markup and the value flips on the next commit if — and
 * only if — the media query actually changes.
 */
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeToReducedMotion(onStoreChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION_QUERY)
  query.addEventListener('change', onStoreChange)
  return () => query.removeEventListener('change', onStoreChange)
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

function getReducedMotionServerSnapshot(): boolean {
  return false
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  )
}

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

export function ImageTrail({
  images,
  effect = 'fade-scale',
  trailSize = 6,
  velocityThreshold = 15,
  spawnRate = 50,
  imageSize = 120,
  duration = 0.8,
  borderRadius = 'rounded-lg',
  className,
  onMouseMove,
  style,
  ...props
}: ImageTrailProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [trailItems, setTrailItems] = useState<TrailItem[]>([])

  // Last pointer position. Advanced on every accepted event (not only on a
  // spawn) so the distance measured below covers the interval since the last
  // EVENT — see `handleMouseMove`.
  //
  // The spec's sketch keeps `{ x, y, time }` in one ref and advances it inside
  // the spawn branch, so it serves two masters with one window. Split here:
  // position belongs to the event stream, and the timestamp that `spawnRate`
  // gates on belongs to the spawn stream, so the last spawn time is its own ref.
  const pointerRef = useRef({ x: 0, y: 0 })
  const lastSpawnRef = useRef(0)
  const imageIndexRef = useRef(0)
  const nextIdRef = useRef(0)

  const prefersReducedMotion = usePrefersReducedMotion()

  /* ---------------- mouse tracking ---------------------------------------- */

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      // Composed rather than replaced: `{...props}` is spread last, so a
      // caller's own handler would otherwise silently delete the trail.
      onMouseMove?.(event)

      if (prefersReducedMotion) return
      if (images.length === 0) return

      const maxItems = Math.max(1, Math.floor(trailSize))
      const container = containerRef.current
      if (!container) return

      const now = performance.now()
      const pointer = pointerRef.current
      const dx = event.clientX - pointer.x
      const dy = event.clientY - pointer.y

      // Advanced BEFORE the threshold test, on every event. The spec's example
      // advances it only inside the spawn branch, which makes `distance`
      // accumulate from the last SPAWN rather than from the last EVENT: a
      // pointer creeping at a fraction of a pixel per event therefore grows
      // `distance` without bound and crosses any threshold within a second or
      // two, so `velocityThreshold` was not a threshold at all. Measuring both
      // terms from the same instant is what makes the prop mean what it
      // documents — "min mouse movement (px) to spawn".
      pointer.x = event.clientX
      pointer.y = event.clientY

      if (Math.sqrt(dx * dx + dy * dy) < velocityThreshold) return
      if (now - lastSpawnRef.current < spawnRate) return

      // Read after the cheap tests: this is the only layout read on the hot
      // path, and there is no reason to pay for it on an event that cannot
      // spawn.
      const rect = container.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return

      // Centred on the cursor, in the container's own coordinate space.
      const x = event.clientX - rect.left - imageSize / 2
      const y = event.clientY - rect.top - imageSize / 2

      // Advanced outside the state updater on purpose: React may call an
      // updater more than once (StrictMode replays it), and a ref mutated
      // inside one would skip an image on every replay.
      const imageIndex = imageIndexRef.current % images.length
      imageIndexRef.current += 1
      nextIdRef.current += 1
      lastSpawnRef.current = now

      const item: TrailItem = {
        id: nextIdRef.current,
        x,
        y,
        imageIndex,
        timestamp: now,
      }

      setTrailItems((previous) => {
        const next = [...previous, item]
        // Keep the array size bounded to trailSize to prevent memory bloat.
        return next.length > maxItems ? next.slice(next.length - maxItems) : next
      })
    },
    [imageSize, images, onMouseMove, prefersReducedMotion, spawnRate, trailSize, velocityThreshold]
  )

  /* ---------------- expiry sweep ------------------------------------------ */

  /*
   * NO `AnimatePresence`, ON PURPOSE.
   *
   * `AnimatePresence` has to diff the children list on every commit and hold a
   * removed node alive while its exit animation plays. On a list that gains and
   * loses an entry up to 20 times a second (1 / `spawnRate`) that reconciliation
   * is the single most expensive thing on the page, and the node it keeps alive
   * is one the animation has already finished with.
   *
   * Instead each item runs its animation to completion on its own, and this
   * sweep removes it from state once it is OLDER than the animation
   * (`duration`) — so React unmounts a node whose animation is already done and
   * the exit costs nothing. Nothing is re-rendered to remove it: a filter over
   * at most `trailSize` items, 20 times a second, and it returns the PREVIOUS
   * array untouched whenever nothing expired, so a page whose pointer has not
   * moved does not commit a render forever.
   */

  useEffect(() => {
    const maxAge = Math.max(0, duration * 1000)
    const maxItems = Math.max(1, Math.floor(trailSize))

    const interval = window.setInterval(() => {
      const now = performance.now()

      setTrailItems((previous) => {
        if (previous.length === 0) return previous

        const alive = previous.filter((item) => now - item.timestamp < maxAge)
        // The spawn path already caps the queue, but only on the NEXT spawn.
        // Trimming here too is what makes dragging the `trailSize` slider down
        // visibly shrink the trail instead of waiting for another move.
        const next =
          alive.length > maxItems ? alive.slice(alive.length - maxItems) : alive

        return next.length === previous.length ? previous : next
      })
    }, PRUNE_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [duration, trailSize])

  /* ---------------- render ------------------------------------------------ */

  const definition = EFFECT_VARIANTS[effect]
  // A new object identity every render would make Motion re-resolve the
  // variant labels on every commit; the definition is a constant, so this is
  // stable for as long as the effect is.
  const itemVariants = useMemo(
    () => ({ initial: definition.initial, animate: definition.animate }),
    [definition]
  )

  /*
   * THE 3D PERSPECTIVE.
   *
   * The spec's dictionary puts `transformPerspective: 800` in the trail ITEM's
   * style and its note says the effect "requires transformPerspective: 800 on
   * the parent or element". Neither half of that note works in Blink as
   * written, measured in Chrome:
   *
   * 1. On the ELEMENT it is inert. `transform-perspective` is a CSS Transforms
   *    2 property that Blink has never shipped: React writes it, but
   *    `getComputedStyle(el).transformPerspective` comes back empty and the
   *    resolved `matrix3d` is byte-identical to the same rotation with no
   *    perspective at all. (The standalone `perspective` property is no use
   *    either — that one applies to an element's CHILDREN, not to its own
   *    transform.)
   * 2. Motion would drop it anyway. `scrapeMotionValuesFromProps` only lifts a
   *    `style` key into `latestValues` when its value is a `MotionValue` or a
   *    forced motion value, and `buildTransform` reads the perspective from
   *    `latestValues.transformPerspective` — so a plain `800` never reaches
   *    the transform string even in an engine that supports the property.
   *
   * The parent is the half that DOES work, and it is what Codrops' own demo
   * does (`.trail { perspective: 800px }`). So the number stays where the spec
   * puts it — the definition is the single source of truth — and the component
   * reads it back off the active definition to give the container the
   * perspective. Every other effect asks for none, and gets none: the style key
   * is only written when the active definition declares it.
   */
  const perspective = definition.style?.transformPerspective

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn('relative w-full h-full overflow-hidden', className)}
      // A caller's `style` still wins per property; `{...props}` is spread
      // last, which is why `style` is destructured out of it in the first place.
      style={perspective ? { perspective: `${perspective}px`, ...style } : style}
      {...props}
    >
      {prefersReducedMotion ? (
        // Reduced motion is a hard stop for an autonomous follow-the-cursor
        // effect, so nothing spawns and there is no trail to explain itself.
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 text-center font-mono text-xs uppercase tracking-[0.3em] text-dead-400">
          Reduced motion is on — the image trail is disabled
        </span>
      ) : (
        trailItems.map((item) => (
          <motion.div
            key={item.id}
            initial="initial"
            animate="animate"
            variants={itemVariants}
            transition={{ duration, ease: 'easeOut' }}
            aria-hidden="true"
            className={cn(imageTrailVariants(), 'absolute overflow-hidden', borderRadius)}
            style={{
              left: item.x,
              top: item.y,
              width: imageSize,
              height: imageSize,
              ...definition.style,
            }}
          >
            {/* Decorative: the trail is a duplicate of what is already on the
                page, so it is hidden from assistive tech rather than announced
                as "trail" once per spawn.

                A plain `<img>`, not `next/image`: `images` is a caller-supplied
                list of arbitrary URLs, and `next/image` would reject every host
                that is not in `remotePatterns` — and it applies its own inline
                styles, which is exactly what the parent animates. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[item.imageIndex]}
              alt=""
              className="pointer-events-none h-full w-full select-none object-cover"
              draggable={false}
            />
          </motion.div>
        ))
      )}
    </div>
  )
}
