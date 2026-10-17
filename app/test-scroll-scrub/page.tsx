import { ScrollScrub } from "@/registry/scroll-scrub";

// Local video file provided for testing and demos.
const DEFAULT_VIDEO = "/video-sequence.mp4";

function SectionLabel({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  return (
    <p className="mb-4 font-mono text-sm text-dead-400">
      <span className="text-dead-600">{index}.</span> {children}
    </p>
  );
}

export default function TestScrollScrubPage() {
  return (
    <div className="flex flex-col items-center bg-dead-950 text-dead-50">
      <header className="flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-dead-400">
          Feature 12 — Free Component
        </p>
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
          Scroll-Linked Media Scrub
        </h1>
        <p className="max-w-xl font-mono text-sm leading-relaxed text-dead-400">
          Scroll progress drives either an <span className="text-dead-200">image sequence</span>{" "}
          frame-by-frame or a <span className="text-dead-200">video timeline</span>. Frames
          are preloaded and painted to a canvas from a GSAP proxy object, so the
          loop never re-renders React.
        </p>
      </header>

      <div className="w-full max-w-4xl px-8">
        <section>
          <SectionLabel index={1}>
            DEFAULT IMAGE SEQUENCE —  113 local frames from{" "}
            <span className="text-dead-200">image-sequence/</span>,{" "}
            <span className="text-dead-200">pin</span> on, ~200vh of scrub. The
            stage stays put while the frames change underneath it.
          </SectionLabel>
          <ScrollScrub id="ss-default-images" className="pt-24" scrub={2} />
        </section>

        <section>
          <SectionLabel index={2}>
            DEFAULT VIDEO SCRUB — <span className="text-dead-200">videoSrc</span>{" "}
            switches the component to timeline scrubbing. The ScrollTrigger is
            only created once{" "}
            <span className="text-dead-200">loadedmetadata</span> resolves, so{" "}
            <span className="text-dead-200">duration</span> is never NaN. Scroll
            fast — the first frames are handled, not dropped.
          </SectionLabel>
          <ScrollScrub
            id="ss-default-video"
            videoSrc={DEFAULT_VIDEO}
            scrub={2}
            className="pt-24"
          />
        </section>

        <footer className="w-full py-24 text-center">
          <p className="font-mono text-sm leading-relaxed text-dead-400">
            Image mode decodes every frame up front, keeps them in a ref array
            in source order, and paints with{" "}
            <span className="text-dead-200">drawImage</span> from a GSAP proxy
            — no decode on the frame swap, so rapid scrolling never flickers.
            Video mode tweens <span className="text-dead-200">currentTime</span>{" "}
            from 0 to <span className="text-dead-200">duration</span>, but only
            after the metadata gate opens. Under{" "}
            <span className="text-dead-200">prefers-reduced-motion</span> both
            modes drop the pin and jump straight to the end state.
          </p>
        </footer>
      </div>
    </div>
  );
}
