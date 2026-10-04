import { promises as fs } from 'fs'
import path from 'path'
import chalk from 'chalk'
import prompts from 'prompts'
import { installDependencies } from '../utils/install-deps.js'
import { detectFramework } from '../utils/detect-framework.js'

interface UserPackageJson {
  name?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

/** One property to merge into a target object, with the key used for collision detection. */
interface ThemeEntry {
  key: string
  lines: string[]
}

type InjectStatus = 'injected' | 'already-present' | 'unrecognized'

const REQUIRED_DEPS = [
  'gsap',
  'motion',
  'class-variance-authority',
  'clsx',
  'tailwind-merge',
  'lucide-react',
]

const UTILS_SOURCE = [
  'import { clsx, type ClassValue } from "clsx"',
  'import { twMerge } from "tailwind-merge"',
  '',
  'export function cn(...inputs: ClassValue[]) {',
  '  return twMerge(clsx(inputs))',
  '}',
  '',
].join('\n')

// Same extension list `detect-framework.ts` uses for its config files: a real
// `create-next-app` project is ESM-first, so the two-file list in the spec
// (.ts / .js) would miss the .mjs / .cjs / .mts forms people actually ship.
const TAILWIND_CONFIG_FILES = [
  'tailwind.config.ts',
  'tailwind.config.js',
  'tailwind.config.mjs',
  'tailwind.config.cjs',
  'tailwind.config.mts',
  'tailwind.config.cts',
]

const TAILWIND_CSS_FILES = [
  'app/globals.css',
  'src/app/globals.css',
  'styles/globals.css',
  'src/styles/globals.css',
  'app/index.css',
  'src/index.css',
]

const TSCONFIG_FILES = ['tsconfig.json', 'tsconfig.app.json', 'tsconfig.base.json']

const THEME_MARKER = 'deadui:theme'

/**
 * A `cn` export in any of the shapes a real project uses. Matching the symbol
 * rather than the file's contents is what keeps `init` idempotent: it can never
 * append a second `cn` to a file that already exports one.
 */
const CN_EXPORT_PATTERNS = [
  /export\s+(?:async\s+)?function\s+cn\s*\(/,
  /export\s+(?:const|let|var)\s+cn\b/,
  /export\s*\{[^}]*\bcn\b[^}]*\}/,
]

/**
 * The spec's token block, verbatim, split into the three `theme.extend`
 * properties it contributes.
 *
 * Three additive notes, all forced by what lives in `registry/` rather than
 * invented (the values are the Dead palette from `app/globals.css`):
 *
 * 1. `dead` also carries the numeric scale + `red`. Every shipped component
 *    styles itself with `bg-dead-950` / `text-dead-400` / `bg-dead-red` /
 *    `border-dead-800`, and the spec's semantic-only list emits none of those,
 *    so a project initialised from the spec block alone renders every component
 *    unstyled.
 * 2. `marquee-vertical` keyframes + animation: `registry/marquee` switches to
 *    `animate-marquee-vertical` for `direction="vertical"`, which the spec
 *    block does not define.
 * 3. `gradient-rotate` / `gradient-pulse` read `var(--duration,
 *    var(--gb-duration, 4s))` and the pulse keyframes scale by
 *    `var(--gb-intensity, 1)`. `registry/gradient-border` publishes
 *    `--gb-duration` / `--gb-intensity` from its `speed` / `intensity` props,
 *    so the spec's flat `var(--duration, 4s)` would leave both props dead — a
 *    CSS animation outranks the inline `opacity` the component sets. With those
 *    two variables unset the emitted strings are identical to the spec's.
 */
const THEME_PROPERTIES: { property: string; entries: ThemeEntry[] }[] = [
  {
    property: 'colors',
    entries: [
      {
        key: 'dead',
        lines: [
          'dead: {',
          "  black: '#050505',",
          "  surface: '#0a0a0a',",
          "  elevated: '#111111',",
          "  white: '#fafafa',",
          "  muted: '#71717a',",
          "  accent: '#ef4444',",
          "  'accent-hover': '#dc2626',",
          "  border: '#27272a',",
          "  'border-hover': '#3f3f46',",
          '',
          '  /* Numeric scale + red: what the shipped components reference. */',
          "  '50': '#fafafa',",
          "  '200': '#e4e4e7',",
          "  '400': '#a1a1aa',",
          "  '600': '#52525b',",
          "  '700': '#3f3f46',",
          "  '800': '#27272a',",
          "  '900': '#18181b',",
          "  '950': '#09090b',",
          "  red: '#dc2626',",
          "  'red-hover': '#ef4444',",
          '},',
        ],
      },
    ],
  },
  {
    property: 'keyframes',
    entries: [
      {
        key: 'marquee',
        lines: [
          'marquee: {',
          "  from: { transform: 'translateX(0)' },",
          "  to: { transform: 'translateX(calc(-100% / var(--repeat, 4)))' },",
          '},',
        ],
      },
      {
        key: 'marquee-vertical',
        lines: [
          "'marquee-vertical': {",
          "  from: { transform: 'translateY(0)' },",
          "  to: { transform: 'translateY(calc(-100% / var(--repeat, 4)))' },",
          '},',
        ],
      },
      {
        key: 'gradient-rotate',
        lines: [
          "'gradient-rotate': {",
          "  '0%': { transform: 'rotate(0deg)' },",
          "  '100%': { transform: 'rotate(360deg)' },",
          '},',
        ],
      },
      {
        key: 'gradient-pulse',
        lines: [
          "'gradient-pulse': {",
          "  '0%, 100%': { opacity: 'calc(0.4 * var(--gb-intensity, 1))' },",
          "  '50%': { opacity: 'var(--gb-intensity, 1)' },",
          '},',
        ],
      },
    ],
  },
  {
    property: 'animation',
    entries: [
      {
        key: 'marquee',
        lines: ["marquee: 'marquee var(--duration, 30s) linear infinite var(--direction, normal)',"],
      },
      {
        key: 'marquee-vertical',
        lines: [
          "'marquee-vertical':",
          "  'marquee-vertical var(--duration, 30s) linear infinite var(--direction, normal)',",
        ],
      },
      {
        key: 'gradient-rotate',
        lines: [
          "'gradient-rotate':",
          "  'gradient-rotate var(--duration, var(--gb-duration, 4s)) linear infinite',",
        ],
      },
      {
        key: 'gradient-pulse',
        lines: [
          "'gradient-pulse':",
          "  'gradient-pulse var(--duration, var(--gb-duration, 4s)) ease-in-out infinite',",
        ],
      },
    ],
  },
]

/**
 * The same tokens for Tailwind v4, which has no `theme.extend` and ignores
 * `tailwind.config.*` unless a stylesheet opts back in with `@config`.
 *
 * The animation utilities are plain rules inside `@layer utilities` rather than
 * `--animate-*` tokens, for the reason recorded in `app/globals.css`: v4 emits
 * theme variables on `:root`, so a `var()` nested inside a `:root` custom
 * property resolves against `:root` (where `--duration` is unset) and keeps the
 * fallback instead of reading the animated element.
 */
const THEME_CSS_BLOCK = `/* ${THEME_MARKER} — Dead UI theme tokens. Added by \`deadui init\`; safe to edit. */
@theme static {
  --color-dead-black: #050505;
  --color-dead-surface: #0a0a0a;
  --color-dead-elevated: #111111;
  --color-dead-white: #fafafa;
  --color-dead-muted: #71717a;
  --color-dead-accent: #ef4444;
  --color-dead-accent-hover: #dc2626;
  --color-dead-border: #27272a;
  --color-dead-border-hover: #3f3f46;

  /* Numeric scale + red: what the shipped components reference. */
  --color-dead-50: #fafafa;
  --color-dead-200: #e4e4e7;
  --color-dead-400: #a1a1aa;
  --color-dead-600: #52525b;
  --color-dead-700: #3f3f46;
  --color-dead-800: #27272a;
  --color-dead-900: #18181b;
  --color-dead-950: #09090b;
  --color-dead-red: #dc2626;
  --color-dead-red-hover: #ef4444;
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100% / var(--repeat, 4)));
  }
}

@keyframes marquee-vertical {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(calc(-100% / var(--repeat, 4)));
  }
}

@keyframes gradient-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes gradient-pulse {
  0%,
  100% {
    opacity: calc(0.4 * var(--gb-intensity, 1));
  }
  50% {
    opacity: var(--gb-intensity, 1);
  }
}

@layer utilities {
  .animate-marquee {
    animation-name: marquee;
    animation-duration: var(--duration, 30s);
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-direction: var(--direction, normal);
  }

  .animate-marquee-vertical {
    animation-name: marquee-vertical;
    animation-duration: var(--duration, 30s);
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-direction: var(--direction, normal);
  }

  .animate-gradient-rotate {
    animation-name: gradient-rotate;
    animation-duration: var(--gb-duration, 4s);
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }

  .animate-gradient-pulse {
    animation-name: gradient-pulse;
    animation-duration: var(--gb-duration, 4s);
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }
}

@media (prefers-reduced-motion: reduce) {
  .animate-marquee,
  .animate-marquee-vertical,
  .animate-gradient-rotate,
  .animate-gradient-pulse {
    animation: none;
  }
}
`

function detectEol(source: string): string {
  return source.includes('\r\n') ? '\r\n' : '\n'
}

function isIdentifierChar(char: string): boolean {
  return /[A-Za-z0-9_$]/.test(char)
}

function skipQuoted(source: string, start: number): number {
  const quote = source[start]
  let i = start + 1
  while (i < source.length) {
    const char = source[i]
    if (char === '\\') {
      i += 2
      continue
    }
    if (char === quote) return i + 1
    i++
  }
  return source.length
}

function skipLineComment(source: string, start: number): number {
  const newline = source.indexOf('\n', start)
  return newline === -1 ? source.length : newline + 1
}

function skipBlockComment(source: string, start: number): number {
  const close = source.indexOf('*/', start + 2)
  return close === -1 ? source.length : close + 2
}

/**
 * Index of the `{` opening `name: {` between `start` and `end`, or -1.
 *
 * String- and comment-aware, and it matches quoted keys as well as bare ones so
 * one scanner serves a JS tailwind config (`theme: {`) and a JSON tsconfig
 * (`"compilerOptions": {`). Keys are compared as whole identifiers, which is
 * what stops `subTheme:` from matching `theme` and `deadline:` from matching
 * `dead`.
 *
  * A regex cannot do this: a tailwind config routinely mentions `theme` inside
  * a string or a comment (`@type {import('tailwindcss').Config}` sits right
  * above the config object in almost every project), and a blind
  * `theme\\s*:\\s*\\{` fires on those.
 */
function findPropertyObject(source: string, name: string, start: number, end: number): number {
  const readObjectOpen = (afterName: number): number => {
    let k = afterName
    while (k < end && /\s/.test(source[k])) k++
    if (source[k] !== ':') return -1
    k++
    while (k < end && /\s/.test(source[k])) k++
    return source[k] === '{' ? k : -1
  }

  let i = start
  while (i < end) {
    const char = source[i]

    if (char === '/' && source[i + 1] === '/') {
      i = skipLineComment(source, i)
      continue
    }
    if (char === '/' && source[i + 1] === '*') {
      i = skipBlockComment(source, i)
      continue
    }
    if (char === '"' || char === "'") {
      const quoteEnd = skipQuoted(source, i)
      if (source.slice(i + 1, quoteEnd - 1) === name) {
        const open = readObjectOpen(quoteEnd)
        if (open !== -1) return open
      }
      i = quoteEnd
      continue
    }
    if (char === '`') {
      i = skipQuoted(source, i)
      continue
    }
    if (isIdentifierChar(char) && !/\d/.test(char)) {
      const wordStart = i
      let j = i
      while (j < end && isIdentifierChar(source[j])) j++
      if (source.slice(wordStart, j) === name) {
        const open = readObjectOpen(j)
        if (open !== -1) return open
      }
      i = j
      continue
    }

    i++
  }

  return -1
}

/** Index of the `}` closing the object opened at `openIndex`, or -1. */
function findMatchingBrace(source: string, openIndex: number): number {
  let depth = 0
  let i = openIndex

  while (i < source.length) {
    const char = source[i]

    if (char === '/' && source[i + 1] === '/') {
      i = skipLineComment(source, i)
      continue
    }
    if (char === '/' && source[i + 1] === '*') {
      i = skipBlockComment(source, i)
      continue
    }
    if (char === '"' || char === "'" || char === '`') {
      i = skipQuoted(source, i)
      continue
    }
    if (char === '{') depth++
    else if (char === '}') {
      depth--
      if (depth === 0) return i
    }

    i++
  }

  return -1
}

/** True when `key` is a direct property of the object opened at `openIndex`. */
function hasDirectKey(source: string, openIndex: number, key: string): boolean {
  const close = findMatchingBrace(source, openIndex)
  const end = close === -1 ? source.length : close

  let depth = 0
  let i = openIndex + 1

  while (i < end) {
    const char = source[i]

    if (char === '/' && source[i + 1] === '/') {
      i = skipLineComment(source, i)
      continue
    }
    if (char === '/' && source[i + 1] === '*') {
      i = skipBlockComment(source, i)
      continue
    }
    if (char === '"' || char === "'") {
      const quoteEnd = skipQuoted(source, i)
      if (depth === 0 && source.slice(i + 1, quoteEnd - 1) === key) return true
      i = quoteEnd
      continue
    }
    if (char === '`') {
      i = skipQuoted(source, i)
      continue
    }
    if (char === '{' || char === '[') {
      depth++
      i++
      continue
    }
    if (char === '}' || char === ']') {
      depth--
      i++
      continue
    }
    if (depth === 0 && isIdentifierChar(char) && !/\d/.test(char)) {
      const wordStart = i
      let j = i
      while (j < end && isIdentifierChar(source[j])) j++
      if (source.slice(wordStart, j) === key) return true
      i = j
      continue
    }

    i++
  }

  return false
}

/**
 * Is the `{` at `braceIndex` an object LITERAL rather than a brace group?
 *
 * `{ Config }` in `import type { Config } from 'tailwindcss'` is the case that
 * matters: a naive "first `{` wins" root detector picks it, and every
 * subsequent insertion then lands inside the import statement and shreds the
 * file. An object literal is preceded by `=` (`const config: Config = {`),
 * by `export default`, or by nothing at all (a tsconfig's root `{`).
 */
function looksLikeObjectLiteral(source: string, braceIndex: number): boolean {
  let i = braceIndex - 1

  while (i >= 0 && /[ \t]/.test(source[i])) i--
  if (i < 0) return true

  const char = source[i]
  if (char === '=') return true
  if (char === ',' || char === '(' || char === '[' || char === ':') return false

  const chain: string[] = []
  while (i >= 0 && (isIdentifierChar(source[i]) || source[i] === '.')) {
    chain.unshift(source[i])
    i--
  }

  const word = chain.join('')
  return word === 'default' || word.endsWith('default')
}

/**
 * The `{` of the top-level config object: after `export default` /
 * `module.exports` when present, otherwise the first object LITERAL in code
 * position (a tsconfig has neither assignment form, it just opens with `{`).
 */
function findRootObjectOpen(source: string): number {
  const assignment = /(?:export\s+default|module\.exports)\s*=\s*\{/.exec(source)
  if (assignment) return assignment.index + assignment[0].length - 1

  let i = 0
  while (i < source.length) {
    const char = source[i]

    if (char === '/' && source[i + 1] === '/') {
      i = skipLineComment(source, i)
      continue
    }
    if (char === '/' && source[i + 1] === '*') {
      i = skipBlockComment(source, i)
      continue
    }
    if (char === '"' || char === "'" || char === '`') {
      i = skipQuoted(source, i)
      continue
    }
    if (char === '{' && looksLikeObjectLiteral(source, i)) return i

    i++
  }

  return -1
}

function indentAt(source: string, index: number): string {
  const lineStart = source.lastIndexOf('\n', index) + 1
  const match = /^[ \t]*/.exec(source.slice(lineStart, index))
  return match ? match[0] : ''
}

/** True when the object at `anchorOpen` has content that needs a separating comma. */
function objectIsEmpty(source: string, anchorOpen: number): boolean {
  let i = anchorOpen + 1

  while (i < source.length) {
    const char = source[i]
    if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
      i++
      continue
    }
    if (char === '/' && source[i + 1] === '/') {
      i = skipLineComment(source, i)
      continue
    }
    if (char === '/' && source[i + 1] === '*') {
      i = skipBlockComment(source, i)
      continue
    }
    return char === '}'
  }

  return true
}

/**
 * Insert `lines` as the first entries of the object whose `{` is `anchorOpen`.
 *
 * Lines are indented relative to the anchor, and nothing outside the braces is
 * touched — the user's own formatting, imports, comments and nested config
 * survive byte-for-byte. This is the whole non-destructiveness guarantee: the
 * file is never parsed into a value and re-serialised.
 */
function insertIntoObject(
  source: string,
  anchorOpen: number,
  lines: string[],
  anchorIndent: string
): string {
  const eol = detectEol(source)
  const base = `${anchorIndent}  `
  const block = lines.map((line) => (line.length > 0 ? base + line : '')).join(eol)

  const next = source[anchorOpen + 1]
  const breaksLine = next === '\n' || next === '\r'
  const insertion = breaksLine ? eol + block : eol + block + eol + anchorIndent

  return source.slice(0, anchorOpen + 1) + insertion + source.slice(anchorOpen + 1)
}

/** `name: { … }` as relative lines, so `insertIntoObject` can place the whole thing. */
function wrapObject(lines: string[], name: string): string[] {
  return [`${name}: {`, ...lines.map((line) => (line.length > 0 ? `  ${line}` : '')), '},']
}

/** Add `name: {}` to the object at `containerOpen` when it is not there yet. */
function ensureObjectProperty(
  source: string,
  containerOpen: number,
  name: string
): string {
  const close = findMatchingBrace(source, containerOpen)
  const end = close === -1 ? source.length : close
  if (findPropertyObject(source, name, containerOpen + 1, end) !== -1) return source
  return insertIntoObject(source, containerOpen, [`${name}: {},`], indentAt(source, containerOpen))
}

/**
 * Ensure `theme.extend` exists, creating `theme` and then `extend` when absent.
 *
 * Returns the (possibly rewritten) source together with the index of `extend`'s
 * `{` in THAT string — the two must travel together, because creating the
 * objects shifts every index after them.
 */
function ensureExtendObject(
  source: string,
  rootOpen: number
): { content: string; open: number } {
  const withTheme = ensureObjectProperty(source, rootOpen, 'theme')
  const rootStill = findRootObjectOpen(withTheme)
  const themeOpen = findPropertyObject(
    withTheme,
    'theme',
    rootStill === -1 ? 0 : rootStill + 1,
    withTheme.length
  )
  if (themeOpen === -1) return { content: withTheme, open: -1 }

  const withExtend = ensureObjectProperty(withTheme, themeOpen, 'extend')
  const themeStill = findPropertyObject(withTheme, 'theme', 0, withExtend.length)
  const themeAnchor = themeStill === -1 ? 0 : themeStill

  return {
    content: withExtend,
    open: findPropertyObject(withExtend, 'extend', themeAnchor + 1, withExtend.length),
  }
}

/**
 * Merge `entries` into `property` of the object at `containerOpen`.
 *
 * Two shapes, and choosing correctly is the difference between a working
 * install and a silently unstyled one: if `property` already exists the entries
 * are merged into IT (skipping any key the user already defined), otherwise a
 * new `property` object is created. Emitting a second `colors:` key would be a
 * duplicate property in a JS object literal, where the LAST one wins — so a
 * user with their own `colors: { brand: … }` would silently lose the entire
 * Dead UI palette, including every `bg-dead-*` class the components rely on.
 */
function mergeEntries(
  source: string,
  containerOpen: number,
  property: string,
  entries: ThemeEntry[]
): { content: string; status: 'injected' | 'already-present' } {
  const containerClose = findMatchingBrace(source, containerOpen)
  const containerEnd = containerClose === -1 ? source.length : containerClose
  const propertyOpen = findPropertyObject(source, property, containerOpen + 1, containerEnd)

  if (propertyOpen !== -1) {
    const missing = entries.filter((entry) => !hasDirectKey(source, propertyOpen, entry.key))
    if (missing.length === 0) return { content: source, status: 'already-present' }
    const lines = missing.flatMap((entry) => entry.lines)
    return {
      content: insertIntoObject(source, propertyOpen, lines, indentAt(source, propertyOpen)),
      status: 'injected',
    }
  }

  const lines = entries.flatMap((entry) => entry.lines)
  if (lines.length === 0) return { content: source, status: 'already-present' }
  const anchorIndent = indentAt(source, containerOpen)
  return {
    content: insertIntoObject(
      source,
      containerOpen,
      wrapObject(lines, property),
      anchorIndent
    ),
    status: 'injected',
  }
}

/**
 * Merge the Dead UI tokens into an existing Tailwind config without rewriting
 * it. `theme` and `theme.extend` are created only when absent, and each of
 * `colors` / `keyframes` / `animation` is merged into the user's own object
 * when one exists.
 */
function injectThemeTokens(source: string): { content: string; status: InjectStatus } {
  if (
    source.includes(THEME_MARKER) ||
    (source.includes('gradient-rotate') && source.includes('accent-hover'))
  ) {
    return { content: source, status: 'already-present' }
  }

  const rootOpen = findRootObjectOpen(source)
  if (rootOpen === -1) return { content: source, status: 'unrecognized' }

  let working = source
  let injected = false

  // Reversed: each merge lands at the TOP of `extend`, so iterating backwards
  // leaves the emitted file in the spec's colors → keyframes → animation order.
  for (const { property, entries } of [...THEME_PROPERTIES].reverse()) {
    const located = ensureExtendObject(working, rootOpen)
    if (located.open === -1) return { content: source, status: 'unrecognized' }

    const result = mergeEntries(located.content, located.open, property, entries)
    working = result.content
    if (result.status === 'injected') injected = true
  }

  return { content: working, status: injected ? 'injected' : 'already-present' }
}

/**
 * Merge `"@/*"` into `compilerOptions.paths` without rewriting the tsconfig.
 *
 * Every key emitted here is QUOTED. TypeScript's tsconfig parser is not JSON5:
 * it accepts comments and trailing commas but rejects a bare `paths: {`, and
 * `tsc` answers that with `TS1327: String literal with double quotes expected`
 * and refuses to read its own config. So this has to be `"paths": {`.
 */
function injectPathAlias(
  source: string,
  target: string
): { content: string; status: InjectStatus } {
  const rootOpen = findRootObjectOpen(source)
  if (rootOpen === -1) return { content: source, status: 'unrecognized' }

  const alias = (): string => `"@/*": ["${target}"]`
  const rootIndent = indentAt(source, rootOpen)

  const compilerOptionsOpen = findPropertyObject(
    source,
    'compilerOptions',
    rootOpen + 1,
    source.length
  )

  if (compilerOptionsOpen === -1) {
    const rootComma = objectIsEmpty(source, rootOpen) ? '' : ','
    return {
      content: insertIntoObject(
        source,
        rootOpen,
        ['"compilerOptions": {', '  "paths": {', `    ${alias()}`, '  }', `}${rootComma}`],
        rootIndent
      ),
      status: 'injected',
    }
  }

  const compilerOptionsClose = findMatchingBrace(source, compilerOptionsOpen)
  const compilerOptionsEnd = compilerOptionsClose === -1 ? source.length : compilerOptionsClose
  const pathsOpen = findPropertyObject(source, 'paths', compilerOptionsOpen + 1, compilerOptionsEnd)

  if (pathsOpen === -1) {
    const anchorIndent = indentAt(source, compilerOptionsOpen)
    const comma = objectIsEmpty(source, compilerOptionsOpen) ? '' : ','
    return {
      content: insertIntoObject(
        source,
        compilerOptionsOpen,
        ['"paths": {', `  ${alias()}`, `}${comma}`],
        anchorIndent
      ),
      status: 'injected',
    }
  }

  if (hasDirectKey(source, pathsOpen, '@/*')) {
    return { content: source, status: 'already-present' }
  }

  const comma = objectIsEmpty(source, pathsOpen) ? '' : ','
  return {
    content: insertIntoObject(source, pathsOpen, [`${alias()}${comma}`], indentAt(source, pathsOpen)),
    status: 'injected',
  }
}

async function firstExistingFile(cwd: string, candidates: string[]): Promise<string | undefined> {
  for (const candidate of candidates) {
    try {
      await fs.access(path.join(cwd, candidate))
      return candidate
    } catch {
      // keep looking
    }
  }
  return undefined
}

function tailwindMajorVersion(packageJson: UserPackageJson): number | null {
  const range = packageJson.dependencies?.tailwindcss ?? packageJson.devDependencies?.tailwindcss
  if (!range) return null
  const match = /(\d+)/.exec(range)
  return match ? Number(match[1]) : null
}

function looksLikeTailwindV4(packageJson: UserPackageJson, css: string | undefined): boolean {
  if (tailwindMajorVersion(packageJson) === 4) return true
  if (css && /@(?:import\s+["']tailwindcss|theme)\b/.test(css)) return true
  return false
}

function printManualTailwindNote(cssEntry: string | undefined): void {
  console.log(chalk.dim('  Add the Dead UI tokens yourself:'))
  console.log(chalk.dim('  • Tailwind v4 — append a `@theme` block to your main stylesheet.'))
  if (cssEntry) console.log(chalk.dim(`    (this project styles via ${cssEntry})`))
  console.log(chalk.dim('  • Tailwind v3 — merge them into `theme.extend` in your config.'))
  console.log(chalk.dim('  Then re-run `deadui init` — it will not double-inject them.'))
}

async function writeNewTailwindConfig(
  cwd: string,
  hasSrc: boolean,
  isV4: boolean
): Promise<void> {
  const content = [
    'import type { Config } from "tailwindcss"',
    '',
    'export default {',
    '  content: [',
    '    "./app/**/*.{ts,tsx,mdx}",',
    '    "./components/**/*.{ts,tsx,mdx}",',
    ...(hasSrc ? ['    "./src/**/*.{ts,tsx,mdx}",'] : []),
    '  ],',
    '  theme: {',
    '    extend: {',
    ...THEME_PROPERTIES.flatMap(({ property, entries }) => [
      `      ${property}: {`,
      ...entries.flatMap((entry) => entry.lines.map((line) => (line ? `        ${line}` : ''))),
      '      },',
    ]),
    '    },',
    '  },',
    '  plugins: [],',
    '} satisfies Config',
    '',
  ].join('\n')

  await fs.writeFile(path.join(cwd, 'tailwind.config.ts'), content, 'utf-8')
  console.log(chalk.green('✓') + ' Created tailwind.config.ts with Dead UI theme tokens.')

  if (isV4) {
    console.log(
      chalk.yellow('⚠') +
        ' Tailwind v4 ignores tailwind.config.ts unless a stylesheet references it with @config.'
    )
  }
}

async function setupTailwind(cwd: string, packageJson: UserPackageJson): Promise<void> {
  const configFile = await firstExistingFile(cwd, TAILWIND_CONFIG_FILES)

  if (configFile) {
    const configPath = path.join(cwd, configFile)
    const source = await fs.readFile(configPath, 'utf-8')
    const { content, status } = injectThemeTokens(source)

    if (status === 'already-present') {
      console.log(
        chalk.dim('•') + ` Dead UI theme tokens already present in ${chalk.cyan(configFile)}.`
      )
      return
    }

    if (status === 'unrecognized') {
      console.log(chalk.yellow('⚠') + ` Could not locate the config object in ${chalk.cyan(configFile)}.`)
      printManualTailwindNote(undefined)
      return
    }

    await fs.writeFile(configPath, content, 'utf-8')
    console.log(chalk.green('✓') + ` Updated ${chalk.cyan(configFile)} with Dead UI theme tokens.`)
    return
  }

  // No config file. A Tailwind v4 project has no `theme.extend` to merge into
  // and ignores `tailwind.config.*` unless a stylesheet opts back in with
  // `@config`, so writing one there would be inert — offer the CSS path first.
  const cssEntry = await firstExistingFile(cwd, TAILWIND_CSS_FILES)
  let cssSource: string | undefined
  if (cssEntry) {
    try {
      cssSource = await fs.readFile(path.join(cwd, cssEntry), 'utf-8')
    } catch {
      cssSource = undefined
    }
  }

  const isV4 = looksLikeTailwindV4(packageJson, cssSource)

  // Only `confirm` prompts here, never a `select`: a select needs real keypresses
  // and never settles on piped stdin, so the run would exit mid-`init`. A confirm
  // is driven by `printf 'y\n' | deadui init` and by a real TTY identically, which
  // is what the dependency prompt above already relies on.
  if (cssEntry !== undefined && cssSource !== undefined && isV4) {
    const { confirm: writeCss } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: `No Tailwind config found. This project uses Tailwind v4 — write the Dead UI tokens into ${cssEntry}?`,
      initial: true,
    })

    if (writeCss) {
      if (cssSource.includes(THEME_MARKER)) {
        console.log(
          chalk.dim('•') + ` Dead UI theme tokens already present in ${chalk.cyan(cssEntry)}.`
        )
        return
      }
      const eol = detectEol(cssSource)
      const separator = cssSource.length === 0 || cssSource.endsWith(eol) ? '' : eol
      await fs.writeFile(path.join(cwd, cssEntry), cssSource + separator + THEME_CSS_BLOCK, 'utf-8')
      console.log(chalk.green('✓') + ` Updated ${chalk.cyan(cssEntry)} with Dead UI theme tokens.`)
      return
    }

    const { confirm: makeConfig } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: 'Create a tailwind.config.ts with the Dead UI tokens instead?',
      initial: false,
    })

    if (!makeConfig) {
      printManualTailwindNote(cssEntry)
      return
    }

    await writeNewTailwindConfig(cwd, false, true)
    return
  }

  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: 'No Tailwind config found. Create a tailwind.config.ts with the Dead UI tokens?',
    initial: true,
  })

  if (!confirm) {
    printManualTailwindNote(cssEntry)
    return
  }

  await writeNewTailwindConfig(cwd, (await firstExistingFile(cwd, ['src'])) !== undefined, isV4)
}

async function setupUtils(cwd: string, libDir: string): Promise<void> {
  const utilsDir = path.join(cwd, libDir)
  const utilsPath = path.join(utilsDir, 'utils.ts')
  const label = `${libDir}/utils.ts`

  await fs.mkdir(utilsDir, { recursive: true })

  let existing: string | undefined
  try {
    existing = await fs.readFile(utilsPath, 'utf-8')
  } catch {
    existing = undefined
  }

  if (existing === undefined) {
    await fs.writeFile(utilsPath, UTILS_SOURCE, 'utf-8')
    console.log(chalk.green('✓') + ` Created ${chalk.cyan(label)}`)
    return
  }

  if (CN_EXPORT_PATTERNS.some((pattern) => pattern.test(existing))) {
    console.log(chalk.dim('•') + ` ${chalk.cyan(label)} already exports cn().`)
    return
  }

  console.log(chalk.yellow('⚠') + ` ${chalk.cyan(label)} exists but does not export a cn() function.`)
  console.log(chalk.dim('  Add this yourself, or rename the existing helper to avoid a clash:'))
  console.log(chalk.dim(UTILS_SOURCE.trimEnd().replace(/^/gm, '    ')))
}

async function setupPathAlias(cwd: string, hasSrc: boolean): Promise<void> {
  const tsconfigFile = await firstExistingFile(cwd, TSCONFIG_FILES)
  const target = hasSrc ? './src/*' : './*'

  if (tsconfigFile === undefined) {
    console.log(chalk.yellow('⚠') + ' No tsconfig.json found. Add the alias yourself:')
    console.log(chalk.dim(`    "@/*": ["${target}"]`))
    return
  }

  const tsconfigPath = path.join(cwd, tsconfigFile)
  const source = await fs.readFile(tsconfigPath, 'utf-8')
  const { content, status } = injectPathAlias(source, target)

  if (status === 'unrecognized') {
    console.log(
      chalk.yellow('⚠') + ` Could not locate compilerOptions in ${chalk.cyan(tsconfigFile)}.`
    )
    console.log(chalk.dim(`    "@/*": ["${target}"]`))
    return
  }

  if (status === 'injected') {
    await fs.writeFile(tsconfigPath, content, 'utf-8')
    console.log(
      chalk.green('✓') + ` Added "@/*": ["${target}"] to ${chalk.cyan(tsconfigFile)}.`
    )
    console.log(chalk.dim('  Restart your IDE / dev server so the new alias is picked up.'))
    return
  }

  console.log(chalk.green('✓') + ` Verified @/* path alias in ${chalk.cyan(tsconfigFile)}.`)
}

export async function initCommand(): Promise<void> {
  console.log('')
  console.log(chalk.bold('💀 Dead UI — Initializing project...'))
  console.log('')

  const cwd = process.cwd()

  let packageJson: UserPackageJson
  try {
    packageJson = JSON.parse(
      await fs.readFile(path.join(cwd, 'package.json'), 'utf-8')
    ) as UserPackageJson
  } catch {
    console.error(
      chalk.red('✗') + ' Could not find package.json. Are you in a project directory?'
    )
    process.exit(1)
  }

  const framework = detectFramework(cwd)
  const frameworkLabel = framework.isNext ? 'Next.js' : framework.isVite ? 'Vite' : 'Generic'
  console.log(
    chalk.green('✓') +
      ` Detected project: ${chalk.cyan(packageJson.name || 'unnamed')} (${frameworkLabel})`
  )

  // 1. Dependencies
  const declaredDeps: Record<string, string> = {
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
  }
  const missingDeps = REQUIRED_DEPS.filter((dep) => !(dep in declaredDeps))

  if (missingDeps.length > 0) {
    await installDependencies(missingDeps)
  } else {
    console.log(chalk.green('✓') + ' All core dependencies are already installed.')
  }

  // 2. lib/utils.ts
  await setupUtils(cwd, framework.libDir)

  // 3. Tailwind theme tokens
  await setupTailwind(cwd, packageJson)

  // 4. @/* path alias
  await setupPathAlias(cwd, framework.hasSrc)

  console.log('')
  console.log(chalk.green('✓') + ' Dead UI initialized successfully!')
  console.log(
    chalk.dim('Run `npx deadui@latest add <component>` to install your first component.')
  )
  console.log('')
}
