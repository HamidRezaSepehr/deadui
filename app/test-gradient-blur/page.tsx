import { GradientBlur } from '@/registry/gradient-blur'

export default function TestGradientBlurPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center bg-dead-950 text-dead-50">
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

      {/* 2. STICKY TOP (CONTAINER LEVEL) */}
      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm leading-relaxed text-dead-400">
          2. STICKY TOP (CONTAINER LEVEL) — A scrollable{' '}
          <code className="text-dead-50">relative overflow-y-auto</code> box with a{' '}
          <code className="text-dead-50">position=&quot;sticky&quot;</code> blur as
          the FIRST child. The fade is welded to the top edge of the container:
          scroll this box and the text slides underneath it while the blur never
          leaves the top.
        </p>

        <div className="relative h-[420px] overflow-y-auto rounded-lg border border-dead-800 bg-dead-900">
          <GradientBlur position="sticky" side="top" height="80px" zIndex="z-10" />

          <div className="space-y-5 p-8 font-mono text-sm leading-relaxed text-dead-300">
            <p className="font-sans text-xl font-semibold text-dead-50">
              Sticky top fade
            </p>
            <p>
              The blur is the first element in this scroll container — it occupies
              80px of normal flow at the top, and every line of text scrolls up
              underneath it. The fade belongs to the container, not the page: only
              the content of <em>this</em> box dissolves.
            </p>
            <p>
              Scroll down: the band never moves. A sticky element is offset from
              its flow position to keep its inset edge inside the scrollport —
              <code className="text-dead-50"> side=&quot;top&quot;</code> means the
              top edge stays pinned to the container&apos;s top at every scroll
              position.
            </p>
            <p>
              The blur still stacks eight backdrop-filter layers, each masked to
              its own gradient band with stops advancing by 12.5% per layer. Where
              two bands overlap the blurs compound, which is what makes the
              falloff read as continuous glass instead of eight discrete steps.
            </p>
            <p>
              No JavaScript runs anywhere in this component. The ramp is pure CSS —
              eight absolutely positioned children carrying backdrop-filter,
              -webkit-backdrop-filter and a paired mask-image /
              -webkit-mask-image each.
            </p>
            <p>
              Because <code className="text-dead-50">side=&quot;top&quot;</code>{' '}
              reverses both the blur values and the mask stops, the strongest blur
              (30px) sits against the container&apos;s top edge and decays
              downward to fully sharp at the bottom of the band.
            </p>
            <p>
              Placement rule: a sticky blur takes its side from the edge it fades —
              <code className="text-dead-50"> side=&quot;top&quot;</code> goes
              FIRST, <code className="text-dead-50"> side=&quot;bottom&quot;</code>{' '}
              goes LAST. Placement is what gives sticky its containing block to
              travel through.
            </p>
            <p>
              The whole overlay is ten DOM nodes — root, layers wrapper and eight
              bands — and adds no per-frame work: backdrop filtering is done by
              the compositor.
            </p>
            <p>
              The mask stops run from 0% to 125% (reversed: −12.5% to 112.5%),
              deliberately overshooting the band so the outermost layer never
              paints a hard line inside the visible strip.
            </p>
            <p>
              Keep scrolling — the fade stays pinned to the top no matter how far
              you go.
            </p>
            <p>
              Eight layers × one div each: the geometric ramp doubles every layer —
              0.23, 0.47, 0.94, 1.875, 3.75, 7.5, 15, 30 — a profile that matches
              how real glass thickens.
            </p>
            <p>
              Every layer is pointer-events-none, so text underneath stays
              selectable and clickable even while it is being blurred.
            </p>
            <p className="pb-24 text-dead-50">— end of container content —</p>
          </div>
        </div>
      </section>

      <div className="h-[30vh]" />

      {/* 3. STICKY BOTTOM (CONTAINER LEVEL) */}
      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm leading-relaxed text-dead-400">
          3. STICKY BOTTOM (CONTAINER LEVEL) — The same container shape, mirrored:
          a <code className="text-dead-50">position=&quot;sticky&quot;</code> blur
          as the LAST child. The fade tracks the visible bottom edge the whole
          way down a long scroll, then parks at the end of the content. Plenty of
          copy in this one — scroll it for a while.
        </p>

        <div className="relative h-[420px] overflow-y-auto rounded-lg border border-dead-800 bg-dead-900">
          <div className="space-y-5 p-8 font-mono text-sm leading-relaxed text-dead-300">
            <p className="font-sans text-xl font-semibold text-dead-50">
              Sticky bottom fade
            </p>
            <p>
              The blur is the last element in this scroll container — same eight
              layers, same masks, only the side is flipped. Scroll down: the fade
              tracks the visible bottom edge the whole way, because a sticky
              element is offset from its flow position to keep its inset edge
              inside the scrollport.
            </p>
            <p>
              This box has a lot more to scroll through than section 2, so you can
              watch the pinned band hold its ground across a long distance — it
              never drifts, never jumps, and releases only when you reach the end
              of the content.
            </p>
            <p>
              The blur values double every layer — 0.23, 0.47, 0.94, 1.875, 3.75,
              7.5, 15, 30 — a geometric ramp that matches how real glass
              thickens. Stacked and masked, the eight bands compound into one
              continuous falloff.
            </p>
            <p>
              Rule of thumb: a{' '}
              <code className="text-dead-50">side=&quot;bottom&quot;</code> sticky
              blur goes last; a <code className="text-dead-50">side=&quot;top&quot;</code>{' '}
              sticky blur goes first — section 2 shows the top placement. The
              component does not care: the only thing that changes is which
              Tailwind classes the <code className="text-dead-50">position</code>{' '}
              map writes and whether the ramp is reversed.
            </p>
            <p>
              Nothing here is measured or observed at runtime. No scroll listeners,
              no ResizeObserver, no requestAnimationFrame — the browser&apos;s own
              sticky layout does the tracking, and the compositor does the blur.
            </p>
            <p>
              Every layer carries both <code className="text-dead-50">mask-image</code>{' '}
              and <code className="text-dead-50">-webkit-mask-image</code>, and
              both <code className="text-dead-50">backdrop-filter</code> and{' '}
              <code className="text-dead-50">-webkit-backdrop-filter</code>, so the
              same falloff renders in Safari and Chromium alike.
            </p>
            <p>
              The band is 80px tall by default in these demos — pass any CSS
              length to <code className="text-dead-50">height</code> to make the
              fade as shallow or as deep as the design needs.
            </p>
            <p>
              Because the overlay is a real element in the flow, it also reserves
              its 80px at the end of the content: when you hit the bottom of this
              box the last paragraphs sit comfortably above the parked band
              instead of underneath it.
            </p>
            <p>
              More filler, more scroll: the mask for layer i runs transparent at
              stops[i]%, opaque from stops[i+1]% to stops[i+2]%, and transparent
              again at stops[i+3]% — eight interleaved windows over one shared
              0–125% axis.
            </p>
            <p>
              The strongest layer (30px) is the last window, hard against the
              bottom edge; the lightest (0.23px) is the first, almost invisible.
              Your eye reads the stack as a single sheet of thickening glass.
            </p>
            <p>
              Still scrolling — good. The fade has not moved a pixel. That is
              sticky layout doing its job, not JavaScript.
            </p>
            <p>
              Selection works right through the blur: the overlay is
              pointer-events-none, so you can highlight text inside the faded
              band exactly as you would anywhere else.
            </p>
            <p>
              The overlay paints above the content (z-10) but never intercepts it —
              stacking context, not capture.
            </p>
            <p>
              One more for the road: the same ten DOM nodes serve every
              configuration on this page — two viewport strips, this container
              band, the top band in section 2 and the lens card in section 4.
            </p>
            <p>
              Swap <code className="text-dead-50">variant</code> to{' '}
              <code className="text-dead-50">center-peak</code> and the same
              placement fades from a symmetric profile instead — see section 4.
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
