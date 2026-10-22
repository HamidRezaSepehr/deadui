"use client";

import { MorphingText } from "@/registry/morphing-text";

const WORDS = ["MORPH", "LIQUID", "GLOW", "DEAD"];

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
    <div className="flex items-center justify-center overflow-hidden rounded-xl border border-dead-800 bg-dead-900/40">
      {children}
    </div>
  );
}

export default function MorphingTextTestPage() {
  return (
    <main className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50">
      <div className="mx-auto max-w-5xl space-y-20">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Morphing Text — QA</h1>
          <p className="max-w-2xl text-sm text-dead-400">
            Two stacked layers cross-fade through an SVG{" "}
            <code className="text-dead-200">feColorMatrix</code> threshold filter, which is
            what turns a plain cross-fade into a liquid dissolve. The animation runs on{" "}
            <code className="text-dead-200">requestAnimationFrame</code> and writes straight to
            the DOM — React never re-renders while it plays.
          </p>
        </header>

        {/* 01 — Default */}
        <section>
          <SectionLabel index="01" title="Default" />
          <Stage>
            <MorphingText texts={WORDS} className="my-8 text-[3rem] md:text-[4rem]" />
          </Stage>
          <p className="mt-3 text-sm text-dead-400">
            <code className="text-dead-200">morphTime</code> 1.5s,{" "}
            <code className="text-dead-200">cooldownTime</code> 0.5s,{" "}
            <code className="text-dead-200">filterBlur</code> 0.6px,{" "}
            <code className="text-dead-200">threshold</code> -140. The words cycle in order and
            wrap around.
          </p>
        </section>

        {/* 02 — Fast */}
        <section>
          <SectionLabel index="02" title="Fast Morph" />
          <Stage>
            <MorphingText
              texts={["FAST", "SNAP", "SWAP", "ZAP"]}
              morphTime={0.5}
              cooldownTime={0.15}
              className="my-8 text-[3rem] md:text-[4rem]"
            />
          </Stage>
          <p className="mt-3 text-sm text-dead-400">
            A snappy 0.5s morph with a 0.15s hold. The transition is short enough that the
            threshold filter never fully dissolves the word — the liquid edge stays tight.
          </p>
        </section>

        {/* 03 — Slow */}
        <section>
          <SectionLabel index="03" title="Slow Morph" />
          <Stage>
            <MorphingText
              texts={["SLOW", "MELT", "POUR", "FLOW"]}
              morphTime={4}
              cooldownTime={1.5}
              className="my-8 text-[3rem] md:text-[4rem]"
            />
          </Stage>
          <p className="mt-3 text-sm text-dead-400">
            A 4s morph with a 1.5s cooldown. The blur has time to travel all the way out and
            back, so the word genuinely dissolves before it reforms.
          </p>
        </section>

        {/* 04 — Custom Blur & Threshold */}
        <section>
          <SectionLabel index="04" title="Custom Blur & Threshold" />
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                filterBlur 2px / threshold -40
              </div>
              <Stage>
                <MorphingText
                  texts={["SOFT", "EDGE", "GLOW", "HAZE"]}
                  filterBlur="2px"
                  threshold={-40}
                  className="my-8 text-[2.5rem] md:text-[3.25rem]"
                />
              </Stage>
              <p className="mt-3 text-sm text-dead-400">
                A high threshold barely clips the glyphs, so the words stay solid and the blur
                does the dissolving. A softer, more photographic look.
              </p>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                filterBlur 0.2px / threshold -220
              </div>
              <Stage>
                <MorphingText
                  texts={["HARD", "EDGE", "SHARP", "GLASS"]}
                  filterBlur="0.2px"
                  threshold={-220}
                  className="my-8 text-[2.5rem] md:text-[3.25rem]"
                />
              </Stage>
              <p className="mt-3 text-sm text-dead-400">
                A deep threshold eats most of the alpha away, so the words break apart into
                liquid fragments before they settle. This is the gooey look at its extreme.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
