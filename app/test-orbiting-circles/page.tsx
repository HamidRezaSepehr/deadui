'use client'

import {
  Bell,
  Camera,
  Command,
  Cpu,
  Globe,
  Heart,
  Key,
  Mail,
  MessageCircle,
  Rocket,
  Satellite,
  Shield,
  Star,
  Zap,
} from 'lucide-react'
import { Orbit, OrbitingCircles, OrbitItem } from '@/registry/orbiting-circles'

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <span className="font-mono text-xs font-semibold tracking-widest text-dead-red">
        {index}
      </span>
      <h2 className="font-mono text-xs uppercase tracking-widest text-dead-400">{title}</h2>
    </div>
  )
}

function IconBadge({
  icon: Icon,
  size = 44,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  size?: number
}) {
  return (
    <div
      className="flex items-center justify-center rounded-full border border-dead-800 bg-dead-900 shadow-[0_0_20px_rgba(220,38,38,0.15)]"
      style={{ width: size, height: size }}
    >
      <Icon size={size * 0.5} strokeWidth={1.5} />
    </div>
  )
}

function CenterBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute top-1/2 left-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-dead-red/40 bg-dead-950 text-dead-red">
      {children}
    </div>
  )
}

export default function OrbitingCirclesTestPage() {
  return (
    <main className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50">
      <div className="mx-auto max-w-5xl space-y-20">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Orbiting Circles — QA</h1>
          <p className="max-w-2xl text-sm text-dead-400">
            Concentric rings of icons, images and any React node orbiting a center point.
            The critical guarantee: every orbiting item stays perfectly upright — its top
            always points at the top of the viewport — thanks to CSS counter-rotation.
          </p>
        </header>

        {/* 01 — Basic Orbit */}
        <section>
          <SectionLabel index="01" title="Basic Orbit" />
          <div className="relative h-[420px] rounded-xl border border-dead-800 bg-dead-900/40">
            <OrbitingCircles>
              <Orbit radius={120} duration={20}>
                <OrbitItem angle={0}>
                  <IconBadge icon={Zap} />
                </OrbitItem>
                <OrbitItem angle={120}>
                  <IconBadge icon={Heart} />
                </OrbitItem>
                <OrbitItem angle={240}>
                  <IconBadge icon={Star} />
                </OrbitItem>
              </Orbit>
            </OrbitingCircles>
          </div>
          <p className="mt-3 text-sm text-dead-400">
            Three icons on a single ring at 0&deg;, 120&deg; and 240&deg;. Each icon is drawn
            the same way a static icon is — none ever spins upside down.
          </p>
        </section>

        {/* 02 — Multi-Ring */}
        <section>
          <SectionLabel index="02" title="Multi-Ring" />
          <div className="relative h-[460px] rounded-xl border border-dead-800 bg-dead-900/40">
            <OrbitingCircles>
              <CenterBadge>
                <Command size={28} strokeWidth={1.5} />
              </CenterBadge>
              <Orbit radius={70} duration={10} reverse path>
                <OrbitItem angle={0}>
                  <IconBadge icon={Globe} size={38} />
                </OrbitItem>
                <OrbitItem angle={90}>
                  <IconBadge icon={Mail} size={38} />
                </OrbitItem>
                <OrbitItem angle={180}>
                  <IconBadge icon={MessageCircle} size={38} />
                </OrbitItem>
                <OrbitItem angle={270}>
                  <IconBadge icon={Bell} size={38} />
                </OrbitItem>
              </Orbit>
              <Orbit radius={150} duration={30} path>
                <OrbitItem angle={30}>
                  <IconBadge icon={Camera} />
                </OrbitItem>
                <OrbitItem angle={90}>
                  <IconBadge icon={Key} />
                </OrbitItem>
                <OrbitItem angle={150}>
                  <IconBadge icon={Rocket} />
                </OrbitItem>
                <OrbitItem angle={210}>
                  <IconBadge icon={Satellite} />
                </OrbitItem>
                <OrbitItem angle={270}>
                  <IconBadge icon={Cpu} />
                </OrbitItem>
                <OrbitItem angle={330}>
                  <IconBadge icon={Shield} />
                </OrbitItem>
              </Orbit>
            </OrbitingCircles>
          </div>
          <p className="mt-3 text-sm text-dead-400">
            Two concentric rings with different speeds and directions: the inner
            ring orbits <span className="font-mono text-xs text-dead-200">reverse</span> at
            10s, the outer ring forwards at 30s. Both rings stay upright.
          </p>
        </section>

        {/* 03 — Images */}
        <section>
          <SectionLabel index="03" title="Images" />
          <div className="relative h-[420px] rounded-xl border border-dead-800 bg-dead-900/40">
            <OrbitingCircles>
              <Orbit radius={130} duration={24}>
                <OrbitItem angle={0}>
                  <img
                    src="https://i.pravatar.cc/80?u=orbit-a"
                    alt="Orbiting avatar A"
                    className="h-16 w-16 rounded-full border-2 border-dead-800 object-cover"
                  />
                </OrbitItem>
                <OrbitItem angle={90}>
                  <img
                    src="https://i.pravatar.cc/80?u=orbit-b"
                    alt="Orbiting avatar B"
                    className="h-16 w-16 rounded-full border-2 border-dead-800 object-cover"
                  />
                </OrbitItem>
                <OrbitItem angle={180}>
                  <img
                    src="https://i.pravatar.cc/80?u=orbit-c"
                    alt="Orbiting avatar C"
                    className="h-16 w-16 rounded-full border-2 border-dead-800 object-cover"
                  />
                </OrbitItem>
                <OrbitItem angle={270}>
                  <img
                    src="https://i.pravatar.cc/80?u=orbit-d"
                    alt="Orbiting avatar D"
                    className="h-16 w-16 rounded-full border-2 border-dead-800 object-cover"
                  />
                </OrbitItem>
              </Orbit>
            </OrbitingCircles>
          </div>
          <p className="mt-3 text-sm text-dead-400">
            Plain <span className="font-mono text-xs text-dead-200">&lt;img&gt;</span> tags
            work exactly like icons — the faces never flip upside down as they go around.
          </p>
        </section>

        {/* 04 — No Path */}
        <section>
          <SectionLabel index="04" title="No Path" />
          <div className="relative h-[420px] rounded-xl border border-dead-800 bg-dead-900/40">
            <OrbitingCircles>
              <CenterBadge>
                <Globe size={30} strokeWidth={1.5} />
              </CenterBadge>
              <Orbit radius={110} duration={18} path={false}>
                <OrbitItem angle={0}>
                  <IconBadge icon={Heart} />
                </OrbitItem>
                <OrbitItem angle={120}>
                  <IconBadge icon={Bell} />
                </OrbitItem>
                <OrbitItem angle={240}>
                  <IconBadge icon={Rocket} />
                </OrbitItem>
              </Orbit>
            </OrbitingCircles>
          </div>
          <p className="mt-3 text-sm text-dead-400">
            <span className="font-mono text-xs text-dead-200">path={false}</span> hides the
            ring border — the track is invisible and only the orbiting items remain.
          </p>
        </section>
      </div>
    </main>
  )
}