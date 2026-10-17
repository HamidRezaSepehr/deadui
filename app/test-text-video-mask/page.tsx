'use client'

import { TextVideoMask } from '@/registry/text-video-mask'

const FLOWER_VIDEO =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
const ABSTRACT_VIDEO =
  'https://videos.pexels.com/video-files/1998560/1998560-hd_1280_720_24fps.mp4'
const OCEAN_VIDEO =
  'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_25fps.mp4'
const NATURE_VIDEO =
  'https://videos.pexels.com/video-files/1093662/1093662-hd_1280_720_30fps.mp4'

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <span className="font-mono text-xs font-semibold tracking-widest text-dead-red">
        {index}
      </span>
      <h2 className="font-mono text-xs uppercase tracking-widest text-dead-400">
        {title}
      </h2>
    </div>
  )
}

export default function TextVideoMaskTestPage() {
  return (
    <main className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50">
      <div className="mx-auto max-w-5xl space-y-20">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Text Video Mask — QA</h1>
          <p className="max-w-2xl text-sm text-dead-400">
            The mask layer blends with the video using{' '}
            <span className="font-mono text-xs text-dead-200">
              mix-blend-multiply
            </span>
            : white reveals the video, black hides it. The layer ships with a
            black field, so white glyphs (
            <span className="font-mono text-xs text-dead-200">
              text-white
            </span>
            ) show the video only inside the letters — section 4 flips it to a
            white field with black glyphs for the inverted cut-out.
          </p>
        </header>

        {/* 1 — Basic bold text: white glyphs on a black field. */}
        <section>
          <SectionLabel index="01" title="Basic — bold text" />
          <TextVideoMask
            videoSrc={FLOWER_VIDEO}
            className="h-[400px] w-full rounded-xl border border-dead-800 bg-black"
            textClassName="text-white text-6xl md:text-8xl font-black uppercase tracking-tight"
          >
            <span>Bloom</span>
          </TextVideoMask>
          <p className="mt-3 text-sm text-dead-400">
            Nature video (MDN CC0 flower.mp4) clipped inside one heavyweight
            word. Black field + white glyphs = video only in the letters.
          </p>
        </section>

        {/* 2 — Outlined text: only the stroke carries luminance. */}
        <section>
          <SectionLabel index="02" title="Outlined text" />
          <TextVideoMask
            videoSrc={ABSTRACT_VIDEO}
            className="h-[400px] w-full rounded-xl border border-dead-800 bg-black"
          >
            <svg
              viewBox="0 0 800 400"
              className="h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <text
                x="50%"
                y="52%"
                dominantBaseline="middle"
                textAnchor="middle"
                className="fill-transparent stroke-white"
                strokeWidth={4}
                style={{ fontSize: 140, fontWeight: 900, letterSpacing: 8 }}
              >
                OUTLINE
              </text>
            </svg>
          </TextVideoMask>
          <p className="mt-3 text-sm text-dead-400">
            Typography styles flow straight through{' '}
            <span className="font-mono text-xs text-dead-200">
              textClassName
            </span>
            : here the glyphs are transparent with a white stroke, so the
              video survives only inside the outline. Any markup works inside
              the mask layer.
          </p>
        </section>

        {/* 3 — Multi-line / complex HTML in one mask. */}
        <section>
          <SectionLabel index="03" title="Multi-line — complex HTML" />
          <TextVideoMask
            videoSrc={OCEAN_VIDEO}
            className="h-[500px] w-full rounded-xl border border-dead-800 bg-black"
            textClassName="text-white"
          >
            <div className="flex flex-col items-center gap-4 px-8 text-center">
              <h2 className="text-5xl font-bold uppercase tracking-tight md:text-7xl">
                Deep Space
              </h2>
              <p className="text-xl font-light uppercase tracking-[0.3em] text-white md:text-2xl">
                a visual experience
              </p>
            </div>
          </TextVideoMask>
          <p className="mt-3 text-sm text-dead-400">
            A heading and a subheading masked together at different sizes and
            weights — the mask layer handles full multi-line layouts, not just
            single words.
          </p>
        </section>

        {/* 4 — Inverted cut-out: white field, black glyphs. */}
        <section>
          <SectionLabel index="04" title="Inverted — text cut-out" />
          <TextVideoMask
            videoSrc={NATURE_VIDEO}
            className="h-[400px] w-full rounded-xl border border-dead-800 bg-black"
            textClassName="bg-white text-black text-6xl md:text-8xl font-extrabold uppercase tracking-[0.2em]"
          >
            <span>Cutout</span>
          </TextVideoMask>
          <p className="mt-3 text-sm text-dead-400">
            A white field (
            <span className="font-mono text-xs text-dead-200">bg-white</span>
            ) reveals the video across the whole box and the black glyphs hide
            it — the same luminance model, inverted.
          </p>
        </section>

        <footer className="border-t border-dead-800 pt-8 text-sm text-dead-400">
          <p className="font-mono text-xs uppercase tracking-widest text-dead-500">
            Notes
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>
              Every video is muted, looping and{' '}
              <span className="font-mono text-xs text-dead-200">
                playsInline
              </span>
              , so autoplay is never blocked — including mobile Safari.
            </li>
            <li>
              The mask layer blends into the video with{' '}
              <span className="font-mono text-xs text-dead-200">
                mix-blend-multiply
              </span>{' '}
              inside an isolated stacking context — pure CSS, no per-frame JS,
              no canvas.
            </li>
            <li>
              The video element itself is decorative; under{' '}
              <span className="font-mono text-xs text-dead-200">
                prefers-reduced-motion
              </span>{" "}
              you can wrap the component and pause the video via your own
              media query hook.
            </li>
          </ul>
        </footer>
      </div>
    </main>
  )
}
