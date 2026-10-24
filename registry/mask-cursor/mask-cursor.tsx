"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { cn } from "@/lib/utils"

export interface MaskCursorProps {
  children: React.ReactNode
  baseTextClassName?: string
  maskTextClassName?: string
  bgClassName?: string
  textClassName?: string
  containerClassName?: string
  baseLayerClassName?: string
  maskLayerClassName?: string
  contentClassName?: string
  circleSize?: number
  hoverCircleSize?: number
  positionStiffness?: number
  positionDamping?: number
  positionMass?: number
  sizeStiffness?: number
  sizeDamping?: number
  sizeMass?: number
  maskEdge?: number
  maskFeather?: number
  maskImage?: string
  maskBackgroundColor?: string
  transition?: { type: string; ease: string; duration: number }
  disabled?: boolean
}

const defaultMaskSvg =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="white"/></svg>`
  )

const defaultMaskImage = `url("${defaultMaskSvg}")`

const defaultTransition = {
  type: "tween",
  ease: "backOut",
  duration: 0.5,
} satisfies { type: string; ease: string; duration: number }

export function MaskCursor({
  children,
  baseTextClassName = "text-white",
  maskTextClassName = "text-black",
  bgClassName = "bg-zinc-500",
  textClassName = "text-4xl md:text-6xl font-bold leading-tight",
  containerClassName = "",
  baseLayerClassName = "relative z-0 flex min-h-[50vh] w-full items-center justify-center",
  maskLayerClassName = "pointer-events-none absolute inset-0 z-10 flex min-h-[50vh] w-full items-center justify-center select-none",
  contentClassName = "w-full max-w-[1000px] p-10 text-center text-[64px] leading-[66px] cursor-default",
  circleSize = 40,
  hoverCircleSize = 400,
  positionStiffness = 120,
  positionDamping = 20,
  positionMass = 0.4,
  sizeStiffness = 120,
  sizeDamping = 14,
  sizeMass = 1,
  maskEdge = 50,
  maskFeather = 0,
  maskImage: maskImageProp = defaultMaskImage,
  maskBackgroundColor = "transparent",
  transition = defaultTransition,
  disabled = false,
}: MaskCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rectRef = useRef({ left: 0, top: 0 })
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sizeMV = useMotionValue(circleSize)
  const [isHovered, setIsHovered] = useState(false)
  const [ready, setReady] = useState(false)

  // Measure container offset; refresh on scroll/resize.
  useEffect(() => {
    if (disabled) return
    const measure = () => {
      const r = containerRef.current?.getBoundingClientRect()
      if (r) rectRef.current = { left: r.left, top: r.top }
    }
    const onMove = (e: MouseEvent) => {
      measure()
      mx.set(e.clientX - rectRef.current.left)
      my.set(e.clientY - rectRef.current.top)
      setReady((prev) => (prev ? prev : true))
    }
    measure()
    window.addEventListener("mousemove", onMove)
    window.addEventListener("scroll", measure, { passive: true })
    window.addEventListener("resize", measure)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("scroll", measure)
      window.removeEventListener("resize", measure)
    }
  }, [disabled, mx, my, isHovered, circleSize, hoverCircleSize])

  // Drive size from hover state using the original backOut transition.
  useEffect(() => {
    sizeMV.set(isHovered ? hoverCircleSize : circleSize)
  }, [isHovered, circleSize, hoverCircleSize, sizeMV])

  // Springed cursor position (adjustable lag) + springed size (overshoot).
  const sx = useSpring(mx, { stiffness: positionStiffness, damping: positionDamping, mass: positionMass })
  const sy = useSpring(my, { stiffness: positionStiffness, damping: positionDamping, mass: positionMass })
  const ss = useSpring(sizeMV, { stiffness: sizeStiffness, damping: sizeDamping, mass: sizeMass })

  const maskPosition = useTransform([sx, sy, ss], (latest) => {
    const [x, y, s] = latest as number[]
    return `${x - s / 2}px ${y - s / 2}px`
  })
  const maskSize = useTransform(ss, (s) => `${s}px ${s}px`)

  const maskImage = useMemo(
    () => maskImageProp,
    [maskImageProp],
  )

  const maskStyle = {
    backgroundColor: maskBackgroundColor,
    maskImage,
    WebkitMaskImage: maskImage,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition,
    WebkitMaskPosition: maskPosition,
    maskSize,
    WebkitMaskSize: maskSize,
    willChange: "mask-position, mask-size",
  } as any

  const showMask = !disabled && ready

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
      className={cn("relative isolate w-full overflow-hidden", bgClassName, containerClassName)}
    >
      {/* Base layer: in normal flow, defines size */}
      <div className={cn(baseLayerClassName, baseTextClassName)}>
        <div className={contentClassName}>{children}</div>
      </div>

      {/* Mask overlay layer: identical text, different color, clipped to cursor circle */}
      {showMask && (
        <motion.div
          aria-hidden
          className={cn(maskLayerClassName, maskTextClassName)}
          style={maskStyle}
        >
          <div className={contentClassName}>{children}</div>
        </motion.div>
      )}
    </div>
  )
}