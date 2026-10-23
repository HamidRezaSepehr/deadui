"use client";

import { MouseImageDistortion, type DistortionItem } from "@/registry/mouse-image-distortion";

const ITEMS: DistortionItem[] = [
  {
    id: "1",
    title: "Aurora",
    subtitle: "Light in the dark",
    imageUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80",
  },
  {
    id: "2",
    title: "Basalt",
    subtitle: "Stone and silence",
    imageUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
  },
  {
    id: "3",
    title: "Cinder",
    subtitle: "Ash and ember",
    imageUrl:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80",
  },
  {
    id: "4",
    title: "Dusk",
    subtitle: "Fading light",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  },
  {
    id: "5",
    title: "Ember",
    subtitle: "Glow in the night",
    imageUrl:
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&q=80",
  },
  {
    id: "6",
    title: "Fathom",
    subtitle: "Deep waters",
    imageUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
  },
];

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <span className="font-mono text-xs font-semibold tracking-widest text-dead-red">
        {index}
      </span>
      <h2 className="font-mono text-xs uppercase tracking-widest text-dead-400">{title}</h2>
    </div>
  );
}

export default function MouseImageDistortionTestPage() {
  return (
    <main className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50">
      <div className="mx-auto max-w-5xl space-y-20">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Mouse Image Distortion — QA</h1>
          <p className="max-w-2xl text-sm text-dead-400">
            Hover over any row. An image follows the cursor and warps (skews and
            scales) based on movement velocity. Move the cursor fast to see the
            liquid distortion, then slow down to let it settle.
          </p>
        </header>

        <section>
          <SectionLabel index="01" title="Default" />
          <div className="overflow-hidden rounded-xl border border-dead-800 bg-dead-900/40 p-6">
            <MouseImageDistortion items={ITEMS} />
          </div>
        </section>

        <section>
          <SectionLabel index="02" title="High Velocity Multiplier" />
          <div className="overflow-hidden rounded-xl border border-dead-800 bg-dead-900/40 p-6">
            <MouseImageDistortion items={ITEMS} velocityMultiplier={0.15} />
          </div>
          <p className="mt-3 text-sm text-dead-400">
            <code className="text-dead-200">velocityMultiplier</code> scales how much
            velocity affects skew and scale. Higher = more dramatic warp.
          </p>
        </section>

        <section>
          <SectionLabel index="03" title="Custom Size & Radius" />
          <div className="overflow-hidden rounded-xl border border-dead-800 bg-dead-900/40 p-6">
            <MouseImageDistortion
              items={ITEMS}
              imageWidth={200}
              imageHeight={140}
              imageBorderRadius="9999px"
            />
          </div>
          <p className="mt-3 text-sm text-dead-400">
            <code className="text-dead-200">imageWidth</code>,{" "}
            <code className="text-dead-200">imageHeight</code>, and{" "}
            <code className="text-dead-200">imageBorderRadius</code> control the
            floating image.
          </p>
        </section>

        <section>
          <SectionLabel index="04" title="Custom Text & Row Styling" />
          <div className="overflow-hidden rounded-xl border border-dead-800 bg-dead-900/40 p-6">
            <MouseImageDistortion
              items={ITEMS}
              textColor="text-dead-200"
              textSize="text-2xl"
              rowPadding="py-4"
              rowBorderColor="border-dead-800"
              rowHoverBgColor="bg-dead-800/60"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
