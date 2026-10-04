import { Marquee } from "@/registry/marquee";

const brands = [
  "REACT",
  "NEXT.JS",
  "TAILWIND",
  "GSAP",
  "MOTION",
  "THREE.JS",
];

const phrases = [
  "BUILD AT 60FPS",
  "GPU TRANSFORMS ONLY",
  "NO LAYOUT SHIFT",
  "CSS KEYFRAMES",
  "INFINITE LOOP",
  "EDGE BLUR",
  "ZERO JUMPS",
];

function BrandChip({ label }: { label: string }) {
  return (
    <span className="shrink-0 rounded-full border border-dead-700 bg-dead-800 px-6 py-3 font-mono text-sm tracking-widest text-dead-200">
      {label}
    </span>
  );
}

function PhraseCard({ label }: { label: string }) {
  return (
    <span className="shrink-0 rounded-lg border border-dead-800 bg-dead-900 px-8 py-6 font-mono text-xl font-semibold tracking-tight text-dead-50">
      {label}
    </span>
  );
}

export default function TestMarqueePage() {
  return (
    <div className="flex flex-col items-center bg-dead-950 text-dead-50">
      <header className="flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-dead-400">
          Feature 10 — Free Component
        </p>
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
          Infinite Blur Marquee
        </h1>
        <p className="max-w-xl font-mono text-sm leading-relaxed text-dead-400">
          A pure-CSS infinite scroller that loops with zero visual jumps. Content
          is duplicated exactly <span className="text-dead-200">repeat</span>{" "}
          times, each copy bakes its own trailing gap, and the keyframes slide
          exactly one copy width per loop. No JS animation, no flicker — just a
          GPU transform.
        </p>
      </header>

      <div className="w-full max-w-5xl space-y-6 px-8">
        <section>
          <p className="mb-4 font-mono text-sm text-dead-400">
            1. DEFAULT — horizontal, blurred edges, 30s loop. The chips fade out
            at both sides and wrap around imperceptibly.
          </p>
          <div className="rounded-lg border border-dead-800 bg-dead-900 p-8">
            <Marquee id="marquee-default">
              {brands.map((b) => (
                <BrandChip key={b} label={b} />
              ))}
            </Marquee>
          </div>
        </section>

        <div className="h-[10vh]" />

        <section>
          <p className="mb-4 font-mono text-sm text-dead-400">
            2. VERTICAL — same component, <span className="text-dead-200">direction=&quot;vertical&quot;</span>.
            The track climbs inside its fixed 500px box, fading top and bottom.
          </p>
          <div className="rounded-lg border border-dead-800 bg-dead-900 p-8">
            <Marquee id="marquee-vertical" direction="vertical" speed={20}>
              {phrases.map((p) => (
                <PhraseCard key={p} label={p} />
              ))}
            </Marquee>
          </div>
        </section>

        <div className="h-[10vh]" />

        <section>
          <p className="mb-4 font-mono text-sm text-dead-400">
            3. PAUSE ON HOVER — hover anywhere on the strip and the animation
            pauses in place via <span className="text-dead-200">animation-play-state</span>.
            Leave and it resumes exactly where it stopped.
          </p>
          <div className="rounded-lg border border-dead-800 bg-dead-900 p-8">
            <Marquee id="marquee-pause" pauseOnHover speed={15}>
              {brands.map((b) => (
                <BrandChip key={b} label={b} />
              ))}
            </Marquee>
          </div>
        </section>

        <div className="h-[10vh]" />

        <section>
          <p className="mb-4 font-mono text-sm text-dead-400">
            4. REVERSE + FAST — <span className="text-dead-200">reverse</span>{" "}
            flips the animation direction, <span className="text-dead-200">speed={10}</span>{" "}
            trims a full loop to ten seconds. Watch it emerge from the right edge.
          </p>
          <div className="rounded-lg border border-dead-800 bg-dead-900 p-8">
            <Marquee id="marquee-reverse" reverse speed={10}>
              {brands.map((b) => (
                <BrandChip key={b} label={b} />
              ))}
            </Marquee>
          </div>
        </section>

        <div className="h-[10vh]" />

        <section>
          <p className="mb-4 font-mono text-sm text-dead-400">
            5. NO BLUR — <span className="text-dead-200">blur=&quot;none&quot;</span> strips
            the mask so you can see the hard edges of the strip (and every chip
            untinted).
          </p>
          <div className="rounded-lg border border-dead-800 bg-dead-900 p-8">
            <Marquee id="marquee-noblur" blur="none" speed={18}>
              {brands.map((b) => (
                <BrandChip key={b} label={b} />
              ))}
            </Marquee>
          </div>
        </section>

        <div className="h-[10vh]" />

        <footer className="w-full pb-24 text-center">
          <p className="font-mono text-sm leading-relaxed text-dead-400">
            Seamless loop math: the track holds <span className="text-dead-200">repeat</span>{" "}
            identical copies and the keyframes translate{" "}
            <span className="text-dead-200">calc(-100% / var(--repeat))</span> — exactly one
            period. The blur mask is pure CSS <span className="text-dead-200">mask-image</span>,
            so it costs nothing. If prefers-reduced-motion is set, the marquee renders
            static.
          </p>
        </footer>
      </div>
    </div>
  );
}