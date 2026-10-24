"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { cn } from "@/lib/utils"

export interface MaskCursorProps {
  children: React.ReactNode
  baseColorClass?: string
  maskColorClass?: string
  bgClassName?: string
  textClassName?: string
  containerClassName?: string
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
  disabled?: boolean
}

export function MaskCursor({
  children,
  baseColorClass = "text-white",
  maskColorClass = "text-black",
  bgClassName = "bg-zinc-500",
  textClassName = "text-4xl md:text-6xl font-bold leading-tight",
  containerClassName = "",
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
  disabled = false,
}: MaskCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rectRef = useRef({ left: 0, top: 0 })
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sizeMV = useMotionValue(circleSize)
  const [isHovered, setIsHovered] = useState(false)
  const [ready, setReady] = useState(false)

  // Measure container offset; refresh on scroll/resize so the circle tracks
  // the cursor correctly no longer than the component's position on screen.
  useEffect(() => {
    if (disabled) return
    const measure = () => {
      const r = containerRef.current?.getBoundingClientRect()
      if (r) rectRef.current = { left: r.left, top: r.top }
    }
    const onMove = (e: MouseEvent) => {
      measure() // keep rect fresh cheaply; also marks ready on first move
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
  }, [disabled, mx, my])

  // Drive the circle size from hover state.
  useEffect(() => {
    sizeMV.set(isHovered ? hoverCircleSize : circleSize)
  }, [isHovered, circleSize, hoverCircleSize, sizeMV])

  // Springed cursor position (adjustable lag) + springed size (adjustable overshoot).
  const sx = useSpring(mx, { stiffness: positionStiffness, damping: positionDamping, mass: positionMass })
  const sy = useSpring(my, { stiffness: positionStiffness, damping: positionDamping, mass: positionMass })
  const ss = useSpring(sizeMV, { stiffness: sizeStiffness, damping: sizeDamping, mass: sizeMass })

  const maskPosition = useTransform([sx, sy, ss], (latest) => {
    const [x, y, s] = latest as number[]
    return `${x - s / 2}px ${y - s / 2}px`
  })
  const maskSize = useTransform(ss, (s) => `${s}px ${s}px`)

  const maskImage = useMemo(
    () => `radial-gradient(circle at center, #000 ${maskEdge}%, transparent ${maskEdge + maskFeather}%)`,
    [maskEdge, maskFeather],
  )

  // Cast to any so FM applies the MotionValue-bearing webkit mask keys at runtime
  // without TS complaining about non-standard style properties.
  const maskStyle = {
    maskImage,
    WebkitMaskImage: maskImage,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition,
    WebkitMaskPosition: maskPosition,
    maskSize,
    WebkitMaskSize: maskSize,
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
      <div className={cn("relative z-0", textClassName, baseColorClass)}>{children}</div>

      {/* Mask layer: identical text, different color, clipped to the cursor circle */}
      {showMask && (
        <motion.div
          aria-hidden
          className={cn("pointer-events-none absolute inset-0 z-10 select-none", textClassName, maskColorClass)}
          style={maskStyle}
        >
          {children}
        </motion.div>
      )}
    </div>
  )
}