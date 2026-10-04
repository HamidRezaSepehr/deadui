"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

function readHeadings(): TocEntry[] {
  const root = document.getElementById("docs-content");
  if (!root) return [];

  return Array.from(
    root.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]"),
  ).map((heading) => ({
    id: heading.id,
    text: heading.textContent ?? "",
    level: heading.tagName === "H2" ? 2 : 3,
  }));
}

/**
 * Right-hand, sticky Table of Contents.
 *
 * Built by scanning the rendered `h2` / `h3` nodes rather than from a build-time
 * `remark-toc` export: MDX pages can embed headings through components and the
 * DOM is the only place both sources are visible at once. The `id`s come from
 * the `rehype-slug` plugin configured in `next.config.ts`.
 */
export function TableOfContents() {
  const pathname = usePathname();
  const [entries, setEntries] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    // The scan is deferred by one frame so the heading ids are read after the
    // MDX body has been laid out, and so the state lands outside the commit
    // phase rather than as a cascading render inside it.
    const frame = requestAnimationFrame(() => {
      setEntries(readHeadings());
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (entries.length === 0) return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (observations) => {
        for (const observation of observations) {
          const id = observation.target.id;
          if (observation.isIntersecting) {
            visible.set(id, observation.intersectionRatio);
          } else {
            visible.delete(id);
          }
        }

        // First heading (in document order) currently on screen wins, so the
        // highlight never jumps backwards while scrolling up past a short
        // section.
        const firstVisible = entries.find((entry) => visible.has(entry.id));
        if (firstVisible) setActiveId(firstVisible.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    const nodes = Array.from(
      document.querySelectorAll<HTMLHeadingElement>("#docs-content h2[id], #docs-content h3[id]"),
    );
    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [entries]);

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[240px] shrink-0 overflow-y-auto py-8 pl-6 xl:block">
      <p className="font-mono text-[10px] uppercase tracking-widest text-dead-600">
        On this page
      </p>
      {entries.length > 0 ? (
        <ul className="mt-4 space-y-2 border-l border-dead-800">
          {entries.map((entry) => {
            const active = entry.id === activeId;

            return (
              <li key={entry.id}>
                <a
                  href={`#${entry.id}`}
                  aria-current={active ? "location" : undefined}
                  className={cn(
                    "-ml-px block border-l py-0.5 pl-4 text-sm transition-colors duration-200 ease-out",
                    entry.level === 3 && "pl-7 text-xs",
                    active
                      ? "border-dead-red font-medium text-dead-50"
                      : "border-transparent text-dead-400 hover:border-dead-700 hover:text-dead-50",
                  )}
                >
                  {entry.text}
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 text-xs text-dead-600">Nothing on this page yet.</p>
      )}
    </aside>
  );
}