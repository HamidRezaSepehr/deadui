"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";

import { CopyButton } from "@/components/docs/copy-button";
import { Button } from "@/components/ui/button";
import { CinematicText } from "@/registry/cinematic-text";

/**
 * Hero backdrop: the Pro WebGL trail (Component #8), loaded only in the browser
 * and only on the landing page — three.js + R3F must never reach the docs
 * bundle or a server render.
 */
const WebGLImageTrail = dynamic(
  () => import("@/registry/pro/webgl-image-trail").then((m) => m.WebGLImageTrail),
  { ssr: false, loading: () => null },
);

const TRAIL_IMAGES = [
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80",
];

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
      {/* Live WebGL trail. `absolute` + `inset-0` means it never participates in
          layout, so it cannot shift the headline (zero-CLS invariant). */}
      <div className="absolute inset-0 -z-10 opacity-50">
        <WebGLImageTrail
          images={TRAIL_IMAGES}
          effect="liquid"
          trailSize={6}
          imageScale={0.35}
          fadeDuration={1.4}
          tintColor="#fafafa"
          fallbackText="Move your cursor to wake the trail"
          // `cursor-none` from the component's cva is overridden here: on a
          // landing page the system cursor has to keep working.
          className="cursor-auto"
        />
      </div>

      {/* Scrim: keeps the copy legible over a moving photographic backdrop. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-dead-950/80 via-dead-950/70 to-dead-950" />

      {/* The headline block is click-through so the trail still receives pointer
          moves over the empty hero; the controls inside opt back in. */}
      <div className="pointer-events-none mx-auto w-full max-w-5xl px-6 py-32 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-dead-800 bg-dead-900/70 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-dead-400">
          <SparklesIcon className="size-3.5 text-dead-red" strokeWidth={1.5} />
          11 components · free &amp; pro
        </span>

        <CinematicText
          variant="blur-in"
          duration={1}
          stagger={0.03}
          className="mt-8 font-mono text-5xl font-bold leading-[1.05] tracking-tight text-dead-50 sm:text-7xl"
        >
          Dead simple animations for React.
        </CinematicText>

        <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-dead-400 sm:text-lg">
          GSAP scroll effects, WebGL trails and cinematic text reveals —
          installed in under ten seconds with a single command. No config
          files. No setup wizards. Just drop it in and ship.
        </p>

        <div className="pointer-events-auto mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/docs">
              Browse the components
              <ArrowRightIcon />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/docs/components/cinematic-text">See a live demo</Link>
          </Button>
        </div>

        <div className="group pointer-events-auto relative mx-auto mt-12 w-full max-w-xl">
          <pre className="overflow-x-auto rounded-lg border border-dead-800 bg-dead-950/90 p-4 text-left font-mono text-[13px] leading-relaxed backdrop-blur">
            <code>
              <span className="select-none text-dead-red">$</span>{" "}
              <span className="text-dead-50">npx deadui@latest init</span>
            </code>
          </pre>
          <CopyButton />
        </div>
      </div>
    </section>
  );
}