import { StaggeredGrid, StaggeredItem } from '@/registry/staggered-grid'

export default function TestStaggeredGridPage() {
  return (
    <main className="min-h-screen bg-dead-950 text-dead-50 px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-24">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Staggered Grid Reveal
          </h1>
          <p className="text-dead-400 text-lg max-w-2xl mx-auto">
            Declarative container component for animating lists and grids sequentially with
            Framer Motion. Scroll down to trigger each section.
          </p>
        </header>

        {/* Section 1: Default fade-up 3x3 grid */}
        <section id="section-1" className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Section 1: Default <code className="text-dead-red bg-dead-800 px-1.5 py-0.5 rounded text-sm">fade-up</code> 3×3 Grid</h2>
            <p className="text-dead-400 text-sm">
              Standard entrance animation with 0.1s stagger delay. Items animate from opacity 0 and y: 40.
            </p>
          </div>
          <StaggeredGrid variant="fade-up" stagger={0.1} duration={0.6} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <StaggeredItem key={i} className="bg-dead-800 rounded-xl p-6 border border-dead-700">
                <h3 className="text-lg font-medium mb-2">Card {i + 1}</h3>
                <p className="text-dead-400 text-sm">
                  Fade-up animation with 0.1s stagger delay.
                </p>
              </StaggeredItem>
            ))}
          </StaggeredGrid>
        </section>

        {/* Section 2: scale-in variant with faster stagger */}
        <section id="section-2" className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Section 2: <code className="text-dead-red bg-dead-800 px-1.5 py-0.5 rounded text-sm">scale-in</code> with Fast Stagger (0.05s)</h2>
            <p className="text-dead-400 text-sm">
              Scale-in animation with faster 0.05s stagger. Items scale from 0.8 to 1.
            </p>
          </div>
          <StaggeredGrid variant="scale-in" stagger={0.05} duration={0.5} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <StaggeredItem key={i} className="bg-dead-800 rounded-xl p-6 border border-dead-700">
                <h3 className="text-lg font-medium mb-2">Card {i + 1}</h3>
                <p className="text-dead-400 text-sm">
                  Scale-in animation with 0.05s stagger.
                </p>
              </StaggeredItem>
            ))}
          </StaggeredGrid>
        </section>

        {/* Section 3: blur-in variant with once={false} */}
        <section id="section-3" className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Section 3: <code className="text-dead-red bg-dead-800 px-1.5 py-0.5 rounded text-sm">blur-in</code> with <code className="text-dead-red bg-dead-800 px-1.5 py-0.5 rounded text-sm">once={false}</code></h2>
            <p className="text-dead-400 text-sm">
              Blur-in animation that replays when scrolling back up. Scroll down, then scroll back up to see it replay.
            </p>
          </div>
          <StaggeredGrid variant="blur-in" stagger={0.1} duration={0.7} once={false} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <StaggeredItem key={i} className="bg-dead-800 rounded-xl p-6 border border-dead-700">
                <h3 className="text-lg font-medium mb-2">Card {i + 1}</h3>
                <p className="text-dead-400 text-sm">
                  Blur-in with replay on scroll up.
                </p>
              </StaggeredItem>
            ))}
          </StaggeredGrid>
          <div className="h-64 bg-dead-800/50 rounded-xl border border-dead-700 flex items-center justify-center">
            <p className="text-dead-500">Scroll up to replay the animation above ↓</p>
          </div>
        </section>

        {/* Section 4: Mixed grid with different content and grid spans */}
        <section id="section-4" className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Section 4: Mixed Content Grid (Layout Preservation)</h2>
            <p className="text-dead-400 text-sm">
              Demonstrates <code className="text-dead-red bg-dead-800 px-1.5 py-0.5 rounded text-sm">StaggeredItem</code> preserving CSS Grid spans.
              The wide card uses <code className="text-dead-red bg-dead-800 px-1.5 py-0.5 rounded text-sm">col-span-2</code>, tall card uses <code className="text-dead-red bg-dead-800 px-1.5 py-0.5 rounded text-sm">row-span-2</code>.
            </p>
          </div>
          <StaggeredGrid variant="slide-left" stagger={0.08} duration={0.6} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StaggeredItem className="bg-dead-800 rounded-xl p-6 border border-dead-700 md:col-span-2 md:row-span-1">
              <h3 className="text-lg font-medium mb-2">Wide Card (col-span-2)</h3>
              <p className="text-dead-400 text-sm mb-4">
                This card spans 2 columns. The StaggeredItem wrapper preserves CSS Grid layout properties.
              </p>
              <div className="aspect-video bg-dead-700 rounded-lg flex items-center justify-center">
                <span className="text-dead-500">Image Placeholder</span>
              </div>
            </StaggeredItem>

            <StaggeredItem className="bg-dead-800 rounded-xl p-6 border border-dead-700 md:col-span-1 md:row-span-2">
              <h3 className="text-lg font-medium mb-2">Tall Card (row-span-2)</h3>
              <p className="text-dead-400 text-sm mb-4">
                This card spans 2 rows. Content height does not break the grid.
              </p>
              <div className="space-y-2">
                <div className="h-4 bg-dead-700 rounded w-3/4" />
                <div className="h-4 bg-dead-700 rounded w-1/2" />
                <div className="h-4 bg-dead-700 rounded w-5/6" />
                <div className="h-4 bg-dead-700 rounded w-full" />
              </div>
            </StaggeredItem>

            <StaggeredItem className="bg-dead-800 rounded-xl p-6 border border-dead-700">
              <h3 className="text-lg font-medium mb-2">Regular Card</h3>
              <p className="text-dead-400 text-sm">
                Standard grid item with normal content.
              </p>
            </StaggeredItem>

            <StaggeredItem className="bg-dead-800 rounded-xl p-6 border border-dead-700">
              <h3 className="text-lg font-medium mb-2">Regular Card</h3>
              <p className="text-dead-400 text-sm">
                Standard grid item with normal content.
              </p>
            </StaggeredItem>

            <StaggeredItem className="bg-dead-800 rounded-xl p-6 border border-dead-700">
              <h3 className="text-lg font-medium mb-2">Regular Card</h3>
              <p className="text-dead-400 text-sm">
                Standard grid item with normal content.
              </p>
            </StaggeredItem>
          </StaggeredGrid>
        </section>

        {/* Additional section demonstrating all 7 variants */}
        <section id="section-5" className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Section 5: All 7 Variants Side by Side</h2>
            <p className="text-dead-400 text-sm">
              Each row demonstrates a different variant. Scroll to trigger.
            </p>
          </div>
          <div className="space-y-12">
            {([
              { variant: 'fade-up', label: 'fade-up' },
              { variant: 'scale-in', label: 'scale-in' },
              { variant: 'blur-in', label: 'blur-in' },
              { variant: 'slide-left', label: 'slide-left' },
              { variant: 'slide-right', label: 'slide-right' },
              { variant: 'flip-x', label: 'flip-x' },
              { variant: 'flip-y', label: 'flip-y' },
            ] as const).map(({ variant, label }) => (
              <div key={label} className="space-y-4">
                <h3 className="text-sm font-medium text-dead-400 uppercase tracking-wide">
                  {label}
                </h3>
                <StaggeredGrid
                  variant={variant}
                  stagger={0.08}
                  duration={0.6}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4"
                >
                  {Array.from({ length: 4 }).map((_, i) => (
                    <StaggeredItem key={i} className="bg-dead-800 rounded-xl p-4 border border-dead-700 text-center">
                      <p className="text-sm text-dead-300">Item {i + 1}</p>
                    </StaggeredItem>
                  ))}
                </StaggeredGrid>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-center py-12 border-t border-dead-800 mt-8">
          <p className="text-dead-500 text-sm">
            Staggered Grid Reveal — Dead UI Component Library
          </p>
          <p className="text-dead-600 text-xs mt-2">
            Respects <code className="px-1 bg-dead-800 rounded">prefers-reduced-motion</code> via Framer Motion.
            All animations use GPU-accelerated transforms.
          </p>
        </footer>
      </div>
    </main>
  )
}