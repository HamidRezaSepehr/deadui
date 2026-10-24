import { MouseImageDistortion } from "@/registry/mouse-image-distortion"

const ITEMS = [
  { title: "Richard Gaston", subtitle: "Creative Direction", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80" },
  { title: "KangHee Kim", subtitle: "Photography", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80" },
  { title: "Inka & Niclas", subtitle: "Art Direction", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80" },
  { title: "Arch McLeish", subtitle: "Motion", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&q=80" },
  { title: "Nadir Bucan", subtitle: "Editing", imageUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&q=80" },
]

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-dead-950 text-dead-50">
      <header className="flex w-full max-w-4xl flex-col items-center gap-6 px-8 pt-24 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-dead-400">
          Feature 51 — Free Component
        </p>
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
          Mouse Image Distortion
        </h1>
        <p className="max-w-2xl font-mono text-sm leading-relaxed text-dead-400">
          A 3D component using Three.js + GLSL. Hover any row in the list — that row&apos;s image
          appears on a full-bleed plane that follows the cursor. Move the mouse quickly and
          the image bends via a GLSL vertex shader; move slowly and it stays flat.
        </p>
      </header>

      <section className="mt-16 w-full max-w-4xl px-8">
        <p className="mb-6 font-mono text-sm leading-relaxed text-dead-400">
          01. DEFAULT — all props at their defaults. The image follows the cursor,
          the text uses <code>mix-blend-difference</code>, and the plane fills the stage.
        </p>
        <div className="rounded-xl border border-dead-800 bg-dead-900 p-6">
          <MouseImageDistortion items={ITEMS} />
        </div>
      </section>

      <section className="mt-20 w-full max-w-4xl px-8">
        <p className="mb-6 font-mono text-sm leading-relaxed text-dead-400">
          02. STRONG WARP + FAST SMOOTHING — the amplitude is raised to 0.002 and
          smoothing increased to 0.3, making the warp more dramatic and the image
          catch up faster.
        </p>
        <div className="rounded-xl border border-dead-800 bg-dead-900 p-6">
          <MouseImageDistortion
            items={ITEMS}
            amplitude={0.002}
            smoothingFactor={0.3}
            textColor="text-dead-100"
            rowBorder="border-t border-dead-800"
          />
        </div>
      </section>

      <section className="mt-20 w-full max-w-4xl px-8">
        <p className="mb-6 font-mono text-sm leading-relaxed text-dead-400">
          03. SUBTLE WARP + SMALLER IMAGE — a gentler distortion with a smaller
          image scale, slower fade, and tighter spacing.
        </p>
        <div className="rounded-xl border border-dead-800 bg-dead-900 p-6">
          <MouseImageDistortion
            items={ITEMS}
            amplitude={0.0002}
            imageScale={0.12}
            fadeDuration={0.8}
            smoothingFactor={0.05}
            rowPadding="p-4"
            rowBorder="border-t border-dead-red/30"
          />
        </div>
      </section>

      <section className="mt-20 w-full max-w-4xl px-8">
        <p className="mb-6 font-mono text-sm leading-relaxed text-dead-400">
          04. HIGH-RES GEOMETRY, LARGE IMAGE — more subdivisions for smoother
          warping with a larger image footprint and tighter text size.
        </p>
        <div className="rounded-xl border border-dead-800 bg-dead-900 p-6">
          <MouseImageDistortion
            items={ITEMS}
            geometrySegments={30}
            imageScale={0.35}
            textSize="text-[3vw]"
            rowPadding="p-6"
            rowBorder="border-t border-white/10"
          />
        </div>
      </section>

      <section className="mt-20 w-full max-w-4xl px-8">
        <p className="mb-6 font-mono text-sm leading-relaxed text-dead-400">
          05. LIGHT SURFACE — dark background swapped for a near-black surface,
          text color brightened, subtitle style widened, and custom font family.
        </p>
        <div className="rounded-xl border border-dead-800 bg-dead-950 p-6">
          <MouseImageDistortion
            items={ITEMS}
            textSize="text-[5vw]"
            textColor="text-dead-100"
            textFont="serif"
            rowPadding="p-5"
            subtitleClassName="text-xs text-dead-500 tracking-wider"
            bgClassName="bg-dead-950"
          />
        </div>
      </section>

      <div className="h-[20vh]" />
    </div>
  )
}