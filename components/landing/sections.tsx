import Link from "next/link";
import {
  ArrowRightIcon,
  CheckIcon,
  CopyIcon,
  GaugeIcon,
  InfinityIcon,
  PaletteIcon,
  TerminalIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react";

import { CopyButton } from "@/components/docs/copy-button";
import { Button } from "@/components/ui/button";

const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ZapIcon,
    title: "Ten-second install",
    body: "One command copies the component, its hook and its CSS into your project. No config file, no provider, no wrapper.",
  },
  {
    icon: PaletteIcon,
    title: "Variant-driven",
    body: "Every component ships at least three visual variants, selected through props rather than a config object you have to memorise.",
  },
  {
    icon: GaugeIcon,
    title: "60fps or it is not done",
    body: "Only transform and opacity are animated, zero cumulative layout shift, and no main-thread work during scroll.",
  },
  {
    icon: CopyIcon,
    title: "Source you own",
    body: "Nothing is compiled or minified away. The exact file that runs on this site lands in your repo, and you can edit it.",
  },
  {
    icon: InfinityIcon,
    title: "No subscription",
    body: "Pay once or never. The free tier is not a trial, and the whole thing runs on free infrastructure.",
  },
  {
    icon: TerminalIcon,
    title: "Framework aware",
    body: "The CLI detects Next.js App Router, Pages Router, Vite and Remix, and writes to the right directories for each.",
  },
];

const FREE_FEATURES = [
  "8 free animation components",
  "Full, editable source",
  "Install with one CLI command",
  "Typed props interfaces",
  "Reduced-motion support",
];

const PRO_FEATURES = [
  "WebGL Image Trail",
  "Horizontal Parallax Pin Gallery",
  "3D Perspective Card Stack",
  "Text Fill Animation",
  "Priority support",
  "Lifetime access to every Pro release",
];

/* PLACEHOLDER PRICING. The exact Pro price is still an open question in
   context/progress-tracker.md — confirm before this page ships. */
const PRICING = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    summary: "The whole free tier, no account required.",
    features: FREE_FEATURES,
    cta: { label: "Start free", href: "/docs" },
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$99",
    cadence: "one-time",
    summary: "Every Pro component plus everything we ship later.",
    features: PRO_FEATURES,
    cta: { label: "Get Pro", href: "/docs/components/cinematic-text" },
    highlighted: true,
  },
];

export function FeatureGrid() {
  return (
    <section className="border-y border-dead-800 bg-dead-900/40">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-dead-red">
          Why Dead UI
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-dead-50">
          We killed the complexity. Dead simple. Dead smooth.
        </h2>

        <ul className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <li key={feature.title}>
              <feature.icon
                className="size-5 text-dead-red"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <h3 className="mt-4 text-base font-medium text-dead-50">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-dead-400">
                {feature.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function GetStarted() {
  return (
    <section id="get-started" className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-dead-red">
            Get started
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-dead-50">
            Three commands, zero setup.
          </h2>
          <ol className="mt-8 space-y-6">
            {[
              {
                step: "01",
                title: "Initialise the CLI in your project",
                body: "Detects Next.js, Vite or Remix and remembers where your components live.",
              },
              {
                step: "02",
                title: "Add the component you want",
                body: "Missing peer dependencies (gsap, motion, three) are offered for install first.",
              },
              {
                step: "03",
                title: "Drop it in and ship",
                body: "Import it, tweak the props. The docs page for each component is a live playground.",
              },
            ].map((item) => (
              <li key={item.step} className="flex gap-4">
                <span className="font-mono text-xs text-dead-red">
                  {item.step}
                </span>
                <div>
                  <h3 className="text-base font-medium text-dead-50">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-dead-400">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-4">
          <TerminalBlock command="npx deadui@latest init" />
          <TerminalBlock command="npx deadui@latest add cinematic-text" />
          <TerminalBlock command="npx deadui@latest add magnetic-button" />
          <Button asChild size="lg" className="w-full">
            <Link href="/docs">
              Browse the components
              <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function TerminalBlock({ command }: { command: string }) {
  return (
    <div className="group relative">
      <pre className="overflow-x-auto rounded-lg border border-dead-800 bg-dead-950 p-4 font-mono text-[13px] leading-relaxed">
        <code>
          <span className="select-none text-dead-red">$</span>{" "}
          <span className="text-dead-50">{command}</span>
        </code>
      </pre>
      <CopyButton />
    </div>
  );
}

export function Pricing() {
  return (
    <section
      id="pricing"
      className="border-y border-dead-800 bg-dead-900/40 scroll-mt-24"
    >
      <div className="mx-auto w-full max-w-4xl px-6 py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-dead-red">
          Pricing
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-dead-50">
          Pay once. Or not at all.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {PRICING.map((plan) => (
            <div
              key={plan.name}
              className={
                plan.highlighted
                  ? "rounded-xl border border-dead-red bg-dead-900 p-8 shadow-[0_0_15px_rgba(220,38,38,0.1)]"
                  : "rounded-xl border border-dead-800 bg-dead-900 p-8"
              }
            >
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-sm uppercase tracking-widest text-dead-400">
                  {plan.name}
                </h3>
                {plan.highlighted ? (
                  <span className="rounded-full bg-purple-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-purple-600 dark:text-purple-400">
                    Pro
                  </span>
                ) : null}
              </div>

              <p className="mt-6 font-mono text-4xl font-bold text-dead-50">
                {plan.price}
                <span className="ml-2 text-sm font-normal text-dead-400">
                  {plan.cadence}
                </span>
              </p>
              <p className="mt-3 text-sm text-dead-400">{plan.summary}</p>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-dead-200">
                    <CheckIcon
                      className="mt-0.5 size-4 shrink-0 text-dead-red"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                size="lg"
                variant={plan.highlighted ? "default" : "outline"}
                className="mt-8 w-full"
              >
                <Link href={plan.cta.href}>{plan.cta.label}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-sm font-bold text-dead-50">DEAD UI</p>
          <p className="mt-2 max-w-sm text-sm text-dead-400">
            Dead simple animations for React. We killed the complexity.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
          <Link href="/docs" className="text-dead-400 transition-colors duration-200 ease-out hover:text-dead-50">
            Documentation
          </Link>
          <Link href="/#pricing" className="text-dead-400 transition-colors duration-200 ease-out hover:text-dead-50">
            Pricing
          </Link>
        </nav>
      </div>

      <p className="mt-12 border-t border-dead-800 pt-6 font-mono text-[11px] uppercase tracking-widest text-dead-600">
        © {new Date().getFullYear()} Dead UI · MIT · built with GSAP, Motion and
        three.js
      </p>
    </footer>
  );
}