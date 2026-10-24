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
  const { viewport, size: r3fSize } = useThree()
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
    // Convert viewport-relative mouse coords to canvas-relative using R3F's canvas offset
    const canvasLeft = r3fSize.left || 0
    const canvasTop = r3fSize.top || 0
    const canvasX = smooth.current.x - canvasLeft
    const canvasY = smooth.current.y - canvasTop
    const w = r3fSize.width || size.current.width || 1
    const h = r3fSize.height || size.current.height || 1
    plane.current.position.x = (canvasX / w - 0.5) * viewport.width
    plane.current.position.y = (0.5 - canvasY / h) * viewport.height
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