import { LineShadowText } from '@/registry/line-shadow-text'

export default function TestLineShadowTextPage() {
  return (
    <div className="flex flex-col items-center bg-dead-950 text-dead-50">
      <header className="flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-dead-400">
          Feature 40 — Free Component
        </p>
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">Line Shadow Text</h1>
        <p className="max-w-xl font-mono text-sm leading-relaxed text-dead-400">
          A diagonal line-shadow hatch painted behind the glyphs through a
          pseudo-element, crawling one tile per animation cycle. Colour, angle,
          offset, width and speed are all CSS variables driven by props — no
          JavaScript runs while it animates.
        </p>
      </header>

      {/* 1. DEFAULT */}
      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          1. DEFAULT — The stock configuration (<code className="text-dead-50">shadowColor=&quot;black&quot;</code>,
          45deg, 0.04em offset) on a light card, which is the environment it is
          designed for. The hatch sits 0.04em behind the text, so only a thin
          line-shadow escapes along the lower-right edge of every glyph.
        </p>

        <div className="flex items-center justify-center rounded-lg border border-dead-800 bg-white p-12">
          <LineShadowText className="text-5xl font-bold tracking-tight text-black">
            Ship Fast
          </LineShadowText>
        </div>
      </section>

      <div className="h-[20vh]" />

      {/* 2. CUSTOM COLOR & ANGLE */}
      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          2. CUSTOM COLOR &amp; ANGLE — A vibrant{' '}
          <code className="text-dead-50">shadowColor</code> at{' '}
          <code className="text-dead-50">angle={'{90}'}</code> flips the hatch
          axis to horizontal bands, crawling sideways behind the heading.
        </p>

        <div className="flex items-center justify-center rounded-lg border border-dead-800 bg-dead-900 p-12">
          <LineShadowText
            as="h2"
            shadowColor="#ef4444"
            angle={90}
            duration="3s"
            className="text-5xl font-bold tracking-tight text-dead-50"
          >
            90 Degrees
          </LineShadowText>
        </div>
      </section>

      <div className="h-[20vh]" />

      {/* 3. DIFFERENT ELEMENTS */}
      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          3. DIFFERENT ELEMENTS — The <code className="text-dead-50">as</code> prop
          swaps the rendered element while keeping motion props typed against it:
          a block-level <code className="text-dead-50">h1</code>, a wrapping{' '}
          <code className="text-dead-50">p</code>, and an inline{' '}
          <code className="text-dead-50">span</code> inside a sentence.
        </p>

        <div className="space-y-8 rounded-lg border border-dead-800 bg-dead-900 p-12">
          <LineShadowText
            as="h1"
            shadowColor="#60a5fa"
            className="text-4xl font-bold tracking-tight text-dead-50"
          >
            Block Heading
          </LineShadowText>

          <LineShadowText
            as="p"
            shadowColor="#a855f7"
            angle={135}
            className="max-w-xl text-xl leading-relaxed text-dead-50"
          >
            A whole paragraph wearing the shadow, wrapping across lines.
          </LineShadowText>

          <p className="text-lg leading-relaxed text-dead-300">
            Inline in a sentence —{' '}
            <LineShadowText shadowColor="#34d399" className="font-semibold text-dead-50">
              this phrase
            </LineShadowText>{' '}
            keeps flowing with the surrounding text.
          </p>
        </div>
      </section>

      <div className="h-[20vh]" />

      {/* 4. CUSTOM SIZING */}
      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          4. CUSTOM SIZING — <code className="text-dead-50">shadowOffset</code> and{' '}
          <code className="text-dead-50">shadowWidth</code> side by side. Width is
          both the hatch tile size and the travel per cycle: a fine 0.03em hatch
          drifting slowly versus a chunky 0.14em hatch with a proud 0.1em offset.
        </p>

        <div className="flex flex-col items-center justify-center gap-12 rounded-lg border border-dead-800 bg-dead-900 p-12">
          <div className="flex flex-col items-center gap-4">
            <LineShadowText
              shadowColor="#f97316"
              shadowOffset="0.015em"
              shadowWidth="0.03em"
              duration="4s"
              className="text-3xl font-bold text-dead-50"
            >
              Subtle Hatch
            </LineShadowText>
            <p className="font-mono text-xs text-dead-400">
              offset 0.015em / width 0.03em / duration 4s
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <LineShadowText
              shadowColor="#f97316"
              shadowOffset="0.1em"
              shadowWidth="0.14em"
              duration="1.5s"
              className="text-3xl font-bold text-dead-50"
            >
              Bold Hatch
            </LineShadowText>
            <p className="font-mono text-xs text-dead-400">
              offset 0.1em / width 0.14em / duration 1.5s
            </p>
          </div>
        </div>
      </section>

      <div className="h-[20vh]" />

      <footer className="w-full max-w-3xl px-8 pb-24 text-center">
        <p className="font-mono text-sm leading-relaxed text-dead-400">
          Every example uses the <code className="text-dead-50">line-shadow</code>{' '}
          keyframe and the <code className="text-dead-50">animate-line-shadow</code>{' '}
          utility that ship with the component through{' '}
          <code className="text-dead-50">deadui init</code>. The crawl is pure CSS
          on the pseudo-element — motion only renders the element itself — and it
          stops under prefers-reduced-motion, leaving a static hatch.
        </p>
      </footer>
    </div>
  )
}
