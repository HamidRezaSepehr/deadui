import { MeltingBlurText } from '@/registry/pro/melting-blur-text'

export default function TestMeltingBlurTextPage() {
  return (
    <div className="flex flex-col items-center bg-dead-950 text-dead-50">
      <header className="flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-dead-400">
          Feature 28 — Pro Component
        </p>
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
          Melting Blur Text
        </h1>
        <p className="max-w-xl font-mono text-sm leading-relaxed text-dead-400">
          Sweep the cursor across the words. Characters near it sag, blur and
          bleed into one another through an SVG gooey filter, and the whole
          effect trails the pointer on a lerp instead of snapping to it. Move
          away and the text pours back into place.
        </p>
      </header>

      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          1. DEFAULT — effectRadius 60, blurSpread 8, blurQuality medium,
          inertia 0.15. Only characters inside the radius melt, and the falloff
          is squared so the letters at the edge of the circle barely move while
          the ones under the cursor dissolve.
        </p>

        <div className="rounded-lg border border-dead-800 bg-dead-900 p-10 text-center">
          <MeltingBlurText>
            Sweep across these words and watch them melt.
          </MeltingBlurText>
        </div>
      </section>

      <div className="h-[20vh]" />

      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          2. INERTIA — the lerp factor per frame. At 0.05 the goo lags far
          behind the pointer and feels heavy and liquid; at 0.5 it is almost
          attached to the cursor. Everything between is the same code with a
          different number.
        </p>

        <div className="flex flex-col gap-6 rounded-lg border border-dead-800 bg-dead-900 p-10">
          <div className="text-center">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-dead-400">
              inertia 0.05 — syrup
            </p>
            <MeltingBlurText inertia={0.05}>
              Drag the pointer slowly through this line.
            </MeltingBlurText>
          </div>

          <div className="text-center">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-dead-400">
              inertia 0.15 — default
            </p>
            <MeltingBlurText inertia={0.15}>
              Drag the pointer slowly through this line.
            </MeltingBlurText>
          </div>

          <div className="text-center">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-dead-400">
              inertia 0.5 — instant
            </p>
            <MeltingBlurText inertia={0.5}>
              Drag the pointer slowly through this line.
            </MeltingBlurText>
          </div>
        </div>
      </section>

      <div className="h-[20vh]" />

      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          3. EFFECT RADIUS — how far from the lerped cursor a character starts
          to react. A small radius is a tight local drip; a large one melts the
          whole paragraph at once no matter where you point.
        </p>

        <div className="grid gap-6 rounded-lg border border-dead-800 bg-dead-900 p-10">
          <div className="text-center">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-dead-400">
              effectRadius 20
            </p>
            <MeltingBlurText effectRadius={20}>
              A narrow radius keeps the melt under the cursor.
            </MeltingBlurText>
          </div>

          <div className="text-center">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-dead-400">
              effectRadius 150
            </p>
            <MeltingBlurText effectRadius={150}>
              A wide radius drags the entire sentence into the goo.
            </MeltingBlurText>
          </div>
        </div>
      </section>

      <div className="h-[20vh]" />

      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          4. BLUR SPREAD AND QUALITY — blurSpread drives both the drip distance
          (twice the spread) and the per-character blur radius. blurQuality is
          the container filter&apos;s stdDeviation, inverted on purpose: high
          is a tight 4, medium 6, low a wide 10 that reads as more goo and
          costs less.
        </p>

        <div className="grid gap-6 rounded-lg border border-dead-800 bg-dead-900 p-10">
          <div className="text-center">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-dead-400">
              blurSpread 2 — crisp
            </p>
            <MeltingBlurText blurSpread={2}>
              Barely any drip, the letters just lean and sharpen.
            </MeltingBlurText>
          </div>

          <div className="text-center">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-dead-400">
              blurSpread 20 — syrupy
            </p>
            <MeltingBlurText blurSpread={20}>
              Everything runs together into a single wet silhouette.
            </MeltingBlurText>
          </div>

          <div className="text-center">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-dead-400">
              blurQuality high / medium / low
            </p>
            <div className="flex flex-col gap-4">
              <MeltingBlurText blurQuality="high">
                High quality — tight threshold, sharp goo edges.
              </MeltingBlurText>
              <MeltingBlurText blurQuality="medium">
                Medium quality — the balanced default.
              </MeltingBlurText>
              <MeltingBlurText blurQuality="low">
                Low quality — wide blur, softest merge.
              </MeltingBlurText>
            </div>
          </div>
        </div>
      </section>

      <div className="h-[20vh]" />

      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          5. LAYOUT SAFETY — the melt is written straight to each
          character&apos;s transform and filter inside a requestAnimationFrame
          loop, so nothing about it can reflow the page. Spaces stay plain
          inline boxes so the sentence still wraps normally at every width.
        </p>

        <div className="rounded-lg border border-dead-800 bg-dead-900 p-10">
          <MeltingBlurText className="text-xl md:text-2xl">
            This sentence is deliberately long enough that it has to break onto
            more than one line inside this narrow column, and the characters
            must keep flowing across the line boxes without a single pixel of
            layout shift while they melt.
          </MeltingBlurText>
        </div>
      </section>

      <div className="h-[20vh]" />

      <footer className="w-full max-w-3xl pb-24 text-center">
        <p className="font-mono text-sm leading-relaxed text-dead-400">
          Accessibility note: with prefers-reduced-motion set, the animation
          loop never starts and the SVG filter is never applied — the sentence
          renders as plain, static text. The character spans carry no roles or
          labels, so assistive technology still reads the original string as
          one continuous sentence.
        </p>
      </footer>
    </div>
  )
}
