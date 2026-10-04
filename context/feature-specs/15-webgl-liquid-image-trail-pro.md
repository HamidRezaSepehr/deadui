# Feature 15: WebGL Liquid Image Trail (Pro)

## Overview

Build a premium, mouse-reactive WebGL component that spawns a trail of images following the user's cursor. Unlike standard CSS image trails, this component uses React Three Fiber (R3F) and custom GLSL fragment shaders to apply a fluid, liquid-like distortion to the images as they move and fade. This is a flagship Pro-tier component designed to replicate high-end Awwwards portfolio effects.

## Goals

1. Create a robust `LiquidImageTrail` component using `@react-three/fiber` and `@react-three/drei`.
2. Implement a custom GLSL fragment shader to distort image textures based on time and mouse velocity.
3. Manage a dynamic queue of images that spawn based on mouse movement and velocity thresholds.
4. Ensure strict SSR safety (dynamic import) and proper WebGL cleanup (disposing textures/geometries).
5. Expose all visual parameters (distortion strength, trail length, fade speed, image scale) via props.

## Technical Specifications

### Directory Structure

```
registry/
└── liquid-image-trail/
    ├── liquid-image-trail.tsx   # Main React wrapper & R3F Canvas
    ├── trail-shader.ts          # GLSL Vertex and Fragment shaders
    ├── image-plane.tsx          # R3F Mesh component for a single trail image
    └── index.ts                 # Barrel export
```

### Dependencies

- `three`
- `@react-three/fiber`
- `@react-three/drei` (for `useTexture`, `Image`, etc.)
- `clsx`, `tailwind-merge`

### Component Props Interface

```typescript
import { type VariantProps, cva } from 'class-variance-authority'

export const liquidTrailVariants = cva(
  'relative w-full h-full overflow-hidden bg-dead-black cursor-none',
  {
    variants: {
      // Future variants can go here
    },
    defaultVariants: {},
  }
)

export interface LiquidImageTrailProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof liquidTrailVariants> {
  
  // Content
  images: string[]             // Array of image URLs to cycle through
  
  // Shader & Distortion
  distortion?: number          // Strength of the liquid distortion (0.0 to 2.0). Default: 0.5
  distortionSpeed?: number     // Speed of the shader animation. Default: 2.0
  
  // Trail Behavior
  trailSize?: number           // Max number of images visible at once. Default: 8
  fadeDuration?: number        // Time in seconds for an image to fade out. Default: 1.2
  imageScale?: number          # Scale of the images in the 3D scene. Default: 0.4
  velocityThreshold?: number   // Min mouse speed to spawn a new image. Default: 0.1
  
  // Fallback
  fallbackText?: string        // Text to show if WebGL fails or during load.
}
```

### Implementation Logic

#### 1. The React Wrapper (`liquid-image-trail.tsx`)
- Must be wrapped in `dynamic(() => import(...), { ssr: false })` for Next.js.
- Tracks mouse position (`useRef` for performance) and calculates velocity.
- Maintains an array of "Active Trail Items" in state: `{ id, position: [x, y], imageIndex, birthTime }`.
- On `mousemove`, if velocity > `velocityThreshold`, push a new item to the array (cycling through the `images` array).
- Use `requestAnimationFrame` or a fast interval to remove items older than `fadeDuration`.
- Renders an R3F `<Canvas>` with a `<OrthographicCamera>` (easier for 2D-like trails) or `<PerspectiveCamera>` positioned at z=5.

#### 2. The Shader (`trail-shader.ts`)
- **Vertex Shader:** Standard pass-through.
- **Fragment Shader:** 
  - Takes `uTexture`, `uTime`, `uDistortion`, `uOpacity`.
  - Calculates distorted UVs: `vec2 distortedUv = uv + vec2(sin(uv.y * 10.0 + uTime), cos(uv.x * 10.0 + uTime)) * uDistortion * 0.1;`
  - Samples texture: `vec4 color = texture2D(uTexture, distortedUv);`
  - Applies fade: `gl_FragColor = vec4(color.rgb, color.a * uOpacity);`

#### 3. The Image Plane (`image-plane.tsx`)
- Receives `position`, `imageSrc`, `distortion`, `fadeDuration`.
- Uses `useTexture(imageSrc)` from `@react-three/drei`.
- Uses `useFrame` to calculate its age (`clock.getElapsedTime() - birthTime`).
- Calculates `opacity = 1.0 - (age / fadeDuration)`.
- Passes `uTime`, `uDistortion`, and `uOpacity` to the shader material.
- **Crucial:** Must dispose of the texture and material on unmount to prevent memory leaks.

### Example Component Structure (Simplified)

```tsx
// liquid-image-trail.tsx
'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import * as THREE from 'three'
import { cn } from '@/lib/utils'
import { liquidTrailVariants, type LiquidImageTrailProps } from './liquid-image-trail'

// ... (Shader definitions would be imported or inline)

function TrailItem({ position, imageSrc, distortion, fadeDuration, birthTime }) {
  const meshRef = useRef()
  const materialRef = useRef()
  
  useFrame(({ clock }) => {
    const age = clock.getElapsedTime() - birthTime
    const opacity = Math.max(0, 1.0 - (age / fadeDuration))
    
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
      materialRef.current.uniforms.uOpacity.value = opacity
    }
    
    // Optional: slight movement or scale down as it fades
    if (meshRef.current) {
       meshRef.current.scale.setScalar(opacity * 0.4) // example scale
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[1, 1.5]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        uniforms={{
          uTexture: { value: new THREE.TextureLoader().load(imageSrc) },
          uTime: { value: 0 },
          uDistortion: { value: distortion },
          uOpacity: { value: 1 }
        }}
        vertexShader={`...`}
        fragmentShader={`...`}
      />
    </mesh>
  )
}

export function LiquidImageTrail({
  images,
  className,
  distortion = 0.5,
  fadeDuration = 1.2,
  trailSize = 8,
  imageScale = 0.4,
  velocityThreshold = 0.1,
  ...props
}: LiquidImageTrailProps) {
  const [trailItems, setTrailItems] = useState([])
  const mouseRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, lastTime: 0 })
  const imageIndexRef = useRef(0)

  const handleMouseMove = useCallback((e) => {
    const now = performance.now()
    const dt = now - mouseRef.current.lastTime
    if (dt < 16) return // Throttle slightly
    
    const dx = e.clientX - mouseRef.current.lastX
    const dy = e.clientY - mouseRef.current.lastY
    const velocity = Math.sqrt(dx*dx + dy*dy) / dt
    
    if (velocity > velocityThreshold) {
      // Convert screen coords to normalized device coords (-1 to +1) roughly
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      
      setTrailItems(prev => {
        const newItem = {
          id: now,
          position: [x * 5, y * 5, 0], // Scale to camera view
          imageIndex: imageIndexRef.current % images.length,
          birthTime: performance.now() / 1000
        }
        imageIndexRef.current++
        return [...prev.slice(-(trailSize - 1)), newItem]
      })
      
      mouseRef.current.lastX = e.clientX
      mouseRef.current.lastY = e.clientY
    }
    mouseRef.current.lastTime = now
  }, [images.length, trailSize, velocityThreshold])

  // Cleanup old items
  useEffect(() => {
    const interval = setInterval(() => {
      const now = performance.now() / 1000
      setTrailItems(prev => prev.filter(item => now - item.birthTime < fadeDuration))
    }, 100)
    return () => clearInterval(interval)
  }, [fadeDuration])

  return (
    <div 
      className={cn(liquidTrailVariants(), className)} 
      onMouseMove={handleMouseMove}
      {...props}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        {trailItems.map(item => (
          <TrailItem
            key={item.id}
            position={item.position}
            imageSrc={images[item.imageIndex]}
            distortion={distortion}
            fadeDuration={fadeDuration}
            birthTime={item.birthTime}
          />
        ))}
      </Canvas>
    </div>
  )
}
```

## Implementation Steps

1. Create `registry/liquid-image-trail/` directory.
2. Create `trail-shader.ts` containing the GLSL vertex and fragment strings.
3. Create `image-plane.tsx` implementing the R3F mesh with the shader material and `useFrame` lifecycle.
4. Create `liquid-image-trail.tsx` with the mouse tracking logic, state management for the trail queue, and the R3F Canvas wrapper.
5. Create `index.ts` barrel export.
6. Create test page at `app/test-liquid-trail/page.tsx`.
   - Must use `dynamic` import for the component.
   - Provide a large, dark container (e.g., `h-screen w-full`).
   - Pass an array of 5-6 high-quality Unsplash image URLs.
   - Add UI controls (sliders) to adjust `distortion`, `fadeDuration`, and `trailSize` in real-time to prove configurability.
7. Verify build: `npm run build`.
8. Verify visually: `npm run dev`, navigate to `/test-liquid-trail`, move mouse rapidly to see the liquid trail.
9. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] Component renders without SSR errors (using dynamic import).
- [ ] Mouse movement spawns images that follow the cursor.
- [ ] Images distort with a liquid/shader effect.
- [ ] Images fade out smoothly after `fadeDuration`.
- [ ] `trailSize` prop correctly limits the number of visible images.
- [ ] `distortion` prop slider changes the warp intensity in real-time.
- [ ] No memory leaks (check Chrome DevTools Memory tab after 1 minute of use).
- [ ] `npm run build` passes with zero TypeScript errors.
- [ ] `progress-tracker.md` is updated.

## Constraints

- **SSR Safety:** The component MUST be dynamically imported in the test page and documentation.
- **Performance:** Do not create new `THREE.TextureLoader()` instances inside `useFrame`. Load textures once or use `useTexture` from Drei.
- **Cleanup:** Ensure all event listeners and intervals are cleared on unmount.
- **Pro Tier:** Mark as `tier: "pro"` in `registry.json`.

## Files to Create

1. `registry/liquid-image-trail/trail-shader.ts`
2. `registry/liquid-image-trail/image-plane.tsx`
3. `registry/liquid-image-trail/liquid-image-trail.tsx`
4. `registry/liquid-image-trail/index.ts`
5. `app/test-liquid-trail/page.tsx`

## Files to Update

1. `registry.json` (Add entry with tier: "pro")
2. `context/progress-tracker.md`