import { Marquee } from "@/registry/marquee";

const VIDEO_SRC =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const PHOTOS = [
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
];

const COMBO_CARDS = [
  {
    image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80",
    title: "Compositor only",
    body: "Transform and opacity never touch layout, so the loop stays on the GPU even mid-scroll.",
  },
  {
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80",
    title: "Pixel-perfect seam",
    body: "Each copy bakes its own trailing gap, so the wrap point lands on an exact period.",
  },
  {
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
    title: "Media agnostic",
    body: "Images, SVGs, videos and mixed HTML cards all ride the same track without extra config.",
  },
  {
    image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80",
    title: "Two fonts, one card",
    body: "Children are ordinary markup: the title uses the sans family while this body copy does not.",
  },
];

const STACK_TOP = ["NORMAL DIRECTION", "SCROLLS LEFT", "PURE CSS KEYFRAMES", "NO JS", "ONE COMPOSITOR LAYER"];
const STACK_BOTTOM = ["REVERSED", "SCROLLS RIGHT", "OPPOSING ROW", "SAME TRACK MATH", "STACKED IN A COLUMN"];
const SCROLL_CHIPS = ["SCROLL DOWN → RIGHT", "SCROLL UP → LEFT", "BI-DIRECTIONAL", "SCROLL-LINKED", "NO AUTOPLAY", "WINDOW.SCROLLY"];

/* Section 1 logo marks: three inline SVGs mixed between the photo tiles. */
function TriangleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10 text-dead-200" fill="none" aria-hidden>
      <path d="M24 6 44 40H4L24 6Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="24" cy="30" r="5" fill="currentColor" />
    </svg>
  );
}

function HexMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10 text-dead-200" fill="none" aria-hidden>
      <path
        d="M24 4 41.3 14v20L24 44 6.7 34V14L24 4Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M24 14v20M15 19.5l18 10M33 19.5l-18 10" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function BarsMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10 text-dead-200" fill="none" aria-hidden>
      <rect x="6" y="10" width="8" height="28" rx="4" fill="currentColor" />
      <rect x="20" y="16" width="8" height="22" rx="4" fill="currentColor" opacity="0.7" />
      <rect x="34" y="6" width="8" height="32" rx="4" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

function LogoTile({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-24 w-44 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dead-800 bg-dead-900">
      {children}
    </div>
  );
}

function ComboCard({ image, title, body }: (typeof COMBO_CARDS)[number]) {
  return (
    <article className="flex w-[380px] shrink-0 overflow-hidden rounded-xl border border-dead-800 bg-dead-900">
      {/* Remote demo host: next/image would reject it without remotePatterns. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className="h-36 w-32 shrink-0 object-cover" />
      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-sans text-sm font-semibold tracking-tight text-dead-50">{title}</h3>
        <p className="font-serif text-[13px] leading-relaxed text-dead-400">{body}</p>
      </div>
    </article>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="shrink-0 rounded-lg border border-dead-700 px-6 py-3 font-mono text-sm uppercase tracking-[0.2em] text-dead-200">
      {label}
    </span>
  );
}

function SectionLabel({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p className="mb-4 font-mono text-sm leading-relaxed text-dead-400">
      <span className="text-dead-200">{n}.</span> {children}
    </p>
  );
}

export default function TestMarqueePage() {
  return (
    <div className="flex flex-col items-center bg-dead-950 text-dead-50">
      <header className="flex min-h-[50vh] w-full max-w-4xl flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-dead-400">
          Feature 28 — Free Component
        </p>
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">Advanced Media Marquee</h1>
        <p className="max-w-xl font-mono text-sm leading-relaxed text-dead-400">
          The marquee is now media-agnostic: images, SVGs, videos and mixed HTML
          cards all ride the same seamless track. New{" "}
          <span className="text-dead-200">itemClassName</span>,{" "}
          <span className="text-dead-200">bg</span> and{" "}
          <span className="text-dead-200">border</span> variants style every
          repeated wrapper, and the scroll-linked transform is bidirectional.
        </p>
      </header>

      <div className="w-full max-w-5xl space-y-6 px-8">
        <section>
          <SectionLabel n={1}>
            IMAGE &amp; SVG — <span className="text-dead-200">itemClassName=&quot;rounded-xl p-4&quot;</span>{" "}
            lands on every repeated wrapper together with{" "}
            <span className="text-dead-200">overflow-hidden</span>, so radius and
            padding apply uniformly to the whole strip of photo tiles and inline
            SVG marks.
          </SectionLabel>
          <div className="rounded-lg border border-dead-800 bg-dead-900 p-8">
            <Marquee id="marquee-images" itemClassName="rounded-xl p-4" speed={35}>
              <LogoTile>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PHOTOS[0]} alt="" className="h-full w-full object-cover" />
              </LogoTile>
              <LogoTile>
                <TriangleMark />
              </LogoTile>
              <LogoTile>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PHOTOS[1]} alt="" className="h-full w-full object-cover" />
              </LogoTile>
              <LogoTile>
                <HexMark />
              </LogoTile>
              <LogoTile>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PHOTOS[2]} alt="" className="h-full w-full object-cover" />
              </LogoTile>
              <LogoTile>
                <BarsMark />
              </LogoTile>
            </Marquee>
          </div>
        </section>

        <div className="h-[8vh]" />

        <section>
          <SectionLabel n={2}>
            IMAGE + TEXT COMBO — cards mix an image with copy whose title uses{" "}
            <span className="text-dead-200">font-sans</span> and whose body uses{" "}
            <span className="text-dead-200">font-serif</span>; children are plain
            HTML, so each element keeps its own typography.
          </SectionLabel>
          <div className="rounded-lg border border-dead-800 bg-dead-900 p-8">
            <Marquee id="marquee-combo" speed={45} gap={24}>
              {COMBO_CARDS.map((card) => (
                <ComboCard key={card.title} {...card} />
              ))}
            </Marquee>
          </div>
        </section>

        <div className="h-[8vh]" />

        <section>
          <SectionLabel n={3}>
            VIDEO — <span className="text-dead-200">itemClassName=&quot;rounded-2xl&quot;</span> with{" "}
            <span className="text-dead-200">gap=&#123;0&#125;</span>: each muted,
            looping video fills its own wrapper edge to edge, so{" "}
            <span className="text-dead-200">overflow-hidden</span> on the wrapper
            is what rounds the clip&apos;s corners.
          </SectionLabel>
          <div className="rounded-lg border border-dead-800 bg-dead-900 p-8">
            <Marquee id="marquee-video" itemClassName="rounded-2xl" gap={0} repeat={5} speed={25}>
              <video
                src={VIDEO_SRC}
                autoPlay
                muted
                loop
                playsInline
                className="h-44 w-[320px] shrink-0 object-cover"
              />
            </Marquee>
          </div>
        </section>

        <div className="h-[8vh]" />

        <section>
          <SectionLabel n={4}>
            STACKED OPPOSING — two rows in one column: the top runs{" "}
            <span className="text-dead-200">reverse=&#123;false&#125;</span>, the bottom{" "}
            <span className="text-dead-200">reverse=&#123;true&#125;</span>. The top row
            also demonstrates the container variants{" "}
            <span className="text-dead-200">bg=&quot;surface&quot;</span> and{" "}
            <span className="text-dead-200">border=&quot;default&quot;</span>.
          </SectionLabel>
          <div className="space-y-4 rounded-lg border border-dead-800 bg-dead-900 p-8">
            <Marquee id="marquee-stacked" reverse={false} bg="surface" border="default" speed={30}>
              {STACK_TOP.map((label) => (
                <Chip key={label} label={label} />
              ))}
            </Marquee>
            <Marquee id="marquee-stacked-reverse" reverse speed={30}>
              {STACK_BOTTOM.map((label) => (
                <Chip key={label} label={label} />
              ))}
            </Marquee>
          </div>
        </section>

        <div className="h-[8vh]" />

        <section>
          <SectionLabel n={5}>
            BIDIRECTIONAL SCROLL-LINKED —{" "}
            <span className="text-dead-200">scrollLinked=&#123;true&#125;</span> disables
            autoplay and drives{" "}
            <span className="text-dead-200">translateX(calc(var(--scroll-progress) * 1))</span>{" "}
            from <span className="text-dead-200">window.scrollY</span>: scrolling
            down slides the strip to the RIGHT, scrolling up pulls it LEFT. The
            track is centered (<span className="text-dead-200">justify-center</span>)
            so it overhangs both edges and has room to travel into.
          </SectionLabel>
          <div className="rounded-lg border border-dead-800 bg-dead-900 p-8">
            <Marquee
              id="marquee-scroll"
              scrollLinked
              direction="horizontal"
              repeat={8}
              speed={30}
              className="justify-center"
            >
              {SCROLL_CHIPS.map((label) => (
                <Chip key={label} label={label} />
              ))}
            </Marquee>
          </div>
        </section>

        <div className="h-[30vh]" />

        <footer className="w-full pb-24 text-center">
          <p className="font-mono text-sm leading-relaxed text-dead-400">
            The loop math is unchanged — one baked gap per copy, keyframes that
            translate exactly one copy — so <span className="text-dead-200">repeat</span>{" "}
            still costs DOM and nothing else. With{" "}
            <span className="text-dead-200">scrollLinked</span> the animation is
            replaced by a compositor transform fed from the scroll listener, and
            under prefers-reduced-motion autoplay strips render static.
          </p>
        </footer>
      </div>
    </div>
  );
}
