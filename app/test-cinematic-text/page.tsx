import { CinematicText } from '@/registry/cinematic-text'

export default function TestPage() {
  return (
    <div className="min-h-screen flex flex-col items-center gap-16 bg-dead-black p-8">
      <div className="h-[50vh]" />

      <p className="font-mono text-sm text-dead-400">
        1. DEFAULT — fade-up, plays once, triggers at &quot;top 85%&quot;
      </p>
      <CinematicText variant="fade-up" className="text-4xl font-semibold text-dead-muted">
        Scroll down to see more effects.
      </CinematicText>

      <div className="h-[100vh]" />

      <p className="font-mono text-sm text-dead-400">
        1. DEFAULT — fade-up, replay, triggers at &quot;top 85%&quot;
      </p>
      <CinematicText variant="fade-up" once={false} className="text-4xl font-semibold text-dead-muted">
        Scroll down to see more effects.
      </CinematicText>

      <div className="h-[100vh]" />

      <p className="font-mono text-sm text-dead-400">
        2. CUSTOM POSITION — triggered when its center hits the viewport center (start=&quot;center center&quot;)
      </p>
      <CinematicText variant="blur-in" start="center center" className="text-5xl font-bold text-dead-white">
        Dead simple animations for React.
      </CinematicText>

      <div className="h-[100vh]" />

      <p className="font-mono text-sm text-dead-400">
        3. REPEAT — default once=false replays every entry from either scroll direction (both-ways)
      </p>
      <CinematicText variant="slide-stagger" splitBy="words" once={false} className="text-5xl font-bold text-dead-accent">
        Each word slides in individually.
      </CinematicText>

      <div className="h-[100vh]" />

      <p className="font-mono text-sm text-dead-400">
        4. DOWN ONLY — explicit toggleActions=&quot;play none none reverse&quot; overrides the direction (only plays scrolling down)
      </p>
      <CinematicText
        variant="fade-up"
        once={false}
        toggleActions="play none none reverse"
        className="text-5xl font-bold text-dead-white"
      >
        Only animates scrolling down.
      </CinematicText>

      <div className="h-[100vh]" />

      <p className="font-mono text-sm text-dead-400">
        5. SCRUBBED — text progress is tied directly to the scrollbar (scrub=true)
      </p>
      <CinematicText variant="blur-in" splitBy="words" scrub={true} className="text-5xl font-bold text-dead-white">
        Scroll slowly to scrub this one.
      </CinematicText>

      <div className="h-[100vh]" />

      <p className="font-mono text-sm text-dead-400">
        6. ADVANCED VARIANTS — colour reveal (dim gray → white, opacity 0.3 → 1)
        plus the mask-reveal clip effect
      </p>
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-xs text-dead-400">rise-color</span>
          <CinematicText variant="rise-color" className="text-3xl font-bold text-dead-white">
            Rise with color.
          </CinematicText>
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-xs text-dead-400">slide-left-color</span>
          <CinematicText variant="slide-left-color" className="text-3xl font-bold text-dead-white">
            Slide with color.
          </CinematicText>
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-xs text-dead-400">scale-blur-color</span>
          <CinematicText variant="scale-blur-color" className="text-3xl font-bold text-dead-white">
            Scale with color.
          </CinematicText>
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-xs text-dead-400">diagonal-blur-color</span>
          <CinematicText variant="diagonal-blur-color" className="text-3xl font-bold text-dead-white">
            Diagonal with color.
          </CinematicText>
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-xs text-dead-400">flip-x-color</span>
          <CinematicText variant="flip-x-color" className="text-3xl font-bold text-dead-white">
            Flip X with color.
          </CinematicText>
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-xs text-dead-400">heavy-flip-color</span>
          <CinematicText variant="heavy-flip-color" className="text-3xl font-bold text-dead-white">
            Heavy flip with color.
          </CinematicText>
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-xs text-dead-400">flip-top-color</span>
          <CinematicText variant="flip-top-color" className="text-3xl font-bold text-dead-white">
            Flip top with color.
          </CinematicText>
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-xs text-dead-400">mask-reveal</span>
          <CinematicText variant="mask-reveal" className="text-3xl font-bold text-dead-white">
            Mask reveal.
          </CinematicText>
        </div>
      </div>

      <div className="h-[50vh]" />
    </div>
  )
}