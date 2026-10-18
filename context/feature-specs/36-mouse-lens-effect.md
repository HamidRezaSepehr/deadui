# Feature 36: Mouse-Following Square Lens Effect (Pro Component)

## Overview

Add a new premium Pro component, `MouseLensEffect`, which replicates the advanced WebGL effect from Codrops. It displays two images (e.g., a grayscale "outside" image and a vibrant "inside" image) and reveals the inside image through a square lens that follows the mouse cursor, complete with localized barrel distortion and radial RGB chromatic aberration.

## Goals

1. Create `registry/pro/mouse-lens-effect/mouse-lens-effect.tsx` using `@react-three/fiber` and a custom GLSL shader material.
2. Implement the exact shader logic: a square mask based on mouse position, `getCCLensUv` distortion, and RGB channel shifting.
3. Provide highly configurable props: `srcOutside`, `srcInside`, `squareSize`, `lensDistortion`, `rgbShiftIntensity`, and `mouseEasing` (for smooth, delayed mouse following).
4. Update `registry.json` to list `three`, `@react-three/fiber`, and `@react-three/drei` as required dependencies for this Pro component.
5. Create a comprehensive test page `app/test-mouse-lens-effect/page.tsx`.
6. Create the MDX documentation page `app/docs/components/mouse-lens-effect/page.mdx`.
7. Execute the 4-step Release Workflow for `v0.1.13` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/pro/mouse-lens-effect/mouse-lens-effect.tsx`)
```tsx
'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { cn } from '@/lib/utils'

// --- Custom Shader Material ---
const LensMaterial = {
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
  `
}

// --- Inner Scene Component ---
function Scene({ srcOutside, srcInside, squareSize, lensDistortion, rgbShiftIntensity, mouseEasing }: any) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()
  
  const [texture1, texture2] = useTexture([srcInside, srcOutside])
  
  // Smooth mouse following
  const targetMouse = useRef(new THREE.Vector2(0, 0))
  const currentMouse = useRef(new THREE.Vector2(0, 0))

  useFrame((state, delta) => {
    if (!materialRef.current) return
    
    // Update target mouse position (normalized -1 to 1)
    targetMouse.current.x = (state.pointer.x)
    targetMouse.current.y = (state.pointer.y)
    
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
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        args={[LensMaterial]}
        transparent={true}
      />
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
    <div className={cn('relative w-full h-[500px] overflow-hidden bg-black', className)} {...props}>
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
```

### 2. Registry Update (`registry.json`)
Add the Pro component entry, ensuring it lists the 3D dependencies:
```json
{
  "name": "mouse-lens-effect",
  "title": "Mouse Lens Effect",
  "description": "A premium WebGL mouse-following square lens with distortion and RGB shift.",
  "tier": "pro",
  "dependencies": ["three", "@react-three/fiber", "@react-three/drei"],
  "files": [
    {
      "path": "registry/pro/mouse-lens-effect/mouse-lens-effect.tsx",
      "target": "components/ui/mouse-lens-effect.tsx"
    }
  ]
}
```

### 3. Test Page (`app/test-mouse-lens-effect/page.tsx`)
Create a page demonstrating:
1. **Default**: A grayscale rose outside, vibrant color inside, with default settings.
2. **High Distortion**: Increased `lensDistortion` and `rgbShiftIntensity` for a dramatic, glitchy lens effect.
3. **Fast Easing**: Lower `mouseEasing` value for a snappier, more responsive cursor follow.

### 4. Documentation (`app/docs/components/mouse-lens-effect/page.mdx`)
- Clearly mark this as a **Pro Component** requiring a license.
- Explain the required dependencies (`npm install three @react-three/fiber @react-three/drei`).
- Detail the props (`srcOutside`, `srcInside`, `squareSize`, `lensDistortion`, `rgbShiftIntensity`, `mouseEasing`).
- Provide a clear, copy-pasteable code snippet.

### 5. The 4-Step Release Workflow & Manual Publish
Execute the git workflow for `v0.1.13`, and **CRITICALLY**, provide the manual npm publish commands at the end of your response.

## Implementation Steps

1. Create `registry/pro/mouse-lens-effect/mouse-lens-effect.tsx`.
2. Update `registry.json` to include the new Pro component and its dependencies.
3. Create `app/test-mouse-lens-effect/page.tsx`.
4. Create `app/docs/components/mouse-lens-effect/page.mdx`.
5. Bump `packages/cli/package.json` version to `0.1.13`.
6. Execute git commands: `add`, `commit`, `push`, `tag v0.1.13`, `push tag`.
7. Output GitHub Release UI instructions.
8. **Output the exact manual terminal commands to publish to npm.**
9. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] `MouseLensEffect` renders without WebGL errors.
- [ ] The square mask accurately follows the mouse with smooth easing.
- [ ] Lens distortion and RGB shift are clearly visible and adjustable via props.
- [ ] CLI correctly identifies this as a `pro` component and prompts for license + dependencies.
- [ ] Test page displays variations clearly.
- [ ] Git tag `v0.1.13` is pushed.
- [ ] Manual npm publish instructions are clearly provided at the end.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `registry/pro/mouse-lens-effect/mouse-lens-effect.tsx` (New)
2. `registry.json` (Update)
3. `app/test-mouse-lens-effect/page.tsx` (New)
4. `app/docs/components/mouse-lens-effect/page.mdx` (New)
5. `packages/cli/package.json` (Update version to 0.1.13)
6. `context/progress-tracker.md` (Update)