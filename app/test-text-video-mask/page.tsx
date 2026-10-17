'use client'

import { TextVideoMask } from '@/registry/text-video-mask'

// Local clip provided for testing and demos, so every example plays offline.
const VIDEO_SRC = '/video-sequence.mp4'

function SectionLabel({
  index,
  children,
}: {
  index: number
  children: React.ReactNode
}) {
  return (
    <p className="mb-6 font-mono text-sm leading-relaxed text-dead-400">
      <span className="text-dead-600">{index}.</span> {children}
    </p>
  )
}

export default function TestTextVideoMaskPage() {
  return (
    <div className="flex flex-col items-center bg-dead-950 text-dead-50">
      <header className="flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-dead-400">
          Feature 29 — Free Component
        </p>
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
          Text Video Mask
        </h1>
        <p className="max-w-xl font-mono text-sm leading-relaxed text-dead-400">
          A playing video clipped into the shape of text. The mask is an SVG{' '}
          <span className="text-dead-200">&lt;mask&gt;</span> whose content is a{' '}
          <span className="text-dead-200">&lt;foreignObject&gt;</span>, so any
          React markup — with any Tailwind classes — can cut the video.
        </p>
      </header>

      <div className="flex w-full max-w-4xl flex-col gap-32 px-8 pb-24">
        <section>
          <SectionLabel index={1}>
            BASIC BOLD TEXT — a single heavy line cutting the video. The mask
            reads luminance, so the glyphs are painted white to reveal the clip
            and the base rectangle is black to hide everything else.
          </SectionLabel>

          <TextVideoMask
            videoSrc={VIDEO_SRC}
            className="h-[420px] rounded-2xl border border-dead-800"
            textClassName="font-mono text-6xl font-black uppercase tracking-tight sm:text-7xl md:text-[9rem]"
          >
            DEAD UI
          </TextVideoMask>

          <p className="mt-6 font-mono text-sm leading-relaxed text-dead-400">
            Every instance generates its own mask id with{' '}
            <span className="text-dead-200">React.useId()</span>, so two masks on
            one page never collide. The video is{' '}
            <span className="text-dead-200">autoPlay loop muted playsInline</span>{' '}
            — the only combination browsers and iOS Safari will actually play.
          </p>
        </section>

        <section>
          <SectionLabel index={2}>
            OUTLINED TEXT — the fill is transparent and only a 2px stroke is
            white, so the video survives along the letterforms and vanishes
            inside them. Any typographic treatment that changes luminance changes
            the mask.
          </SectionLabel>

          <TextVideoMask
            videoSrc={VIDEO_SRC}
            className="h-[420px] rounded-2xl border border-dead-800"
            textClassName="font-mono text-7xl font-black uppercase tracking-tight text-transparent [-webkit-text-stroke:2px_white] md:text-[10rem]"
          >
            OUTLINE
          </TextVideoMask>

          <p className="mt-6 font-mono text-sm leading-relaxed text-dead-400">
            <span className="text-dead-200">text-transparent</span> plus{' '}
            <span className="text-dead-200">-webkit-text-stroke</span> is the
            HTML fallback for the SVG-style{' '}
            <span className="text-dead-200">stroke-white</span> in the spec — the
            foreignObject renders HTML, not SVG, so the CSS property is the one
            that applies.
          </p>
        </section>

        <section>
          <SectionLabel index={3}>
            MULTI-LINE / COMPLEX HTML — a heading and a subheading masked
            together. Because the mask is a real render tree, mixed sizes,
            fonts and layout all cut the same video in one pass.
          </SectionLabel>

          <TextVideoMask
            videoSrc={VIDEO_SRC}
            className="h-[460px] rounded-2xl border border-dead-800"
            textClassName="flex-col gap-1"
          >
            <span className="font-mono text-6xl font-black uppercase leading-none tracking-tight md:text-8xl">
              VIDEO
            </span>
            <span className="font-serif text-2xl italic tracking-wide text-dead-200 md:text-4xl">
              inside text
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-dead-400 md:text-xs">
              dead simple
            </span>
          </TextVideoMask>

          <p className="mt-6 font-mono text-sm leading-relaxed text-dead-400">
            The children inherit <span className="text-dead-200">text-white</span>{' '}
            from the mask wrapper, then override it per element — the subheading
            is a lighter grey, which is why it reveals the video at partial
            opacity. Nothing about the mask is limited to a single line of text.
          </p>
        </section>

        <footer className="text-center">
          <p className="font-mono text-sm leading-relaxed text-dead-400">
            Performance: the mask is a single composited layer — no per-frame
            JavaScript, no canvas, no re-render. Ship a short, optimized, muted
            MP4 (<span className="text-dead-200">videoSrc</span> accepts any URL),
            and reserve the container height (as every example here does) so the
            page never shifts when the video loads.
          </p>
        </footer>
      </div>
    </div>
  )
}
