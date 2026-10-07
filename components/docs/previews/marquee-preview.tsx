import { Marquee } from "@/registry/marquee";

import { PreviewStage } from "./preview-stage";

/**
 * The REAL `Marquee`, not a stand-in.
 *
 * An infinite blur marquee is a CSS transform loop by definition, so it is the
 * one effect in this set that needs no stand-in at all. `speed` drops from 30s to
 * 6s and `repeat` from 4 to 3 purely so a full cycle is visible while the pointer
 * is parked on a sidebar link.
 */
export function MarqueePreview() {
  return (
    <PreviewStage>
      <Marquee className="w-[260px]" speed={6} repeat={3} gap={12} blur="edges">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-dead-400">
          dead simple
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-dead-red">
          dead smooth
        </span>
      </Marquee>
    </PreviewStage>
  );
}