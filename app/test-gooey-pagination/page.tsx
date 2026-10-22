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
  const totalPages = 7;

  return (
    <main className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50">
      <div className="mx-auto max-w-5xl space-y-20">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Gooey Pagination — QA</h1>
          <p className="max-w-2xl text-sm text-dead-400">
            The active page is a large circle carrying its number; inactive pages are small
            dots. Clicking a page makes the active background travel and stretch across the
            intermediate dots, merged by the SVG gooey filter. Try jumping from page 1 to
            page 7 to see the travel.
          </p>
        </header>

        <section>
          <SectionLabel index="01" title="Default (7 pages)" />
          <div className="flex flex-col items-center gap-6 rounded-xl border border-dead-800 bg-dead-900/40 py-10">
            <GooeyPagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
            <p className="font-mono text-xs text-dead-400">
              Current page: {page} of {totalPages}
            </p>
          </div>
        </section>

        <section>
          <SectionLabel index="02" title="5 pages" />
          <div className="flex flex-col items-center gap-6 rounded-xl border border-dead-800 bg-dead-900/40 py-10">
            <GooeyPagination totalPages={5} currentPage={page > 5 ? 5 : page} onPageChange={setPage} />
          </div>
        </section>

        <section>
          <SectionLabel index="03" title="Jump controls" />
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-dead-800 bg-dead-900/40 py-10">
            <button
              type="button"
              onClick={() => setPage(1)}
              className="rounded-md border border-dead-800 bg-dead-900 px-3 py-1.5 font-mono text-xs text-dead-200 hover:bg-dead-800"
            >
              First
            </button>
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              className="rounded-md border border-dead-800 bg-dead-900 px-3 py-1.5 font-mono text-xs text-dead-200 hover:bg-dead-800"
            >
              Last
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-dead-800 bg-dead-900 px-3 py-1.5 font-mono text-xs text-dead-200 hover:bg-dead-800"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md border border-dead-800 bg-dead-900 px-3 py-1.5 font-mono text-xs text-dead-200 hover:bg-dead-800"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
