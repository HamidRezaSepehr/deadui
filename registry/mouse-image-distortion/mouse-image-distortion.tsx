"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useTexture, useAspect } from "@react-three/drei"
import * as THREE from "three"
import { animate, useMotionValue } from "framer-motion"
import { cn } from "@/lib/utils"

export interface DistortionItem {
  id?: string
  title: string
  subtitle?: string
  imageUrl: string
}

export interface MouseImageDistortionProps {
  items: DistortionItem[]
  className?: string
  /** Size of the image relative to the viewport (0‑1). Default: 0.225 */
  scale?: number
  /** Strength of the vertex‑displacement warp. Default: 0.0005 */
  amplitude?: number
  /** Mouse‑follow smoothing factor (0‑1). Higher = snappier. Default: 0.1 */
  smoothing?: number
  /** Fade‑in duration on hover (seconds). Default: 0.2 */
  fadeDuration?: number
  /** Tailwind text‑color class for row titles. Default: "text-white" */
  textColor?: string
  /** Tailwind text‑size class for row titles. Default: "text-[4vw]" */
  textSize?: string
  /** Tailwind padding class for each row. Default: "p-5" */
  rowPadding?: string
  /** Tailwind border‑color class for row dividers. Default: "border-white/20" */
  rowBorderColor?: string
}

// ─── GLSL shaders (from the reference) ───────────────────────────────────────

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
  vec3 tex = texture2D(uTexture, vUv).rgb;
  gl_FragColor = vec4(tex, uAlpha);
}
`

// ─── Hooks (ported from the reference) ────────────────────────────────────────

function useMouse() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handler = (e: globalThis.MouseEvent) => setMouse({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", handler)
    return () => window.removeEventListener("mousemove", handler)
  }, [])
  return mouse
}

function useDimension() {
  const [dim, setDim] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const resize = () => setDim({ width: window.innerWidth, height: window.innerHeight })
    resize()
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [])
  return dim
}

function lerp(x: number, y: number, a: number) {
  return x * (1 - a) + y * a
}

// ─── 3D Model (one mesh per instance) ──────────────────────────────────────

function Model({
  items,
  activeMenu,
  amplitude,
  smoothing,
  fadeDuration,
  imageScale,
}: {
  items: DistortionItem[]
  activeMenu: number | null
  amplitude: number
  smoothing: number
  fadeDuration: number
  imageScale: number
}) {
  const plane = useRef<THREE.Mesh>(null)
  const { viewport } = useThree()
  const dim = useDimension()
  const mouse = useMouse()
  const opacity = useMotionValue(0)

  const textures = useTexture(items.map((item) => item.imageUrl))

  const firstImg = textures[0]?.image as HTMLImageElement | undefined
  const tw = firstImg?.width ?? 1
  const th = firstImg?.height ?? 1
  const size = useAspect(tw, th, imageScale)

  const sm = useRef({ x: useMotionValue(0), y: useMotionValue(0) })

  const uniforms = useRef({
    uDelta: { value: { x: 0, y: 0 } },
    uAmplitude: { value: amplitude },
    uTexture: { value: textures[0] },
    uAlpha: { value: 0 },
  })

  // Sync uAmplitude when prop changes (the ref is captured at creation)
  useEffect(() => {
    uniforms.current.uAmplitude.value = amplitude
  }, [amplitude])

  // Fade in/out and switch texture on hover
  useEffect(() => {
    const tex = textures[activeMenu ?? 0]
    if (tex) uniforms.current.uTexture.value = tex

    const target = activeMenu !== null ? 1 : 0
    animate(opacity, target, {
      duration: fadeDuration,
      onUpdate: (latest) => {
        uniforms.current.uAlpha.value = latest
      },
    })
  }, [activeMenu, textures, opacity, fadeDuration])

  useFrame(() => {
    const mesh = plane.current
    if (!mesh) return

    const { x, y } = mouse
    const sx = sm.current.x.get()
    const sy = sm.current.y.get()

    if (Math.abs(x - sx) > 1) {
      sm.current.x.set(lerp(sx, x, smoothing))
      sm.current.y.set(lerp(sy, y, smoothing))
      uniforms.current.uDelta.value = {
        x: x - sx,
        y: -(y - sy),
      }
    }

    if (dim.width > 0) {
      const nx = sm.current.x.get() / dim.width
      const ny = sm.current.y.get() / dim.height
      mesh.position.x = (nx - 0.5) * viewport.width
      mesh.position.y = (0.5 - ny) * viewport.height
    }
  })

  return (
    <mesh ref={plane} scale={size}>
      <planeGeometry args={[1, 1, 15, 15]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Scene (fixed full‑screen canvas) ──────────────────────────────────────

function Scene({
  items,
  activeMenu,
  amplitude,
  smoothing,
  fadeDuration,
  imageScale,
}: {
  items: DistortionItem[]
  activeMenu: number | null
  amplitude: number
  smoothing: number
  fadeDuration: number
  imageScale: number
}) {
  return (
    <div className="pointer-events-none fixed left-0 top-0 h-screen w-full">
      <Canvas>
        <Model
          items={items}
          activeMenu={activeMenu}
          amplitude={amplitude}
          smoothing={smoothing}
          fadeDuration={fadeDuration}
          imageScale={imageScale}
        />
      </Canvas>
    </div>
  )
}

// ─── Row list (mix‑blend‑difference like the reference) ─────────────────────

function Projects({
  items,
  activeMenu,
  setActiveMenu,
  textColor,
  textSize,
  rowPadding,
  rowBorderColor,
}: {
  items: DistortionItem[]
  activeMenu: number | null
  setActiveMenu: (i: number | null) => void
  textColor: string
  textSize: string
  rowPadding: string
  rowBorderColor: string
}) {
  return (
    <div className="relative z-10 w-full mix-blend-difference text-white">
      <ul className={cn("border-b", rowBorderColor)}>
        {items.map((item, i) => (
          <li
            key={item.id ?? item.title}
            onMouseEnter={() => setActiveMenu(i)}
            onMouseLeave={() => setActiveMenu(null)}
            className={cn("cursor-pointer border-t", rowPadding, rowBorderColor)}
          >
            <p className={cn("font-bold", textSize, textColor)}>{item.title}</p>
            {item.subtitle && (
              <p className={cn("opacity-60 text-sm", textColor)}>{item.subtitle}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Public component ──────────────────────────────────────────────────────

export function MouseImageDistortion({
  items,
  className,
  scale: imageScale = 0.225,
  amplitude = 0.0005,
  smoothing = 0.1,
  fadeDuration = 0.2,
  textColor = "text-white",
  textSize = "text-[4vw]",
  rowPadding = "p-5",
  rowBorderColor = "border-white/20",
}: MouseImageDistortionProps) {
  const [activeMenu, setActiveMenu] = useState<number | null>(null)

  return (
    <div className={cn("relative w-full min-h-screen", className)}>
      <Projects
        items={items}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        textColor={textColor}
        textSize={textSize}
        rowPadding={rowPadding}
        rowBorderColor={rowBorderColor}
      />
      <Scene
        items={items}
        activeMenu={activeMenu}
        amplitude={amplitude}
        smoothing={smoothing}
        fadeDuration={fadeDuration}
        imageScale={imageScale}
      />
    </div>
  )
}
