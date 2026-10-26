import { NeedleField } from '@/registry/needle-field'

export default function TestNeedleFieldPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center bg-dead-950 text-dead-50">
      <header className="flex min-h-[55vh] w-full max-w-3xl flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-dead-400">
          Feature 56 — Free Component
        </p>
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">Needle Field</h1>
        <p className="max-w-xl font-mono text-sm leading-relaxed text-dead-400">
          A pure Canvas grid of needles that rotate to face the cursor like iron filings
          in a magnetic field. Three variations below — default, dense monochrome,
          and wide vibrant — each contained in a centered card rather than spanning the viewport.
        </p>
      </header>

      <div className="h-[15vh]" />

      {/* 1. DEFAULT */}
      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm leading-relaxed text-dead-400">
          1. DEFAULT — Standard teal and orange palette with medium spacing and
          a 220px influence radius. The grid is rebuilt on resize and pauses
          when scrolled off-screen.
        </p>

        <div className="relative h-[420px] overflow-hidden rounded-xl border border-dead-800 bg-dead-900">
          <NeedleField className="h-full w-full">
            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-4 px-8 text-center">
              <h2 className="text-3xl font-extrabold tracking-tight">Magnetic Field</h2>
              <p className="font-mono text-sm text-dead-300">Move your mouse across the card</p>
            </div>
          </NeedleField>
        </div>
      </section>

      <div className="h-[15vh]" />

      {/* 2. DENSE MONOCHROME */}
      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm leading-relaxed text-dead-400">
          2. DENSE MONOCHROME — 14px spacing, shorter needles (`lengthRatio=0.5`),
          gray base and white highlight. A tighter field with the same bucketing
          performance optimization.
        </p>

        <div className="relative h-[420px] overflow-hidden rounded-xl border border-dead-800 bg-dead-950">
          <NeedleField
            className="h-full w-full"
            spacing={14}
            lengthRatio={0.5}
            colorBase="#444444"
            colorHighlight="#ffffff"
          >
            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-4 px-8 text-center">
              <p className="text-xl font-semibold text-white">Dense Field</p>
              <p className="font-mono text-sm text-dead-300">Closer spacing, monochrome tones</p>
            </div>
          </NeedleField>
        </div>
      </section>

      <div className="h-[15vh]" />

      {/* 3. WIDE VIBRANT */}
      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm leading-relaxed text-dead-400">
          3. WIDE VIBRANT — 40px spacing, long needles (`lengthRatio=0.9`),
          300px radius, purple base with pink highlights. The larger gap makes
          each needle more visible individually.
        </p>

        <div className="relative h-[420px] overflow-hidden rounded-xl border border-dead-800 bg-indigo-950">
          <NeedleField
            className="h-full w-full"
            spacing={40}
            lengthRatio={0.9}
            radius={300}
            colorBase="#6b21a8"
            colorHighlight="#f472b6"
          >
            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-4 px-8 text-center">
              <h2 className="text-3xl font-extrabold tracking-tighter">Vibrant Flow</h2>
              <p className="font-mono text-sm text-dead-200">Wider spacing, larger radius</p>
            </div>
          </NeedleField>
        </div>
      </section>

      <div className="h-[20vh]" />

      <footer className="w-full max-w-3xl px-8 pb-24 text-center">
        <p className="font-mono text-sm leading-relaxed text-dead-400">
          Needles form a perfect grid rebuilt on resize. Moving the pointer aligns
          them smoothly; proximity changes color and thickness. Idle animation
          activates after ~2.6s via sine-wave attractors. Respects
          <code className="text-dead-50"> prefers-reduced-motion</code>.
        </p>
      </footer>
    </div>
  )
}
