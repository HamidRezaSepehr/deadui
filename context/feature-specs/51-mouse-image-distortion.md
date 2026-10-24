# Feature 51: Mouse Image Distortion Component (Three.js + GLSL — exact port)

## Overview
Port of `olivierlarose/mouse-image-distortion`. A vertical list of text rows; hovering a row fades in that row's image on a full‑bleed Three.js plane that follows the cursor, and the plane's vertices are warped by a GLSL vertex shader whose displacement magnitude is driven by **cursor velocity** (fast move = strong bend, slow move = flat). Text uses `mix-blend-difference` so it inverts against the moving image.

## Non‑negotiable implementation rules (the AI MUST follow these verbatim)
1. Use the EXACT `vertex` and `fragment` GLSL strings below. Do not rewrite, simplify, or "improve" them.
2. Velocity distortion: each frame, capture the OLD smoothed position, and ONLY when `abs(rawX - oldSmoothedX) > 1`, lerp the smoothed position toward raw by `smoothingFactor`, then set `uDelta = { x: rawX - oldSmoothedX, y: -1 * (rawY - oldSmoothedY) }` using the OLD values (this matches the original exactly and is what produces the snap‑back warp).
3. Plane position: map smoothed pixel coords to world coords with `posX = (smoothedX / windowW - 0.5) * viewport.width` and `posY = (0.5 - smoothedY / windowH) * viewport.height`, set directly on the mesh in `useFrame`. Do NOT use `framer-motion-3d` or `useTransform` for position.
4. Mouse & window size MUST be stored in `useRef` (updated by window listeners in a `useEffect`), NOT in `useState`. The 3D scene must never re‑render on mousemove.
5. Alpha fade MUST use `animate` + `useMotionValue` imported from `motion/react` (matches project convention and the original's easing).
6. The Canvas layer is `absolute inset-0 z-0 pointer-events-none`; the text list is `relative z-10` with `mix-blend-difference`; the root is `relative isolate` with a solid background so the blend is predictable and scoped to the component.
7. Dependencies are exactly: `three`, `@react-three/fiber`, `@react-three/drei`, `motion`. Do NOT add `framer-motion` or `framer-motion-3d`.

## Props (all configurable)
| Prop | Type | Default | Maps to |
|---|---|---|---|
| `items` | `{ title: string; imageUrl: string; subtitle?: string }[]` | — | the list + textures |
| `amplitude` | number | `0.0005` | `uAmplitude` (distortion strength) |
| `smoothingFactor` | number | `0.1` | lerp factor (lower = more lag/warp) |
| `imageScale` | number | `0.225` | `useAspect` fit factor (image size) |
| `fadeDuration` | number | `0.2` | alpha in/out seconds |
| `geometrySegments` | number | `15` | planeGeometry subdivisions (warp resolution) |
| `textSize` | string | `"text-[4vw]"` | row title size |
| `textColor` | string | `"text-white"` | row text color (drives blend) |
| `textFont` | string? | undefined | inline `fontFamily` on titles |
| `rowPadding` | string | `"p-5"` | row padding |
| `rowBorder` | string | `"border-t border-white/20"` | row separator |
| `blendMode` | string | `"mix-blend-difference"` | CSS blend on the list |
| `bgClassName` | string | `"bg-black"` | root background (needed for blend) |
| `subtitleClassName` | string | `"text-sm opacity-60"` | subtitle styling |
| `className` / `listClassName` / `canvasClassName` | string | — | layout overrides |

## Exact component code — `registry/mouse-image-distortion/mouse-image-distortion.tsx`
```tsx
"use client"

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useAspect, useTexture } from "@react-three/drei"
import { animate, useMotionValue } from "motion/react"
import * as THREE from "three"
import { cn } from "@/lib/utils"

/* ===== EXACT GLSL from olivierlarose/mouse-image-distortion (do not modify) ===== */
const vertex = `
varying vec2 vUv;
uniform vec2 uDelta;
uniform float uAmplitude;
float PI = 3.141592653589793238;

void main() {
    vUv = uv;
    vec3 newPosition = position;
    newPosition.x += sin(uv.y * PI) * uDelta.x * uAmplitude;
    newPosition.y += sin(uv.x * PI) * uDelta.y * uAmplitude;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`

const fragment = `
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uAlpha;
void main() {
    vec3 texture = texture2D(uTexture, vUv).rgb;
    gl_FragColor = vec4(texture, uAlpha);
}
`

/* ===== Mouse + viewport size via refs (NO re-render on mousemove) ===== */
function usePointerAndSize() {
  const mouse = useRef({ x: 0, y: 0 })
  const size = useRef({ width: 1, height: 1 })
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }
    const onResize = () => {
      size.current.width = window.innerWidth
      size.current.height = window.innerHeight
    }
    onResize()
    window.addEventListener("mousemove", onMove)
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("resize", onResize)
    }
  }, [])
  return { mouse, size }
}

const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a

/* ===== The warping image plane ===== */
interface PlaneProps {
  activeMenu: number | null
  imageUrls: string[]
  amplitude: number
  smoothingFactor: number
  imageScale: number
  fadeDuration: number
  geometrySegments: number
}

function DistortionPlane({
  activeMenu,
  imageUrls,
  amplitude,
  smoothingFactor,
  imageScale,
  fadeDuration,
  geometrySegments,
}: PlaneProps) {
  const plane = useRef<THREE.Mesh>(null)
  const { viewport } = useThree()
  const { mouse, size } = usePointerAndSize()

  const textures = useTexture(imageUrls) as THREE.Texture[]
  const first = textures[0]
  const imgW = (first?.image as HTMLImageElement)?.width ?? 1
  const imgH = (first?.image as HTMLImageElement)?.height ?? 1
  const scale = useAspect(imgW, imgH, imageScale)

  const smooth = useRef({ x: 0, y: 0 })
  const alpha = useMotionValue(0)

  const uniforms = useRef({
    uDelta: { value: { x: 0, y: 0 } },
    uAmplitude: { value: amplitude },
    uTexture: { value: textures[0] },
    uAlpha: { value: 0 },
  })

  useEffect(() => {
    uniforms.current.uAmplitude.value = amplitude
  }, [amplitude])

  useEffect(() => {
    const mat = plane.current?.material as THREE.ShaderMaterial | undefined
    if (!mat) return
    if (activeMenu != null) {
      mat.uniforms.uTexture.value = textures[activeMenu]
      animate(alpha, 1, {
        duration: fadeDuration,
        onUpdate: (v) => {
          const m = plane.current?.material as THREE.ShaderMaterial | undefined
          if (m) m.uniforms.uAlpha.value = v
        },
      })
    } else {
      animate(alpha, 0, {
        duration: fadeDuration,
        onUpdate: (v) => {
          const m = plane.current?.material as THREE.ShaderMaterial | undefined
          if (m) m.uniforms.uAlpha.value = v
        },
      })
    }
  }, [activeMenu, textures, alpha, fadeDuration])

  useFrame(() => {
    const mat = plane.current?.material as THREE.ShaderMaterial | undefined
    if (!plane.current || !mat) return

    const { x, y } = mouse.current
    const oldX = smooth.current.x
    const oldY = smooth.current.y

    // EXACT original velocity logic: delta uses the PRE-lerp smoothed values
    if (Math.abs(x - oldX) > 1) {
      smooth.current.x = lerp(oldX, x, smoothingFactor)
      smooth.current.y = lerp(oldY, y, smoothingFactor)
      mat.uniforms.uDelta.value = {
        x: x - oldX,
        y: -1 * (y - oldY),
      }
    }

    // EXACT original window -> viewport mapping, applied directly to the mesh
    const w = size.current.width || 1
    const h = size.current.height || 1
    plane.current.position.x = (smooth.current.x / w - 0.5) * viewport.width
    plane.current.position.y = (0.5 - smooth.current.y / h) * viewport.height
  })

  return (
    <mesh ref={plane} scale={scale as unknown as THREE.Vector3}>
      <planeGeometry args={[1, 1, geometrySegments, geometrySegments]} />
      <shaderMaterial
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms.current}
        transparent
      />
    </mesh>
  )
}

/* ===== Public component ===== */
export interface DistortionItem {
  title: string
  imageUrl: string
  subtitle?: string
}

export interface MouseImageDistortionProps {
  items: DistortionItem[]
  amplitude?: number
  smoothingFactor?: number
  imageScale?: number
  fadeDuration?: number
  geometrySegments?: number
  textSize?: string
  textColor?: string
  textFont?: string
  rowPadding?: string
  rowBorder?: string
  blendMode?: string
  bgClassName?: string
  subtitleClassName?: string
  className?: string
  listClassName?: string
  canvasClassName?: string
}

export function MouseImageDistortion({
  items,
  amplitude = 0.0005,
  smoothingFactor = 0.1,
  imageScale = 0.225,
  fadeDuration = 0.2,
  geometrySegments = 15,
  textSize = "text-[4vw]",
  textColor = "text-white",
  textFont,
  rowPadding = "p-5",
  rowBorder = "border-t border-white/20",
  blendMode = "mix-blend-difference",
  bgClassName = "bg-black",
  subtitleClassName = "text-sm opacity-60",
  className,
  listClassName,
  canvasClassName,
}: MouseImageDistortionProps) {
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const imageUrls = useMemo(() => items.map((i) => i.imageUrl), [items])

  return (
    <div
      className={cn(
        "relative isolate w-full min-h-screen overflow-hidden",
        bgClassName,
        className
      )}
    >
      {/* 3D layer: scoped to the component, never intercepts pointer events */}
      <div className={cn("pointer-events-none absolute inset-0 z-0", canvasClassName)}>
        <Canvas>
          <Suspense fallback={null}>
            <DistortionPlane
              activeMenu={activeMenu}
              imageUrls={imageUrls}
              amplitude={amplitude}
              smoothingFactor={smoothingFactor}
              imageScale={imageScale}
              fadeDuration={fadeDuration}
              geometrySegments={geometrySegments}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Text layer: blends against the moving image behind it */}
      <ul
        onMouseLeave={() => setActiveMenu(null)}
        className={cn(
          "relative z-10 flex flex-col",
          blendMode,
          textColor,
          listClassName
        )}
      >
        {items.map((item, i) => (
          <li
            key={`${item.title}-${i}`}
            onMouseEnter={() => setActiveMenu(i)}
            className={cn("cursor-pointer", rowPadding, rowBorder)}
          >
            <p
              className={cn("font-bold leading-none", textSize)}
              style={textFont ? { fontFamily: textFont } : undefined}
            >
              {item.title}
            </p>
            {item.subtitle && (
              <p className={subtitleClassName}>{item.subtitle}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## Registry — `registry.json`
```json
{
  "name": "mouse-image-distortion",
  "title": "Mouse Image Distortion",
  "description": "A hover list where each row reveals a cursor-following image on a Three.js plane that warps via a GLSL vertex shader driven by mouse velocity.",
  "tier": "free",
  "dependencies": ["three", "@react-three/fiber", "@react-three/drei", "motion"],
  "files": [
    {
      "path": "registry/mouse-image-distortion/mouse-image-distortion.tsx",
      "target": "components/ui/mouse-image-distortion.tsx"
    }
  ]
}
```

## Test page — `app/test-mouse-image-distortion/page.tsx`
Use remote Unsplash URLs (no local assets). 6–7 rows. Wrap in a normal page; the component is self-contained (`min-h-screen`).
```tsx
import { MouseImageDistortion } from "@/components/ui/mouse-image-distortion"

const items = [
  { title: "Richard Gaston", subtitle: "Creative Direction", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80" },
  { title: "KangHee Kim", subtitle: "Photography", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80" },
  { title: "Inka & Niclas", subtitle: "Art Direction", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80" },
  { title: "Arch McLeish", subtitle: "Motion", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&q=80" },
  { title: "Nadir Bucan", subtitle: "Editing", imageUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&q=80" },
  { title: "Chandler Bondurant", subtitle: "Sound", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80&sat=-100" },
]

export default function Page() {
  return <MouseImageDistortion items={items} />
}
```

## Docs — `app/docs/components/mouse-image-distortion/page.mdx`
- Mark as a 3D component; show the install line `npm install three @react-three/fiber @react-three/drei`.
- Document every prop in the table above.
- Explain the velocity mechanism in one sentence: `uDelta` is the gap between the raw cursor and the lagged (smoothed) cursor, so faster movement = larger shader displacement.
- Note: `mix-blend-difference` requires a solid `bgClassName` (default `bg-black`) to look correct; pairing with smooth-scroll (Lenis) is optional and not bundled.

## Release workflow
- Bump `packages/cli/package.json` → `0.1.28`; tag `v0.1.28`.
- Commit, push branch + tag.
- End the response with the manual npm publish commands (build + `npm publish --access public`, 2FA reminder).

## Verification checklist
- [ ] Hovering a row fades in that row's image following the cursor.
- [ ] Moving the mouse fast visibly bends/warps the image; moving slowly flattens it (velocity-driven).
- [ ] Leaving the list fades the image out.
- [ ] No React re-render storm on mousemove (mouse/size are refs).
- [ ] No `framer-motion` / `framer-motion-3d` imports anywhere in the file.
- [ ] `npm run build` passes.