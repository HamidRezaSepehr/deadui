import { RainbowButton } from '@/registry/rainbow-button'

export default function TestRainbowButtonPage() {
  return (
    <div className="flex flex-col items-center bg-dead-950 text-dead-50">
      <header className="flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-dead-400">
          Feature 25 — Free Component
        </p>
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">Rainbow Button</h1>
        <p className="max-w-xl font-mono text-sm leading-relaxed text-dead-400">
          A button whose border carries a continuously cycling rainbow gradient,
          in four variations: solid, outlined, gradient-filled text, and a wide
          blurred halo. Pure CSS — no WebGL, no canvas, no requestAnimationFrame.
        </p>
      </header>

      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          1. VARIANTS — all four looks at the default size. The first and last
          both paint a solid face with a thin animated ring; only the halo width
          and opacity differ. The middle two drop the face entirely, so the dark
          page shows straight through.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 rounded-lg border border-dead-800 bg-dead-900 p-12">
          <RainbowButton variant="default">Default</RainbowButton>
          <RainbowButton variant="outline">Outline</RainbowButton>
          <RainbowButton variant="gradient-text">Gradient Text</RainbowButton>
          <RainbowButton variant="glow">Glow</RainbowButton>
        </div>

        <p className="mt-8 font-mono text-sm leading-relaxed text-dead-400">
          The gradient is painted on three separate layers, not on the button: an
          inset ring masked to a 1px frame, the halo, and (for gradient-text) the
          label itself via background-clip. That is what lets the halo extend
          outside the button while the face still covers its middle.
        </p>
      </section>

      <div className="h-[20vh]" />

      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          2. SIZES — sm, default, lg and the square icon size. Sizing only sets
          height and horizontal padding, so every decorative layer is
          absolutely positioned inside a box that is already reserved: nothing
          here moves when the animation runs.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 rounded-lg border border-dead-800 bg-dead-900 p-12">
          <RainbowButton variant="outline" size="sm">
            Small
          </RainbowButton>
          <RainbowButton variant="outline" size="default">
            Default
          </RainbowButton>
          <RainbowButton variant="outline" size="lg">
            Large
          </RainbowButton>
          <RainbowButton variant="glow" size="icon" aria-label="Favourite">
            ★
          </RainbowButton>
        </div>
      </section>

      <div className="h-[20vh]" />

      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          3. SPEED — one full rainbow cycle, in seconds. The slow end is where
          you can actually watch a single stop travel across the ring; the fast
          end is where it starts to read as a shimmer rather than a colour.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 rounded-lg border border-dead-800 bg-dead-900 p-12">
          <RainbowButton variant="outline" speed={0.6}>
            0.6s
          </RainbowButton>
          <RainbowButton variant="outline" speed={2}>
            2s (default)
          </RainbowButton>
          <RainbowButton variant="outline" speed={6}>
            6s
          </RainbowButton>
          <RainbowButton variant="outline" speed={14}>
            14s
          </RainbowButton>
        </div>

        <p className="mt-8 font-mono text-sm leading-relaxed text-dead-400">
          speed feeds the <code className="text-dead-50">--speed</code> custom
          property, which is what the injected animation reads
          (<code className="text-dead-50">rainbow var(--speed, 2s) infinite
          linear</code>). One variable moves every layer at once, so the ring,
          the halo and the text always stay in phase.
        </p>
      </section>

      <div className="h-[20vh]" />

      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          4. BORDER WIDTH — the ring is a masked frame, so its thickness is a
          padding value rather than a real border. 1px is the default and is
          already crisp on a dark background; 4px turns it into a gradient slab.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 rounded-lg border border-dead-800 bg-dead-900 p-12">
          <RainbowButton variant="outline" borderWidth={1}>
            1px
          </RainbowButton>
          <RainbowButton variant="outline" borderWidth={2}>
            2px
          </RainbowButton>
          <RainbowButton variant="outline" borderWidth={4}>
            4px
          </RainbowButton>
          <RainbowButton variant="gradient-text" borderWidth={3}>
            3px + text
          </RainbowButton>
        </div>

        <p className="mt-8 font-mono text-sm leading-relaxed text-dead-400">
          Watch the corners as the ring thickens: the mask is concentric with the
          button&apos;s own radius, so the frame stays an even width all the way
          round instead of pinching the way a naive inset would.
        </p>
      </section>

      <div className="h-[20vh]" />

      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          5. ON A LIGHT SURFACE — the last thing worth checking. The ring and the
          face are separate layers precisely so the halo can escape the
          button&apos;s bounds, and a light backdrop is where a mis-sized halo
          gives itself away.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 rounded-lg border border-dead-800 bg-white p-12">
          <RainbowButton variant="default">On white</RainbowButton>
          <RainbowButton variant="outline">Outline on white</RainbowButton>
          <RainbowButton variant="glow">Glow on white</RainbowButton>
        </div>

        <p className="mt-8 font-mono text-sm leading-relaxed text-dead-400">
          Accessibility: the root is a real button, so it is reachable with Tab
          and fires on Enter / Space. The ring, the halo and the face are all
          decorative and hidden from assistive tech, so the accessible name is
          just the label — pass an aria-label for the icon size. Under
          prefers-reduced-motion the sweep stops on a still gradient and the
          button stays fully legible.
        </p>
      </section>

      <div className="h-[20vh]" />

      <footer className="w-full max-w-3xl px-8 pb-24 text-center">
        <p className="font-mono text-sm leading-relaxed text-dead-400">
          Keyboard note: Tab through the buttons and press Enter. Nothing in this
          component listens to pointer movement, so focus never shifts the
          gradient, and the active state is a 1px translate — a transform, so it
          costs no layout.
        </p>
      </footer>
    </div>
  )
}