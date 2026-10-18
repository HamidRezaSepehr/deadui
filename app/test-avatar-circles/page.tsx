'use client'

import { AvatarCircles } from '@/registry/avatar-circles'

const DEFAULT_AVATARS = [
  { name: 'Alice', imageUrl: 'https://i.pravatar.cc/150?u=alice' },
  { name: 'Bob', imageUrl: 'https://i.pravatar.cc/150?u=bob' },
  { name: 'Carol', imageUrl: 'https://i.pravatar.cc/150?u=carol' },
  { name: 'Dave', imageUrl: 'https://i.pravatar.cc/150?u=dave' },
]

const LINK_AVATARS = [
  { name: 'GitHub', imageUrl: 'https://i.pravatar.cc/150?u=github', href: 'https://github.com' },
  { name: 'Twitter', imageUrl: 'https://i.pravatar.cc/150?u=twitter', href: 'https://twitter.com' },
  { name: 'LinkedIn', imageUrl: 'https://i.pravatar.cc/150?u=linkedin', href: 'https://linkedin.com' },
  { name: 'Dribbble', imageUrl: 'https://i.pravatar.cc/150?u=dribbble', href: 'https://dribbble.com' },
]

const MANY_AVATARS = [
  { name: 'Eve', imageUrl: 'https://i.pravatar.cc/150?u=eve' },
  { name: 'Frank', imageUrl: 'https://i.pravatar.cc/150?u=frank' },
  { name: 'Grace', imageUrl: 'https://i.pravatar.cc/150?u=grace' },
  { name: 'Hank', imageUrl: 'https://i.pravatar.cc/150?u=hank' },
  { name: 'Ivy', imageUrl: 'https://i.pravatar.cc/150?u=ivy' },
  { name: 'Jack', imageUrl: 'https://i.pravatar.cc/150?u=jack' },
]

const SIZE_AVATARS = [
  { name: 'Kate', imageUrl: 'https://i.pravatar.cc/150?u=kate' },
  { name: 'Leo', imageUrl: 'https://i.pravatar.cc/150?u=leo' },
  { name: 'Mia', imageUrl: 'https://i.pravatar.cc/150?u=mia' },
  { name: 'Noah', imageUrl: 'https://i.pravatar.cc/150?u=noah' },
]

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

export default function AvatarCirclesTestPage() {
  return (
    <main className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50">
      <div className="mx-auto max-w-5xl space-y-20">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Avatar Circles — QA</h1>
          <p className="max-w-2xl text-sm text-dead-400">
            Stacked overlapping avatars with dynamic overlap, border radius,
            size control, and an optional +X counter badge.
          </p>
        </header>

        {/* 1 — Default: circular avatars, overlap 16px, +12 counter */}
        <section>
          <SectionLabel index="01" title="Default" />
          <AvatarCircles avatars={DEFAULT_AVATARS} numPeople={12} />
          <p className="mt-3 text-sm text-dead-400">
            Four circular avatars with 16px overlap and a &ldquo;+12&rdquo; counter.
            Default props: <span className="font-mono text-xs text-dead-200">size=&quot;md&quot;</span>,
            <span className="font-mono text-xs text-dead-200"> overlap=16</span>,
            <span className="font-mono text-xs text-dead-200"> radius=&quot;full&quot;</span>,
            <span className="font-mono text-xs text-dead-200"> bordered=true</span>.
          </p>
        </section>

        {/* 2 — With Links: avatars wrapped in <a> tags */}
        <section>
          <SectionLabel index="02" title="With Links" />
          <AvatarCircles avatars={LINK_AVATARS} numPeople={8} />
          <p className="mt-3 text-sm text-dead-400">
            Each avatar links to an external site. Hover over one to see alift
            effect (<span className="font-mono text-xs text-dead-200">z-50</span> +{' '}
            <span className="font-mono text-xs text-dead-200">scale-110</span>) and a
            red border highlight.
          </p>
        </section >

        {/* 3 — Custom Overlap & Radius */}
        <section>
          <SectionLabel index="03" title="Custom Overlap & Radius" />
          <AvatarCircles
            avatars={MANY_AVATARS}
            numPeople={99}
            overlap={24}
            radius="lg"
          />
          <p className="mt-3 text-sm text-dead-400">
            Tighter overlap (24px) with rounded corners (
            <span className="font-mono text-xs text-dead-200">radius=&quot;lg&quot;</span>)
            and a &ldquo;+99&ldquo; counter showing 6 overlaaping avatars.
          </p>
        </section>

        {/* 4 — No Border */}
        <section>
          <SectionLabel index="04" title="No Border" />
          <AvatarCircles
            avatars={DEFAULT_AVATARS}
            numPeople={8}
            overlap={20}
            bordered={false}
          />
          <p className="mt-3 text-sm text-dead-400">
            <span className="font-mono text-xs text-dead-200">bordered={false}</span>
            removes the separating border for a seamless blend between avatars.
          </p>
        </section>

        {/* 5 — Different Sizes */}
        <section>
          <SectionLabel index="05" title="Different Sizes" />
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-xs text-dead-400 font-mono">sm</p>
              <AvatarCircles
                avatars={SIZE_AVATARS}
                numPeople={12}
                size="sm"
                overlap={10}
              />
            </div>
            <div>
              <p className="mb-2 text-xs text-dead-400 font-mono">md</p>
              <AvatarCircles
                avatars={SIZE_AVATARS}
                numPeople={12}
                size="md"
                overlap={14}
              />
            </div>
            <div>
              <p className="mb-2 text-xs text-dead-400 font-mono">lg</p>
              <AvatarCircles
                avatars={SIZE_AVATARS}
                numPeople={12}
                size="lg"
                overlap={18}
              />
            </div>
            <div>
              <p className="mb-2 text-xs text-dead-400 font-mono">xl</p>
              <AvatarCircles
                avatars={SIZE_AVATARS}
                numPeople={12}
                size="xl"
                overlap={24}
              />
            </div>
          </div>
          <p className="mt-3 text-sm text-dead-400">
            Four size variants (sm, md, lg, xl) each with an appropriately
            scaled overlap.
          </p>
        </section>
      </div>
    </main>
  )
}