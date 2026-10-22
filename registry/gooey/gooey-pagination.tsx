"use client";

import { useId } from "react";
import { motion, LayoutGroup } from "motion/react";
import { cn } from "@/lib/utils";

export interface GooeyPaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Gooey Pagination.
 *
 * Inactive pages are small dots; the active page is a large circle carrying its
 * number. The active background is a single `motion.div` shared across every
 * button through `layoutId`, so when the page changes Framer Motion animates it
 * from one button to the next — stretching across the intermediate dots into a
 * liquid bridge. The whole row sits behind an SVG gooey filter that merges the
 * stretching background with the dots.
 */
export function GooeyPagination({
  totalPages,
  currentPage,
  onPageChange,
  className,
}: GooeyPaginationProps) {
  const filterId = `gooey-filter-pagination-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg className="absolute h-0 w-0 pointer-events-none" aria-hidden="true" focusable="false">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      <LayoutGroup>
        <div
          className="relative flex items-center gap-4 p-2"
          style={{ filter: `url(#${filterId})` }}
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const isActive = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-current={isActive ? "page" : undefined}
                aria-label={`Page ${page}`}
                className="relative flex h-12 w-12 items-center justify-center outline-none cursor-pointer"
              >
                {isActive && (
                  <motion.div
                    layoutId="gooey-pagination-active"
                    className="absolute inset-0 rounded-full bg-dead-red"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <div
                  className={cn(
                    "relative z-10 flex items-center justify-center rounded-full transition-all duration-300",
                    isActive
                      ? "h-12 w-12 text-white font-bold text-lg"
                      : "h-4 w-4 bg-dead-red/50 hover:bg-dead-red/80"
                  )}
                >
                  {isActive && <span>{page}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}
