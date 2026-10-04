import { GradientBorder } from '@/registry/gradient-border'

export default function TestGradientBorderPage() {
  return (
    <div className="min-h-screen bg-dead-950 text-dead-50 py-20 px-6">
      <div className="max-w-5xl mx-auto space-y-24">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Gradient Border Glow
          </h1>
          <p className="text-lg text-dead-400 max-w-2xl mx-auto">
            High-performance animated gradient borders with four variants:
            rotating, pulsing, static, and spotlight (mouse-tracking).
          </p>
        </header>

        {/* Section 1: Default Rotating Border */}
        <section id="rotating" className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-semibold">Rotating Border</h2>
            <p className="text-dead-400">
              Classic spinning conic gradient with default rainbow colors.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GradientBorder id="gb-rot-default" className="aspect-square md:aspect-[4/3]">
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <p className="text-xl font-medium">Default</p>
                <p className="text-dead-400 text-sm mt-2">4s • 1px • no blur</p>
              </div>
            </GradientBorder>
            <GradientBorder id="gb-rot-fast" speed={2} className="aspect-square md:aspect-[4/3]">
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <p className="text-xl font-medium">Fast (2s)</p>
                <p className="text-dead-400 text-sm mt-2">2s • 1px • no blur</p>
              </div>
            </GradientBorder>
            <GradientBorder id="gb-rot-slow" speed={8} className="aspect-square md:aspect-[4/3]">
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <p className="text-xl font-medium">Slow (8s)</p>
                <p className="text-dead-400 text-sm mt-2">8s • 1px • no blur</p>
              </div>
            </GradientBorder>
          </div>
        </section>

        {/* Section 2: Pulsing Border */}
        <section id="pulsing" className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-semibold">Pulsing Border</h2>
            <p className="text-dead-400">
              Breathing opacity animation with high blur for ambient glow effect.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GradientBorder
              id="gb-pulse-hi"
              variant="pulsing"
              speed={6}
              blur={16}
              intensity={0.8}
              className="aspect-square md:aspect-[4/3]"
            >
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <p className="text-xl font-medium">High Blur</p>
                <p className="text-dead-400 text-sm mt-2">6s • 1px • 16px blur</p>
              </div>
            </GradientBorder>
            <GradientBorder
              id="gb-pulse-md"
              variant="pulsing"
              speed={3}
              blur={8}
              intensity={1}
              className="aspect-square md:aspect-[4/3]"
            >
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <p className="text-xl font-medium">Medium Blur</p>
                <p className="text-dead-400 text-sm mt-2">3s • 1px • 8px blur</p>
              </div>
            </GradientBorder>
            <GradientBorder
              id="gb-pulse-heavy"
              variant="pulsing"
              speed={10}
              blur={24}
              intensity={0.6}
              className="aspect-square md:aspect-[4/3]"
            >
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <p className="text-xl font-medium">Heavy Glow</p>
                <p className="text-dead-400 text-sm mt-2">10s • 1px • 24px blur</p>
              </div>
            </GradientBorder>
          </div>
        </section>

        {/* Section 3: Static Border */}
        <section id="static" className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-semibold">Static Border</h2>
            <p className="text-dead-400">
              Fixed linear gradient — no animation, pure gradient border.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GradientBorder
              variant="static"
              colors={['#dc2626', '#ef4444', '#fca5a5']}
              className="aspect-square md:aspect-[4/3]"
            >
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <p className="text-xl font-medium">Red Gradient</p>
                <p className="text-dead-400 text-sm mt-2">Static • 1px</p>
              </div>
            </GradientBorder>
            <GradientBorder
              variant="static"
              colors={['#00dfd8', '#06b6d4', '#67e8f9']}
              className="aspect-square md:aspect-[4/3]"
            >
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <p className="text-xl font-medium">Cyan Gradient</p>
                <p className="text-dead-400 text-sm mt-2">Static • 1px</p>
              </div>
            </GradientBorder>
            <GradientBorder
              variant="static"
              colors={['#a855f7', '#d946ef', '#f0abfc']}
              className="aspect-square md:aspect-[4/3]"
            >
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <p className="text-xl font-medium">Purple Gradient</p>
                <p className="text-dead-400 text-sm mt-2">Static • 1px</p>
              </div>
            </GradientBorder>
          </div>
        </section>

        {/* Section 4: Spotlight Border */}
        <section id="spotlight" className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-semibold">Spotlight Border</h2>
            <p className="text-dead-400">
              Mouse-tracking radial gradient border. Hover and move over the cards.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GradientBorder
              variant="spotlight"
              colors={['rgba(255, 255, 255, 0.85)', 'rgba(220, 38, 38, 0.45)']}
              className="aspect-square md:aspect-[4/3]"
            >
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <p className="text-xl font-medium">White → Red</p>
                <p className="text-dead-400 text-sm mt-2">1px • default width</p>
              </div>
            </GradientBorder>
            <GradientBorder
              variant="spotlight"
              colors={['rgba(0, 223, 216, 0.8)', 'rgba(168, 85, 247, 0.4)']}
              width={3}
              className="aspect-square md:aspect-[4/3]"
            >
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <p className="text-xl font-medium">Cyan → Purple</p>
                <p className="text-dead-400 text-sm mt-2">3px width</p>
              </div>
            </GradientBorder>
            <GradientBorder
              variant="spotlight"
              colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.2)']}
              width={2}
              className="aspect-square md:aspect-[4/3]"
            >
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <p className="text-xl font-medium">Subtle White</p>
                <p className="text-dead-400 text-sm mt-2">2px width</p>
              </div>
            </GradientBorder>
          </div>
        </section>

        {/* Section 5: Custom Colors & Width */}
        <section id="custom" className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-semibold">Custom Configuration</h2>
            <p className="text-dead-400">
              Dead UI red accent, varying widths, radius options, and intensity control.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GradientBorder
              colors={['#dc2626', '#ef4444', '#fca5a5']}
              width={4}
              radius="md"
              speed={5}
              className="aspect-square"
            >
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <p className="text-lg font-medium">4px Width</p>
                <p className="text-dead-400 text-xs mt-1">Red • md radius</p>
              </div>
            </GradientBorder>
            <GradientBorder
              colors={['#dc2626', '#ef4444']}
              width={2}
              radius="lg"
              speed={4}
              intensity={0.7}
              className="aspect-square"
            >
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <p className="text-lg font-medium">lg Radius</p>
                <p className="text-dead-400 text-xs mt-1">Red • 70% intensity</p>
              </div>
            </GradientBorder>
            <GradientBorder
              colors={['#dc2626', '#7928ca', '#00dfd8']}
              width={3}
              radius="full"
              speed={6}
              className="aspect-square"
            >
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <p className="text-lg font-medium">Full Rounded</p>
                <p className="text-dead-400 text-xs mt-1">Multi-color • 3px</p>
              </div>
            </GradientBorder>
            <GradientBorder
              variant="pulsing"
              colors={['#dc2626', '#ef4444']}
              width={2}
              radius="sm"
              speed={3}
              blur={12}
              intensity={0.9}
              className="aspect-square"
            >
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <p className="text-lg font-medium">Pulsing + Blur</p>
                <p className="text-dead-400 text-xs mt-1">sm radius • 12px blur</p>
              </div>
            </GradientBorder>
          </div>

          {/* Elongated shapes are the hard case for a rotating layer: a box only
              covers itself at multiples of 90deg, and a wide pill is uncovered
              at almost every angle. These prove the coverage fix holds well
              past a square card. */}
          <div className="mt-10 space-y-6">
            <GradientBorder
              id="gb-pill-wide"
              radius="full"
              speed={5}
              className="h-16 w-full max-w-2xl"
            >
              <div className="flex h-full items-center justify-center px-8">
                <p className="text-lg font-medium">Wide pill — 24:1 aspect ratio</p>
              </div>
            </GradientBorder>
            <GradientBorder id="gb-bar-wide" radius="full" speed={6} className="h-10 w-full max-w-3xl">
              <div className="flex h-full items-center justify-center px-8">
                <p className="text-sm font-medium">Wide bar — 30:1 aspect ratio</p>
              </div>
            </GradientBorder>
          </div>
        </section>

        {/* Footer Note */}
        <footer className="text-center text-dead-400 text-sm border-t border-dead-800 pt-12">
          <p>
            All animations are CSS-driven (GPU-accelerated). The spotlight variant uses CSS variables
            for mouse tracking — zero React re-renders during interaction.
          </p>
          <p className="mt-2">
            Respects <code className="font-mono">prefers-reduced-motion</code>: the rotation and the
            pulse both stop, leaving a still gradient border.
          </p>
        </footer>
      </div>
    </div>
  )
}