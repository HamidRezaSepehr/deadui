'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { shaders, type TrailEffect } from './shaders'

/** The quad's own aspect ratio, in world units before `imageScale`. */
export const IMAGE_PLANE_WIDTH = 1
export const IMAGE_PLANE_HEIGHT = 1.5

export interface ImagePlaneProps {
  /** World-space position, already mapped from the container's NDC. */
  position: [number, number, number]
  /**
   * An already-loaded, already-configured `THREE.Texture` handed down by
   * `WebGLImageTrail`. Deliberately NOT a URL: the trail creates and destroys
   * planes dozens of times a second, and a URL would mean a fresh
   * `THREE.TextureLoader`, a second HTTP request for a texture the page already
   * has, and a fresh GPU upload for every single quad.
   */
  texture: THREE.Texture

  /** Which entry of the `shaders` dictionary this quad compiles. */
  effect: TrailEffect

  /**
   * SUPERSET UNIFORMS. Every one of these is written into the material's
   * uniform object on every frame, whether or not the active shader reads it.
   * There is deliberately no filtering: GLSL drops the ones the shader does not
   * declare, and three.js never looks those names up in the linked program, so
   * a superset costs nothing and keeps the public API flat and predictable.
   */
  distortionStrength: number
  pixelSize: number
  waveFrequency: number
  waveAmplitude: number
  /** Hex string. Uploaded as a `THREE.Color`, which holds linear values. */
  tintColor: string

  /** Multiplier applied to the shader clock as `uTime` is written. */
  distortionSpeed: number
  /** Seconds from birth to fully faded. */
  fadeDuration: number
  /** Quad scale at birth; it shrinks to zero over `fadeDuration`. */
  imageScale: number
}

/**
 * One quad of the trail.
 *
 * `useFrame` is the only writer of the uniforms and of the mesh scale, and it
 * runs on the render loop rather than in React's render phase, so none of that
 * work produces a commit.
 */
export function ImagePlane({
  position,
  texture,
  effect,
  distortionStrength,
  pixelSize,
  waveFrequency,
  waveAmplitude,
  tintColor,
  distortionSpeed,
  fadeDuration,
  imageScale,
}: ImagePlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const bornAtRef = useRef<number | null>(null)

  // `THREE.Color` is immutable in practice and holds no GPU resource, but a new
  // one per render would still be a per-frame allocation in the hot path.
  const tint = useMemo(() => new THREE.Color(tintColor), [tintColor])

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uDistortionStrength: { value: distortionStrength },
      uPixelSize: { value: pixelSize },
      uWaveFrequency: { value: waveFrequency },
      uWaveAmplitude: { value: waveAmplitude },
      uTintColor: { value: tint },
      // Every value below is written by `useFrame` before the first draw, so
      // what is seeded here is a shape, not a value.
      uTime: { value: 0 },
      uOpacity: { value: 1 },
    }),
    // `tint` stands in for `tintColor` (memoized on it). The four scalar
    // uniform values are deliberately NOT dependencies: they are written live in
    // `useFrame` so a slider drag never rebuilds the uniform object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [texture, tint]
  )

  const active = shaders[effect]

  useFrame(({ clock }) => {
    // THE TWO CLOCKS DO NOT AGREE, and this is the one place it matters.
    // `WebGLImageTrail` stamps births with `performance.now()` because that is
    // what a DOM event handler has, while the renderer runs on a `THREE.Clock`
    // whose zero is whenever the `<Canvas>` mounted — a different, arbitrary
    // origin. Subtracting one from the other yields a large NEGATIVE age, and
    // `1 - negative / fadeDuration` clamps to full opacity, so every quad would
    // sit at 100% until React unmounted it and the documented fade would never
    // be visible. The quad therefore stamps its own birth on its first frame,
    // in the only time base it can actually see.
    if (bornAtRef.current === null) bornAtRef.current = clock.elapsedTime

    const age = Math.max(0, clock.elapsedTime - bornAtRef.current)
    const fade = Math.max(0, 1 - age / fadeDuration)

    const material = materialRef.current
    if (material) {
      // `distortionSpeed` is applied to the clock rather than being a uniform
      // of its own, which is what keeps the shader's uniform set to the eight
      // the props describe.
      material.uniforms.uTime.value = clock.elapsedTime * distortionSpeed
      material.uniforms.uOpacity.value = fade
      material.uniforms.uDistortionStrength.value = distortionStrength
      material.uniforms.uPixelSize.value = pixelSize
      material.uniforms.uWaveFrequency.value = waveFrequency
      material.uniforms.uWaveAmplitude.value = waveAmplitude
    }

    // Shrink while fading. Both channels move together, so the quad reads as
    // dissolving into the pointer rather than as a sticker blinking out.
    meshRef.current?.scale.setScalar(imageScale * fade)
  })

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[IMAGE_PLANE_WIDTH, IMAGE_PLANE_HEIGHT]} />
      {/*
        `key={effect}` IS LOAD-BEARING, not decoration. three.js only re-fetches
        a program when `material.version` changes, which only
        `material.needsUpdate = true` does — assigning a new `fragmentShader`
        string leaves `version` alone, so R3F would happily swap the prop and
        the renderer would keep drawing with the PREVIOUS effect's compiled
        program. Remounting the material on an effect change gives the new one a
        fresh version (and a fresh uniform cache, so the whole superset uploads
        again on its first frame). Switching back reuses the program three
        already compiled and cached, so this costs nothing after the first visit
        to each effect.
      */}
      <shaderMaterial
        key={effect}
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={active.vertex}
        fragmentShader={active.fragment}
        transparent
        // Trail items are coplanar, so depth writes would hand the whole frame
        // to whichever quad drew first. Blending in spawn order (oldest first)
        // is what puts the head of the comet on top.
        depthWrite={false}
      />
    </mesh>
  )
}
