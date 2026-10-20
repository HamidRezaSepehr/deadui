import { GradientBlur } from '@/registry/gradient-blur'

export default function TestGradientBlurPage() {
  return (
    <div className="relative min-h-screen bg-dead-950 text-dead-50">
      {/* PAGE-LEVEL FIXED BLURS — pinned to the viewport for the whole scroll. */}
      <GradientBlur />
      <GradientBlur side="top" />

      <header className="flex min-h-[55vh] w-full max-w-3xl flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-dead-400">
          Feature 41 — Free Component
        </p>
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">Gradient Blur</h1>
        <p className="max-w-xl font-mono text-sm leading-relaxed text-dead-400">
          Eight stacked backdrop-blur layers, each masked to its own gradient band.
          Together they dissolve content into a smooth fade instead of a hard
          cutoff. Two fixed strips — one at the top, one at the bottom — are
          already pinned to your viewport right now. Scroll and watch the text
          melt underneath them.
        </p>
      </header>

      <div className="h-[30vh]" />

      {/* 1. FIXED BOTTOM + FIXED TOP */}
      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm leading-relaxed text-dead-400">
          1. FIXED BOTTOM + FIXED TOP — The two strips framing this page are
          <code className="text-dead-50"> &lt;GradientBlur /&gt;</code> (defaults:
          <code className="text-dead-50"> position=&quot;fixed&quot;</code>,
          <code className="text-dead-50"> side=&quot;bottom&quot;</code>) and
          <code className="text-dead-50"> &lt;GradientBlur side=&quot;top&quot; /&gt;</code>.
          They never move: the viewport is their containing block, so every
          paragraph on this page fades as it crosses the top or bottom edge. The
          top strip reverses the blur ramp and the mask stops, so the strongest
          blur (30px) sits against the viewport edge and decays downward.
        </p>

        <div className="space-y-6 rounded-lg border border-dead-800 bg-dead-900 p-8 font-mono text-sm leading-relaxed text-dead-300">
          <p>
            The page-level use case is the classic one: a hero whose copy should
            dissolve into the fold, or a long article whose first and last lines
            never butt against the browser chrome with a razor-sharp edge.
          </p>
          <p>
            Both strips are <code className="text-dead-50">pointer-events-none</code> —
            they blur what is behind them and never intercept a single click,
            selection or scroll.
          </p>
        </div>
      </section>

      <div className="h-[30vh]" />

      {/* 2. ABSOLUTE (CONTAINER LEVEL) */}
      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm leading-relaxed text-dead-400">
          2. ABSOLUTE (CONTAINER LEVEL) — A scrollable{' '}
          <code className="text-dead-50">relative overflow-y-auto</code> box with{' '}
          <code className="text-dead-50">position=&quot;absolute&quot;</code> inside
          it. The blur belongs to the container, not the page: it anchors to the
          container&apos;s own bottom edge, so only the content of{' '}
          <em>this</em> box dissolves — the page around it is untouched.
        </p>

        <div className="relative h-[420px] overflow-y-auto rounded-lg border border-dead-800 bg-dead-900">
          <div className="space-y-5 p-8 font-mono text-sm leading-relaxed text-dead-300">
            <p className="font-sans text-xl font-semibold text-dead-50">
              Container-scoped fade
            </p>
            <p>
              This box scrolls on its own. The fade below is an absolutely
              positioned GradientBlur rendered inside the box — its containing
              block is the container&apos;s padding box, so it never bleeds onto
              the page behind it.
            </p>
            <p>
              Paragraph one: the layered blur ramp stacks eight backdrop-filter
              bands, each one masked with a linear gradient whose stops advance
              by 12.5% per layer. Where two bands overlap the blurs compound,
              which is what makes the falloff read as continuous glass instead of
              eight discrete steps.
            </p>
            <p>
              Paragraph two: no JavaScript runs anywhere in this component. The
              ramp is pure CSS — eight absolutely positioned children carrying
              backdrop-filter, -webkit-backdrop-filter and a paired
              mask-image / -webkit-mask-image each.
            </p>
            <p>
              Paragraph three: an absolute overlay lives in the scrolled content,
              so it travels with the content once this box scrolls. When you need
              the fade glued to the visible edge at every scroll position, reach
              for <code className="text-dead-50">position=&quot;sticky&quot;</code> —
              the next example.
            </p>
            <p>
              Paragraph four: keep scrolling — there is more text below, and the
              fade is waiting at the bottom edge of the container at rest.
            </p>
            <p>
              Paragraph five: eight layers × one div each — the whole overlay is
              ten DOM nodes and adds no per-frame work. Backdrop filtering is
              done by the compositor.
            </p>
            <p>
              Paragraph six: the mask stops run from 0% to 125%, deliberately
              overshooting the box so the outermost layer never paints a hard
              line inside the visible band.
            </p>
            <p className="pb-24 text-dead-50">— end of container content —</p>
          </div>

          <GradientBlur position="absolute" side="bottom" height="80px" zIndex="z-10" />
        </div>
      </section>

      <div className="h-[30vh]" />

      {/* 3. STICKY (CONTAINER LEVEL) */}
      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm leading-relaxed text-dead-400">
          3. STICKY (CONTAINER LEVEL) — The same container, but with{' '}
          <code className="text-dead-50">position=&quot;sticky&quot;</code> as the
          LAST child. A sticky bottom overlay stays pinned to the visible bottom
          edge of the scroller at every scroll position, then parks at the end of
          the content when you reach it. Scroll this box: the fade never leaves.
        </p>

        <div className="relative h-[420px] overflow-y-auto rounded-lg border border-dead-800 bg-dead-900">
          <div className="space-y-5 p-8 font-mono text-sm leading-relaxed text-dead-300">
            <p className="font-sans text-xl font-semibold text-dead-50">
              Sticky edge fade
            </p>
            <p>
              The blur is the last element in this scroll container — same eight
              layers, same masks, only the positioning class changes from
              absolute to sticky.
            </p>
            <p>
              Scroll down: the fade tracks the visible bottom edge the whole way,
              because a sticky element is offset from its flow position to keep
              its inset edge inside the scrollport.
            </p>
            <p>
              Rule of thumb: a <code className="text-dead-50">side=&quot;bottom&quot;</code>{' '}
              sticky blur goes last; a <code className="text-dead-50">side=&quot;top&quot;</code>{' '}
              sticky blur goes first. Placement is what gives sticky its
              containing block to travel through.
            </p>
            <p>
              More copy so there is somewhere to scroll to: the blur values
              double every layer — 0.23, 0.47, 0.94, 1.875, 3.75, 7.5, 15, 30 —
              a geometric ramp that matches how real glass thickens.
            </p>
            <p>
              And more: every layer is pointer-events-none, so text underneath
              stays selectable even while it is being blurred.
            </p>
            <p className="pb-24 text-dead-50">— end of container content —</p>
          </div>

          <GradientBlur position="sticky" side="bottom" height="80px" zIndex="z-10" />
        </div>
      </section>

      <div className="h-[30vh]" />

      {/* 4. CENTER PEAK VARIANT */}
      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm leading-relaxed text-dead-400">
          4. CENTER PEAK VARIANT — <code className="text-dead-50">variant=&quot;center-peak&quot;</code>{' '}
          replaces the monotonic ramp with a symmetric one (0.23 → 30 → 0.23), so
          the blur peaks in the MIDDLE of the band and clears towards both edges.
          Here it covers a whole card, reading as a frosted lens across the
          middle.
        </p>

        <div className="relative h-[280px] overflow-hidden rounded-lg border border-dead-800 bg-gradient-to-br from-dead-900 via-dead-800 to-dead-900">
          <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
            <p className="text-4xl font-bold tracking-tight md:text-5xl">
              Frosted Lens
            </p>
            <p className="max-w-sm font-mono text-sm leading-relaxed text-dead-300">
              The text in the middle of the card is smeared by the two 30px
              center layers; the title above and the caption below stay sharp
              because the outer layers of the peak profile are nearly clear.
            </p>
          </div>

          <GradientBlur
            position="absolute"
            side="bottom"
            variant="center-peak"
            height="100%"
            zIndex="z-10"
          />
        </div>
      </section>

      <div className="h-[30vh]" />

      <footer className="w-full max-w-3xl px-8 pb-40 text-center">
        <p className="font-mono text-sm leading-relaxed text-dead-400">
          Zero dependencies, zero JavaScript at runtime — the component renders
          plain divs and lets the compositor do the work. Everything is driven by
          five props: <code className="text-dead-50">variant</code>,{' '}
          <code className="text-dead-50">position</code>,{' '}
          <code className="text-dead-50">side</code>,{' '}
          <code className="text-dead-50">height</code> and{' '}
          <code className="text-dead-50">zIndex</code>. The extra bottom padding
          on this footer keeps the last line clear of the fixed bottom strip.
        </p>
      </footer>
    </div>
  )
}
