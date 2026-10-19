'use client'

import { Command } from 'lucide-react'
import { SpinningText } from '@/registry/spinning-text'

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <span className="font-mono text-xs font-semibold tracking-widest text-dead-red">
        {index}
      </span>
      <h2 className="font-mono text-xs uppercase tracking-widest text-dead-400">{title}</h2>
    </div>
  )
}

export default function SpinningTextTestPage() {
  return (
    <main className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50">
      <div className="mx-auto max-w-5xl space-y-20">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Spinning Text — QA</h1>
          <p className="max-w-2xl text-sm text-dead-400">
            A single text string drawn perfectly along a circular path using
            native SVG <code className="text-dead-200">&lt;textPath&gt;</code>, then
            rotated continuously. Repeat the string with separators (like{' '}
            <code className="text-dead-200">&bull;</code> or{' '}
            <code className="text-dead-200">&star;</code>) so the circle is fully
            populated.
          </p>
        </header>

        {/* 01 — Basic Text */}
        <section>
          <SectionLabel index="01" title="Basic Text" />
          <div className="flex items-center justify-center rounded-xl border border-dead-800 bg-dead-900/40">
            <SpinningText
              text="DEAD UI • ANIMATIONS • FREE COMPONENTS • "
              className="my-16 w-64 h-64"
            />
          </div>
          <p className="mt-3 text-sm text-dead-400">
            A repeating string wraps once around the whole circle. The trailing
            separator keeps the ring visually continuous at the seam.
          </p>
        </section>

        {/* 02 — Custom Center */}
        <section>
          <SectionLabel index="02" title="Custom Center Content" />
          <div className="flex items-center justify-center rounded-xl border border-dead-800 bg-dead-900/40">
            <SpinningText
              text="DEAD UI • CREATE • SHIP • REPEAT • "
              className="my-16 w-72 h-72"
              centerContent={
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-dead-red shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                  <Command size={26} className="text-white" strokeWidth={1.5} />
                </div>
              }
            />
          </div>
          <p className="mt-3 text-sm text-dead-400">
            The default black circle is replaced with a branded icon in a glowing
            red badge. The center stays perfectly static while the text whirls
            around it.
          </p>
        </section>

        {/* 03 — Counter-Clockwise & Fast */}
        <section>
          <SectionLabel index="03" title="Counter-Clockwise & Fast" />
          <div className="flex items-center justify-center rounded-xl border border-dead-800 bg-dead-900/40">
            <SpinningText
              text="FAST • REVERSE • LOOP • "
              className="my-16 w-64 h-64"
              duration={5}
              direction="counter-clockwise"
              centerContent={
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dead-red/60 bg-dead-950">
                  <span className="font-mono text-xs font-semibold text-dead-red">5s</span>
                </div>
              }
            />
          </div>
          <p className="mt-3 text-sm text-dead-400">
            A fast 5-second counter-clockwise rotation. The{' '}
            <code className="text-dead-200">duration</code> prop controls speed;
            <code className="text-dead-200">direction</code> flips the spin.
          </p>
        </section>

        {/* 04 — Different Sizes */}
        <section>
          <SectionLabel index="04" title="Different Sizes" />
          <div className="flex flex-wrap items-center justify-center gap-10 rounded-xl border border-dead-800 bg-dead-900/40">
            <div className="flex flex-col items-center gap-3 py-10">
              <SpinningText
                text="SMALL • SPIN • "
                className="w-32 h-32"
              />
              <p className="font-mono text-xs text-dead-400">w-32 h-32</p>
            </div>
            <div className="flex flex-col items-center gap-3 py-10">
              <SpinningText
                text="MEDIUM • SPIN • "
                className="w-44 h-44"
              />
              <p className="font-mono text-xs text-dead-400">w-44 h-44</p>
            </div>
            <div className="flex flex-col items-center gap-3 py-10">
              <SpinningText
                text="LARGE • SPIN • "
                className="w-64 h-64"
              />
              <p className="font-mono text-xs text-dead-400">w-64 h-64</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-dead-400">
            The SVG scales perfectly at any size because the circle path is
            defined in a 100×100 viewBox. Just wrap the component in different
            Tailwind size classes.
          </p>
        </section>
      </div>
    </main>
  )
}