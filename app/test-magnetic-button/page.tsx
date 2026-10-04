import { MagneticButton } from '@/registry/magnetic-button'

export default function TestMagneticButtonPage() {
  return (
    <div className="flex flex-col items-center bg-dead-950 text-dead-50">
      <header className="flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-dead-400">
          Feature 09 — Free Component
        </p>
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
          Magnetic Elastic Button
        </h1>
        <p className="max-w-xl font-mono text-sm leading-relaxed text-dead-400">
          Hover a button and it leans toward your cursor like a magnet. Move
          away and it snaps back with an elastic spring. No layout shift — it
          travels on GPU transforms only.
        </p>
      </header>

      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          1. VARIANTS — all four looks, at default size, orbiting a couple of
          paragraphs of filler so you can feel the pull while reading. The
          buttons follow the cursor anywhere inside their bounding box, so
          drift across the words and they will track you as you go.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 rounded-lg border border-dead-800 bg-dead-900 p-10">
          <MagneticButton variant="default" size="md">
            Default
          </MagneticButton>
          <MagneticButton variant="outline" size="md">
            Outline
          </MagneticButton>
          <MagneticButton variant="glow" size="md">
            Glow
          </MagneticButton>
          <MagneticButton variant="ghost" size="md">
            Ghost
          </MagneticButton>
        </div>

        <p className="mt-8 font-mono text-sm leading-relaxed text-dead-400">
          The magnetic pull is subtle by default (strength 0.4), so the button
          always stays under the pointer and never feels like it is running
          away. Try sweeping the cursor in fast circles across the buttons —
          each one tracks the pointer with a different spring temperament.
        </p>
      </section>

      <div className="h-[20vh]" />

      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          2. SIZES — small, medium, and large in the same default variant. The
          pull is proportional to each button&apos;s own bounds, so a large
          button leans more than a small one even at the same strength.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 rounded-lg border border-dead-800 bg-dead-900 p-10">
          <MagneticButton variant="default" size="sm">
            Small
          </MagneticButton>
          <MagneticButton variant="outline" size="md">
            Medium
          </MagneticButton>
          <MagneticButton variant="ghost" size="lg">
            Large
          </MagneticButton>
        </div>

        <p className="mt-8 font-mono text-sm leading-relaxed text-dead-400">
          Sizes control the fixed height and horizontal padding (h-9 / h-11 /
          h-14), which is what gives the component its zero-CLS guarantee: the
          magnetic movement is a pure transform layered on top of the reserved
          layout box, so nothing around the button ever shifts.
        </p>
      </section>

      <div className="h-[20vh]" />

      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          3. EXTREME PULL — magneticStrength of 0.8. Here the button stretches
          almost all the way to the cursor, only lagging behind on fast
          flicks. The elastic spring is what keeps it from feeling truly wild.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 rounded-lg border border-dead-800 bg-dead-900 p-10">
          <MagneticButton variant="glow" size="md" magneticStrength={0.8}>
            Strong
          </MagneticButton>
          <MagneticButton variant="default" size="md" magneticStrength={0.8}>
            Stronger
          </MagneticButton>
          <MagneticButton variant="outline" size="lg" magneticStrength={0.8}>
            Strongest
          </MagneticButton>
        </div>

        <p className="mt-8 font-mono text-sm leading-relaxed text-dead-400">
          Strength only multiplies how far the button travels toward your
          cursor — the snap-back spring is untouched, so releasing the hover
          still lands with the same amount of elastic overshoot you feel on
          the default buttons.
        </p>
      </section>

      <div className="h-[20vh]" />

      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          4. ELASTICITY — how springy the snap-back feels. The default (0.2)
          maps to the spec spring (stiffness 150, damping 15, mass 0.8).
          Lower is a stiffer, near-critical return; higher bounces past center
          once or twice on the way home.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 rounded-lg border border-dead-800 bg-dead-900 p-10">
          <MagneticButton variant="outline" size="md" elasticity={0.1}>
            Rigid (0.1)
          </MagneticButton>
          <MagneticButton variant="default" size="md" elasticity={0.2}>
            Default (0.2)
          </MagneticButton>
          <MagneticButton variant="ghost" size="md" elasticity={0.4}>
            Bouncy (0.4)
          </MagneticButton>
        </div>

        <p className="mt-8 font-mono text-sm leading-relaxed text-dead-400">
          These stop reporting a clear winner on purpose. Every track on this
          page uses the same mouse-tracking logic; only the spring tuning
          changes. Find the temperament that suits your product and pin it
          through the elasticity prop.
        </p>
      </section>

      <div className="h-[20vh]" />

      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          5. SHAPES — rounded-full (default), rounded-lg, and sharp corners on
          the same variant, so the component fits inside any layout language.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 rounded-lg border border-dead-800 bg-dead-900 p-10">
          <MagneticButton variant="default" size="md" shape="rounded">
            Rounded
          </MagneticButton>
          <MagneticButton variant="outline" size="md" shape="soft">
            Soft
          </MagneticButton>
          <MagneticButton variant="glow" size="md" shape="sharp">
            Sharp
          </MagneticButton>
        </div>
      </section>

      <div className="h-[20vh]" />

      <footer className="w-full max-w-3xl px-8 pb-24 text-center">
        <p className="font-mono text-sm leading-relaxed text-dead-400">
          Keyboard note: Tab to a button and it stays put. The magnetic effect
          only fires on real mouse events, so focus never yanks the button
          around, and Enter / Space click it like any native button. If
          prefers-reduced-motion is set, the springs are skipped entirely and
          the button renders static.
        </p>
      </footer>
    </div>
  )
}