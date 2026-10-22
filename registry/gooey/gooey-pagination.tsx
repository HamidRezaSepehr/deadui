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
}

export function GooeyPagination({
  totalPages,
  currentPage,
  onPageChange,
  className,
  activeSize = 48,
  inactiveSize = 16,
  gap = 16,
  gooeyBlur = 8,
}: GooeyPaginationProps) {
  const reactId = useId()
  const safeId = reactId.replace(/:/g, "")
  const filterId = `gooey-pagination-filter-${safeId}`
  const activeLayoutId = `gooey-pagination-active-${safeId}`

  const transition = useMemo(
    () => ({
      duration: 0.5,
      type: "spring" as const,
      bounce: 0.3,
    }),
    []
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

              {/* The visual circle / number */}
              <motion.div
                className={cn(
                  "relative z-10 flex items-center justify-center rounded-full bg-dead-red transition-all",
                  isActive
                    ? "text-white font-bold"
                    : "text-white/70 hover:bg-dead-red/80"
                )}
                animate={{
                  width: size,
                  height: size,
                }}
                transition={transition}
              >
                {isActive && <span className="text-lg">{page}</span>}
              </motion.div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
