"use client";

import { useState } from "react";
import { GooeyRange } from "@/registry/gooey";

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

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dead-800 bg-dead-900/40 px-8 py-16">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

export default function GooeyRangeTestPage() {
  const [controlled, setControlled] = useState(35);

  return (
    <main className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50">
      <div className="mx-auto max-w-5xl space-y-20">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Gooey Range — QA</h1>
          <p className="max-w-2xl text-sm text-dead-400">
            Drag any thumb. The value bubble pops up and stays connected to the thumb by a
            liquid SVG goo bridge. The filter only thresholds alpha, so every track color
            below works with the same filter.
          </p>
        </header>

        {/* 01 — Default */}
        <section>
          <SectionLabel index="01" title="Default (0–100)" />
          <Stage>
            <GooeyRange defaultValue={50} />
          </Stage>
        </section>

        {/* 02 — Custom colors */}
        <section>
          <SectionLabel index="02" title="Custom Colors" />
          <div className="grid gap-10 lg:grid-cols-2">
            <Stage>
              <GooeyRange color="bg-[#0000ff]" defaultValue={40} />
            </Stage>
            <Stage>
              <GooeyRange color="bg-blue-400" defaultValue={55} />
            </Stage>
            <Stage>
              <GooeyRange color="bg-blue-600" defaultValue={70} />
            </Stage>
            <Stage>
              <GooeyRange color="bg-blue-800" defaultValue={25} />
            </Stage>
          </div>
          <p className="mt-3 text-sm text-dead-400">
            <code className="text-dead-200">color</code> takes any Tailwind{" "}
            <code className="text-dead-200">bg-*</code> class.
          </p>
        </section>

        {/* 03 — Custom sizes */}
        <section>
          <SectionLabel index="03" title="Custom Sizes" />
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                thumb 20
              </div>
              <Stage>
                <GooeyRange thumbSize={20} defaultValue={30} />
              </Stage>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                thumb 28 — default
              </div>
              <Stage>
                <GooeyRange thumbSize={28} defaultValue={50} />
              </Stage>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                thumb 40
              </div>
              <Stage>
                <GooeyRange thumbSize={40} defaultValue={70} />
              </Stage>
            </div>
          </div>
        </section>

        {/* 04 — Pop offset */}
        <section>
          <SectionLabel index="04" title="Pop Offset" />
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                pop 20 — subtle
              </div>
              <Stage>
                <GooeyRange popOffset={20} defaultValue={40} />
              </Stage>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                pop 38 — default
              </div>
              <Stage>
                <GooeyRange popOffset={38} defaultValue={55} />
              </Stage>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                pop 64 — high
              </div>
              <Stage>
                <GooeyRange popOffset={64} defaultValue={70} />
              </Stage>
            </div>
          </div>
          <p className="mt-3 text-sm text-dead-400">
            <code className="text-dead-200">popOffset</code> is how far the bubble rises while
            dragging.
          </p>
        </section>

        {/* 05 — Controlled */}
        <section>
          <SectionLabel index="05" title="Controlled" />
          <Stage>
            <GooeyRange
              value={controlled}
              onChange={setControlled}
              min={0}
              max={100}
              step={5}
              color="bg-blue-500"
            />
          </Stage>
          <p className="mt-3 text-sm text-dead-400">
            Controlled value:{" "}
            <span className="font-mono text-dead-200">{controlled}</span> — the parent owns
            the state and receives it through{" "}
            <code className="text-dead-200">onChange</code>.
          </p>
        </section>

        {/* 06 — Blur */}
        <section>
          <SectionLabel index="06" title="Gooey Blur" />
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                blur 4 — tight
              </div>
              <Stage>
                <GooeyRange gooeyBlur={4} defaultValue={40} />
              </Stage>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                blur 8 — default
              </div>
              <Stage>
                <GooeyRange gooeyBlur={8} defaultValue={55} />
              </Stage>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                blur 14 — stretchy
              </div>
              <Stage>
                <GooeyRange gooeyBlur={14} defaultValue={70} />
              </Stage>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
