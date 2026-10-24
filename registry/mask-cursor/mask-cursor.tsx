"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { cn } from "@/lib/utils"

const DEFAULT_MASK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="black"/></svg>'

const DEFAULT_MASK_IMAGE = `url("data:image/svg+xml,${encodeURIComponent(
  DEFAULT_MASK_SVG,
)}")`

export interface MaskCursorProps {
  children: React.ReactNode

  containerClassName?: string
  baseClassName?: string
  maskClassName?: string
  contentClassName?: string

  baseColor?: string
  maskColor?: string
  maskBackground?: string
  maskImage?: string

  circleSize?: number
  hoverCircleSize?: number

  expandOnHotspot?: boolean
  hotspotSelector?: string

  positionStiffness?: number
  positionDamping?: number
  positionMass?: number

  sizeStiffness?: number
  sizeDamping?: number
  sizeMass?: number

  disabled?: boolean
}

export function MaskCursor({
  children,
  containerClassName,
  baseClassName,
  maskClassName,
  contentClassName =
    "w-full max-w-[1000px] p-10 text-center text-[32px] leading-[1.1] md:text-[56px] md:leading-[1.05]",
  baseColor = "#ffffff",
  maskColor = "#000000",
  maskBackground = "transparent",
  maskImage,
  circleSize = 40,
  hoverCircleSize = 400,
  expandOnHotspot = true,
  hotspotSelector = "[data-mask-hotspot]",
  positionStiffness = 120,
  positionDamping = 20,
  positionMass = 0.4,
  sizeStiffness = 120,
  sizeDamping = 14,
  sizeMass = 1,
  disabled = false,
}: MaskCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rectRef = useRef({ left: 0, top: 0 })
  const clientRef = useRef({ x: 0, y: 0 })

  const [isActive, setIsActive] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const rawSize = useMotionValue(0)

  const springX = useSpring(rawX, {
    stiffness: positionStiffness,
    damping: positionDamping,
    mass: positionMass,
  })

  const springY = useSpring(rawY, {
    stiffness: positionStiffness,
    damping: positionDamping,
    mass: positionMass,
  })

  const springSize = useSpring(rawSize, {
    stiffness: sizeStiffness,
    damping: sizeDamping,
    mass: sizeMass,
  })

  const maskPosition = useTransform(
    [springX, springY, springSize],
    (latest) => {
      const [x, y, size] = latest as number[]
      return `${x - size / 2}px ${y - size / 2}px`
    },
  )

  const maskSize = useTransform(springSize, (size) => `${size}px ${size}px`)

  const targetSize = isActive
    ? expandOnHotspot && isExpanded
      ? hoverCircleSize
      : circleSize
    : 0

  const syncPointer = useCallback(() => {
    rawX.set(clientRef.current.x - rectRef.current.left)
    rawY.set(clientRef.current.y - rectRef.current.top)
  }, [rawX, rawY])

  const measure = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    rectRef.current = {
      left: rect.left,
      top: rect.top,
    }

    syncPointer()
  }, [syncPointer])

  useEffect(() => {
    measure()

    const handleResize = () => measure()
    const handleScroll = () => measure()

    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll, {
      passive: true,
      capture: true,
    })

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll, {
        passive: true,
        capture: true,
      } as EventListenerOptions)
    }
  }, [measure])

  useEffect(() => {
    rawSize.set(targetSize)
  }, [targetSize, rawSize])

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return

    clientRef.current = {
      x: event.clientX,
      y: event.clientY,
    }

    measure()
    setIsActive(true)
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !isActive) return

    clientRef.current = {
      x: event.clientX,
      y: event.clientY,
    }

    syncPointer()
  }

  const handleMouseLeave = () => {
    if (disabled) return

    setIsActive(false)
    setIsExpanded(false)
  }

  const isHotspotTarget = useCallback(
    (node: EventTarget | null) => {
      if (!(node instanceof HTMLElement)) return false
      return Boolean(node.closest(hotspotSelector))
    },
    [hotspotSelector],
  )

  const handleMouseOver = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !expandOnHotspot) return

    if (isHotspotTarget(event.target)) {
      setIsExpanded(true)
    }
  }

  const handleMouseOut = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !expandOnHotspot) return

    const target = event.target as HTMLElement
    const hotspot = target.closest(hotspotSelector)
    const related = event.relatedTarget as HTMLElement | null

    if (hotspot && (!related || !hotspot.contains(related))) {
      setIsExpanded(false)
    }
  }

  const resolvedMaskImage = maskImage ?? DEFAULT_MASK_IMAGE

  if (disabled) {
    return (
      <div
        ref={containerRef}
        className={cn("relative isolate w-full overflow-hidden grid", containerClassName)}
        style={{ gridTemplateAreas: '"layer"', gridTemplateRows: '1fr', gridTemplateColumns: '1fr' }}
      >
        <div
          className={cn(
            "relative z-0 flex w-full items-center justify-center",
            baseClassName,
          )}
          style={{ color: baseColor, gridArea: 'layer' }}
        >
          <div className={contentClassName}>{children}</div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative isolate w-full overflow-hidden grid", containerClassName)}
      style={{ gridTemplateAreas: '"layer"', gridTemplateRows: '1fr', gridTemplateColumns: '1fr' }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      {/* Base layer */}
      <div
        className={cn(
          "relative z-0 flex w-full items-center justify-center",
          baseClassName,
        )}
        style={{ color: baseColor, gridArea: 'layer' }}
      >
        <div className={contentClassName}>{children}</div>
      </div>

      {/* Mask overlay layer */}
      <motion.div
        aria-hidden="true"
        inert
        className={cn(
          "pointer-events-none z-10 flex w-full items-center justify-center select-none",
          maskClassName,
        )}
        style={
          {
            gridArea: 'layer',
            color: maskColor,
            background: maskBackground,
            maskImage: resolvedMaskImage,
            WebkitMaskImage: resolvedMaskImage,
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition,
            WebkitMaskPosition: maskPosition,
            maskSize,
            WebkitMaskSize: maskSize,
            willChange: "mask-position, mask-size",
          } as any
        }
      >
        <div className={contentClassName}>{children}</div>
      </motion.div>
    </div>
  )
}