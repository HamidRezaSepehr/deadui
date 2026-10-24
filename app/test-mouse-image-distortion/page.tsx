import { MouseImageDistortion } from "@/registry/mouse-image-distortion"

const ITEMS = [
  { title: "Richard Gaston", subtitle: "Creative Direction", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80" },
  { title: "KangHee Kim", subtitle: "Photography", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80" },
  { title: "Inka & Niclas", subtitle: "Art Direction", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80" },
  { title: "Arch McLeish", subtitle: "Motion", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&q=80" },
  { title: "Nadir Bucan", subtitle: "Editing", imageUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&q=80" },
]

const ITEMS_B = [
  { title: "Chandler Bondurant", subtitle: "Sound", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80&sat=-100" },
  { title: "Mona Lawson", subtitle: "Visual Design", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80&sat=-50" },
  { title: "Theo Akintola", subtitle: "Animation", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80" },
]

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-2 flex items-baseline gap-3">
      <span className="font-mono text-xs font-semibold tracking-widest text-dead-red">
        {index}
      </span>
      <span className="font-mono text-xs uppercase tracking-widest text-dead-400">
        {title}
      </span>
    </div>
  )
}

export default function Page() {
  return (
    <main className="min-h-screen space-y-8">
      {/* 01 — Default */}
      <section>
        <SectionLabel index="01" title="Default" />
        <MouseImageDistortion items={ITEMS} />
      </section>

      {/* 02 — Strong warp, fast smoothing */}
      <section>
        <SectionLabel index="02" title="Strong warp + fast smoothing" />
        <MouseImageDistortion
          items={ITEMS}
          amplitude={0.002}
          smoothingFactor={0.3}
          textColor="text-dead-100"
          rowBorder="border-t border-dead-800"
        />
      </section>

      {/* 03 — Subtle, slow fade, smaller image */}
      <section>
        <SectionLabel index="03" title="Subtle warp, slow fade, smaller image" />
        <MouseImageDistortion
          items={ITEMS}
          amplitude={0.0002}
          imageScale={0.12}
          fadeDuration={0.8}
          smoothingFactor={0.05}
          rowPadding="p-4"
          rowBorder="border-t border-dead-red/30"
        />
      </section>

      {/* 04 — High-res geometry, large image */}
      <section>
        <SectionLabel index="04" title="High-res geometry, large image" />
        <MouseImageDistortion
          items={ITEMS}
          geometrySegments={30}
          imageScale={0.35}
          textSize="text-[3vw]"
          rowPadding="p-6"
          rowBorder="border-t border-white/10"
        />
      </section>

      {/* 05 — Light background, different blend */}
      <section>
        <SectionLabel index="05" title="Light background, text-styling overrides" />
        <MouseImageDistortion
          items={ITEMS_B}
          amplitude={0.0008}
          textSize="text-[5vw]"
          textColor="text-dead-100"
          rowPadding="p-5"
          rowBorder="border-t border-dead-800/50"
          bgClassName="bg-dead-950"
          subtitleClassName="text-xs opacity-80 tracking-wide"
          textFont="serif"
        />
      </section>

      {/* 06 — Minimal rows, no borders */}
      <section>
        <SectionLabel index="06" title="Minimal, no borders, tighter spacing" />
        <MouseImageDistortion
          items={ITEMS.slice(0, 3)}
          rowPadding="p-3"
          rowBorder="border-0"
          textSize="text-[4vw]"
          textColor="text-dead-400"
          bgClassName="bg-dead-900"
          subtitleClassName="text-xs text-dead-500 tracking-wider"
        />
      </section>
    </main>
  )
}