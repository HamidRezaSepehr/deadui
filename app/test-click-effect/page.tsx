'use client'

import { useState } from 'react'
import { ClickEffect, type ClickEffectVariant } from '@/registry/click-effect'

// Local QA-page metadata — the effects table itself is mo.js-dependent and
// browser-only, so the page never imports it (same reason ClickEffect lazy-
// loads it). Keys double as the variant list.
const VARIANT_NOTES: Record<Exclude<ClickEffectVariant, 'none'>, {
  note: string
  flags: string[]
}> = {
  virethos: {
    note: 'Orange dashed-line burst plus a red-to-orange ring.',
    flags: ['2 layers'],
  },
  zynthor: {
    note: 'Ten tiny circles blasting out to radius 30.',
    flags: ['1 layer'],
  },
  elarisca: {
    note: 'Two counter bursts: orange dots out, then in.',
    flags: ['2 layers'],
  },
  gravonix: {
    note: 'The virethos line burst on its own — no ring.',
    flags: ['1 layer'],
  },
  xypheris: {
    note: 'Randomised black arcs over nine green rays.',
    flags: ['2 layers', 'generate'],
  },
  vorlana: {
    note: 'A single red-to-lilac ring that expands and thins.',
    flags: ['1 layer'],
  },
  klyntar: {
    note: 'The vorlana ring, doubled — the second lands 300ms late.',
    flags: ['2 layers'],
  },
  zerionis: {
    note: 'Orange rays, green rays, and an imploding ring.',
    flags: ['3 layers'],
  },
  marnixus: {
    note: 'Five dashed half-circle rays aimed downward.',
    flags: ['1 layer'],
  },
  taviros: {
    note: 'Ten grey rays with a red echo 300ms behind them.',
    flags: ['2 layers'],
  },
  lothira: {
    note: 'Orange dots spinning one way, red dots the other.',
    flags: ['2 layers'],
  },
  xandura: {
    note: 'Three scattered starbursts — red, orange, green.',
    flags: ['3 layers', 'generate', 'random coords'],
  },
  dravonix: {
    note: 'Three randomised black rings that redraw themselves.',
    flags: ['1 layer', 'generate'],
  },
  voltrisca: {
    note: 'Random rays, random rings, then a closing black circle.',
    flags: ['3 layers', 'generate'],
  },
  elvantis: {
    note: 'The lilac ring with a 14-piece pastel confetti burst.',
    flags: ['2 layers'],
  },
}

const EFFECT_NAMES = Object.keys(VARIANT_NOTES) as Array<
  Exclude<ClickEffectVariant, 'none'>
>

export default function ClickEffectTestPage() {
  const [variant, setVariant] = useState<ClickEffectVariant>('virethos')
  const [mounted, setMounted] = useState(true)
  const [lastClick, setLastClick] = useState<{ x: number; y: number } | null>(null)
  const [fired, setFired] = useState(0)

  return (
    <main
      className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50"
      onClick={(event) => {
        setLastClick({ x: event.clientX, y: event.clientY })
        setFired((count) => count + 1)
      }}
    >
      {mounted ? <ClickEffect variant={variant} /> : null}

      <div className="mx-auto max-w-6xl space-y-12">
        <header className="space-y-3">
          <p className="font-mono text-sm uppercase tracking-[0.35em] text-dead-400">
            Feature 30 — Free Component
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            Click Effect — QA
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-dead-400">
            <span className="font-mono text-xs text-dead-200">ClickEffect</span>{' '}
            renders nothing: it attaches one click listener to{' '}
            <span className="font-mono text-xs text-dead-200">window</span> and
            replays the armed mo.js effect at the pointer. Click anywhere on
            this page — including on the cards — and the burst appears at
            exactly that coordinate.
          </p>
        </header>

        <section className="space-y-6 rounded-xl border border-dead-800 bg-dead-900 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="variant-select"
                className="font-mono text-xs uppercase tracking-[0.2em] text-dead-400"
              >
                Armed variant
              </label>
              <select
                id="variant-select"
                value={variant}
                onChange={(event) =>
                  setVariant(event.target.value as ClickEffectVariant)
                }
                className="w-full rounded-lg border border-dead-800 bg-dead-950 px-4 py-3 font-mono text-sm text-dead-50 transition-colors focus:border-dead-red focus:ring-2 focus:ring-dead-red focus:ring-offset-2 focus:ring-offset-dead-950"
              >
                {EFFECT_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
                <option value="none">none (listener detached)</option>
              </select>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-dead-400">
                Component mounted
              </span>
              <button
                type="button"
                onClick={() => setMounted((value) => !value)}
                className="w-full rounded-lg border border-dead-800 bg-dead-950 px-4 py-3 text-left font-mono text-sm text-dead-50 transition-colors hover:border-dead-red focus:ring-2 focus:ring-dead-red focus:ring-offset-2 focus:ring-offset-dead-950"
              >
                {mounted
                  ? 'Mounted — clicks fire. Toggle to test unmount cleanup.'
                  : 'Unmounted — clicks do nothing. Toggle to remount.'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2 border-t border-dead-800 pt-4 font-mono text-xs text-dead-400">
            <span>
              armed:{' '}
              <span className="text-dead-red">{variant}</span>
            </span>
            <span>
              clicks:{' '}
              <span className="text-dead-50">{fired}</span>
            </span>
            <span>
              last:{' '}
              <span className="text-dead-50">
                {lastClick ? `(${lastClick.x}, ${lastClick.y})` : '—'}
              </span>
            </span>
          </div>
        </section>

        <section className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-widest text-dead-400">
            All 15 variants — click a card to fire at that point, or press
            &quot;Arm&quot; to switch the armed variant without firing
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {EFFECT_NAMES.map((name, index) => {
              const active = name === variant
              return (
                <div
                  key={name}
                  className={`relative flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition-colors ${
                    active
                      ? 'border-dead-red bg-dead-900'
                      : 'border-dead-800 bg-dead-900/60 hover:border-dead-700'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-[10px] tracking-widest text-dead-500">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        setVariant(name)
                      }}
                      className="rounded border border-dead-700 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-dead-300 transition-colors hover:border-dead-red hover:text-dead-red focus:ring-2 focus:ring-dead-red focus:ring-offset-2 focus:ring-offset-dead-950"
                    >
                      Arm
                    </button>
                  </div>
                  <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-dead-50">
                    {name}
                  </h2>
                  <p className="text-xs leading-relaxed text-dead-400">
                    {VARIANT_NOTES[name].note}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                    {VARIANT_NOTES[name].flags.map((flag) => (
                      <span
                        key={flag}
                        className="rounded bg-dead-950 px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-dead-500"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <footer className="border-t border-dead-800 pt-8 text-sm text-dead-400">
          <p className="font-mono text-xs uppercase tracking-widest text-dead-500">
            Notes
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>
              All 15 mo.js configurations are constructed once at module load
              in{' '}
              <span className="font-mono text-xs text-dead-200">
                effects.ts
              </span>
              ; every click only calls{' '}
              <span className="font-mono text-xs text-dead-200">
                .tune(coords).replay()
              </span>{' '}
              (plus{' '}
              <span className="font-mono text-xs text-dead-200">
                .generate()
              </span>{' '}
              on the randomised ones) — no allocation per click.
            </li>
            <li>
              <span className="font-mono text-xs text-dead-200">Arm</span>{' '}
              stops propagation, so switching variants never fires the
              outgoing effect.
            </li>
            <li>
              Unmounting (or arming{' '}
              <span className="font-mono text-xs text-dead-200">none</span>)
              removes the window listener — clicks stop firing immediately.
            </li>
            <li>
              mo.js is browser-only (it touches{' '}
              <span className="font-mono text-xs text-dead-200">self</span>,{' '}
              <span className="font-mono text-xs text-dead-200">document</span>{' '}
              and{' '}
              <span className="font-mono text-xs text-dead-200">
                navigator
              </span>
              ), so the component loads its effects lazily in the browser and
              never runs during SSR.
            </li>
          </ul>
        </footer>
      </div>
    </main>
  )
}
