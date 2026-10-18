import { ScrollProgress } from '@/registry/scroll-progress'

export default function TestScrollProgressPage() {
  return (
    <div className="relative min-h-[300vh] bg-dead-950 text-dead-50">
      {/* 1. Horizontal Default — fixed at the top */}
      <ScrollProgress variant="horizontal" color="default" />

      {/* 2. Horizontal Gradient — fixed at the top, slightly thicker */}
      <ScrollProgress variant="horizontal" color="gradient" className="h-2" />

      {/* 3. Circular Default — fixed top-right, no percentage */}
      <ScrollProgress variant="circular" color="default" />

      {/* 4. Circular with Percentage — fixed top-left, showing % text */}
      <ScrollProgress
        variant="circular"
        color="default"
        showPercentage
        className="top-4 left-4 right-auto"
      />

      {/* 5. Circular Gradient — fixed bottom-right, larger size */}
      <ScrollProgress
        variant="circular"
        color="gradient"
        size={64}
        strokeWidth={5}
        className="bottom-4 right-4 top-auto"
      />

      {/* Content to enable scrolling */}
      <div className="flex flex-col items-center px-8 pt-24">
        <header className="flex min-h-[80vh] w-full max-w-4xl flex-col items-center justify-center text-center">
          <p className="font-mono text-sm uppercase tracking-[0.35em] text-dead-400">
            Feature 34 — Free Component
          </p>
          <h1 className="mt-4 text-5xl font-bold tracking-tight md:text-7xl">
            Scroll Progress
          </h1>
          <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-dead-400">
            Scroll down to see five live indicators tracking your position.
            Horizontal bar (default + gradient), circular (top-right,
            top-left with percentage, bottom-right gradient).
          </p>
        </header>

        <section className="w-full max-w-3xl space-y-16 pb-40">
          <div className="rounded-lg border border-dead-800 bg-dead-900 p-8">
            <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-widest text-dead-300">
              How it works
            </h2>
            <p className="font-mono text-sm leading-relaxed text-dead-400">
              The component uses a single <code className="text-dead-50">requestAnimationFrame</code> loop to
              read <code className="text-dead-50">window.scrollY</code> and compute a 0–100% ratio. The
              horizontal variant scales <code className="text-dead-50">width</code>; the circular variant
              maps the percentage to an SVG <code className="text-dead-50">strokeDashoffset</code> on a
              <code className="text-dead-50">-90deg</code> rotated circle. Both apply a 75ms transition for
              a smooth feel without layout thrashing.
            </p>
          </div>

          <div className="rounded-lg border border-dead-800 bg-dead-900 p-8">
            <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-widest text-dead-300">
              Variants shown on this page
            </h2>
            <ul className="space-y-3 font-mono text-sm text-dead-400">
              <li>
                <span className="text-dead-50">1.</span> Horizontal Default{' '}
                <span className="text-dead-500">(top of page, red accent bar)</span>
              </li>
              <li>
                <span className="text-dead-50">2.</span> Horizontal Gradient{' '}
                <span className="text-dead-500">(below default, thicker h-2, gradient)</span>
              </li>
              <li>
                <span className="text-dead-50">3.</span> Circular Default{' '}
                <span className="text-dead-500">(top-right corner, no percentage)</span>
              </li>
              <li>
                <span className="text-dead-50">4.</span> Circular with Percentage{' '}
                <span className="text-dead-500">(top-left corner, shows % text)</span>
              </li>
              <li>
                <span className="text-dead-50">5.</span> Circular Gradient{' '}
                <span className="text-dead-500">(bottom-right corner, 64px size, gradient)</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-dead-800 bg-dead-900 p-8">
            <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-widest text-dead-300">
              Circular Math
            </h2>
            <p className="font-mono text-sm leading-relaxed text-dead-400">
              The progress circle is an SVG <code className="text-dead-50">{'<circle>'}</code> with{' '}
              <code className="text-dead-50">strokeDasharray</code> set to the full circumference —{' '}
              <code className="text-dead-50">2 &times; &pi; &times; (size - strokeWidth) / 2</code>.
              As you scroll, <code className="text-dead-50">strokeDashoffset</code> decreases from the
              full circumference (drawn 0%) to 0 (drawn 100%). The SVG is rotated -90° so the stroke
              begins at the 12 o&apos;clock position.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}