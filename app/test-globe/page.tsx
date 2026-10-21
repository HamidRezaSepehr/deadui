"use client"

import { useEffect, useRef, useCallback } from "react"
import createGlobe from "cobe"

function GlobeDemo() {
  const markers = [
    { id: "sf", location: [37.7595, -122.4367] as [number, number], label: "San Francisco" },
    { id: "nyc", location: [40.7128, -74.006] as [number, number], label: "New York" },
    { id: "tokyo", location: [35.6762, 139.6503] as [number, number], label: "Tokyo" },
    { id: "london", location: [51.5074, -0.1278] as [number, number], label: "London" },
    { id: "sydney", location: [-33.8688, 151.2093] as [number, number], label: "Sydney" },
    { id: "capetown", location: [-33.9249, 18.4241] as [number, number], label: "Cape Town" },
    { id: "dubai", location: [25.2048, 55.2708] as [number, number], label: "Dubai" },
    { id: "paris", location: [48.8566, 2.3522] as [number, number], label: "Paris" },
    { id: "saopaulo", location: [-23.5505, -46.6333] as [number, number], label: "São Paulo" },
  ]

  const arcs = [
    {
      id: "sf-tokyo",
      from: [37.7595, -122.4367] as [number, number],
      to: [35.6762, 139.6503] as [number, number],
      label: "SF → Tokyo",
    },
    {
      id: "nyc-london",
      from: [40.7128, -74.006] as [number, number],
      to: [51.5074, -0.1278] as [number, number],
      label: "NYC → London",
    },
  ]

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-2xl border border-dead-800 bg-dead-50 p-4">
        <GlobeDemoCanvas markers={markers} arcs={arcs} />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-3xl font-black tracking-tighter text-dead-900/5">COBE</span>
        </div>
      </div>
      <div className="space-y-2 text-center">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-widest text-dead-400">
          Interactive Globe
        </h3>
        <p className="text-xs text-dead-500">
          Drag to rotate • Markers & arcs
        </p>
      </div>
    </div>
  )
}

function GlobeDemoCanvas({
  markers,
  arcs,
}: {
  markers: { id: string; location: [number, number]; label: string }[]
  arcs: { id: string; from: [number, number]; to: [number, number]; label: string }[]
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.2,
        dark: 0,
        diffuse: 1.5,
        mapSamples: 16000,
        mapBrightness: 10,
        baseColor: [1, 1, 1],
        markerColor: [0.3, 0.45, 0.85],
        glowColor: [0.94, 0.93, 0.91],
        markerElevation: 0.01,
        markers: markers.map((m) => ({
          location: m.location,
          size: 0.025,
          id: m.id,
        })),
        arcs: arcs.map((a) => ({
          from: a.from,
          to: a.to,
          id: a.id,
        })),
        arcColor: [0.3, 0.45, 0.85],
        arcWidth: 0.5,
        arcHeight: 0.25,
      })

      function animate() {
        if (!isPausedRef.current) phi += 0.005
        globe!.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        })
        animationId = requestAnimationFrame(animate)
      }
      animate()
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, arcs])

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      className="h-full w-full cursor-grab rounded-full"
      style={{ touchAction: "none" }}
    />
  )
}

function GlobePolaroids() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)
  const speed = 0.003

  const markers = [
    {
      id: "polaroid-sf",
      location: [37.78, -122.44] as [number, number],
      image: "https://cdn.21st.dev/assets/mirror/c6/c6d80a573edd25cbf4156d5fa5ac1a92f3464d868610a66e42b6f2504ad20754.jpg",
      caption: "San Francisco",
      rotate: -5,
    },
    {
      id: "polaroid-nyc",
      location: [40.71, -74.01] as [number, number],
      image: "https://cdn.21st.dev/assets/mirror/df/dfb431480f9ad523c4d95d687e3ad9ab26527f92390df4e29f05e1d18d593915.jpg",
      caption: "New York",
      rotate: 4,
    },
    {
      id: "polaroid-tokyo",
      location: [35.68, 139.65] as [number, number],
      image: "https://cdn.21st.dev/assets/mirror/34/34ae66f2d60a75fff0dde6adb9e8bce7b7794c0013feec4db1bce28fb58aaacf.jpg",
      caption: "Tokyo",
      rotate: -3,
    },
    {
      id: "polaroid-sydney",
      location: [-33.87, 151.21] as [number, number],
      image: "https://cdn.21st.dev/assets/mirror/88/88b7dfb3a21786d682f68d5fea837cb3dc85344ade84f54c416b83353fabffce.jpg",
      caption: "Sydney",
      rotate: 6,
    },
    {
      id: "polaroid-paris",
      location: [48.86, 2.35] as [number, number],
      image: "https://cdn.21st.dev/assets/mirror/70/7068d8f556e9c004940e37c9af3712a1bb2e2d659db000344d6b1d422dfaa994.jpg",
      caption: "Paris",
      rotate: -4,
    },
    {
      id: "polaroid-london",
      location: [51.51, -0.13] as [number, number],
      image: "https://cdn.21st.dev/assets/mirror/22/227d573eee27dd0ee533cf260d68c6269d9c232c1def19ce5213de8d32cee45f.jpg",
      caption: "London",
      rotate: 3,
    },
  ]

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.2,
        dark: 0,
        diffuse: 1.5,
        mapSamples: 16000,
        mapBrightness: 9,
        baseColor: [1, 1, 1],
        markerColor: [0.4, 0.6, 0.9],
        glowColor: [0.94, 0.93, 0.91],
        markerElevation: 0,
        markers: markers.map((m) => ({ location: m.location, size: 0.02, id: m.id })),
        arcs: [],
        arcColor: [0.5, 0.7, 1],
        arcWidth: 0.5,
        arcHeight: 0.25,
        opacity: 0.7,
      })

      function animate() {
        if (!isPausedRef.current) phi += speed
        globe!.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        })
        animationId = requestAnimationFrame(animate)
      }
      animate()
      setTimeout(() => canvas && (canvas.style.opacity = "1"))
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, speed])

  return (
    <div className="max-w-md mx-auto">
      <div className="relative aspect-square select-none">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          className="h-full w-full cursor-grab rounded-full"
          style={{
            opacity: 0,
            transition: "opacity 1.2s ease",
            touchAction: "none",
          }}
        />
      {markers.map((m) => (
        <div
          key={m.id}
          style={{
            position: "absolute",
            positionAnchor: `--cobe-${m.id}`,
            bottom: "anchor(top)",
            left: "anchor(center)",
            translate: "-50% 0",
            marginBottom: 8,
            background: "#fff",
            padding: "6px 6px 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)",
            transform: `rotate(${m.rotate}deg)`,
            pointerEvents: "none",
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
            transition: "opacity 0.3s, filter 0.3s",
          }}
        >
          <img
            src={m.image}
            alt={m.caption}
            className="block"
            style={{ width: 60, height: 60, objectFit: "cover" }}
          />
          <span
            style={{
              position: "absolute",
              bottom: 5,
              left: 0,
              right: 0,
              textAlign: "center",
              fontFamily: "system-ui, sans-serif",
              fontSize: "0.5rem",
              color: "#333",
              letterSpacing: "0.02em",
            }}
          >
            {m.caption}
          </span>
        </div>
      ))}
      </div>
    </div>
  )
}

function GlobeFlights() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)
  const speed = 0.002

  const markers = [
    { id: "flight-sf", location: [37.78, -122.44] as [number, number], label: "San Francisco" },
    { id: "flight-nyc", location: [40.71, -74.01] as [number, number], label: "New York" },
    { id: "flight-tokyo", location: [35.68, 139.65] as [number, number], label: "Tokyo" },
    { id: "flight-london", location: [51.51, -0.13] as [number, number], label: "London" },
    { id: "flight-sydney", location: [-33.87, 151.21] as [number, number], label: "Sydney" },
    { id: "flight-dubai", location: [25.2, 55.27] as [number, number], label: "Dubai" },
    { id: "flight-paris", location: [48.86, 2.35] as [number, number], label: "Paris" },
  ]

  const arcs = [
    { id: "arc-sf-tokyo", from: [37.78, -122.44] as [number, number], to: [35.68, 139.65] as [number, number] },
    { id: "arc-nyc-london", from: [40.71, -74.01] as [number, number], to: [51.51, -0.13] as [number, number] },
    { id: "arc-sydney-dubai", from: [-33.87, 151.21] as [number, number], to: [25.2, 55.27] as [number, number] },
    { id: "arc-london-paris", from: [51.51, -0.13] as [number, number], to: [48.86, 2.35] as [number, number] },
    { id: "arc-dubai-nyc", from: [25.2, 55.27] as [number, number], to: [40.71, -74.01] as [number, number] },
    { id: "arc-paris-sf", from: [48.86, 2.35] as [number, number], to: [37.78, -122.44] as [number, number] },
  ]

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.2,
        dark: 0,
        diffuse: 1.5,
        mapSamples: 16000,
        mapBrightness: 12,
        baseColor: [1, 1, 1],
        markerColor: [0.85, 0.35, 0.45],
        glowColor: [0.94, 0.93, 0.91],
        markerElevation: 0.01,
        markers: markers.map((m) => ({ location: m.location, size: 0.04, id: m.id })),
        arcs: arcs.map((a) => ({ from: a.from, to: a.to, id: a.id })),
        arcColor: [0.85, 0.35, 0.45],
        arcWidth: 0.8,
        arcHeight: 0.35,
      })

      function animate() {
        if (!isPausedRef.current) phi += speed
        globe!.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        })
        animationId = requestAnimationFrame(animate)
      }
      animate()
      setTimeout(() => canvas && (canvas.style.opacity = "1"))
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, arcs, speed])

  return (
    <div className="max-w-md mx-auto">
      <div className="relative aspect-square select-none">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          className="h-full w-full cursor-grab rounded-full"
          style={{
            opacity: 0,
            transition: "opacity 1.2s ease",
            touchAction: "none",
          }}
        />
        {markers.map((m) => (
          <div
            key={m.id}
            style={{
            position: "absolute",
            positionAnchor: `--cobe-${m.id}`,
            bottom: "anchor(top)",
            left: "anchor(center)",
            translate: "-50% 0",
            marginBottom: 8,
            background: "#111",
            padding: "4px 10px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
            pointerEvents: "none",
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 6px))`,
            transition: "opacity 0.3s, filter 0.3s",
          }}
        >
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "0.5rem",
              color: "#fff",
              letterSpacing: "0.05em",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {m.label}
          </span>
        </div>
      ))}
      </div>
    </div>
  )
}

export default function GlobeShowcasePage() {
  return (
    <main className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50">
      <div className="mx-auto max-w-6xl space-y-20">
        <header className="space-y-3 text-center">
          <h1 className="text-3xl font-bold">Globe Showcase</h1>
          <p className="mx-auto max-w-lg text-sm text-dead-400">
            Interactive 3D globes powered by cobe + Dead UI. Drag to rotate each globe.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-dead-red">
            01 — Interactive Globe
          </h2>
          <p className="text-xs text-dead-500">
            City markers with flight arcs connecting San Francisco ↔ Tokyo and New York ↔ London.
            Light theme, drag to rotate.
          </p>
          <div className="grid gap-8 md:grid-cols-1">
            <GlobeDemo />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-dead-red">
            02 — Polaroids
          </h2>
          <p className="text-xs text-dead-500">
            Photo memories pinned to their locations. CSS Anchor Positioning keeps labels locked
            to markers as the globe rotates.
          </p>
          <div className="grid gap-8 md:grid-cols-1">
            <GlobePolaroids />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-dead-red">
            03 — Flight Tracker
          </h2>
          <p className="text-xs text-dead-500">
            Live flight routes between major cities. Red arcs show active connections, drag to explore the globe.
          </p>
          <div className="grid gap-8 md:grid-cols-1">
            <GlobeFlights />
          </div>
        </section>
      </div>
    </main>
  )
}
