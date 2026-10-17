'use client'

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
const SCROLL_CHIPS = ["SCROLL DOWN → GLIDES", "VIEWPORT-LINKED", "ONE PERIOD OF TRAVEL", "NO AUTOPLAY", "PASSIVE LISTENER", "NEVER LEAVES ITS BOX"];
const VELOCITY_LEFT_CHIPS = ["DEFAULT → LEFT", "SCROLL DOWN → FASTER LEFT", "SCROLL UP → REVERSE RIGHT", "IDLE → RESUME LEFT", "VELOCITY BOUND", "NO JUMP"];
const VELOCITY_RIGHT_CHIPS = ["REVERSE → RIGHT", "SCROLL DOWN → FASTER RIGHT", "SCROLL UP → REVERSE LEFT", "IDLE → RESUME RIGHT", "VELOCITY BOUND", "NO JUMP"];

const VERTICAL_ITEMS = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];

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

function VerticalItem({ label }: { label: string }) {
  return (
    <div className="flex h-[60px] w-[200px] shrink-0 items-center justify-center rounded-md border border-dead-800 bg-dead-800/50 font-mono text-sm text-dead-200">
      {label}
    </div>
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
          repeated wrapper, and the scroll-linked transform scrubs from the
          container&apos;s viewport progress.
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
                ref={(el) => {
                  // React does not SSR the `muted` attribute, so the prerendered
                  // HTML can be blocked by the autoplay policy. Calling play()
                  // after hydration (when `muted` is set as a property) fixes it.
                  el?.play().catch(() => {})
                }}
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
            SCROLL-LINKED —{" "}
            <span className="text-dead-200">scrollLinked=&#123;true&#125;</span> disables
            autoplay and scrubs{" "}
            <span className="text-dead-200">translateX</span> from the container&apos;s
            own progress through the viewport (
            <span className="text-dead-200">getBoundingClientRect()</span> vs{" "}
            <span className="text-dead-200">innerHeight</span>), wrapped to a
            single period. It holds still while off-screen, glides through that
            period as you scroll it into and out of view, and never leaves its
            box; <span className="text-dead-200">reverse</span> flips the travel
            direction. One <span className="text-dead-200">passive</span> listener.
          </SectionLabel>
          <div className="rounded-lg border border-dead-800 bg-dead-900 p-8">
            <Marquee
              id="marquee-scroll"
              scrollLinked
              direction="horizontal"
              repeat={8}
              speed={30}
            >
              {SCROLL_CHIPS.map((label) => (
                <Chip key={label} label={label} />
              ))}
            </Marquee>
          </div>
        </section>

        <div className="h-[8vh]" />

        <section>
          <SectionLabel n={6}>
            VELOCITY-LINKED SCROLL —{" "}
            <span className="text-dead-200">scrollVelocity</span> keeps the strip
            auto-playing and binds its speed to your scroll velocity. The strip
            never stops: scrolling DOWN drives the default direction
            (fast), scrolling UP reverses it (fast), and when you stop it keeps
            moving in the last direction at normal speed.{" "}
            <span className="text-dead-200">reverse</span> picks whether the
            default direction is LEFT (default) or RIGHT.
          </SectionLabel>
          <div className="space-y-6">
            <div className="rounded-lg border border-dead-800 bg-dead-900 p-8">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-dead-400">
                default direction — LEFT
              </p>
              <Marquee
                id="marquee-velocity-left"
                scrollVelocity
                direction="horizontal"
                repeat={6}
                speed={14}
              >
                {VELOCITY_LEFT_CHIPS.map((label) => (
                  <Chip key={label} label={label} />
                ))}
              </Marquee>
            </div>
            <div className="rounded-lg border border-dead-800 bg-dead-900 p-8">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-dead-400">
                default direction — RIGHT (reverse)
              </p>
              <Marquee
                id="marquee-velocity-right"
                scrollVelocity
                reverse
                direction="horizontal"
                repeat={6}
                speed={14}
              >
                {VELOCITY_RIGHT_CHIPS.map((label) => (
                  <Chip key={label} label={label} />
                ))}
              </Marquee>
            </div>
          </div>
        </section>

        <section>
          <SectionLabel n={7}>
            VERTICAL MARQUEE VARIATIONS — the same set the horizontal strips
            have, on the vertical axis.{" "}
            <span className="text-dead-200">direction=&quot;vertical&quot;</span>{" "}
            moves UP by default and{" "}
            <span className="text-dead-200">reverse</span> moves DOWN. Add{" "}
            <span className="text-dead-200">scrollLinked</span> for a strip that
            only moves while you scroll, or{" "}
            <span className="text-dead-200">scrollVelocity</span> for a strip that
            keeps moving by default AND binds its speed/direction to your scroll.
          </SectionLabel>
          <div className="space-y-6">
            <div className="rounded-lg border border-dead-800 bg-dead-900 p-8">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-dead-400">
                1. autoplay — UP (default, not scroll-linked)
              </p>
              <Marquee
                id="marquee-vertical-up"
                direction="vertical"
                speed={6}
                gap={12}
                className="h-[320px] items-center"
              >
                {VERTICAL_ITEMS.map((item) => (
                  <VerticalItem key={item} label={item} />
                ))}
              </Marquee>
            </div>

            <div className="rounded-lg border border-dead-800 bg-dead-900 p-8">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-dead-400">
                2. autoplay — DOWN (reverse, not scroll-linked)
              </p>
              <Marquee
                id="marquee-vertical-down"
                direction="vertical"
                reverse
                speed={6}
                gap={12}
                className="h-[320px] items-center"
              >
                {VERTICAL_ITEMS.map((item) => (
                  <VerticalItem key={item} label={item} />
                ))}
              </Marquee>
            </div>

            <div className="rounded-lg border border-dead-800 bg-dead-900 p-8">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-dead-400">
                3. scrollLinked — only moves when you scroll
              </p>
              <Marquee
                id="marquee-vertical-scroll"
                direction="vertical"
                scrollLinked
                repeat={6}
                speed={6}
                gap={12}
                className="h-[320px] items-center"
              >
                {VERTICAL_ITEMS.map((item) => (
                  <VerticalItem key={item} label={item} />
                ))}
              </Marquee>
              <p className="mt-3 font-mono text-xs text-dead-400">
                Scroll down → moves UP, scroll up → moves DOWN, idle → stays put.
                The offset is the container&apos;s progress through the viewport
                (wrapped to one period), so the strip never leaves its box.
              </p>
            </div>

            <div className="rounded-lg border border-dead-800 bg-dead-900 p-8">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-dead-400">
                4. scrollVelocity — default UP, keeps moving + scroll-bound
              </p>
              <Marquee
                id="marquee-vertical-velocity-up"
                direction="vertical"
                scrollVelocity
                repeat={6}
                speed={4}
                gap={12}
                className="h-[320px] items-center"
              >
                {VERTICAL_ITEMS.map((item) => (
                  <VerticalItem key={item} label={item} />
                ))}
              </Marquee>
              <p className="mt-3 font-mono text-xs text-dead-400">
                Scroll down → faster UP, scroll up → reverses DOWN, idle → keeps
                going UP.
              </p>
            </div>

            <div className="rounded-lg border border-dead-800 bg-dead-900 p-8">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-dead-400">
                5. scrollVelocity reverse — default DOWN, keeps moving + scroll-bound
              </p>
              <Marquee
                id="marquee-vertical-velocity-down"
                direction="vertical"
                scrollVelocity
                reverse
                repeat={6}
                speed={4}
                gap={12}
                className="h-[320px] items-center"
              >
                {VERTICAL_ITEMS.map((item) => (
                  <VerticalItem key={item} label={item} />
                ))}
              </Marquee>
              <p className="mt-3 font-mono text-xs text-dead-400">
                Scroll down → faster DOWN, scroll up → reverses UP, idle → keeps
                going DOWN.
              </p>
            </div>
          </div>
        </section>
        <div className="h-[30vh]" />

        <footer className="w-full pb-24 text-center">
          <p className="font-mono text-sm leading-relaxed text-dead-400">
            The loop math is unchanged — one baked gap per copy, keyframes that
            translate exactly one copy — so <span className="text-dead-200">repeat</span>{" "}
            still costs DOM and nothing else. With{" "}
            <span className="text-dead-200">scrollLinked</span> the animation is
            replaced by a compositor transform scrubbed from the container&apos;s
            viewport progress, and
            under prefers-reduced-motion autoplay strips render static.
          </p>
        </footer>
      </div>
    </div>
  );
}
