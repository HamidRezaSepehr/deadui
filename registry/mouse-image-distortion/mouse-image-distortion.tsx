"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useTexture, useAspect } from "@react-three/drei"
import * as THREE from "three"
import { animate, useMotionValue, useTransform } from "framer-motion"
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
    const updateDimension = () =>
      setDimension({ width: window.innerWidth, height: window.innerHeight })
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
              {project.subtitle && (
                <p className={cn("text-sm opacity-60", textColor)}>{project.subtitle}</p>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Three.js Canvas Layer */}
      <Canvas className="absolute inset-0 z-0">
        <Model
          activeMenu={activeMenu}
          items={items}
          amplitude={amplitude}
          imageScale={imageScale}
        />
      </Canvas>
    </div>
  )
}

// --- 3D Model Component ---
function Model({
  activeMenu,
  items,
  amplitude,
  imageScale,
}: {
  activeMenu: number | null
  items: DistortionItem[]
  amplitude: number
  imageScale: number
}) {
  const plane = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { viewport } = useThree()
  const dimension = useDimension()
  const mouse = useMouse()
  const opacity = useMotionValue(0)

  const textures = useTexture(items.map((item) => item.imageUrl))
  const firstTexture = textures[0]
  const texImage = firstTexture?.image as HTMLImageElement | undefined
  const texWidth = texImage?.naturalWidth ?? texImage?.width ?? 1
  const texHeight = texImage?.naturalHeight ?? texImage?.height ?? 1
  const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a
  const [imgW, imgH] = useAspect(texWidth, texHeight, imageScale)

  const smoothMouse = { x: useMotionValue(0), y: useMotionValue(0) }

  const uniforms = useMemo(
    () => ({
      uDelta: { value: { x: 0, y: 0 } },
      uAmplitude: { value: amplitude },
      uTexture: { value: textures[0] },
      uAlpha: { value: 0 },
    }),
    [amplitude, textures]
  )

  const x = useTransform(
    smoothMouse.x,
    [0, dimension.width],
    [-1 * viewport.width / 2, viewport.width / 2]
  )
  const y = useTransform(
    smoothMouse.y,
    [0, dimension.height],
    [viewport.height / 2, -1 * viewport.height / 2]
  )

  useEffect(() => {
    if (activeMenu != null && materialRef.current) {
      materialRef.current.uniforms.uTexture.value = textures[activeMenu]
      animate(opacity, 1, {
        duration: 0.2,
        onUpdate: (latest) => {
          if (materialRef.current) materialRef.current.uniforms.uAlpha.value = latest
        },
      })
    } else if (materialRef.current) {
      animate(opacity, 0, {
        duration: 0.2,
        onUpdate: (latest) => {
          if (materialRef.current) materialRef.current.uniforms.uAlpha.value = latest
        },
      })
    }
  }, [activeMenu, textures, opacity])

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uAmplitude.value = amplitude
    }
  }, [amplitude])

  useFrame(() => {
    const mesh = plane.current
    const mat = materialRef.current
    if (!mesh || !mat) return

    const rawX = mouse.x
    const rawY = mouse.y
    const smoothX = smoothMouse.x.get()
    const smoothY = smoothMouse.y.get()

    if (Math.abs(rawX - smoothX) > 1) {
      smoothMouse.x.set(lerp(smoothX, rawX, 0.1))
      smoothMouse.y.set(lerp(smoothY, rawY, 0.1))
      mat.uniforms.uDelta.value = { x: rawX - smoothX, y: -1 * (rawY - smoothY) }
    }

    mesh.position.x = x.get()
    mesh.position.y = y.get()
  })

  return (
    <mesh ref={plane} scale={[imgW, imgH, 1]}>
      <planeGeometry args={[1, 1, 15, 15]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  )
}
