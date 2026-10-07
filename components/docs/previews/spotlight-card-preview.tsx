import { PreviewStage } from "./preview-stage";

/**
 * Stand-in for `SpotlightCard`.
 *
 * The real component writes `--mouse-x` / `--mouse-y` from a `mousemove` handler,
 * so it is dark by definition until a pointer arrives — and again the pointer is
 * on the sidebar link, not in here. The keyframe animates the radial gradient's
 * `background-position` instead, which is the same property the component
 * re-points on mouse move, so the sweep is driven by the same mechanism the
 * component uses rather than by a differently-shaped imitation of it.
 */
export function SpotlightCardPreview() {
  return (
    <PreviewStage>
      <span className="relative block h-28 w-44 overflow-hidden rounded-xl border border-dead-800 bg-dead-900">
        <span
          aria-hidden="true"
          className="animate-preview-spotlight absolute inset-0 [will-change:background-position] [background-image:radial-gradient(circle_at_center,rgba(220,38,38,0.55)_0%,transparent_65%)] [background-size:180%_180%]"
        />
        <span className="absolute inset-x-0 bottom-3 text-center font-mono text-[10px] uppercase tracking-widest text-dead-400">
          spotlight
        </span>
      </span>
    </PreviewStage>
  );
}