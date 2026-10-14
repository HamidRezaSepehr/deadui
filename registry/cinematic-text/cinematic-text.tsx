'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { GSAP_DEFAULTS, SCROLL_TRIGGER_DEFAULTS } from '@/lib/animations'
import styles from './cinematic-text.module.css'

// Register GSAP plugins once at module scope
gsap.registerPlugin(ScrollTrigger, SplitText)

// Loose tween-var object GSAP accepts everywhere. The bare `gsapVars` name
// is used by COLOR_VARIANT_TWEENS, SCRUB_VARIANT_TWEENS and initialStates;
// GSAP's own `TweenVars` interface is stricter than what these maps need
// (they hold strings/numbers that GSAP parses at runtime), so the alias
// keeps the declarations honest without fighting the types.
type gsapVars = Record<string, unknown>

export const cinematicTextVariants = cva(
  'inline-block will-change-[transform,opacity,color,filter]',
  {
    variants: {
      variant: {
        'blur-in': 'opacity-0 blur-[10px]',
        'fade-up': 'opacity-0 translate-y-5',
        // These four variants put ALL of their motion on the split units (see
        // the tween branch below), so the container must not slide/scale/blur as
        // a whole block. `opacity-0` remains purely to hide the text before JS
        // runs; the container is revealed non-animated (a set), not tweened.
        'slide-stagger': 'opacity-0',
        // Scale lives on the SPLIT UNITS (see initialStates below), not on this
        // container: `scale-pop` should pop each char/word/line individually as
        // the stagger reaches it. A container-level scale would zoom the whole
        // block first and then let the units fade in, which is not a "pop". The
        // container keeps `opacity-0` only, to hide the text before JS runs.
        'scale-pop': 'opacity-0',
        'rise-color': 'opacity-0',
        'slide-left-color': 'opacity-0',
        'scale-blur-color': 'opacity-0',
        'diagonal-blur-color':
          'opacity-0 -translate-x-[10px] translate-y-[20px] blur-[4px]',
        'flip-x-color': 'opacity-0 blur-[2px]',
        'heavy-flip-color': 'opacity-0 blur-[10px]',
        'flip-top-color': 'opacity-0 blur-[5px]',
        // Clipping is done per-line by SplitText's `mask: 'lines'` (see
        // effect below), not on this container — a block-level overflow
        // mask breaks for multi-line text because each glyph only travels
        // its own line height.
        'mask-reveal': 'opacity-0',
        // --- Codrops ScrollBlurTypography scrubbed-blur variants ---
        // These reproduce the four demos: each one is a scroll-scrubbed
        // (ease:'none', progress tied to scrollbar) char/word filter+transform
        // reveal over a grain tile. They use the shared SCROLL_SCRUB config
        // (start 'top bottom-=15%', end 'bottom center+=15%') instead of the
        // component's default play-once trigger.
        //
        // NOTE: the cva class carries ONLY the grain tile here — no `opacity-0`. The
        // Codrops demos keep the text visible-but-blurred from the very start
        // (the chars' `from` filter is applied immediately by gsap.fromTo) and
        // unblur as you scroll; only the word-split `skew-blur-grain` fades its
        // words in, and that opacity lives on the *words* (opacity:0 → 1 in
        // SCRUB_VARIANT_TWEENS), not on the container. Putting `opacity-0` on
        // this container would hide every char, and skipping the container
        // gsap.to (which normally sets opacity:1) would leave it hidden forever.
        'blur-grain': styles.cinematicTextNoise,
        'blur-grain-bright': styles.cinematicTextNoise,
        'scale-blur-grain': styles.cinematicTextNoise,
        'skew-blur-grain': styles.cinematicTextNoise,
      },
    },
    defaultVariants: {
      variant: 'blur-in',
    },
  }
)

// The "color reveal" pattern: text transitions from a dimmed gray to full
// white while opacity climbs from 0.3 to 1 (feature spec 27). GSAP cannot
// parse color-mix() as a colour, so both endpoints are tweened as complex
// strings — the two strings are structurally identical, so only the 0% → 100%
// percentage actually interpolates.
const COLOR_DIM = 'color-mix(in srgb, rgb(255, 255, 255) 0%, rgb(161, 161, 161))'
const COLOR_FULL =
  'color-mix(in srgb, rgb(255, 255, 255) 100%, rgb(161, 161, 161))'

const COLOR_VARIANT_TWEENS: Record<
  string,
  { from: gsap.TweenVars; to: gsap.TweenVars }
> = {
  'rise-color': {
    from: { opacity: 0.3, y: 25, color: COLOR_DIM },
    to: { opacity: 1, y: 0, color: COLOR_FULL },
  },
  'slide-left-color': {
    from: { opacity: 0.3, x: -7, color: COLOR_DIM },
    to: { opacity: 1, x: 0, color: COLOR_FULL },
  },
  'scale-blur-color': {
    from: { opacity: 0.3, y: 15, scale: 0.5, filter: 'blur(2px)', color: COLOR_DIM },
    to: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', color: COLOR_FULL },
  },
  'diagonal-blur-color': {
    from: {
      opacity: 0.3,
      x: -10,
      y: 20,
      filter: 'blur(4px)',
      color: COLOR_DIM,
    },
    to: {
      opacity: 1,
      x: 0,
      y: 0,
      filter: 'blur(0px)',
      color: COLOR_FULL,
    },
  },
  'flip-x-color': {
    from: {
      opacity: 0.3,
      transformPerspective: 800,
      rotationX: 45,
      filter: 'blur(2px)',
      color: COLOR_DIM,
    },
    to: {
      opacity: 1,
      transformPerspective: 800,
      rotationX: 0,
      filter: 'blur(0px)',
      color: COLOR_FULL,
    },
  },
  'heavy-flip-color': {
    from: {
      opacity: 0.3,
      transformPerspective: 600,
      rotationX: 30,
      x: -15,
      y: 40,
      filter: 'blur(10px)',
      color: COLOR_DIM,
    },
    to: {
      opacity: 1,
      transformPerspective: 600,
      rotationX: 0,
      x: 0,
      y: 0,
      filter: 'blur(0px)',
      color: COLOR_FULL,
    },
  },
  'flip-top-color': {
    from: {
      opacity: 0.3,
      transformPerspective: 900,
      rotationX: -20,
      y: -30,
      filter: 'blur(5px)',
      color: COLOR_DIM,
    },
    to: {
      opacity: 1,
      transformPerspective: 900,
      rotationX: 0,
      y: 0,
      filter: 'blur(0px)',
      color: COLOR_FULL,
    },
  },
}

// --- Codrops ScrollBlurTypography scrubbed-blur variants ---
//
// The four demos are scroll-scrubbed, not play-once: `ease:'none'` and the
// progress is driven by the scrollbar, so the text "unblurs" as you scroll
// past it. The trigger is the demo's exact `top bottom-=15%` →
// `bottom center+=15%` pair, and the per-glyph stagger is 0.05s (0.04s for the
// word-split variant). `scrub` wins over everything in the config builder, so
// passing this config object in place of `scrollTrigger` is enough.
//
// `trigger` is NOT a constant here — it must be the component's own
// `containerRef.current`, which is only available inside the effect. Without it
// the ScrollTrigger would attach to the wrong element (the window/scroll
// container) and scrub during scroll 0→N at the TOP of the page, long before
// the user scrolls down to the card — which is exactly why the grain variants
// looked like static, fully-unblurred text on the test page. `buildScrubTrigger`
// injects the per-element trigger below.
const SCROLL_SCRUB = {
  start: 'top bottom-=15%',
  end: 'bottom center+=15%',
  scrub: true,
}

export function buildScrubScrollTrigger(trigger: HTMLDivElement | null) {
  return { trigger: trigger ?? undefined, ...SCROLL_SCRUB }
}

// Each grain variant is a fromTo (both endpoints pinned) because GSAP cannot
// interpolate `filter` shorthand as a single value — a plain `from()` would
// tween from the browser's computed filter string and produce a muddy half-
// blur. The brightness() values match the four demos (0%, 30%, 50%, 100%).
const SCRUB_VARIANT_TWEENS: Record<
  string,
  { from: gsapVars; to: gsapVars }
> = {
  'blur-grain': {
    from: { filter: 'blur(10px) brightness(0%)', willChange: 'filter' },
    to: { filter: 'blur(0px) brightness(100%)', ease: 'none', stagger: 0.05 },
  },
  'blur-grain-bright': {
    from: { filter: 'blur(10px) brightness(30%)', willChange: 'filter' },
    to: { filter: 'blur(0px) brightness(100%)', ease: 'none', stagger: 0.05 },
  },
  'scale-blur-grain': {
    from: {
      scaleY: 0.1,
      scaleX: 1.8,
      filter: 'blur(10px) brightness(50%)',
      willChange: 'filter, transform',
    },
    to: {
      scaleY: 1,
      scaleX: 1,
      filter: 'blur(0px) brightness(100%)',
      ease: 'none',
      stagger: 0.05,
    },
  },
  'skew-blur-grain': {
    from: {
      opacity: 0,
      skewX: -20,
      filter: 'blur(8px)',
      willChange: 'filter, transform',
    },
    to: { opacity: 1, skewX: 0, filter: 'blur(0px)', ease: 'sine', stagger: 0.04 },
  },
}

export interface CinematicTextProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cinematicTextVariants> {
  children: string
  duration?: number
  delay?: number
  stagger?: number
  splitBy?: 'chars' | 'words' | 'lines'

  // New Scroll Configuration Props
  start?: string        // Default: 'top 85%' (e.g., 'top center', '30% bottom')
  end?: string          // Default: 'bottom top'
  once?: boolean        // Default: true (plays once). Set false to repeat every time it enters the viewport.
  scrub?: boolean | number // Default: false. If true, animation progress links to scroll.
  toggleActions?: string // GSAP toggleActions override, e.g. 'play none none reverse' (down only), 'none reverse none none' (up only). Defaults to 'play reverse play reverse' when once=false, otherwise once:true.
  preview?: boolean // Default: false. Makes the scroll-scrubbed *-grain variants play once on mount (and replay on any prop change) instead of binding progress to the scrollbar. For non-scrolling playgrounds/previews; no effect on the other variants.
}

export function CinematicText({
  className,
  variant,
  children,
  duration = GSAP_DEFAULTS.duration,
  delay = 0,
  stagger = GSAP_DEFAULTS.stagger,
  splitBy = 'chars',
  start,
  end,
  once,
  scrub,
  toggleActions,
  preview = false,
  ...props
}: CinematicTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !children) return

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      gsap.set(containerRef.current, { opacity: 1, filter: 'none', y: 0, x: 0, scale: 1 })
      return
    }

    const ctx = gsap.context(() => {
      const variantKey = variant || 'blur-in'
      const isMaskReveal = variantKey === 'mask-reveal'
      const isScrubGrain = variantKey in SCRUB_VARIANT_TWEENS
      // `preview` demotes the grain variants from scroll-scrubbed to play-once.
      // The docs customizer renders inside a fixed, non-scrolling box, so a
      // scrub would freeze at whatever progress the page scroll happens to be
      // — the words/chars would appear already-revealed or already-blurred and
      // never move. With `preview` they reuse the standard play-once trigger
      // (and re-run on every prop change), so selecting the variant or moving a
      // slider replays the reveal. It only affects the grain variants.
      const isScrubbed = isScrubGrain && !preview
      // The Codrops "skew-blur-grain" demo (effect-4) is the word-split one —
      // it splits words only, not chars, and the animation targets
      // `split.words`. The other three grain variants split words+chars like
      // the original cinematic-text (so words wrap correctly at line ends).
      const splitTypeWordsOnly = variantKey === 'skew-blur-grain'
      // Variants whose entire motion lives on the split units (chars/words).
      // Their container must not slide/scale/blur as a whole block, so the
      // container tween below is reduced to a non-animated reveal for them.
      const isUnitMotionOnly =
        variantKey === 'slide-stagger' ||
        variantKey === 'rise-color' ||
        variantKey === 'slide-left-color' ||
        variantKey === 'scale-blur-color'

      // Create SplitText instance.
      //
      // `splitBy="chars"` ALWAYS also splits words: SplitText renders each
      // char as an inline-block, and without a word wrapper the browser is
      // free to wrap between any two chars, breaking words mid-way at line
      // ends ("extraord|inary"). The word spans restore normal word-boundary
      // wrapping; the animation targets are still `split.chars`.
      //
      // mask-reveal reproduces the Codrops "TypographyMotion" stagger reveal:
      // every *line* is its own `overflow: hidden` mask and the glyphs inside
      // slide up from `y: 100%` to `0%`. We therefore additionally split into
      // lines and let SplitText wrap each line in a clipping element via
      // `mask: 'lines'`. This works for any number of lines and for chars /
      // words / lines targets alike.
      const splitType = splitTypeWordsOnly
        ? 'words'
        : Array.from(
          new Set([
            ...(isMaskReveal ? ['lines'] : []),
            ...(splitBy === 'chars' ? ['words', 'chars'] : [splitBy]),
          ])
        ).join(',')

      const split = new SplitText(containerRef.current, {
        type: splitType,
        ...(isMaskReveal ? { mask: 'lines' as const } : {}),
        charsClass: 'split-char',
        wordsClass: 'split-word',
        linesClass: 'split-line',
      })

      // Define initial states based on variant (the *-color variants are
      // handled by COLOR_VARIANT_TWEENS' fromTo below instead)
      const initialStates: Record<string, gsap.TweenVars> = {
        'blur-in': { opacity: 0, filter: 'blur(10px)' },
        'fade-up': { opacity: 0, y: 20 },
        'slide-stagger': { opacity: 0, x: -20 },
        'scale-pop': { opacity: 0, scale: 0.5 },
      }

      // The word-split grain variant targets words; everything else targets
      // whatever `splitBy` asked for (chars default).
      const targetElements = splitTypeWordsOnly
        ? split.words
        : split[splitBy] || split.chars

      // Build ScrollTrigger config conditional on `scrub` (wins), an
      // explicit `toggleActions` override, or `once` (direction-agnostic
      // replay default when once=false). The Codrops grain variants ignore
      // all of these and use the demo's exact scrubbed trigger instead —
      // unless `preview` is set, in which case they fall back to the standard
      // play-once config below so they still animate without a scrollbar.
      //
      // `trigger` MUST be this component's own containerRef.current. Without
      // it the ScrollTrigger would attach to the window/scroll-container and
      // scrub during scroll 0→N at the TOP of the page, long before the user
      // scrolls down to the card — which is exactly why the grain variants
      // looked like static, fully-unblurred text on the test page. The trigger
      // is only available inside the effect, so it is injected here rather
      // than read from the module-level SCROLL_SCRUB constant.
      const scrollTriggerConfig = isScrubbed
        ? buildScrubScrollTrigger(containerRef.current)
        : {
          trigger: containerRef.current,
          start: start || SCROLL_TRIGGER_DEFAULTS.start,
          end: end || SCROLL_TRIGGER_DEFAULTS.end,
          // Conditional logic (scrub takes precedence over everything):
          ...(scrub ? { scrub: typeof scrub === 'number' ? scrub : true } : {}),
          ...(!scrub && toggleActions ? { toggleActions } : {}),
          ...(!scrub && !toggleActions && once !== false ? { once: true } : {}),
          ...(!scrub &&
            !toggleActions &&
            once === false && {
            // Repeat every entry, either scroll direction (both-ways).
            toggleActions: 'play reverse play reverse',
          }),
        }

      if (isMaskReveal) {
        // Codrops TypographyMotion reveal: glyphs start fully below their
        // line's mask (`y: 100%`) and stagger up into place. fromTo pins
        // both ends so replays (once=false / toggleActions) are exact.
        gsap.fromTo(
          targetElements,
          { yPercent: 100 },
          {
            yPercent: 0,
            duration,
            delay,
            stagger,
            ease: 'power3.out',
            scrollTrigger: scrollTriggerConfig,
          }
        )
      } else if (isScrubGrain) {
        // Codrops ScrollBlurTypography: the four demos are scroll-scrubbed
        // (`ease:'none'`, progress tied to the scrollbar) and reveal by
        // unblurring. Both filter endpoints are pinned in SCRUB_VARIANT_TWEENS
        // so the fromTo is exact; a plain `from()` would tween from the
        // browser's computed filter and muddy the reveal. The per-glyph
        // ease/stagger come off the variant's own `to` object (effects 1-3
        // use `none` + 0.05, effect-4 uses `sine` + 0.04).
        const scrubTween = SCRUB_VARIANT_TWEENS[variantKey]
        gsap.fromTo(targetElements, scrubTween.from, {
          ...scrubTween.to,
          duration,
          delay,
          scrollTrigger: scrollTriggerConfig,
        })
      } else if (variantKey in COLOR_VARIANT_TWEENS) {
        // Colour variants need BOTH endpoints pinned (dim → white), so a
        // fromTo is required — a plain from() would tween to the element's
        // natural computed colour instead of the 100% color-mix endpoint.
        const colorTween = COLOR_VARIANT_TWEENS[variantKey]
        gsap.fromTo(targetElements, colorTween.from, {
          ...colorTween.to,
          duration,
          delay,
          stagger,
          ease: 'power3.out',
          scrollTrigger: scrollTriggerConfig,
        })
      } else {
        gsap.from(targetElements, {
          ...initialStates[variantKey],
          duration,
          delay,
          stagger,
          ease: 'power3.out',
          scrollTrigger: scrollTriggerConfig,
        })
      }

      // The Codrops grain variants animate the chars/words directly and leave the
      // container's own opacity/filter/transform at their natural values (the
      // grain tile is a background, not a transform). Skipping the container
      // tween also avoids registering a second ScrollTrigger on the same
      // element (the chars already carry their own scrubbed trigger).
      if (!isScrubGrain) {
        if (isUnitMotionOnly) {
          // No block-level animation: the container carries no transform pose
          // (see cva) and is revealed with a zero-duration set once the trigger
          // fires, so ONLY the split units animate. It must still be revealed
          // because `opacity-0` hides the text before JS runs.
          gsap.to(containerRef.current, {
            opacity: 1,
            duration: 0,
            delay,
            scrollTrigger: scrollTriggerConfig,
          })
        } else {
          gsap.to(containerRef.current, {
            opacity: 1,
            filter: 'none',
            y: 0,
            x: 0,
            scale: 1,
            duration,
            delay,
            ease: 'power3.out',
            scrollTrigger: scrollTriggerConfig,
          })
        }
      }
    }, containerRef)

    return () => ctx.revert()
  }, [children, variant, duration, delay, stagger, splitBy, start, end, once, scrub, toggleActions, preview])

  return (
    <div
      ref={containerRef}
      className={cn(cinematicTextVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  )
}