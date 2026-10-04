"use client";

import { useCallback, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { CinematicText } from "@/registry/cinematic-text";
import { GradientBorder } from "@/registry/gradient-border";
import { MagneticButton } from "@/registry/magnetic-button";

interface ShowcaseEntry {
  name: string;
  title: string;
  description: string;
  href: string;
  preview: ReactNode;
}

/**
 * The live previews are mounted only while a card is hovered or keyboard
 * focused. Nine simultaneously running GSAP timelines on a marketing page is
 * main-thread work nobody asked for; one at a time is the point of the hover.
 */
const ENTRIES: ShowcaseEntry[] = [
  {
    name: "cinematic-text",
    title: "Cinematic Text Reveal",
    description:
      "GSAP SplitText + ScrollTrigger, letter by letter, with four variants.",
    href: "/docs/components/cinematic-text",
    preview: (
      <CinematicText
        variant="slide-stagger"
        duration={0.8}
        stagger={0.04}
        className="text-2xl font-bold text-dead-50"
      >
        Split me
      </CinematicText>
    ),
  },
  {
    name: "magnetic-button",
    title: "Magnetic Elastic Button",
    description:
      "Motion spring physics that pulls toward the cursor and snaps back.",
    href: "/docs",
    preview: (
      <MagneticButton variant="glow" size="lg">
        Pull me
      </MagneticButton>
    ),
  },
  {
    name: "gradient-border",
    title: "Gradient Border Glow",
    description:
      "A pure-CSS conic gradient that rotates around any shape, no WebGL.",
    href: "/docs",
    preview: (
      <GradientBorder
        variant="rotating"
        radius="lg"
        speed={5}
        blur={6}
        colors={["#dc2626", "#fafafa", "#dc2626"]}
        className="rounded-lg px-8 py-4"
      >
        <span className="font-mono text-sm text-dead-50">Rotate</span>
      </GradientBorder>
    ),
  },
];

export function Showcase() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-dead-red">
            The free tier
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-dead-50">
            Start with these three.
          </h2>
        </div>
        <Link
          href="/docs"
          className="inline-flex items-center gap-1 font-mono text-xs text-dead-400 underline decoration-dead-700 underline-offset-4 transition-colors duration-200 ease-out hover:text-dead-50"
        >
          All components
          <ArrowUpRightIcon className="size-3.5" strokeWidth={1.5} />
        </Link>
      </div>

      <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {ENTRIES.map((entry) => (
          <li key={entry.name}>
            <ShowcaseCard entry={entry} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ShowcaseCard({ entry }: { entry: ShowcaseEntry }) {
  const [active, setActive] = useState(false);

  const show = useCallback(() => setActive(true), []);
  const hide = useCallback(() => setActive(false), []);

  return (
    <article
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-dead-800 bg-dead-900 transition-[border-color,box-shadow] duration-200 ease-out hover:border-dead-700 hover:shadow-[0_0_15px_rgba(220,38,38,0.1)] focus-within:border-dead-700"
    >
      <div className="bg-preview-grid relative flex h-48 items-center justify-center overflow-hidden border-b border-dead-800">
        {active ? (
          entry.preview
        ) : (
          <span className="font-mono text-xs uppercase tracking-widest text-dead-600">
            Hover to preview
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-base font-medium text-dead-50">{entry.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-dead-400">
          {entry.description}
        </p>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-dead-600">
          deadui add {entry.name}
        </p>
      </div>
    </article>
  );
}