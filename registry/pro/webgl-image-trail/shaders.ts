// 🔒 PRO COMPONENT - Commercial License Required
// This component requires a valid Dead UI Pro license.
// Purchase at: https://deadui.dev/pro

/**
 * GLSL for the WebGL Image Trail, one entry per `effect`.
 *
 * SUPERSET UNIFORMS. Every fragment shader here is handed the SAME uniform
 * object from `image-plane.tsx` — all eight entries, always. The React side
 * never filters them: GLSL compiles away any uniform a shader does not read
 * (`distortion` never touches `uPixelSize`, `pixelate` never touches `uTime`),
 * and three.js then simply never looks the name up in the linked program. The
 * cost of an unused uniform is zero and the API stays flat and predictable —
 * a caller can set `pixelSize` before switching to `pixelate` and it is
 * already right.
 *
 * COLOUR SPACE. The material is a raw `THREE.ShaderMaterial`, so three does
 * NOT inject anything a built-in material would. A built-in material finishes
 * with `#include <colorspace_fragment>`, which encodes three's linear working
 * space back to the renderer's output space; without it every photo comes out
 * visibly too dark, and a tint mixed in linear space would be far darker than
 * the hex that was asked for. `linearToOutputTexel()` is exactly what that
 * chunk expands to, and three already declares it in the prefix it prepends to
 * every non-raw `ShaderMaterial` — so it must be CALLED here, never
 * re-included (re-including `colorspace_pars_fragment` redeclares all three
 * transfer functions and the program fails to link).
 *
 * GLSL VERSION. GLSL ES 1.00 (`varying` / `texture2D` / `gl_FragColor`),
 * which is what three compiles by default. On a WebGL2 context three
 * transparently aliases `gl_FragColor` to an `out` variable and `texture2D`
 * to `texture`, so there is nothing to switch on.
 */

export type TrailEffect = 'liquid' | 'distortion' | 'pixelate' | 'wave'

export interface TrailShader {
  vertex: string
  fragment: string
}

const VERTEX = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

/**
 * The tint is a `mix()` at a fixed 30%, so `tintColor` GRADES the photo rather
 * than replacing it. Note what that means, because the default is `#ffffff`:
 *
 *   mix(c, white, 0.3) === c * 0.7 + 0.3
 *
 * so white is the BRIGHTEST grade, not a neutral one. `uTintColor` is uploaded
 * as a `THREE.Color`, which with three's colour management on already holds
 * LINEAR values, so the mix happens in the same space the texture sample is in
 * and every opaque pixel is lifted by a flat 0.3 of linear light. Two visible
 * consequences, both inherent to a fixed-factor mix toward a constant and
 * neither fixable without changing the factor:
 *
 *   - Nothing opaque can render darker than linear 0.3, i.e. sRGB 149. A
 *     near-black photo comes back as a pale card.
 *   - Every pixel moves toward the tint by the same amount, so contrast
 *     compresses. A full-strength white grade is a soft haze.
 *
 * The mix is applied BEFORE the OETF below, which is why the lift is as large
 * as it is: doing it after the encode would lift by 0.3 of the *perceptual*
 * range instead, and a tint would read far more subtly. Darken `tintColor`
 * toward your surface colour to bring the trail back down.
 */
const TINT = /* glsl */ `
  // Apply tint
  color.rgb = mix(color.rgb, uTintColor, 0.3);
`

export const shaders: Record<TrailEffect, TrailShader> = {
  liquid: {
    vertex: VERTEX,
    fragment: /* glsl */ `
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform float uOpacity;
      uniform float uDistortionStrength;
      uniform vec3 uTintColor;
      varying vec2 vUv;

      void main() {
        // Two orthogonal travelling waves, one per axis. Because the phases are
        // driven by the OTHER axis, the offset is a rotation field rather than
        // a uniform push: the top of the plane and the bottom shear in opposite
        // directions, which is what reads as liquid rather than as a slide.
        vec2 distortedUv = vUv + vec2(
          sin(vUv.y * 10.0 + uTime) * uDistortionStrength * 0.1,
          cos(vUv.x * 10.0 + uTime) * uDistortionStrength * 0.1
        );
        vec4 color = texture2D(uTexture, distortedUv);
${TINT}
        gl_FragColor = vec4(color.rgb, color.a * uOpacity);
        gl_FragColor = linearToOutputTexel(gl_FragColor);
      }
    `,
  },

  distortion: {
    vertex: VERTEX,
    fragment: /* glsl */ `
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform float uOpacity;
      uniform float uDistortionStrength;
      uniform vec3 uTintColor;
      varying vec2 vUv;

      void main() {
        // A radial push away from (or toward) the centre. Declares uTime and
        // never uses it: the field is static, only the opacity animates.
        float dist = distance(vUv, vec2(0.5));
        vec2 distortedUv = vUv + (vUv - 0.5) * dist * uDistortionStrength;
        vec4 color = texture2D(uTexture, distortedUv);
${TINT}
        gl_FragColor = vec4(color.rgb, color.a * uOpacity);
        gl_FragColor = linearToOutputTexel(gl_FragColor);
      }
    `,
  },

  pixelate: {
    vertex: VERTEX,
    fragment: /* glsl */ `
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform float uOpacity;
      uniform float uPixelSize;
      uniform vec3 uTintColor;
      varying vec2 vUv;

      void main() {
        // Snap the sample coordinate to a lattice. uTime is declared and never
        // used: a quantised grid has nothing to animate.
        float d = 1.0 / uPixelSize;
        vec2 pixelatedUv = floor(vUv * d) / d;
        vec4 color = texture2D(uTexture, pixelatedUv);
${TINT}
        gl_FragColor = vec4(color.rgb, color.a * uOpacity);
        gl_FragColor = linearToOutputTexel(gl_FragColor);
      }
    `,
  },

  wave: {
    vertex: VERTEX,
    fragment: /* glsl */ `
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform float uOpacity;
      uniform float uWaveFrequency;
      uniform float uWaveAmplitude;
      uniform vec3 uTintColor;
      varying vec2 vUv;

      void main() {
        // A single horizontal travelling wave: every column of the photo is
        // displaced vertically by the same phase, so vertical features stay
        // vertical and the whole image ripples.
        vec2 waveUv = vUv + vec2(0.0, sin(vUv.x * uWaveFrequency + uTime) * uWaveAmplitude);
        vec4 color = texture2D(uTexture, waveUv);
${TINT}
        gl_FragColor = vec4(color.rgb, color.a * uOpacity);
        gl_FragColor = linearToOutputTexel(gl_FragColor);
      }
    `,
  },
}

/** Every effect, in the order the test page's dropdown presents them. */
export const TRAIL_EFFECTS = Object.keys(shaders) as TrailEffect[]
