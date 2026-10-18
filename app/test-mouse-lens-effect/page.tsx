'use client'

import dynamic from 'next/dynamic'
import { type ReactNode } from 'react'

/**
 * `ssr: false` is load-bearing for the same reason it is on the other WebGL
 * pages: `three` + R3F need a browser to build a WebGL context, and mounting
 * the Canvas before hydration both throws on the server and bloats the shared
 * bundle. The `loading` fallback reserves the same `h-[500px]` box the
 * component occupies, so the chunk landing never shifts the layout (no CLS).
 */
const MouseLensEffect = dynamic(
  () =>
    import('@/registry/pro/mouse-lens-effect').then(
      (mod) => mod.MouseLensEffect
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] w-full items-center justify-center bg-dead-950 font-mono text-xs uppercase tracking-[0.3em] text-dead-400">
        Loading WebGL renderer...
      </div>
    ),
  }
)

// A vibrant rose for the "inside" (revealed) image and the same photo forced
// desaturated for the "outside" background. `sat=-100` is Unsplash's
// server-side grayscale filter, so no local image processing is needed.
const ROSE_INSIDE =
  'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=1200&q=80'
const ROSE_OUTSIDE =
  'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=1200&q=80&sat=-100'

interface DemoSectionProps {
  id: string
  title: string
  description: string
  hint: string
  children: ReactNode
}

function DemoSection({ id, title, description, hint, children }: DemoSectionProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6" id={id}>
      <div className="mb-6">
        <h2 className="font-mono text-sm uppercase tracking-[0.3em] text-dead-red-hover">
          {title}
        </h2>
        <p className="mt-3 max-w-3xl text-dead-400">{description}</p>
      </div>
      {children}
      <p className="mt-3 font-mono text-[11px] leading-relaxed text-dead-400">{hint}</p>
    </section>
  )
}

export default function TestMouseLensEffectPage() {
  return (
    <div className="min-h-screen bg-dead-950 text-dead-50">
      <header className="px-6 pt-20 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-dead-400">
          Feature 36 — Pro Component
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Mouse Lens Effect
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-dead-400">
          A grayscale stage holds the vibrant rose; a square lens follows the
          pointer and reveals the color inside a warped, RGB-shifted frame.
          Move the cursor through each panel — the lens glides, it never
          snaps.
        </p>
      </header>

      <div className="mt-16 space-y-24">
        <DemoSection
          id="demo-default"
          title="01 — Default"
          description="Grayscale rose outside, vibrant color inside, default settings: squareSize 0.3, lensDistortion 0.2, rgbShiftIntensity 0.015, mouseEasing 0.08."
          hint="The reference look. The lens is a square, aspect-corrected so it stays a square on any viewport."
        >
          <MouseLensEffect
            id="lens-default"
            srcOutside={ROSE_OUTSIDE}
            srcInside={ROSE_INSIDE}
          />
        </DemoSection>

        <DemoSection
          id="demo-high-distortion"
          title="02 — High Distortion"
          description="lensDistortion 0.85 and rgbShiftIntensity 0.04 for a dramatic, glitchy lens effect — the barrel warp and chromatic aberration are unmistakable near the square's edges."
          hint="Bump the distortion past 0.5 and the square's content visibly balloons toward its center; the RGB channels peel apart at the corners."
        >
          <MouseLensEffect
            id="lens-high-distortion"
            srcOutside={ROSE_OUTSIDE}
            srcInside={ROSE_INSIDE}
            lensDistortion={0.85}
            rgbShiftIntensity={0.04}
          />
        </DemoSection>

        <DemoSection
          id="demo-fast-easing"
          title="03 — Fast Easing"
          description="mouseEasing 0.2 — a snappier, more responsive cursor follow. The lens still interpolates, but it catches up to the pointer in a few frames instead of drifting behind."
          hint="Lower easing values (0.01–0.02) make the lens trail lazily behind the cursor; higher values (0.15–0.2) make it feel nearly 1:1, at the cost of smoothness."
        >
          <MouseLensEffect
            id="lens-fast-easing"
            srcOutside={ROSE_OUTSIDE}
            srcInside={ROSE_INSIDE}
            mouseEasing={0.2}
          />
        </DemoSection>
      </div>

      <footer className="mx-auto mt-24 max-w-3xl space-y-3 px-6 pb-20 text-center text-sm text-dead-400">
        <p>
          The lens position is lerped toward the pointer every frame with the
          <code className="font-mono"> mouseEasing</code> factor — the raw
          pointer never reaches the shader, only the eased value does, which
          is what makes the motion feel premium instead of jittery.
        </p>
        <p>
          Both images are served by the same Unsplash URL; the outside texture
          carries <code className="font-mono">&amp;sat=-100</code>, Unsplash&rsquo;s
          server-side desaturation, so no image processing runs in the browser.
        </p>
      </footer>
    </div>
  )
}