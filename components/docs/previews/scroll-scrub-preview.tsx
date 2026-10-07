import { PreviewStage } from "./preview-stage";

/**
 * Stand-in for `ScrollScrub`.
 *
 * The real component is a pinned GSAP ScrollTrigger that paints one of an image
 * sequence to a canvas as the page scrolls; a hover preview has no scroll, and
 * standing up a canvas plus a trigger per hover would be exactly the cost the
 * preview box exists to avoid.
 *
 * The gradient is VERTICAL and the motion is HORIZONTAL on purpose: that is the
 * component's signature — one frame panning past the viewport — so the panning is
 * carried by `translate3d` alone. A diagonal or animated gradient would have
 * moved on its own and the pan would no longer be legible as a scrub. The
 * progress bar runs the same duration off the same clock, which is what ties the
 * two together.
 */
export function ScrollScrubPreview() {
  return (
    <PreviewStage className="flex-col gap-3">
      <span className="relative block h-24 w-full overflow-hidden rounded-lg border border-dead-800 bg-dead-900">
        <span
          aria-hidden="true"
          className="animate-preview-scrub absolute inset-0 [will-change:transform] [background-image:linear-gradient(180deg,var(--color-dead-700)_0%,var(--color-dead-red)_55%,var(--color-dead-800)_100%)]"
        />
        <span
          aria-hidden="true"
          className="absolute inset-x-2 bottom-2 h-1 overflow-hidden rounded-full bg-dead-800"
        >
          <span className="animate-preview-scrub-bar block h-full w-full bg-dead-red [will-change:transform]" />
        </span>
      </span>
      <span className="font-mono text-[9px] uppercase tracking-widest text-dead-600">
        scrub
      </span>
    </PreviewStage>
  );
}