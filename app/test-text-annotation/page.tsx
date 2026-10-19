'use client'

import { useState } from 'react'

import {
  TextAnnotation,
  TextAnnotationGroup,
  type AnnotationType,
} from '@/registry/text-annotation'

const ALL_TYPES: AnnotationType[] = [
  'underline',
  'box',
  'circle',
  'highlight',
  'strike-through',
  'crossed-off',
  'bracket',
  'multi-line',
]

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <span className="font-mono text-xs font-semibold tracking-widest text-dead-red">
        {index}
      </span>
      <h2 className="font-mono text-xs tracking-widest text-dead-400 uppercase">{title}</h2>
    </div>
  )
}

export default function TestTextAnnotationPage() {
  const [show, setShow] = useState(true)

  return (
    <main className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50">
      <div className="mx-auto max-w-5xl space-y-24">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Text Annotation — QA</h1>
          <p className="max-w-2xl text-sm text-dead-400">
            Hand-drawn, sketchy annotation effects powered by{' '}
            <code className="text-dead-200">rough-notation</code>. Supports all eight types,
            custom styling, manual toggling, synchronized groups, and automatic in-view
            triggering via Intersection Observer.
          </p>
        </header>

        {/* 01 — All 8 Types */}
        <section>
          <SectionLabel index="01" title="All 8 Types" />
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {ALL_TYPES.map((type) => (
              <div key={type} className="flex flex-col items-start gap-4">
                <span className="font-mono text-[11px] tracking-widest text-dead-500 uppercase">
                  {type}
                </span>
                <p className="text-lg text-dead-200">
                  <TextAnnotation type={type}>Dead UI</TextAnnotation>
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-dead-400">
            <code className="text-dead-200">multi-line</code> maps onto rough-notation&apos;s
            <code className="text-dead-200"> underline</code> with{' '}
            <code className="text-dead-200">multiline</code> forced on — try it on a wrapping
            paragraph below.
          </p>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-dead-200">
            This sentence is deliberately long enough to wrap across multiple lines so the{' '}
            <TextAnnotation type="multi-line" color="#ef4444" animationDuration={1200}>
              multi-line underline follows every line box rather than a single rectangle
            </TextAnnotation>
            .
          </p>
        </section>

        <div className="h-[40vh]" />

        {/* 02 — Custom Styling */}
        <section>
          <SectionLabel index="02" title="Custom Styling" />
          <div className="space-y-6 text-lg text-dead-200">
            <p>
              Custom colour:{' '}
              <TextAnnotation type="highlight" color="#ef4444" animationDuration={900}>
                a red highlighter
              </TextAnnotation>
            </p>
            <p>
              Thick stroke:{' '}
              <TextAnnotation type="underline" color="#f59e0b" strokeWidth={6}>
                a heavy underline
              </TextAnnotation>
            </p>
            <p>
              More iterations:{' '}
              <TextAnnotation type="circle" color="#a78bfa" iterations={4}>
                circled repeatedly
              </TextAnnotation>
            </p>
            <p>
              Wide padding:{' '}
              <TextAnnotation type="box" color="#34d399" padding={16} strokeWidth={1}>
                padded box
              </TextAnnotation>
            </p>
            <p>
              Slow animation:{' '}
              <TextAnnotation type="strike-through" color="#f472b6" animationDuration={2500}>
                drawn very slowly
              </TextAnnotation>
            </p>
          </div>
        </section>

        <div className="h-[40vh]" />

        {/* 03 — Interactive Toggle */}
        <section>
          <SectionLabel index="03" title="Interactive Toggle" />
          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            className="mb-6 rounded-md border border-dead-800 bg-dead-900 px-4 py-2 font-mono text-xs tracking-widest text-dead-200 uppercase transition-colors hover:border-dead-red hover:text-dead-50"
          >
            {show ? 'Hide' : 'Show'} annotations
          </button>
          <div className="space-y-4 text-lg text-dead-200">
            <p>
              The <code className="text-dead-200">show</code> prop is{' '}
              <span className="font-mono text-dead-50">{String(show)}</span>
            </p>
            <p>
              Underline:{' '}
              <TextAnnotation type="underline" color="#ef4444" show={show}>
                toggled live
              </TextAnnotation>
            </p>
            <p>
              Highlight:{' '}
              <TextAnnotation type="highlight" color="#facc15" show={show}>
                toggled live
              </TextAnnotation>
            </p>
            <p>
              Box:{' '}
              <TextAnnotation type="box" color="#60a5fa" show={show}>
                toggled live
              </TextAnnotation>
            </p>
          </div>
        </section>

        <div className="h-[60vh]" />

        {/* 04 — In-View Trigger */}
        <section>
          <SectionLabel index="04" title="In-View Trigger" />
          <p className="mb-8 max-w-2xl text-sm text-dead-400">
            Scroll a little further and watch the annotations below draw themselves once{' '}
            <span className="font-mono text-dead-200">50%</span> of each element is visible.
            These use <code className="text-dead-200">inView</code> with the default{' '}
            <code className="text-dead-200">triggerOnce=&#123;true&#125;</code>, so they will
            not replay when you scroll back.
          </p>
          <div className="space-y-8 text-xl text-dead-200">
            <p>
              <TextAnnotation type="underline" inView color="#ef4444">
                Revealed on scroll
              </TextAnnotation>
            </p>
            <p>
              <TextAnnotation type="circle" inView color="#a78bfa" animationDuration={1400}>
                Circled on scroll
              </TextAnnotation>
            </p>
            <p>
              <TextAnnotation type="highlight" inView color="#34d399">
                Highlighted on scroll
              </TextAnnotation>
            </p>
            <p>
              <TextAnnotation type="box" inView color="#f59e0b" strokeWidth={3}>
                Boxed on scroll
              </TextAnnotation>
            </p>
          </div>
          <p className="mt-8 max-w-2xl text-sm text-dead-400">
            With <code className="text-dead-200">triggerOnce=&#123;false&#125;</code> the
            annotation hides again as it leaves the viewport and re-draws on the next entry:
          </p>
          <p className="mt-4 text-xl text-dead-200">
            <TextAnnotation type="underline" inView triggerOnce={false} color="#f472b6">
              Scroll away and back to replay
            </TextAnnotation>
          </p>
        </section>

        <div className="h-[60vh]" />

        {/* 05 — Annotation Group */}
        <section>
          <SectionLabel index="05" title="Annotation Group" />
          <p className="mb-8 max-w-2xl text-sm text-dead-400">
            A <code className="text-dead-200">TextAnnotationGroup</code> registers every nested{' '}
            <code className="text-dead-200">TextAnnotation</code> and reveals them{' '}
            <em>in sequence</em> the moment the group itself is 50% in view.
          </p>
          <TextAnnotationGroup inView>
            <p className="max-w-3xl text-xl leading-loose text-dead-200">
              Dead UI ships{' '}
              <TextAnnotation type="highlight" color="#ef4444">
                copy-paste
              </TextAnnotation>{' '}
              animations that are{' '}
              <TextAnnotation type="underline" color="#34d399">
                production ready
              </TextAnnotation>{' '}
              and styled to feel{' '}
              <TextAnnotation type="box" color="#60a5fa">
                truly alive
              </TextAnnotation>
              , with{' '}
              <TextAnnotation type="circle" color="#a78bfa">
                zero config
              </TextAnnotation>{' '}
              required.
            </p>
          </TextAnnotationGroup>
        </section>

        <div className="h-[20vh]" />
      </div>
    </main>
  )
}
