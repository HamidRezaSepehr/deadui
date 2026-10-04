'use client'

import dynamic from 'next/dynamic'
import { useState, type ReactNode } from 'react'
import { TRAIL_EFFECTS, type TrailEffect } from '@/registry/pro/webgl-image-trail/shaders'

/**
 * `ssr: false` is only legal inside a Client Component (Next 16 refuses it in
 * a Server Component), which is one of the reasons this page carries
 * `'use client'` even though it looks like a plain server page.
 *
 * The `loading` fallback reserves the exact same box the component occupies, so
 * the WebGL chunk arriving never shifts the layout (no CLS). `shaders.ts` is a
 * plain module of strings with no WebGL imports, so it is safe to pull the
 * effect list from the barrel at the top of a client page.
 */
const WebGLImageTrail = dynamic(
  () => import('@/registry/pro/webgl-image-trail').then((mod) => mod.WebGLImageTrail),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-dead-950 font-mono text-xs uppercase tracking-[0.3em] text-dead-400">
        Loading WebGL renderer...
      </div>
    ),
  }
)

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
  distortionStrength: number
  pixelSize: number
  waveFrequency: number
  waveAmplitude: number
  tintColor: string
  distortionSpeed: number
  trailSize: number
  fadeDuration: number
  imageScale: number
  velocityThreshold: number
} = {
  effect: 'liquid',
  distortionStrength: 0.5,
  pixelSize: 0.02,
  waveFrequency: 10,
  waveAmplitude: 0.1,
  tintColor: '#ffffff',
  distortionSpeed: 2,
  trailSize: 14,
  fadeDuration: 1.6,
  imageScale: 0.5,
  velocityThreshold: 0.1,
}

/** Which superset uniforms each effect actually reads. Drives the sliders. */
const EFFECT_UNIFORMS: Record<TrailEffect, string[]> = {
  liquid: ['uDistortionStrength'],
  distortion: ['uDistortionStrength'],
  pixelate: ['uPixelSize'],
  wave: ['uWaveFrequency', 'uWaveAmplitude'],
}

const EFFECT_BLURB: Record<TrailEffect, string> = {
  liquid: 'Two orthogonal travelling waves — the offset field rotates, so the top and bottom of the photo shear in opposite directions.',
  distortion: 'A radial push away from the centre. Static geometry: only the opacity animates, and uTime is compiled away.',
  pixelate: 'The sample coordinate snaps to a lattice. Nothing to animate, so uTime is compiled away here too.',
  wave: 'One horizontal travelling wave — vertical features stay vertical and the whole image ripples.',
}

interface ControlProps {
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

function Control({
  id,
  label,
  hint,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: ControlProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <label
          htmlFor={id}
          className="font-mono text-xs uppercase tracking-[0.2em] text-dead-50"
        >
          {label}
        </label>
        <output
          htmlFor={id}
          className="font-mono text-xs tabular-nums text-dead-red-hover"
        >
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
    <div className="space-y-6 rounded-xl border border-dead-800 bg-dead-900 p-8">
      <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-dead-400">
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function TestWebGLTrailPage() {
  const [effect, setEffect] = useState<TrailEffect>(DEFAULTS.effect)
  const [distortionStrength, setDistortionStrength] = useState(
    DEFAULTS.distortionStrength
  )
  const [pixelSize, setPixelSize] = useState(DEFAULTS.pixelSize)
  const [waveFrequency, setWaveFrequency] = useState(DEFAULTS.waveFrequency)
  const [waveAmplitude, setWaveAmplitude] = useState(DEFAULTS.waveAmplitude)
  const [tintColor, setTintColor] = useState(DEFAULTS.tintColor)
  const [distortionSpeed, setDistortionSpeed] = useState(DEFAULTS.distortionSpeed)
  const [trailSize, setTrailSize] = useState(DEFAULTS.trailSize)
  const [fadeDuration, setFadeDuration] = useState(DEFAULTS.fadeDuration)
  const [imageScale, setImageScale] = useState(DEFAULTS.imageScale)
  const [velocityThreshold, setVelocityThreshold] = useState(
    DEFAULTS.velocityThreshold
  )
  // Unmounts the component without leaving the page, which is the only way to
  // watch its cleanup run: a navigation tears the JS realm down and the browser
  // reclaims everything regardless of what the component does, so it can never
  // prove (or disprove) a leak.
  const [mounted, setMounted] = useState(true)

  const reset = () => {
    setEffect(DEFAULTS.effect)
    setDistortionStrength(DEFAULTS.distortionStrength)
    setPixelSize(DEFAULTS.pixelSize)
    setWaveFrequency(DEFAULTS.waveFrequency)
    setWaveAmplitude(DEFAULTS.waveAmplitude)
    setTintColor(DEFAULTS.tintColor)
    setDistortionSpeed(DEFAULTS.distortionSpeed)
    setTrailSize(DEFAULTS.trailSize)
    setFadeDuration(DEFAULTS.fadeDuration)
    setImageScale(DEFAULTS.imageScale)
    setVelocityThreshold(DEFAULTS.velocityThreshold)
  }

  const uses = EFFECT_UNIFORMS[effect]

  return (
    <div className="min-h-screen bg-dead-950 text-dead-50">
      <header className="px-6 pt-20 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-dead-400">
          Feature 15b — Pro Component Upgrade
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          WebGL Image Trail
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-dead-400">
          One trail, four shaders. Switch the effect and only the sliders for the
          uniforms that effect actually reads are shown — but every uniform is
          always passed to the material, so nothing you set is ever lost.
        </p>
      </header>

      {/* Stage. The component is `h-full`, so this wrapper is what gives it a
          resolved height — and it also reserves the box during the dynamic
          import so nothing shifts when the WebGL chunk lands. */}
      <section className="px-6 pt-14">
        <div
          id="trail-stage"
          className="relative mx-auto h-[70vh] w-full max-w-6xl overflow-hidden rounded-xl border border-dead-800 bg-dead-950"
        >
          {mounted ? (
            <WebGLImageTrail
              id="webgl-trail-main"
              images={IMAGES}
              effect={effect}
              distortionStrength={distortionStrength}
              pixelSize={pixelSize}
              waveFrequency={waveFrequency}
              waveAmplitude={waveAmplitude}
              tintColor={tintColor}
              distortionSpeed={distortionSpeed}
              trailSize={trailSize}
              fadeDuration={fadeDuration}
              imageScale={imageScale}
              velocityThreshold={velocityThreshold}
              fallbackText="WebGL is unavailable in this browser"
            />
          ) : (
            <p className="flex h-full w-full items-center justify-center font-mono text-xs uppercase tracking-[0.3em] text-dead-400">
              Unmounted — the canvas, its WebGL context, its textures and its
              prune interval are all gone
            </p>
          )}
        </div>
        <div className="mx-auto mt-3 flex max-w-6xl items-center justify-between gap-4">
          <p className="font-mono text-xs text-dead-400">
            The cursor is hidden inside the stage (the trail replaces it). Move
            fast for a long comet, slow for a dense cluster.
          </p>
          <button
            id="ctl-mount"
            type="button"
            onClick={() => setMounted((value) => !value)}
            className="shrink-0 rounded-full border border-dead-700 px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] text-dead-50 transition-colors hover:border-dead-red hover:text-dead-red-hover focus:ring-2 focus:ring-dead-red focus:ring-offset-2 focus:ring-offset-dead-950"
          >
            {mounted ? 'Unmount' : 'Mount'}
          </button>
        </div>
      </section>

      {/* Controls live outside the stage: the container sets `cursor-none`, and
          dragging a slider inside it would spawn trail items too. */}
      <section className="mx-auto mt-16 w-full max-w-6xl px-6">
        <div className="space-y-6">
          <Panel title="Effect">
            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <label
                  htmlFor="ctl-effect"
                  className="font-mono text-xs uppercase tracking-[0.2em] text-dead-50"
                >
                  effect
                </label>
                <output
                  htmlFor="ctl-effect"
                  className="font-mono text-xs text-dead-red-hover"
                >
                  {effect}
                </output>
              </div>
              <select
                id="ctl-effect"
                value={effect}
                onChange={(event) => setEffect(event.target.value as TrailEffect)}
                className="w-full rounded-lg border border-dead-800 bg-dead-950 px-4 py-3 font-mono text-sm text-dead-50 transition-colors focus:border-dead-red focus:ring-2 focus:ring-dead-red focus:ring-offset-2 focus:ring-offset-dead-950"
              >
                {TRAIL_EFFECTS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <p className="font-mono text-[11px] leading-relaxed text-dead-400">
                {EFFECT_BLURB[effect]}
              </p>
              <p className="font-mono text-[11px] leading-relaxed text-dead-400">
                Reads:{' '}
                <span className="text-dead-200">
                  {uses.join(', ')}
                </span>
                . The other four superset uniforms are still sent to the material
                on every frame; GLSL just compiles them away.
              </p>
            </div>
          </Panel>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Panel title={`Uniforms for "${effect}"`}>
              <div className="space-y-8">
                {uses.includes('uDistortionStrength') && (
                  <Control
                    id="ctl-distortion-strength"
                    label="distortionStrength"
                    hint="Warp strength. 0 leaves the photo untouched, 2 tears it apart."
                    value={distortionStrength}
                    min={0}
                    max={2}
                    step={0.05}
                    onChange={setDistortionStrength}
                  />
                )}
                {uses.includes('uPixelSize') && (
                  <Control
                    id="ctl-pixel-size"
                    label="pixelSize"
                    hint="Size of one pixel block in UV. Bigger blocks, chunkier photo."
                    value={pixelSize}
                    min={0.002}
                    max={0.2}
                    step={0.002}
                    format={(value) => value.toFixed(3)}
                    onChange={setPixelSize}
                  />
                )}
                {uses.includes('uWaveFrequency') && (
                  <Control
                    id="ctl-wave-frequency"
                    label="waveFrequency"
                    hint="How many wave cycles fit across the quad's width."
                    value={waveFrequency}
                    min={0}
                    max={40}
                    step={0.5}
                    format={(value) => value.toFixed(1)}
                    onChange={setWaveFrequency}
                  />
                )}
                {uses.includes('uWaveAmplitude') && (
                  <Control
                    id="ctl-wave-amplitude"
                    label="waveAmplitude"
                    hint="Vertical displacement in UV — how far each column is pushed."
                    value={waveAmplitude}
                    min={0}
                    max={0.5}
                    step={0.005}
                    format={(value) => value.toFixed(3)}
                    onChange={setWaveAmplitude}
                  />
                )}
              </div>
            </Panel>

            <Panel title="Shared">
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-4">
                    <label
                      htmlFor="ctl-tint"
                      className="font-mono text-xs uppercase tracking-[0.2em] text-dead-50"
                    >
                      tintColor
                    </label>
                    <span className="font-mono text-xs tabular-nums text-dead-red-hover">
                      {tintColor}
                    </span>
                  </div>
                  <input
                    id="ctl-tint"
                    type="color"
                    value={tintColor}
                    onChange={(event) => setTintColor(event.target.value)}
                    className="h-10 w-full cursor-pointer rounded-lg border border-dead-800 bg-dead-950 p-1 focus:ring-2 focus:ring-dead-red focus:ring-offset-2 focus:ring-offset-dead-950"
                  />
                  <p className="font-mono text-[11px] leading-relaxed text-dead-400">
                    Every effect mixes this into the sampled colour at a fixed
                    30%, in three&rsquo;s linear working space — so it grades
                    the photo instead of replacing it. Note that the default
                    white is the <em className="not-italic text-dead-200">brightest</em>{' '}
                    grade, not a neutral one:{' '}
                    <code className="font-mono">mix(c, white, 0.3) === c * 0.7 + 0.3</code>
                    , so nothing opaque renders below sRGB 149. Pick a colour
                    near your surface to bring the trail back down.
                  </p>
                </div>

                <Control
                  id="ctl-speed"
                  label="distortionSpeed"
                  hint="Multiplier on the shader clock. Higher values churn faster. Static effects ignore it."
                  value={distortionSpeed}
                  min={0}
                  max={8}
                  step={0.1}
                  onChange={setDistortionSpeed}
                />
                <Control
                  id="ctl-trail-size"
                  label="trailSize"
                  hint="Hard cap on simultaneously visible quads. Also trimmed live, not just on the next spawn."
                  value={trailSize}
                  min={1}
                  max={40}
                  step={1}
                  format={(value) => String(Math.round(value))}
                  onChange={setTrailSize}
                />
                <Control
                  id="ctl-fade"
                  label="fadeDuration"
                  hint="Seconds from birth to invisible. Drives both the opacity fade and the shrink."
                  value={fadeDuration}
                  min={0.2}
                  max={10}
                  step={0.1}
                  format={(value) => `${value.toFixed(1)}s`}
                  onChange={setFadeDuration}
                />
                <Control
                  id="ctl-scale"
                  label="imageScale"
                  hint="Quad size in the 3D scene, as a fraction of the fixed world view height."
                  value={imageScale}
                  min={0.1}
                  max={1.5}
                  step={0.05}
                  onChange={setImageScale}
                />
                <Control
                  id="ctl-velocity"
                  label="velocityThreshold"
                  hint="Minimum pointer speed (px/ms) required to spawn. Raise it to thin out slow movement."
                  value={velocityThreshold}
                  min={0}
                  max={2}
                  step={0.05}
                  onChange={setVelocityThreshold}
                />
              </div>
            </Panel>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            id="ctl-reset"
            type="button"
            onClick={reset}
            className="rounded-full border border-dead-700 px-6 py-2 font-mono text-xs uppercase tracking-[0.25em] text-dead-50 transition-colors hover:border-dead-red hover:text-dead-red-hover focus:ring-2 focus:ring-dead-red focus:ring-offset-2 focus:ring-offset-dead-950"
          >
            Reset to defaults
          </button>
        </div>
      </section>

      <footer className="mx-auto mt-24 max-w-3xl space-y-3 px-6 pb-20 text-center text-sm text-dead-400">
        <p>
          Every quad is handed all eight uniforms whatever the effect is. GLSL
          compiles away the ones a shader does not read, so the superset costs
          nothing and the prop surface stays flat.
        </p>
        <p>
          Textures are downloaded exactly once and shared by every quad through
          a single <code className="font-mono">THREE.TextureLoader</code> — the
          render loop never allocates a loader, a texture, or a material.
        </p>
        <p>
          Switching the effect remounts the material, because three.js only
          recompiles a shader when <code className="font-mono">needsUpdate</code>{' '}
          is set — assigning a new shader string alone would keep drawing with
          the previous program. Revisiting an effect reuses the program three
          already cached.
        </p>
        <p>
          Respects{' '}
          <code className="font-mono">prefers-reduced-motion</code>: the canvas is
          not mounted at all and the fallback message is shown instead.
        </p>
      </footer>
    </div>
  )
}
