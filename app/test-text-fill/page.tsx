'use client'

import { useRef } from 'react'
import { TextFillAnimation } from '@/registry/pro/text-fill-animation'

export default function TestTextFillPage() {
  const scrollerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col items-center bg-dead-950 text-dead-50">
      <header className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-dead-400">
          Feature 08 — Pro Component
        </p>
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight md:text-6xl">
          Text Fill Animation
        </h1>
        <p className="max-w-xl font-mono text-sm leading-relaxed text-dead-400">
          Scroll down. The sections pin while each character fills with color.
          Scroll fast and the gradient spreads wider; scroll slow and it hugs a
          thin edge.
        </p>
      </header>

      <div className="h-[20vh]" />

      <p className="mb-8 font-mono text-sm text-dead-400">
        1. DEFAULT — scroll-linked fill, orange primary, full details
      </p>
      <TextFillAnimation
        text="Dead simple animations for React. Built for the scroll."
      />

      <div className="h-[30vh]" />

      <p className="mb-8 font-mono text-sm text-dead-400">
        2. CUSTOM COLORS — blue primary, near-white dim, amber-on-black details
      </p>
      <TextFillAnimation
        text="Every visual parameter is a prop. Recolor the entire sweep."
        primaryColor="#3b82f6"
        dimColor="color-mix(in srgb, #fafafa 22%, #0c0a09)"
        textColor="#fafafa"
        backgroundColor="#0c0a09"
      />

      <div className="h-[30vh]" />

      <p className="mb-8 font-mono text-sm text-dead-400">
        3. CUSTOM SIZING — smaller text, narrower width, tighter tracking
      </p>
      <TextFillAnimation
        text="Sizing is driven by CSS custom properties, not JS breakpoints."
        textSize="3.4vw"
        textWidth="62%"
        tabletTextSize="4.5vw"
        tabletTextWidth="78%"
        mobileTextSize="5.5vw"
        mobileTextWidth="88%"
        showDetails={false}
      />

      <div className="h-[30vh]" />

      <p className="mb-8 font-mono text-sm text-dead-400">
        4. FAST SCRUB — scrub=0.1 (fills almost instantly; a fast scroll spreads a wide gradient)
      </p>
      <TextFillAnimation
        text="A snappy scrub follows your scrollbar tightly."
        scrub={0.1}
        primaryColor="#22c55e"
      />

      <div className="h-[30vh]" />

      <p className="mb-8 font-mono text-sm text-dead-400">
        5. SLOW SCRUB — scrub=1.0 (heavy smoothing; fills lag behind, so the edge stays tight)
      </p>
      <TextFillAnimation
        text="A lazy scrub glides into place as you slow down."
        scrub={1}
        primaryColor="#a855f7"
      />

      <div className="h-[30vh]" />

      <p className="mb-8 font-mono text-sm text-dead-400">
        6. CUSTOM SCROLLER — pinned inside its own overflow container
      </p>
      <div className="w-full max-w-3xl px-4">
        <div
          ref={scrollerRef}
          tabIndex={0}
          aria-label="Scroll to preview the text fill"
          className="max-h-[400px] overflow-y-auto overscroll-contain rounded-lg border border-dead-800 bg-dead-900"
        >
          <TextFillAnimation
            scroller={scrollerRef}
            height="850px"
            viewportHeight="400px"
            showDetails={false}
            text="This one fills inside its own little scroller."
            textSize="2rem"
            tabletTextSize="1.7rem"
            mobileTextSize="1.5rem"
            primaryColor="#f59e0b"
          />
        </div>
      </div>

      <div className="h-[30vh]" />

      <p className="mb-8 font-mono text-sm text-dead-400">
        7. NO VELOCITY PRIMARY — velocityPrimary=false ignores primaryColor; dim → final only
      </p>
      <TextFillAnimation
        text="Velocity tint disabled. Characters step straight from dim to their final color."
        velocityPrimary={false}
        primaryColor="#ff6b00"
        textColor="#fafafa"
        dimColor="color-mix(in srgb, #fafafa 18%, #0c0a09)"
        backgroundColor="#0c0a09"
      />

      <div className="h-[30vh]" />

      <p className="mb-8 font-mono text-sm text-dead-400">
        8. CUSTOM FILL & DIM COLORS — distinct textColor (fill) vs dimColor (resting) vs primaryColor (velocity)
      </p>
      <TextFillAnimation
        text="The resting dim, the velocity tint, and the final fill are three separate props."
        textColor="#fbbf24"
        primaryColor="#fb923c"
        dimColor="color-mix(in srgb, #fbbf24 14%, #1c1917)"
        backgroundColor="#1c1917"
      />

      <footer className="h-[30vh]" />
    </div>
  )
}