"use client";

import { MouseImageDistortion, type DistortionItem } from "@/registry/mouse-image-distortion";

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

const LIST_A: DistortionItem[] = [
  {
    id: "1",
    title: "Richard Gaston",
    subtitle: "Photographer",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
  },
  {
    id: "2",
    title: "KangHee Kim",
    subtitle: "Artist",
    imageUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1200&q=80",
  },
  {
    id: "3",
    title: "Inka and Niclas",
    subtitle: "Design duo",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80",
  },
  {
    id: "4",
    title: "Arch McLeish",
    subtitle: "Architect",
    imageUrl: "https://images.unsplash.com/photo-1487958449943-8a6c3a1a4f5e?w=1200&q=80",
  },
  {
    id: "5",
    title: "Nadir Bucan",
    subtitle: "Creative director",
    imageUrl: "https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?w=1200&q=80",
  },
];

const LIST_B: DistortionItem[] = [
  {
    id: "1",
    title: "Chandler Bondurant",
    subtitle: "Illustrator",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=80",
  },
  {
    id: "2",
    title: "Arianna Lago",
    subtitle: "Photographer",
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=1200&q=80",
  },
  {
    id: "3",
    title: "Theodore Ames",
    subtitle: "Filmmaker",
    imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80",
  },
  {
    id: "4",
    title: "Sofia Marchetti",
    subtitle: "Artist",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&q=80",
  },
  {
    id: "5",
    title: "Jonas Lindqvist",
    subtitle: "Designer",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&q=80",
  },
];

export default function MouseImageDistortionTestPage() {
  return (
    <main className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50">
      <div className="mx-auto max-w-5xl space-y-20">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Mouse Image Distortion — QA</h1>
          <p className="max-w-2xl text-sm text-dead-400">
            An image floats and warps as you move the mouse over the list — the velocity of the
            cursor drives the sine-wave warp of the image via a Three.js GLSL vertex shader. Move
            the mouse across the rows.
          </p>
        </header>

        <section>
          <SectionLabel index="01" title="List A — default warp" />
          <div className="rounded-xl border border-dead-800 bg-dead-900">
            <MouseImageDistortion items={LIST_A} amplitude={0.0005} imageScale={0.225} />
          </div>
        </section>

        <section>
          <SectionLabel index="02" title="List B — tighter amplitude" />
          <div className="rounded-xl border border-dead-800 bg-dead-900">
            <MouseImageDistortion
              items={LIST_B}
              amplitude={0.001}
              imageScale={0.18}
              textSize="text-[3vw]"
              rowPadding="px-6"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
