'use client'

import { FluidSimulation } from '@/registry/fluid-simulation'

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <span className="font-mono text-xs font-semibold tracking-widest text-dead-red">
        {index}
      </span>
      <h2 className="font-mono text-xs uppercase tracking-widest text-dead-400">
        {title}
      </h2>
    </div>
  )
}

export default function TestFluidPage() {
  return (
    <main className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50">
      <div className="mx-auto max-w-5xl space-y-20">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Fluid Simulation — QA</h1>
          <p className="max-w-2xl text-sm text-dead-400">
            A GPU-powered fluid simulation rendered to a canvas using WebGL. The
            {' '}<span className="font-mono text-xs text-dead-200">config</span>{' '}
            prop exposes turbulence, resolution, dissipation, and colour
            parameters — every value has a sensible default, so a bare{' '}
            <span className="font-mono text-xs text-dead-200">FluidSimulation</span>
            {' '}just works.
          </p>
        </header>

        <section>
          <SectionLabel index="01" title="Standard Config" />
          <div className="relative flex h-[400px] items-center justify-center overflow-hidden rounded-xl border border-dead-800 bg-dead-900/40">
            <FluidSimulation className="h-full w-full" />
          </div>
          <p className="mt-3 text-sm text-dead-400">
            The default configuration with balanced resolution and dissipation.
            The fluid responds to mouse or touch drag — move your cursor across the
            surface to inject colour and velocity.
          </p>
        </section>

        <section>
          <SectionLabel index="02" title="High Turbulence" />
          <div className="relative flex h-[400px] items-center justify-center overflow-hidden rounded-xl border border-dead-800 bg-dead-900/40">
            <FluidSimulation
              className="h-full w-full"
              config={{ CURL: 50, SPLAT_FORCE: 8000 }}
            />
          </div>
          <p className="mt-3 text-sm text-dead-400">
            Cranked curl (<span className="font-mono text-xs text-dead-200">CURL: 50</span>)
            and splat force (<span className="font-mono text-xs text-dead-200">SPLAT_FORCE: 8000</span>)
            produce aggressive whorls and sharp colour bursts. Only the overridden
            values are passed; the rest fall through to defaults.
          </p>
        </section>

        <section>
          <SectionLabel index="03" title="Soft Smoke" />
<div className="relative flex h-[400px] items-center justify-center overflow-hidden rounded-xl border border-dead-800 bg-dead-900/40">
            <FluidSimulation
              className="h-full w-full"
              config={{
                SIM_RESOLUTION: 64,
                DYE_RESOLUTION: 512,
                DENSITY_DISSIPATION: 2.5,
                VELOCITY_DISSIPATION: 1.0,
              }}
            />
          </div>
          <p className="mt-3 text-sm text-dead-400">
            A lower simulation resolution (<span className="font-mono text-xs text-dead-200">SIM_RESOLUTION: 64</span>)
            and higher dissipation create a diffuse, smoky look with gentler movement.
            Ideal for atmospheric backgrounds.
          </p>
        </section>

        <footer className="border-t border-dead-800 pt-8 text-sm text-dead-400">
          <p className="font-mono text-xs uppercase tracking-widest text-dead-500">Notes</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>
              The simulation runs entirely on the GPU via WebGL — no CPU particle
              loops, so battery impact is minimal after the initial buffer setup.
            </li>
            <li>
              The canvas responds to pointer and touch events. Under{' '}
              <span className="font-mono text-xs text-dead-200">prefers-reduced-motion</span>
              the simulation renders one static frame and pauses.
            </li>
            <li>
              The <span className="font-mono text-xs text-dead-200">config</span> object
              is merged shallowly with defaults — you only need to provide the values
              you want to customise.
            </li>
          </ul>
        </footer>
      </div>
    </main>
  )
}