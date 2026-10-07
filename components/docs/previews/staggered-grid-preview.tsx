import { PreviewStage } from "./preview-stage";

/**
 * Stand-in for `StaggeredGrid`.
 *
 * The real component is a `whileInView` container that hands its variant down to
 * `StaggeredItem` through context, and `whileInView` never fires inside a box
 * that mounts on hover and is already fully in view. This is the same fade-up +
 * `staggerChildren` read, expressed as one keyframe with a per-cell `--d` ramp.
 * Delays are literal classes for the same reason as in
 * `CinematicTextPreview`: Tailwind only emits CSS it can see in the source.
 */
const CELLS = [
  "[--d:0ms]",
  "[--d:70ms]",
  "[--d:140ms]",
  "[--d:210ms]",
  "[--d:280ms]",
  "[--d:350ms]",
];

export function StaggeredGridPreview() {
  return (
    <PreviewStage>
      <span className="grid w-40 grid-cols-3 gap-1.5">
        {CELLS.map((delay, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={`animate-preview-stagger h-10 rounded-md border border-dead-800 bg-dead-900 ${delay} [will-change:transform,opacity]`}
          />
        ))}
      </span>
    </PreviewStage>
  );
}