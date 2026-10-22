"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

export interface MorphingTextProps {
  /** The strings that morph into one another, in order. */
  texts: string[];
  /**
   * Seconds a single morph takes. Lower is snappier. Default: 1.5
   */
  morphTime?: number;
  /**
   * Seconds the finished word is held before the next morph starts.
   * Default: 0.5
   */
  cooldownTime?: number;
  className?: string;
  /**
   * Blur applied to the whole stage, on top of the SVG threshold filter.
   * Any CSS length. Default: "0.6px"
   */
  filterBlur?: string;
  /**
   * Alpha offset in the `feColorMatrix`. The lower the value, the more of
   * the glyph dissolves into the liquid edge. Default: -140
   */
  threshold?: number;
}

/**
 * Morphing text.
 *
 * Two stacked layers cross-fade while an SVG `feColorMatrix` threshold filter
 * eats away at the alpha of both, which is what turns a plain cross-fade into
 * a liquid dissolve. The per-layer blur is what sells the motion: the layer
 * losing the word blurs out of focus while the winner sharpens up.
 *
 * The whole animation runs on `requestAnimationFrame` and writes straight to
 * the DOM — there is no React state in the loop, so the animation never
 * re-renders the tree.
 */
export function MorphingText({
  texts,
  morphTime = 1.5,
  cooldownTime = 0.5,
  className,
  filterBlur = "0.6px",
  threshold = -140,
}: MorphingTextProps) {
  /**
   * The filter id has to be unique per instance — two components on one page
   * would otherwise share a single `<filter>` — and it has to be legal inside
   * a `url(#…)` token, so the characters React's `useId` is allowed to use are
   * narrowed down to a safe subset.
   */
  const filterId = `morphing-text-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  /** Index of the string currently held by the front layer. */
  const indexRef = useRef(0);
  /** Seconds elapsed inside the morph that is currently playing. */
  const morphRef = useRef(0);
  /** Seconds left of the pause between two morphs. */
  const cooldownRef = useRef(0);

  const frontRef = useRef<HTMLSpanElement>(null);
  const backRef = useRef<HTMLSpanElement>(null);

  /**
   * The props the loop reads are mirrored into refs.
   *
   * That is what keeps the timing props live without restarting the
   * animation: the `requestAnimationFrame` loop is created once and reads the
   * current values on every frame, so `morphTime` / `cooldownTime` / `texts`
   * can change mid-morph and the new value is used on the next frame.
   */
  const textsRef = useRef(texts);
  const morphTimeRef = useRef(morphTime);
  const cooldownTimeRef = useRef(cooldownTime);

  useEffect(() => {
    textsRef.current = texts;
  }, [texts]);

  useEffect(() => {
    morphTimeRef.current = morphTime;
  }, [morphTime]);

  useEffect(() => {
    cooldownTimeRef.current = cooldownTime;
  }, [cooldownTime]);

  /**
   * Writes one frame of the cross-fade directly to the DOM.
   *
   * `fraction` is the progress of the morph: 0 means "the front layer holds
   * the whole word", 1 means "the back layer does".
   */
  const paint = useCallback((fraction: number) => {
    const front = frontRef.current;
    const back = backRef.current;
    if (!front || !back) return;

    const list = textsRef.current;
    if (list.length === 0) return;

    const progress = Math.min(Math.max(fraction, 0), 1);
    const inverted = 1 - progress;

    // `8 / progress` is the inverse of the easing below, so the blur falls off
    // as the layer gains opacity. It is clamped because a progress of 0 would
    // divide by zero.
    back.style.filter = `blur(${Math.min(8 / progress - 8, 100)}px)`;
    back.style.opacity = `${Math.pow(progress, 0.4) * 100}%`;

    front.style.filter = `blur(${Math.min(8 / inverted - 8, 100)}px)`;
    front.style.opacity = `${Math.pow(inverted, 0.4) * 100}%`;

    front.textContent = list[indexRef.current % list.length];
    back.textContent = list[(indexRef.current + 1) % list.length];
  }, []);

  useEffect(() => {
    const list = textsRef.current;
    if (list.length === 0) return;

    /**
     * Reduced motion: hold the first word, statically. The layers are still
     * painted once so the text is on screen, but the loop never starts.
     */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const front = frontRef.current;
      const back = backRef.current;
      if (front && back) {
        front.textContent = list[0];
        front.style.filter = "none";
        front.style.opacity = "100%";
        back.textContent = list[1] ?? list[0];
        back.style.filter = "none";
        back.style.opacity = "0%";
      }
      return;
    }

    // Paint the first word before the loop starts, so the text is never
    // missing on the first frame.
    paint(0);

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);

      // Clamped: a backgrounded tab reports one huge delta when it wakes up,
      // which would jump straight to the end of the morph.
      const delta = Math.min((now - last) / 1000, 0.1);
      last = now;

      if (cooldownRef.current > 0) {
        cooldownRef.current -= delta;
        // Holding on the finished word — the DOM is already correct, so
        // nothing is written this frame.
        if (cooldownRef.current > 0) return;
        cooldownRef.current = 0;
        morphRef.current = 0;
      }

      morphRef.current += delta;

      const duration = morphTimeRef.current;
      const fraction = duration > 0 ? morphRef.current / duration : 1;

      if (fraction >= 1) {
        // The morph is done: the back layer now holds the finished word, so
        // it becomes the front layer and the next word starts to blur in.
        indexRef.current = (indexRef.current + 1) % list.length;
        cooldownRef.current = cooldownTimeRef.current;
        paint(0);
        return;
      }

      paint(fraction);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paint]);

  return (
    <div
      className={cn(
        "relative mx-auto h-16 w-full max-w-3xl text-center font-sans text-[40pt] leading-none font-bold md:h-24 lg:text-[6rem]",
        className,
      )}
      /**
       * The threshold filter dissolves the two layers into one another and the
       * blur softens the edge. It is applied inline so `filterBlur` stays a
       * live prop — a `<style>` block would need one class name per value,
       * and a selector aimed at the wrapper would leak into the rest of the
       * page.
       */
      style={{ filter: `url(#${filterId}) blur(${filterBlur})` }}
    >
      <span
        ref={frontRef}
        aria-hidden="true"
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
      />
      <span
        ref={backRef}
        aria-hidden="true"
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
      />
      <svg
        className="fixed h-0 w-0"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter id={filterId}>
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values={`1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 ${threshold}`}
            />
          </filter>
        </defs>
      </svg>
      {/* The animated layers are written to the DOM by hand, so the words are
          also published once for assistive technology. */}
      <span className="sr-only">{texts.join(" ")}</span>
    </div>
  );
}
