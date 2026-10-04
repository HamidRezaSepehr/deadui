'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Register GSAP plugins once at module scope
gsap.registerPlugin(ScrollTrigger)

/**
 * Zero-prop placeholders, so `<ScrollScrub />` demos itself the moment it is
 * installed: ten Picsum frames for image mode, a public-domain clip for video
 * mode.
 *
 * The spec's default was Google's `gtv-videos-bucket/sample/ForBiggerBlazes.mp4`.
 * That bucket is no longer public — it now answers `403 AccessDenied` for
 * anonymous callers — so a default that cannot load is not a default. MDN's
 * CC0 `flower.mp4` (5s, 960x540, 1.1MB, range-request friendly) is used
 * instead; swap this constant for your own asset.
 */
const DEFAULT_IMAGES = Array.from(
  { length: 10 },
  (_, i) => `https://picsum.photos/seed/deadui${i + 1}/800/600`
)

const DEFAULT_VIDEO =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'

/**
 * Default height of the trigger section.
 *
 * The ScrollTrigger range is `containerHeight - viewportHeight` (the spec's
 * `start: 'top top'` → `end: 'bottom bottom'`), so the trigger has to be
 * TALLER than the viewport or the range collapses to nothing. 300vh leaves a
 * 200vh scrub. Override per instance through `className`, e.g.
 * `className="h-[150vh]"`.
 */
const DEFAULT_SCRUB_LENGTH = 'h-[300vh]'

/** Backing-store scale. Capped at 2: a 3x DPR scrub only costs fill rate. */
const MAX_DPR = 2

export const scrollScrubVariants = cva(
  'relative w-full overflow-hidden rounded-lg bg-dead-800',
  {
    variants: {
      aspectRatio: {
        video: 'aspect-video',
        square: 'aspect-square',
        portrait: 'aspect-[3/4]',
        auto: 'h-auto',
      },
    },
    defaultVariants: {
      aspectRatio: 'video',
    },
  }
)

export interface ScrollScrubProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof scrollScrubVariants> {
  // Media Sources (Mutually Exclusive, but component handles fallback)
  images?: string[] // Array of image URLs for frame-by-frame scrubbing
  videoSrc?: string // URL to a video file for time-based scrubbing

  // Scroll Behavior
  start?: string // ScrollTrigger start (default: 'top top')
  end?: string // ScrollTrigger end (default: 'bottom bottom')
  scrub?: boolean | number // Scrub smoothing (default: 1)
  pin?: boolean // Pin the container during scroll (default: true)

  // Media Styling
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' // Default: 'cover'

  // Fallback / Loading
  fallbackImage?: string // Image to show before first frame loads
}

export function ScrollScrub({
  className,
  aspectRatio,
  images,
  videoSrc,
  start = 'top top',
  end = 'bottom bottom',
  scrub = 1,
  pin = true,
  objectFit = 'cover',
  fallbackImage,
  ...props
}: ScrollScrubProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Decoded frames live in refs, never in state: the scrub loop paints straight
  // onto the canvas, so scrolling can never re-render React.
  const framesRef = useRef<(HTMLImageElement | null)[]>([])
  const fallbackRef = useRef<HTMLImageElement | null>(null)
  const frameIndexRef = useRef(0)

  // Readiness is DERIVED, never reset: `loadedKey` records which source list
  // finished preloading, so swapping `images` invalidates the gate without an
  // extra render (and without a setState in the middle of an effect).
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const [videoReady, setVideoReady] = useState(false)

  const isVideoMode = Boolean(videoSrc)
  const activeImages = useMemo(
    () => (images && images.length > 0 ? images : DEFAULT_IMAGES),
    [images]
  )
  const activeVideo = videoSrc || DEFAULT_VIDEO
  const mediaSize =
    aspectRatio === 'auto' ? 'block h-auto w-full' : 'block h-full w-full'
  const framesKey = useMemo(
    () => `${fallbackImage ?? ''}|${activeImages.join('|')}`,
    [activeImages, fallbackImage]
  )
  const framesReady = loadedKey === framesKey

  // The element can already be past READY_METADATA by the time React hydrates
  // (the video starts loading while the prerendered HTML parses), and React
  // never replays `loadedmetadata` for us. A ref callback is the right place to
  // reconcile that with state.
  const attachVideo = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node
    if (node && node.readyState >= 1) setVideoReady(true)
  }, [])

  /**
   * Paints one frame. Resolves the target index, walking backwards for the
   * closest decoded frame so a frame that is still in flight (or failed) can
   * never blank the stage mid-scrub.
   */
  const drawFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const frames = framesRef.current
      let image: HTMLImageElement | null = null
      for (let i = Math.min(index, frames.length - 1); i >= 0; i--) {
        const candidate = frames[i]
        if (candidate && candidate.complete && candidate.naturalWidth > 0) {
          image = candidate
          break
        }
      }
      if (!image && fallbackRef.current?.naturalWidth) {
        image = fallbackRef.current
      }
      if (!image) return

      const cw = canvas.width
      const ch = canvas.height
      if (!cw || !ch) return

      const nw = image.naturalWidth
      const nh = image.naturalHeight

      let dw: number
      let dh: number
      if (objectFit === 'fill') {
        dw = cw
        dh = ch
      } else if (objectFit === 'none') {
        dw = nw
        dh = nh
      } else {
        const scale =
          objectFit === 'contain'
            ? Math.min(cw / nw, ch / nh)
            : Math.max(cw / nw, ch / nh)
        dw = nw * scale
        dh = nh * scale
      }

      ctx.clearRect(0, 0, cw, ch)
      ctx.drawImage(image, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
    },
    [objectFit]
  )

  // Preload every frame up front, in array order, and only open the gate once
  // all of them have settled.
  useEffect(() => {
    if (isVideoMode) return

    let cancelled = false
    const frames: (HTMLImageElement | null)[] = new Array<HTMLImageElement | null>(
      activeImages.length
    ).fill(null)

    framesRef.current = frames
    frameIndexRef.current = 0

    let settled = 0
    let lastGood: HTMLImageElement | null = null

    const settle = (index: number, img: HTMLImageElement) => {
      if (cancelled) return
      if (img.complete && img.naturalWidth > 0) {
        frames[index] = img
        lastGood = img
        // Paint frame 0 the moment IT lands, so the stage is never an empty
        // box while the rest of the sequence is still downloading.
        if (index === frameIndexRef.current) drawFrame(index)
      } else {
        // A broken frame inherits its nearest good neighbour rather than
        // punching a hole in the sequence.
        frames[index] = lastGood
      }
      settled += 1
      if (settled === frames.length) setLoadedKey(framesKey)
    }

    activeImages.forEach((src, index) => {
      const img = new Image()
      img.onload = () => settle(index, img)
      img.onerror = () => settle(index, img)
      img.src = src
    })

    if (fallbackImage) {
      const fallback = new Image()
      fallback.onload = () => drawFrame(frameIndexRef.current)
      fallback.onerror = () => drawFrame(frameIndexRef.current)
      fallback.src = fallbackImage
      fallbackRef.current = fallback
    } else {
      fallbackRef.current = null
    }

    return () => {
      cancelled = true
    }
  }, [activeImages, isVideoMode, fallbackImage, drawFrame, framesKey])

  // Match the canvas backing store to the stage box (CSS owns the layout, the
  // attribute owns the pixels) so a DPR-scaled draw is never resampled.
  useEffect(() => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    if (isVideoMode || !stage || !canvas) return

    const resize = () => {
      const width = stage.clientWidth
      if (!width) return

      let height: number
      if (aspectRatio === 'auto') {
        // `aspectRatio="auto"` hands the box to the media, so the height comes
        // from the frame's own ratio. Reading it back off the stage would be a
        // feedback loop: at this point the stage is sized by the canvas's
        // default 300x150 attribute, not by a frame.
        const frame = framesRef.current.find(
          (candidate): candidate is HTMLImageElement =>
            !!candidate && candidate.naturalWidth > 0
        )
        if (!frame) return
        height = Math.round((width * frame.naturalHeight) / frame.naturalWidth)
      } else {
        height = stage.clientHeight
        if (!height) return
      }

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const nextWidth = Math.round(width * dpr)
      const nextHeight = Math.round(height * dpr)
      if (canvas.width === nextWidth && canvas.height === nextHeight) return

      canvas.width = nextWidth
      canvas.height = nextHeight
      drawFrame(frameIndexRef.current)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(stage)
    return () => observer.disconnect()
    // `framesReady` is in the deps so `aspectRatio="auto"` re-measures once a
    // frame has decoded — the very first pass has no ratio to read.
  }, [isVideoMode, aspectRatio, framesReady, drawFrame])

  // The scroll-linked scrub. One ScrollTrigger per mode, both measured against
  // the tall container and pinning the short stage inside it.
  useEffect(() => {
    const container = containerRef.current
    const stage = stageRef.current
    if (!container || !stage) return

    const media = gsap.matchMedia()

    media.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        const scrollTrigger = {
          trigger: container,
          start,
          end,
          scrub,
          // Pin the stage (the visible media box), not the 300vh trigger.
          pin: pin ? stage : false,
          // The trigger already reserves the scroll length; a spacer would
          // double it.
          pinSpacing: false,
          invalidateOnRefresh: true,
        }

        try {
          if (isVideoMode) {
            const video = videoRef.current
            if (!video) return
            const duration = video.duration
            if (!Number.isFinite(duration) || duration <= 0) return

            gsap.to(video, {
              currentTime: duration,
              ease: 'none',
              scrollTrigger,
            })
            return
          }

          const frames = framesRef.current
          if (!framesReady || frames.length === 0) return

          // GSAP proxy object: the tween owns the frame number and `onUpdate`
          // paints it. No React state, so the loop cannot cause a re-render.
          const proxy = { frame: 0 }
          const render = () => {
            const index = Math.round(proxy.frame)
            frameIndexRef.current = index
            drawFrame(index)
          }

          render()
          gsap.to(proxy, {
            frame: frames.length - 1,
            ease: 'none',
            onUpdate: render,
            scrollTrigger,
          })
        } catch (error) {
          // A failed scrub must never take the media down with it.
          if (process.env.NODE_ENV === 'development') {
            console.warn('Dead UI: ScrollScrub failed to initialize', error)
          }
        }
      }, container)

      return () => ctx.revert()
    })

    // Reduced motion: no pin, no scrub, no loop — the media jumps to its end
    // state and stays there.
    media.add('(prefers-reduced-motion: reduce)', () => {
      if (isVideoMode) {
        const video = videoRef.current
        const duration = video?.duration
        if (!video || !Number.isFinite(duration) || !duration || duration <= 0) {
          return
        }
        try {
          video.currentTime = duration
        } catch {
          // Some browsers refuse seeks before the range is buffered.
        }
        return
      }

      const frames = framesRef.current
      if (frames.length > 0) drawFrame(frames.length - 1)
    })

    return () => media.revert()
  }, [isVideoMode, videoReady, framesReady, start, end, scrub, pin, drawFrame])

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', DEFAULT_SCRUB_LENGTH, className)}
      {...props}
    >
      <div ref={stageRef} className={cn(scrollScrubVariants({ aspectRatio }))}>
        {isVideoMode ? (
          <video
            ref={attachVideo}
            src={activeVideo}
            muted
            playsInline
            preload="auto"
            poster={fallbackImage}
            onLoadedMetadata={() => setVideoReady(true)}
            aria-label="Scroll-scrubbed video"
            className={mediaSize}
            style={{ objectFit }}
          />
        ) : (
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Scroll sequence"
            className={mediaSize}
          />
        )}
      </div>
    </div>
  )
}
