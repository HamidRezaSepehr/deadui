import { ReactiveDotGrid } from "@/components/ui/reactive-dot-grid"

export default function TestReactiveDotGridPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-8">
      <div className="grid gap-8 md:grid-cols-3 w-full max-w-6xl">
        
        {/* Example 1: Default Blue */}
        <ReactiveDotGrid className="h-64">
          <h3 className="text-xl font-bold mb-2">Magnetic Field</h3>
          <p className="text-sm opacity-70">Hover to see dots repel and glow.</p>
        </ReactiveDotGrid>

        {/* Example 2: Dense Green */}
        <ReactiveDotGrid 
          className="h-64"
          spacing={14}
          radius={80}
          colorActive="#22c55e"
          colorBase="rgba(34, 197, 94, 0.1)"
        >
          <h3 className="text-xl font-bold mb-2">Bio Scan</h3>
          <p className="text-sm opacity-70">Higher density grid with green accents.</p>
        </ReactiveDotGrid>

        {/* Example 3: Sparse Purple */}
        <ReactiveDotGrid 
          className="h-64"
          spacing={30}
          radius={150}
          colorActive="#a855f7"
          colorBase="rgba(168, 85, 247, 0.15)"
        >
          <h3 className="text-xl font-bold mb-2">Nebula Core</h3>
          <p className="text-sm opacity-70">Wider spread with strong purple glow.</p>
        </ReactiveDotGrid>

      </div>
    </main>
  )
}
