import { RainbowButton } from "@/registry/rainbow-button";

import { PreviewStage } from "./preview-stage";

/**
 * The REAL `RainbowButton`, not a stand-in.
 *
 * The `default` variant is a CSS `@keyframes rainbow` loop over a moving
 * background position — no ScrollTrigger, no pointer, no JS — so it is already
 * auto-playing, costs one composited layer, and shows the genuine border ring and
 * halo rather than an impression of them. Only `speed` is tightened: the 2s
 * default reads as frantic at preview size.
 */
export function RainbowButtonPreview() {
  return (
    <PreviewStage>
      <RainbowButton variant="default" size="sm" speed={3}>
        Hover me
      </RainbowButton>
    </PreviewStage>
  );
}