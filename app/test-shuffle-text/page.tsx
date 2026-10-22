"use client"

import { useState } from "react"

import {
  ShuffleText,
  type ShuffleRevealDirection,
} from "@/registry/shuffle-text"

const REVEAL_DIRECTIONS: ShuffleRevealDirection[] = [
  "start",
  "end",
  "center",
  "random",
]

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <span className="font-mono text-xs font-semibold tracking-widest text-dead-red">
        {index}
      </span>
      <h2 className="font-mono text-xs tracking-widest text-dead-400 uppercase">
        {title}
      </h2>
    </div>
  )
}

export default function TestShuffleTextPage() {
  const [text, setText] = useState("DEAD UI")

  return (
    <main className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50">
      <div className="mx-auto max-w-5xl space-y-24">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Shuffle Text — QA</h1>
          <p className="max-w-2xl text-sm text-dead-400">
            A character-shuffle reveal powered by{" "}
            <code className="text-dead-200">shuffle-letters</code>. Three
            triggers — <code className="text-dead-200">load</code>,{" "}
            <code className="text-dead-200">inView</code> and{" "}
            <code className="text-dead-200">hover</code> — plus reveal orders,
            custom character pools and frame control.
          </p>
        </header>

        {/* 01 — Load trigger */}
        <section>
          <SectionLabel index="01" title="Load Trigger" />
          <p className="mb-8 max-w-2xl text-sm text-dead-400">
            These play once, as soon as they mount. Reload the page to watch
            them again.
          </p>
          <div className="space-y-6">
            <p className="text-4xl font-bold tracking-tight">
              <ShuffleText text="Dead simple animations" />
            </p>
            <p className="text-2xl font-semibold">
              <ShuffleText text="Copy. Paste. Ship." iterations={16} />
            </p>
            <p className="text-lg text-dead-200">
              <ShuffleText text="Awwwards-grade motion, zero configuration" />
            </p>
          </div>
        </section>

        {/* 02 — Custom text */}
        <section>
          <SectionLabel index="02" title="Live Text" />
          <p className="mb-6 max-w-2xl text-sm text-dead-400">
            The text is a prop, so changing it restarts the load animation.
          </p>
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="mb-6 w-full max-w-sm rounded-md border border-dead-800 bg-dead-900 px-4 py-2 font-mono text-sm text-dead-50 outline-none focus:border-dead-red"
            placeholder="Type something"
          />
          <p className="text-3xl font-bold tracking-tight">
            <ShuffleText text={text || "Dead UI"} />
          </p>
        </section>

        <div className="h-[60vh]" />

        {/* 03 — In-view trigger */}
        <section>
          <SectionLabel index="03" title="In-View Trigger" />
          <p className="mb-8 max-w-2xl text-sm text-dead-400">
            Scroll down and watch these resolve the moment 50% of each element
            is on screen. They play <strong>once</strong> — scrolling back up
            will not replay them.
          </p>
          <div className="space-y-8">
            <p className="text-3xl font-bold tracking-tight">
              <ShuffleText text="Revealed on scroll" trigger="inView" />
            </p>
            <p className="text-2xl font-semibold">
              <ShuffleText
                text="Fifty percent in view"
                trigger="inView"
                iterations={14}
              />
            </p>
            <p className="text-xl text-dead-200">
              <ShuffleText
                text="And it never plays twice"
                trigger="inView"
                revealDirection="center"
              />
            </p>
          </div>
        </section>

        <div className="h-[60vh]" />

        {/* 04 — Hover trigger */}
        <section>
          <SectionLabel index="04" title="Hover Trigger" />
          <p className="mb-8 max-w-2xl text-sm text-dead-400">
            Hover any of these to shuffle them. Every entry restarts the
            animation.
          </p>
          <div className="space-y-8">
            <p className="text-3xl font-bold tracking-tight">
              <ShuffleText text="Hover me" trigger="hover" />
            </p>
            <p className="text-2xl font-semibold">
              <ShuffleText
                text="Hover me twice"
                trigger="hover"
                revealDirection="end"
              />
            </p>
            <p className="text-xl text-dead-200">
              <ShuffleText
                text="Hover me, centre out"
                trigger="hover"
                revealDirection="center"
                iterations={14}
              />
            </p>
          </div>
        </section>

        {/* 05 — Reveal directions */}
        <section>
          <SectionLabel index="05" title="Reveal Directions" />
          <p className="mb-8 max-w-2xl text-sm text-dead-400">
            The order the characters resolve in. Hover each one to compare:
            <code className="text-dead-200">start</code> resolves left to
            right, <code className="text-dead-200">end</code> right to left,{" "}
            <code className="text-dead-200">center</code> outwards from the
            middle and <code className="text-dead-200">random</code> picks a
            new order on every run.
          </p>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {REVEAL_DIRECTIONS.map((direction) => (
              <div key={direction}>
                <span className="font-mono text-[11px] tracking-widest text-dead-500 uppercase">
                  {direction}
                </span>
                <p className="mt-2 text-2xl font-semibold">
                  <ShuffleText
                    text="Reveal order"
                    trigger="hover"
                    revealDirection={direction}
                  />
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 06 — Character pools */}
        <section>
          <SectionLabel index="06" title="Character Pools" />
          <p className="mb-8 max-w-2xl text-sm text-dead-400">
            <code className="text-dead-200">characters</code> replaces the
            scrambling pool outright — every character is swapped for a random
            one from the pool.{" "}
            <code className="text-dead-200">useOriginalCharsOnly</code> keeps
            the text&apos;s own characters instead, preserving case.
          </p>
          <div className="space-y-8">
            <div>
              <span className="font-mono text-[11px] tracking-widest text-dead-500 uppercase">
                characters=&quot;01&quot;
              </span>
              <p className="mt-2 text-2xl font-semibold">
                <ShuffleText
                  text="Digital glitch"
                  trigger="hover"
                  characters="01"
                />
              </p>
            </div>
            <div>
              <span className="font-mono text-[11px] tracking-widest text-dead-500 uppercase">
                characters=&quot;▓▒░&quot;
              </span>
              <p className="mt-2 text-2xl font-semibold">
                <ShuffleText
                  text="Matrix sweep"
                  trigger="hover"
                  characters="▓▒░"
                />
              </p>
            </div>
            <div>
              <span className="font-mono text-[11px] tracking-widest text-dead-500 uppercase">
                useOriginalCharsOnly
              </span>
              <p className="mt-2 text-2xl font-semibold">
                <ShuffleText
                  text="Original characters only"
                  trigger="hover"
                  useOriginalCharsOnly
                />
              </p>
            </div>
          </div>
        </section>

        {/* 07 — Speed */}
        <section>
          <SectionLabel index="07" title="Speed" />
          <p className="mb-8 max-w-2xl text-sm text-dead-400">
            <code className="text-dead-200">iterations</code> is how many
            frames each character spends scrambling before it locks in, and{" "}
            <code className="text-dead-200">fps</code> is how fast the frames
            run.
          </p>
          <div className="space-y-8">
            <div>
              <span className="font-mono text-[11px] tracking-widest text-dead-500 uppercase">
                iterations=1 — snap
              </span>
              <p className="mt-2 text-2xl font-semibold">
                <ShuffleText text="Quick snap" trigger="hover" iterations={1} />
              </p>
            </div>
            <div>
              <span className="font-mono text-[11px] tracking-widest text-dead-500 uppercase">
                iterations=40 — long scramble
              </span>
              <p className="mt-2 text-2xl font-semibold">
                <ShuffleText
                  text="Long scramble"
                  trigger="hover"
                  iterations={40}
                />
              </p>
            </div>
            <div>
              <span className="font-mono text-[11px] tracking-widest text-dead-500 uppercase">
                fps=60 — smooth
              </span>
              <p className="mt-2 text-2xl font-semibold">
                <ShuffleText
                  text="Sixty frames"
                  trigger="hover"
                  fps={60}
                  iterations={6}
                />
              </p>
            </div>
          </div>
        </section>

        <div className="h-[20vh]" />

        <footer className="border-t border-dead-800 pt-8 text-xs text-dead-500">
          <p>
            Under <code className="text-dead-300">prefers-reduced-motion: reduce</code>{" "}
            the animation is skipped and the text is rendered statically. Every
            run is stopped on unmount, so no timer outlives its element.
          </p>
        </footer>
      </div>
    </main>
  )
}
