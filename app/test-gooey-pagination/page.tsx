"use client";

import { useState } from "react";
import { GooeyPagination } from "@/registry/gooey";

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

export default function GooeyPaginationTestPage() {
  const [page, setPage] = useState(1);

  return (
    <main className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50">
      <div className="mx-auto max-w-5xl space-y-20">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Gooey Pagination — QA</h1>
          <p className="max-w-2xl text-sm text-dead-400">
            Click from page 1 to page 6 to watch the active background stretch and morph
            through every intermediate circle. Current page:{" "}
            <span className="font-mono text-dead-200">{page}</span>.
          </p>
        </header>

        {/* 01 — Default */}
        <section>
          <SectionLabel index="01" title="Default (6 pages)" />
          <div className="flex items-center justify-center overflow-hidden rounded-xl border border-dead-800 bg-dead-900/40 py-10">
            <GooeyPagination totalPages={6} currentPage={page} onPageChange={setPage} />
          </div>
        </section>

        {/* 02 — Jump to extremes */}
        <section>
          <SectionLabel index="02" title="Jump Controls" />
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[1, 2, 3, 4, 5, 6].map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="rounded-md border border-dead-800 bg-dead-900 px-3 py-1.5 font-mono text-xs text-dead-200 hover:bg-dead-800"
              >
                Go to {p}
              </button>
            ))}
          </div>
        </section>

        {/* 03 — Custom sizes */}
        <section>
          <SectionLabel index="03" title="Custom Sizes" />
          <div className="flex items-center justify-center overflow-hidden rounded-xl border border-dead-800 bg-dead-900/40 py-10">
            <GooeyPagination
              totalPages={5}
              currentPage={page > 5 ? 5 : page}
              onPageChange={setPage}
              activeSize={64}
              inactiveSize={32}
              gap={20}
              gooeyBlur={12}
            />
          </div>
        </section>

        {/* 04 — Gap */}
        <section>
          <SectionLabel index="04" title="Gap" />
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                gap 8 — tight
              </div>
              <div className="flex items-center justify-center overflow-hidden rounded-xl border border-dead-800 bg-dead-900/40 py-10">
                <GooeyPagination totalPages={6} currentPage={page} onPageChange={setPage} gap={8} activeSize={40} inactiveSize={20} />
              </div>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                gap 16 — default
              </div>
              <div className="flex items-center justify-center overflow-hidden rounded-xl border border-dead-800 bg-dead-900/40 py-10">
                <GooeyPagination totalPages={6} currentPage={page} onPageChange={setPage} gap={16} activeSize={40} inactiveSize={20} />
              </div>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                gap 32 — spread
              </div>
              <div className="flex items-center justify-center overflow-hidden rounded-xl border border-dead-800 bg-dead-900/40 py-10">
                <GooeyPagination totalPages={6} currentPage={page} onPageChange={setPage} gap={32} activeSize={40} inactiveSize={20} />
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-dead-400">
            <code className="text-dead-200">gap</code> sets the spacing in pixels between consecutive items.
          </p>
        </section>

        {/* 05 — Speed */}
        <section>
          <SectionLabel index="05" title="Speed" />
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                speed 0.5 — slow
              </div>
              <div className="flex items-center justify-center overflow-hidden rounded-xl border border-dead-800 bg-dead-900/40 py-10">
                <GooeyPagination totalPages={6} currentPage={page} onPageChange={setPage} speed={0.5} activeSize={40} inactiveSize={24} gap={12} />
              </div>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                speed 1 — default
              </div>
              <div className="flex items-center justify-center overflow-hidden rounded-xl border border-dead-800 bg-dead-900/40 py-10">
                <GooeyPagination totalPages={6} currentPage={page} onPageChange={setPage} speed={1} activeSize={40} inactiveSize={24} gap={12} />
              </div>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                speed 2.5 — fast
              </div>
              <div className="flex items-center justify-center overflow-hidden rounded-xl border border-dead-800 bg-dead-900/40 py-10">
                <GooeyPagination totalPages={6} currentPage={page} onPageChange={setPage} speed={2.5} activeSize={40} inactiveSize={24} gap={12} />
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-dead-400">
            <code className="text-dead-200">speed</code> scales the spring duration (0.5s / speed).
          </p>
        </section>
      </div>
    </main>
  );
}
