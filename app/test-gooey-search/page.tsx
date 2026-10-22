"use client";

import { GooeySearch } from "@/registry/gooey";

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
    <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dead-800 bg-dead-900/40">
      {children}
    </div>
  );
}

export default function GooeySearchTestPage() {
  return (
    <main className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50">
      <div className="mx-auto max-w-5xl space-y-20">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Gooey Search — QA</h1>
          <p className="max-w-2xl text-sm text-dead-400">
            A circular search button that detaches its icon in the chosen direction while an
            input expands the opposite way, the two staying connected by a liquid SVG goo
            filter. Four directions are shown below.
          </p>
        </header>

        {/* 01 — Right */}
        <section>
          <SectionLabel index="01" title="Right (default)" />
          <Stage>
            <GooeySearch direction="right" />
          </Stage>
          <p className="mt-3 text-sm text-dead-400">
            The icon travels right; the input expands to the left of the button.
          </p>
        </section>

        {/* 02 — Left */}
        <section>
          <SectionLabel index="02" title="Left" />
          <Stage>
            <GooeySearch direction="left" />
          </Stage>
          <p className="mt-3 text-sm text-dead-400">
            The icon travels left; the input expands to the right of the button.
          </p>
        </section>

        {/* 03 — Top */}
        <section>
          <SectionLabel index="03" title="Top" />
          <Stage>
            <GooeySearch direction="top" />
          </Stage>
          <p className="mt-3 text-sm text-dead-400">
            The icon travels up; the input expands below the button, centred.
          </p>
        </section>

        {/* 04 — Bottom */}
        <section>
          <SectionLabel index="04" title="Bottom" />
          <Stage>
            <GooeySearch direction="bottom" />
          </Stage>
          <p className="mt-3 text-sm text-dead-400">
            The icon travels down; the input expands above the button, centred.
          </p>
        </section>

        {/* 05 — onSearch callback */}
        <section>
          <SectionLabel index="05" title="onSearch Callback" />
          <Stage>
            <GooeySearch
              direction="right"
              placeholder="Type and press Enter…"
              onSearch={(v) => console.log("search:", v)}
            />
          </Stage>
          <p className="mt-3 text-sm text-dead-400">
            Pressing Enter fires <code className="text-dead-200">onSearch</code> with the current
            value; Escape closes and clears the input.
          </p>
        </section>
      </div>
    </main>
  );
}
