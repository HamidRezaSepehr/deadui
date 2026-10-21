"use client"

import React, { useRef, useEffect } from "react"
import createGlobe from "cobe"
import { cn } from "@/lib/utils"

export interface Marker {
  location: [number, number]
  size: number
  color?: [number, number, number]
  id?: string
}

export interface Arc {
  from: [number, number]
  to: [number, number]
  color?: [number, number, number]
  id?: string
}

export interface GlobeProps extends React.HTMLAttributes<HTMLCanvasElement> {
  className?: string
  size?: number
  phi?: number
  theta?: number
  dark?: number
  diffuse?: number
  mapSamples?: number
  mapBrightness?: number
  mapBaseBrightness?: number
  baseColor?: [number, number, number]
  markerColor?: [number, number, number]
  glowColor?: [number, number, number]
  markers?: Marker[]
  arcs?: Arc[]
  arcColor?: [number, number, number]
  arcWidth?: number
  arcHeight?: number
  markerElevation?: number
  opacity?: number
  scale?: number
  offset?: [number, number]
  autoRotate?: boolean
  autoRotateSpeed?: number
  draggable?: boolean
}

export function Globe({
  className,
  size = 400,
  phi = 0,
  theta = 0,
  dark = 0,
  diffuse = 1.2,
  mapSamples = 16000,
  mapBrightness = 6,
  mapBaseBrightness,
  baseColor = [0.3, 0.3, 0.3],
  markerColor = [0.1, 0.8, 1],
  glowColor = [1, 1, 1],
  markers = [],
  arcs = [],
  arcColor,
  arcWidth,
  arcHeight,
  markerElevation,
  opacity = 1,
  scale,
  offset,
  autoRotate = true,
  autoRotateSpeed = 0.01,
  draggable = false,
  ...props
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phiRef = useRef(phi)
  const thetaRef = useRef(theta)
  const autoRotateRef = useRef(autoRotate)
  const autoRotateSpeedRef = useRef(autoRotateSpeed)
  const draggingRef = useRef(false)
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null)
  const velocityRef = useRef({ phi: 0, theta: 0 })
  const draggableRef = useRef(draggable)

  useEffect(() => {
    phiRef.current = phi
    thetaRef.current = theta
  }, [phi, theta])

  useEffect(() => {
    autoRotateRef.current = autoRotate
  }, [autoRotate])

  useEffect(() => {
    autoRotateSpeedRef.current = autoRotateSpeed
  }, [autoRotateSpeed])

  useEffect(() => {
    draggableRef.current = draggable
  }, [draggable])

  useEffect(() => {
    let globe: ReturnType<typeof createGlobe> | null = null
    let rafId: number | null = null

    if (canvasRef.current) {
      const dpr = window.devicePixelRatio || 1

      const cobeOptions: Parameters<typeof createGlobe>[1] = {
        devicePixelRatio: dpr,
        width: size * dpr,
        height: size * dpr,
        phi: phiRef.current,
        theta: thetaRef.current,
        dark,
        diffuse,
        mapSamples,
        mapBrightness,
        baseColor,
        markerColor,
        glowColor,
        markers,
        opacity,
      }

      if (mapBaseBrightness !== undefined) {
        cobeOptions.mapBaseBrightness = mapBaseBrightness
      }
      if (arcs.length > 0) {
        cobeOptions.arcs = arcs
        if (arcColor) cobeOptions.arcColor = arcColor
        if (arcWidth !== undefined) cobeOptions.arcWidth = arcWidth
        if (arcHeight !== undefined) cobeOptions.arcHeight = arcHeight
      }
      if (markerElevation !== undefined) {
        cobeOptions.markerElevation = markerElevation
      }
      if (scale !== undefined) {
        cobeOptions.scale = scale
      }
      if (offset !== undefined) {
        cobeOptions.offset = offset
      }

      globe = createGlobe(canvasRef.current, cobeOptions)

      const renderLoop = () => {
        if (draggableRef.current && !draggingRef.current) {
          const decay = 0.95
          const minVelocity = 0.0001
          velocityRef.current.phi *= decay
          velocityRef.current.theta *= decay

          if (Math.abs(velocityRef.current.phi) > minVelocity) {
            phiRef.current += velocityRef.current.phi
          }
          if (Math.abs(velocityRef.current.theta) > minVelocity) {
            thetaRef.current += velocityRef.current.theta
            thetaRef.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, thetaRef.current))
          }

          if (Math.abs(velocityRef.current.phi) <= minVelocity && Math.abs(velocityRef.current.theta) <= minVelocity) {
            if (autoRotateRef.current) {
              phiRef.current += autoRotateSpeedRef.current
            }
          }
        } else if (autoRotateRef.current && !draggingRef.current) {
          phiRef.current += autoRotateSpeedRef.current
        }

        globe?.update({
          phi: phiRef.current,
          theta: thetaRef.current,
        })
        rafId = requestAnimationFrame(renderLoop)
      }

      rafId = requestAnimationFrame(renderLoop)
    }

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      if (globe) {
        globe.destroy()
      }
    }
  }, [
    size,
    dark,
    diffuse,
    mapSamples,
    mapBrightness,
    mapBaseBrightness,
    baseColor,
    markerColor,
    glowColor,
    markers,
    opacity,
    arcs,
    arcColor,
    arcWidth,
    arcHeight,
    markerElevation,
    scale,
    offset,
  ])

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggableRef.current) return
    draggingRef.current = true
    lastPointerRef.current = { x: e.clientX, y: e.clientY }
    velocityRef.current = { phi: 0, theta: 0 }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggableRef.current || !draggingRef.current || !lastPointerRef.current) return
    const dx = e.clientX - lastPointerRef.current.x
    const dy = e.clientY - lastPointerRef.current.y
    const sensitivity = 0.005
    velocityRef.current = {
      phi: dx * sensitivity,
      theta: dy * sensitivity,
    }
    phiRef.current += dx * sensitivity
    thetaRef.current += dy * sensitivity
    thetaRef.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, thetaRef.current))
    lastPointerRef.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = () => {
    draggingRef.current = false
    lastPointerRef.current = null
  }

  return (
    <canvas
      ref={canvasRef}
      className={cn("aspect-square w-full max-w-full select-none touch-none", className)}
      style={{ width: size, height: size }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      {...props}
    />
  )
}
