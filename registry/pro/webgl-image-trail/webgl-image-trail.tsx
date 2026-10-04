// 🔒 PRO COMPONENT - Commercial License Required
// This component requires a valid Dead UI Pro license.
// Purchase at: https://deadui.dev/pro

'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
} from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ImagePlane } from './image-plane'
import { type TrailEffect } from './shaders'

/**
 * `bg-dead-black` -> `bg-dead-950`: the exported Tailwind v4 `@theme static`
 * palette in `app/globals.css` has no `dead-black` token, so the spec's class
 * resolves to nothing and the container would composite over whatever is behind
 * it. Same 1:1 token mapping the earlier registry components use; the rest of
 * the string is verbatim.
 *
 * `h-full` means the component fills its PARENT, so the parent must have a
 * resolved height. With an auto-height parent this collapses to zero and the
 * canvas never gets a size to measure.
 */
export const webglImageTrailVariants = cva(
  'relative w-full h-full overflow-hidden bg-dead-950 cursor-none',
  {
    variants: {
      // Future variants can go here
    },
    defaultVariants: {},
  }
)

export interface WebGLImageTrailProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof webglImageTrailVariants> {
  // Content
  /** Image URLs to cycle through. Every URL is loaded once, up front. */
  images: string[]

  /** Which entry of the shader dictionary this trail compiles. Default: 'liquid' */
  effect?: TrailEffect

  /*
   * SUPERSET UNIFORMS.
   *
   * All of these are always accepted and always forwarded to the material, even
   * when the active effect does not read them: GLSL drops the unused ones and
   * three.js never looks their names up. Nothing is filtered per effect here on
   * purpose — a flat interface means a caller can set `pixelSize` long before
   * switching to `pixelate` and it is already right.
   */

  /** Used by: liquid, distortion. Strength of the warp (0.0 to 2.0). Default: 0.5 */
  distortionStrength?: number
  /** Used by: pixelate. Size of one pixel block, in UV. Default: 0.02 */
  pixelSize?: number
  /** Used by: wave. Waves across the quad's width. Default: 10.0 */
  waveFrequency?: number
  /** Used by: wave. Vertical displacement in UV. Default: 0.1 */
  waveAmplitude?: number
  /**
   * Used by: every effect. Mixed into the sampled colour at a fixed 30%, in
   * three's linear working space, so this GRADES the photo rather than
   * replacing it — and `#ffffff` is the BRIGHTEST grade rather than a neutral
   * one, because `mix(c, white, 0.3) === c * 0.7 + 0.3`. Default: '#ffffff'
   * (see the long note on TINT in `shaders.ts` for what that costs).
   */
  tintColor?: string

  // Trail Behavior
  /** Multiplier on the shader clock. Default: 2.0 */
  distortionSpeed?: number
  /** Max number of images visible at once. Default: 8 */
  trailSize?: number
  /** Time in seconds for an image to fade out. Default: 1.2 */
  fadeDuration?: number
  /** Scale of the images in the 3D scene. Default: 0.4 */
  imageScale?: number
  /** Min mouse speed (px/ms) to spawn a new image. Default: 0.1 */
  velocityThreshold?: number

  // Fallback
  /** Text to show if WebGL fails, under reduced motion, or during load. */
  fallbackText?: string
}

/* ------------------------------------------------------------------ *
 * Scene constants
 * ------------------------------------------------------------------ */

/**
 * R3F's default orthographic camera puts the CANVAS PIXELS in world units
 * (`left = -width/2 ... right = width/2`). That makes `imageScale` mean
 * something different on every screen, and it makes the spec's fixed `x * 5`
 * position maths meaningless. The camera below is given a fixed world height
 * instead, with the width derived from the live aspect ratio, so a quad of a
 * given `imageScale` is the same fraction of the stage on any display.
 *
 * The height is chosen to equal what the spec's own perspective camera shows: a
 * camera at `z = CAMERA_DISTANCE` with the default 50 degree vertical FOV
 * covers `2 * d * tan(fov / 2)` units at the z=0 plane. Reusing that number is
 * what keeps `imageScale`'s documented 0.4 meaning the same size it would have
 * had under the perspective camera in the spec's example.
 */
const CAMERA_DISTANCE = 5
const CAMERA_FOV = 50
const VIEW_HEIGHT = 2 * CAMERA_DISTANCE * Math.tan((CAMERA_FOV * Math.PI) / 360)

/** Minimum gap between spawns, in ms. ~60fps; matches the spec's `dt < 16`. */
const SPAWN_INTERVAL_MS = 16

/** How often expired items are swept out of the queue. */
const PRUNE_INTERVAL_MS = 100

interface TrailItem {
  /** Monotonic. `performance.now()` alone collides at sub-millisecond rates. */
  id: number
  position: [number, number, number]
  imageIndex: number
  /** Resolved at spawn time so a changed `images` prop cannot strand an item. */
  imageSrc: string
  birthTime: number
}

interface TrailSceneProps {
  items: TrailItem[]
  textures: ReadonlyMap<string, THREE.Texture>
  effect: TrailEffect
  distortionStrength: number
  pixelSize: number
  waveFrequency: number
  waveAmplitude: number
  tintColor: string
  distortionSpeed: number
  fadeDuration: number
  imageScale: number
}

/* ------------------------------------------------------------------ *
 * Reduced motion
 * ------------------------------------------------------------------ */

/**
 * `useSyncExternalStore` rather than a ref. The ref version could only stop the
 * trail from spawning, which left a bare black rectangle with no explanation;
 * swapping the canvas for `fallbackText` needs a render, and this is the API
 * for "a value outside React changed" — it subscribes to the media query,
 * re-renders only when the answer actually flips, and takes a server snapshot so
 * the module stays importable during a server render.
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

/* ------------------------------------------------------------------ *
 * Texture loading
 * ------------------------------------------------------------------ */

/**
 * One loader for the whole library.
 *
 * `THREE.TextureLoader` construction is free of DOM access (it only reads its
 * own `crossOrigin`), so this is safe at module scope even in a server
 * component's import graph — it is still created lazily so a plain server
 * import never constructs it. The important part is that it is a SINGLETON:
 * the trail creates and destroys planes continuously, and a per-plane loader
 * is both a per-frame allocation and a second HTTP request for a texture the
 * page already has.
 */
let sharedTextureLoader: THREE.TextureLoader | null = null

function getTrailTextureLoader(): THREE.TextureLoader {
  if (!sharedTextureLoader) sharedTextureLoader = new THREE.TextureLoader()
  return sharedTextureLoader
}

function configureTrailTexture(texture: THREE.Texture): void {
  texture.colorSpace = THREE.SRGBColorSpace
  // The fragment shader deliberately warps UVs outside [0, 1]. Clamping smears
  // the edge pixels inward, which is what makes the warp read as liquid;
  // REPEAT would wrap the opposite edge of the photo into frame.
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  // Trail quads are small and always moving, so mip levels buy nothing visible
  // and cost a second decode of every image at load.
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
}

/**
 * Stand-in for an image that failed to load. Without it a 404 leaves a hole in
 * the cycle and a bare `undefined` in the map, so a plane would be skipped for
 * the rest of the session instead of fading in once the network recovered.
 */
function createPlaceholderTexture(): THREE.Texture {
  const data = new Uint8Array([
    39, 39, 42, 255, 39, 39, 42, 255, 39, 39, 42, 255, 39, 39, 42, 255,
  ])
  const texture = new THREE.DataTexture(data, 2, 2, THREE.RGBAFormat)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

/* ------------------------------------------------------------------ *
 * WebGL capability
 * ------------------------------------------------------------------ */

/**
 * three's own `WebGLRenderer` probes these three names in this order; matching
 * that list means the component's capability check and the renderer's are
 * never going to disagree.
 */
function createWebGLProbeContext(): WebGLRenderingContext | null {
  if (typeof document === 'undefined') return null

  const canvas = document.createElement('canvas')
  for (const name of ['webgl2', 'webgl', 'experimental-webgl'] as const) {
    const context = canvas.getContext(name)
    // The DOM lib types `experimental-webgl` as the catch-all
    // `RenderingContext`; `getExtension` is what separates a real GL context
    // from a 2D one, and it is the method called just below.
    if (context && 'getExtension' in context) {
      return context as WebGLRenderingContext
    }
  }
  return null
}

/**
 * Cached at module scope: the answer is a property of the browser, not of this
 * component instance, and every miss allocates a throwaway canvas.
 *
 * The `typeof document` branch is what keeps the module importable from a
 * server render — where it answers `false` and the fallback markup is emitted
 * instead of a canvas.
 */
let webglSupported: boolean | null = null

function detectWebGLSupport(): boolean {
  if (webglSupported !== null) return webglSupported
  if (typeof document === 'undefined') return false

  try {
    const context = createWebGLProbeContext()
    webglSupported = context !== null
    // Release the probe context immediately; drivers cap the number of live
    // contexts, and one leaked here can cost the real canvas later.
    context?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webglSupported = false
  }

  return webglSupported
}

/* ------------------------------------------------------------------ *
 * Scene
 * ------------------------------------------------------------------ */

function TrailScene({
  items,
  textures,
  effect,
  distortionStrength,
  pixelSize,
  waveFrequency,
  waveAmplitude,
  tintColor,
  distortionSpeed,
  fadeDuration,
  imageScale,
}: TrailSceneProps) {
  const size = useThree((state) => state.size)

  // Aspect-corrected width for the fixed world height below. Before the canvas
  // has measured itself this is a harmless square placeholder that the first
  // real size replaces.
  const viewWidth =
    size.height > 0 ? VIEW_HEIGHT * (size.width / size.height) : VIEW_HEIGHT

  return (
    <>
      {/*
        `manual` is the important prop. Without it R3F owns the frustum and
        overwrites `left/right/top/bottom` with the canvas pixel box on every
        resize, which would put the scene back in pixel units. With it, the
        frustum below survives resizes and the world stays resolution
        independent.
      */}
      <OrthographicCamera
        makeDefault
        manual
        position={[0, 0, CAMERA_DISTANCE]}
        left={-viewWidth / 2}
        right={viewWidth / 2}
        top={VIEW_HEIGHT / 2}
        bottom={-VIEW_HEIGHT / 2}
        near={0.1}
        far={100}
        zoom={1}
      />

      {items.map((item) => {
        // Skipped, not rendered blank: a quad bound to a texture that has not
        // arrived yet samples an unbound sampler (black at full alpha), which
        // would flash a dark rectangle on the very first sweeps.
        const texture = textures.get(item.imageSrc)
        if (!texture) return null

        return (
          <ImagePlane
            key={item.id}
            position={item.position}
            texture={texture}
            effect={effect}
            distortionStrength={distortionStrength}
            pixelSize={pixelSize}
            waveFrequency={waveFrequency}
            waveAmplitude={waveAmplitude}
            tintColor={tintColor}
            distortionSpeed={distortionSpeed}
            fadeDuration={fadeDuration}
            imageScale={imageScale}
          />
        )
      })}
    </>
  )
}

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

export function WebGLImageTrail({
  images,
  className,
  effect = 'liquid',
  distortionStrength = 0.5,
  pixelSize = 0.02,
  waveFrequency = 10,
  waveAmplitude = 0.1,
  tintColor = '#ffffff',
  distortionSpeed = 2,
  trailSize = 8,
  fadeDuration = 1.2,
  imageScale = 0.4,
  velocityThreshold = 0.1,
  fallbackText = 'Move your cursor across this area',
  onMouseMove,
  style,
  ...props
}: WebGLImageTrailProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [trailItems, setTrailItems] = useState<TrailItem[]>([])
  const [textures, setTextures] = useState<ReadonlyMap<string, THREE.Texture>>(
    () => new Map()
  )

  const pointerRef = useRef({ lastX: 0, lastY: 0, lastTime: 0 })
  const nextIdRef = useRef(0)
  const imageIndexRef = useRef(0)

  // One capability probe, ever, per browser. See `detectWebGLSupport`.
  const [canRenderWebGL] = useState(detectWebGLSupport)
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  )

  /* ---------------- texture preloading ------------------------------------- */

  // Joining makes the effect depend on the URL SET rather than the array
  // identity, so an inline `images={[...]}` literal does not tear down and
  // re-download the whole set on every parent render.
  const imagesKey = images.join('\u0000')

  useEffect(() => {
    const requested = Array.from(new Set(images))
    if (requested.length === 0) return

    const loader = getTrailTextureLoader()
    const batch: (THREE.Texture | null)[] = new Array(requested.length)
    let cancelled = false

    // Published after every image, not only after the last one, so the trail
    // starts working on the first image to arrive instead of waiting for the
    // slowest.
    const publish = () => {
      if (cancelled) return
      const next = new Map<string, THREE.Texture>()
      for (let index = 0; index < requested.length; index += 1) {
        const texture = batch[index]
        if (texture) next.set(requested[index], texture)
      }
      // A NEW map every time. Reusing `next` across calls would make every
      // publish after the first one `Object.is`-equal to the current state,
      // and React bails out of a state update whose value is unchanged — so
      // images 2..n would silently never reach the scene.
      setTextures(next)
    }

    for (let index = 0; index < requested.length; index += 1) {
      const url = requested[index]
      const texture = loader.load(
        url,
        () => {
          if (cancelled) return
          configureTrailTexture(texture)
          batch[index] = texture
          publish()
        },
        undefined,
        () => {
          if (cancelled) return
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Dead UI: webgl-image-trail could not load ${url}`)
          }
          batch[index] = createPlaceholderTexture()
          publish()
        }
      )
      // Configured up front as well as in `onLoad` so a cached image that
      // resolves before the first draw is never uploaded with the defaults.
      configureTrailTexture(texture)
    }

    return () => {
      cancelled = true
      for (const texture of batch) texture?.dispose()
    }
    // `imagesKey` stands in for `images`: see above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesKey])

  /* ---------------- mouse tracking ---------------------------------------- */

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      // Composed rather than replaced: `{...props}` is spread last, so a
      // caller's own handler would otherwise silently delete the trail.
      onMouseMove?.(event)

      if (prefersReducedMotion) return
      if (images.length === 0 || trailSize < 1) return

      const container = containerRef.current
      if (!container) return

      const now = performance.now()
      const pointer = pointerRef.current
      const dt = now - pointer.lastTime
      if (dt < SPAWN_INTERVAL_MS) return

      const dx = event.clientX - pointer.lastX
      const dy = event.clientY - pointer.lastY
      const velocity = Math.sqrt(dx * dx + dy * dy) / dt

      // Moved unconditionally, BEFORE the threshold test. The spec's example
      // advances lastX/lastY only inside the spawn branch, which makes `dx`
      // accumulate from the last SPAWN while `dt` measures the last EVENT: a
      // pointer creeping at 0.25 px/ms grows `dx` without bound and crosses
      // any threshold after a second or two, so `velocityThreshold` was not a
      // speed limit at all. Tracking both from the same instant makes the two
      // terms describe the same interval, which is what the prop documents
      // ("min mouse speed to spawn a new image") and what a caller expects a
      // threshold to do.
      pointer.lastX = event.clientX
      pointer.lastY = event.clientY
      pointer.lastTime = now

      if (velocity <= velocityThreshold) return

      // Mapped against the CONTAINER, not the window. The spec's
      // `clientX / window.innerWidth` is only correct for a component that
      // fills the viewport; in a 600px panel it puts the whole trail in the
      // top-left sixth of the scene.
      const rect = container.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return

      const ndcX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const ndcY = -((event.clientY - rect.top) / rect.height) * 2 + 1
      const aspect = rect.width / rect.height
      const imageIndex = imageIndexRef.current % images.length

      // Advanced outside the state updater on purpose: React may call an
      // updater more than once (StrictMode replays it), and a ref mutated
      // inside one would skip images every time it replayed.
      imageIndexRef.current += 1
      nextIdRef.current += 1

      const item: TrailItem = {
        id: nextIdRef.current,
        position: [(ndcX * VIEW_HEIGHT * aspect) / 2, (ndcY * VIEW_HEIGHT) / 2, 0],
        imageIndex,
        imageSrc: images[imageIndex],
        birthTime: now / 1000,
      }

      setTrailItems((previous) => [...previous.slice(-(trailSize - 1)), item])
    },
    [images, onMouseMove, prefersReducedMotion, trailSize, velocityThreshold]
  )

  /* ---------------- expiry sweep ------------------------------------------ */

  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = performance.now() / 1000

      setTrailItems((previous) => {
        const alive = previous.filter(
          (item) => now - item.birthTime < fadeDuration
        )
        // The spawn path already caps the queue, but only on the NEXT spawn.
        // Trimming here too is what makes dragging the `trailSize` slider down
        // visibly shrink the trail instead of waiting for another move.
        const next =
          alive.length > trailSize ? alive.slice(alive.length - trailSize) : alive

        // Return the identical array when nothing expired. A blind 10Hz
        // setState would commit a React render forever, even on a page where
        // the pointer has not moved for an hour.
        return next.length === previous.length ? previous : next
      })
    }, PRUNE_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [fadeDuration, trailSize])

  /* ---------------- render ------------------------------------------------ */

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(webglImageTrailVariants(), className)}
      style={style}
      {...props}
    >
      {canRenderWebGL && !prefersReducedMotion ? (
        <Canvas
          orthographic
          dpr={[1, 2]}
          camera={{
            position: [0, 0, CAMERA_DISTANCE],
            zoom: 1,
            near: 0.1,
            far: 100,
          }}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        >
          <TrailScene
            items={trailItems}
            textures={textures}
            effect={effect}
            distortionStrength={distortionStrength}
            pixelSize={pixelSize}
            waveFrequency={waveFrequency}
            waveAmplitude={waveAmplitude}
            tintColor={tintColor}
            distortionSpeed={distortionSpeed}
            fadeDuration={fadeDuration}
            imageScale={imageScale}
          />
        </Canvas>
      ) : (
        // One fallback for both "no WebGL" and "reduced motion": in each case
        // there is no trail to watch, and an unexplained black rectangle is
        // worse than a sentence. `cursor-auto` deliberately re-enables the
        // pointer here — `cursor-none` exists to hand the cursor to the trail,
        // and there is no trail to hand it to.
        <span className="absolute inset-0 flex cursor-auto items-center justify-center px-8 text-center font-mono text-xs uppercase tracking-[0.3em] text-dead-400">
          {fallbackText}
        </span>
      )}
    </div>
  )
}
