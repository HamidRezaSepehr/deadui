import { FluidSimulation } from "@/components/ui/fluid-simulation"

export default function TestFluidPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative h-[50vh] border-b border-white/10">
        <div className="absolute left-4 top-4 z-10 rounded bg-black/50 px-3 py-1 text-xs font-mono backdrop-blur">
          Standard Config
        </div>
        <FluidSimulation className="h-full w-full" />
      </section>

      <section className="relative h-[50vh] border-b border-white/10">
        <div className="absolute left-4 top-4 z-10 rounded bg-black/50 px-3 py-1 text-xs font-mono backdrop-blur">
          High Turbulence (Curl: 50, Force: 8000)
        </div>
        <FluidSimulation
          className="h-full w-full"
          config={{ CURL: 50, SPLAT_FORCE: 8000 }}
        />
      </section>

      <section className="relative h-[50vh]">
        <div className="absolute left-4 top-4 z-10 rounded bg-black/50 px-3 py-1 text-xs font-mono backdrop-blur">
          Soft Smoke (Low Res, High Dissipation)
        </div>
        <FluidSimulation
          className="h-full w-full"
          config={{
            SIM_RESOLUTION: 64,
            DYE_RESOLUTION: 512,
            DENSITY_DISSIPATION: 2.5,
            VELOCITY_DISSIPATION: 1.0,
          }}
        />
      </section>
    </main>
  )
}
