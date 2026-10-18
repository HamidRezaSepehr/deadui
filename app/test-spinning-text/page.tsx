'use client'

import { Heart, Zap, Star, Command } from 'lucide-react'
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
            Text, icons, or images arranged in a perfect circle and rotated
            continuously. The component uses pure CSS transforms and
            Tailwind&apos;s built-in <code className="text-dead-200">@keyframes spin</code> —
            no JavaScript per frame.
          </p>
        </header>

        {/* 01 — Basic Text */}
        <section>
          <SectionLabel index="01" title="Basic Text" />
          <div className="flex items-center justify-center rounded-xl border border-dead-800 bg-dead-900/40">
            <SpinningText className="my-16" radius={120} duration={10}>
              {['DEAD', '•', 'UI', '•', 'ANIMATIONS', '•']}
            </SpinningText>
          </div>
          <p className="mt-3 text-sm text-dead-400">
            Simple words separated by dots. Each child is a plain string that sits
            at an equal angular distance on the circumference.
          </p>
        </section>

        {/* 02 — Mixed Media */}
        <section>
          <SectionLabel index="02" title="Mixed Media (Icons as Separators)" />
          <div className="flex items-center justify-center rounded-xl border border-dead-800 bg-dead-900/40">
            <SpinningText radius={140} duration={12}>
              {[
                <span key="a" className="text-lg font-bold">DEAD</span>,
                <Heart key="h1" size={16} className="text-dead-red" strokeWidth={2} />,
                <span key="b" className="text-lg font-bold">UI</span>,
                <Zap key="z" size={16} className="text-yellow-400" strokeWidth={2} />,
                <span key="c" className="text-lg font-bold">COMPONENTS</span>,
                <Star key="s" size={16} className="text-blue-400" strokeWidth={2} />,
              ]}
            </SpinningText>
          </div>
          <p className="mt-3 text-sm text-dead-400">
            Text segments alternate with icon elements from lucide-react as
            decorative separators. Any React node works — strings, icons, images.
          </p>
        </section>

        {/* 03 — Custom Center Content */}
        <section>
          <SectionLabel index="03" title="Custom Center Content" />
          <div className="flex items-center justify-center rounded-xl border border-dead-800 bg-dead-900/40">
            <SpinningText
              radius={130}
              duration={15}
              centerContent={
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-dead-red shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                  <Command size={24} className="text-white" strokeWidth={1.5} />
                </div>
              }
            >
              {['CREATE', '•', 'SHIP', '•', 'REPEAT', '•']}
            </SpinningText>
          </div>
          <p className="mt-3 text-sm text-dead-400">
            The default black center circle is replaced with a branded icon in a
            red glowing badge. The center content is a static React node that sits
            above the rotating ring.
          </p>
        </section>

        {/* 04 — Counter-Clockwise & Fast */}
        <section>
          <SectionLabel index="04" title="Counter-Clockwise & Fast" />
          <div className="flex items-center justify-center rounded-xl border border-dead-800 bg-dead-900/40">
            <SpinningText
              radius={120}
              duration={5}
              direction="counter-clockwise"
              centerContent={
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dead-red/60 bg-dead-950">
                  <span className="font-mono text-xs font-semibold text-dead-red">5s</span>
                </div>
              }
            >
              {['FAST', '•', 'REVERSE', '•', 'LOOP', '•']}
            </SpinningText>
          </div>
          <p className="mt-3 text-sm text-dead-400">
            A fast 5-second counter-clockwise rotation. The <code className="text-dead-200">direction</code> prop
            flips the spin direction; <code className="text-dead-200">duration</code> controls speed.
          </p>
        </section>
      </div>
    </main>
  )
}