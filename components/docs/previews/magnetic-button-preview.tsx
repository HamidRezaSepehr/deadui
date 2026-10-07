import { PreviewStage } from "./preview-stage";

/**
 * Stand-in for `MagneticButton`.
 *
 * The real component pulls toward the pointer via `onMouseMove` on the button,
 * and in a hover preview the pointer is over the *sidebar link*, not over the
 * preview box — so the live component would sit perfectly still and advertise
 * nothing. Rather than synthesise pointer events into a component that cannot
 * know they are fake, this drives the same pull on a loop: the pill drifts off
 * its resting centre and springs back, with a dashed ring marking the origin the
 * way the pull reads on a real one.
 */
export function MagneticButtonPreview() {
  return (
    <PreviewStage>
      <span className="relative grid h-16 w-28 place-items-center">
        <span
          aria-hidden="true"
          className="absolute inset-1 rounded-full border border-dashed border-dead-700"
        />
        <span
          aria-hidden="true"
          className="animate-preview-magnet relative inline-flex h-10 items-center rounded-full bg-dead-50 px-5 font-mono text-xs font-semibold text-dead-950 [will-change:transform]"
        >
          Pull
        </span>
      </span>
    </PreviewStage>
  );
}