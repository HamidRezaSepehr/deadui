'use client'

import { Zap, Heart, Star, Command, Sun, Moon, Smile, Sparkles } from 'lucide-react'
import { Dock, DockIcon } from '@/registry/dock'

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <span className="font-mono text-xs font-semibold tracking-widest text-dead-red">{index}</span>
      <h2 className="font-mono text-xs uppercase tracking-widest text-dead-400">{title}</h2>
    </div>
  )
}

export default function TestDockPage() {
  return (
    <main className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50">
      <div className="mx-auto max-w-5xl space-y-24">

        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Dock — QA</h1>
          <p className="max-w-2xl text-sm text-dead-400">
            A macOS-style magnifying dock. Icons scale up smoothly based on
            cursor proximity using Framer Motion spring physics.
          </p>
        </header>

        {/* 01 — Default Dock */}
        <section>
          <SectionLabel index="01" title="Default Dock" />
          <Dock>
            <DockIcon>
              <Zap size={24} className="text-dead-50" />
            </DockIcon>
            <DockIcon>
              <Heart size={24} className="text-dead-red" />
            </DockIcon>
            <DockIcon>
              <Star size={24} className="text-dead-200" />
            </DockIcon>
            <DockIcon>
              <Command size={24} className="text-dead-400" />
            </DockIcon>
            <DockIcon>
              <Sun size={24} className="text-dead-300" />
            </DockIcon>
            <DockIcon>
              <Moon size={24} className="text-dead-400" />
            </DockIcon>
          </Dock>
          <p className="mt-3 text-sm text-dead-400">
            Standard 40px icons magnifying to 60px within a 140px distance.
            Move your mouse across the dock to feel the spring physics.
          </p>
        </section>

        <div className="h-[10vh]" />

        {/* 02 — Disabled Magnification */}
        <section>
          <SectionLabel index="02" title="Disabled Magnification" />
          <Dock disableMagnification>
            <DockIcon>
              <Smile size={24} className="text-dead-50" />
            </DockIcon>
            <DockIcon>
              <Sparkles size={24} className="text-dead-200" />
            </DockIcon>
            <DockIcon>
              <Zap size={24} className="text-dead-300" />
            </DockIcon>
            <DockIcon>
              <Heart size={24} className="text-dead-red" />
            </DockIcon>
            <DockIcon>
              <Star size={24} className="text-dead-400" />
            </DockIcon>
          </Dock>
          <p className="mt-3 text-sm text-dead-400">
            With <code className="text-dead-200">disableMagnification=&quot;true&quot;</code>,
            the spring effect is turned off and icons stay at their base size.
            A simple hover state is applied instead.
          </p>
        </section>

        <div className="h-[10vh]" />

        {/* 03 — Extreme Magnification */}
        <section>
          <SectionLabel index="03" title="Extreme Magnification" />
          <Dock iconMagnification={120} iconDistance={300}>
            <DockIcon>
              <Sun size={24} className="text-dead-300" />
            </DockIcon>
            <DockIcon>
              <Moon size={24} className="text-dead-400" />
            </DockIcon>
            <DockIcon>
              <Star size={24} className="text-dead-200" />
            </DockIcon>
            <DockIcon>
              <Zap size={24} className="text-dead-50" />
            </DockIcon>
            <DockIcon>
              <Command size={24} className="text-dead-400" />
            </DockIcon>
            <DockIcon>
              <Heart size={24} className="text-dead-red" />
            </DockIcon>
          </Dock>
          <p className="mt-3 text-sm text-dead-400">
            High <code className="text-dead-200">iconMagnification</code> (120px)
            with a wide <code className="text-dead-200">iconDistance</code> (300px)
            for a dramatic magnifying effect that reaches far across the dock.
          </p>
        </section>

        <div className="h-[10vh]" />

        {/* 04 — Different Directions */}
        <section>
          <SectionLabel index="04" title="Different Directions" />
          <p className="mb-6 text-sm text-dead-400">
            Three docks with <code className="text-dead-200">direction=&quot;top&quot;</code>,
            <code className="text-dead-200">&quot;middle&quot;</code>, and
            <code className="text-dead-200">&quot;bottom&quot;</code>:
          </p>
          <div className="flex flex-col items-center gap-6">
            <p className="font-mono text-xs text-dead-400 uppercase tracking-widest">top</p>
            <Dock direction="top">
              <DockIcon>
                <Zap size={24} className="text-dead-50" />
              </DockIcon>
              <DockIcon>
                <Heart size={24} className="text-dead-red" />
              </DockIcon>
              <DockIcon>
                <Star size={24} className="text-dead-200" />
              </DockIcon>
            </Dock>

            <p className="font-mono text-xs text-dead-400 uppercase tracking-widest">middle</p>
            <Dock direction="middle">
              <DockIcon>
                <Zap size={24} className="text-dead-50" />
              </DockIcon>
              <DockIcon>
                <Heart size={24} className="text-dead-red" />
              </DockIcon>
              <DockIcon>
                <Star size={24} className="text-dead-200" />
              </DockIcon>
            </Dock>

            <p className="font-mono text-xs text-dead-400 uppercase tracking-widest">bottom</p>
            <Dock direction="bottom">
              <DockIcon>
                <Zap size={24} className="text-dead-50" />
              </DockIcon>
              <DockIcon>
                <Heart size={24} className="text-dead-red" />
              </DockIcon>
              <DockIcon>
                <Star size={24} className="text-dead-200" />
              </DockIcon>
            </Dock>
          </div>
          <p className="mt-3 text-sm text-dead-400">
            The <code className="text-dead-200">direction</code> prop controls
            icon alignment within the dock: <code className="text-dead-200">top</code>
            (items-start), <code className="text-dead-200">middle</code> (items-center),
            and <code className="text-dead-200">bottom</code> (items-end).
          </p>
        </section>

      </div>
    </main>
  )
}