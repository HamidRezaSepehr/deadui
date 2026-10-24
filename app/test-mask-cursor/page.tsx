import { MaskCursor } from "@/registry/mask-cursor"

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col gap-16 py-24">
      {/* Example 1: faithful to the original demo (white <-> black on mid-gray) */}
      <MaskCursor
        bgClassName="bg-zinc-500"
        baseColorClass="text-white"
        maskColorClass="text-black"
        containerClassName="px-8 py-12"
      >
        <p>A visual designer — with skills that haven&apos;t been replaced by A.I (yet).</p>
      </MaskCursor>

      {/* Example 2: dark-theme friendly + customized sizing/lag/softness to prove configurability */}
      <MaskCursor
        bgClassName="bg-black"
        baseColorClass="text-white"
        maskColorClass="text-emerald-400"
        circleSize={24}
        hoverCircleSize={520}
        positionStiffness={90}
        positionDamping={16}
        sizeDamping={11}
        maskEdge={48}
        maskFeather={6}
        textClassName="text-5xl md:text-7xl font-black leading-none tracking-tight"
        containerClassName="px-8 py-16"
      >
        <p>Selectively skilled product designer.</p>
      </MaskCursor>
    </main>
  )
}