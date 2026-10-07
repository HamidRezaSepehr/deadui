import { GradientBorder } from "@/registry/gradient-border";

import { PreviewStage } from "./preview-stage";

/**
 * The REAL `GradientBorder`, not a stand-in.
 *
 * The `rotating` variant is a conic gradient on a `transform: rotate()` layer
 * sized to the card's diagonal by a `ResizeObserver` — no ScrollTrigger, no
 * pointer. It is already auto-playing, so a stand-in could only be less
 * accurate. `width` goes to 2px so the ring survives at card size, and `speed`
 * to 3s so the sweep is legible at a glance.
 *
 * Note the component's inner content layer is hard-coded to `bg-dead-950`, so
 * this card's face stays near-black in light mode. That is the component's own
 * decision and is out of scope here.
 */
export function GradientBorderPreview() {
  return (
    <PreviewStage>
      <GradientBorder width={2} speed={3} className="h-28 w-44">
        <span className="flex h-full w-full items-center justify-center font-mono text-[10px] uppercase tracking-widest text-dead-400">
          glowing
        </span>
      </GradientBorder>
    </PreviewStage>
  );
}