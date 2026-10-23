"use client";

import { PaintReveal } from "@/registry/paint-reveal";

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

function Stage({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-dead-800 ${className ?? ""}`}>
      {children}
    </div>
  );
}

export default function PaintRevealTestPage() {
  return (
    <main className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50">
      <div className="mx-auto max-w-5xl space-y-20">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Paint Reveal — QA</h1>
          <p className="max-w-2xl text-sm text-dead-400">
            Move your mouse (or drag on touch) over any panel to erase the overlay
            and reveal the content underneath. The overlay is a canvas filled with{" "}
            <code className="text-dead-200">overlayColor</code>; erasing uses{" "}
            <code className="text-dead-200">destination-out</code>.
          </p>
        </header>

        <section>
          <SectionLabel index="01" title="Large Heading" />
          <Stage className="h-[260px]">
            <PaintReveal overlayColor="#000000" brushSize={60}>
              <div className="flex h-[260px] items-center justify-center">
                <h2 className="text-6xl font-bold tracking-tight text-dead-50">
                  Reveal Me
                </h2>
              </div>
            </PaintReveal>
          </Stage>
        </section>

        <section>
          <SectionLabel index="02" title="Card Grid" />
          <Stage className="h-[320px]">
            <PaintReveal overlayColor="#0a0a0a" brushSize={40}>
              <div className="grid h-[320px] grid-cols-3 gap-4 p-6">
                {["Aurora", "Basalt", "Cinder", "Dusk", "Ember", "Fathom"].map((name) => (
                  <div
                    key={name}
                    className="flex items-center justify-center rounded-lg border border-dead-800 bg-dead-900 text-lg font-medium text-dead-200"
                  >
                    {name}
                  </div>
                ))}
              </div>
            </PaintReveal>
          </Stage>
        </section>

        <section>
          <SectionLabel index="03" title="Image Content" />
          <Stage className="h-[300px]">
            <PaintReveal overlayColor="#1a1a2e" brushSize={80}>
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
                alt="Mountain landscape at sunrise"
                className="h-[300px] w-full object-cover"
              />
            </PaintReveal>
          </Stage>
        </section>

        <section>
          <SectionLabel index="04" title="Brush Sizes" />
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                brush 20 — fine
              </div>
              <Stage className="h-[180px]">
                <PaintReveal overlayColor="#000000" brushSize={20}>
                  <div className="flex h-[180px] items-center justify-center text-2xl font-bold text-dead-50">
                    Fine
                  </div>
                </PaintReveal>
              </Stage>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                brush 40 — default
              </div>
              <Stage className="h-[180px]">
                <PaintReveal overlayColor="#000000" brushSize={40}>
                  <div className="flex h-[180px] items-center justify-center text-2xl font-bold text-dead-50">
                    Default
                  </div>
                </PaintReveal>
              </Stage>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                brush 90 — broad
              </div>
              <Stage className="h-[180px]">
                <PaintReveal overlayColor="#000000" brushSize={90}>
                  <div className="flex h-[180px] items-center justify-center text-2xl font-bold text-dead-50">
                    Broad
                  </div>
                </PaintReveal>
              </Stage>
            </div>
          </div>
        </section>

        <section>
          <SectionLabel index="05" title="Overlay Colors" />
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                black overlay
              </div>
              <Stage className="h-[180px]">
                <PaintReveal overlayColor="#000000" brushSize={50}>
                  <div className="flex h-[180px] items-center justify-center text-2xl font-bold text-dead-50">
                    Black
                  </div>
                </PaintReveal>
              </Stage>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                blue overlay
              </div>
              <Stage className="h-[180px]">
                <PaintReveal overlayColor="#1d4ed8" brushSize={50}>
                  <div className="flex h-[180px] items-center justify-center text-2xl font-bold text-dead-50">
                    Blue
                  </div>
                </PaintReveal>
              </Stage>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
