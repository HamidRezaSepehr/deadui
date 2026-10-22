"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import shuffleLetters from "shuffle-letters"
import { cn } from "@/lib/utils"

/** When the shuffle plays. */
export type ShuffleTrigger = "load" | "inView" | "hover"

/** The order in which the characters resolve into their final form. */
export type ShuffleRevealDirection = "start" | "end" | "center" | "random"

export interface ShuffleTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The text to shuffle. */
  text: string
  /**
   * When the animation plays.
   * - `load` — as soon as the component mounts.
   * - `inView` — once, when 50% of the element is on screen.
   * - `hover` — every time the pointer enters the element.
   */
  trigger?: ShuffleTrigger
  /** Frames each character spends scrambling before it locks into place. Default: 10 */
  iterations?: number
  /** The order in which the characters resolve. Default: `"start"` */
  revealDirection?: ShuffleRevealDirection
  /**
   * A custom pool of scrambling characters. Every character is replaced by a
   * random character from this pool, so `"01"` produces a digital glitch and
   * `"▓▒░"` a matrix sweep. The library's own type-matched pools are used
   * when this is omitted.
   */
  characters?: string
  /**
   * Scramble with the text's own characters instead of a generic pool. Case is
   * preserved where the text has a matching character. Takes precedence over
   * `characters`. Default: false
   */
  useOriginalCharsOnly?: boolean
  /** Frames per second. Default: 30 */
  fps?: number
  /** Called when a run finishes. */
  onComplete?: () => void
}

/* -------------------------------------------------------------------------- */
/*                                  Engine                                    */
/* -------------------------------------------------------------------------- */

/**
 * The engine is `shuffle-letters` — the package that ships the effect — but its
 * public API is `shuffleLetters(element, config)`, which returns the function
 * that stops the animation. There is no constructor, no `start()` and no
 * `destroy()`, and it exposes neither a custom character pool nor a reveal
 * order.
 *
 * So the standard configuration — a left-to-right reveal with the library's own
 * type-matched character pools — runs on the library itself, and the three
 * options the library does not ship (`revealDirection`, `characters`,
 * `useOriginalCharsOnly`) run on the local engine below, which mirrors the
 * library's algorithm frame for frame and adds them. Both paths write the same
 * frames and both end on the exact text.
 */

/** The character classes the default pools are matched against. */
type CharClass = "lower" | "upper" | "digit" | "symbol"

/** The library's default pools, one per character class. */
const DEFAULT_POOLS: Record<CharClass, string> = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digit: "0123456789",
  symbol: ",.?/\\(^)![]{}*&^%$#'\"",
}

function classify(char: string): CharClass {
  if (/[a-z]/.test(char)) return "lower"
  if (/[A-Z]/.test(char)) return "upper"
  if (/[0-9]/.test(char)) return "digit"
  return "symbol"
}

function isSpace(char: string): boolean {
  return /\s/.test(char)
}

/** Picks a random character out of a pool. */
function pick(pool: string[]): string | undefined {
  if (pool.length === 0) return undefined
  return pool[Math.floor(Math.random() * pool.length)]
}

/** Produces the scrambling character that stands in for a target character. */
type RandomCharacter = (target: string) => string

/**
 * Builds the character picker for a run.
 *
 * `useOriginalCharsOnly` wins over `characters`: it is the stricter
 * instruction ("only these characters") and it keeps the text's own casing.
 */
function createRandomCharacter(
  source: string[],
  characters: string | undefined,
  useOriginalCharsOnly: boolean
): RandomCharacter {
  if (useOriginalCharsOnly) {
    const byClass: Record<CharClass, string[]> = {
      lower: [],
      upper: [],
      digit: [],
      symbol: [],
    }
    const fallback: string[] = []

    for (const char of source) {
      if (isSpace(char)) continue
      fallback.push(char)
      byClass[classify(char)].push(char)
    }

    return (target) => {
      const sameClass = byClass[classify(target)]
      return pick(sameClass.length > 0 ? sameClass : fallback) ?? target
    }
  }

  if (characters && characters.length > 0) {
    const pool = characters.split("").filter((char) => !isSpace(char))
    return (target) => pick(pool) ?? target
  }

  return (target) => pick(DEFAULT_POOLS[classify(target)].split("")) ?? target
}

/**
 * The order in which the characters resolve.
 *
 * `positions` holds the indices of the non-space characters, in reading order.
 * Spaces are never shuffled and never hidden — the library keeps them visible
 * too — so they are left out of the ordering entirely.
 */
function buildRevealOrder(
  positions: number[],
  direction: ShuffleRevealDirection
): number[] {
  if (direction === "end") {
    return [...positions].reverse()
  }

  if (direction === "random") {
    const order = [...positions]
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const swap = order[i]
      order[i] = order[j]
      order[j] = swap
    }
    return order
  }

  if (direction === "center") {
    const center = (positions.length - 1) / 2
    return positions
      .map((position, index) => ({ position, index }))
      .sort(
        (a, b) =>
          Math.abs(a.index - center) - Math.abs(b.index - center) ||
          a.index - b.index
      )
      .map((entry) => entry.position)
  }

  return [...positions]
}

interface ShuffleEngineOptions {
  text: string
  iterations: number
  fps: number
  revealDirection: ShuffleRevealDirection
  characters?: string
  useOriginalCharsOnly: boolean
  /** The offsets where the final text breaks onto a new line. */
  lineBreaks: number[]
  onComplete?: () => void
}

/**
 * Re-inserts the line breaks of the final text into a frame.
 *
 * The frames are written with `white-space: pre` — no soft wrapping — so the
 * only way a frame can break onto a second line is an explicit newline. The
 * offsets come from the final text's own layout, so a text that wraps keeps
 * exactly the same line structure while it scrambles.
 */
function insertLineBreaks(text: string, breaks: number[]): string {
  if (breaks.length === 0) return text

  let result = ""
  let cursor = 0

  for (const offset of breaks) {
    if (offset <= cursor || offset > text.length) continue
    result += text.slice(cursor, offset) + "\n"
    cursor = offset
  }

  return result + text.slice(cursor)
}

/**
 * The character offsets where a text breaks onto a new line.
 *
 * Measured from the invisible copy of the final text, which is laid out
 * exactly like the text the reader sees.
 */
function measureLineBreaks(node: Text): number[] {
  const range = document.createRange()
  const breaks: number[] = []
  let previousTop: number | null = null

  for (let index = 0; index < node.length; index++) {
    range.setStart(node, index)
    range.setEnd(node, index + 1)
    const rect = range.getClientRects()[0]
    if (!rect) continue
    if (previousTop !== null && Math.abs(rect.top - previousTop) > 1) {
      breaks.push(index)
    }
    previousTop = rect.top
  }

  return breaks
}

/**
 * Runs the shuffle on `element` and returns the function that stops it.
 *
 * The frame model is the library's: a character is scrambled for `iterations`
 * frames, locks in, and the characters that are still outside the window are
 * hidden — so the text resolves into place one character at a time.
 */
function runShuffle(element: HTMLElement, options: ShuffleEngineOptions): () => void {
  const {
    text,
    iterations,
    fps,
    revealDirection,
    characters,
    useOriginalCharsOnly,
    lineBreaks,
  } = options

  // A scramble is WIDER than the text it replaces — "M" is wider than "i" —
  // so a soft wrap would change the number of lines while the animation
  // plays, and the second line would spill out of the box the component
  // reserved. The text is therefore held on one line for the duration of the
  // run, and the line breaks of the final text are re-inserted as explicit
  // newlines, so a text that wraps keeps its exact line structure.
  element.style.whiteSpace = "pre"

  const finish = () => {
    // Hand the text back to the browser: the final state wraps naturally.
    element.style.whiteSpace = ""
    element.textContent = text
    options.onComplete?.()
  }

  // The library handles the standard configuration — a single-line text, so
  // there are no line breaks for it to carry.
  if (
    revealDirection === "start" &&
    !characters &&
    !useOriginalCharsOnly &&
    lineBreaks.length === 0
  ) {
    return shuffleLetters(element, {
      text,
      iterations,
      fps,
      onComplete: () => finish(),
    })
  }

  // Everything else runs on the local engine, which mirrors the library's
  // algorithm and adds the three options the library does not ship.
  const chars = text.split("")
  const positions: number[] = []
  chars.forEach((char, index) => {
    if (!isSpace(char)) positions.push(index)
  })

  const order = buildRevealOrder(positions, revealDirection)
  const rank = new Array<number>(chars.length).fill(-1)
  order.forEach((position, index) => {
    rank[position] = index
  })

  const randomCharacter = createRandomCharacter(chars, characters, useOriginalCharsOnly)

  let frame = -iterations
  let timer: ReturnType<typeof setTimeout> | null = null

  const tick = () => {
    let frameText = ""

    for (let index = 0; index < chars.length; index++) {
      const char = chars[index]

      // Spaces stay exactly where they are — they are never scrambled and
      // never hidden.
      if (isSpace(char)) {
        frameText += char
        continue
      }

      const position = rank[index]

      if (position < frame) {
        // Already resolved.
        frameText += char
      } else if (position < frame + iterations) {
        // Inside the scrambling window.
        frameText += randomCharacter(char)
      } else {
        // Outside the window the character is still hidden — but its slot is
        // kept as a blank, so the text resolves IN PLACE. A reveal order is
        // only meaningful if the characters stay where they are: the tail of
        // the word has to sit at the right while the head resolves.
        frameText += " "
      }
    }

    element.textContent = insertLineBreaks(frameText, lineBreaks)
    frame += 1

    if (frame <= positions.length) {
      timer = setTimeout(tick, 1000 / fps)
    } else {
      finish()
    }
  }

  tick()

  return () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }
}

/** Owns one run of the animation and can stop it again. */
interface ShuffleController {
  /** Plays the shuffle. */
  start: () => void
  /** Stops the shuffle and releases its timer. */
  destroy: () => void
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/* -------------------------------------------------------------------------- */
/*                                Component                                   */
/* -------------------------------------------------------------------------- */

export function ShuffleText({
  text,
  trigger = "load",
  iterations = 10,
  revealDirection = "start",
  characters,
  useOriginalCharsOnly = false,
  fps = 30,
  onComplete,
  className,
  onMouseEnter,
  ...props
}: ShuffleTextProps) {
  const targetRef = useRef<HTMLSpanElement>(null)
  const reservationRef = useRef<HTMLSpanElement>(null)
  const controllerRef = useRef<ShuffleController | null>(null)
  const hasAnimatedRef = useRef(false)

  // The offsets where the final text breaks onto a new line, measured from
  // the invisible copy of that text.
  const lineBreaksRef = useRef<number[]>([])
  // The measurement is asynchronous, so the load trigger waits for it: the
  // engine needs to know whether the text is a single line before it starts.
  const [isMeasured, setIsMeasured] = useState(false)

  // The completion callback is read through a ref so an inline arrow function
  // (a new identity on every parent render) can never restart the animation.
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const destroy = useCallback(() => {
    controllerRef.current?.destroy()
    controllerRef.current = null
  }, [])

  const start = useCallback(() => {
    const element = targetRef.current
    if (!element) return

    // A restart must never leave the previous run's timer alive.
    destroy()

    // The engine owns the element's text from here on, so the DOM is reset to
    // the final text before every run.
    element.style.whiteSpace = ""
    element.textContent = text

    // `prefers-reduced-motion` — the animation is skipped entirely and the
    // text is left in its final, readable state.
    if (prefersReducedMotion()) return

    let stop: (() => void) | null = null

    const controller: ShuffleController = {
      start: () => {
        stop = runShuffle(element, {
          text,
          iterations,
          fps,
          revealDirection,
          characters,
          useOriginalCharsOnly,
          lineBreaks: lineBreaksRef.current,
          onComplete: () => onCompleteRef.current?.(),
        })
      },
      destroy: () => {
        stop?.()
        stop = null
      },
    }

    controllerRef.current = controller
    controller.start()
  }, [
    text,
    iterations,
    fps,
    revealDirection,
    characters,
    useOriginalCharsOnly,
    destroy,
  ])

  /**
   * The line breaks of the final text.
   *
   * The invisible copy holds the final text and is laid out exactly like the
   * text the reader sees, so it is where the breaks are measured. They are
   * re-measured whenever the copy is resized, because a narrower container
   * wraps the text at different offsets.
   */
  useEffect(() => {
    const reservation = reservationRef.current
    if (!reservation) return

    const measure = () => {
      const node = reservation.firstChild
      lineBreaksRef.current =
        node && node.nodeType === Node.TEXT_NODE
          ? measureLineBreaks(node as Text)
          : []
    }

    measure()
    setIsMeasured(true)

    const observer = new ResizeObserver(measure)
    observer.observe(reservation)

    return () => {
      observer.disconnect()
    }
  }, [text])

  // The engine replaces the element's text node, so React's own text update
  // can land on a detached node. The DOM is therefore re-synced from the prop,
  // and any run in flight is stopped so it cannot overwrite it.
  useEffect(() => {
    destroy()
    const element = targetRef.current
    if (!element) return
    element.style.whiteSpace = ""
    if (element.textContent !== text) element.textContent = text
  }, [text, destroy])

  // `load` — plays once, as soon as the component mounts. It waits for the
  // line breaks to be measured, because they decide which engine runs.
  useEffect(() => {
    if (trigger !== "load") return
    if (!isMeasured) return
    start()
  }, [trigger, start, isMeasured])

  // `inView` — plays once, when 50% of the element is on screen.
  useEffect(() => {
    if (trigger !== "inView") return
    const element = targetRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry || !entry.isIntersecting) return
        if (hasAnimatedRef.current) return

        hasAnimatedRef.current = true
        // Stop watching, so scrolling back and forth cannot replay it.
        observer.unobserve(entry.target)
        start()
      },
      { threshold: 0.5 }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [trigger, start])

  // The animation is stopped when the component unmounts, so its timer can
  // never outlive the element it writes to.
  useEffect(() => {
    return () => {
      controllerRef.current?.destroy()
      controllerRef.current = null
    }
  }, [])

  const handleMouseEnter = (event: React.MouseEvent<HTMLSpanElement>) => {
    onMouseEnter?.(event)
    if (trigger !== "hover") return
    start()
  }

  return (
    <span
      className={cn("relative inline-block", className)}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {/* Reserves the final text's width, so the shuffle can never shift the
          layout around it — zero CLS. It is also where the line breaks of the
          final text are measured. */}
      <span
        ref={reservationRef}
        aria-hidden="true"
        className="invisible select-none whitespace-pre-wrap"
      >
        {text}
      </span>

      {/* The animated copy. The engine rewrites its text on every frame and
          holds it on one line while it runs, so the number of lines can never
          change mid-animation. */}
      <span
        ref={targetRef}
        aria-hidden="true"
        className="absolute inset-0 whitespace-pre-wrap"
      >
        {text}
      </span>

      {/* The stable copy for assistive technology — the animated one is
          scrambled while it runs. */}
      <span className="sr-only">{text}</span>
    </span>
  )
}
