import { AvatarCircles } from '@/registry/avatar-circles'

export default function TestAvatarCirclesPage() {
  return (
    <div className="flex flex-col items-center bg-dead-950 text-dead-50">
      <header className="flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-dead-400">
          Feature 31 — Free Component
        </p>
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">Avatar Circles</h1>
        <p className="max-w-xl font-mono text-sm leading-relaxed text-dead-400">
          A stack of overlapping user avatars with an optional counter badge at the end.
        </p>
      </header>

      <section className="w-full max-w-4xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          1. DEFAULT — standard circular avatars with a "+12" counter.
        </p>

        <div className="flex items-center justify-center gap-4 p-6 bg-dead-900 rounded-lg">
          <AvatarCircles
            avatars={[
              { name: 'Sarah J.', imageUrl: '/placeholder-avatar-1.jpg' },
              { name: 'Mike R.', imageUrl: '/placeholder-avatar-2.jpg' },
              { name: 'Emma C.', imageUrl: '/placeholder-avatar-3.jpg' },
            ]}
            numPeople={12}
          />
        </div>
      </section>

      <div className="h-[20vh]" />

      <section className="w-full max-w-4xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          2. WITH LINKS — avatars wrapped in <code><a></code> tags with hover lift
          (<code>z-50</code> and <code>scale-110</code>) and increased z-index.
        </p>

        <div className="flex items-center justify-center gap-4 p-6 bg-dead-900 rounded-lg">
          <AvatarCircles
            avatars={[
              { name: 'Sarah J.', imageUrl: '/placeholder-avatar-1.jpg', href: 'https://twitter.com' },
              { name: 'Mike R.', imageUrl: '/placeholder-avatar-2.jpg', href: 'https://github.com' },
              { name: 'Emma C.', imageUrl: '/placeholder-avatar-3.jpg', href: 'https://linkedin.com' },
            ]}
            numPeople={5}
          />
        </div>
      </section>

      <div className="h-[20vh]" />

      <section className="w-full max-w-4xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          3. CUSTOM OVERLAP & RADIUS — tighter overlap ({code `overlap={24`}}) with
          rounded corners ({code `radius="lg"`}) instead of full circles.
        </p>

        <div className="flex items-center justify-center gap-4 p-6 bg-dead-900 rounded-lg">
          <AvatarCircles
            avatars={[
              { name: 'Sarah J.', imageUrl: '/placeholder-avatar-1.jpg' },
              { name: 'Mike R.', imageUrl: '/placeholder-avatar-2.jpg' },
              { name: 'Emma C.', imageUrl: '/placeholder-avatar-3.jpg' },
            ]}
            overlap={24}
            radius="lg"
            numPeople={8}
          />
        </div>
      </section>

      <div className="h-[20vh]" />

      <section className="w-full max-w-4xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          4. NO BORDER — <code>bordered={false}</code> for a seamless blend without
          the separating border between avatars.
        </p>

        <div className="flex items-center justify-center gap-4 p-6 bg-dead-900 rounded-lg">
          <AvatarCircles
            avatars={[
              { name: 'Sarah J.', imageUrl: '/placeholder-avatar-1.jpg' },
              { name: 'Mike R.', imageUrl: '/placeholder-avatar-2.jpg' },
              { name: 'Emma C.', imageUrl: '/placeholder-avatar-3.jpg' },
            ]}
            bordered={false}
            numPeople={15}
          />
        </div>
      </section>

      <div className="h-[20vh]" />

      <section className="w-full max-w-4xl px-8">
        <p className="mb-8 font-mono text-sm text-dead-400">
          5. DIFFERENT SIZES — <code>sm</code>, <code>md</code>, <code>lg</code>, and
          <code>xl</code> variants side-by-side.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 p-6 bg-dead-900 rounded-lg">
          <AvatarCircles
            avatars={[
              { name: 'Sarah J.', imageUrl: '/placeholder-avatar-1.jpg' },
              { name: 'Mike R.', imageUrl: '/placeholder-avatar-2.jpg' },
            ]}
            size="sm"
            numPeople={4}
          />
          <AvatarCircles
            avatars={[
              { name: 'Sarah J.', imageUrl: '/placeholder-avatar-1.jpg' },
              { name: 'Mike R.', imageUrl: '/placeholder-avatar-2.jpg' },
            ]}
            size="md"
            numPeople={4}
          />
          <AvatarCircles
            avatars={[
              { name: 'Sarah J.', imageUrl: '/placeholder-avatar-1.jpg' },
              { name: 'Mike R.', imageUrl: '/placeholder-avatar-2.jpg' },
            ]}
            size="lg"
            numPeople={4}
          />
          <AvatarCircles
            avatars={[
              { name: 'Sarah J.', imageUrl: '/placeholder-avatar-1.jpg' },
              { name: 'Mike R.', imageUrl: '/placeholder-avatar-2.jpg' },
            ]}
            size="xl"
            numPeople={4}
          />
        </div>
      </section>

      <footer className="w-full max-w-4xl px-8 pb-24 text-center">
        <p className="font-mono text-sm leading-relaxed text-dead-400">
          Each avatar can optionally accept an <code>href</code> prop to wrap it in an
          <code><a></code> tag with a hover effect. The <code>+{numPeople}</code>
          counter badge renders at the end of the stack with exact pixel overlap control
          via the <code>overlap</code> prop.
        </p>
      </footer>
    </div>
  )
}