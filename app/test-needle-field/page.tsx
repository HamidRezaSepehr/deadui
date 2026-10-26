import { NeedleField } from "@/components/ui/needle-field"

export default function TestNeedleFieldPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* Example 1: Default */}
      <section className="relative h-[50vh] border-b border-white/10">
        <NeedleField className="h-full w-full">
          <h1 className="text-4xl font-bold">Magnetic Field</h1>
        </NeedleField>
      </section>

      {/* Example 2: Dense Monochrome */}
      <section className="relative h-[50vh] border-b border-white/10 bg-black">
        <NeedleField 
          className="h-full w-full"
          spacing={14}
          lengthRatio={0.5}
          colorBase="#444444"
          colorHighlight="#ffffff"
        >
          <p className="text-lg opacity-70">Move your mouse</p>
        </NeedleField>
      </section>

      {/* Example 3: Wide Vibrant */}
      <section className="relative h-[50vh] bg-indigo-950">
        <NeedleField 
          className="h-full w-full"
          spacing={40}
          lengthRatio={0.9}
          radius={300}
          colorBase="#6b21a8"
          colorHighlight="#f472b6"
        >
          <h2 className="text-3xl font-extrabold tracking-tighter">Vibrant Flow</h2>
        </NeedleField>
      </section>
    </main>
  )
}
