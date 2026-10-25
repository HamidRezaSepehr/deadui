"use client"

import { useState } from "react"
import { CursorTrail, type CursorTrailConfig } from "@/registry/cursor-trail"

const presets: Record<string, CursorTrailConfig[] | undefined> = {
  Default: undefined,
  "Single Cyan": [{ color: "cyan", length: 45, strokeWidth: 50 }],
  "Thin Fast": [
    {
      color: "#ffffff",
      length: 70,
      strokeWidth: 8,
      ease: 0.35,
    },
  ],
  Rainbow: [
    { color: "#ef4444", length: 28, strokeWidth: 42 },
    { color: "#f59e0b", length: 22, strokeWidth: 36 },
    { color: "#22c55e", length: 18, strokeWidth: 30 },
    { color: "#3b82f6", length: 14, strokeWidth: 24 },
    { color: "#a855f7", length: 10, strokeWidth: 18 },
  ],
  "Blend Screen": [
    {
      color: "#22d3ee",
      length: 35,
      strokeWidth: 55,
      blendMode: "screen",
    },
    {
      color: "#f472b6",
      length: 25,
      strokeWidth: 45,
      blendMode: "screen",
    },
  ],
}

export default function TestCursorTrailPage() {
  const [preset, setPreset] = useState<keyof typeof presets>("Default")
  const [enabled, setEnabled] = useState(true)

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white md:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Cursor Trail
          </h1>
          <p className="mt-4 max-w-2xl text-neutral-400">
            Move your pointer around. This component recreates the CodePen SVG
            cursor trail using pure React and requestAnimationFrame, with no
            GSAP dependency.
          </p>
        </header>

        <div className="mb-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setEnabled((value) => !value)}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
          >
            {enabled ? "Disable" : "Enable"} trail
          </button>

          {Object.keys(presets).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setPreset(name)}
              className={
                preset === name
                  ? "rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
                  : "rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
              }
            >
              {name}
            </button>
          ))}
        </div>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="min-h-[320px] rounded-3xl border border-white/10 bg-neutral-900 p-8">
            <h2 className="text-xl font-semibold">Interactive Area</h2>
            <p className="mt-3 text-neutral-400">
              The trail is fixed to the viewport and ignores pointer events, so
              buttons and links underneath remain clickable.
            </p>
          </div>

          <div className="min-h-[320px] rounded-3xl border border-white/10 bg-neutral-900 p-8">
            <h2 className="text-xl font-semibold">Current Preset</h2>
            <p className="mt-3 font-mono text-emerald-300">{preset}</p>
            <p className="mt-6 text-sm text-neutral-500">
              Selected preset:{" "}
              {presets[preset]
                ? `${presets[preset]?.length} trail config(s)`
                : "default CodePen preset"}
            </p>
          </div>
        </section>

        <div className="h-[80vh]" />

        <section className="rounded-3xl border border-white/10 bg-neutral-900 p-8">
          <h2 className="text-2xl font-semibold">Scroll Test</h2>
          <p className="mt-3 text-neutral-400">
            The trail uses viewport coordinates, so it remains correct while
            scrolling.
          </p>
        </section>
      </div>

      {enabled && <CursorTrail trails={presets[preset]} />}
    </main>
  )
}