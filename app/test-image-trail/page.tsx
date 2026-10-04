'use client'

import { useState, type ReactNode } from 'react'
import { ImageTrail, TRAIL_EFFECTS, type TrailEffect } from '@/registry/image-trail'

const IMAGES = [
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80',
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80',
]

const DEFAULTS: {
  effect: TrailEffect
  trailSize: number
  velocityThreshold: number
  duration: number
} = {
  effect: 'fade-scale',
  trailSize: 6,
  velocityThreshold: 15,
  duration: 0.8,
}

const EFFECT_BLURB: Record<TrailEffect, string> = {
  'fade-scale': 'The baseline Codrops move. Shrinks to 40% and fades — nothing else.',
  'rotate-scale': 'Same shrink, plus a 45° spin, so the trail reads as a spiral.',
  '3d-rotate': 'Flips away in 3D. Needs the 800px perspective the variant ships with.',
  'blur-fade': 'Defocuses into the background. The only effect that animates `filter`.',
  'clip-circle': 'Collapses inwards through a clip-path circle. The most "Codrops" of the six.',
  'skew-fade': 'Shears on both axes while it fades — the loosest of the six.',
}

interface SelectProps {
  id: string
  label: string
  value: TrailEffect
  options: readonly TrailEffect[]
  onChange: (value: TrailEffect) => void
}

function Select({ id, label, value, options, onChange }: SelectProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="font-mono text-xs uppercase tracking-[0.2em] text-dead-50">
          {label}
        </label>
        <output htmlFor={id} className="font-mono text-xs text-dead-red-hover">
          {value}
        </output>
      </div>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as TrailEffect)}
        className="w-full rounded-lg border border-dead-800 bg-dead-950 px-4 py-3 font-mono text-sm text-dead-50 transition-colors focus:border-dead-red focus:ring-2 focus:ring-dead-red focus:ring-offset-2 focus:ring-offset-dead-950"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <p className="font-mono text-[11px] leading-relaxed text-dead-400">{EFFECT_BLURB[value]}</p>
    </div>
  )
}

interface SliderProps {
  id: string
  label: string
  hint: string
  value: number
  min: number
  max: number
  step: number
  format?: (value: number) => string
  onChange: (value: number) => void
}

function Slider({
  id,
  label,
  hint,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="font-mono text-xs uppercase tracking-[0.2em] text-dead-50">
          {label}
        </label>
        <output htmlFor={id} className="font-mono text-xs tabular-nums text-dead-red-hover">
          {format ? format(value) : value.toFixed(2)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-dead-800 accent-dead-red focus:ring-2 focus:ring-dead-red focus:ring-offset-2 focus:ring-offset-dead-950"
      />
      <p className="font-mono text-[11px] leading-relaxed text-dead-400">{hint}</p>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-5 rounded-xl border border-dead-800 bg-dead-900/90 p-6 backdrop-blur-sm">
      <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-dead-400">{title}</h2>
      {children}
    </div>
  )
}

export default function TestImageTrailPage() {
  const [effect, setEffect] = useState<TrailEffect>(DEFAULTS.effect)
  const [trailSize, setTrailSize] = useState(DEFAULTS.trailSize)
  const [velocityThreshold, setVelocityThreshold] = useState(DEFAULTS.velocityThreshold)
  const [duration, setDuration] = useState(DEFAULTS.duration)
  const [mounted, setMounted] = useState(true)

  const reset = () => {
    setEffect(DEFAULTS.effect)
    setTrailSize(DEFAULTS.trailSize)
    setVelocityThreshold(DEFAULTS.velocityThreshold)
    setDuration(DEFAULTS.duration)
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-dead-950 text-dead-50">
      {/*
        The stage fills the viewport, so the trail reacts anywhere on the page.
        `id` and the `name` are here so a test harness can target the component
        and its items unambiguously.
      */}
      {mounted ? (
        <ImageTrail
          id="image-trail-main"
          images={IMAGES}
          effect={effect}
          trailSize={trailSize}
          velocityThreshold={velocityThreshold}
          duration={duration}
        />
      ) : (
        <p className="flex h-full w-full items-center justify-center font-mono text-xs uppercase tracking-[0.3em] text-dead-400">
          Unmounted — the trail queue and its prune interval are both gone
        </p>
      )}

      {/*
        The panel is a SIBLING of the stage, not a child, so dragging a slider
        over it never spawns a trail image. It is also last in the DOM with a
        positive z-index so it paints above the trail.

        `max-h` + `overflow-y-auto` is load-bearing, not decoration: the panel's
        natural height is taller than a 720px viewport, so without it the Reset
        / Unmount row falls off the bottom of the screen and is unreachable.
      */}
      <aside className="pointer-events-auto fixed right-4 top-4 z-20 max-h-[calc(100vh-2rem)] w-[min(22rem,calc(100vw-2rem))] space-y-4 overflow-y-auto overscroll-contain pr-1">
        <Panel title="Effect">
          <Select
            id="ctl-effect"
            label="effect"
            value={effect}
            options={TRAIL_EFFECTS}
            onChange={setEffect}
          />
          <p className="font-mono text-[11px] leading-relaxed text-dead-400">
            Six switchable styles, one trail. Switching is instant — the images
            already in flight finish on the old effect and new spawns pick up
            the new one.
          </p>
        </Panel>

        <Panel title="Tuning">
          <div className="space-y-6">
            <Slider
              id="ctl-trail-size"
              label="trailSize"
              hint="Hard cap on simultaneously visible images. The queue is sliced to this on every spawn AND on every prune tick, so lowering it shrinks a live trail immediately."
              value={trailSize}
              min={1}
              max={20}
              step={1}
              format={(value) => String(Math.round(value))}
              onChange={setTrailSize}
            />
            <Slider
              id="ctl-velocity-threshold"
              label="velocityThreshold"
              hint="Minimum pointer movement in px since the last event. Raise it to thin out slow movement; 0 spawns on every accepted event (still rate-limited by spawnRate)."
              value={velocityThreshold}
              min={0}
              max={80}
              step={1}
              format={(value) => `${Math.round(value)}px`}
              onChange={setVelocityThreshold}
            />
            <Slider
              id="ctl-duration"
              label="duration"
              hint="Seconds an image lives. It is BOTH the animation duration and the item's lifetime — the prune sweep drops an item once it is older than this, so the animation always finishes before React unmounts it."
              value={duration}
              min={0.2}
              max={3}
              step={0.05}
              format={(value) => `${value.toFixed(2)}s`}
              onChange={setDuration}
            />
          </div>
        </Panel>

        <div className="flex gap-3">
          <button
            id="ctl-reset"
            type="button"
            onClick={reset}
            className="flex-1 rounded-full border border-dead-700 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-dead-50 transition-colors hover:border-dead-red hover:text-dead-red-hover focus:ring-2 focus:ring-dead-red focus:ring-offset-2 focus:ring-offset-dead-950"
          >
            Reset
          </button>
          <button
            id="ctl-mount"
            type="button"
            onClick={() => setMounted((value) => !value)}
            className="flex-1 rounded-full border border-dead-700 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-dead-50 transition-colors hover:border-dead-red hover:text-dead-red-hover focus:ring-2 focus:ring-dead-red focus:ring-offset-2 focus:ring-offset-dead-950"
          >
            {mounted ? 'Unmount' : 'Mount'}
          </button>
        </div>
      </aside>

      <div className="pointer-events-none fixed bottom-4 left-4 z-20 max-w-sm space-y-2 font-mono text-[11px] leading-relaxed text-dead-400">
        <p>
          Move the pointer anywhere outside the panel — fast for a long comet,
          slow for a dense cluster. The images cycle through the six photos and
          never block a click.
        </p>
        <p>
          DOM-only: <code className="text-dead-200">motion/react</code> plus CSS
          transforms. No WebGL, no canvas, no{' '}
          <code className="text-dead-200">AnimatePresence</code> — each item
          animates to completion and is then dropped from the queue by a
          timestamp sweep.
        </p>
        <p>Respects <code className="text-dead-200">prefers-reduced-motion</code>: the trail is disabled.</p>
      </div>
    </div>
  )
}
