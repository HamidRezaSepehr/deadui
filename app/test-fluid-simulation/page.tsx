import { FluidSimulation } from "@/registry/fluid-simulation"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-dead-950 text-dead-50">
      <header className="flex w-full max-w-4xl flex-col items-center gap-6 px-8 pt-24 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-dead-400">
          Feature 55 — Pro Component
        </p>
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
          Fluid Simulation
        </h1>
        <p className="max-w-2xl font-mono text-sm leading-relaxed text-dead-400">
          A real-time WebGL fluid dynamics simulation with mouse interaction, velocity advection,
          and density rendering. Move your mouse to interact with the fluid, scroll to adjust
          parameters, and toggle between different visualization modes.
        </p>
      </header>

      <section className="mt-16 w-full max-w-4xl px-8">
        <p className="mb-6 font-mono text-sm leading-relaxed text-dead-400">
          01. DEFAULT — the base fluid simulation with mouse interaction, velocity advection,
          and density rendering via GLSL shaders.
        </p>
        <div className="rounded-xl border border-dead-800 bg-dead-900 p-6">
          <FluidSimulation variant="default" />
        </div>
      </section>

      <section className="mt-20 w-full max-w-4xl px-8">
        <p className="mb-6 font-mono text-sm leading-relaxed text-dead-400">
          02. PARTICLE — renders particles advected by the fluid flow with a trailing
          effect, visualising the velocity field.
        </p>
        <div className="rounded-xl border border-dead-800 bg-dead-900 p-6">
          <FluidSimulation variant="particle" />
        </div>
      </section>

      <section className="mt-20 w-full max-w-4xl px-8">
        <p className="mb-6 font-mono text-sm leading-relaxed text-dead-400">
          03. BORDER — displays only the fluid boundary/edge detection, highlighting the
          contour of the active simulation domain.
        </p>
        <div className="rounded-xl border border-dead-800 bg-dead-900 p-6">
          <FluidSimulation variant="border" />
        </div>
      </section>

      <section className="mt-24 w-full max-w-4xl px-8">
        <p className="mb-6 font-mono text-sm leading-relaxed text-dead-400">
          Controls: Move mouse to apply force, scroll up/down to increase/decrease
          viscosity, press space to reset the simulation.
        </p>
      </section>
    </div>
  )
}