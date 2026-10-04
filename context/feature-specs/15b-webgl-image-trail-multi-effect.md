# Feature 15b: WebGL Image Trail Multi-Effect Upgrade (Pro)

## Overview

Upgrade the existing `WebGLImageTrail` (Pro) component to support multiple distinct WebGL shader effects via a single `effect` prop. Instead of maintaining separate components for each visual style, the component will dynamically inject the correct GLSL shader code based on the selected effect. It will also introduce a `tintColor` prop to allow users to color-grade the trail.

## Goals

1. Support 4 distinct visual effects: `'liquid'`, `'distortion'`, `'pixelate'`, and `'wave'`.
2. Implement a "Superset Props" architecture for uniforms: expose all possible shader parameters in the main props interface. The active shader will simply use the uniforms it needs, providing a clean, predictable API for developers.
3. Add a `tintColor` prop that tints the final output of the fragment shader.
4. Update the test page to include a dropdown for selecting the effect and dynamic sliders for the relevant uniforms, proving the component is fully configurable.

## Technical Specifications

### Directory Structure Updates

```
registry/
└── webgl-image-trail/
    ├── webgl-image-trail.tsx   # Main React wrapper (updated props)
    ├── shaders.ts              # NEW: Dictionary of GLSL shader strings
    ├── image-plane.tsx         # Updated to accept and pass new uniforms
    └── index.ts                # Barrel export
```

### Updated Component Props Interface

Add the following to the existing props in `webgl-image-trail.tsx`:

```typescript
export type TrailEffect = 'liquid' | 'distortion' | 'pixelate' | 'wave'

export interface WebGLImageTrailProps 
  extends React.HTMLAttributes<HTMLDivElement> {
  images: string[]
  effect?: TrailEffect           // Default: 'liquid'
  
  // Superset Uniform Props (Shaders use what they need)
  distortionStrength?: number    // Default: 0.5 (Used by: liquid, distortion)
  pixelSize?: number             // Default: 0.02 (Used by: pixelate)
  waveFrequency?: number         // Default: 10.0 (Used by: wave)
  waveAmplitude?: number         // Default: 0.1 (Used by: wave)
  tintColor?: string             // Hex color to tint the trail. Default: '#ffffff'
  
  // Existing props
  trailSize?: number             // Default: 8
  fadeDuration?: number          // Default: 1.2
  imageScale?: number            // Default: 0.4
  velocityThreshold?: number     // Default: 0.1
}
```

### Shader Architecture (`shaders.ts`)

Create a new file that exports a dictionary of shader configurations. Each configuration contains `vertex` and `fragment` GLSL strings. 

*Note: All shaders must accept the base uniforms: `uTexture`, `uTime`, `uOpacity`, and `uTintColor` (vec3). They will optionally use the specific effect uniforms.*

```typescript
// registry/webgl-image-trail/shaders.ts

export const shaders = {
  liquid: {
    vertex: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragment: `
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform float uOpacity;
      uniform float uDistortionStrength;
      uniform vec3 uTintColor;
      varying vec2 vUv;

      void main() {
        vec2 distortedUv = vUv + vec2(
          sin(vUv.y * 10.0 + uTime) * uDistortionStrength * 0.1,
          cos(vUv.x * 10.0 + uTime) * uDistortionStrength * 0.1
        );
        vec4 color = texture2D(uTexture, distortedUv);
        // Apply tint
        color.rgb = mix(color.rgb, uTintColor, 0.3);
        gl_FragColor = vec4(color.rgb, color.a * uOpacity);
      }
    `
  },
  distortion: {
    vertex: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragment: `
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform float uOpacity;
      uniform float uDistortionStrength;
      uniform vec3 uTintColor;
      varying vec2 vUv;

      void main() {
        float dist = distance(vUv, vec2(0.5));
        vec2 distortedUv = vUv + (vUv - 0.5) * dist * uDistortionStrength;
        vec4 color = texture2D(uTexture, distortedUv);
        color.rgb = mix(color.rgb, uTintColor, 0.3);
        gl_FragColor = vec4(color.rgb, color.a * uOpacity);
      }
    `
  },
  pixelate: {
    vertex: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragment: `
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform float uOpacity;
      uniform float uPixelSize;
      uniform vec3 uTintColor;
      varying vec2 vUv;

      void main() {
        float d = 1.0 / uPixelSize;
        vec2 pixelatedUv = floor(vUv * d) / d;
        vec4 color = texture2D(uTexture, pixelatedUv);
        color.rgb = mix(color.rgb, uTintColor, 0.3);
        gl_FragColor = vec4(color.rgb, color.a * uOpacity);
      }
    `
  },
  wave: {
    vertex: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragment: `
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform float uOpacity;
      uniform float uWaveFrequency;
      uniform float uWaveAmplitude;
      uniform vec3 uTintColor;
      varying vec2 vUv;

      void main() {
        vec2 waveUv = vUv + vec2(0.0, sin(vUv.x * uWaveFrequency + uTime) * uWaveAmplitude);
        vec4 color = texture2D(uTexture, waveUv);
        color.rgb = mix(color.rgb, uTintColor, 0.3);
        gl_FragColor = vec4(color.rgb, color.a * uOpacity);
      }
    `
  }
}
```

### Implementation Logic Updates

1. **`image-plane.tsx`**: Update the `<shaderMaterial>` to read the `effect` prop and pull the correct shader strings from `shaders.ts`. Pass **all** uniform props to the material. Three.js will safely ignore uniforms that the active fragment shader does not declare.
   ```typescript
   uniforms={{
     uTexture: { value: texture },
     uTime: { value: time },
     uOpacity: { value: opacity },
     uDistortionStrength: { value: distortionStrength },
     uPixelSize: { value: pixelSize },
     uWaveFrequency: { value: waveFrequency },
     uWaveAmplitude: { value: waveAmplitude },
     uTintColor: { value: new THREE.Color(tintColor) }
   }}
   ```
2. **`webgl-image-trail.tsx`**: Add the new props to the interface with their default values. Pass them down to `<ImagePlane />`.
3. **Test Page (`app/test-webgl-trail/page.tsx`)**: 
   - Add a `<Select>` dropdown to switch between `'liquid'`, `'distortion'`, `'pixelate'`, and `'wave'`.
   - Add conditional sliders: Show `distortionStrength` slider only if effect is 'liquid' or 'distortion'. Show `pixelSize` only if 'pixelate', etc.
   - Add a color picker input for `tintColor`.

## Implementation Steps

1. Create `registry/webgl-image-trail/shaders.ts` with the 4 shader configurations.
2. Update `registry/webgl-image-trail/webgl-image-trail.tsx` to include the new props and pass them down.
3. Update `registry/webgl-image-trail/image-plane.tsx` to import `shaders`, select the active shader, and pass the superset of uniforms to the material.
4. Update `app/test-webgl-trail/page.tsx` to include the effect selector, conditional uniform sliders, and color picker.
5. Verify build: `npm run build`.
6. Verify visually: `npm run dev`, navigate to `/test-webgl-trail`, switch effects, and adjust sliders to confirm real-time reactivity.
7. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] Component renders without SSR errors.
- [ ] Switching the `effect` prop instantly changes the visual shader output.
- [ ] The `tintColor` prop successfully tints the images.
- [ ] Adjusting `pixelSize`, `distortionStrength`, or `wave` props updates the shader in real-time.
- [ ] No Three.js warnings about unused uniforms (Three.js handles this gracefully, but ensure no TS errors).
- [ ] No memory leaks (textures dispose correctly on unmount).
- [ ] `npm run build` passes with zero TypeScript errors.
- [ ] `progress-tracker.md` is updated.

## Constraints

- **Superset Props**: Do not create complex conditional logic to filter uniforms before passing them to Three.js. Pass them all; the GLSL compiler ignores unused uniforms. This keeps the React code clean and predictable.
- **SSR Safety**: Maintain the `next/dynamic` wrapper with `ssr: false` in the test page.
- **Performance**: Continue to use `useTexture` from `@react-three/drei` or a single `THREE.TextureLoader` instance to avoid reloading textures on every frame.

## Files to Create/Update

1. `registry/webgl-image-trail/shaders.ts` (New)
2. `registry/webgl-image-trail/webgl-image-trail.tsx` (Update)
3. `registry/webgl-image-trail/image-plane.tsx` (Update)
4. `app/test-webgl-trail/page.tsx` (Update)
5. `context/progress-tracker.md` (Update)