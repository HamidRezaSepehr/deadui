# Feature 51: Mouse Image Distortion Component

## Overview
Add a free `MouseImageDistortion` component that replicates the exact Olivier Larose effect: a list of text rows that, when hovered, reveal an image following the cursor. The image dynamically warps using a custom GLSL vertex shader based on the mouse's movement velocity, creating a smooth, liquid distortion.

## Goals
1. Create `registry/mouse-image-distortion/mouse-image-distortion.tsx` using `@react-three/fiber`, `@react-three/drei`, and `framer-motion-3d` with the exact GLSL shaders from the reference.
2. Expose full configurability: `amplitude` (distortion strength), `imageScale`, `textSize`, `textColor`, `rowPadding`, `rowBorderColor`, and `rowHoverBgColor`.
3. Update `registry.json` with the new component and its 3D dependencies.
4. Create a test page `app/test-mouse-image-distortion/page.tsx` demonstrating the effect.
5. Create the MDX documentation page `app/docs/components/mouse-image-distortion/page.mdx`.
6. Execute the 4-step Release Workflow for `v0.1.28` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/mouse-image-distortion/mouse-image-distortion.tsx`)
```tsx
"use client"
import React, { useEffect, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { motion } from "framer-motion-3d"
import { animate, useMotionValue, useTransform } from "framer-motion"
import { useTexture, useAspect } from "@react-three/drei"
import { cn } from "@/lib/utils"

// --- Exact GLSL Shaders from Olivier Larose ---
const vertexShader = `
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

const fragmentShader = `
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uAlpha;
void main() {
    vec3 texture = texture2D(uTexture, vUv).rgb;
    gl_FragColor = vec4(texture, uAlpha);
}
`

// --- Hooks ---
function useMouse() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const mouseMove = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", mouseMove)
    return () => window.removeEventListener("mousemove", mouseMove)
  }, [])
  return mouse
}

function useDimension() {
  const [dimension, setDimension] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const updateDimension = () => setDimension({ width: window.innerWidth, height: window.innerHeight })
    updateDimension()
    window.addEventListener("resize", updateDimension)
    return () => window.removeEventListener("resize", updateDimension)
  }, [])
  return dimension
}

// --- Types ---
export interface DistortionItem {
  id: string
  title: string
  subtitle?: string
  imageUrl: string
}

export interface MouseImageDistortionProps {
  items: DistortionItem[]
  amplitude?: number
  imageScale?: number
  textSize?: string
  textColor?: string
  rowPadding?: string
  rowBorderColor?: string
  rowHoverBgColor?: string
  className?: string
}

// --- Main Component ---
export function MouseImageDistortion({
  items,
  amplitude = 0.0005,
  imageScale = 0.225,
  textSize = "text-[4vw]",
  textColor = "text-white",
  rowPadding = "p-5",
  rowBorderColor = "border-white/20",
  rowHoverBgColor = "bg-white/5",
  className,
}: MouseImageDistortionProps) {
  const [activeMenu, setActiveMenu] = useState<number | null>(null)

  return (
    <div className={cn("relative w-full h-screen overflow-hidden bg-black", className)}>
      {/* HTML List Layer */}
      <div className="absolute inset-0 z-10 mix-blend-difference pointer-events-none">
        <ul
          onMouseLeave={() => setActiveMenu(null)}
          className="h-full w-full flex flex-col justify-center border-t border-b"
          style={{ pointerEvents: "auto" }}
        >
          {items.map((project, i) => (
            <li
              onMouseEnter={() => setActiveMenu(i)}
              key={project.id}
              className={cn(
                "border-t cursor-pointer transition-colors duration-300",
                rowPadding,
                rowBorderColor,
                activeMenu === i ? rowHoverBgColor : "bg-transparent"
              )}
            >
              <p className={cn("font-bold", textSize, textColor)}>{project.title}</p>
              {project.subtitle && <p className={cn("text-sm opacity-60", textColor)}>{project.subtitle}</p>}
            </li>
          ))}
        </ul>
      </div>

      {/* Three.js Canvas Layer */}
      <Canvas className="absolute inset-0 z-0">
        <Model activeMenu={activeMenu} items={items} amplitude={amplitude} imageScale={imageScale} />
      </Canvas>
    </div>
  )
}

// --- 3D Model Component ---
function Model({ 
  activeMenu, 
  items, 
  amplitude, 
  imageScale 
}: { 
  activeMenu: number | null
  items: DistortionItem[]
  amplitude: number
  imageScale: number
}) {
  const plane = useRef<any>(null)
  const { viewport } = useThree()
  const dimension = useDimension()
  const mouse = useMouse()
  const opacity = useMotionValue(0)
  
  const textures = items.map((item) => useTexture(item.imageUrl))
  const { width, height } = textures[0]?.image || { width: 1, height: 1 }
  const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a

  const scale = useAspect(width, height, imageScale)
  const smoothMouse = { x: useMotionValue(0), y: useMotionValue(0) }

  useEffect(() => {
    if (activeMenu != null && plane.current) {
      plane.current.material.uniforms.uTexture.value = textures[activeMenu]
      animate(opacity, 1, { duration: 0.2, onUpdate: (latest) => { if (plane.current) plane.current.material.uniforms.uAlpha.value = latest } })
    } else if (plane.current) {
      animate(opacity, 0, { duration: 0.2, onUpdate: (latest) => { if (plane.current) plane.current.material.uniforms.uAlpha.value = latest } })
    }
  }, [activeMenu, textures, opacity])

  const uniforms = useRef({
    uDelta: { value: { x: 0, y: 0 } },
    uAmplitude: { value: amplitude },
    uTexture: { value: textures[0] },
    uAlpha: { value: 0 },
  })

  useFrame(() => {
    const { x, y } = mouse
    const smoothX = smoothMouse.x.get()
    const smoothY = smoothMouse.y.get()

    if (Math.abs(x - smoothX) > 1) {
      smoothMouse.x.set(lerp(smoothX, x, 0.1))
      smoothMouse.y.set(lerp(smoothY, y, 0.1))
      if (plane.current) {
        plane.current.material.uniforms.uDelta.value = { x: x - smoothX, y: -1 * (y - smoothY) }
      }
    }
  })

  const x = useTransform(smoothMouse.x, [0, dimension.width], [-1 * viewport.width / 2, viewport.width / 2])
  const y = useTransform(smoothMouse.y, [0, dimension.height], [viewport.height / 2, -1 * viewport.height / 2])

  return (
    <motion.mesh position-x={x} position-y={y} ref={plane} scale={scale}>
      <planeGeometry args={[1, 1, 15, 15]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms.current} transparent={true} />
    </motion.mesh>
  )
}
```

### 2. Registry Update (registry.json)
```tsx
{
  "name": "mouse-image-distortion",
  "title": "Mouse Image Distortion",
  "description": "A list component where hovering reveals an image that follows the cursor and warps using Three.js GLSL shaders based on movement velocity.",
  "tier": "free",
  "dependencies": ["three", "@react-three/fiber", "@react-three/drei", "framer-motion", "framer-motion-3d"],
  "files": [
    {
      "path": "registry/mouse-image-distortion/mouse-image-distortion.tsx",
      "target": "components/ui/mouse-image-distortion.tsx"
    }
  ]
}
```


### 3. Test Page & Documentation
app/test-mouse-image-distortion/page.tsx: Showcase a list of 5-6 items with high-quality Unsplash images, demonstrating the velocity warp.
app/docs/components/mouse-image-distortion/page.mdx: Document all configuration props and explain the shader velocity mechanism.


### 4. Release Workflow
Bump packages/cli/package.json to 0.1.28.
Commit, tag v0.1.28, push.
Provide manual npm publish commands at the end.