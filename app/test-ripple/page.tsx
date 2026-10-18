import { Heart } from 'lucide-react'
import { Ripple } from '@/registry/ripple'

export default function TestRipplePage() {
  return (
    <div className="flex flex-col items-center bg-dead-950 text-dead-50">
      <header className="flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-dead-400">
          Feature 33 — Free Component
        </p>
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">Ripple</h1>
        <p className="max-w-xl font-mono text-sm leading-relaxed text-dead-400">
          Expanding, fading concentric circles behind centered content. Accepts
          any React children — text, icons, buttons — and animates them with a
          living halo. Customisable size, opacity, circle count, and colour.
        </p>
      </header>

      {/* 1. TEXT IN CENTER */}
      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          1. TEXT IN CENTER — Large bold text sitting on top of the default
          ripple. The effect gives the text a halo that reads as a slow,
          expanding pulse.
        </p>

        <div className="flex items-center justify-center rounded-lg border border-dead-800 bg-dead-900 p-12">
          <Ripple className="h-[400px] w-full max-w-lg">
            <span className="text-5xl font-bold tracking-tight text-dead-50">
              Dead UI
            </span>
          </Ripple>
        </div>
      </section>

      <div className="h-[20vh]" />

      {/* 2. ICON IN CENTER */}
      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          2. ICON WITH CUSTOM COLOR — A large Heart icon inside a blue-tinted
          ripple. The <code className="text-dead-50">color</code> prop changes
          both the border and the subtle background fill of the circles.
        </p>

        <div className="flex items-center justify-center rounded-lg border border-dead-800 bg-dead-900 p-12">
          <Ripple className="h-[400px] w-full max-w-lg" color="#3b82f6">
            <Heart className="size-16 text-blue-400" strokeWidth={1.5} />
          </Ripple>
        </div>
      </section>

      <div className="h-[20vh]" />

      {/* 3. CUSTOM SIZES */}
      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          3. CUSTOM SIZES — A small ripple and a large one side by side.
          <code className="text-dead-50">mainCircleSize</code> controls the
          innermost circle; each subsequent circle adds 70px.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-12 rounded-lg border border-dead-800 bg-dead-900 p-12">
          <div className="flex flex-col items-center gap-4">
            <Ripple className="h-[240px] w-[240px]" mainCircleSize={80} numCircles={5}>
              <span className="text-xl font-bold">Small</span>
            </Ripple>
            <p className="font-mono text-xs text-dead-400">Size: 80 / Circles: 5</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Ripple className="h-[500px] w-[500px]" mainCircleSize={300} numCircles={10}>
              <span className="text-3xl font-bold">Large</span>
            </Ripple>
            <p className="font-mono text-xs text-dead-400">Size: 300 / Circles: 10</p>
          </div>
        </div>
      </section>

      <div className="h-[20vh]" />

      {/* 4. BUTTON INTEGRATION */}
      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          4. BUTTON INTEGRATION — A call-to-action button perfectly centred
          inside the ripple. The <code className="text-dead-50">relative z-10</code>{' '}
          layer keeps the button above the animation at all times.
        </p>

        <div className="flex items-center justify-center rounded-lg border border-dead-800 bg-dead-900 p-12">
          <Ripple className="h-[400px] w-full max-w-lg" mainCircleSize={150} color="#a855f7">
            <button
              type="button"
              className="rounded-lg bg-dead-50 px-8 py-4 text-lg font-semibold text-dead-950 transition-transform hover:scale-105 active:scale-95"
            >
              Get Started
            </button>
          </Ripple>
        </div>

        <p className="mt-8 font-mono text-sm leading-relaxed text-dead-400">
          The button is a real <code className="text-dead-50">{'<button>'}</code> element, so it is keyboard-reachable and
          announces its label to assistive tech. Under prefers-reduced-motion the
          ripple animation stops and the content remains fully legible.
        </p>
      </section>

      <div className="h-[20vh]" />

      <footer className="w-full max-w-3xl px-8 pb-24 text-center">
        <p className="font-mono text-sm leading-relaxed text-dead-400">
          All ripples use the <code className="text-dead-50">animate-ripple</code>{' '}
          tailwind animation that ships with the component through{' '}
          <code className="text-dead-50">deadui init</code>. The animation is 3s
          per cycle with a cubic-bezier(0, 0.5, 0.5, 1) timing function — starts
          fast, decelerates smoothly.
        </p>
      </footer>
    </div>
  )
}