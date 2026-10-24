import { MaskCursor } from "@/registry/mask-cursor"

export default function TestMaskCursorPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white md:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Mask Cursor
          </h1>
          <p className="mt-4 max-w-2xl text-neutral-400">
            Hover inside each card to activate the cursor circle. Hover the
            highlighted link or button to expand the mask effect.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          {/* 1. Original spotlight style */}
          <MaskCursor
            containerClassName="min-h-[360px] rounded-3xl border border-white/10 bg-[#0f0f0f] p-6"
            contentClassName="max-w-[520px] p-8 text-center text-3xl leading-tight md:text-5xl md:leading-[1.05]"
            baseColor="#afa18f"
            maskColor="#000000"
            maskBackground="#ec4e39"
            circleSize={36}
            hoverCircleSize={320}
          >
            <p>
              I&apos;m a{" "}
              <a
                href="#"
                data-mask-hotspot
                className="underline decoration-2 underline-offset-4"
              >
                selectively skilled
              </a>{" "}
              product designer with strong focus on high quality digital
              experiences.
            </p>
          </MaskCursor>

          {/* 2. Pure text color swap */}
          <MaskCursor
            containerClassName="min-h-[360px] rounded-3xl border border-white/10 bg-zinc-500 p-6"
            contentClassName="max-w-[520px] p-8 text-center text-3xl leading-tight md:text-5xl"
            baseColor="#ffffff"
            maskColor="#000000"
            maskBackground="transparent"
            circleSize={40}
            hoverCircleSize={360}
          >
            <p>
              The circle swaps text color only when hovering this{" "}
              <button
                type="button"
                data-mask-hotspot
                className="font-bold underline decoration-2 underline-offset-4"
              >
                hotspot button
              </button>
              .
            </p>
          </MaskCursor>

          {/* 3. Dark neon text swap */}
          <MaskCursor
            containerClassName="min-h-[360px] rounded-3xl border border-white/10 bg-black p-6"
            contentClassName="max-w-[520px] p-8 text-center text-3xl leading-tight md:text-5xl"
            baseColor="#ffffff"
            maskColor="#34d399"
            maskBackground="transparent"
            circleSize={28}
            hoverCircleSize={340}
            positionStiffness={90}
            positionDamping={18}
            sizeStiffness={110}
            sizeDamping={13}
          >
            <p>
              Neon masked text inside the circle. Activate it by hovering the{" "}
              <a
                href="#"
                data-mask-hotspot
                className="text-emerald-300 underline decoration-2 underline-offset-4"
              >
                emerald link
              </a>
              .
            </p>
          </MaskCursor>

          {/* 4. Soft edge mask */}
          <MaskCursor
            containerClassName="min-h-[360px] rounded-3xl border border-white/10 bg-neutral-900 p-6"
            contentClassName="max-w-[520px] p-8 text-center text-3xl leading-tight md:text-5xl"
            baseColor="#fbbf24"
            maskColor="#0f172a"
            maskBackground="rgba(56, 189, 248, 0.92)"
            maskImage="radial-gradient(circle at center, black 42%, transparent 54%)"
            circleSize={48}
            hoverCircleSize={380}
          >
            <p>
              Soft-edged mask using a radial gradient instead of the default SVG
              circle. Hover this{" "}
              <button
                type="button"
                data-mask-hotspot
                className="rounded-full bg-white/10 px-3 py-1 underline decoration-2 underline-offset-4"
              >
                soft hotspot
              </button>
              .
            </p>
          </MaskCursor>

          {/* 5. Large slow expansion */}
          <MaskCursor
            containerClassName="min-h-[360px] rounded-3xl border border-white/10 bg-indigo-950 p-6"
            contentClassName="max-w-[520px] p-8 text-center text-3xl leading-tight md:text-5xl"
            baseColor="#c7d2fe"
            maskColor="#ffffff"
            maskBackground="#4f46e5"
            circleSize={20}
            hoverCircleSize={460}
            positionStiffness={70}
            positionDamping={16}
            positionMass={0.6}
            sizeStiffness={80}
            sizeDamping={12}
            sizeMass={1.2}
          >
            <p>
              Larger, slower trailing circle with stronger lag. Hover the{" "}
              <a
                href="#"
                data-mask-hotspot
                className="font-bold underline decoration-2 underline-offset-4"
              >
                indigo hotspot
              </a>
              .
            </p>
          </MaskCursor>

          {/* 6. Minimal resting circle */}
          <MaskCursor
            containerClassName="min-h-[360px] rounded-3xl border border-white/10 bg-stone-200 p-6 text-stone-900"
            contentClassName="max-w-[520px] p-8 text-center text-3xl leading-tight md:text-5xl"
            baseColor="#1c1917"
            maskColor="#fafaf9"
            maskBackground="#1c1917"
            circleSize={18}
            hoverCircleSize={300}
          >
            <p>
              Minimal dark spotlight over light content. Hover this{" "}
              <button
                type="button"
                data-mask-hotspot
                className="rounded-full border border-stone-900 px-3 py-1 font-medium"
              >
                dark button
              </button>
              .
            </p>
          </MaskCursor>
        </div>

        {/* Scroll tracking test */}
        <div className="h-[100vh]" />

        <section className="mx-auto max-w-4xl">
          <MaskCursor
            containerClassName="min-h-[420px] rounded-3xl border border-white/10 bg-neutral-900 p-8"
            contentClassName="max-w-[760px] p-10 text-center text-4xl leading-tight md:text-6xl"
            baseColor="#ffffff"
            maskColor="#000000"
            maskBackground="#f97316"
            circleSize={32}
            hoverCircleSize={420}
          >
            <p>
              This card is far down the page. The circle must still track the
              cursor correctly after scrolling. Hover the{" "}
              <a
                href="#"
                data-mask-hotspot
                className="underline decoration-2 underline-offset-4"
              >
                orange hotspot
              </a>
              .
            </p>
          </MaskCursor>
        </section>
      </div>
    </main>
  )
}