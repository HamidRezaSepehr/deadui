"use client"

import { MouseImageDistortion, type DistortionItem } from "@/registry/mouse-image-distortion"

const ITEMS: DistortionItem[] = [
  {
    id: "1",
    title: "Aurora",
    subtitle: "Light in the dark",
    imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80",
  },
  {
    id: "2",
    title: "Basalt",
    subtitle: "Stone and silence",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
  },
  {
    id: "3",
    title: "Cinder",
    subtitle: "Ash and ember",
    imageUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80",
  },
  {
    id: "4",
    title: "Dusk",
    subtitle: "Fading light",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  },
  {
    id: "5",
    title: "Ember",
    subtitle: "Glow in the night",
    imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&q=80",
  },
  {
    id: "6",
    title: "Fathom",
    subtitle: "Deep waters",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
  },
]

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

export default function MouseImageDistortionTestPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16 text-black">
      <div className="mx-auto max-w-5xl space-y-20">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Mouse Image Distortion — QA</h1>
          <p className="max-w-2xl text-sm text-gray-500">
            Hover over any row. An image follows the cursor and warps (vertex
            displacement) based on mouse velocity. The component uses
            <code className="text-black"> @react-three/fiber</code> and a custom
            GLSL shader. Use a light background for the
            <code className="text-black"> mix-blend-difference</code> text.
          </p>
        </header>

        {/* 01 — Default */}
        <section>
          <SectionLabel index="01" title="Default" />
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-6">
            <MouseImageDistortion items={ITEMS} />
          </div>
        </section>

        {/* 02 — Larger warp */}
        <section>
          <SectionLabel index="02" title="Strong Warp (amplitude 0.003)" />
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-6">
            <MouseImageDistortion items={ITEMS} amplitude={0.003} />
          </div>
          <p className="mt-3 text-sm text-gray-500">
            <code className="text-black">amplitude</code> controls the vertex
            displacement strength of the shader.
          </p>
        </section>

        {/* 03 — Snappier follow */}
        <section>
          <SectionLabel index="03" title="Snappy (smoothing 0.3)" />
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-6">
            <MouseImageDistortion items={ITEMS} smoothing={0.3} />
          </div>
          <p className="mt-3 text-sm text-gray-500">
            <code className="text-black">smoothing</code> changes the lerp factor
            (0–1). Higher values = snappier image follow.
          </p>
        </section>

        {/* 04 — Larger image */}
        <section>
          <SectionLabel index="04" title="Larger Image (scale 0.35)" />
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-6">
            <MouseImageDistortion items={ITEMS} scale={0.35} />
          </div>
          <p className="mt-3 text-sm text-gray-500">
            <code className="text-black">scale</code> sets the image size relative
            to the viewport (0–1).
          </p>
        </section>

        {/* 05 — Custom text styling */}
        <section>
          <SectionLabel index="05" title="Custom Text" />
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-6">
            <MouseImageDistortion
              items={ITEMS}
              textColor="text-gray-600"
              textSize="text-3xl font-light"
              rowPadding="py-4"
              rowBorderColor="border-gray-300"
            />
          </div>
        </section>
      </div>
    </main>
  )
}
