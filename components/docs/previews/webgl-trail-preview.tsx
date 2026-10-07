import { PreviewStage } from "./preview-stage";

/**
 * Stand-in for `WebGLImageTrail` (Pro).
 *
 * The real component is an R3F `<Canvas>` running one of four GLSL effects. It
 * is the single most expensive thing in the registry, and mounting a WebGL
 * context because someone hovered a sidebar link — on every hover, with no
 * eviction — is precisely the cost the lightweight-preview rule exists to avoid.
 * This stands in for the *liquid* effect only: one tile scaling and skewing
 * through a hue rotation, which is the shape of the distortion the shader
 * applies, with no context, no GPU allocation and no shader compile.
 */
export function WebGLTrailPreview() {
  return (
    <PreviewStage>
      <span className="relative block h-28 w-44 overflow-hidden rounded-xl border border-dead-800 bg-dead-900">
        <span
          aria-hidden="true"
          className="animate-preview-liquid absolute inset-3 rounded-lg [background-image:conic-gradient(from_180deg_at_center,var(--color-dead-red),var(--color-dead-800),var(--color-dead-400),var(--color-dead-red))] [will-change:transform,filter]"
        />
        <span className="absolute inset-x-0 bottom-2 text-center font-mono text-[9px] uppercase tracking-widest text-dead-600">
          webgl liquid
        </span>
      </span>
    </PreviewStage>
  );
}