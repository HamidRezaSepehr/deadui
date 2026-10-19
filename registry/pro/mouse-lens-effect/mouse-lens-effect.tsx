// 🔒 PRO COMPONENT - Commercial License Required
// This component requires a valid Dead UI Pro license.
// Purchase at: https://deadui.dev/pro

'use client'

import React, { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { cn } from '@/lib/utils'

// --- Custom Shader Material ---
export interface LensMaterialUniforms {
  u_texture1: THREE.IUniform<THREE.Texture | null>
  u_texture2: THREE.IUniform<THREE.Texture | null>
  u_mouse: THREE.IUniform<THREE.Vector2>
  u_squareSize: THREE.IUniform<number>
  u_lensDistortion: THREE.IUniform<number>
  u_rgbShift: THREE.IUniform<number>
  u_aspect: THREE.IUniform<number>
}

export const LensMaterial: THREE.ShaderMaterialParameters = {
  uniforms: {
    u_texture1: { value: null }, // Inside (Color)
    u_texture2: { value: null }, // Outside (Grayscale/BG)
    u_mouse: { value: new THREE.Vector2(0, 0) },
    u_squareSize: { value: 0.3 },
    u_lensDistortion: { value: 0.2 },
    u_rgbShift: { value: 0.015 },
    u_aspect: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D u_texture1;
    uniform sampler2D u_texture2;
    uniform vec2 u_mouse;
    uniform float u_squareSize;
    uniform float u_lensDistortion;
    uniform float u_rgbShift;
    uniform float u_aspect;
    varying vec2 vUv;

    // Simple cover UV mapping
    vec2 getCoverUv(vec2 uv, vec2 meshSize, vec2 texSize) {
      float meshAspect = meshSize.x / meshSize.y;
      float texAspect = texSize.x / texSize.y;
      vec2 scale = meshAspect > texAspect ? vec2(1.0, texAspect / meshAspect) : vec2(meshAspect / texAspect, 1.0);
      return (uv - 0.5) * scale + 0.5;
    }

    // Chromatic Aberration Lens Distortion
    vec2 getCCLensUv(vec2 uv, float distortion) {
      vec2 centered = uv - 0.5;
      float dist = length(centered);
      return uv + centered * dist * distortion;
    }

    void main() {
      // Normalize UV to -1 to 1, flip Y for GLSL coordinate system
      vec2 screenUv = vUv * 2.0 - 1.0;
      screenUv.y = -screenUv.y;

      // Mouse relative to screen
      vec2 mouseRel = screenUv - u_mouse;

      // Aspect ratio correction for the square mask
      vec2 aspectScale = vec2(min(1.0 / u_aspect, 1.0), min(u_aspect, 1.0));
      vec2 correctedMouseRel = mouseRel / aspectScale;

      // Square Mask Calculation
      float halfSize = u_squareSize;
      float mask = step(-halfSize, correctedMouseRel.x) * (1.0 - step(halfSize, correctedMouseRel.x)) *
                   step(-halfSize, correctedMouseRel.y) * (1.0 - step(halfSize, correctedMouseRel.y));

      // Inside UV (0 to 1 relative to the square)
      vec2 squareUv = (correctedMouseRel / (halfSize * 2.0)) + 0.5;

      // Apply lens distortion
      vec2 distortedUv = getCCLensUv(squareUv, u_lensDistortion);

      // RGB Shift based on distance from center of square
      vec2 shiftDir = (squareUv - 0.5) * 2.0;

      float r = texture2D(u_texture1, distortedUv + shiftDir * u_rgbShift).r;
      float g = texture2D(u_texture1, distortedUv).g;
      float b = texture2D(u_texture1, distortedUv - shiftDir * u_rgbShift).b;

      vec4 insideColor = vec4(r, g, b, 1.0);

      // Outside texture (using cover mapping)
      vec2 coverUv = getCoverUv(vUv, vec2(u_aspect, 1.0), vec2(u_aspect, 1.0)); // Simplified for demo
      vec4 outsideColor = texture2D(u_texture2, vUv);

      gl_FragColor = mix(outsideColor, insideColor, mask);
    }
  `,
}

// --- Inner Scene Component ---
export interface MouseLensEffectSceneProps {
  srcOutside: string
  srcInside: string
  squareSize?: number
  lensDistortion?: number
  rgbShiftIntensity?: number
  mouseEasing?: number
}

function Scene({
  srcOutside,
  srcInside,
  squareSize = 0.3,
  lensDistortion = 0.2,
  rgbShiftIntensity = 0.015,
  mouseEasing = 0.08,
}: MouseLensEffectSceneProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()

  const [texture1, texture2] = useTexture([srcInside, srcOutside])

  React.useEffect(() => {
    // The Unsplash demo images are non-power-of-two (e.g. 1200x1500), and
    // three's TextureLoader defaults leave `generateMipmaps: true` with a
    // `LinearMipmapLinearFilter` min filter. Generating mipmaps for NPOT
    // textures is what breaks the WebGL context on macOS's ANGLE/Metal GL
    // backend — three logs `THREE.WebGLRenderer: Context Lost.` right when
    // the texture reaches the GPU and the canvas goes permanently black,
    // which is the "flash of the image, then nothing" failure. Disabling
    // mipmaps removes the offending `generateMipmap` call; bilinear
    // filtering and clamped wrapping stay because this shader warps UVs.
    // `colorSpace` is deliberately left at the loader default (untouched):
    // this component renders with a raw ShaderMaterial, which does NOT
    // decode an SRGB-tagged texture on sample — tagging it would upload a
    // hardware-decoding SRGB8 texture and the image would render too dark.
    for (const texture of [texture1, texture2]) {
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
      texture.generateMipmaps = false
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.needsUpdate = true
    }
  }, [texture1, texture2])

  // Smooth mouse following
  const targetMouse = useRef(new THREE.Vector2(0, 0))
  const currentMouse = useRef(new THREE.Vector2(0, 0))

  useFrame((state) => {
    if (!materialRef.current) return

    // Update target mouse position (normalized -1 to 1)
    targetMouse.current.x = state.pointer.x
    targetMouse.current.y = state.pointer.y

    // Lerp for smooth easing
    currentMouse.current.lerp(targetMouse.current, mouseEasing)

    materialRef.current.uniforms.u_mouse.value = currentMouse.current
    materialRef.current.uniforms.u_aspect.value = size.width / size.height
  })

  // Update uniforms when props change
  React.useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_texture1.value = texture1
      materialRef.current.uniforms.u_texture2.value = texture2
      materialRef.current.uniforms.u_squareSize.value = squareSize
      materialRef.current.uniforms.u_lensDistortion.value = lensDistortion
      materialRef.current.uniforms.u_rgbShift.value = rgbShiftIntensity
    }
  }, [texture1, texture2, squareSize, lensDistortion, rgbShiftIntensity])

  return (
    <mesh scale={[
      size.width / size.height,
      1,
      1,
    ]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={materialRef} args={[LensMaterial]} transparent={true} />
    </mesh>
  )
}

// --- Main Component ---
export interface MouseLensEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  srcOutside: string
  srcInside: string
  squareSize?: number // 0.1 to 0.5
  lensDistortion?: number // 0.0 to 1.0
  rgbShiftIntensity?: number // 0.0 to 0.05
  mouseEasing?: number // 0.01 to 0.2 (lower = smoother/slower)
}

export function MouseLensEffect({
  srcOutside,
  srcInside,
  squareSize = 0.3,
  lensDistortion = 0.2,
  rgbShiftIntensity = 0.015,
  mouseEasing = 0.08,
  className,
  ...props
}: MouseLensEffectProps) {
  return (
    <div className={cn('relative w-full h-[500px] overflow-hidden bg-dead-950', className)} {...props}>
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Scene
          srcOutside={srcOutside}
          srcInside={srcInside}
          squareSize={squareSize}
          lensDistortion={lensDistortion}
          rgbShiftIntensity={rgbShiftIntensity}
          mouseEasing={mouseEasing}
        />
      </Canvas>
    </div>
  )
}
