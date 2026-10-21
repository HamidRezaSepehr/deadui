# Feature 43: Globe Component

## Overview

Add a new free component, `Globe`, which renders a beautiful, high-performance, interactive 3D globe using the lightweight `cobe` WebGL library. This component is fully configurable, allowing developers to customize colors, markers, rotation speed, and lighting to perfectly match their brand.

## Goals

1. Create `registry/globe/globe.tsx` that safely wraps the `cobe` library, managing the canvas lifecycle and device pixel ratio.
2. Expose all major `cobe` configuration options as React props: `size`, `phi`, `theta`, `dark`, `diffuse`, `mapSamples`, `mapBrightness`, `baseColor`, `markerColor`, `glowColor`, `markers`, `opacity`, `autoRotate`, and `autoRotateSpeed`.
3. Update `registry.json` to include `cobe` as a dependency.
4. Create a comprehensive test page `app/test-globe/page.tsx` showcasing different configurations (e.g., dark mode, custom markers, paused rotation).
5. Create the MDX documentation page `app/docs/components/globe/page.mdx`.
6. Execute the 4-step Release Workflow for `v0.1.19` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/globe/globe.tsx`)
```tsx
"use client"

import React, { useRef, useEffect } from "react"
import createGlobe from "cobe"
import { cn } from "@/lib/utils"

export interface Marker {
  location: [number, number] // [latitude, longitude]
  size: number
}

export interface GlobeProps extends React.HTMLAttributes<HTMLCanvasElement> {
  className?: string
  size?: number
  phi?: number
  theta?: number
  dark?: number
  diffuse?: number
  mapSamples?: number
  mapBrightness?: number
  baseColor?: [number, number, number]
  markerColor?: [number, number, number]
  glowColor?: [number, number, number]
  markers?: Marker[]
  opacity?: number
  autoRotate?: boolean
  autoRotateSpeed?: number
}

export function Globe({
  className,
  size = 400,
  phi = 0,
  theta = 0,
  dark = 0,
  diffuse = 1.2,
  mapSamples = 16000,
  mapBrightness = 6,
  baseColor = [0.3, 0.3, 0.3],
  markerColor = [0.1, 0.8, 1],
  glowColor = [1, 1, 1],
  markers = [],
  opacity = 1,
  autoRotate = true,
  autoRotateSpeed = 0.01,
  ...props
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phiRef = useRef(phi)
  const thetaRef = useRef(theta)

  // Update refs when props change to allow dynamic rotation control
  useEffect(() => {
    phiRef.current = phi
    thetaRef.current = theta
  }, [phi, theta])

  useEffect(() => {
    let canvas: HTMLCanvasElement | null = null
    let globe: ReturnType<typeof createGlobe> | null = null

    if (canvasRef.current) {
      canvas = canvasRef.current
      const dpr = window.devicePixelRatio || 1
      
      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: size * dpr,
        height: size * dpr,
        phi: phiRef.current,
        theta: thetaRef.current,
        dark,
        diffuse,
        mapSamples,
        mapBrightness,
        baseColor,
        markerColor,
        glowColor,
        markers,
        opacity,
        onRender: (state) => {
          if (autoRotate) {
            phiRef.current += autoRotateSpeed
          }
          state.phi = phiRef.current
          state.theta = thetaRef.current
        },
      })
    }

    return () => {
      if (globe) {
        globe.destroy()
      }
    }
  }, [
    size,
    dark,
    diffuse,
    mapSamples,
    mapBrightness,
    baseColor,
    markerColor,
    glowColor,
    markers,
    opacity,
    autoRotate,
    autoRotateSpeed,
  ])

  return (
    <canvas
      ref={canvasRef}
      className={cn("aspect-square w-full max-w-full", className)}
      style={{ width: size, height: size }}
      {...props}
    />
  )
}
```

### 2. Registry Update (`registry.json`)
```json
{
  "name": "globe",
  "title": "Globe",
  "description": "A highly customizable, high-performance 3D globe powered by cobe WebGL.",
  "tier": "free",
  "dependencies": ["cobe"],
  "files": [
    {
      "path": "registry/globe/globe.tsx",
      "target": "components/ui/globe.tsx"
    }
  ]
}
```

### 3. Test Page (`app/test-globe/page.tsx`)
Create a page demonstrating:
1. **Default Globe**: Standard configuration with auto-rotation.
2. **Dark Mode Globe**: `dark={1}` with custom `baseColor` and `glowColor` for a neon/cyberpunk aesthetic.
3. **With Markers**: A globe featuring 2-3 custom markers (e.g., `[40.7128, -74.006]` for New York) to show location highlighting.
4. **Paused Globe**: `autoRotate={false}` to demonstrate a static, interactive globe.

### 4. Documentation (`app/docs/components/globe/page.mdx`)
- Explain the required dependency: `npm install cobe`.
- Detail all props, especially the `markers` array format (`{ location: [lat, lon], size: number }`).
- Provide clear code snippets for basic usage and advanced marker customization.

### 5. The 4-Step Release Workflow & Manual Publish
Execute the git workflow for `v0.1.19`, and **CRITICALLY**, provide the manual npm publish commands at the end of your response.

## Implementation Steps

1. Create `registry/globe/globe.tsx`.
2. Update `registry.json`.
3. Create `app/test-globe/page.tsx`.
4. Create `app/docs/components/globe/page.mdx`.
5. Bump `packages/cli/package.json` version to `0.1.19`.
6. Execute git commands: `add`, `commit`, `push`, `tag v0.1.19`, `push tag`.
7. Output GitHub Release UI instructions.
8. **Output the exact manual terminal commands to publish to npm.**
9. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] `Globe` component renders correctly without WebGL errors.
- [ ] All configurable props (colors, markers, speed) update the globe in real-time or on re-mount.
- [ ] The canvas correctly handles high-DPI (Retina) displays via `devicePixelRatio`.
- [ ] Test page displays all variations clearly.
- [ ] Git tag `v0.1.19` is pushed.
- [ ] Manual npm publish instructions are clearly provided at the end.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `registry/globe/globe.tsx` (New)
2. `registry.json` (Update)
3. `app/test-globe/page.tsx` (New)
4. `app/docs/components/globe/page.mdx` (New)
5. `packages/cli/package.json` (Update version to 0.1.19)
6. `context/progress-tracker.md` (Update)