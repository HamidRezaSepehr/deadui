"use client";

import { GooeyInput } from "@/registry/gooey";

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
    <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dead-800 bg-dead-900/40">
      {children}
    </div>
  );
}

export default function GooeyInputTestPage() {
  return (
    <main className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50">
      <div className="mx-auto max-w-5xl space-y-20">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Gooey Input — QA</h1>
          <p className="max-w-2xl text-sm text-dead-400">
            An expandable search input whose icon morphs between the trigger and a bubble via
            <code className="text-dead-200"> layoutId</code>, connected by a liquid SVG goo
            filter. Click the circle to expand.
          </p>
        </header>

        {/* 01 — Default */}
        <section>
          <SectionLabel index="01" title="Default (left)" />
          <Stage>
            <GooeyInput />
          </Stage>
        </section>

        {/* 02 — Direction right */}
        <section>
          <SectionLabel index="02" title="Direction: right" />
          <Stage>
            <GooeyInput direction="right" />
          </Stage>
          <p className="mt-3 text-sm text-dead-400">
            The icon morphs to a bubble on the right; the input expands to the left.
          </p>
        </section>

        {/* 03 — Custom widths */}
        <section>
          <SectionLabel index="03" title="Custom Widths" />
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                collapsedWidth 80 · expandedWidth 260
              </div>
              <Stage>
                <GooeyInput collapsedWidth={80} expandedWidth={260} />
              </Stage>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                collapsedWidth 140 · expandedWidth 180
              </div>
              <Stage>
                <GooeyInput collapsedWidth={140} expandedWidth={180} />
              </Stage>
            </div>
          </div>
        </section>

        {/* 04 — Custom gooeyBlur */}
        <section>
          <SectionLabel index="04" title="Custom Gooey Blur" />
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                gooeyBlur 2
              </div>
              <Stage>
                <GooeyInput gooeyBlur={2} />
              </Stage>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                gooeyBlur 12
              </div>
              <Stage>
                <GooeyInput gooeyBlur={12} />
              </Stage>
            </div>
          </div>
        </section>

        {/* 05 — Speed */}
        <section>
          <SectionLabel index="05" title="Speed" />
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                speed 0.5 — slow
              </div>
              <Stage>
                <GooeyInput speed={0.5} />
              </Stage>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                speed 1 — default
              </div>
              <Stage>
                <GooeyInput speed={1} />
              </Stage>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                speed 2.5 — fast
              </div>
              <Stage>
                <GooeyInput speed={2.5} />
              </Stage>
            </div>
          </div>
        </section>

        {/* 06 — Controlled value */}
        <section>
          <SectionLabel index="06" title="Controlled Value" />
          <Stage>
            <GooeyInput
              direction="right"
              placeholder="Search users…"
              onValueChange={(v) => console.log("value:", v)}
              onOpenChange={(o) => console.log("open:", o)}
            />
          </Stage>
          <p className="mt-3 text-sm text-dead-400">
            <code className="text-dead-200">value</code> / <code className="text-dead-200">defaultValue</code> /
            <code className="text-dead-200"> onValueChange</code> / <code className="text-dead-200">onOpenChange</code>{" "}
            support controlled usage.
          </p>
        </section>
      </div>
    </main>
  );
}
