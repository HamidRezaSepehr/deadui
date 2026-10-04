# Feature 16: CSS Image Trail Effects (Free)

## Overview

Build a lightweight, highly performant, DOM-based image trail component inspired by the classic Codrops "Image Trail Effects" demo. Unlike the heavy WebGL Pro component, this Free-tier component uses React state, `requestAnimationFrame` (or fast intervals), and `motion/react` to create smooth, hardware-accelerated image trails that follow the user's cursor. It supports 6 distinct visual styles out of the box.

## Goals

1. Create a reusable `ImageTrail` component that accepts an array of images and cycles through them as the user moves the mouse.
2. Implement 6 distinct animation variants inspired by Codrops: `fade-scale`, `rotate-scale`, `3d-rotate`, `blur-fade`, `clip-circle`, and `skew-fade`.
3. Ensure 60fps performance by using CSS `transform` and `opacity` (no layout thrashing).
4. Expose all timing, sizing, and sensitivity configurations via a clean TypeScript props API.
5. Ensure trail images have `pointer-events: none` so they do not block underlying UI interactions.

## Technical Specifications

### Directory Structure

```
registry/
└── image-trail/
    ├── image-trail.tsx   # Main component
    └── index.ts          # Barrel export
```

### Dependencies

- `motion` (already installed as `motion/react`)
- `clsx`, `tailwind-merge` (for class merging)

### Component Props Interface

```typescript
import { type VariantProps, cva } from 'class-variance-authority'

export const imageTrailVariants = cva(
  'fixed top-0 left-0 pointer-events-none will-change-transform',
  {
    variants: {
      // Variants are handled dynamically via Framer Motion, 
      // but we keep cva for base structural classes if needed.
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

export interface ImageTrailProps extends React.HTMLAttributes<HTMLDivElement> {
  images: string[]             // Array of image URLs to cycle through
  
  // Behavior
  effect?: TrailEffect         // Default: 'fade-scale'
  trailSize?: number           // Max images visible at once. Default: 6
  velocityThreshold?: number   // Min mouse movement (px) to spawn new image. Default: 15
  spawnRate?: number           // Min ms between spawns to prevent flooding. Default: 50
  
  // Styling
  imageSize?: number           // Width/Height in pixels. Default: 120
  duration?: number            // Animation duration in seconds. Default: 0.8
  borderRadius?: string        // Tailwind radius class. Default: 'rounded-lg'
}
```

### The 6 Codrops-Inspired Effect Variants (Framer Motion)

Define these as a dictionary of Framer Motion `Variants` objects inside the component:

1. **`fade-scale`**: Classic shrink and fade.
   - `initial`: `{ opacity: 1, scale: 1 }`
   - `animate`: `{ opacity: 0, scale: 0.4 }`
2. **`rotate-scale`**: Rotates while shrinking.
   - `initial`: `{ opacity: 1, scale: 1, rotate: 0 }`
   - `animate`: `{ opacity: 0, scale: 0.4, rotate: 45 }`
3. **`3d-rotate`**: Flips away in 3D space.
   - `initial`: `{ opacity: 1, rotateX: 0, rotateY: 0 }`
   - `animate`: `{ opacity: 0, rotateX: 90, rotateY: 45 }`
   - *Note*: Requires `transformPerspective: 800` on the parent or element.
4. **`blur-fade`**: Blurs out as it fades.
   - `initial`: `{ opacity: 1, filter: 'blur(0px)' }`
   - `animate`: `{ opacity: 0, filter: 'blur(8px)' }`
5. **`clip-circle`**: Shrinks via clip-path (very Codrops).
   - `initial`: `{ opacity: 1, clipPath: 'circle(50% at 50% 50%)' }`
   - `animate`: `{ opacity: 0, clipPath: 'circle(0% at 50% 50%)' }`
6. **`skew-fade`**: Distorts and fades.
   - `initial`: `{ opacity: 1, skewX: 0, skewY: 0 }`
   - `animate`: `{ opacity: 0, skewX: 20, skewY: 10 }`

### Implementation Logic

1. **State & Refs**:
   - `trailItems`: Array of `{ id: number, x: number, y: number, imageIndex: number, timestamp: number }`.
   - `lastMouse`: Ref to track `{ x, y, time }` to calculate velocity and enforce `spawnRate`.
   - `imageIndexRef`: Ref to keep track of which image to show next (cycles through `images.length`).
2. **Mouse Tracking**:
   - Attach `onMouseMove` to a full-screen wrapper `div`.
   - Calculate distance from `lastMouse`. If `distance >= velocityThreshold` and `now - lastMouse.time >= spawnRate`:
     - Push new item to `trailItems`.
     - Update `lastMouse`.
     - Increment `imageIndexRef.current = (imageIndexRef.current + 1) % images.length`.
3. **Cleanup Loop**:
   - Use `requestAnimationFrame` or a `useEffect` with `setInterval` (e.g., every 50ms) to filter out items where `now - item.timestamp > duration * 1000`.
4. **Rendering**:
   - Map over `trailItems`.
   - Render a `motion.div` (or `motion.img`) for each.
   - Position using `style={{ left: item.x, top: item.y, width: imageSize, height: imageSize }}`.
   - Apply the selected effect's `initial` and `animate` variants.
   - Set `exit` variant to match `animate` for smooth `AnimatePresence` removal (or just let the animation finish before React unmounts it, which is safer for performance than AnimatePresence on rapidly changing lists). *Better approach*: Let the animation run for `duration` seconds, then remove from state. No `AnimatePresence` needed, just standard conditional rendering.

### Example Component Structure

```tsx
'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { type ImageTrailProps, type TrailEffect } from './image-trail'

const effectVariants: Record<TrailEffect, any> = {
  'fade-scale': { initial: { opacity: 1, scale: 1 }, animate: { opacity: 0, scale: 0.4 } },
  'rotate-scale': { initial: { opacity: 1, scale: 1, rotate: 0 }, animate: { opacity: 0, scale: 0.4, rotate: 45 } },
  '3d-rotate': { initial: { opacity: 1, rotateX: 0, rotateY: 0 }, animate: { opacity: 0, rotateX: 90, rotateY: 45 }, style: { transformPerspective: 800 } },
  'blur-fade': { initial: { opacity: 1, filter: 'blur(0px)' }, animate: { opacity: 0, filter: 'blur(8px)' } },
  'clip-circle': { initial: { opacity: 1, clipPath: 'circle(50% at 50% 50%)' }, animate: { opacity: 0, clipPath: 'circle(0% at 50% 50%)' } },
  'skew-fade': { initial: { opacity: 1, skewX: 0, skewY: 0 }, animate: { opacity: 0, skewX: 20, skewY: 10 } },
}

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
  ...props
}: ImageTrailProps) {
  const [trailItems, setTrailItems] = useState<Array<{ id: number, x: number, y: number, imageIndex: number, timestamp: number }>>([])
  const lastMouse = useRef({ x: 0, y: 0, time: 0 })
  const imageIndexRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const now = performance.now()
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left - (imageSize / 2)
    const y = e.clientY - rect.top - (imageSize / 2)
    
    const dx = x - lastMouse.current.x
    const dy = y - lastMouse.current.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance >= velocityThreshold && (now - lastMouse.current.time) >= spawnRate) {
      const newImageIndex = imageIndexRef.current % images.length
      imageIndexRef.current += 1

      setTrailItems(prev => {
        const newItem = { id: now, x, y, imageIndex: newImageIndex, timestamp: now }
        // Keep array size bounded to trailSize to prevent memory bloat
        const next = [...prev, newItem]
        return next.length > trailSize ? next.slice(next.length - trailSize) : next
      })

      lastMouse.current = { x, y, time: now }
    }
  }, [images.length, velocityThreshold, spawnRate, imageSize, trailSize])

  // Cleanup old items
  useEffect(() => {
    const interval = setInterval(() => {
      const now = performance.now()
      const maxAge = duration * 1000
      setTrailItems(prev => prev.filter(item => (now - item.timestamp) < maxAge))
    }, 50)

    return () => clearInterval(interval)
  }, [duration])

  const variants = effectVariants[effect]

  return (
    <div 
      ref={containerRef}
      className={cn('relative w-full h-full overflow-hidden', className)}
      onMouseMove={handleMouseMove}
      {...props}
    >
      {trailItems.map(item => (
        <motion.div
          key={item.id}
          initial="initial"
          animate="animate"
          variants={variants}
          transition={{ duration, ease: 'easeOut' }}
          className={cn('absolute overflow-hidden', borderRadius)}
          style={{
            left: item.x,
            top: item.y,
            width: imageSize,
            height: imageSize,
            ...variants.style,
          }}
        >
          <img 
            src={images[item.imageIndex]} 
            alt="trail" 
            className="w-full h-full object-cover pointer-events-none select-none"
            draggable={false}
          />
        </motion.div>
      ))}
    </div>
  )
}
```

## Implementation Steps

1. Create `registry/image-trail/` directory.
2. Create `image-trail.tsx` with the logic above, ensuring all 6 effects are defined in the `effectVariants` dictionary.
3. Create `index.ts` barrel export.
4. Create test page at `app/test-image-trail/page.tsx`.
   - Provide a full-screen dark container (`h-screen w-full bg-dead-black`).
   - Pass an array of 5-6 high-quality, distinct Unsplash image URLs.
   - Add a UI control panel (fixed top-right) with a `<Select>` to switch between the 6 effects in real-time.
   - Add sliders for `trailSize`, `velocityThreshold`, and `duration` to prove configurability.
5. Verify build: `npm run build`.
6. Verify visually: `npm run dev`, navigate to `/test-image-trail`, move mouse rapidly and slowly to test all 6 effects.
7. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] Component renders without errors.
- [ ] Mouse movement spawns images that follow the cursor.
- [ ] All 6 effects produce distinct, smooth visual results matching the Codrops inspiration.
- [ ] `trailSize` prop correctly limits the maximum number of DOM elements.
- [ ] `velocityThreshold` prevents images from spawning when the mouse is still.
- [ ] Images have `pointer-events-none` and do not block clicks on underlying elements.
- [ ] No memory leaks (old items are pruned from the state array).
- [ ] `npm run build` passes with zero TypeScript errors.
- [ ] `progress-tracker.md` is updated.

## Constraints

- **NO WebGL/Three.js**: This is the lightweight Free-tier alternative. Use only `motion/react` and CSS transforms.
- **Performance**: Do not use `AnimatePresence` for rapidly spawning/destroying elements; use the timestamp filtering approach to let the animation finish naturally before React unmounts the node.
- **Bounding**: Always slice the `trailItems` array to `trailSize` to prevent unbounded memory growth if the user moves the mouse erratically.

## Files to Create

1. `registry/image-trail/image-trail.tsx`
2. `registry/image-trail/index.ts`
3. `app/test-image-trail/page.tsx`

## Files to Update

1. `context/progress-tracker.md`