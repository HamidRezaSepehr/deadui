"use client"

import React, { useRef, useEffect } from "react"
import createGlobe from "cobe"
import { cn } from "@/lib/utils"

export interface Marker {
  location: [number, number]
  size: number
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
  baseColor?: [number, number, number]
  markerColor?: [number, number, number]
  glowColor?: [number, number, number]
  markers?: Marker[]
  opacity?: number
  autoRotate?: boolean
  autoRotateSpeed?: number
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
  baseColor = [0.3, 0.3, 0.3],
  markerColor = [0.1, 0.8, 1],
  glowColor = [1, 1, 1],
  markers = [],
  opacity = 1,
  autoRotate = true,
  autoRotateSpeed = 0.01,
  ...props
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phiRef = useRef(phi)
  const thetaRef = useRef(theta)
  const autoRotateRef = useRef(autoRotate)
  const autoRotateSpeedRef = useRef(autoRotateSpeed)

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
    let globe: ReturnType<typeof createGlobe> | null = null
    let rafId: number | null = null

    if (canvasRef.current) {
      const dpr = window.devicePixelRatio || 1

      globe = createGlobe(canvasRef.current, {
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
      })

      const renderLoop = () => {
        if (autoRotateRef.current) {
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
    baseColor,
    markerColor,
    glowColor,
    markers,
    opacity,
  ])

  return (
    <canvas
      ref={canvasRef}
      className={cn("aspect-square w-full max-w-full", className)}
      style={{ width: size, height: size }}
      {...props}
    />
  )
}
