import { PreviewStage } from "./preview-stage";

/**
 * Stand-in for `CinematicText`.
 *
 * The real component splits the string with GSAP's `SplitText` and reveals it
 * from a `ScrollTrigger`, and neither is available in a hover preview: the box
 * has no scroll of its own, so a trigger registered inside it would either never
 * fire or fight the docs page's scroll position. This reproduces what the
 * component *looks* like — a per-character blur-and-lift reveal on a dimmed
 * baseline — as a looping CSS keyframe, with the per-character stagger carried by
 * `--d` (set through Tailwind's arbitrary-property syntax, which keeps it out of
 * an inline `style`) instead of a GSAP timeline.
 *
 * The delay classes are literal on purpose: Tailwind extracts them by scanning
 * source text, so a value interpolated at runtime would produce no CSS at all.
 */
const LETTERS = [
  { letter: "D", delay: "[--d:0ms]" },
  { letter: "E", delay: "[--d:110ms]" },
  { letter: "A", delay: "[--d:220ms]" },
  { letter: "D", delay: "[--d:330ms]" },
];

export function CinematicTextPreview() {
  return (
    <PreviewStage>
      <span
        aria-hidden="true"
        className="flex select-none font-mono text-2xl font-bold tracking-tight text-dead-600"
      >
        {LETTERS.map(({ letter, delay }, index) => (
          <span
            key={`${letter}-${index}`}
            className={`animate-preview-reveal inline-block text-dead-50 ${delay}`}
          >
            {letter}
          </span>
        ))}
      </span>
    </PreviewStage>
  );
}