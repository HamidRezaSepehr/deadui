# Feature 12: Scroll-Linked Media Scrub (Image Sequence & Video)

## Overview

Build a high-performance, scroll-linked media component that maps the user's scroll progress to media playback. This component supports two distinct modes: **Image Sequence Scrubbing** (frame-by-frame animation using an array of images) and **Video Scrubbing** (controlling a video's `currentTime` via scroll). It is a staple of Awwwards-winning product showcase pages (like Apple's product reveals).

## Goals

1. Create a single, flexible `ScrollScrub` component that accepts either an `images` array or a `videoSrc`.
2. Implement robust preloading for image sequences to prevent flickering during rapid scrolling.
3. Use GSAP `ScrollTrigger` with `scrub` to map scroll progress (0 to 1) to the media frame/time.
4. Provide high-quality placeholder defaults so the component works out-of-the-box for testing.
5. Ensure the component is fully configurable (scroll range, pinning, dimensions, object-fit).

## Technical Specifications

### Directory Structure

```
registry/
└── scroll-scrub/
    ├── scroll-scrub.tsx   # Main component
    └── index.ts           # Barrel export
```

### Dependencies

- `gsap` (includes ScrollTrigger)

### Component Props Interface

```typescript
import { type VariantProps, cva } from 'class-variance-authority'

export const scrollScrubVariants = cva(
  'relative w-full overflow-hidden rounded-lg bg-dead-surface',
  {
    variants: {
      aspectRatio: {
        'video': 'aspect-video',
        'square': 'aspect-square',
        'portrait': 'aspect-[3/4]',
        'auto': 'h-auto',
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
  images?: string[]        // Array of image URLs for frame-by-frame scrubbing
  videoSrc?: string        // URL to a video file for time-based scrubbing
  
  // Scroll Behavior
  start?: string           // ScrollTrigger start (default: 'top top')
  end?: string             // ScrollTrigger end (default: 'bottom bottom')
  scrub?: boolean | number // Scrub smoothing (default: 1)
  pin?: boolean            // Pin the container during scroll (default: true)
  
  // Media Styling
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' // Default: 'cover'
  
  // Fallback / Loading
  fallbackImage?: string   // Image to show before first frame loads
}
```

### Implementation Logic

#### 1. Default Placeholder Assets
If neither `images` nor `videoSrc` is provided, the component MUST use these defaults so it works immediately:
*   **Default Images:** An array of 10 images from `https://picsum.photos/seed/deadui{i}/800/600` (where `i` is 1 to 10).
*   **Default Video:** A public domain sample video: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4`

#### 2. Image Sequence Mode
*   **Preloading:** On mount, create an `Image()` object for each URL in the `images` array and wait for them to load (or fail). Store the loaded `HTMLImageElement` objects in a ref array.
*   **Rendering:** Use a single `<canvas>` element (most performant for rapid frame swapping without DOM flicker) OR a single `<img>` tag that updates its `src` attribute. *Recommendation: Use a single `<img>` tag with `draggable={false}` and update `src` from the preloaded array. It's easier to style with Tailwind `object-fit`.*
*   **GSAP Logic:** 
    ```typescript
    gsap.to({ frame: 0 }, {
      frame: images.length - 1,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start, end, scrub, pin,
        onUpdate: (self) => {
           const index = Math.round(self.progress * (images.length - 1));
           // Update img src from preloaded array
        }
      }
    })
    ```
    *Better GSAP approach:* Use `gsap.to` on a proxy object and use `onUpdate` to set the image source.

#### 3. Video Scrubbing Mode
*   **Rendering:** Use a `<video>` element with `muted`, `playsInline`, `preload="auto"`.
*   **GSAP Logic:**
    ```typescript
    gsap.to(videoRef.current, {
      currentTime: videoRef.current.duration,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start, end, scrub, pin,
      }
    })
    ```
*   **Metadata Loading:** Ensure the video metadata is loaded before setting up the ScrollTrigger, otherwise `duration` will be `NaN`. Use a `loadedmetadata` event listener.

#### 4. Mode Detection
*   If `videoSrc` is provided, use Video Mode.
*   If `images` is provided (or neither, using defaults), use Image Mode.

### Example Component Structure

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/utils'
import { scrollScrubVariants, type ScrollScrubProps } from './scroll-scrub'

gsap.registerPlugin(ScrollTrigger)

// Default placeholders
const DEFAULT_IMAGES = Array.from({ length: 10 }, (_, i) => `https://picsum.photos/seed/deadui${i + 1}/800/600`)
const DEFAULT_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'

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
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null)
  const [isVideoMode, setIsVideoMode] = useState(!!videoSrc)
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const activeImages = images && images.length > 0 ? images : DEFAULT_IMAGES
  const activeVideo = videoSrc || DEFAULT_VIDEO

  // Preload images if in image mode
  useEffect(() => {
    if (isVideoMode) return
    
    let cancelled = false
    const imgElements: HTMLImageElement[] = []
    
    const loadPromises = activeImages.map((src) => {
      return new Promise<void>((resolve) => {
        const img = new Image()
        img.src = src
        img.onload = () => {
          imgElements.push(img)
          resolve()
        }
        img.onerror = () => resolve() // Resolve anyway to not block
      })
    })

    Promise.all(loadPromises).then(() => {
      if (!cancelled) setLoadedImages(imgElements)
    })

    return () => { cancelled = true }
  }, [activeImages, isVideoMode])

  // GSAP Setup
  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      if (isVideoMode && mediaRef.current && (mediaRef.current as HTMLVideoElement).duration) {
        // Video Scrub
        gsap.to(mediaRef.current, {
          currentTime: (mediaRef.current as HTMLVideoElement).duration,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start, end, scrub, pin,
          }
        })
      } else if (!isVideoMode && loadedImages.length > 0) {
        // Image Sequence Scrub
        const proxy = { frame: 0 }
        gsap.to(proxy, {
          frame: loadedImages.length - 1,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start, end, scrub, pin,
            onUpdate: (self) => {
              const index = Math.round(self.progress * (loadedImages.length - 1))
              setCurrentImageIndex(index)
            }
          }
        })
      }
    }, containerRef)

    return () => ctx.revert()
  }, [isVideoMode, loadedImages, start, end, scrub, pin])

  // Handle video metadata load to trigger GSAP setup
  const handleVideoLoaded = () => {
    // Force re-render or trigger effect by updating a state if needed, 
    // but GSAP effect already checks duration.
  }

  return (
    <div 
      ref={containerRef} 
      className={cn(scrollScrubVariants({ aspectRatio }), className)}
      {...props}
    >
      {isVideoMode ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={activeVideo}
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleVideoLoaded}
          className={cn("w-full h-full", objectFit === 'cover' && "object-cover", objectFit === 'contain' && "object-contain")}
          style={{ objectFit }}
        />
      ) : (
        <img
          ref={mediaRef as React.RefObject<HTMLImageElement>}
          src={loadedImages[currentImageIndex]?.src || fallbackImage || activeImages[0]}
          alt="Scroll sequence"
          draggable={false}
          className={cn("w-full h-full transition-opacity duration-100", objectFit === 'cover' && "object-cover", objectFit === 'contain' && "object-contain")}
          style={{ objectFit }}
        />
      )}
    </div>
  )
}
```

## Implementation Steps

1. Create `registry/scroll-scrub/` directory.
2. Create `scroll-scrub.tsx` with the logic above. Ensure robust preloading and GSAP cleanup.
3. Create `index.ts` barrel export.
4. Create test page at `app/test-scroll-scrub/page.tsx`.
   - Section 1: Default Image Sequence (using Picsum placeholders).
   - Section 2: Default Video Scrub (using Google sample video).
   - Section 3: Custom Image Sequence (pass a small array of 5 specific Unsplash URLs).
   - Section 4: Unpinned mode (`pin={false}`) to show how it behaves without sticky scrolling.
5. Verify build: `npm run build`.
6. Verify visually: `npm run dev`, navigate to `/test-scroll-scrub`, scroll slowly and quickly to test both modes.
7. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] Component renders without errors in SSR and CSR.
- [ ] Image sequence mode preloads images and scrubs smoothly without flickering.
- [ ] Video mode scrubs the video timeline based on scroll position.
- [ ] Default placeholders work out-of-the-box when no props are passed.
- [ ] `pin={false}` allows the media to scroll naturally while still scrubbing.
- [ ] `objectFit` prop correctly styles the media element.
- [ ] `prefers-reduced-motion` is respected (optional: disable scrubbing or jump to end).
- [ ] `npm run build` passes with zero TypeScript errors.
- [ ] `progress-tracker.md` is updated.

## Constraints

- Do NOT use React state to drive the GSAP animation loop (use a proxy object or direct DOM manipulation for performance).
- Ensure the video element has `muted` and `playsInline` attributes to allow autoplay/scrubbing on mobile.
- Handle the case where video metadata isn't loaded yet (don't crash if `duration` is `NaN`).

## Files to Create

1. `registry/scroll-scrub/scroll-scrub.tsx`
2. `registry/scroll-scrub/index.ts`
3. `app/test-scroll-scrub/page.tsx`

## Files to Update

1. `context/progress-tracker.md`