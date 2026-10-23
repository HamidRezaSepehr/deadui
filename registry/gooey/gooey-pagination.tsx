"use client"
import React, { useId, useMemo, useCallback } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

function GooeyFilter({ filterId, blur }: { filterId: string; blur: number }) {
  return (
    <svg className="absolute hidden h-0 w-0" aria-hidden>
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  )
}

export interface GooeyPaginationProps {
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  className?: string
  activeSize?: number
  inactiveSize?: number
  gap?: number
  gooeyBlur?: number
  /** Animation speed multiplier. `1` is the default; higher snaps in faster. Default: 1 */
  speed?: number
}

export function GooeyPagination({
  totalPages,
  currentPage,
  onPageChange,
  className,
  activeSize = 48,
  inactiveSize = 20,
  gap = 16,
  gooeyBlur = 8,
  speed = 1,
}: GooeyPaginationProps) {
  const reactId = useId()
  const safeId = reactId.replace(/:/g, "")
  const filterId = `gooey-pagination-filter-${safeId}`
  const activeLayoutId = `gooey-pagination-active-${safeId}`

  const safeSpeed = Math.max(speed, 0.1)

  const transition = useMemo(
    () => ({
      duration: 0.5 / safeSpeed,
      type: "spring" as const,
      bounce: 0.3,
    }),
    [safeSpeed]
  )

  const handlePageClick = useCallback(
    (page: number) => {
      if (page !== currentPage) {
        onPageChange(page)
      }
    },
    [currentPage, onPageChange]
  )

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <GooeyFilter filterId={filterId} blur={gooeyBlur} />

      {/* Filtered layer: drives the gooey travel effect. */}
      <div
        className="relative flex items-center"
        style={{ filter: `url(#${filterId})`, gap: `${gap}px` }}
      >
        {pages.map((page) => {
          const isActive = page === currentPage
          const size = isActive ? activeSize : inactiveSize

          return (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className="relative flex items-center justify-center outline-none cursor-pointer"
              style={{ width: activeSize, height: activeSize }}
              aria-label={`Page ${page}`}
            >
              {/* The traveling active background with layoutId */}
              {isActive && (
                <motion.div
                  layoutId={activeLayoutId}
                  className="absolute inset-0 rounded-full bg-dead-red"
                  transition={transition}
                  style={{
                    width: activeSize,
                    height: activeSize,
                  }}
                />
              )}

              {/* Blurry dot (gooey source) */}
              <motion.div
                className="relative z-10 flex items-center justify-center rounded-full bg-dead-red"
                animate={{
                  width: size,
                  height: size,
                  opacity: isActive ? 1 : 0.6,
                }}
                transition={transition}
              />
            </button>
          )
        })}
      </div>

      {/* Crisp overlay: sharp, non-filtered dots on top. */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ gap: `${gap}px` }}
        aria-hidden
      >
        {pages.map((page) => {
          const isActive = page === currentPage
          const size = isActive ? activeSize : inactiveSize

          return (
            <div
              key={`crisp-${page}`}
              className="relative flex items-center justify-center"
              style={{ width: activeSize, height: activeSize }}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-full bg-dead-red transition-colors",
                  isActive ? "text-white font-bold" : "text-white/70"
                )}
                style={{
                  width: size,
                  height: size,
                  opacity: 1,
                }}
              >
                {isActive && <span className="text-lg">{page}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
