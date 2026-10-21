"use client"

import { useState, useRef, useEffect } from "react"
import { Globe, Marker, Arc } from "@/registry/globe"
import { cn } from "@/lib/utils"

const CITIES = [
  { id: "sf", name: "San Francisco", lat: 37.78, lon: -122.44 },
  { id: "nyc", name: "New York", lat: 40.71, lon: -74.01 },
  { id: "tokyo", name: "Tokyo", lat: 35.68, lon: 139.65 },
  { id: "london", name: "London", lat: 51.51, lon: -0.13 },
  { id: "sydney", name: "Sydney", lat: -33.87, lon: 151.21 },
  { id: "dubai", name: "Dubai", lat: 25.2, lon: 55.27 },
  { id: "paris", name: "Paris", lat: 48.86, lon: 2.35 },
  { id: "capetown", name: "Cape Town", lat: -33.93, lon: 18.42 },
  { id: "saopaulo", name: "São Paulo", lat: -23.55, lon: -46.63 },
]

const FLIGHT_ROUTES: { id: string; from: [number, number]; to: [number, number] }[] = [
  { id: "sf-tokyo", from: [37.78, -122.44], to: [35.68, 139.65] },
  { id: "nyc-london", from: [40.71, -74.01], to: [51.51, -0.13] },
  { id: "sydney-singapore", from: [-33.87, 151.21], to: [1.35, 103.82] },
  { id: "dubai-london", from: [25.2, 55.27], to: [51.51, -0.13] },
  { id: "paris-nyc", from: [48.86, 2.35], to: [40.71, -74.01] },
  { id: "capetown-dubai", from: [-33.93, 18.42], to: [25.2, 55.27] },
]

const POLARIOD_IMAGES = [
  { id: "tokyo", lat: 35.68, lon: 139.65, src: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&h=200&fit=crop", label: "Tokyo" },
  { id: "nyc", lat: 40.71, lon: -74.01, src: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=200&h=200&fit=crop", label: "New York" },
  { id: "london", lat: 51.51, lon: -0.13, src: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=200&h=200&fit=crop", label: "London" },
  { id: "paris", lat: 48.86, lon: 2.35, src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=200&h=200&fit=crop", label: "Paris" },
  { id: "dubai", lat: 25.2, lon: 55.27, src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=200&h=200&fit=crop", label: "Dubai" },
]

const SHOWCASES = [
  {
    id: "cobe-v2",
    title: "COBE v2",
    description: "Interactive globe with flight routes and city labels. Drag to rotate.",
  },
  {
    id: "cdn",
    title: "CDN",
    description: "Light theme globe with global markers.",
  },
  {
    id: "polaroids",
    title: "Polaroids",
    description: "Photo memories pinned to their locations on the globe.",
  },
  {
    id: "live-badge",
    title: "Live Badge",
    description: "Real-time location tracking with pulsing indicators.",
  },
  {
    id: "flights",
    title: "Flights",
    description: "Flight paths between major cities around the world.",
  },
]

function GlobeOverlayLabels({
  prefix,
  cities,
  size,
}: {
  prefix: string
  cities: typeof CITIES
  size: number
}) {
  return (
    <>
      {cities.map((city) => (
        <div
          key={city.id}
          className="absolute pointer-events-none font-mono text-xs text-dead-50"
          style={{
            positionAnchor: `--cobe-${prefix}-${city.id}`,
            opacity: `var(--cobe-visible-${prefix}-${city.id}, 0)`,
            filter: `blur(var(--cobe-visible-${prefix}-${city.id}, 10px))`,
            translate: "0 0",
            marginBottom: "8px",
          }}
        >
          {city.name}
        </div>
      ))}
    </>
  )
}

function GlobeOverlayArcLabels({
  prefix,
  arcs,
}: {
  prefix: string
  arcs: { id: string; from: string; to: string }[]
}) {
  return (
    <>
      {arcs.map((arc) => (
        <div
          key={arc.id}
          className="absolute pointer-events-none font-mono text-[10px] uppercase tracking-widest text-dead-300"
          style={{
            positionAnchor: `--cobe-arc-${prefix}-${arc.id}`,
            opacity: `var(--cobe-visible-arc-${prefix}-${arc.id}, 0)`,
            filter: `blur(var(--cobe-visible-arc-${prefix}-${arc.id}, 10px))`,
            translate: "0 0",
            whiteSpace: "nowrap",
          }}
        >
          {arc.from} → {arc.to}
        </div>
      ))}
    </>
  )
}

function SpinningOrbitRing({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden",
        className
      )}
      aria-hidden="true"
    >
      <style>{`
        @keyframes orbit-spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 300 300"
        style={{ animation: "orbit-spin-slow 30s linear infinite" }}
      >
        <defs>
          <path
            id="orbit-path"
            d="M 150,150 m -130,0 a 130,130 0 1,0 260,0 a 130,130 0 1,0 -260,0"
          />
        </defs>
        <text className="fill-dead-500 text-[8px] uppercase tracking-[0.3em] font-mono">
          <textPath href="#orbit-path">
            The 5KB Globe Lib · The 5KB Globe Lib · The 5KB Globe Lib · The 5KB Globe Lib · The 5KB Globe Lib · The 5KB Globe Lib · The 5KB Globe Lib · The 5KB Globe Lib · The 5KB Globe Lib · The 5KB Globe Lib ·
          </textPath>
        </text>
      </svg>
    </div>
  )
}

function GlobeShowcase({
  id,
  title,
  children,
  active,
}: {
  id: string
  title: string
  children: React.ReactNode
  active: boolean
}) {
  if (!active) return null
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-dead-800 bg-dead-950">
        {children}
      </div>
    </div>
  )
}

function LiveBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full border border-dead-red/40 bg-dead-950/80 px-2.5 py-1 backdrop-blur-sm",
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-dead-red opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-dead-red" />
      </span>
      <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-dead-red">
        Live
      </span>
    </div>
  )
}

function PolaroidImage({
  src,
  label,
  style,
}: {
  src: string
  label: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className="pointer-events-none absolute flex flex-col items-center"
      style={{
        ...style,
        translate: "-50% -50%",
      }}
    >
      <div className="rounded bg-white p-1 pb-6 shadow-xl">
        <img
          src={src}
          alt={label}
          className="h-16 w-16 object-cover grayscale"
        />
      </div>
      <span className="mt-1 font-mono text-[8px] uppercase tracking-widest text-dead-400">
        {label}
      </span>
    </div>
  )
}

function ShowcaseControls({
  showcases,
  activeIndex,
  onSelect,
}: {
  showcases: typeof SHOWCASES
  activeIndex: number
  onSelect: (index: number) => void
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        {showcases.map((s, i) => (
          <button
            key={s.id}
            onClick={() => onSelect(i)}
            className={cn(
              "relative flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300",
              i === activeIndex
                ? "border-dead-red bg-dead-red text-dead-950"
                : "border-dead-800 bg-dead-950/50 text-dead-400 hover:border-dead-600 hover:text-dead-200"
            )}
            aria-label={s.title}
          >
            <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold">
              {i + 1}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => onSelect(Math.max(0, activeIndex - 1))}
          disabled={activeIndex === 0}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-dead-800 bg-dead-950/50 font-mono text-dead-400 transition-colors hover:border-dead-600 hover:text-dead-200 disabled:opacity-30"
          aria-label="Previous"
        >
          ←
        </button>
        <span className="font-mono text-xs text-dead-500">
          {activeIndex + 1} / {showcases.length}
        </span>
        <button
          onClick={() => onSelect(Math.min(showcases.length - 1, activeIndex + 1))}
          disabled={activeIndex === showcases.length - 1}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-dead-800 bg-dead-950/50 font-mono text-dead-400 transition-colors hover:border-dead-600 hover:text-dead-200 disabled:opacity-30"
          aria-label="Next"
        >
          →
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <div
          className="h-px bg-dead-red transition-all duration-300"
          style={{ width: `${((activeIndex + 1) / showcases.length) * 200}px` }}
        />
      </div>
    </div>
  )
}

export default function GlobeShowcasePage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const showcase = SHOWCASES[activeIndex]

  const baseMarkers: Marker[] = CITIES.map((c) => ({
    location: [c.lat, c.lon],
    size: 0.03,
    id: `default-${c.id}`,
  }))

  const cobeV2Markers: Marker[] = CITIES.map((c) => ({
    location: [c.lat, c.lon],
    size: 0.03,
    id: `default-${c.id}`,
  }))

  const cobeV2Arcs: Arc[] = [
    { from: [37.78, -122.44], to: [35.68, 139.65], id: "default-sf-tokyo" },
    { from: [40.71, -74.01], to: [51.51, -0.13], id: "default-nyc-london" },
  ]

  const cdnMarkers: Marker[] = CITIES.map((c) => ({
    location: [c.lat, c.lon],
    size: 0.025,
    id: `cdn-${c.id}`,
  }))

  const flightMarkers: Marker[] = [
    { location: [37.78, -122.44], size: 0.04, id: "flight-sf" },
    { location: [35.68, 139.65], size: 0.04, id: "flight-tokyo" },
    { location: [40.71, -74.01], size: 0.04, id: "flight-nyc" },
    { location: [51.51, -0.13], size: 0.04, id: "flight-london" },
    { location: [-33.87, 151.21], size: 0.04, id: "flight-sydney" },
    { location: [1.35, 103.82], size: 0.04, id: "flight-singapore" },
    { location: [25.2, 55.27], size: 0.04, id: "flight-dubai" },
    { location: [48.86, 2.35], size: 0.04, id: "flight-paris" },
    { location: [-33.93, 18.42], size: 0.04, id: "flight-capetown" },
  ]

  const flightArcs: Arc[] = FLIGHT_ROUTES.map((r) => ({
    from: r.from,
    to: r.to,
    id: `flight-${r.id}`,
  }))

  const polaroidMarkers: Marker[] = POLARIOD_IMAGES.map((p) => ({
    location: [p.lat, p.lon],
    size: 0.05,
    id: `polaroid-${p.id}`,
  }))

  const liveMarkers: Marker[] = CITIES.slice(0, 5).map((c) => ({
    location: [c.lat, c.lon],
    size: 0.05,
    id: `live-${c.id}`,
  }))

  return (
    <main className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50">
      <div className="mx-auto max-w-4xl space-y-12">
        <header className="space-y-3 text-center">
          <h1 className="text-3xl font-bold">Globe Showcase</h1>
          <p className="text-sm text-dead-400">
            Interactive 3D globe examples powered by cobe + Dead UI. Drag to rotate each globe.
          </p>
        </header>

        {/* Globe Display */}
        <div className="space-y-6">
          {/* COBE v2 */}
          <GlobeShowcase id="cobe-v2" title="COBE v2" active={activeIndex === 0}>
            <div className="relative h-full w-full">
              <Globe
                size={600}
                draggable
                autoRotate={false}
                dark={1}
                baseColor={[0, 0.05, 0.2]}
                markerColor={[0.3, 0.6, 1]}
                glowColor={[0.3, 0.6, 1]}
                markers={cobeV2Markers}
                arcs={cobeV2Arcs}
                arcColor={[0.2, 0.5, 1]}
                arcWidth={0.6}
                arcHeight={0.25}
                mapBaseBrightness={0}
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-4xl font-black tracking-tighter text-white/10">
                  COBE
                </span>
              </div>
              <SpinningOrbitRing />
              <GlobeOverlayLabels
                prefix="default"
                cities={CITIES}
                size={600}
              />
              <GlobeOverlayArcLabels
                prefix="default"
                arcs={[
                  { id: "sf-tokyo", from: "SF", to: "Tokyo" },
                  { id: "nyc-london", from: "NYC", to: "London" },
                ]}
              />
            </div>
          </GlobeShowcase>

          {/* CDN */}
          <GlobeShowcase id="cdn" title="CDN" active={activeIndex === 1}>
            <div className="relative h-full w-full">
              <Globe
                size={600}
                draggable
                autoRotate
                autoRotateSpeed={0.005}
                dark={0}
                baseColor={[1, 1, 1]}
                markerColor={[0.1, 0.3, 1]}
                glowColor={[0.5, 0.5, 1]}
                markers={cdnMarkers}
                mapBaseBrightness={0.1}
                mapBrightness={1}
                diffuse={0.8}
              />
              <div className="pointer-events-none absolute bottom-4 left-4">
                <span className="rounded border border-dead-800 bg-dead-950/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-dead-400 backdrop-blur-sm">
                  ▲ CDN
                </span>
              </div>
              <GlobeOverlayLabels
                prefix="cdn"
                cities={CITIES}
                size={600}
              />
            </div>
          </GlobeShowcase>

          {/* Polaroids */}
          <GlobeShowcase id="polaroids" title="Polaroids" active={activeIndex === 2}>
            <div className="relative h-full w-full">
              <Globe
                size={600}
                draggable
                autoRotate
                autoRotateSpeed={0.004}
                dark={0.8}
                baseColor={[0.02, 0.02, 0.05]}
                markerColor={[1, 0.8, 0.3]}
                glowColor={[1, 0.8, 0.3]}
                markers={polaroidMarkers}
                mapBaseBrightness={0}
                mapBrightness={4}
              />
              <GlobeOverlayLabels
                prefix="polaroid"
                cities={POLARIOD_IMAGES.map((p) => ({ id: p.id, name: p.label, lat: p.lat, lon: p.lon }))}
                size={600}
              />
            </div>
          </GlobeShowcase>

          {/* Live Badge */}
          <GlobeShowcase id="live-badge" title="Live Badge" active={activeIndex === 3}>
            <div className="relative h-full w-full">
              <Globe
                size={600}
                draggable
                autoRotate
                autoRotateSpeed={0.006}
                dark={0.7}
                baseColor={[0.05, 0.02, 0.1]}
                markerColor={[0.8, 0.2, 0.4]}
                glowColor={[1, 0.2, 0.4]}
                markers={liveMarkers}
                markerElevation={0.05}
                mapBaseBrightness={0}
                mapBrightness={5}
              />
              <LiveBadge />
              <GlobeOverlayLabels
                prefix="live"
                cities={CITIES.slice(0, 5)}
                size={600}
              />
            </div>
          </GlobeShowcase>

          {/* Flights */}
          <GlobeShowcase id="flights" title="Flights" active={activeIndex === 4}>
            <div className="relative h-full w-full">
              <Globe
                size={600}
                draggable
                autoRotate
                autoRotateSpeed={0.003}
                dark={1}
                baseColor={[0, 0.02, 0.08]}
                markerColor={[1, 0.5, 0.1]}
                glowColor={[1, 0.3, 0.1]}
                markers={flightMarkers}
                arcs={flightArcs}
                arcColor={[1, 0.5, 0.1]}
                arcWidth={0.5}
                arcHeight={0.3}
                mapBaseBrightness={0}
                mapBrightness={3}
              />
              <div className="pointer-events-none absolute bottom-4 left-4">
                <span className="rounded border border-dead-800 bg-dead-950/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-dead-400 backdrop-blur-sm">
                  ✈ Flights
                </span>
              </div>
            </div>
          </GlobeShowcase>
        </div>

        {/* Controls */}
        <ShowcaseControls
          showcases={SHOWCASES}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />

        {/* Showcase Info */}
        <div className="space-y-3 text-center">
          <h2 className="font-mono text-lg font-semibold uppercase tracking-widest text-dead-red">
            {showcase.title}
          </h2>
          <p className="text-sm text-dead-400">{showcase.description}</p>
        </div>

        {/* Feature callouts */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "WebGL Powered", value: "GPU" },
            { label: "Draggable", value: "Drag" },
            { label: "Markers & Arcs", value: "5KB" },
            { label: "React Ready", value: "CLI" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-1 rounded-xl border border-dead-800 bg-dead-900/40 p-4"
            >
              <span className="font-mono text-xs font-semibold text-dead-red">{f.value}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-dead-500">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
