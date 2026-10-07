import { PreviewStage } from "./preview-stage";

/**
 * Stand-in for `TextFillAnimation` (Pro).
 *
 * The real component fills text along the scroll axis, so — as with
 * `CinematicTextPreview` — its defining behaviour is a function of scroll
 * position and cannot run inside a box that does not scroll. What is left is the
 * visual signature: a dimmed base colour with a bright band sweeping through the
 * glyphs. `background-clip: text` needs the colour in `background-image`, so the
 * whole thing is one element with the gradient as its background and the delay
 * supplied per line.
 */
const LINES = [
  { label: "FILL", delay: "[--d:0ms]" },
  { label: "WITH", delay: "[--d:220ms]" },
  { label: "DEAD", delay: "[--d:440ms]" },
];

export function TextFillPreview() {
  return (
    <PreviewStage className="flex-col gap-1">
      {LINES.map(({ label, delay }) => (
        <span
          key={label}
          aria-hidden="true"
          className={`animate-preview-fill select-none bg-clip-text font-mono text-xl font-bold tracking-tight text-transparent ${delay} [background-image:linear-gradient(90deg,var(--color-dead-600)_0%,var(--color-dead-600)_38%,var(--color-dead-50)_50%,var(--color-dead-600)_62%,var(--color-dead-600)_100%)] [background-size:220%_100%] [background-position:160%_0] [will-change:background-position]`}
        >
          {label}
        </span>
      ))}
    </PreviewStage>
  );
}