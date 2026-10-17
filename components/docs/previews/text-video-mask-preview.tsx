import { TextVideoMask } from "@/registry/text-video-mask";

import { PreviewStage } from "./preview-stage";

/**
 * The REAL `TextVideoMask`, not a stand-in.
 *
 * A video clipped by an SVG mask has no scroll dependency, no pointer
 * dependency and no WebGL context — it is a `<video autoPlay muted loop>` behind
 * a CSS `mask`, so it is already auto-playing the moment it mounts. The other
 * real-component previews (`rainbow-button`, `marquee`, `gradient-border`) are
 * chosen the same way.
 *
 * The small MDN CC0 clip is used rather than a full-size demo file: a hover
 * preview should not stream a multi-megabyte asset just to be glimpsed.
 */
export function TextVideoMaskPreview() {
  return (
    <PreviewStage>
      <TextVideoMask
        videoSrc="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
        className="h-full w-full"
        textClassName="font-mono text-4xl font-black uppercase tracking-tight"
      >
        DEAD
      </TextVideoMask>
    </PreviewStage>
  );
}
