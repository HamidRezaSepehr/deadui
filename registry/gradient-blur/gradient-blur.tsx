'use client'

import React from "react"
import { cn } from "@/lib/utils"

const BLUR_VALUES_BOTTOM = [0.234375, 0.46875, 0.9375, 1.875, 3.75, 7.5, 15, 30]
const BLUR_VALUES_CENTER = [0.234375, 0.46875, 3.75, 30, 30, 3.75, 0.46875, 0.234375]
const STOPS = [0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100, 112.5, 125]
const STOPS_REVERSE = [-12.5, 0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100, 112.5]

export type GradientBlurVariant = "bottom-to-top" | "center-peak"
export type GradientBlurPosition = "fixed" | "absolute" | "sticky"
export type GradientBlurSide = "top" | "bottom"

export interface GradientBlurProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Blur profile: ramping up towards the edge, or peaking in the middle of the band. */
  variant?: GradientBlurVariant
  /** Positioning strategy applied to the root. Default: "fixed" */
  position?: GradientBlurPosition
  /** Which edge the blur fades from. Reverses the blur values and mask stops. Default: "bottom" */
  side?: GradientBlurSide
  /** Height of the blur band, e.g., "100px", "8rem". Default: "100px" */
  height?: string
  /** Tailwind z-index class, e.g., "z-50". Default: "z-50" */
  zIndex?: string
}

function getBlurValues(variant: GradientBlurVariant, reverse: boolean) {
  const values = variant === "center-peak" ? BLUR_VALUES_CENTER : BLUR_VALUES_BOTTOM
  return reverse ? [...values].reverse() : values
}

function getMask(i: number, reverse: boolean) {
  const stops = reverse ? STOPS_REVERSE : STOPS
  return `linear-gradient(rgba(0,0,0,0) ${stops[i]}%, rgb(0,0,0) ${stops[i + 1]}%, rgb(0,0,0) ${stops[i + 2]}%, rgba(0,0,0,0) ${stops[i + 3]}%)`
}

function GradientBlurLayers({ variant, reverse }: { variant: GradientBlurVariant; reverse: boolean }) {
  const blurValues = getBlurValues(variant, reverse)
  const layerStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  }

  return (
    <div className="absolute inset-0 bg-transparent">
      {blurValues.map((blur, i) => (
        <div
          key={i}
          style={{
            ...layerStyle,
            zIndex: i + 1,
            backdropFilter: `blur(${blur}px)`,
            WebkitBackdropFilter: `blur(${blur}px)`,
            maskImage: getMask(i, reverse),
            WebkitMaskImage: getMask(i, reverse),
          }}
        />
      ))}
    </div>
  )
}

export function GradientBlur({
  variant = "bottom-to-top",
  position = "fixed",
  side = "bottom",
  height = "100px",
  zIndex = "z-50",
  className,
  ...props
}: GradientBlurProps) {
  const reverse = side === "top"

  const positionClasses = {
    fixed: side === "top" ? "fixed top-0 left-0" : "fixed bottom-0 left-0",
    absolute: side === "top" ? "absolute top-0 left-0" : "absolute bottom-0 left-0",
    sticky: side === "top" ? "sticky top-0 left-0" : "sticky bottom-0 left-0",
  }

  return (
    <div
      className={cn(
        "w-full overflow-hidden pointer-events-none",
        positionClasses[position],
        zIndex,
        className
      )}
      style={{ height }}
      {...props}
    >
      <GradientBlurLayers variant={variant} reverse={reverse} />
    </div>
  )
}
