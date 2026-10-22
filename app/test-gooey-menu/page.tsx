"use client";

import { GooeyMenu } from "@/registry/gooey";
import { Home, Search, Settings, User, X } from "lucide-react";

const ITEMS = [
  { icon: <Home size={20} />, label: "Home" },
  { icon: <Search size={20} />, label: "Search" },
  { icon: <User size={20} />, label: "Profile" },
  { icon: <Settings size={20} />, label: "Settings" },
];

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <span className="font-mono text-xs font-semibold tracking-widest text-dead-red">
        {index}
      </span>
      <h2 className="font-mono text-xs uppercase tracking-widest text-dead-400">{title}</h2>
    </div>
  );
}

function Stage({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`flex min-h-[260px] items-center justify-center rounded-xl border border-dead-800 bg-dead-900/40 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

export default function GooeyMenuTestPage() {
  return (
    <main className="min-h-screen bg-dead-950 px-4 py-16 text-dead-50">
      <div className="mx-auto max-w-5xl space-y-20">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Gooey Menu — QA</h1>
          <p className="max-w-2xl text-sm text-dead-400">
            A floating action button expands into satellite items that stay connected to it
            through a liquid SVG goo filter. Framer Motion springs drive the travel, so the
            bridge stretches and snaps organically. Five directions are shown below.
          </p>
        </header>

        {/* 01 — Top */}
        <section>
          <SectionLabel index="01" title="Top" />
          <Stage>
            <GooeyMenu items={ITEMS} direction="top" />
          </Stage>
        </section>

        {/* 02 — Bottom */}
        <section>
          <SectionLabel index="02" title="Bottom" />
          <Stage>
            <GooeyMenu items={ITEMS} direction="bottom" />
          </Stage>
        </section>

        {/* 03 — Left */}
        <section>
          <SectionLabel index="03" title="Left" />
          <Stage>
            <GooeyMenu items={ITEMS} direction="left" />
          </Stage>
        </section>

        {/* 04 — Right */}
        <section>
          <SectionLabel index="04" title="Right" />
          <Stage>
            <GooeyMenu items={ITEMS} direction="right" />
          </Stage>
        </section>

        {/* 05 — Radial */}
        <section>
          <SectionLabel index="05" title="Radial" />
          <Stage>
            <GooeyMenu items={ITEMS} direction="radial" />
          </Stage>
        </section>

        {/* 06 — Custom main icon */}
        <section>
          <SectionLabel index="06" title="Custom Main Icon" />
          <Stage>
            <GooeyMenu
              items={ITEMS}
              direction="radial"
              mainIcon={<X size={22} />}
            />
          </Stage>
          <p className="mt-3 text-sm text-dead-400">
            The <code className="text-dead-200">mainIcon</code> prop replaces the default{" "}
            <code className="text-dead-200">+</code>, which rotates 135° while the menu is open.
          </p>
        </section>

        {/* 07 — Speed */}
        <section>
          <SectionLabel index="07" title="Speed" />
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                speed 0.5 — slow
              </div>
              <Stage>
                <GooeyMenu items={ITEMS} direction="top" speed={0.5} />
              </Stage>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                speed 1 — default
              </div>
              <Stage>
                <GooeyMenu items={ITEMS} direction="top" speed={1} />
              </Stage>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dead-500">
                speed 2.5 — fast
              </div>
              <Stage>
                <GooeyMenu items={ITEMS} direction="top" speed={2.5} />
              </Stage>
            </div>
          </div>
          <p className="mt-3 text-sm text-dead-400">
            <code className="text-dead-200">speed</code> multiplies the spring stiffness and
            divides the stagger delay, so higher values snap in faster. Values are clamped to a
            minimum of 0.1.
          </p>
        </section>
      </div>
    </main>
  );
}
