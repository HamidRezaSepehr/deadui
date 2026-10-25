"use client"

import { useState } from "react"
import { DrawingCursor } from "@/registry/drawing-cursor"

const Card = ({
  title,
  desc,
  children,
}: {
  title: string
  desc: string
  children: React.ReactNode
}) => (
  <div className="relative h-[320px] overflow-hidden rounded-3xl border border-white/10 bg-neutral-900">
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="max-w-sm text-sm text-neutral-400">{desc}</p>
      <button
        type="button"
        className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-200"
      >
        Click me (cursor never blocks me)
      </button>
    </div>
    {children}
  </div>
)

export default function TestDrawingCursorPage() {
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white md:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Drawing Cursor
            </h1>
            <p className="mt-3 max-w-2xl text-neutral-400">
              Spring + friction trail rendered as a tapering Bézier stroke.
              Hover inside each card. Toggle the global mode below.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFullscreen((v) => !v)}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
          >
            {fullscreen ? "Disable" : "Enable"} fullscreen cursor
          </button>
        </header>

        {fullscreen && (
          <DrawingCursor
            fit="viewport"
            color="#ffffff"
            widthFactor={0.35}
          />
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Default" desc="40 points, white, idle intro motion on.">
            <DrawingCursor fit="parent" color="#ffffff" />
          </Card>

          <Card
            title="Gradient tail"
            desc="Head-to-tail color interpolation via colorTail."
          >
            <DrawingCursor
              fit="parent"
              color="#34d399"
              colorTail="#6366f1"
              widthFactor={0.4}
            />
          </Card>

          <Card
            title="Thin & fast"
            desc="Fewer points, higher spring, lower friction."
          >
            <DrawingCursor
              fit="parent"
              color="#fbbf24"
              pointsNumber={20}
              spring={0.6}
              friction={0.35}
              widthFactor={0.18}
              idleMotion={false}
            />
          </Card>

          <Card
            title="Thick & dreamy"
            desc="Many points, low spring, high friction, slow lag."
          >
            <DrawingCursor
              fit="parent"
              color="#f472b6"
              pointsNumber={70}
              spring={0.25}
              friction={0.62}
              widthFactor={0.5}
              headSpringFactor={0.25}
            />
          </Card>

          <Card
            title="Resume idle after 1.5s"
            desc="Returns to Lissajous motion when the pointer rests."
          >
            <DrawingCursor
              fit="parent"
              color="#38bdf8"
              resumeIdleAfterMs={1500}
              widthFactor={0.3}
            />
          </Card>

          <Card
            title="No idle / crisp off"
            desc="Idle disabled and DPR scaling off (soft, retro look)."
          >
            <DrawingCursor
              fit="parent"
              color="#a3e635"
              idleMotion={false}
              respectDevicePixelRatio={false}
              widthFactor={0.45}
            />
          </Card>
        </div>

        <div className="h-[60vh]" />
        <section className="mx-auto max-w-3xl">
          <Card
            title="Scroll tracking"
            desc="Far down the page — parent coords must stay correct after scroll."
          >
            <DrawingCursor fit="parent" color="#ffffff" widthFactor={0.35} />
          </Card>
        </section>
      </div>
    </main>
  )
}