import { SpotlightCard } from "@/registry/spotlight-card";

const gridItems = [
  {
    tag: "ENGINE",
    title: "Zero re-renders",
    body: "Mouse coordinates are written to CSS variables, never to React state.",
  },
  {
    tag: "ENGINE",
    title: "GPU composited",
    body: "Only opacity and a masked gradient change per frame. No layout work.",
  },
  {
    tag: "ENGINE",
    title: "No layout shift",
    body: "The card reserves its own box. The spotlight never reflows the page.",
  },
  {
    tag: "GLOW",
    title: "Border only",
    body: "glowType=\"border\" lights the hairline and nothing inside the card.",
  },
  {
    tag: "GLOW",
    title: "Surface only",
    body: "glowType=\"background\" washes the card face and leaves the edge alone.",
  },
  {
    tag: "GLOW",
    title: "Both at once",
    body: "glowType=\"both\" is the default: edge and face lit by one gradient.",
  },
  {
    tag: "TILT",
    title: "Optional 3D",
    body: "enableTilt rotates the card around the cursor, easing back on leave.",
  },
  {
    tag: "TILT",
    title: "Tunable depth",
    body: "tiltIntensity caps the rotation in degrees. Ten is the default.",
  },
  {
    tag: "TILT",
    title: "Snap-back ease",
    body: "The transition is dropped while tracking, restored for the return.",
  },
];

// One shape per grid row so the cva shape variants are exercisable without
// adding a fifth section: rounded (default) / soft / sharp.
const shapeRows = ["rounded", "soft", "sharp"] as const;

const glowModes = [
  { type: "border", label: 'border', note: "edge only" },
  { type: "background", label: "background", note: "face only" },
  { type: "both", label: "both", note: "default" },
  { type: "none", label: "none", note: "flat" },
] as const;

function CardBody({
  tag,
  title,
  body,
}: {
  tag: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex h-full flex-col justify-between gap-6">
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-dead-600">
          {tag}
        </span>
        <h3 className="mt-3 text-base font-medium text-dead-50">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-dead-400">{body}</p>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-dead-700">
        deadui
      </span>
    </div>
  );
}

export default function TestSpotlightCardPage() {
  return (
    <div className="flex flex-col items-center bg-dead-950 text-dead-50">
      <header className="flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-dead-400">
          Feature 11 — Free Component
        </p>
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
          Spotlight Hover Card
        </h1>
        <p className="max-w-xl font-mono text-sm leading-relaxed text-dead-400">
          A card that tracks the cursor and lights the area around it with a
          radial gradient. Position lives in{" "}
          <span className="text-dead-200">--mouse-x</span> /{" "}
          <span className="text-dead-200">--mouse-y</span>, written straight to
          the DOM node — so moving the mouse never re-renders React.
        </p>
      </header>

      <div className="w-full max-w-5xl space-y-6 px-8">
        <section>
          <p className="mb-4 font-mono text-sm text-dead-400">
            1. 3×3 GRID — Linear-style cards. Sweep the mouse across the grid and
            watch the spotlight hop card to card without a single React render.
            One <span className="text-dead-200">shape</span> per row: rounded,
            soft, sharp.
          </p>
          <div className="rounded-lg border border-dead-800 bg-dead-900 p-8">
            <div className="grid grid-cols-3 gap-4">
              {gridItems.map((item, i) => (
                <SpotlightCard
                  key={item.title}
                  id={`sc-grid-${i + 1}`}
                  shape={shapeRows[Math.floor(i / 3)]}
                  className="min-h-[200px] bg-dead-900"
                >
                  <CardBody tag={item.tag} title={item.title} body={item.body} />
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>

        <div className="h-[10vh]" />

        <section>
          <p className="mb-4 font-mono text-sm text-dead-400">
            2. GLOW TYPES — <span className="text-dead-200">border</span> paints
            the 1px ring only,{" "}
            <span className="text-dead-200">background</span> washes the face
            only, <span className="text-dead-200">both</span> does each,{" "}
            <span className="text-dead-200">none</span> stays flat.
          </p>
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-dead-800 bg-dead-900 p-8 md:grid-cols-4">
            {glowModes.map((mode) => (
              <div key={mode.type} className="space-y-3">
                <SpotlightCard
                  id={`sc-glow-${mode.type}`}
                  glowType={mode.type}
                  className="min-h-[160px] bg-dead-900"
                >
                  <div className="flex h-full flex-col justify-between gap-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-dead-600">
                      {mode.note}
                    </span>
                    <span className="font-mono text-sm text-dead-50">
                      {mode.label}
                    </span>
                  </div>
                </SpotlightCard>
                <p className="text-center font-mono text-[10px] text-dead-600">
                  glowType=&quot;{mode.type}&quot;
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="h-[10vh]" />

        <section>
          <p className="mb-4 font-mono text-sm text-dead-400">
            3. 3D TILT — <span className="text-dead-200">enableTilt</span>{" "}
            rotates the card around the cursor. The transform transition is
            dropped while tracking so it feels instant, then restored on leave
            so it eases back to flat.
          </p>
          <div className="flex justify-center rounded-lg border border-dead-800 bg-dead-900 p-8">
            <SpotlightCard
              id="sc-tilt"
              enableTilt
              tiltIntensity={14}
              className="min-h-[320px] w-full max-w-xl bg-dead-900"
            >
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-dead-600">
                  enableTilt · tiltIntensity 14
                </span>
                <h3 className="text-3xl font-bold tracking-tight">
                  Tilt me over
                </h3>
                <p className="max-w-sm text-sm text-dead-400">
                  Move toward an edge to tip the card away from the cursor, then
                  pull the pointer out and watch it settle back.
                </p>
              </div>
            </SpotlightCard>
          </div>
        </section>

        <div className="h-[10vh]" />

        <section>
          <p className="mb-4 font-mono text-sm text-dead-400">
            4. CUSTOM COLORS + SIZES — every visual parameter is a prop: blood
            red and electric blue spotlights, a tight 120px pool, a wide 520px
            wash, and a dimmed glow via <span className="text-dead-200">spotlightOpacity</span>.
          </p>
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-dead-800 bg-dead-900 p-8 md:grid-cols-4">
            <SpotlightCard
              id="sc-color-red"
              className="min-h-[160px] bg-dead-900"
              spotlightColor="rgba(220, 38, 38, 0.55)"
              hoveredBorderColor="rgba(239, 68, 68, 0.95)"
            >
              <div className="flex h-full flex-col justify-end gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-dead-600">
                  color
                </span>
                <span className="font-mono text-sm text-dead-50">
                  rgba(220, 38, 38, 0.55)
                </span>
              </div>
            </SpotlightCard>

            <SpotlightCard
              id="sc-color-blue"
              className="min-h-[160px] bg-dead-900"
              spotlightColor="rgba(56, 189, 248, 0.5)"
              hoveredBorderColor="rgba(125, 211, 252, 0.95)"
            >
              <div className="flex h-full flex-col justify-end gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-dead-600">
                  color
                </span>
                <span className="font-mono text-sm text-dead-50">
                  rgba(56, 189, 248, 0.5)
                </span>
              </div>
            </SpotlightCard>

            <SpotlightCard
              id="sc-size-small"
              className="min-h-[160px] bg-dead-900"
              spotlightSize={120}
            >
              <div className="flex h-full flex-col justify-end gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-dead-600">
                  size
                </span>
                <span className="font-mono text-sm text-dead-50">
                  spotlightSize 120
                </span>
              </div>
            </SpotlightCard>

            <SpotlightCard
              id="sc-size-large"
              className="min-h-[160px] bg-dead-900"
              spotlightSize={520}
              spotlightOpacity={0.55}
            >
              <div className="flex h-full flex-col justify-end gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-dead-600">
                  size + opacity
                </span>
                <span className="font-mono text-sm text-dead-50">
                  520 · opacity 0.55
                </span>
              </div>
            </SpotlightCard>
          </div>
        </section>

        <div className="h-[10vh]" />

        <footer className="w-full pb-24 text-center">
          <p className="font-mono text-sm leading-relaxed text-dead-400">
            The border glow is a radial gradient on a 1px padded layer with a
            two-layer <span className="text-dead-200">mask-composite: exclude</span>{" "}
            — the content box is punched out of the border box, so the light
            stays on the edge. Every mousemove is a single{" "}
            <span className="text-dead-200">setProperty</span> call; React never
            re-renders. Under{" "}
            <span className="text-dead-200">prefers-reduced-motion</span> the
            tilt is disabled and the glow appears without a fade.
          </p>
        </footer>
      </div>
    </div>
  );
}
