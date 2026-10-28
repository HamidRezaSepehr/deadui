"use client"

import React, { useEffect, useRef, useMemo } from "react"
import * as THREE from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import gsap from "gsap"
import { cn } from "@/lib/utils"

// --- Configuration Interface ---
export interface UnwovenConfig {
  threads?: number          // Ribbons per card
  segments?: number         // Horizontal subdivisions per ribbon
  cardMaxHeight?: number    // Max pixel height of card
  cardAspect?: number       // Width / Height ratio
  cardGapRatio?: number     // Gap as fraction of card width
  cardRadius?: number       // Corner radius in px
  scrollSpeed?: number      // Auto-scroll speed (px/s)
  flingMax?: number         // Max velocity after drag (px/s)
  tearZoneRatio?: number    // Fraction of viewport width for tear zone
  tearZoneMax?: number      // Cap for tear zone width (px)
}

const DEFAULT_CONFIG: Required<UnwovenConfig> = {
  threads: 26,
  segments: 20,
  cardMaxHeight: 452,
  cardAspect: 0.75,
  cardGapRatio: 0.11,
  cardRadius: 20,
  scrollSpeed: 95,
  flingMax: 4200,
  tearZoneRatio: 0.26,
  tearZoneMax: 380,
}

// --- Shaders ---
const VERTEX_SHADER = /* glsl */ `
attribute float aThread;
attribute float aRim;

uniform float uTime;
uniform float uHalfWidth;
uniform float uZone;
uniform float uStrength;
uniform float uWobble;
uniform float uSeed;

varying vec2 vUv;
varying float vTear;
varying float vRim;
varying float vRandom;

float hash(float n) { return fract(sin(n * 127.1 + 311.7) * 43758.5453); }

void main() {
  vUv = uv;
  vRim = aRim;

  vec4 world = modelMatrix * vec4(position, 1.0);
  float x = world.x;

  float left  = 1.0 - smoothstep(-uHalfWidth, -uHalfWidth + uZone, x);
  float right = smoothstep(uHalfWidth - uZone, uHalfWidth, x);
  float tear  = max(left, right) * uStrength;

  float direction = x < 0.0 ? -1.0 : 1.0;

  float randomA = hash(aThread + uSeed * 57.0);
  float randomB = hash(aThread * 3.7 + uSeed * 91.0);
  vRandom = randomA;

  float t = pow(tear, 1.4);

  float run = t * (60.0 + randomA * 420.0);
  run *= 0.85 + 0.15 * sin(uTime * (1.0 + randomB * 2.0) + randomA * 6.2831);
  world.x += direction * run;

  world.y += (randomA - 0.5) * 170.0 * t * t;

  world.y += sin(world.x * 0.02 + uTime * (1.6 + randomA * 2.2) + randomA * 6.2831)
             * (5.0 + 13.0 * randomA) * t * uWobble;

  vTear = tear;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`

const FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform sampler2D uMap;
uniform vec2 uCardSize;
uniform float uRadius;
uniform float uImageAspect;

varying vec2 vUv;
varying float vTear;
varying float vRim;
varying float vRandom;

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  float tear = vTear;
  float rim  = abs(vRim);

  float coreWidth = mix(0.8, 0.16 + vRandom * 0.12, smoothstep(0.0, 0.85, tear));
  float threadAlpha = 1.0 - smoothstep(coreWidth - 0.10, coreWidth + 0.06, rim);
  threadAlpha = mix(1.0, threadAlpha, smoothstep(0.03, 0.30, tear));

  vec2 p = (vUv - 0.5) * uCardSize;
  float cardAlpha = 1.0 - smoothstep(-1.5, 0.5, sdRoundBox(p, uCardSize * 0.5, uRadius));

  float fade  = 1.0 - smoothstep(0.75, 1.0, tear) * 0.65;
  float alpha = cardAlpha * threadAlpha * fade;
  if (alpha < 0.003) discard;

  float cardAspect = uCardSize.x / uCardSize.y;
  vec2 scale = cardAspect > uImageAspect
    ? vec2(1.0, uImageAspect / cardAspect)
    : vec2(cardAspect / uImageAspect, 1.0);
  
  vec3 color = texture2D(uMap, (vUv - 0.5) * scale + 0.5).rgb;

  color *= 1.0 - tear * 0.4 * rim * rim;
  color += tear * 0.18 * (1.0 - smoothstep(0.0, 0.45, rim));
  color = mix(color, vec3(1.0), smoothstep(0.55, 1.0, tear) * 0.8);

  gl_FragColor = vec4(color, alpha);
}
`

// --- Geometry Builder ---
function buildRibbonGeometry(width: number, height: number, threads: number, segments: number) {
  const columns = segments + 1
  const perThread = columns * 2
  const total = threads * perThread

  const positions = new Float32Array(total * 3)
  const uvs = new Float32Array(total * 2)
  const rims = new Float32Array(total)
  const threadIds = new Float32Array(total)
  const indices: number[] = []

  let v = 0
  for (let t = 0; t < threads; t++) {
    for (let row = 0; row < 2; row++) {
      const vy = (t + row) / threads
      for (let c = 0; c < columns; c++) {
        const ux = c / segments
        positions[v * 3 + 0] = (ux - 0.5) * width
        positions[v * 3 + 1] = (vy - 0.5) * height
        positions[v * 3 + 2] = 0
        uvs[v * 2 + 0] = ux
        uvs[v * 2 + 1] = vy
        rims[v] = row === 0 ? -1 : 1
        threadIds[v] = t
        v++
      }
    }

    const base = t * perThread
    for (let c = 0; c < segments; c++) {
      const bl = base + c
      const br = base + c + 1
      const tl = base + columns + c
      const tr = base + columns + c + 1
      indices.push(bl, br, tl, br, tr, tl)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2))
  geometry.setAttribute("aRim", new THREE.BufferAttribute(rims, 1))
  geometry.setAttribute("aThread", new THREE.BufferAttribute(threadIds, 1))
  geometry.setIndex(indices)
  return geometry
}

// --- Main Scene Component ---
interface SceneProps {
  images: string[]
  config: Required<UnwovenConfig>
}

function UnwovenScene({ images, config }: SceneProps) {
  const { size } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  
  // Shared Uniforms
  const sharedUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uHalfWidth: { value: size.width / 2 },
    uZone: { value: Math.min(size.width * config.tearZoneRatio, config.tearZoneMax) },
    uStrength: { value: 0 }, // Starts at 0, tweens to 1
    uWobble: { value: typeof window !== 'undefined' && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1 },
    uCardSize: { value: new THREE.Vector2(1, 1) },
    uRadius: { value: config.cardRadius },
  }), [size.width, config])
 
  // State Refs for Physics
  const state = useRef({
    offset: 0,
    velocity: 0,
    isDragging: false,
    lastX: 0,
    lastTime: 0,
    dragVelocity: 0,
    cards: [] as { mesh: THREE.Mesh; baseX: number }[],
    geometry: null as THREE.BufferGeometry | null,
    materials: [] as THREE.ShaderMaterial[],
    pitch: 0,
    stripSpan: 0,
  })

  // Initialize Textures & Materials
  useEffect(() => {
    const loader = new THREE.TextureLoader()
    const mats = images.map((url, i) => {
      const texture = loader.load(url)
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      
      const mat = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          ...sharedUniforms,
          uMap: { value: texture },
          uSeed: { value: (i + 1) * 0.731 },
          uImageAspect: { value: texture.image ? texture.image.width / texture.image.height : 0.75 },
        },
      })
      return mat
    })
    
    state.current.materials = mats
    
    // Tween strength in
    gsap.to(sharedUniforms.uStrength, { value: 1, duration: 1.8, ease: "power3.inOut", delay: 0.2 })
    
    return () => {
      mats.forEach(m => m.dispose())
      loader.dispose()
    }
  }, [images, sharedUniforms])

  // Build Strip Layout
  const rebuildStrip = () => {
    const s = state.current
    if (!groupRef.current) return
    
    // Clear old meshes
    while(groupRef.current.children.length > 0) {
      const child = groupRef.current.children[0]
      groupRef.current.remove(child)
      if ((child as any).geometry) (child as any).geometry.dispose()
    }
    s.cards = []

    const vh = size.height
    const vw = size.width
    
    const cardHeight = Math.min(config.cardMaxHeight, vh * 0.62)
    const cardWidth = cardHeight * config.cardAspect
    const gap = Math.max(24, cardWidth * config.cardGapRatio)
    const pitch = cardWidth + gap
    
    s.pitch = pitch
    
    // Update shared uniforms
    sharedUniforms.uCardSize.value.set(cardWidth, cardHeight)
    sharedUniforms.uHalfWidth.value = vw / 2
    sharedUniforms.uZone.value = Math.min(vw * config.tearZoneRatio, config.tearZoneMax)

    if (s.geometry) s.geometry.dispose()
    s.geometry = buildRibbonGeometry(cardWidth, cardHeight, config.threads, config.segments)

    const count = Math.max(8, Math.ceil((vw + pitch * 3) / pitch))
    s.stripSpan = count * pitch

    for (let i = 0; i < count; i++) {
      const mat = s.materials[i % s.materials.length]
      const mesh = new THREE.Mesh(s.geometry, mat)
      mesh.frustumCulled = false
      groupRef.current.add(mesh)
      s.cards.push({ mesh, baseX: i * pitch })
    }
  }

  useEffect(() => {
    rebuildStrip()
  }, [size, config, images]) // Rebuild on resize or config change

  // Animation Loop
  useFrame((_, delta) => {
    const s = state.current
    if (!s.cards.length) return

    // Update Time
    sharedUniforms.uTime.value += delta

    // Physics Integration
    if (!s.isDragging) {
      s.offset += s.velocity * delta
    }

    const halfSpan = s.stripSpan / 2
    for (const card of s.cards) {
      // Infinite wrap logic
      const x = ((card.baseX - s.offset) % s.stripSpan + s.stripSpan) % s.stripSpan
      card.mesh.position.x = x - halfSpan
    }
  })

  // Pointer Events for Dragging
  useEffect(() => {
    const el = document.getElementById("unwoven-stage")
    if (!el) return

    const onPointerDown = (e: PointerEvent) => {
      const s = state.current
      s.isDragging = true
      s.lastX = e.clientX
      s.lastTime = performance.now()
      s.dragVelocity = 0
      el.setPointerCapture(e.pointerId)
      gsap.killTweensOf(state.current) // Kill auto-scroll tween if exists
    }

    const onPointerMove = (e: PointerEvent) => {
      const s = state.current
      if (!s.isDragging) return
      
      const now = performance.now()
      const dx = e.clientX - s.lastX
      const dt = Math.max(1, now - s.lastTime) / 1000
      
      s.offset -= dx
      // Smoothed velocity calculation
      s.dragVelocity += (-dx / dt - s.dragVelocity) * 0.35
      
      s.lastX = e.clientX
      s.lastTime = now
    }

    const onPointerUp = (e: PointerEvent) => {
      const s = state.current
      if (!s.isDragging) return
      s.isDragging = false
      el.releasePointerCapture(e.pointerId)
      
      // Apply fling velocity capped at max
      const finalVel = gsap.utils.clamp(-config.flingMax, config.flingMax, s.dragVelocity)
      s.velocity = finalVel
      
      // Optionally decay velocity back to 0 or base speed over time
      gsap.to(s, { 
        velocity: 0, 
        duration: 2, 
        ease: "power2.out" 
      })
    }

    el.addEventListener("pointerdown", onPointerDown)
    el.addEventListener("pointermove", onPointerMove)
    el.addEventListener("pointerup", onPointerUp)
    el.addEventListener("pointercancel", onPointerUp)

    return () => {
      el.removeEventListener("pointerdown", onPointerDown)
      el.removeEventListener("pointermove", onPointerMove)
      el.removeEventListener("pointerup", onPointerUp)
      el.removeEventListener("pointercancel", onPointerUp)
    }
  }, [config.flingMax])

  return <group ref={groupRef} />
}

// --- Public Wrapper ---
export interface UnwovenSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  images: string[]
  config?: UnwovenConfig
}

export function UnwovenSlider({ images, config = {}, className, ...props }: UnwovenSliderProps) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }

  return (
    <div
      id="unwoven-stage"
      className={cn("relative w-full h-[60vh] cursor-grab active:cursor-grabbing touch-none overflow-hidden bg-black", className)}
      {...props}
    >
      <Canvas orthographic camera={{ position: [0, 0, 100], zoom: 1 }} gl={{ antialias: true, alpha: true }}>
        <UnwovenScene images={images} config={mergedConfig} />
      </Canvas>
    </div>
  )
}
