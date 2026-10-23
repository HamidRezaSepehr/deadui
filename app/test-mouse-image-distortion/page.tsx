"use client";

import { MouseImageDistortion } from "@/registry/mouse-image-distortion";

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
            An image floats and warps as you move the mouse over the list — the velocity of the
            cursor drives the skew and scale of the image, recreating the liquid warp effect. Move
            the mouse across the rows.
          </p>
        </header>

        <section>
          <SectionLabel index="01" title="Rows + Floating Image" />
          <div className="rounded-xl border border-dead-800 bg-dead-900">
            <MouseImageDistortion
              imageSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
              imageWidth={200}
              imageHeight={270}
              imageBorderRadius={16}
              textColor="text-white"
              textSize={32}
              rowPadding={20}
              rowBorderColor="border-dead-800"
              rowHoverBgColor="hover:bg-dead-800"
              velocityMultiplier={1}
            />
          </div>
        </section>

        <section>
          <SectionLabel index="02" title="Rows + Custom Colors" />
          <div className="rounded-xl border border-dead-800 bg-dead-900">
            <MouseImageDistortion
              imageSrc="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1200&q=80"
              imageWidth={180}
              imageHeight={240}
              imageBorderRadius={20}
              textColor="text-dead-50"
              textSize={24}
              rowPadding={24}
              rowBorderColor="border-dead-700"
              rowHoverBgColor="hover:bg-dead-800"
              velocityMultiplier={1.5}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
