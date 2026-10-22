/**
 * Minimal ambient typings for `shuffle-letters` (v1.1.0), which ships no
 * declaration file of its own.
 *
 * The package exports a single function — `shuffleLetters(element, config)` —
 * which shuffles the text content of a DOM element and returns the function
 * that stops the animation (it clears the internal timer). There is no
 * constructor, no `start()` and no `destroy()`, and the configuration only
 * carries `text`, `iterations`, `fps` and `onComplete`.
 */
declare module "shuffle-letters" {
  export interface ShuffleLettersOptions {
    /** Alternative text, used instead of the element's own `textContent`. */
    text?: string
    /** Frames each character spends scrambling before it locks in. Default: 8 */
    iterations?: number
    /** Frames per second. Default: 30 */
    fps?: number
    /** Called when the animation completes. */
    onComplete?: (element: HTMLElement) => void
  }

  /** Shuffles the element's text and returns the function that stops it. */
  export default function shuffleLetters(
    element: HTMLElement,
    options?: ShuffleLettersOptions
  ): () => void
}
