"use client"

import { Globe } from "@/registry/globe"

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

const NYC_MARKERS = [
  { location: [40.7128, -74.006] as [number, number], size: 0.08 },
]

const MULTI_MARKERS = [
  { location: [40.7128, -74.006] as [number, number], size: 0.08 },
  { location: [51.5074, -0.1278] as [number, number], size: 0.08 },
  { location: [35.6762, 139.6503] as [number, number], size: 0.08 },
]

export default function GlobeTestPage() {
  return (
    <main className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50">
      <div className="mx-auto max-w-5xl space-y-20">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Globe — QA</h1>
          <p className="max-w-2xl text-sm text-dead-400">
            A high-performance 3D globe powered by cobe WebGL. Fully configurable
            with markers, colors, rotation, and lighting controls.
          </p>
        </header>

        {/* 01 — Default Globe */}
        <section>
          <SectionLabel index="01" title="Default Globe" />
          <div className="flex items-center justify-center rounded-xl border border-dead-800 bg-dead-900/40 p-8">
            <div className="w-full max-w-sm">
              <Globe size={320} />
            </div>
          </div>
          <p className="mt-3 text-sm text-dead-400">
            Default configuration: 400px canvas, auto-rotation enabled, neutral
            colours. The globe renders at device pixel ratio for crisp Retina display.
          </p>
        </section>

        {/* 02 — Dark Mode Globe */}
        <section>
          <SectionLabel index="02" title="Dark Mode Globe" />
          <div className="flex items-center justify-center rounded-xl border border-dead-800 bg-dead-900/40 p-8">
            <div className="w-full max-w-sm">
              <Globe
                size={320}
                dark={1}
                baseColor={[1, 0.4, 0.8]}
                markerColor={[0.1, 1, 0.6]}
                glowColor={[0.8, 0.2, 1]}
                autoRotateSpeed={0.015}
              />
            </div>
          </div>
          <p className="mt-3 text-sm text-dead-400">
            Neon/cyberpunk aesthetic with <span className="font-mono text-xs text-dead-200">dark=1</span>,
            hot pink base, cyan markers, and purple glow. Faster rotation at{" "}
            <span className="font-mono text-xs text-dead-200">autoRotateSpeed=0.015</span>.
          </p>
        </section>

        {/* 03 — Globe with Markers */}
        <section>
          <SectionLabel index="03" title="Globe with Markers" />
          <div className="flex items-center justify-center rounded-xl border border-dead-800 bg-dead-900/40 p-8">
            <div className="w-full max-w-sm">
              <Globe
                size={320}
                markers={MULTI_MARKERS}
                baseColor={[0.1, 0.2, 0.5]}
                markerColor={[1, 0.3, 0.2]}
                glowColor={[0.5, 0.5, 1]}
                autoRotateSpeed={0.005}
              />
            </div>
          </div>
          <p className="mt-3 text-sm text-dead-400">
            Three city markers — New York, London, Tokyo — highlighted in red on a
            deep blue globe. Slow rotation at{" "}
            <span className="font-mono text-xs text-dead-200">autoRotateSpeed=0.005</span>.
          </p>
        </section>

        {/* 04 — Paused Globe */}
        <section>
          <SectionLabel index="04" title="Paused Globe" />
          <div className="flex items-center justify-center rounded-xl border border-dead-800 bg-dead-900/40 p-8">
            <div className="w-full max-w-sm">
              <Globe
                size={320}
                autoRotate={false}
                dark={0.5}
                baseColor={[0.2, 0.4, 0.2]}
                markerColor={[0.9, 0.7, 0.1]}
                glowColor={[0.9, 0.7, 0.1]}
                markers={NYC_MARKERS}
                phi={0.5}
                theta={0.3}
              />
            </div>
          </div>
          <p className="mt-3 text-sm text-dead-400">
            Static globe with <span className="font-mono text-xs text-dead-200">autoRotate=false</span>.
            Initial rotation set via <span className="font-mono text-xs text-dead-200">phi=0.5</span> and{" "}
            <span className="font-mono text-xs text-dead-200">theta=0.3</span>. Gold accent
            colour scheme with a New York marker.
          </p>
        </section>
      </div>
    </main>
  )
}
