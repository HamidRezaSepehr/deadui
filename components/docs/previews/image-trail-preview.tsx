import { PreviewStage } from "./preview-stage";

/**
 * Stand-in for `ImageTrail`.
 *
 * The real component spawns `motion` elements from `onPointerMove` and measures
 * pointer velocity to scale the trail size — it is an interaction, so there is
 * nothing to look at before the pointer arrives. This runs the trail the other
 * way round: a fixed cursor at the origin and three copies chasing it along the
 * same path the component's velocity term would lengthen, each on a phase offset
 * so the loop reads as a trail rather than three independent blobs.
 */
const TRAIL_ITEMS = [
  { delay: "[--d:0ms]", size: "size-14", tone: "opacity-80" },
  { delay: "[--d:160ms]", size: "size-12", tone: "opacity-60" },
  { delay: "[--d:320ms]", size: "size-10", tone: "opacity-40" },
];

export function ImageTrailPreview() {
  return (
    <PreviewStage>
      <span className="relative block h-28 w-44 overflow-hidden rounded-xl border border-dead-800 bg-dead-900">
        {TRAIL_ITEMS.map(({ delay, size, tone }, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={`animate-preview-trail absolute bottom-5 left-4 ${size} ${tone} ${delay} rounded-md border border-dead-700 [background-image:linear-gradient(135deg,var(--color-dead-800),var(--color-dead-red))] [will-change:transform,opacity]`}
          />
        ))}
        <span
          aria-hidden="true"
          className="absolute bottom-4 left-3 size-3 rounded-full bg-dead-50"
        />
      </span>
    </PreviewStage>
  );
}