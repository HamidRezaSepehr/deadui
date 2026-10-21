import { Typewriter } from '@/registry/typewriter'

export default function TestTypewriterPage() {
  return (
    <div className="flex flex-col items-center bg-dead-950 text-dead-50">
      <header className="flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-dead-400">
          Feature 42 — Free Component
        </p>
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">Typewriter</h1>
        <p className="max-w-xl font-mono text-sm leading-relaxed text-dead-400">
          A classic type-and-delete animation built on{' '}
          <code className="text-dead-50">typewriter-effect</code>, wrapped with
          specialized cursor controls — colour, width and height are forced onto
          the library&apos;s own blinking cursor per instance.
        </p>
      </header>

      {/* 1. BASIC SINGLE TEXT */}
      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          1. BASIC SINGLE TEXT — One string, default cursor (<code className="text-dead-50">|</code>,
          <code className="text-dead-50">currentColor</code>, 2px × 1em),{' '}
          <code className="text-dead-50">delay={'{50}'}</code>. The text stays on
          screen after the run finishes because a non-looping single string is
          passed to the engine as a string, not an array — arrays get deleted at
          the end of each cycle.
        </p>

        <div className="flex min-h-[160px] items-center justify-center rounded-lg border border-dead-800 bg-dead-900 p-12">
          <Typewriter
            text="Building interfaces that feel alive."
            className="text-2xl font-semibold md:text-3xl"
          />
        </div>
      </section>

      <div className="h-[20vh]" />

      {/* 2. MULTIPLE STRINGS (LOOPING) */}
      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          2. MULTIPLE STRINGS (LOOPING) — An array of strings with{' '}
          <code className="text-dead-50">loop</code>: each phrase is typed, held
          for <code className="text-dead-50">pauseFor</code>, deleted at{' '}
          <code className="text-dead-50">deleteSpeed</code> (mirroring{' '}
          <code className="text-dead-50">delay</code> by default), then the next
          one starts — forever.
        </p>

        <div className="flex min-h-[160px] items-center justify-center rounded-lg border border-dead-800 bg-dead-900 p-12">
          <Typewriter
            loop
            delay={65}
            text={[
              'Design. Prototype. Ship.',
              'Type, delete, repeat.',
              'One component, endless text.',
            ]}
            className="text-2xl font-semibold md:text-3xl"
          />
        </div>
      </section>

      <div className="h-[20vh]" />

      {/* 3. CUSTOM CURSOR */}
      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          3. CUSTOM CURSOR — <code className="text-dead-50">cursorColor</code>,{' '}
          <code className="text-dead-50">cursorWidth</code>,{' '}
          <code className="text-dead-50">cursorHeight</code> and{' '}
          <code className="text-dead-50">cursor</code> forced onto the library&apos;s{' '}
          <code className="text-dead-50">.Typewriter__cursor</code> element with a
          scoped <code className="text-dead-50">!important</code> rule. Two
          instances sit side by side with different cursors — each style block is
          scoped to its own instance, so they never clobber each other, and the
          native blink keeps running untouched.
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex min-h-[160px] flex-col items-center justify-center gap-4 rounded-lg border border-dead-800 bg-dead-900 p-8">
            <Typewriter
              text={['Thick blue block', 'cursorColor blue']}
              loop
              delay={60}
              cursor="▋"
              cursorColor="blue"
              cursorWidth="4px"
              cursorHeight="1.2em"
              className="text-xl font-semibold"
            />
            <p className="font-mono text-xs text-dead-400">
              cursor=&quot;▋&quot; / blue / 4px / 1.2em
            </p>
          </div>

          <div className="flex min-h-[160px] flex-col items-center justify-center gap-4 rounded-lg border border-dead-800 bg-dead-900 p-8">
            <Typewriter
              text={['Slim red caret', 'cursorColor red']}
              loop
              delay={60}
              cursor="█"
              cursorColor="#ef4444"
              cursorWidth="3px"
              cursorHeight="0.9em"
              className="text-xl font-semibold"
            />
            <p className="font-mono text-xs text-dead-400">
              cursor=&quot;█&quot; / #ef4444 / 3px / 0.9em
            </p>
          </div>
        </div>
      </section>

      <div className="h-[20vh]" />

      {/* 4. SPEED VARIATIONS */}
      <section className="w-full max-w-3xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          4. SPEED VARIATIONS — <code className="text-dead-50">delay</code> in
          milliseconds per character: <code className="text-dead-50">{'{15}'}</code>{' '}
          races through the sentence while{' '}
          <code className="text-dead-50">{'{120}'}</code> draws each letter out
          for dramatic effect. <code className="text-dead-50">deleteSpeed</code>{' '}
          defaults to the same value, so deletion keeps pace with typing.
        </p>

        <div className="flex flex-col items-center justify-center gap-12 rounded-lg border border-dead-800 bg-dead-900 p-12">
          <div className="flex flex-col items-center gap-4">
            <Typewriter
              text="Fast typing at 15ms per character."
              delay={15}
              className="text-xl font-semibold md:text-2xl"
            />
            <p className="font-mono text-xs text-dead-400">delay={'{15}'} — fast</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Typewriter
              text="Slow and dramatic."
              delay={120}
              className="text-xl font-semibold md:text-2xl"
            />
            <p className="font-mono text-xs text-dead-400">delay={'{120}'} — slow</p>
          </div>
        </div>
      </section>

      <div className="h-[20vh]" />

      <footer className="w-full max-w-3xl px-8 pb-24 text-center">
        <p className="font-mono text-sm leading-relaxed text-dead-400">
          The engine is <code className="text-dead-50">typewriter-effect</code> —
          typing, deleting and the blink all run in the browser after hydration.
          Cursor styling rides on a per-instance style block scoped by{' '}
          <code className="text-dead-50">useId()</code>, which never touches the
          library&apos;s injected keyframes. Under{' '}
          <code className="text-dead-50">prefers-reduced-motion</code> the
          sequence does not run at all: the first string is rendered statically
          and the cursor stops blinking.
        </p>
      </footer>
    </div>
  )
}
