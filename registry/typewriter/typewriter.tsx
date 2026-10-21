"use client"

import React, { useId, type HTMLAttributes } from "react"
import TypewriterComponent, { type TypewriterState } from "typewriter-effect"
import { cn } from "@/lib/utils"

export interface TypewriterProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Text to type — a single string, or an array cycled with delete-and-retype. */
  text: string | string[]
  /** Delay between typed characters, in ms. Default: 50 */
  delay?: number
  /** Delay between deleted characters, in ms. Defaults to `delay`. */
  deleteSpeed?: number
  /** Restart the sequence forever instead of finishing after the last string. Default: false */
  loop?: boolean
  /** Begin typing on mount. Default: true */
  autoStart?: boolean
  /** The cursor glyph rendered inside the cursor element. Default: "|" */
  cursor?: string
  /** CSS colour applied to the cursor. Default: "currentColor" */
  cursorColor?: string
  /** CSS width of the cursor box, e.g. "2px", "4px". Default: "2px" */
  cursorWidth?: string
  /** CSS height of the cursor box, e.g. "1em", "1.2em". Default: "1em" */
  cursorHeight?: string
  /** Called when the sequence completes — once without `loop`, every cycle with it. */
  onComplete?: () => void
}

export function Typewriter({
  text,
  delay = 50,
  deleteSpeed,
  loop = false,
  autoStart = true,
  cursor = "|",
  cursorColor = "currentColor",
  cursorWidth = "2px",
  cursorHeight = "1em",
  onComplete,
  className,
  ...props
}: TypewriterProps) {
  const instanceId = useId()

  // The library only clears the screen between strings when `strings` is an
  // array, so a non-looping single string must stay a string (it would be
  // deleted at the end otherwise), while a LOOPING single string must be
  // wrapped — the trailing delete is what keeps each cycle from appending.
  const strings = Array.isArray(text) ? text : loop ? [text] : text

  // `typewriter-effect` writes options.cursor into `.Typewriter__cursor` via
  // innerHTML (a string API — React nodes become "[object Object]") and then
  // injects its own blink keyframes into <head>. So the cursor customisation
  // rides on a style block instead of a custom cursor node: it is scoped to
  // THIS instance via a useId data attribute (several typewriters with
  // different cursors can coexist on one page), every property carries
  // !important to beat the library's own rule, and `animation` is deliberately
  // left alone so the native opacity blink keeps running. `overflow: hidden`
  // makes width/height authoritative — without it the glyph would simply paint
  // over the box and the sizing props would be layout no-ops.
  const cursorCss = `
[data-typewriter="${instanceId}"] .Typewriter__cursor {
  color: ${cursorColor} !important;
  width: ${cursorWidth} !important;
  height: ${cursorHeight} !important;
  display: inline-block !important;
  vertical-align: middle !important;
  margin-left: 2px !important;
  overflow: hidden !important;
  line-height: 1 !important;
}
@media (prefers-reduced-motion: reduce) {
  [data-typewriter="${instanceId}"] .Typewriter__cursor {
    animation: none !important;
    -webkit-animation: none !important;
    opacity: 1 !important;
  }
}`

  return (
    <div
      className={cn("inline-flex items-center", className)}
      {...props}
      data-typewriter={instanceId}
    >
      <TypewriterComponent
        options={{
          strings,
          autoStart,
          loop,
          delay,
          deleteSpeed: deleteSpeed ?? delay,
          cursor,
        }}
        onInit={(typewriter) => {
          // code-standards: every animation must honour
          // prefers-reduced-motion. The engine autostarts inside its
          // constructor (before this callback), so reduce is handled by
          // stopping it before the first frame runs and writing the first
          // string in statically — no typing, no blinking.
          const reduce =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches

          if (reduce) {
            typewriter.stop()
            // The engine carries `state` at runtime but the public typings
            // only declare the class methods — intersect rather than `any`.
            const engine = typewriter as typeof typewriter & {
              state: TypewriterState
            }
            engine.state.elements.wrapper.textContent = Array.isArray(text)
              ? text[0]
              : text
            return
          }

          // The React wrapper exposes no onComplete, so it is queued onto the
          // engine's own event loop: the constructor has already queued the
          // whole sequence, and callFunction appends after it — firing once a
          // non-looping run drains, or once per cycle while looping.
          if (onComplete) {
            typewriter.callFunction(() => onComplete())
          }
        }}
      />
      <style dangerouslySetInnerHTML={{ __html: cursorCss }} />
    </div>
  )
}
