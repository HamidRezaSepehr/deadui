import { ScrollScrub } from "@/registry/scroll-scrub";

// The component's own fallback URL, passed explicitly so the section is
// unambiguous about which media it is scrubbing. (The spec's original default,
// Google's `gtv-videos-bucket/sample/ForBiggerBlazes.mp4`, now answers 403 for
// anonymous callers — that bucket is no longer public — so the shipped default
// is MDN's CC0 `flower.mp4` instead.)
const DEFAULT_VIDEO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const UNSPLASH_FRAMES = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=800&h=600&q=80",
];

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
            DEFAULT IMAGE SEQUENCE — no props at all. Ten Picsum frames,{" "}
            <span className="text-dead-200">pin</span> on, ~200vh of scrub. The
            stage stays put while the frames change underneath it.
          </SectionLabel>
          <ScrollScrub id="ss-default-images" />
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
          <ScrollScrub id="ss-default-video" videoSrc={DEFAULT_VIDEO} />
        </section>

        <section>
          <SectionLabel index={3}>
            CUSTOM IMAGE SEQUENCE — five Unsplash frames via{" "}
            <span className="text-dead-200">images</span>. Fewer frames means
            each one holds longer on the scroll.
          </SectionLabel>
          <ScrollScrub id="ss-custom-images" images={UNSPLASH_FRAMES} />
        </section>

        <section>
          <SectionLabel index={4}>
            UNPINNED — <span className="text-dead-200">pin</span> is false and
            the section is short (<span className="text-dead-200">h-[150vh]</span>
            ), so the media scrolls naturally through the viewport while it
            keeps scrubbing.
          </SectionLabel>
          <ScrollScrub id="ss-unpinned" pin={false} className="h-[150vh]" />
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
