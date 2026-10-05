# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

Phase 1: Component Implementation

## Current Goal

**Feature 25: Rainbow Button + the v0.1.2 release — implemented and
verified, awaiting one GitHub-UI click.** The new `RainbowButton` ships with
all four spec variants, `registry.json` now describes 10 components (8 Free +
2 Pro) with all 14 `files[].path` values present on disk, and `deadui init`
performs the spec's **dual** injection — the `rainbow` keyframe + animation
into the Tailwind config (or the v4 stylesheet) **and** the `--color-1`…`--color-5`
gradient stops into the project's own `:root`. What remains is drafting the
`v0.1.2` GitHub Release, which is what fires the npm publish. **The release is
`v0.1.2`, not `v0.1.1`** — the reasoning is in Next Up #13 and is not
negotiable.

## Completed

1. Next.js app scaffolded at repo root (App Router,
   TypeScript strict, ESLint, Tailwind v4, `@/*` alias).
   Next.js 16.3.5 / React 19.2.8.
2. Core dependencies installed (see below).
3. Tailwind "Dead" theme configured in `app/globals.css`
   via Tailwind v4 `@theme static` tokens (full palette +
   semantic tokens always emitted).
4. `lib/utils.ts` created (cn() = clsx + tailwind-merge).
5. `lib/animations.ts` created (shared GSAP defaults).
6. **Session 6: CLI package scaffolded** — `packages/cli/`
   (deadui) with commander `add` command, minimal
   project-detection + pro-token placeholder, full spec
   verification checklist passed (see Session Notes).
7. **Session 7: Component #1 (Cinematic Text Reveal)** —
   `registry/cinematic-text/cinematic-text.tsx` (GSAP
   SplitText + ScrollTrigger, 4 cva variants),
   `registry/cinematic-text/index.ts` barrel, entry added
   to new `registry.json`, test page at
   `app/test-cinematic-text/page.tsx`, and two shared
   defaults (`GSAP_DEFAULTS`, `SCROLL_TRIGGER_DEFAULTS`)
   added to `lib/animations.ts`. Full verification passed
   incl. live scroll animation via browser automation
   (see Session Notes).
8. **Feature 07b: Cinematic Text Scroll Enhancements** —
   `CinematicTextProps` gained optional `start`, `end`,
   `once`, and `scrub`; `useEffect` now builds the
   ScrollTrigger config conditionally (scrub-linking vs
   once vs toggleActions) while preserving the default
   (top 85%, loop-free play-once) and reduced-motion path.
   Test page rebuilt with 4 labeled, scroll-spaced
   sections (Default / Custom Position `center center` /
   Repeat `once={false}` / Scrubbed `scrub`). Verified via
   `npm run build` (zero TS errors) + browser automation
   (see Session Notes).
9. **Feature 07c: Direction-agnostic replay + toggleActions
   passthrough** — `once={false}` default changed from
   one-directional `'play none none reverse'` (played only
   on scroll-down) to direction-agnostic `'play reverse play
   reverse'` (replays on every entry from either scroll
   direction). New optional `toggleActions?: string` prop
   passes straight to GSAP for full direction control
   (e.g. `'play none none reverse'` = down-only), taking
   precedence over the `once` default while scrub still
   wins over all. New props destructured out of `...props`
   and added to the effect deps array. Test page gained a
   "DOWN ONLY" demo section. Verified via `npm run build`
   (zero TS errors) + browser automation (see Session
   Notes).
10. **Feature 08: Text Fill Animation (Pro)** —
    `registry/text-fill-animation/` (component, CSS module,
    barrel), `registry.json` entry with `tier: "pro"`, and
    test page `app/test-text-fill/page.tsx` with 8 demo
    sections (default / custom colors / custom sizing /
    fast scrub / slow scrub / custom scroller / no velocity
    primary / custom fill & dim colors). Extension after
    feature-spec review: `velocityPrimary?: boolean`
    (default true) opt-out of the velocity-reactive mid-stop,
    mapped purely via `--tfa-primary-color` = final when
    false. Verified via `npm run build` (zero TS errors) +
    automated Playwright/Chrome browser testing (see Session
    Notes): velocity-reactive gradient confirmed (fast scroll =
    wider transition band), reduced-motion collapses section
    to auto height with filled text, `aria: 'auto'` working,
    no leaks on remount, sticky pinning verified, zero
    console/page errors.
11. **Feature 09: Magnetic Elastic Button (Free)** —
    `registry/magnetic-button/` (component + barrel), `registry.json`
    entry (`tier: "free"`, `dependencies: ["motion"]`), and test
    page `app/test-magnetic-button/page.tsx` with 5 demo sections
    (variants / sizes / extreme pull strength 0.8 / elasticity
    0.1-0.4 / shapes rounded-soft-sharp) plus a keyboard + reduced-
    motion footer note. Full verification passed via `npm run build`
    (zero TS errors) + automated Playwright/Chrome testing (see
    Session Notes).
12. **Feature 10: Infinite Blur Marquee (Free)** —
    `registry/marquee/` (component + barrel), `registry.json` entry
    (`tier: "free"`, `dependencies: ["clsx", "tailwind-merge",
    "class-variance-authority"]`), keyframes + `animate-marquee`/
    `animate-marquee-vertical` utilities in `app/globals.css`, and
    test page `app/test-marquee/page.tsx` with the spec-exact 5 demo
    sections (default / vertical / pauseOnHover / reverse + speed 10 /
    blur="none"). Full verification passed via `npm run build` (zero
    TS errors) + 32/32 automated Playwright/Chrome assertions incl.
    pixel-exact seamless-loop proofs for BOTH axes (see Session
    Notes).
13. **Feature 11: Spotlight Hover Card (Free)** —
    `registry/spotlight-card/` (component + barrel), `registry.json`
    entry (`tier: "free"`, `dependencies: ["clsx", "tailwind-merge",
    "class-variance-authority"]`), and test page
    `app/test-spotlight-card/page.tsx` with the spec-exact 4 demo
    sections (3×3 grid / 4 glowType variants / enableTilt card /
    custom colors + sizes + opacity), one shape per grid row. Mouse
    tracking is pure CSS-variable + direct DOM writes — zero React
    re-renders. Full verification passed via `npm run build` (zero TS
    errors) + 47/47 automated Playwright/Chrome assertions including a
    pixel proof that the masked border glow never touches the card
    face (see Session Notes).
14. **Feature 12: Scroll-Linked Media Scrub (Free)** —
    `registry/scroll-scrub/` (component + barrel), `registry.json`
    entry (`tier: "free"`, `dependencies: ["gsap", "clsx",
    "tailwind-merge", "class-variance-authority"]`), and test page
    `app/test-scroll-scrub/page.tsx` with the spec-exact 4 demo
    sections (default image sequence with zero props / default video
    scrub / custom 5-frame Unsplash sequence / unpinned `pin={false}`
    with a shortened section). Image mode paints from a GSAP proxy
    object onto a canvas — zero React commits while scrubbing.
    Full verification passed via `npm run build` (zero TS errors),
    `npm run lint` clean, and 78/78 automated Playwright/Chrome
    assertions across three harnesses (see Session Notes).
15. **Feature 13: Staggered Grid Reveal (Free)** —
     `registry/staggered-grid/` (component + barrel), and test page
     `app/test-staggered-grid/page.tsx` with 5 demo sections
     (default fade-up 3×3 grid / scale-in with fast stagger 0.05s /
     blur-in with `once={false}` replay / mixed grid with `col-span-2`
     and `row-span-2` layout preservation / all 7 variants side-by-side).
     Exports `StaggeredGrid` container and `StaggeredItem` wrapper
     via Context API for variant passing. Uses Framer Motion
     `whileInView` with `staggerChildren` for performant sequential
     animation. Full verification passed via `npm run build` (zero TS
     errors). All 7 variants (fade-up, scale-in, blur-in, slide-left,
     slide-right, flip-x, flip-y) render with correct initial states.
     CSS Grid spans preserved via explicit `StaggeredItem` wrapper.
 16. **Feature 14: Gradient Border Glow (Free)** —
     `registry/gradient-border/` (component + barrel), keyframes +
     `animate-gradient-rotate`/`animate-gradient-pulse` utilities in
     `app/globals.css`, and test page
     `app/test-gradient-border/page.tsx` with the spec's 5 demo
     sections (rotating default/fast/slow / pulsing with blur / static
     gradients / spotlight mouse-tracking / custom colors, widths,
     radii) plus elongated 10:1 and 19:1 pills. Four variants:
     `rotating` (conic-gradient + CSS `transform: rotate`), `pulsing`
     (opacity keyframes), `static` (linear-gradient, no animation),
     `spotlight` (radial-gradient + CSS variable mouse tracking — zero
     React re-renders). Masking technique: outer gradient layer +
     inner solid `bg-dead-950` mask whose radius is concentric with the
     outer edge. The rotating layer is sized to the card's DIAGONAL
     (see the note below); the `blur` glow is a separate layer OUTSIDE
     the clipping box. Full verification: `npm run build` (zero TS
     errors), `npm run lint` clean, and 27/27 automated Playwright/Chrome
     assertions incl. a pixel proof that the border ring is 100%
     continuous at 12 sampled rotation angles for 1.3:1, 10.5:1 and
     19.2:1 shapes (see Session Notes). Default border `width` is **1px**
     (changed from 2px on request; the concentric mask radius and the
     ring-continuity proof were both re-verified at 1px), and a
     `registry.json` entry was added (`tier: "free"`).
17. **Feature 15: WebGL Liquid Image Trail (Pro)** —
     `registry/liquid-image-trail/` (component, image plane, GLSL,
     barrel), `registry.json` entry (`tier: "pro"`,
     `dependencies: ["three", "@react-three/fiber", "@react-three/drei",
     "clsx", "tailwind-merge", "class-variance-authority"]`), and
     test page `app/test-liquid-trail/page.tsx` (client page,
     `dynamic(..., { ssr: false })`) with a 70vh stage, 6 verified
     Unsplash images, 6 live sliders (distortion, trailSize,
     fadeDuration, distortionSpeed, imageScale, velocityThreshold),
     a reset button and a mount/unmount toggle. Full verification:
     `npm run build` (zero TS errors), `npm run lint` clean, and
     91/91 automated Playwright/Chrome assertions across three
     harnesses (see Session Notes).
18. **Feature 15b: WebGL Image Trail Multi-Effect Upgrade (Pro)** —
     the same component RENAMED and upgraded to four switchable GLSL
     effects. `registry/liquid-image-trail/` → `registry/webgl-image-trail/`,
     `liquid-image-trail.tsx` → `webgl-image-trail.tsx` (`WebGLImageTrail`,
     `WebGLImageTrailProps`, `webglImageTrailVariants`),
     `trail-shader.ts` → `shaders.ts` (the 4-shader dictionary),
     `TrailImage` → `ImagePlane`, and the route
     `app/test-liquid-trail/` → `app/test-webgl-trail/`. New props:
     `effect` ('liquid' | 'distortion' | 'pixelate' | 'wave'), plus the
     superset uniforms `distortionStrength` (renamed from
     `distortion`), `pixelSize`, `waveFrequency`, `waveAmplitude` and
     `tintColor`. `registry.json` entry renamed to `webgl-image-trail`
     and gained an `effects` array. Test page gained an effect
     `<select>`, per-effect conditional sliders and a colour input.
   Full verification: `npm run build` (zero TS errors),
   `npm run lint` clean, and 96/96 automated Playwright/Chrome
   assertions across the upgrade suite plus two Feature 15
   regression suites (see Session Notes).
19. **Feature 16: CSS Image Trail Effects (Free)** — the
    lightweight, WebGL-free companion to Component #8.
    `registry/image-trail/` (component + barrel), a
    `registry.json` entry (`tier: "free"`, `dependencies:
    ["motion", "clsx", "tailwind-merge",
    "class-variance-authority"]`, `variants: []` + a
    six-entry `effects` array), and test page
    `app/test-image-trail/page.tsx` — a full-viewport dark
    stage, a fixed top-right control panel with a
    `<Select>` for the six effects and sliders for
    `trailSize` / `velocityThreshold` / `duration`, plus a
    reset button, a mount/unmount toggle and a
    reduced-motion/architecture footnote. `motion/react` +
    CSS transforms only: no WebGL, no canvas, no
    `AnimatePresence`. Full verification: `npm run build`
    (zero TS errors), `npm run lint` clean, and 96/96
    automated Playwright/Chrome assertions including a
    pixel proof that all six effects render differently
     (see Session Notes).
20. **Feature 17: CLI Registry Fetch Logic** — the CLI is
     no longer a scaffold. `utils/fetch-registry.ts` fetches
     `registry.json` and each component file with Node's
     NATIVE `fetch` (no `node-fetch` dependency added) from a
     configurable base URL, with a local-filesystem fallback
     for offline/dev use; `utils/detect-framework.ts` detects
     `src/`, `next.config.*` and `vite.config.*` and returns
     the `components/` vs `src/components/` + `lib/` vs
     `src/lib/` dir pair; `utils/install-deps.ts` diffs the
     component's `dependencies` against the user's
     `package.json` and `prompts`-confirms before shelling
     out to `npm install`; and `commands/add.ts` was fully
     rewritten to orchestrate project check → registry
     fetch → component lookup → Pro tier check → framework
     detection → dependency install → file write → success
     output, with all writes via `fs.promises`. Full
     verification: `npm run build` (zero TS errors) plus
     live end-to-end CLI runs in throwaway `/tmp` projects
     covering `src/` and no-`src/` layouts, accept + decline
     on the dependency prompt, multi-file/nested-target
     installs, and all four failure paths (see Session
    Notes).
21. **Feature 18: Pro License Validation (MVP)** — the Pro
    gate is now real. New `app/api/validate-license/route.ts`
    (POST, checks `{ key }` against the comma-separated
    `VALID_LICENSE_KEYS` env var and returns only a boolean
    plus a message — never the key list), `.env.local` +
    `.env.example` carrying `VALID_LICENSE_KEYS`, new
    `packages/cli/src/utils/validate-license.ts` (native
    `fetch` to `${DEADUI_API_URL}/api/validate-license`,
    overridable base URL, 10s timeout), and a rewritten Pro
    branch in `commands/add.ts`: `--token` if given, else a
    masked `prompts` password input, then validate; invalid
    → red error + exit 1, valid → success placeholder and an
    early `return` (MVP writes no Pro files yet). Full
    verification: `npm run build` + `npm run lint` clean in
both packages, 7 curl cases against the live route, and
     11 CLI end-to-end runs including real-TTY (pty) drives
     (see Session Notes).
22. **Feature 19: Documentation Site + Landing Page** —
     docs run on native `@next/mdx`, not Nextra.
     `next.config.ts` gained `pageExtensions: ["ts","tsx","mdx"]`,
     `rehype-slug` (heading `id`s, which is what makes the
     table of contents work without parsing MDX at runtime), and
     `@shikijs/rehype` with the `vesper` theme (build-time
     highlighting, no runtime highlighter in the bundle). Root
     `mdx-components.tsx` (required by `@next/mdx` for App
     Router) maps every element onto the `dead-*` tokens — no
     `prose` plugin, no docs stylesheet — and wraps `pre` in a
     `group relative` container that mounts `<CopyButton />`.
     New docs shell: `app/docs/layout.tsx` (three columns,
     260px sidebar / fluid main / 240px TOC), `top-nav.tsx`
     with a ⌘K command palette, `sidebar.tsx`, and
     `table-of-contents.tsx` (DOM-scanned, scroll-spy via
     IntersectionObserver). Navigation is derived, not
     hand-written: `lib/docs-nav.ts` builds from `registry.json`
     and `lib/docs-nav-server.ts` (server-only, filesystem) sets
     `href: null` when a component has no `page.mdx`. New
     `ComponentCustomizer` generates slider/select/color
     controls from a `controls` map and merges each change into
     one `Record<string, unknown>` through a functional
     `setState`, so the preview re-animates in real time. New
     Radix/shadcn primitives: dialog, command, select, slider,
     tabs. First real page at
     `app/docs/components/cinematic-text/page.mdx` (8 sections,
     install tabs, live playground). Landing page rebuilt in
     `components/landing/{hero,showcase,sections}.tsx`: WebGL
     trail hero, three hover-to-preview cards that mount the
     live component only while hovered, feature grid, get-started
     with a CLI terminal, and pricing. Full verification:
     `npm run build` + `npm run lint` clean, 75/75 browser
     assertions, and a layout pass at 1440px and 390px (see
     Session Notes).

23. **Feature 20: Complete MDX Documentation** — all 8 remaining
    registry components now have a real docs page, so no
    component is undiscoverable. New
    `app/docs/components/<name>/page.mdx` for
    `magnetic-button`, `marquee`, `spotlight-card`,
    `scroll-scrub`, `staggered-grid`, `gradient-border`,
    `text-fill-animation` (Pro) and `webgl-image-trail` (Pro)
    — each following the spec's exact template: H1 + one-line
    description, a `<ComponentCustomizer>` playground whose
    `defaultProps`/`controls` match the spec, `<InstallTabs>`,
    and a Props table. Because a page is a server component but
    `ComponentCustomizer` is a client component (and MDX-local
    arrow functions cannot cross that boundary), a single
    `components/docs/preview-wrappers.tsx` supplies the `'use
    client'` preview adapters. Full verification: `npm run
    build` (zero TS errors, all 9 pages prerendered static),
    `npm run lint` clean, and 129/130 automated
    Playwright/Chrome assertions (see Session Notes).

24. **Feature 21: CLI `init` Command** —
    `packages/cli/src/commands/init.ts` (new) and the
    `program.command('init')` registration in
    `packages/cli/src/index.ts`. `deadui init` runs four
    steps: (1) diff the six core deps (`gsap`, `motion`,
    `class-variance-authority`, `clsx`, `tailwind-merge`,
    `lucide-react`) against `dependencies` +
    `devDependencies` and reuse the existing `prompts` +
    `installDependencies` path; (2) write
    `lib/utils.ts` (or `src/lib/utils.ts`, from
    `detectFramework().libDir`) with the spec's `cn()`, or
    detect an existing `cn` export and leave the file
    alone; (3) merge the Dead UI `colors.dead`,
    `keyframes` and `animation` tokens into the user's
    Tailwind setup — an existing `tailwind.config.{ts,js,
    mjs,cjs,mts,cts}` is edited in place, and a Tailwind
    v4 project with no config file is offered a `@theme` +
    `@layer utilities` block written into its stylesheet
    instead; (4) merge `"@/*"` into
    `compilerOptions.paths` and tell the user to restart
    their IDE. Every write is an INSERTION into the user's
    own source text — nothing is parsed into a value and
    re-serialised. Full verification in the Session Notes.
 25. **Feature 22: CLI Pro Component Fetching** — the Pro
    branch of `commands/add.ts` no longer returns early. The
    Feature 18 placeholder ("Pro file delivery ships in the
    next CLI release") is gone and a validated key now falls
    through into the ONE shared install path — framework
    detection → dependency diff → `fetchFile`/`writeFile` →
    success output — that Free components already used.
    `registry.json`'s two Pro entries now point at
    `registry/pro/…`, two of their `target` paths were
    corrected so the installed tree actually compiles, and
    the Pro sources were MOVED ON DISK into `registry/pro/`
    so the paths the registry advertises are the paths that
    are served. No new files, no new dependencies, no change
    to `fetch-registry.ts`, `install-deps.ts`,
`validate-license.ts`, or the license endpoint.
     Full verification in the Session Notes.
26. **Feature 23: GitHub README & Launch Preparation** — the
     repo is now launch-ready. New root `README.md` (the
     spec's exact structure: 💀 hero + tagline + banner,
     ✨ Features, 🚀 Quick Start in 3 steps, 📦 Components
     as Free/Pro tables, Tech Stack, 📄 License, 🤝
     Contributing, footer), new root `CONTRIBUTING.md`,
     new `packages/cli/.npmignore`, and metadata in both
     `package.json` files. The root one had NO `description`,
     `repository`, `author`, `keywords` or `license` at
     all; the CLI one had a description but no `files`, so
     npm would have published whatever `dist/` did not
     exclude. Full verification in the Session Notes.
27. **Feature 24: NPM Publishing & CI/CD (Two-Repo)** — the
     publish path exists and the two-repo split is wired.
     `packages/cli/src/utils/fetch-registry.ts` rewritten
     around TWO base URLs (`DEFAULT_REGISTRY_BASE_URL` →
     public `deadui`, new `PRO_REGISTRY_BASE_URL` → private
     `deadui-pro`), with `getRegistryBaseUrl(tier)`,
     `fetchFile(path, { tier, token })`, and a
     `RegistryFetchError` that carries the HTTP status so a
     Pro 404 can be reported as an ACCESS problem (GitHub
     answers 404, not 403, for private content a token cannot
     read). `packages/cli/src/commands/add.ts` gained a
     second Pro gate — the license key validates first, then a
     masked GitHub PAT is prompted for and forwarded on every
     Pro file fetch; `--github-token` added in
     `packages/cli/src/index.ts` as the non-interactive path.
     `registry.json` needed NO change (Feature 22 already
     points both Pro entries at `registry/pro/…`, and all 13
     `files[].path` values exist on disk). New
     `.github/workflows/publish-cli.yml` (release-created
     trigger, `id-token: write` + `contents: read`, `npm ci` →
     `npm run build` → `npm publish --access public`) and root
     `vercel.json`. All six `yourusername/deadui`
     placeholders replaced with `HamidRezaSepehr/deadui`;
     `context/architecture.md` updated for the new Pro
     delivery model. Full verification in the Session Notes.
28. **Feature 24 part 2: Pro licensing disclosure** — the
     owner decided the Pro sources stay in the public repo and
     that their visibility is NOT a license. New
     `registry/pro/README.md` (GitHub renders it when the
     folder is browsed) carries the notice plus the two-
     credential explanation; the root `README.md` gains the
     notice as a callout under the banner and an expanded
     `📄 License` section; and all 7 `registry/pro/**` source
     files gain a `🔒 PRO COMPONENT - Commercial License
     Required` header (block-comment form in the one CSS
     module, since `//` is not a CSS comment). The CLI Pro
     gate is unchanged functionally — it already validated
     the key server-side before any fetch — and gains three
     disclosure lines plus an `INVARIANT` comment forbidding
     a skip flag. Full verification in the Session Notes.
29. **Feature 24 part 3: Pro commercial licence terms** —
     `LICENSE.md` (Dead UI Pro — Commercial License: grant of
     licence, the three restrictions, termination, support and
     updates, as-is disclaimer) added to the root of the
     PRIVATE `HamidRezaSepehr/deadui-pro` repo and pushed
     (`dc83627`). No source, component, registry or CLI file
     changed — the headers written in part 2 now refer to
     text that actually exists. Full verification in the
     Session Notes.
30. **Feature 24: 100% COMPLETE (release verification)** —
      the owner cut `v0.1.0`; the workflow fired and ran on
      the real GitHub runner. `npm ci` and `npm run build` both
      passed there; `npm publish` failed on the one input it
      has, the not-yet-created `NPM_TOKEN` secret, with the npm
      name confirmed free and the manifest confirmed
      publishable. The live registry path was then proven with
      no override at all: a Free component installs
      byte-identically from `HamidRezaSepehr/deadui`, and a Pro
      component stops at the licence gate. One GitHub-UI action
      (add the secret, re-run the job) stands between here and
      `npx deadui@latest` — see Next Up #11.
31. **Feature 25: Rainbow Button (Free) + CLI `init` dual
      injection** — `registry/rainbow-button/` (component +
      barrel), a `registry.json` entry (`tier: "free"`,
      `dependencies: ["class-variance-authority", "clsx",
      "tailwind-merge"]`), the `rainbow` keyframe + the
      `--color-1`…`--color-5` stops in `app/globals.css` so the
      docs site can preview it, a new `setupRainbowColors()`
      step in `packages/cli/src/commands/init.ts`, test page
      `app/test-rainbow-button/page.tsx` (5 sections) and docs
      page `app/docs/components/rainbow-button/page.mdx`.
      Four variants — `default` (solid face, 1px animated ring,
      tight halo), `outline` (transparent, ring only),
      `gradient-text` (no ring; the label itself carries the
      gradient via `background-clip: text`), `glow` (solid face,
      ring, wide `blur-xl` halo) — plus sizes `sm` / `default` /
      `lg` / `icon` and `borderWidth` / `speed` props. Full
      verification in the Session Notes. **The registry now
      describes 10 components (8 Free + 2 Pro) and all 14
      `files[].path` values exist on disk.**

## In Progress

None. Feature 25 is implemented and verified; the `v0.1.2`
GitHub Release is the only remaining step and it is a UI click,
not code.



## Next Up

1. ~~Move the Pro source files into `registry/pro/`~~ —
   DONE, see Completed #25. The registry now advertises
   paths that are actually served: all 9 components install
   from a bare checkout.
2. The dependency-install prompt in `utils/install-deps.ts`
   still exits 0 silently when stdin is closed (the
   Feature 17 note); the same stdin-EOF race added to the
   license prompt should be applied there. Feature 21 hit
   this for real: a non-TTY run with two prompts (deps +
   "write the Tailwind tokens into <css>?") drains stdin and
   exits mid-`init`, so nothing after the first prompt is
   written and the command never prints its footer. Feature
   21 worked around what it could (every new prompt is a
   `confirm`, never a `select`, because a `select` needs real
   keypresses and never settles on a pipe) but the shared
   `installDependencies` race is untouched.
3. **`registry.json` does not ship `lib/animations.ts`, and
   `cinematic-text` imports `@/lib/animations`** (Feature 21
   found this). `init` creates `lib/utils.ts` because 10 of
   11 components import `@/lib/utils`, so that import
   resolves — but nothing supplies `lib/animations.ts`, not
   the registry and not `init`, so `npx deadui add
   cinematic-text` produces a project that does not compile
   (`TS2307: Cannot find module '@/lib/animations'`).
   Per the "Registry is Truth" invariant the CLI must not
   guess the file, so the fix is a registry entry (add
   `lib/animations.ts` to `cinematic-text`'s `files`) or a
   decision to have `init` generate it. See Open Questions.
4. ~~Feature 20 (see the feature spec folder)~~ — DONE, see
   Completed #23
5. ~~Write MDX docs pages for the remaining 8 registry
   components~~ — DONE, see Completed #23. All 9 documented
   components now have a `page.mdx`; the ⌘K palette's "Soon"
   rows are all gone
6. ~~Feature 21: CLI `init` command~~ — DONE, see
   Completed #24
7. ~~Feature 23: README & launch prep~~ — DONE, see
   Completed #26. The README, CONTRIBUTING, `.npmignore`
   and both sets of package metadata are in place
8. ~~**Still blocking a real npm publish: the repository
   coordinates are placeholders.**~~ — DONE, see
   Completed #27. `DEFAULT_REGISTRY_BASE_URL` and the new
   `PRO_REGISTRY_BASE_URL`, `GITHUB_URL`
   (`components/docs/top-nav.tsx`), `repository.url` /
   `bugs.url` in BOTH `package.json` files, and the README
   footer all now carry `HamidRezaSepehr`. Verified: zero
   `yourusername` matches outside `context/`.
9. **The README advertises a component the CLI cannot
   install.** The spec's Free table lists **Staggered
   Grid Reveal** (8 Free components), but `registry.json`
   has no `staggered-grid` entry — the registry holds 7
   Free + 2 Pro. The component, its docs page and its
   test page all exist; only the registry entry is
   missing, and per the "Registry is Truth" invariant the
   CLI will not guess it. So `npx deadui add
   staggered-grid` prints "Component not found" while
   the README lists it. Needs either a `registry.json`
   entry (out of scope here — a registry structure change
   must not share a step with docs) or a README trim.
   See Open Questions.
10. **THE TWO REPOS DO NOT EXIST YET.** The full tree —
    including `registry/pro/**` — is committed locally and the
    exact push commands are in the Feature 24 handoff. Three
    manual steps remain, in this order: (a) create
    `HamidRezaSepehr/deadui` (public) and
    `HamidRezaSepehr/deadui-pro` (private) on GitHub;
    (b) push the full tree to the public repo, then
    `registry/pro/` to the private one as a backup/mirror; and
    (c) add each paying customer's GitHub account as a
    collaborator on `deadui-pro`, since the CLI reads that repo
    with the user's own PAT.
    **RESOLVED: the Pro sources STAY in the public repo.** They
    are there because the docs site imports them in six places
    (`components/landing/hero.tsx`,
    `components/docs/preview-wrappers.tsx`, the two Pro
    `page.mdx` files, and two `/test-*` pages), so a Pro-free
    public repo would not build and Vercel could not deploy it.
    The owner chose to disclose rather than stub: see
    Completed #28 and Open Questions.
11. **The npm release itself — the first attempt FAILED, and
    the cause is the missing secret, not the workflow.**
    Release `v0.1.0` was cut from `be09fcf` and triggered run
    `37266086206` ("Publish CLI to npm", event `release`,
    conclusion `failure`). Steps 1–5 all passed — `checkout`,
    `setup-node`, `npm ci`, `npm run build` — and only
    **"Publish to npm"** failed, which localises it to step 6
    and its one input, `secrets.NPM_TOKEN`, which does not
    exist in the repo. Ruled out by measurement rather than
    assumption: the npm name is **free** (`registry.npmjs.org/
    deadui` → 404, so not a name conflict), the manifest is
    publishable (`version 0.1.0` matching the tag, no
    `private: true`, `files: ["dist/"]`, `bin` set), and the
    locked install already succeeded on the runner. Fix:
    create a **granular** npm automation token (the 2FA-bypass
    token type is deprecated), add it as the repository secret
    `NPM_TOKEN`, then re-run the failed job from the Actions
    tab — no new release or new tag needed. Until that green
    run exists, `npx deadui@latest` does not resolve, and
    `deadui.dev` has nothing to serve `/api/validate-license`
    against.
    Two more things worth doing while you are in that UI: bump
    `version` in `packages/cli/package.json` before every
    future tag (the workflow publishes the manifest version,
    not the tag, so a second `v0.1.0` tag would republish
    `0.1.0` and fail), and enable npm's "Trusted Publisher" so
    the `id-token: write` permission can be used and the
    secret deleted.
12. ~~**There is still no commercial licence text.**~~ —
    DONE, see Completed #29 and the Session Notes.
    `LICENSE.md` (Dead UI Pro — Commercial License: grant,
    restrictions, termination, support, as-is disclaimer) now
    sits in the private repo. One residual gap is recorded as
    an Open Question: no clause states how the terms reach a
    licensee at purchase time.
13. **`v0.1.1` IS BURNED — PUBLISH `v0.1.2` INSTEAD. THIS IS
    THE RELEASE, AND IT IS NOT A TYPO.** The Feature 25 spec
    says to tag `v0.1.1`. That tag was **already created and
    its GitHub Release already published** before this feature
    started, and it is unwinnable:
    - `refs/tags/v0.1.1` → `e5dd658`, and
      `git show v0.1.1:packages/cli/package.json` says
      **`0.1.0`** at that commit. The workflow publishes the
      MANIFEST version, so that release could only ever have
      tried to publish `0.1.0` — which npm already has. It
      failed, and npm's only version is still `0.1.0`.
    - A follow-up commit (`c909975 "Updated Version"`) bumped
      the manifest to `0.1.1` **after** the tag had moved on,
      so the two are permanently out of step. Nothing can make
      `v0.1.1` publish `0.1.1`.
    - The workflow triggers on `release: [created]` only, and
      the release is already published, so editing it re-runs
      nothing.
    - `git tag v0.1.1` fails outright (`already exists`), and
      re-pointing a published tag needs a force-push, which
      `AGENTS.md` forbids.
    The fix is the ordinary one: manifest `0.1.2`, tag
    `v0.1.2`, and a **new** release — which is exactly the
    4-step workflow working as intended. `0.1.1` is skipped as
    a version number and nothing is lost but the label. Two
    consequences worth stating: npm will show no `0.1.1` at
    all, so the version sequence in the registry is
    `0.1.0 → 0.1.2`; and `npm view deadui@0.1.1` will 404
    forever.
14. **`NPM_TOKEN` is still not set, but the workflow no longer
    uses it.** Next Up #11's fix (create an npm automation
    token, add it as the `NPM_TOKEN` secret, re-run) was
    overtaken: commit `d4d60c1` rewrote
    `.github/workflows/publish-cli.yml` to publish with
    `--provenance` and **no `NODE_AUTH_TOKEN`**, i.e. npm OIDC
    / Trusted Publisher, which is why `0.1.0` actually landed
    on npm (`registry.npmjs.org/deadui` → HTTP 200,
    `versions: ['0.1.0']`, `dist-tags.latest: 0.1.0`). So
    #11's remaining action is **obsolete — do not create the
    secret.** What is still worth doing in that UI is
    confirming the Trusted Publisher is configured for the
    `deadui` package and pointing at this repo + the
    `publish` environment (the job declares
    `environment: publish`, which must match the npm side or
    OIDC will be refused). Keep it in mind before the
    `v0.1.2` release is published.
15. **The README still advertises `staggered-grid`, which the
    CLI cannot install** — unchanged by Feature 25, which added
    `rainbow-button` rather than fixing it. The registry now
    has 8 Free entries but **not** that one; `npx deadui add
    staggered-grid` still prints "Component not found". This
    is Next Up #9 / the first Open Question and was
    deliberately left alone again.


## Component Status

| # | Component | Tier | Status | Docs page | Variants |
|---|-----------|------|--------|-----------|----------|
| 1 | Cinematic Text Reveal | Free | COMPLETE (Session 7) | ✅ | blur-in, fade-up, slide-stagger, scale-pop |
| 2 | Magnetic Elastic Button | Free | COMPLETE (Feature 09) | ✅ (F20) | default, outline, glow, ghost |
| 3 | Infinite Blur Marquee | Free | COMPLETE (Feature 10) | ✅ (F20) | horizontal, vertical (blur: none/edges/left/right) |
| 4 | Spotlight Hover Card | Free | COMPLETE (Feature 11) | ✅ (F20) | glow: border, background, both, none (shape: rounded, soft, sharp) |
| 5 | Scroll-Linked Image Scrub | Free | COMPLETE (Feature 12) | ✅ (F20) | media: image-sequence, video (aspect: video, square, portrait, auto; objectFit: cover, contain, fill, none) |
| 6 | Staggered Grid Reveal | Free | COMPLETE (Feature 13) — ⚠️ no `registry.json` entry, so the CLI cannot install it (see Open Questions) | ✅ (F20) | fade-up, scale-in, blur-in, slide-left, slide-right, flip-x, flip-y |
| 7 | Gradient Border Glow | Free | COMPLETE (Feature 14) | ✅ (F20) | rotating, pulsing, static, spotlight |
| 8 | WebGL Image Trail | Pro | COMPLETE (Features 15 + 15b) | ✅ (F20, Pro badge) | effect: liquid, distortion, pixelate, wave (cva variants empty per spec; fully prop-configurable) |
| 8b | CSS Image Trail | Free | COMPLETE (Feature 16) | ✅ (F20) | effect: fade-scale, rotate-scale, 3d-rotate, blur-fade, clip-circle, skew-fade (cva variants empty per spec; fully prop-configurable) |
| 8c | Rainbow Button | Free | COMPLETE (Feature 25) | ✅ (F25) | default, outline, gradient-text, glow (size: sm, default, lg, icon) |
| 9 | Horizontal Parallax Pin Gallery | Pro | Not started | ❌ (Soon) | deep, subtle, cards |
| 10 | 3D Perspective Card Stack | Pro | Not started | ❌ (Soon) | fan, cascade, flip-through |
| 11 | Text Fill Animation | Pro | COMPLETE (Feature 08) | ✅ (F20, Pro badge) | — (configurable via props, no cva variants) |

## Open Questions

- **Is the `--speed` variable name too generic to ship?**
  (Feature 25) The spec mandates the animation string
  `rainbow var(--speed, 2s) infinite linear`, so `init` and
  the component both have to use the bare `--speed` custom
  property. It is set on the button element itself, so it only
  leaks in as far as that subtree, but any third-party CSS in a
  consumer's project that also reads `--speed` on an ancestor
  would resolve differently depending on where it is declared.
  Candidates: keep it (spec compliance, and `--speed` is the
  MagicUI convention users will expect), or prefix it
  (`--rainbow-speed`, which is what `--rainbow-border-width`
  already does) and accept that the emitted animation string
  then differs from the spec. Not decided — it changes what
  `init` writes into a user's config.
- **Should `init` also write the `--color-*` stops for
  projects with no stylesheet at all?** (Feature 25) With no
  `globals.css` / `index.css` in any of the six probed
  locations, `setupRainbowColors` prints the five declarations
  and moves on rather than creating a file. That is the safe
  default — inventing a stylesheet path for a project whose
  framework we could not identify is exactly the "guess"
  the Registry-is-Truth rule forbids — but it means
  `npx deadui add rainbow-button` in such a project installs a
  component that renders unstyled until the user pastes them
  by hand.
- **Should `staggered-grid` be added to `registry.json`, or
  dropped from the README?** (Feature 23) The spec's README
  lists 8 Free components including Staggered Grid Reveal,
  but the registry only describes 7 Free + 2 Pro — there is
  no `staggered-grid` entry, so `npx deadui add
  staggered-grid` fails with "not found" even though the
  component, its docs page and its test page all exist.
  Feature 13 never added the entry (unlike Feature 14,
  which explicitly did). Fixing it here would have mixed a
  registry structure change with a docs change, which
  ai-workflow-rules forbids in one step, so the README
  follows the spec verbatim and the gap is recorded here.
  One-line fix whenever it is picked up: add the entry with
  `tier: "free"`, `dependencies: ["motion", "clsx",
  "tailwind-merge", "class-variance-authority"]`, the
  component file, and its 7 variants.
- **What are the real repository coordinates, and whose
  name goes in the README footer?** (Feature 23) There is
  no real GitHub org/user anywhere in the repo — the CLI's
  `DEFAULT_REGISTRY_BASE_URL`, `GITHUB_URL` in
  `top-nav.tsx` and now both `package.json` `repository`
  fields all carry the `yourusername/deadui` placeholder,
  and the README footer is the spec's literal `[Your
  Name/Handle]`. Guessing a URL would have produced a
  plausible-looking 404, so the placeholder was propagated
  consistently instead. Also undecided: whether the repo
  needs a `LICENSE` file (the README claims MIT for the
  Free tier and the `package.json` files say `MIT`, but no
  `LICENSE` file exists, and the Pro/commercial split is
  only prose).
  **RESOLVED in Feature 24** for the coordinates: they are
  `HamidRezaSepehr/deadui` (public) and
  `HamidRezaSepehr/deadui-pro` (private), and all six
  placeholder sites now say so. The README footer is
  `[HamidRezaSepehr]`.
  **Both halves now RESOLVED.** The MIT `LICENSE` was
  already on the remote (it seeded the repo's `Initial
  commit`) and the push rebased on top of it, so the Free
  tier's licence claim is no longer prose. The Pro
  commercial terms were added as `LICENSE.md` in
  `deadui-pro` — see Completed #29.
- **How does a licensee RECEIVE these terms, and does the
  commercial licence survive contact with the public repo?**
  (Feature 24 part 3) `LICENSE.md` exists and is visible on
  the `deadui-pro` landing page, but a licensee only ever
  reaches it if someone sends them there: the CLI prints a
  `deadui.dev/pro` purchase link, not the terms, and the
  `/api/validate-license` route returns a bare
  `{ valid: boolean }`. Meanwhile §2.3 of the licence forbids
  a licensee from open-sourcing the Pro source, while the
  licensor keeps that source committed to the PUBLIC
  `deadui` repo (Next Up #10, Feature 24 part 2) — the
  restriction binds one side of the relationship only. None
  of this is a drafting bug; it is a distribution question
  with no obvious right answer. Candidates: print the terms
  in the CLI Pro gate on first install, host the terms at
  `deadui.dev/pro/terms` and link them from both READMEs and
  every Pro file header, and/or add an explicit carve-out to
  §2 stating that the licensor may publish the source. Not
  decided here — it changes what the CLI prints and what a
  purchase flow must serve.
- **Should the public repo ship a Pro STUB so it can build
  without the Pro sources?** (Feature 24) The CLI now
  fetches `registry/pro/**` from the private repo, which is
  the security half of the two-repo split done — but the
  docs site imports those same files from `@/registry/pro/*`
  in six places, so the public repo still contains them and
  a public push would publish the Pro source. Three ways
  out: (a) ship a minimal public stub of the two Pro
  components purely for the docs preview (keeps the public
  repo buildable and Vercel-able, costs a second copy to
  keep in sync), (b) deploy the docs site from a repo that
  legitimately holds the sources and keep the public one
  Pro-free (simplest git story, but the docs site for a
  public product lives in a private repo), (c) accept the
  leak for now and revisit at launch. **Not decided here** —
  it is a product/architecture call, not a CLI change, and
  Feature 24's mandate was the CLI, the workflow and
  `vercel.json`. Recorded as Next Up #10.
  **RESOLVED in Feature 24 part 2: (c), by disclosure.** The
  owner chose to keep the sources public and make the
  licensing explicit instead — `registry/pro/README.md`, two
  README callouts, and a header on every Pro file. The
  consequence to live with is that the CLI gate is now an
  honour system with no technical enforcement on the source
  itself, so it stays mandatory and unskippable; Next Up #12
  tracks the missing commercial licence text that the
  headers currently only assert.
- **Should `init` ship `lib/animations.ts`?** (Feature 21)
  `registry/cinematic-text/cinematic-text.tsx` imports
  `GSAP_DEFAULTS` from `@/lib/animations`, and no registry
  entry ships that file, so the component cannot compile in
  a user's project. Two candidate fixes, both a spec change:
  add `lib/animations.ts` to `cinematic-text`'s `files` in
  `registry.json` (keeps `init` to the spec's four steps), or
  have `init` generate it (one more shared file for every user
  to carry). It is the last unresolvable import across the
  registry.
- **Should the `dead` palette `init` inject match the spec's
  semantic names, the components' numeric names, or both?**
  (Feature 21) Implemented as BOTH — see the Session Notes.
  The spec's block defines `dead.black` / `dead.surface` /
  `dead.muted` / … and generates `bg-dead-surface`,
  `text-dead-muted`, …, but not one shipped component uses
  those: they are all written against the numeric scale
  (`bg-dead-950`, `text-dead-400`, `bg-dead-red`,
  `border-dead-800`) from `app/globals.css`. Injecting the
  spec block alone would leave every component unstyled.
  Worth a decision on which set is canonical so `init` and
  `globals.css` cannot drift.
- Should Lenis setup be auto-installed by the CLI or
  left as a manual user step?
- What is the exact pricing for Pro? ($99 one-time vs
  $149 lifetime vs tiered?) The landing page currently
  renders **$99 one-time as a placeholder** — this number
  has NOT been confirmed by the team.
- License keys are hand-edited into `VALID_LICENSE_KEYS`
  for the MVP. Decide the real issuance story (a script, a
  store, or a `deadui keys` admin command) and whether a
  key should ever be bound to an email or machine id.
- Nextra is documented in architecture.md but is not yet
  installed; confirm before adding (its dependency tree
  may conflict with Next 16 — team decision needed).
  **RESOLVED in Feature 19:** no docs framework. Native
  `@next/mdx` + `rehype-slug` + `@shikijs/rehype` covers
  everything Nextra was going to provide, with a far
  smaller dependency tree and no version-coupling risk.
  architecture.md has been updated accordingly.
- ui-context.md lists two mono fonts (Geist Mono for
  display, JetBrains Mono for code) but both map to the
  `font-mono` utility. Currently using Geist Mono; confirm
  whether to add JetBrains Mono as a second font var.

## Resolved Decisions

- **React 19 supported from day one** (resolves the earlier
  open question). create-next-app scaffolds Next 16 + React 19.
- @react-three/fiber bumped v8 → **v9** and
  @react-three/drei v9 → **v10** to support React 19
  (R3F v8 peers on react <19). architecture.md dependency
  table should be updated accordingly.

## Architecture Decisions

- Next.js App Router for docs + landing page.
- Native `@next/mdx` for documentation (NOT Nextra) —
  `rehype-slug` for heading anchors and `@shikijs/rehype`
  (vesper) for build-time highlighting; root
  `mdx-components.tsx` supplies the element mapping. Docs
  navigation is derived from `registry.json`, never
  hand-maintained.
- Tailwind CSS with custom "Dead" theme tokens.
- `class-variance-authority` for component variants.
- GSAP (free via Webflow) for scroll/complex animations.
- Framer Motion / Motion for micro-interactions.
- Lenis for smooth scrolling.
- React Three Fiber for WebGL Pro components.
- CLI published to npm as `deadui`.
- Component registry via `registry.json` + GitHub raw URLs.
- Pro components gated via private GitHub repo + PAT.
- Pro license keys validated by an in-app Next.js route
  handler (`/api/validate-license`) against the
  `VALID_LICENSE_KEYS` env var — zero third-party cost, and
  the CLI's API base URL is overridable with
  `DEADUI_API_URL` (same pattern as `DEADUI_REGISTRY_BASE_URL`).
- Dark mode dominant design language.
- JetBrains Mono for code/terminal, Geist Sans for UI.
- Red accent color (#ef4444) as primary brand color.
- All animation components must respect `prefers-reduced-motion`.
- GSAP cleanup via `gsap.context()` in useEffect return.
- Zero CLS invariant for all components.

## Session Notes

- Feature 25 (feature spec
  `25-rainbow-button-and-release.md`): Rainbow Button, the
  `init` dual injection, and the **`v0.1.2`** release.
  Created: `registry/rainbow-button/rainbow-button.tsx`,
  `registry/rainbow-button/index.ts`,
  `app/test-rainbow-button/page.tsx`,
  `app/docs/components/rainbow-button/page.mdx`. Modified:
  `packages/cli/src/commands/init.ts` (`rainbow` keyframe +
  animation in `THEME_PROPERTIES` and `THEME_CSS_BLOCK`; new
  `findTopLevelRootSelector()` + `setupRainbowColors()` +
  a fifth `init` step), `app/globals.css` (`@keyframes
  rainbow`, `.animate-rainbow`, a `:root` block for
  `--color-1`…`--color-5`, and `.animate-rainbow` added to the
  existing unlayered reduced-motion block), `registry.json`,
  `packages/cli/package.json` (`0.1.1` → `0.1.2`, plus the
  trailing newline commit `c909975` had stripped), this file.
  No new dependencies, and no change to `add.ts`,
  `fetch-registry.ts`, `install-deps.ts` or
  `detect-framework.ts`.

  **THE RELEASE IS `v0.1.2`, NOT `v0.1.1`, AND THE SPEC'S
  STEP 5 IS WHY.** The spec says tag `v0.1.1`; `v0.1.1`
  already existed and its Release was already published before
  this feature began. `refs/tags/v0.1.1` → `e5dd658`, whose
  manifest says **`0.1.0`**, and the workflow publishes the
  manifest rather than the tag, so that release could only
  ever have republished `0.1.0` — which npm already has, which
  is why `registry.npmjs.org/deadui` still lists only
  `0.1.0`. Commit `c909975` then bumped the manifest to
  `0.1.1` *after* the tag had moved, permanently desyncing
  them. `release: [created]` cannot be re-fired for an
  existing release, and re-pointing the tag needs a
  force-push that `AGENTS.md` forbids. So the manifest went to
  `0.1.2` and the tag to `v0.1.2`, which is the 4-step workflow
  working correctly rather than being worked around. Full
  detail in Next Up #13. The corollary, worth not being
  surprised by later: **npm will never have a `0.1.1`.**

  **THE COMPONENT'S DOM IS THREE LAYERS, AND TWO OF THE
  THREE DECISIONS WERE FORCED RATHER THAN CHOSEN.**
  `registry/rainbow-button` renders `<button>` → optional
  blurred halo `<span aria-hidden>` → optional ring `<span
  aria-hidden>` → face `<span>`. The root is deliberately
  **not** `overflow-hidden`, because a `filter: blur()` on a
  descendant is severed by an ancestor's overflow clip and
  neither a negative `z-index` nor `transform: scale()` escapes
  one — so the `glow` variant could not glow at all. But an
  unclipped root means the halo is a positioned sibling of the
  root's own background, and a positioned descendant paints
  *above* it: the halo would wash out the label. `isolate`
  does not rescue this, because negative-`z-index` children
  still paint above the element's own background. Hence the
  opaque face layer, whose only job is to punch the middle
  back out. The ring cannot be a real `border` because a
  border's colour cannot be animated.

  **TWO REAL BUGS FOUND BY LOOKING AT THE RENDER, NOT BY
  THE ASSERTIONS — both invisible to a green build.**
  1. **`[mask: …]` silently reset `mask-composite`.** The
     ring is the standard two-layer trick, normally written
     `[mask:linear-gradient(#fff 0 0)_content-box,linear-gradient(#fff_0_0)]`
     plus `[mask-composite:exclude]`. But `mask` is a
     **shorthand**, so it resets `mask-composite` to its
     initial `add`, and Tailwind emits the shorthand *after*
     the exclude declaration — so `add` won. It rendered
     correctly in Chrome purely by luck: Lightning CSS
     compiles a prefixed `-webkit-mask` shorthand that also
     sets `-webkit-mask-composite: xor`. Firefox exposes
     `-webkit-mask-composite` as a plain **alias** of
     `mask-composite`, so `add` would have won there and the
     "ring" would have filled the whole button. The computed
     value said `add, add` while the pixels looked fine,
     which is what gave it away. Fixed with the longhands
     `mask-image` / `mask-clip` / `mask-composite`, which
     reset nothing and so are order-independent.
  2. **The button did not size to its own label.** The face
     was `absolute inset-0`, which contributes nothing to
     layout, so the root collapsed to its bare padding box:
     **every button measured 40×40** regardless of label,
     with the text overflowing its own face
     (`scrollWidth > clientWidth` on all of them). This is
     invisible for `default`/`outline`/`glow` — an
     overflowing label centred on a same-coloured background
     still *looks* like a button — and it is catastrophic for
     `gradient-text`, whose label is `color: transparent` and
     visible only where the face's background is painted. Any
     glyph past the background box simply does not render:
     "Gradient Text" came out as **"›radien"** on two lines.
     Fix: the face is `relative` (in flow) and carries the
     `size` classes, including the padding — which also keeps
     it exactly coincident with the root's box, so
     `rounded-[inherit]` stays concentric with the ring
     instead of being inset by a padding the ring already
     occupies. Sizing the cva and the variant cva separately
     is what lets the public props keep a single `size` union.
  Neither was caught by "all four variants render": the first
  needed a computed-style read, the second needed a
  measurement. Both are now asserted, and the second is
  asserted per-label.

  **`motion-reduce:animate-none`, NOT `motion-safe:animate-rainbow`,
  and the reason is a Tailwind version boundary.** The
  opt-out has to be expressed against a **core** utility,
  because `animate-rainbow` is a *custom* one: under v4
  `init` writes it as a plain `@layer utilities` rule, and
  Tailwind cannot attach a variant to a utility it did not
  generate itself, so `motion-safe:animate-rainbow` would
  compile to **nothing** and the border would never animate at
  all for v4 users. `animate-none` exists in v3 and v4, so
  gating on it works in both (and in v4 `init`'s unlayered
  reduced-motion block wins too).

  **`--color-1`…`--color-5` ARE NOT TAILWIND COLOURS, AND
  THE SPEC'S `:root` IS THE REASON.** They go in a plain
  `:root` block, not `theme.colors` / `@theme`, which would
  register a colour scale and generate a family of
  `bg-color-1` utilities that could collide with a project's
  own numbering. They are consumed only as `var(--color-1)`
  inside arbitrary values on the component's own layers.

  **THE `:root` INJECTION REFUSES A NESTED ONE, AND THAT IS
  THE WHOLE POINT OF `findTopLevelRootSelector`.** A project
  that themes with `@media (prefers-color-scheme: dark) {
  :root { … } }` has a perfectly valid `:root` at brace depth
  1. Injecting there would confine the rainbow stops to dark
  mode — the button would render with no gradient at all in
  light mode, with no error anywhere. The scanner is
  string- and comment-aware for the same reason the rest of
  `init.ts` is (`:root` shows up inside prose), matches
  `:root` as a whole token so `--x: :root`-style decoys do not
  fire, and only accepts depth 0. When the only `:root` is
  nested, a new top-level block is appended instead.

  **`setupRainbowColors` IS UNPROMPTED, DELIBERATELY.**
  Every other conditional write in `init` asks a `confirm`,
  but there is no decision here — the variables are required
  by a shipped component and inert otherwise — and every new
  prompt is another chance to hit the stdin-EOF race that
  `install-deps.ts` and the Feature 18 license prompt already
  fall into, where an unsettled prompt exits 0 having written
  nothing. It is still idempotent via the `--color-1` probe,
  which checks the **first** variable rather than all five so
  a half-finished block from an interrupted write is detected
  instead of topped up into a duplicate.

  VERIFY — `npm run build` in `packages/cli` (zero TS errors);
  root `npx tsc --noEmit` and `npm run lint` clean; `.next`
  deleted and root `npm run build` re-run (all 28 routes
  prerender, including the two new ones). The emitted CSS was
  then read directly rather than assumed: `:root` stops
  present, `@keyframes rainbow` present, `.animate-rainbow`
  present, the unlayered reduced-motion rule present, and all
  three mask longhands present with **no** `mask:` shorthand
  left from this component.
  - **73/73 browser assertions** (`/tmp/verify_f25.py`,
    Playwright driving system Chrome against `npm start`):
    all four variants present; the ring is inset-0 with the
    right computed `padding`, `mask-clip` and
    `mask-composite`; **pixel proof** the ring's centre is not
    painted (`elementFromPoint` lands on the face); the halo's
    box is wider than the button's and the root's `overflow`
    is `visible`; `gradient-text` draws no ring, uses
    `background-clip: text` and is `rgba(0,0,0,0)`;
    `background-position` measurably **advances**; `speed` →
    `0.6s`/`14s` and `borderWidth` → `1px`/`2px`/`4px` all
    read back off computed style; the button's box does not
    move across 400ms (zero CLS); the docs page has one `h1`,
    real `<table>`s, `pre.shiki`, zero nested `<p>`, working
    Variant and Size controls (each variant's layer count and
    each size's measured height assert real behaviour), 21
    sidebar links, **0** "Soon" rows, ⌘K opens;
    `prefers-reduced-motion` yields `animation-name: none`
    while the gradient is still painted; Tab reaches a button;
    **zero console and page errors.**
  - **48/48 CLI assertions** (`/tmp/verify_f25_init.py`, live
    runs of the built `dist/index.js` against throwaway
    projects, since deleted) across 7 fixtures: a v3 project
    with `import type { Config }`, its own `colors` /
    `keyframes` / `animation` and a comment containing `theme`
    and `{`; one with no `:root`; one whose only `:root` is
    nested in a `prefers-color-scheme` block; a v4 project with
    no config; a pre-existing `--color-1`. Asserted: the
    `rainbow` keyframe with both `background-position` stops
    and the `rainbow var(--speed, 2s) infinite linear`
    animation land in `theme.extend`; the user's
    `colors.brand`, `keyframes.wiggle`, `animation.wiggle`, the
    leading import and every comment survive; there is exactly
    **one** `keyframes:` and **one** `animation:` property (the
    duplicate-key trap from Feature 21); the five variables
    land inside an existing `:root` with `--brand`, `--radius`
    and the user's comment intact, or in a freshly appended
    block, or **not** in the dark-mode `:root`; the v4 path
    emits `@keyframes rainbow` + `.animate-rainbow` and adds
    it to the reduced-motion block without creating a config
    file; **two consecutive runs are byte-identical** for both
    the v3 and v4 fixtures; and a user's own `--color-1: red`
    is neither duplicated nor overwritten.
  - **THE INJECTED TAILWIND CONFIG WAS COMPILED, NOT JUST
    PARSED** — real Tailwind 3.4.19 over the file `init`
    produced: `.animate-rainbow` emitted with the
    `rainbow`/`--speed`/`2s`/`infinite`/`linear` shorthand,
    `@keyframes rainbow` with both stops, and the user's own
    `.bg-dead-950`, `.animate-wiggle` and `@keyframes wiggle`
    still resolving. "The file parses" is not "the button is
    styled".
  - **Installs from a bare checkout:**
    `DEADUI_REGISTRY_BASE_URL=<repo> deadui add
    rainbow-button` in a throwaway `src/` project wrote
    `src/components/ui/rainbow-button.tsx`, exited 0, and the
    file is **byte-identical** to the repo source (`cmp`).
  - **Registry invariant:** 10 components, 14 `files[].path`
    values, **0** missing on disk.

  HARNESS NOTES (additions to the Feature 24 list). Tailwind's
  content **scanner** still finds nothing on this machine for
  a glob, so the compile proof needs `{ raw, extension:
  "html" }` — the Feature 21 note, hit again, and the cause of
  a first-round 41/46 that was the harness's fault, not the
  product's. And Tailwind **tree-shakes unused keyframes**:
  asserting `@keyframes wiggle` survives requires the user to
  also have an `animation.wiggle` AND `animate-wiggle` in the
  probe content, because `.animate-*` is generated from
  `theme.animation`, not `theme.keyframes` — my first fixture
  asserted something Tailwind is *designed* to drop. Two of
  my own assertions were wrong before the code was, which is
  the argument for asserting the composed result rather than
  the implementation.

- Feature 24, part 4 (release verification, feature CLOSED):
  the owner cut release `v0.1.0`. Checked via the GitHub REST
  API — no `gh` CLI on this machine and no repo admin rights,
  but a public repo's runs are readable unauthenticated. The
  workflow fired correctly and the failure is narrow.

  **THE WORKFLOW CONFIGURATION IS CORRECT, AND THE RUN
  PROVES IT.** `release: [created]` → run `37266086206`,
  event `release`, head `v0.1.0@be09fcf` (my latest commit,
  not a stale SHA). Steps 1–5 green on the real runner:
  `checkout`, `setup-node` (Node 20 + `registry-url` + scoped
  npm cache), `npm ci`, `npm run build`. Step 6
  `npm publish --access public` failed. That is the FIRST
  thing on the real GitHub runner that this feature had never
  exercised: the locked install and the `tsc` build now have
  live-runner proof, not just my local proof.

  **THE CAUSE IS THE SECRET, AND IT WAS RULED OUT BY
  MEASUREMENT RATHER THAN GUESSED.** Job logs need admin
  rights (the download endpoint returned 403), so I could not
  read the npm error — but three independent facts leave only
  one candidate. (1) `registry.npmjs.org/deadui` returns
  **404**, so the name is free and this is not a 403 name
  conflict. (2) The manifest at `be09fcf` is publishable:
  `version 0.1.0` matching the tag, **no** `private: true`,
  `files: ["dist/"]`, `bin.deadui` set, `license: MIT`, and
  `repository` now pointing at the real repo. (3) The only
  input step 6 has beyond the built tree is
  `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`, and no such
  repository secret exists — a repo secret cannot be created
  from this machine without admin rights. Therefore: npm ran
  unauthenticated and refused. Stated as the conclusion with
  that evidence, not as a certainty, because I could not read
  the log.

  **THE REAL GITHUB REGISTRY PATH IS NOW PROVEN END TO END,
  WHICH CLOSES THE BLOCKER OPEN SINCE FEATURE 17.** The repo
  is public and pushed, so with **no** env override at all
  (the `yourusername` placeholder is gone and
  `HamidRezaSepehr/deadui/main` is live), `add
  cinematic-text` in a throwaway `src/` Next project fetched
  `registry.json` and `registry/cinematic-text/…tsx` over the
  real `raw.githubusercontent.com`, detected `Next.js`, wrote
  `src/components/ui/cinematic-text.tsx`, exited 0 — and the
  installed file is **byte-identical** to the repo source
  (`cmp`). The Pro path was checked in the same run: `add
  webgl-image-trail` with no credentials prints all three new
  disclosure lines and exits 1 at the licence gate, before any
  fetch. `registry.npmjs.org/deadui` still 404s, so
  `npx deadui@latest` is not installable yet — the CLI is
  only reachable from a clone or a tarball until Next Up #11
  is green.

  Feature 24 is marked **100% complete**: every item in
  `24-npm-publishing-and-cicd.md` is implemented, verified and
  pushed. The outstanding work is one GitHub-UI action with no
  code in it.

- Feature 24, part 3 (Pro commercial licence): `LICENSE.md`
  added to the private `deadui-pro` repo. One new file, 27
  lines, pushed as `dc83627`. Nothing else changed — the
  public repo's only edit is this tracker.

  **THE TERMS WENT IN THE PRIVATE REPO, WHICH IS THE RIGHT
  PLACE AND IS ALSO THE REASON THE DISTRIBUTION QUESTION IS
  STILL OPEN.** A licence has to be *given* to a licensee to
  bind them, and the private repo is the one artefact a
  licensee cannot be assumed to have read: the CLI prints a
  `deadui.dev/pro` purchase link, never the terms, and
  `/api/validate-license` answers `{ valid: boolean }`.
  Raised as an Open Question with the candidates (print the
  terms on first Pro install, host them at a public URL and
  link from both READMEs and the file headers, add a
  carve-out to §2.3).

  **CLAUSE §2.3 AS WRITTEN BINDS ONLY THE LICENSEE.** "You
  may not include the source code of Dead UI Pro components
  in any open-source project where the source code is made
  publicly available" is exactly what Feature 24 part 2
  shipped *in the licensor's own public repo* — deliberately,
  because the docs site cannot build without those six
  imports. The asymmetry is not a drafting mistake: a licence
  only constrains the grantee. But it does mean the clause
  currently protects nothing that the licensor is not
  already giving away, so it should be read as a commitment
  about *licensees* rather than as a technical control. Worth
  stating plainly so nobody later assumes §2.3 is the
  enforcement mechanism. The enforcement mechanism is the
  CLI gate, which is why part 2 added an `INVARIANT`
  forbidding a bypass.

  **THE YEAR AND THE CONTACT ADDRESS ARE BOTH UNVERIFIED
  AND WERE COPIED VERBATIM, AS INSTRUCTED.** The text says
  `Copyright (c) 2024`, while the repo's MIT `LICENSE` says
  `2026` — the same repository now carries two different
  copyright years, which is the kind of detail that gets
  quoted back. And the contact address is
  `me@hamidrezasepehr.com`, which is a different domain from
  the GitHub account's committed email. Both are the owner's
  to set; flagged rather than silently "corrected", because
  guessing a year or rewriting a legal contact address is
  worse than an inconsistency.

  **NO `registry.json` CHANGE, DELIBERATELY.** It would be
  easy to add a `license: "commercial"` field to the two Pro
  entries. Not done: it is a registry structure change (the
  ai-workflow-rules split), the CLI ignores unknown fields so
  it would change nothing functionally, and the headers
  already carry the notice into every installed file.

- Feature 24, part 2 (Pro licensing pass, on the owner's
  instruction): the public repo keeps `registry/pro/**`, and
  visibility is now explicitly NOT a license. Files: new
  `registry/pro/README.md`; modified `README.md`,
  all 7 `registry/pro/**` source files,
  `packages/cli/src/commands/add.ts`, this file.

  **THE FEATURE-24 COMMIT ALREADY CONTAINED
  `registry/pro/**` — PART 2 DOES NOT MOVE ANY FILE.** The
  decision the owner made was "commit everything including
  `registry/pro/` to the public repository", which the Feature 24
  commit had already done (Next Up #10 flagged it, and the
  handoff offered it as option B). What part 2 adds is the
  *disclosure*: a folder-level `README.md` (GitHub renders it
  when the folder is browsed), a callout directly under the
  banner in the root `README.md` plus an expanded `📄 License`
  section, and a header comment on every Pro source file.

  **`registry/pro/README.md` IS A FILE, NOT A COMMENT.** "Add a
  comment in the folder" has no mechanism in a directory — a
  folder holds no text. `README.md` is the convention GitHub
  itself renders for a directory, so the notice is in the one
  place a human opening `registry/pro` will actually see it.
  It also documents the second half of the story (that the CLI
  validates a key before fetching anything, and that two
  credentials are needed), which a bare notice would not.

  **THE CSS MODULE GOT A BLOCK COMMENT, NOT `//`.**
  `text-fill-animation.module.css` is the one non-`.ts` file in
  the folder, and `//` is not a CSS comment — it would have been
  parsed as an invalid selector and silently dropped, leaving the
  only Pro file *without* a header. Same three lines, `/* */`
  form. Verified the module still emits: `grep` of the
  production CSS chunk finds both `obsidian-text-fill-color` and
  `tfa-dim-color`.

  **`'use client'` IS STILL THE FIRST STATEMENT AFTER THE
  HEADER**, which is what matters — the directive has to be in
  the module prologue, and leading comments are allowed there.
  Confirmed by the build, not by reading: both Pro docs pages
  and both `/test-*` routes still prerender `○ (Static)`.

  **THE LICENCE GATE NEEDED NO FUNCTIONAL CHANGE, AND THE
  OWNER ASKED FOR ONE ANYWAY — SO THE CHANGE IS WORDING PLUS
  AN INVARIANT COMMENT.** The gate was already server-side and
  already ran before any fetch; the new comment above step 4 in
  `add.ts` records WHY, so the next contributor does not "fix"
  it: `// INVARIANT: … Do not add a skip flag, an env-var
  bypass, or an "install without a key" path.` Three new output
  lines make it visible to the user instead: the Pro warning now
  says the source is public but that is not a license, the
  no-key error says reading it does not grant one, and a
  successful Pro install prints a do-not-redistribute line.
  **An env-var bypass was deliberately NOT added.** "Only
  paying users get easy installation" is a statement about the
  gate being the only supported path; a `DEADUI_SKIP_LICENSE`
  would be the opposite, and it is not requested.

  **VERIFIED, NOT ASSUMED — 36/36 e2e assertions** against the
  rebuilt `dist/index.js`, two Python stub servers (all since
  deleted). The registry stub treats `registry/pro/**` as
  private content (200 only for the exact PAT, else 404) and
  logs every path with its `Authorization` header, so the
  routing claims come from the server's own log.
    - **THE ACTUAL CLAIM, TESTED:** `add text-fill-animation`
      with a valid PAT and **no license key** → exit 1, **0**
      files, **0** Pro requests (one request total, for
      `registry.json`), and all three disclosure lines present.
      The source is sitting in the same repo the CLI is
      installing from, and it still will not hand it over.
    - Invalid key → exit 1, PAT prompt never rendered, 0 fetches.
    - Valid key + PAT → 4 Pro fetches all carrying the header,
      4 files written **byte-identical** to source, and the
      installed file **starts with** the `🔒 PRO COMPONENT`
      header (so the notice travels into the user's project, not
      just into GitHub).
    - Valid key, no PAT → exit 1, 0 fetches. Wrong PAT → exit 1,
      0 files, one request, 404 explained as an access problem.
    - Free regression: `add marquee` → 2 unauthenticated
      requests, **0** license-server calls, file written, and no
      Pro header leaked into a Free file.
    - Tier→URL mapping unchanged: Free → `…/deadui/main`, Pro →
      `…/deadui-pro/main`.
  Also `npm run build` in `packages/cli`, root `npx tsc
  --noEmit`, root `npm run lint`, and root `npm run build` after
  deleting `.next` — all clean, all 25 routes prerendered.

  **THE COMMERCIAL TERMS ARE STILL PROSE.** A header comment
  and two READMEs are notice, not a licence: there is still no
  `LICENSE` file, no EULA, and no `LICENSE` field on the Pro
  tier. A header that claims a commercial licence without one
  being granted is a weak position to enforce, so this is worth
  writing before the first Pro sale.

- Feature 24 (feature spec `24-npm-publishing-and-cicd.md`):
  two-repo fetch, npm publish workflow, `vercel.json`.
  Created: `.github/workflows/publish-cli.yml`,
  `vercel.json`. Modified:
  `packages/cli/src/utils/fetch-registry.ts` (rewritten),
  `packages/cli/src/commands/add.ts` (+ second Pro gate),
  `packages/cli/src/index.ts` (+ `--github-token`),
  `package.json`, `packages/cli/package.json`,
  `components/docs/top-nav.tsx`, `README.md`,
  `context/architecture.md`, this file. `registry.json`
  was **not** modified — see below.

  **`registry.json` ALREADY SATISFIED THE SPEC.** Step 1
  of the implementation ("point Pro component files at the
  `registry/pro/` paths") was done in Feature 22, and the
  disk move followed it: both Pro entries already read
  `registry/pro/webgl-image-trail/…` and
  `registry/pro/text-fill-animation/…`, and all **13**
  `files[].path` values across all 9 components exist on
  disk (0 missing). Re-writing them would have been a
  no-op diff, so the file was left byte-identical. This is
  the "Registry is Truth" invariant pointing the other way:
  the registry's `path` values never changed, and what
  changed is **which repository a path is resolved
  against** — `registry/pro/…` now means "the private repo",
  not "a subdirectory of the public one". Encoding the split
  as a path rewrite would have meant inventing paths
  (`pro-registry/…`) that exist in no repo.

  **`fetchRegistry()` STILL READS FROM THE PUBLIC REPO,
  AND THAT IS THE POINT.** The registry lists all 9
  components, Pro included, so a Free user can discover Pro
  components and a Pro user is told what exists *before* the
  CLI asks for a license key and a PAT. Serving
  `registry.json` from the private repo would have made the
  Pro tier undiscoverable and turned the CLI into a
  credential-gated index. Verified in the harness: the
  `registry.json` request carries `"auth": null` even
  during a Pro install.

  **ONE `DEADUI_REGISTRY_BASE_URL` OVERRIDE, NOT TWO.**
  A local checkout serves Free and Pro from the same
  `registry/` tree, so two overrides would force every local
  run to set two variables to describe one directory. The
  override therefore applies to both tiers, which is also
  what let the end-to-end harness below point both at one
  stub. The tier→URL mapping itself is asserted with the
  override OFF (case 9).

  **THE 404 IS THE INTERESTING PART, AND IT IS WHY
  `fetch-registry.ts` KEEPS A STATUS.** GitHub answers
  **404, not 403**, for private content a token cannot read
  — deliberately, so that a private repo's existence is not
  confirmed to a stranger. So the naive implementation (a
  generic "Failed to fetch file: … HTTP 404") would have
  told a paying customer with a valid license and a
  perfectly good token that the registry was broken, and
  sent them to the one URL they cannot fix. `RegistryFetchError`
  carries `status`, and `fetchFile` turns a Pro 404 into
  "GitHub returns 404 for private content a token cannot
  read — check the token has `repo` scope and that your
  account was added as a collaborator on
  `deadui-pro`". 401 gets its own message. Free-tier errors
  are untouched, and `fetchFile` still `process.exit(1)`s on
  the first failure, so a bad token costs exactly **one**
  request rather than one per file (asserted).

  **THE LICENSE GATE STAYS FIRST, AND THE ORDER IS
  DELIBERATE.** The PAT prompt comes *after* license
  validation: an invalid key exits 1 having asked for
  nothing else, so a user who has not bought Pro is never
  asked for a GitHub credential. Asserted (case 6: the PAT
  prompt string does not appear at all in the output).
  Both credentials are still required — a license key
  proves the purchase, a PAT proves the GitHub-side repo
  permission, and neither implies the other.

  **`promptLicenseKey()` WAS GENERALISED RATHER THAN
  DUPLICATED.** Two masked prompts with the same stdin-EOF
  race are one function, `promptSecret(name, message)`,
  with `resolveSecret()` on top; `resolveLicenseKey()` and
  `resolveGitHubToken()` are now one-line wrappers. Copying
  the race would have been a second place for the Feature 18
  bug to rot in. Verified on a **real pty**: the PAT is
  echoed as `******************` and the literal token
  appears nowhere in the transcript — while the stub server
  did receive `Authorization: token ghp_TESTPAT_…` twice.

  **`--github-token` IS AN ADDITION TO THE SPEC, AND IT IS
  THE ONLY WAY TO INSTALL PRO NON-INTERACTIVELY.** With two
  credentials the CLI has no single flag left that can carry
  both (`--token` is the license key), and a Pro install in
  CI or a script otherwise needs two piped prompts — which the
  Feature 21 notes record as unreliable, since a `prompts`
  `select`/password pair does not settle reliably on a pipe.
  It skips the prompt entirely, exactly as `--token` does.
  Neither secret is written to disk; the PAT lives in memory
  for the install.

  **THE WORKFLOW IS OIDC-READY BUT NOT YET OIDC-ONLY, AND
  THAT IS THE SPEC'S OWN FINAL WORDING.** `id-token: write`
  is granted exactly as required, so the day npm's "Trusted
  Publisher" is enabled for the package the only change
  needed is deleting the `env:` block. `NODE_AUTH_TOKEN`
  from `secrets.NPM_TOKEN` stays until then, because npm
  OIDC is enabled per package in the web UI and cannot be
  turned on from a YAML file. Two deliberate deviations from
  the spec's snippet: `registry-url` is kept on
  `setup-node` (it is what makes `NODE_AUTH_TOKEN` be read
  from the right scope) and `cache: 'npm'` +
  `cache-dependency-path: packages/cli/package-lock.json`
  are added, since `packages/cli` has its own lockfile and
  the root one would otherwise be cached. `npm ci`, not
  `npm install`, so a published tarball can never carry a
  tree the lockfile does not describe.

  **THE `release` TRIGGER DOES NOT SET THE VERSION.** The
  workflow publishes whatever `version` is in
  `packages/cli/package.json`; the tag is not read. Two tags
  cut without a bump would try to publish `0.1.0` twice and
  the second would fail. Raised as Next Up #11 rather than
  fixed here — `npm version` in the workflow would let a tag
  silently disagree with the manifest.

  **VERIFY —** `npm run build` in `packages/cli` (zero TS
  errors); root `npx tsc --noEmit` and `npm run lint` clean;
  `.next` deleted and root `npm run build` re-run (all 25
  routes prerender, `ƒ /api/validate-license`). `vercel.json`
  parses and the workflow YAML parses with
  `permissions: {id-token: write, contents: read}` and the
  five expected steps. The workflow's own three commands were
  executed for real in a throwaway copy of `packages/cli`
  (since deleted): `npm ci` → 0 vulnerabilities, `npm run
  build` → `dist/`, `npm publish --access public --dry-run`
  → **15 files, 17.7 kB, zero `src/`**. Then **50/50**
  end-to-end assertions against the built `dist/index.js`,
  driven by two Python stub servers (all since deleted): one
  server mimicked BOTH repos behind a single base URL —
  anything under `registry/pro/` behaved like private
  content (200 only for the exact PAT, otherwise 404) while
  every other path was public and never received a
  credential; a request log recorded every path and its
  `Authorization` header, so the routing claims are read
  from the server's own log rather than from stdout.
    - **Free** (`marquee`, `gradient-border`): success, both
      requests `"auth": null`, **zero** license-server calls,
      `src/` remap intact, and a `--github-token` passed to a
      Free install is **not** attached to the request.
    - **Pro, valid PAT**: `registry.json` unauthenticated, all
      4 `registry/pro/…` requests carrying
      `Authorization: token <PAT>`, 0/5 other requests
      carrying any token, all 4 files written and
      **byte-identical** to the repo sources (`cmp`).
    - **Pro, wrong PAT**: exit 1, **0** files, the
      access-not-broken-URL message, and **exactly one**
      request (fail fast).
    - **Pro, no PAT, stdin closed**: exit 1, **0** Pro
      requests (the gate precedes the fetch), license
      validated first.
    - **Pro, PAT piped into the prompt**: install succeeds
      and the piped value reaches the private repo.
    - **Pro, invalid license**: exit 1, PAT prompt never
      rendered, 0 Pro requests.
    - **Tier→URL mapping, override OFF**: Free →
      `…/HamidRezaSepehr/deadui/main`, Pro →
      `…/HamidRezaSepehr/deadui-pro/main`, no-arg default →
      Free. Both real URLs also answered `404` from this
      machine, which is the expected result while the repos
      do not exist yet and confirms the URL shape.
  SCREENSHOTS n/a (a terminal, not a browser).

  **HARNESS TRAP WORTH KEEPING: a `prompts` prompt that is
  never answered EXITS 0 AND WRITES NOTHING**, which is the
  Feature 17 `install-deps.ts` race (Next Up #2). The first
  harness run threw away four of its own cases to it — a
  throwaway project that did not pre-declare the component's
  dependencies hit the install prompt and the CLI exited 0
  having installed nothing, which looks exactly like a
  passing test if you only check the exit code. Every
  fixture project now declares all eight deps. Also note
  `wc -l` pads with spaces on macOS, which turned `2` into
  `'       2'` and failed a comparison; and a mistyped
  constant in the stub (`"deadui-pro/"` where the private
  marker should have been `"registry/pro/"`) made the stub
  serve Pro content publicly — a harness bug that initially
  read as "the PAT is not being sent" and was the more
  alarming of the two, which is why it is written down.

  **THE LEAK, AND WHY IT IS NOT A BUG IN THIS FEATURE.**
  The local commit contains `registry/pro/**`, so pushing
  `main` to the public remote publishes the Pro source. That
  is a direct consequence of the docs site importing
  `@/registry/pro/*` from six call sites (landing hero,
  preview wrappers, two Pro `page.mdx` files, two `/test-*`
  pages): a Pro-free public repo does not build, and Vercel
  cannot deploy it. Feature 24 was asked to prepare the code
  for a push to both repos and the CLI/workflow/vercel work is
  what it changed; choosing between a public stub, a
  private-repo deploy and accepting the leak is a product
  decision. It was raised with the user, "commit everything
  and flag the leak" was the answer, and the tension is
  recorded as Next Up #10 and the second Open Question
  rather than silently resolved either way.

  **UNCHANGED, DELIBERATELY:** `staggered-grid` still has no
  `registry.json` entry (Next Up #9) — adding it would mix a
  registry structure change into a release/CI step, and
  `VALID_LICENSE_KEYS` issuance is still hand-edited.

- Feature 23 (feature spec `23-readme-and-launch.md`):
  README, CONTRIBUTING, `.npmignore` and package metadata.
  Created: `README.md`, `CONTRIBUTING.md`,
  `packages/cli/.npmignore`. Modified: `package.json`,
  `packages/cli/package.json`, this file. No source file,
  no dependency and no component was touched — the whole
  feature is docs plus manifest metadata.

  **THE CLI PACKAGE HAD NO `files` FIELD AT ALL, SO
  `.npmignore` ALONE WAS NOT ENOUGH — BUT ONLY BECAUSE OF
  HOW THE TWO INTERACT.** The spec asks for both a
  `files: ["dist/"]` array and an `.npmignore`, which look
  like redundant belt-and-braces. They are not, and the
  order matters: npm applies `.npmignore` FIRST and then
  intersects with `files`, so `files` can only ever
  SUBTRACT. That makes `files` the load-bearing half — it
  is what guarantees a clean tarball — and `.npmignore`
  the readable statement of intent. The trap is the
  spec's own `.npmignore` line `!dist/`: on its own, with
  no `files`, that negation re-includes `dist` after the
  `*.ts` rule above it stripped the emitted `.d.ts`
  declarations, which is presumably the intent. With
  `files: ["dist/"]` present it is simply inert. Verified
  empirically rather than reasoned about:
  `npm pack --dry-run` emits exactly 15 files — 14 under
  `dist/` (7 `.js` + their 7 `.d.ts`) plus `package.json`.
  **Zero `src/` entries, zero `node_modules/`, zero stray
  `.ts`.** Then
  a real `npm pack` + `npm install <tarball>` into a clean
  `/tmp` project: `node_modules/deadui` contains
  `dist/` + `package.json` and nothing else, and
  `./node_modules/.bin/deadui --help` prints both `add` and
  `init` and exits 0. That is the check that matters —
  "the tarball excludes `src/`" is a claim about a file
  list, "the published package runs" is a claim about a
  user. Both are now true. (`dist/index.js` carries its
  `#!/usr/bin/env node` shebang, so the `bin` mapping
  works without a `chmod` fix.)

  **THE README'S COMPONENT TABLE ADVERTISES SOMETHING THE
  CLI CANNOT INSTALL, AND I LEFT IT THAT WAY ON PURPOSE.**
  The spec's Free table lists 8 components; `registry.json`
  describes 7 Free + 2 Pro. The missing one is **Staggered
  Grid Reveal** — `registry/staggered-grid/` exists, it has
  a docs page and a `/test-staggered-grid` route, but no
  registry entry was ever added for it (Feature 13's notes
  never claim one was, whereas Feature 14's explicitly do).
  So the README says `npx deadui add staggered-grid` works
  and it does not. Three ways out, and the reasoning:
  - Add the `registry.json` entry → makes the README true,
    but that is a **registry structure change**, and
    ai-workflow-rules.md says "Registry structure changes
    AND documentation updates" must be split into separate
    steps. Feature 23 is the documentation step.
  - Delete the row → makes the code true, but the spec
    dictates the table verbatim and instructs "Create the
    root README.md with the exact structure provided
    above"; quietly shipping a worse README to satisfy a
    registry bug hides the bug.
  - Ship the spec's table and record the gap → the spec is
    followed, the discrepancy is loud, and the fix is a
    one-line follow-up. **This is what shipped.** It is
    recorded in Next Up #9, in the Component Status table
    for row 6, and as the first Open Question.

  **EVERY REPOSITORY URL IN THIS PROJECT IS A PLACEHOLDER,
  AND PROPAGATING THE PLACEHOLDER WAS THE POINT.** There
  is no real GitHub org or user anywhere in the tree:
  `DEFAULT_REGISTRY_BASE_URL` is
  `https://raw.githubusercontent.com/yourusername/deadui/main`,
  `GITHUB_URL` in `top-nav.tsx` is
  `https://github.com/yourusername/deadui`, and the README
  footer is the spec's literal `[Your Name/Handle]`. The spec
  only says "point `repository` at the GitHub URL" without
  naming one. Inventing a plausible org would have produced
  a manifest that looks finished and 404s on the first
  `npx deadui add`; leaving the two manifests inconsistent
  would have been worse still. So `repository`, `bugs` and
  `homepage` use the same `yourusername/deadui` string that
  already exists in the CLI and the docs nav, which makes
  the substitution a single find-and-replace at launch
  instead of a per-file scavenger hunt. **This is a real
  launch blocker, not a cosmetic one** — until it is
  replaced, the published CLI fetches its registry from a
  URL that does not exist — so it is Next Up #8 and the
  second Open Question.

  **`author` is the brand, not a person.** Both manifests
  carry `"author": "Dead UI"`. No individual handle appears
  anywhere in the repo, and inventing one (or an email
  address) is exactly the kind of fabrication that ships.
  npm requires neither, so the field is accurate as written
  and the README footer is left as the spec's placeholder
  for the team to fill in.

  **THE ROOT `package.json` HAD NO DESCRIPTION AT ALL**,
  which is why the spec's "description matches the
  tagline" reads as an update rather than a check. It also
  had no `keywords`, `author`, `license`, `homepage` or
  `bugs`, and `private: true` (kept — the root app is not
  published to npm; only `packages/cli` is). The CLI
  manifest already had a `name` and a `description`, so its
  two changes are the `files` array and the added metadata;
  its `bin` mapping was already correct and is unchanged.

  **A `LICENSE` BADGE HAD TO LOSE ITS LINK.** The spec's
  License section asserts MIT, so the obvious launch touch
  is an MIT badge — and the reflexive move is
  `[![license](…)](./LICENSE)`. There is no `LICENSE` file
  in this repo, and the spec's "Files to Create/Update"
  list does not include one, so that link is a 404 on the
  front page of the launch. The badge is therefore
  unlinked (`img.shields.io/npm/l/deadui`), which still
  renders the MIT text from the published manifest once
  the package is live. Whether to add a real `LICENSE`
  (and how the Pro/commercial split is expressed in it) is
  raised as an Open Question.

  VERIFY — `npm pack --dry-run` and a real `npm pack` +
  install + `deadui --help` in a clean `/tmp` project, both
  above (temp project and tarball deleted). Both
  `package.json` files parse and carry the expected
  `name` / `description` / `repository` / `files` / `bin`.
  Root `npm run lint` clean and root `npx tsc --noEmit`
  clean. No `npm run build` was run: this feature changed
  no `.ts`/`.tsx` file, and both previous sessions
  established that a green build on an unchanged component
  tree proves nothing new.

- Feature 22 (feature spec `22-cli-pro-fetching.md`): Pro
  files are fetched and written. Modified: `registry.json`,
  `packages/cli/src/commands/add.ts`, this file, and
  `context/architecture.md`. No new files and no new
  dependencies; `fetch-registry.ts`, `install-deps.ts`,
  `validate-license.ts` and the `/api/validate-license`
  endpoint are all untouched (a spec constraint).

  THE WHOLE CODE CHANGE IS A DELETION. `add.ts` lost the
  Feature 18 early `return` and its four placeholder
  `console.log` lines — the `if (component.tier === 'pro')`
  block still ends in `process.exit(1)` for every failure
  path, so a validated key simply *falls out* of the block
  and reaches framework detection. Steps 5–8 were already
  tier-agnostic, so Pro now runs the identical
  detect → diff-deps → `fetchFile`/`writeFile` → summary
  loop that Free uses. There is no second code path to keep
  in sync, which is the cheapest possible answer to "must
  work seamlessly for both tiers". Cost: 15 lines removed.

  THE SPEC ONLY ASKED FOR THE `registry/pro/` PREFIX, BUT
  TWO `target` PATHS WERE ALSO BROKEN, AND FIXING THEM WAS
  THE WHOLE POINT OF THE FEATURE. The feature's stated
  purpose is "so Pro components can be fully installed", and
  until this release nothing had ever written a Pro file —
  so these two registry targets had never been observable.
  Registry sources use **sibling-relative** imports
  (`import styles from './text-fill-animation.module.css'`,
  `import { ImagePlane } from './image-plane'`), which only
  resolve if the satellite lands in the importer's own
  directory:
  1. **`text-fill-animation`'s CSS module was targeted at
     `styles/text-fill-animation.module.css`** — which the
     spec's own example JSON repeats. But the component was
     targeted at `components/ui/text-fill-animation.tsx`, so
     `./text-fill-animation.module.css` could only ever
     resolve to `components/ui/…`, and the file landed one
     directory away. Changed to
     `components/ui/text-fill-animation.module.css`. This
     also makes it the only `components/`-prefixed target in
     the registry, so it inherits the `src/` remap in
     `resolveTargetPath`; `styles/` had none, meaning a `src/`
     project got its CSS outside `src/` while its component
     sat inside it.
  2. **`webgl-image-trail`'s satellites were targeted at a
     `components/ui/webgl-image-trail/` SUBDIRECTORY** while
     the component itself was the sibling FILE
     `components/ui/webgl-image-trail.tsx`. `./image-plane`
     and `./shaders` therefore resolved to
     `components/ui/image-plane` and `components/ui/shaders`,
     which do not exist. All four files now install into
     `components/ui/webgl-image-trail/`, and the component's
     `index.ts` barrel was **added to the registry** — it
     already existed in the component's own registry directory
     and was simply not listed. That is load-bearing twice
     over: it is the only thing that makes
     `app/docs/components/webgl-image-trail/page.mdx` line
     76's documented import path `@/components/ui/webgl-image-trail`
     resolve, and it satisfies code-standards' rule that every
     registry component ships a barrel.

  **`tsc` CANNOT SEE EITHER BUG, WHICH IS WHY THEY SURVIVED
  THREE FEATURES.** Both were verified with real `tsc` 5.9.3
  first, and it reported *the same thing for both layouts*:
  clean in one case, `TS2307` in the other — then the same
  result again when the fix was applied. Two separate reasons,
  both worth remembering:
  - Every real project has an ambient `declare module
    '*.module.css'` (Next via `next-env.d.ts` →
    `next/types/global`, Vite via `vite/client`), and an
    ambient wildcard satisfies a relative specifier that
    resolves to nothing. Strip that one `declare module`
    block and the two layouts finally differ.
  - Even with the wildcard gone, `tsc` does **not** resolve a
    real `.css` file on disk (that needs
    `allowArbitraryExtensions` + a `.d.css.ts`). So a genuine
    typecheck can never answer "does this CSS file exist?".
    No bundler is installed in this repo to check with —
    there is no esbuild, rollup or webpack under
    `node_modules`, and Next 16 resolves through Turbopack.
  The check that actually settles it is three lines —
  resolve the relative specifier against the importing file's
  directory and stat it, which is what a bundler does:
  `components/ui/…` → exists → resolves; `styles/…` → the
  file is not there → MODULE NOT FOUND. So "the file writes
  successfully" and "the installed project compiles" are
  genuinely different claims here, and only the second one
  justifies changing a `target`.

  VERIFY — `npm run build` in `packages/cli` (zero TS
  errors); root `npm run build` (all 9 docs pages and all 9
  `/test-*` routes still `○ (Static)`), root
  `npm run lint` clean, root `tsc --noEmit` clean. Then live
  end-to-end runs of the built `dist/index.js` with
  `DEADUI_REGISTRY_BASE_URL` pointed at a `/tmp` mirror laid
  out the way `registry.json` now describes (`registry/pro/…`)
  and `DEADUI_API_URL` pointed at a stub license server
  (valid key `DEADUI-TEST-KEY`, every other key rejected,
  request log written to a file), against throwaway projects
  (all since deleted):
  - **Pro, valid key, all six dependencies already present:**
    `webgl-image-trail` → 4 files, `text-fill-animation` →
    2 files, exit 0, all 6 byte-identical to the served
    sources (`cmp`). **10/10 relative imports inside the
    installed output resolve**, and both documented import
    paths (`@/components/ui/webgl-image-trail` →
    `…/index.ts`, `@/components/ui/text-fill-animation` →
    `…/text-fill-animation.tsx`) resolve.
  - **DEPENDENCY LOGIC — the spec asked for this to be
    verified, not written, and it needed no change.** The
    prompt lists exactly `three, @react-three/fiber,
    @react-three/drei, clsx, tailwind-merge,
    class-variance-authority`; with all six already in
    `dependencies` no prompt appears at all; declining still
    writes every file. Because `execSync` interpolates the
    list into an unquoted `/bin/sh` string, the scoped names
    were checked specifically with a fake `npm` first on
    `PATH` that logs its argv: 7 argv entries, with
    `@react-three/fiber` and `@react-three/drei` each
    arriving as ONE argument, unglitched. (No npm package
    name can contain a shell metacharacter, so the unquoted
    interpolation is not a live bug — but it was worth
    measuring rather than assuming.)
  - **BLOCKING STILL WORKS.** Invalid key → exit 1, 0 files.
    No key with stdin closed → exit 1, 0 files. License
    server unreachable (dead port) → exit 1, 0 files, with
    the network-specific message. Unknown component → exit
    1. No `package.json` → exit 1.
  - **FREE REGRESSION: 7/7 components install with no token
    and ZERO requests to the license server** (asserted from
    the server's own request log, not from stdout).
  - **THE PROMPT PATH.** A valid key piped into the masked
    license prompt and an invalid one piped the same way →
    install vs exit 1. `--pro` is accepted and correctly
    ignored: tier comes from the registry, so `--pro` on a
    Free component triggers no license check.
  - **LAYOUTS.** `src/` Next, flat Next, `src/` Vite — all
    three resolve Pro targets correctly
    (`src/components/ui/…` vs `components/ui/…`), and
    `detectFramework` correctly reported Vite once the
    `vite.config.ts` filename was not, in my own harness,
    carrying a stray newline. Re-running a Pro install
    overwrites cleanly: a planted `sentinel` export is gone
    and the file is byte-identical to the served source.

  HARNESS NOTES. `VAR=x helper "$( … )"` does **not** do what
  it looks like — the substitution is expanded before the
  assignment reaches the subshell, so three separate
  "assertions" reported a false pass/fail until each was
  re-run with the variable exported. And piping through
  `sed` to strip ANSI masks the exit code behind `sed`'s, so
  the exit-code probes capture `$?` before any pipe.

  AT THE TIME OF WRITING, ONE THING WAS STILL OPEN: the Pro
  sources were still in `registry/<name>/`, so `registry.json`
  pointed at `registry/pro/…` paths that did not exist on disk
  yet. The spec calls that move "a manual step for the user",
  and a `/tmp` mirror of the `pro/` layout is what kept this
  verification honest in the meantime. **It was done
  immediately afterwards — see part 2 below.**

- Feature 22, part 2 (the `registry/pro/` move, done after
  the tracker was first written): the remaining manual step
  is closed. `registry/text-fill-animation/` and
  `registry/webgl-image-trail/` moved to
  `registry/pro/<name>/`; six import sites updated
  (`app/docs/components/text-fill-animation/page.mdx`,
  `app/test-text-fill/page.tsx`, `app/test-webgl-trail/page.tsx`
  — twice, once for the deep `@/…/shaders` specifier —,
  `components/docs/preview-wrappers.tsx` and
  `components/landing/hero.tsx`). Nothing else in the tree
  referenced either directory.

  **THE TWO `@/components/ui/…` STRINGS IN THE PRO DOCS PAGES
  MUST NOT HAVE BEEN TOUCHED, and the grep that found the
  call sites is what makes that obvious.**
  `app/docs/components/{text-fill-animation,webgl-image-trail}/page.mdx`
  each contain BOTH `@/registry/<name>` (this repo's own
  source, which moves) and `@/components/ui/<name>` (the
  import path a USER ends up with after installing, which is
  dictated by the registry's `target`, not by where the
  source sits). A single blind
  `sed -i '' 's|registry/webgl-image-trail|registry/pro/webgl-image-trail|'`
  leaves both alone, so the bug is invisible in the diff —
  the second string simply stops being true. That the two
  corrected targets now make both documented paths resolve
  (`@/components/ui/webgl-image-trail` →
  `…/webgl-image-trail/index.ts` via the barrel,
  `@/components/ui/text-fill-animation` →
  `…/text-fill-animation.tsx`) is the check that the docs
  still tell the truth.

  `registry.json` still lists NO `index.ts` for
  `text-fill-animation`, and that is correct rather than an
  oversight: the barrel is only load-bearing when the module
  is a directory. `webgl-image-trail` needs it for exactly
  that reason; a single-file component resolves
  `@/components/ui/<name>` to its own `.tsx`, so shipping a
  barrel there would be a file nobody imports.

  VERIFY (all since deleted: the throwaway projects, the stub
  license server, the Python harness, the `next start` on port
  3111) —
  - **THE INVARIANT THAT WAS ACTUALLY BROKEN:** all 13
    `files[].path` values across all 9 components now exist on
    disk (0 missing), and no Pro directory is left outside
    `registry/pro/`.
  - **ALL 9 COMPONENTS INSTALL FROM A BARE CHECKOUT** —
    `DEADUI_REGISTRY_BASE_URL=/Volumes/Data/dead-ui`, no
    mirror, no stubbing of the registry: 9/9 "installed
    successfully", and **13/13 files byte-identical** to their
    repo sources (compared through `registry.json` rather than
    a hand-written path map, which is the mistake below).
    The license stub logged exactly **2** calls for the 9
    installs — one per Pro component, none for the 7 Free
    ones.
  - Blocking still holds against the real registry: invalid
    key, no-key-with-stdin-EOF, and an unreachable license
    server each exit 1 and write **0** files.
  - The installed tree is self-consistent: 10/10 relative
    imports resolve and both documented paths resolve.
  - App: `.next` deleted first so nothing stale could mask a
    bad import, then `npm run build` (all 18 routes
    `○ (Static)`), `npm run lint` clean, `tsc --noEmit` clean.
    `grep` over `.next/static` finds neither the old nor the
    new specifier, which is expected — module specifiers are
    resolved away at build time — so it is a staleness check
    only, not a resolution proof.
  - **RUNTIME, because 3 of the 6 call sites are CLIENT-ONLY
    `dynamic()` imports that a successful build does not
    fully prove.** 8/8 assertions via Playwright driving the
    system Chrome against `next start`: the landing hero
    mounts a live `<canvas>` (its `dynamic()` import of the
    moved trail), the webgl docs page mounts a playground
    canvas (the preview-wrapper adapter), and
    `/test-webgl-trail` mounts a canvas — that last one
    covering both the `dynamic()` barrel import AND the deep
    `@/registry/pro/webgl-image-trail/shaders` import in the
    same file. Zero console errors and zero page errors
    across all five pages. Prerendered HTML also checked per
    Pro page: one `<h1>`, the Pro badge, a real `<table>`,
    `pre.shiki` blocks and the playground sliders.

  HARNESS NOTES (additions to the part-1 list). `inner_text()`
  applies `text-transform`, so the Pro badge — which is
  `uppercase` — reads back as `PRO COMPONENT` and a
  case-sensitive `count("Pro Component")` reported a false
  FAIL. And when comparing installed output against the
  registry, derive the installed path from `registry.json`
  itself: hand-mapping `basename` → target invented a
  comparison for a `text-fill-animation/index.ts` the
  registry does not ship, and double-prefixing `src/` turned
  13/13 into 0/13. Both failures were in the harness, not the
  product — worth stating plainly because a harness that
  reports 0/13 on a working system is the kind of result that
  gets "fixed" by breaking something real.

- Feature 21 (feature spec `21-cli-init-command.md`): the CLI
  `init` command. Files: `packages/cli/src/commands/init.ts`
  (new, ~1050 lines — the spec's "Files to Create/Update"
  list names only `init.ts`, `index.ts` and this tracker, so
  all of the scanning/merging logic lives in `init.ts` rather
  than in new `utils/` modules), `packages/cli/src/index.ts`
  (+ the `init` registration and the import), this file.
  No new dependencies, no change to `install-deps.ts` or any
  other existing CLI file.

  THE SPEC'S TAILWIND INJECTION WOULD HAVE SILENTLY DROPPED
  THE ENTIRE DEAD UI PALETTE IN MOST REAL PROJECTS, so the
  injection is per-key rather than one block.
  The spec's MVP sketch is "find `theme: { extend: {` and
  inject the Dead UI colors and keyframes right after it",
  which produces:
  ```js
  theme: { extend: {
    colors: { dead: { /* …19 tokens… */ } },   // ← ours
    fontFamily: { sans: ['Inter'] },
    colors: { brand: { DEFAULT: '#0af' } },     // ← the user's, LAST
  } }
  ```
  Two `colors` keys in one object literal is a DUPLICATE
  property: JavaScript takes the last one, so the whole
  `dead` palette is thrown away and the user's existing
  `bg-brand` silently wins. Nothing errors; the project just
  compiles and every component renders unstyled. Any project
  that already defines colours in `extend` — which is most of
  them — hits this. So each of `colors` / `keyframes` /
  `animation` is merged into the user's OWN object when one
  exists (and an individual key is skipped when they already
  defined it), and a new property is only created when absent.
  Verified with a config carrying all three conflicts at once:
  `extend.colors` ends up as `{ dead: {…19}, brand: {…} }`,
  `extend.keyframes` as `{ marquee, marquee-vertical,
  gradient-rotate, gradient-pulse, wiggle }`, and the user's
  own `theme.colors` is untouched beside it.

  NO REGEX, THREE SCANNERS, BECAUSE A REGEX GETS THIS WRONG
  FOUR SEPARATE WAYS. Each fixture below produced a broken
  file with a naive `source.replace(/theme\s*:\s*\{/, …)`:
  1. **`import type { Config } from 'tailwindcss'`.** The
     spec says "use a simple regex to find `theme: { extend:
     {`", and its own example config is `import type {
     Config } from 'tailwindcss'` + `const config: Config =
     {`. A "first `{` wins" root detector picks the `{` of the
     IMPORT, and the entire theme block then lands inside the
     import statement — the file is destroyed. Caught on the
     first fixture run. Fixed by `looksLikeObjectLiteral`,
     which requires the `{` to be preceded by `=`,
     `export default`, or nothing at all (a tsconfig root).
  2. **A `{` inside a string or comment.** Every tailwind
     config carries `/** @type {import('tailwindcss').Config} */`
     directly above the object. The scanners therefore skip
     `//`, `/* */`, `'`, `"` and `` ` `` (with escapes) before
     matching anything, and compare keys as WHOLE identifiers,
     so `subTheme:` cannot match `theme`.
  3. **Nested braces.** The spec's `theme: { extend: {` string
     only works when `extend` sits immediately inside `theme`.
     A config with `theme: { colors: { red: 'red' } }` and no
     `extend` at all needs one CREATED; a config with no
     `theme` needs the whole `theme: { extend: { … } }`
     created. Finding `extend` inside `theme` needs brace
     matching to know where `theme` ends, which is why
     `findMatchingBrace` exists.
  4. **Index invalidation.** Creating `theme` shifts every
     byte after it, so an index for `extend` computed on the
     pre-edit string points into the wrong place. The first
     version returned an index from `locateExtend` and used it
     against the OLD string, and produced literal garbage
     (`  co` followed by an orphaned theme block). The
     function now returns `{ content, open }` and the two
     travel together.

  **`import type { Config }` ALSO TAUGHT ME THE tsconfig
  INJECTION HAS TO QUOTE ITS KEYS.** The same scanner had to
  match `"compilerOptions": {` in JSON as well as `theme: {` in
  JS, so it reads quoted keys too. The emitted keys then had to
  be quoted as well — and while verifying with the REAL
  `tsc --noEmit` on an initialised project, `tsc` answered
  `TS1327: String literal with double quotes expected` at
  `tsconfig.json(3,5)`. TypeScript's tsconfig parser is not
  JSON5: it tolerates comments and trailing commas but
  rejects a bare `paths: {`. `init` now emits `"paths": {`.
  This one is worth remembering because `JSON.parse` and
  `ts.parseConfigFileTextToJson` both ACCEPT the broken file —
  only `tsc` itself rejects it, so a JSON-level test suite
  passes while the project is unbuildable. The same run is
  what proved the fix: after it, `@/lib/utils` resolves in all
  five fixtures and a project with 8 installed components
  typechecks.

  THE INJECTED TOKEN BLOCK IS THE SPEC'S, PLUS THREE ADDITIONS
  THAT THE REGISTRY FORCES. Values are the Dead palette from
  `app/globals.css`; nothing is invented.
  1. **`dead` also carries the numeric scale + `red`.** Every
     shipped component styles itself with `bg-dead-950`,
     `text-dead-400`, `bg-dead-red`, `border-dead-800`,
     `text-dead-50`, `hover:bg-dead-400`, `hover:text-dead-50`
     — and the spec's nine semantic names generate NONE of
     those. Injecting the spec block alone gives a project
     where `npx deadui add marquee` installs cleanly and then
     renders unstyled. So `dead` now has all 19 keys. Raised
     as an Open Question rather than decided.
  2. **`marquee-vertical` keyframes + animation.**
     `registry/marquee` emits `animate-marquee-vertical` for
     `direction="vertical"`; the spec block defines only
     `marquee`, so half the marquee's API was undefined.
  3. **`--gb-duration` / `--gb-intensity`.** The spec writes
     `'gradient-rotate': 'gradient-rotate var(--duration, 4s)
     linear infinite'` and flat `gradient-pulse` keyframes,
     but `registry/gradient-border` publishes
     `--gb-duration` (from `speed`) and `--gb-intensity` (from
     `intensity`) inline. Emitted as
     `var(--duration, var(--gb-duration, 4s))` and
     `calc(0.4 * var(--gb-intensity, 1))` — a strict superset:
     with both variables unset the emitted strings are
     byte-identical to the spec's, and with them set the
     `speed` / `intensity` props stop being dead. The pulse
     case is the same class of bug `globals.css` already
     documents: a CSS animation outranks the inline `opacity`
     the component sets, so flat keyframes make `intensity` a
     no-op on `variant="pulsing"`.

  TAILWIND v4 GETS A STYLESHEET, NOT A CONFIG FILE. The spec's
  fallback is "if no Tailwind config is found, prompt the user
  or create a basic one" — but this repo is on Tailwind v4, a
  fresh `create-next-app` ships NO `tailwind.config.*` at all,
  and v4 ignores one unless a stylesheet opts back in with
  `@config`. Writing the spec's file into a v4 project would
  have been silently inert, which is also the exact shape of
  the spec's own verification step (a fresh Next.js app). So
  when there is no config AND the project is v4 (detected from
  `tailwindcss@^4` in package.json or `@import "tailwindcss"` /
  `@theme` in the stylesheet) AND a stylesheet entrypoint is
  found (`app/globals.css`, `src/app/globals.css`,
  `styles/globals.css`, `src/styles/globals.css`, `app/index.css`,
  `src/index.css`), `init` offers to append a `@theme static`
  block plus `@keyframes` and an `@layer utilities` block
  instead. Otherwise it offers to create the spec's
  `tailwind.config.ts`.
  The v4 animation utilities are PLAIN classes in
  `@layer utilities`, not `--animate-*` tokens, for the reason
  `globals.css` already records: v4 emits theme variables on
  `:root`, so a `var()` nested inside a `:root` custom property
  resolves against `:root` (where `--duration` is unset) and
  keeps the fallback instead of reading the animated element. A
  `prefers-reduced-motion: reduce` block ships with it, since
  code-standards makes that non-negotiable.

  EVERY NEW PROMPT IS A `confirm`, NEVER A `select`. The first
  draft used a 3-option `select` for the no-config branch. It
  never settles on piped stdin — `deadui init < /dev/null` and
  `printf 'n\n' | deadui init` both printed the menu and exited
  0 having written NOTHING, which is the same stdin-EOF race
  the Feature 17 and 18 notes record for
  `install-deps.ts` and the license prompt. Two chained
  `confirm`s behave correctly on a pipe and on a real TTY.
  The shared `installDependencies` race is untouched (it is
  Next Up item 2, and fixing it means editing a file this
  feature was scoped out of).

  VERIFY — `npm run build` in `packages/cli` (zero TS errors);
  root `npx tsc --noEmit` and `npm run lint` clean; root
  `npm run build` prerenders all 10 docs pages and all 10
  `/test-*` routes. Then live end-to-end runs of the built
  `dist/index.js` against throwaway projects (all since
  deleted):
  - **5 config shapes** (a `src/` project with
    `import type { Config }`, a comment containing `{` and the
    word `theme:`, and its own `colors` + `fontFamily` +
    `plugins` in `extend`; an ESM `module.exports` config with
    `theme` but no `extend` and all inline; an `.mjs` config
    with an empty `theme: {}` and a daisyui import; a config
    with NO `theme` at all; a Tailwind v4 project with no
    config). All 5 configs then EVALUATED and asserted: 19
  `dead` keys, the exact spec colour values, 4 keyframes, 4
  animations, and every user-authored key still present —
  **71/72 assertions**, the single "failure" being my own
  too-strict check that flagged `theme.colors` coexisting with
  `theme.extend.colors`, which is correct Tailwind semantics.
  - **THE TAILWIND BUILD ITSELF, not just the file.** Compiled
  the injected v3 config with real Tailwind 3.4.19 over a
    probe file: **13/13** utilities emitted with the right
    resolved values — `.bg-dead-950{background-color:rgb(9 9 11
    / …)}`, `.text-dead-400{color:rgb(161 161 170 / …)}`,
    `.bg-dead-red{…rgb(220 38 38…)}`,
    `.animate-marquee{animation:marquee var(--duration, 30s)
    linear infinite var(--direction, normal)}` — while the
    user's own `.bg-brand`, `.bg-mine-a`, `.text-mine-b` and
    `.animate-wiggle` still resolved. This is the check that
    matters: "the file parses" is not "the components are
    styled".
  - **TAILWIND v4, same treatment.** Compiled the injected
    `@theme`/CSS with `@tailwindcss/postcss`: **9/9** utilities
    emitted (`.bg-dead-950{background-color:var(--color-dead-950)}`,
    `.animate-gradient-pulse{animation-name:gradient-pulse;…}`),
    both keyframe sets in the output, the `prefers-reduced-motion`
    block present and unlayered, and no `--animate-*` token
    leaking a `var()` onto `:root`.
  - **IDEMPOTENCY: 3 consecutive runs per fixture, byte-for-byte
    identical by `shasum` of every file (5/5).** Second-run
    output is `• src/lib/utils.ts already exports cn().` /
    `• Dead UI theme tokens already present in
    tailwind.config.ts.` / `✓ Verified @/* path alias`.
  - **`init` → `add` → `tsc`.** A `src/` Next project, then 7
    free components installed from the local registry, then
    `tsc --noEmit` with real TypeScript 5.9.3: only ONE error,
    `Cannot find module '@/lib/animations'`, which is the
    registry gap in Next Up item 3. `add` regression: free
    installs and the `src/` prefix are unaffected.
  - **DEPENDENCY PROMPT, ACCEPT: `npm install` really ran** and
    `lucide-react ^1.51.0` landed in the test project's
    `dependencies`. DECLINE: install skipped, the rest of `init`
    still completes. All six present: no prompt at all.
  - **FAILURE PATHS.** No `package.json` → red `✗` + "Are you
    in a project directory?", exit 1 (success exits 0). No
    `tsconfig.json` → warning + the exact line to paste.
    `lib/utils.ts` present but with no `cn` export → warning +
    the snippet, and the file is left byte-identical (not
    appended to, since renaming their existing helper is their
    call).
  - **REAL TTY**, driven through a Python `pty.fork()` so the
    chained `confirm`s get an actual terminal: decline deps
    then accept the stylesheet write → exit 0, correct files.
  - SCREENSHOTS n/a (a terminal, not a browser).

  HARNESS NOTES. `printf 'n\n' |` only drives ONE `prompts`
  confirm reliably — a second one in the same run needs a real
  TTY, which is what exposed the `select` bug. `npx tsc`
  installs the deprecated `tsc` shim, not TypeScript; use the
  project's own `./node_modules/.bin/tsc`. Tailwind's content
  SCANNER finds nothing on this machine for a glob or for
  `{ raw, extension: 'tsx' }` (a hand-built baseline config
  emitted utilities fine, so it is the extractor, not the
  theme), so the two Tailwind proofs above feed the classes in
  via `{ raw, extension: 'html' }` and read the theme straight
  off the emitted CSS. And `/tmp` is a symlink to `/private/tmp`,
  which breaks `require`-based loads of things resolved
  through it — the Tailwind builds ran from a real directory.
  A JSON-level assertion would NOT have caught the tsconfig
  key-quoting bug; only `tsc` did.

- Feature 20 (feature spec `20-complete-documentation.md`): the
  last 8 docs pages. Files added:
  `app/docs/components/{magnetic-button,marquee,spotlight-card,
  scroll-scrub,staggered-grid,gradient-border,
  text-fill-animation,webgl-image-trail}/page.mdx` and
  `components/docs/preview-wrappers.tsx`. Modified: `next.config.ts`
  (+ `remark-gfm`), the two Pro pages, `package.json`,
  `context/progress-tracker.md` (this file).

  ONE FILE THE SPEC DID NOT ASK FOR, AND WHY IT IS NOT
  OPTIONAL. `ComponentCustomizer` is `'use client'` and takes the
  preview as a `component` PROP, so the function has to exist in
  a client module. `page.mdx` is a server component, and defining
  the adapter as an inline arrow in the MDX body fails the build:
  `Error: Functions cannot be passed directly to Client
  Components unless you explicitly expose it by marking it with
  "use server"`. So all 8 adapters live in one
  `'use client'` module and each page imports from it. Beyond the
  RSC boundary they absorb four real mismatches between the
  spec's config blocks and the components as built:
  1. **`select` options are `["true","false"]` strings, the
     props are booleans.** Radix renders nothing selected when
     `value` is not a string, so the four boolean selects
     (`pauseOnHover`, `enableTilt`, `pin`, `once`) open BLANK
     even though the prop is correct. `toBool` accepts both, so
     picking an option works; the closed trigger still reads
     empty. Left alone because the fix belongs in
     `ComponentCustomizer` (`String(value)`), which this feature
     was told not to touch.
  2. **Required `images`.** Both trails require `images`, which is
     not a `controls` type, so the wrapper passes a fixed
     six-image Picsum list.
  3. **`distortion` → `distortionStrength`.** The spec's WebGL
     config keys the slider `distortion`; Feature 15b renamed the
     prop. Renaming the docs key would have been quieter than the
     silent no-op, so the wrapper maps it.
  4. **`h-full` COLLAPSES IN THE CUSTOMIZER.** The trail previews
     get a fixed `h-[360px]`; `overflow-hidden` clips the trail to
     the panel. Likewise `StaggeredGrid` needs mock 3×3
     `StaggeredItem` children and `GradientBorder` needs padded
     children so the ring does not sit flush against the text.

  **A PRE-EXISTING BUG, NOT INTRODUCED HERE: NO MARKDOWN
  TABLES RENDERED ANYWHERE.** `next.config.ts` had
  `remarkPlugins: []`, and pipe tables are a GFM extension, not
  core markdown — so EVERY Props table in the docs, including the
  shipped `cinematic-text` page, was emitted as literal
  `| a | b |` paragraph text. Proof from the prerendered HTML:
  `grep -o "<table"` returned 0 on all ten pages. Since the spec
  template mandates a Props table, `remark-gfm@4` was added to
  `dependencies` (matching `rehype-slug` / `@shikijs/rehype`)
  and to `remarkPlugins` as a STRING, per the Turbopack rule
  already recorded in the Feature 19 notes. All 10 pages now
  render real `<table>` markup. Worth remembering that this was
  invisible in review because the source *reads* correctly.

  **SECOND REAL DEFECT, AND IT ONLY SHOWED ON THE TWO PRO
  PAGES.** MDX parses the CHILDREN of a top-level JSX block as
  markdown flow, so bare text inside a JSX `<div>` gets wrapped
  by the `p` mapping in `mdx-components.tsx`. That produced
  `<p class="mb-0"><p class="mt-4 leading-7 text-dead-200">` —
  a `<p>` inside a `<p>`, invalid HTML, which React reported as
  `Minified React error #418` and recovered from by re-rendering
  the whole tree on the client. The same injection was silently
  breaking the Pro badge: `<span>🔒</span> Pro Component` became
  `<p><span>🔒</span> Pro Component</p>`, so the badge's `gap-2`
  had ONE flex child instead of two and the lock emoji sat
  flush against the text. Both fixed by keeping the JSX children
  element-only (the badge is now two `<span>`s, the notice body
  is `<div>`s with `[&_p]:m-0 [&_p]:leading-7` to absorb the
  injected paragraph). Confirmed at the HTML level: nested-`<p>`
  count is 0 on all ten pages. Also note that an MDX ESM block
  must be CONTIGUOUS — a blank line plus a `/* */` comment after
  the `export const metadata` ends the ESM block and the
  remainder is parsed as markdown, which surfaced as
  `ReferenceError: MarqueePreview is not defined`.

  VERIFY: `npm run build` (zero TS errors; all 9 docs routes plus
  the 9 `/test-*` routes prerender `○ (Static)`) + `npm run
  lint` clean, then **129/130** browser assertions via a
  throwaway Playwright script (`verify_f20.py`) against
  `npm start`. Per page: one `h1`, Preview/Installation/Props
  headings, a real Props table, ≥1 `pre.shiki` block, the
  spec-exact control count, and a preview stage taller than
  100px. Across pages: 9 sidebar links and zero "Soon" rows;
  the Pro badge and a license-key notice on exactly the two Pro
  pages; live control changes proven against real behaviour
  (marquee `pauseOnHover` → the `animation-play-state` class is
  added/removed; scroll-scrub `pin` → the GSAP `.pin-spacer`
  appears and disappears; spotlight `enableTilt` → the
  `perspective` transform is added and removed; magnetic
  `variant` → `rgb(220, 38, 38)`; gradient `width` slider →
  `padding` 2px → 8px; text-fill `height` → the scroll range
  grows and GSAP `SplitText` produced >20 per-char spans);
  WebGL mounts a canvas with a live GL context after hydration;
  the DOM trail spawns >2 items on pointer movement and stays
  clipped inside its panel; install tabs switch npm → bun and the
  Pro command carries `--pro`; zero hydration mismatches and
  zero console errors.

  The one non-passing assertion was NOT a product defect. It
  read `--rotate-y` as `0deg` on spotlight-card and was a
  harness-sequencing artifact: toggling `enableTilt` off resets
  the component's inline `--rotate-*` style, and reading too
  soon after re-enabling caught the reset, not a live value.
  An isolated step-by-step probe settles it — the tilt tracks
  correctly (`--rotate-y` 1.39deg → 5.77deg across eight
  pointer steps, `transition-duration` `0s` while tracking), and
  `false → true` returns to `5.77deg`. `prefers-reduced-motion`
  was ruled out directly (`matchMedia('(prefers-reduced-motion:
  reduce)').matches === false` in headless Chrome), and it was
  re-checked under an explicit `reduced_motion="no-preference"`
  context in case the harness was the cause.

  Two behaviours are recorded rather than fixed, because both
  live in `ComponentCustomizer` and this feature was scoped out
  of it: the blank boolean selects above, and `<input
  type="color">` sanitising the `rgba(...)` defaults — the React
  value stays `rgba(239, 68, 68, 0.15)` / `rgba(255,255,255,
  0.2)` while the DOM input can only hold `#rrggbb`, so those two
  swatches show `#ef4444` / `#ffffff` and silently drop the
  alpha. A user dragging the spotlight alpha slider therefore
  cannot express the spec's default.

  Harness notes: a single `page.mouse.move()` to a point the
  pointer is already at dispatches nothing, so tilt checks need
  stepped moves; `get_by_role("combobox", name=...)` uses the
  `humanize`d label, so `pauseOnHover` is `"Pause On
  Hover"`, not `"Pauseonhover"`; `pre code` `.last` on a docs
  page is the Usage example, not the install command (scope to
  `[role="tabpanel"]:not([hidden])`); `#docs-content .grid`
  matches the docs layout too, so mock-grid counts must be
  scoped to `.grid.w-full.grid-cols-3`; and `.isolate > div`
  is the padding wrapper, not the rotating conic-gradient layer
  (`[aria-hidden="true"].animate-gradient-rotate`).

  Open placeholders unchanged: the Pro price ($99 one-time),
  the GitHub URL in `top-nav.tsx`, the two unpublished
  components (#9 parallax gallery, #10 card stack — both still
  "Soon"), and the 6 `npm audit` advisories. `remark-gfm`
  added no new advisories.

- Feature 19 (feature spec `19-docs-and-landing-page.md`):
  docs + landing. Files added: `mdx-components.tsx`,
  `app/docs/layout.tsx`, `app/docs/page.tsx`,
  `app/docs/components/cinematic-text/page.mdx`,
  `components/docs/{top-nav,sidebar,table-of-contents,
  component-customizer,install-tabs,copy-button}.tsx`,
  `components/landing/{hero,showcase,sections}.tsx`,
  `components/ui/{dialog,command,select,slider,tabs}.tsx`,
  `lib/docs-nav.ts`, `lib/docs-nav-server.ts`. Modified:
  `next.config.ts`, `app/page.tsx`, `app/globals.css`,
  `package.json`.

  Architecture change (recorded in architecture.md): the
  docs stack is native `@next/mdx`, not Nextra. Next 16
  specifics that cost time and are worth keeping:
  1. `@next/mdx` needs a root `mdx-components.tsx` for App
     Router. A `pageExtensions`-only change renders MDX as
     raw text.
  2. Under Turbopack, MDX pipeline entries must be given as
     STRINGS (`"rehype-slug"`, `"@shikijs/rehype"`), not
     imported plugin objects — Turbopack has no `require`
     hook to load them.
  3. `rehype-slug` runs before Shiki so heading `id`s
     survive; the TOC depends entirely on those `id`s.

  Tokens: the spec referenced `dead-surface` and
  `dead-elevated`, which do not exist in `globals.css`.
  Adapted to the real palette (`dead-900` / `dead-800`) and
  documented here rather than inventing new theme tokens
  for two surfaces.

  Customizer: `defaultProps` must list every prop a
  control edits. The cinematic-text page initially controlled
  `stagger` and `splitBy` without declaring them, so the
  stagger slider started at its `min` (0) instead of the
  component's real default (0.05) and the splitBy select
  showed nothing selected — the UI disagreed with what a
  user gets on install. Both were added to `defaultProps`.

  Four real defects found by browser automation, all fixed:
  1. **Copy button never copied anything.** `CopyButton` read
     its text via `button.closest('pre')`, but the button is
     a SIBLING of the `<pre>` (inside the shared
     `group relative` wrapper), and `closest()` only walks
     ancestors — so it returned `null`, the handler
     returned early, and the button silently did nothing.
     Now reads `parentElement.querySelector('pre')`. Also
     added an `execCommand` fallback for insecure origins.
  2. **Sliders had no accessible name.** `aria-label` was
     passed to `Slider` and landed on the Root, which is a
     role-less `span`; `role="slider"` is on the Thumb, which
     had nothing. The wrapper now forwards the label to the
     Thumb.
  3. **⌘K could not find 8 of 9 components.** The palette
     filtered its items to those with a docs page, so
     searching any undocumented component returned the empty
     state. All components are now listed; those without a
     page render as disabled "Soon" rows, which keeps them
     discoverable while making a 404 unreachable.
  4. **⌘K search returned nonsense results.** cmdk's
     built-in filter is a fuzzy SUBSEQUENCE matcher, so
     "marquee" also matched "Scroll-Linked Media Scrub"
     (m-a-r from "media", q from "scrubbing", …) and
     "reveal" matched 4 of 9 components. Replaced with a
     word-prefix scorer (`scoreMatch` in `top-nav.tsx`)
     threaded through a new `filter` prop on
     `CommandDialog`: every query word must prefix-match a
     word in the value, exact-word and early hits rank
     higher.

  Verification: `npm run build` (zero TS errors, docs page
  prerendered static) + `npm run lint` clean, then **75/75**
  browser assertions via a throwaway Playwright script
  (`verify_docs.py`), covering landing (hero canvas, showcase
  idle/hover/unhover, pricing, CLI terminal), docs shell
  (sidebar groups + tiers, `aria-current`, TOC entries +
  scroll-spy), Shiki output (`pre.shiki`, `rgb(16,16,16)`,
  25 coloured tokens), both copy buttons (clipboard contents
  + `data-copied` confirm + reset), the customizer
  (2 sliders / 2 selects, live readout, `aria-valuenow`,
  clamp at max, split-by `chars`→`words` re-split, variant
  change re-animating mid-flight at opacity 0.52), install
  tabs, and ⌘K (open, focus, exact search results, empty
  state, Escape, navigation). Zero uncaught page errors, zero
  console errors. A second pass (`verify_layout.py`) asserted
  no horizontal overflow and no element past the right edge
  at 1440px AND 390px on three routes, non-overlapping
  sidebar/main/TOC boxes, and exactly one `h1`.

  Harness traps hit along the way (all false failures, worth
  remembering): `force=True` on `.click()` skips
  scroll-into-view, so the click landed outside the viewport
  and did nothing; a locator pinned to
  `aria-label="Copy code"` silently re-resolves to a
  DIFFERENT button after the first copy flips the label to
  "Copied"; `inner_text()` returns the CSS
  `text-transform`ed text, so `uppercase` headings must be
  compared case-insensitively; and `aside li` also matches
  the table of contents, so sidebar counts must be scoped to
  the first `aside`. Playwright's bundled Chromium is absent
  on this machine — `p.chromium.launch(channel="chrome")`
  uses system Chrome instead. This model cannot read
  screenshots, so every visual claim above rests on DOM/pixel
  assertions rather than on looking at the image.

  Open placeholders carried into the tracker: the Pro price
  ($99 one-time), the GitHub URL
  (`https://github.com/yourusername/deadui` in
  `top-nav.tsx`), and 8 components that still have no
  `page.mdx`. `npm install` also reports 6 audit advisories
  (5 high, 1 critical); not addressed here because
  `npm audit fix --force` would force major downgrades.

- Feature 18 (feature spec `18-pro-license-validation.md`):
  the Pro gate. Zero cost, five files, one env var.
  - `app/api/validate-license/route.ts` (new)
  - `.env.local` (new, gitignored) + `.env.example` (new,
    commit-safe, with `!.env.example` added to `.gitignore`
    because the existing `.env*` rule also matched it)
  - `packages/cli/src/utils/validate-license.ts` (new)
  - `packages/cli/src/commands/add.ts` (Pro branch
    replaced)
  - `context/progress-tracker.md` (this file)

  SPEC CODE KEPT WHERE IT WAS RIGHT. The route is the
  spec's handler almost verbatim: `POST` only, split the
  env var on `,`, `includes`, and the same three outcomes
  (200 valid / 400 no key / 403 invalid / 500 unexpected).
  It is Next 16's ordinary Route Handler — `export async
  function POST(request: Request)` plus `NextResponse` —
  with no route-segment config needed, because POST is
  never cached (`ƒ (Dynamic)` in the build output).

  FOUR THINGS THE SPEC'S SNIPPET WOULD HAVE GOT WRONG.
  1. `if (!key)` accepts `{}` AND `{"key": 0}` AND
     `{"key": []}`; only `typeof key === 'string'` plus a
     non-empty trim is a key at all. Anything else is a
     400.
  2. `await request.json()` THROWS on a malformed body,
     so the spec's single try/catch answered a client
     mistake with 500 "Server error". There is now an
     inner try/catch returning 400 "Invalid JSON body";
     the outer one is still there for genuinely
     unexpected failures.
  3. `.split(',')` with no trim means
     `VALID_LICENSE_KEYS="a, b"` rejects `b`, and a
     trailing comma injects `''` as a valid key — anyone
     could then validate with an empty string. Entries are
     trimmed and empties dropped.
  4. The route compares the raw key while the CLI trims
     what a user pasted, so both trim. Neither echoes the
     key or the key list back; verified that the only
     strings in any response are the two known keys'
     owners' `valid` flag and a fixed message.

  `validateLicense()` IS STILL EXPORTED WITH THE SPEC'S
  `Promise<boolean>` SIGNATURE, but `add.ts` uses a second
  export, `checkLicense()`, which returns
  `{ valid: true } | { valid: false, reason }`. The
  reason exists because the spec collapses "the server said
  no" and "the server could not be reached" into one
  `false`: the caller would then tell an offline user their
  license is invalid, which is both wrong and unfriendly.
  Same split as the Feature 17 HTTP-status handling.
  `validateLicense` keeps the spec's own behaviour (print
  the connection error, return false) for any other
  caller.

  `DEADUI_API_URL` FOLLOWS THE `DEADUI_REGISTRY_BASE_URL`
  PATTERN — exported `DEFAULT_API_BASE_URL`, a
  `getApiBaseUrl()` that reads the env at CALL time (the
  spec's module-level const would have been read at import
  time, before anything could set it in-process) and
  strips a trailing slash. The default
  `https://deadui.dev` is still a placeholder and must be
  confirmed before publishing; the validation runs could
  not have been done against it.

  THE PROMPT IS A `password` TYPE, SO THE KEY IS MASKED.
  A license key is a credential and the install often
  happens on a shared terminal or in a screen recording.
  Cost: a user who mistypes cannot see what they typed.

  THE REAL BUG, AND IT WOULD HAVE BEEN A SILENT SUCCESS:
  `await prompts(...)` NEVER SETTLES when stdin is closed
  and nothing is piped in (the Feature 17 notes record this
  for the dependency prompt). The Pro gate inherits it, and
  here it is much worse — a bare
  `npx deadui add text-fill-animation < /dev/null` in a CI
  step printed the prompt and exited **0**, i.e. "success"
  for a Pro install that never validated a key or wrote a
  file. Proved with a standalone probe: `settled = false`
  after the call and after a 1s timer, so Node drains the
  event loop and exits with the default code.
  `promptLicenseKey()` now races the prompt against
  `process.stdin.once('end' | 'error')` and resolves to an
  empty key, which flows into the existing "No license key
  provided" exit 1. A piped answer still wins the race
  (verified: `printf 'abc\n'` resolves `"abc"`), an empty
  line resolves `''`, and Ctrl+C resolves `''` via the
  `prompts` rejection. Same stdin-EOF race still owed to
  `install-deps.ts` — listed under Next Up, not done here.

  A 10s `AbortSignal.timeout` guards the fetch. Without it
  a hung endpoint (or a captive-portal proxy that accepts
  the connection and never answers) would hang the CLI
  forever; measured at 10.0s against a local server that
  accepts and never replies.

  VERIFY — `npm run build` (tsc) clean and `npm run lint`
  clean in BOTH `packages/cli` and the root app; `npx tsc
  --noEmit` clean; `next build` reports
  `ƒ /api/validate-license`.

  API route, 7 live curl cases against `next dev`
  (`VALID_LICENSE_KEYS="test-key-123,deadui-founder-001"`):
  - `test-key-123` → 200 `{"valid":true,"message":"License
    validated"}`
  - `deadui-founder-001` → 200 (so the split works for
    every key, not just the first)
  - `nope` → 403 `{"valid":false,"message":"Invalid
    license key"}`
  - `{}`, `{"key":"   "}`, `{"key":123}` → 400 "No key
    provided"
  - body `not-json` → 400 "Invalid JSON body"
  - `GET` → 405 (Next's own handling; the route exports
    POST only)
  - grepped every response body for the second key: 0
    hits. The valid-key list never leaves the server.

  CLI, 11 end-to-end runs of the built `dist/index.js` in a
  throwaway `/tmp` project (`DEADUI_REGISTRY_BASE_URL` at
  the repo root, `DEADUI_API_URL=http://localhost:3000`,
  since deleted):
  - `--token test-key-123` (valid) → `✓ License validated.`
    + `🎉 … license verified.` + the "Pro file delivery
    ships in the next CLI release — nothing was written yet"
    placeholder, exit 0. Confirmed `find` shows **no**
    files created: the Pro branch returns before any write.
  - `--token wrong-key-999` → `✗ Invalid license key.` +
    purchase link, exit 1, nothing written.
  - Interactive, piped `deadui-founder-001` → validated,
    exit 0. Piped `bad-key-000` → invalid, exit 1.
  - Interactive, empty line → `✗ No license key provided.`
    + "Re-run with --token <key> to skip this prompt.",
    exit 1.
  - Interactive with stdin CLOSED → now exit 1 with that
    same message (was exit 0 before the stdin-EOF race).
  - REAL TTY, driven through a Python `pty.fork()` so the
    prompt gets an actual terminal: the key is echoed as
    `*` and never in the clear; valid → exit 0, invalid →
    exit 1. A TTY run with `--token` contains no prompt at
    all (grep: 0 hits for the prompt text), so the flag
    genuinely skips the interactive path.
  - Network failure, closed port AND unresolvable host →
    `✗ Failed to connect to license server. Check your
    internet connection.` exit 1 (never "Invalid license
    key", which is the whole point of the reason split).
  - Hanging server → same message at 10s, exit 1.
  - Free-component regression (`add marquee`, dependencies
    declined): prompt, files, `🎉 … installed successfully!`,
    exit 0 — and `DEADUI_API_URL` was pointed at a dead
    port for that run, proving Free installs never touch the
    license server.
  SCREENSHOTS n/a (a terminal, not a browser).

  NOT DONE, BY DESIGN: no Pro file is fetched, written or
  even previewed after a successful validation. Key storage
  is a hand-edited env var, keys are unbounded and
  unrevocable per-user, comparison is `includes` (no
  timing-safe compare — irrelevant at this scale but wrong
  if the list ever gets long), and there is no rate
  limiting on the endpoint, so it is a free brute-force
  oracle for key-space guessing. Fine for a handful of
  hand-issued keys, not fine at volume.

- Feature 17 (feature spec `17-cli-registry-fetch.md`): the
  CLI registry-fetch logic — the first session to make
  `npx deadui@latest add <name>` actually install anything.
  Files (all four were placeholders except the rewritten
  command):
  - `packages/cli/src/utils/fetch-registry.ts` — native
    `fetch` (Node 18+; Next.js already requires it, so
    `node-fetch` was deliberately NOT added despite the spec
    listing it in its dependency block — the spec's own note
    and Constraints section override the block).
  - `packages/cli/src/utils/detect-framework.ts`
  - `packages/cli/src/utils/install-deps.ts`
  - `packages/cli/src/commands/add.ts` — full rewrite.

  THE GITHUB URL. `DEFAULT_REGISTRY_BASE_URL` is the
  spec's literal
  `https://raw.githubusercontent.com/yourusername/deadui/main`
  with a `TODO`-style comment saying it must be replaced
  before publishing. The spec's Constraints ask for the URL
  to be "easily configurable", so it is also overridable at
  runtime via `DEADUI_REGISTRY_BASE_URL`, which is what made
  the end-to-end tests below possible at all (a placeholder
  URL 404s, so nothing could be verified against it). Any
  NON-`http(s)` value is treated as a local directory and
  file paths from the registry are resolved against it —
  that is the spec's suggested "fallback to reading the
  local file if the URL fails", expressed as an explicit
  opt-in rather than a silent retry, so a genuine network
  failure can never be mistaken for a local read.

  `fetchRegistry` VALIDATES before returning rather than
  trusting the parse: a 200 that is not JSON, or JSON with
  no `components` array, would otherwise surface as
  `Cannot read properties of undefined (reading 'find')`
  several frames later, in `add.ts`, with the real cause
  thousands of characters away.

  TYPED, NOT `any`. The spec's `add.ts` example annotates
  the parsed registry as `any` in six places. code-standards
  forbids `any`, so `fetch-registry.ts` exports
  `Registry` / `RegistryComponent` / `RegistryFile` and
  `add.ts` uses them throughout. Nothing else in the flow
  needed a type: `packageJson` is narrowed to a
  `UserPackageJson` shape, and `detectFramework` returns a
  `FrameworkInfo` interface. Note the spec's
  `component.dependencies.filter(...)` is unguarded — the
  registry does always carry the key today, but a `?? []`
  costs nothing and an absent key would crash the install.

  `detect-framework.ts` CHECKS MORE EXTENSIONS THAN THE
  SPEC LISTS, not because the spec's two (`next.config.js`
  / `.ts`, `vite.config.ts`) are wrong but because they
  miss the two forms each tool actually ships most often
  today — `.mjs` for ESM `type: module` packages and `.cjs`
  / `.mts` for the rest. A Next 16 `create-next-app` project
  is ESM-first, so the two-file list would have reported
  "Generic" for a real Next project. `isNext` / `isVite` /
  `hasSrc` / `componentDir` / `libDir` are unchanged, so
  `add.ts` is unaffected.

  THE `src/` REWRITE IS DELIBERATELY ONLY TWO PREFIXES.
  The spec's `resolveTargetPath` rewrites `components/` →
  `src/components/` and `lib/` → `src/lib/`, and nothing
  else. That is what is implemented. It is worth flagging
  because the live registry has a target the spec's rules do
  NOT cover: `text-fill-animation` ships
  `styles/text-fill-animation.module.css`, which therefore
  lands at `<root>/styles/` even in a `src/` project, and
  `architecture.md`'s own registry example uses a `hooks/`
  target that would behave the same way. Neither is a bug
  in the code — it is exactly the specified behaviour — but
  a future spec revision should decide whether those two
  prefixes are src-relative too, because the CSS import in
  the component will not resolve next to a
  `src/`-scoped `components/ui/` file. Nothing in this
  session was changed for it, since widening the rewrite is a
  spec change, not an implementation one.

  `prompts` HAS ONE BEHAVIOUR WORTH WRITING DOWN: with
  stdin CLOSED but no answer written (e.g. a bare
  `node dist/index.js add x < /dev/null`, or a CI step), the
  prompt does not resolve to `false` — the process exits
  mid-install with the files never written. Piping an actual
  answer (`printf 'n\n' | …`) works correctly and is how
  the tests below drive it. Not worked around: the spec's
  prompt is a hard gate before writing files, and skipping
  it non-interactively is a design decision for the Pro /
  CI story, not a bug in this utility.

  VERIFY: `npm run build` in `packages/cli` — zero
  TypeScript errors. Then live end-to-end runs of the built
  `dist/index.js` in throwaway `/tmp` projects (all since
  deleted), with `DEADUI_REGISTRY_BASE_URL` pointed at the
  repo root:
  - `src/` project (`next.config.ts`): `add marquee` →
    `src/components/ui/marquee.tsx`. The `src/` prepend is
    real, not cosmetic.
  - no-`src/` project (`vite.config.ts`): `add
    cinematic-text` → `components/ui/cinematic-text.tsx`.
  - `src/` project, 3-file component with a NESTED target
    (`webgl-image-trail --token …`): wrote
    `src/components/ui/webgl-image-trail.tsx` plus
    `src/components/ui/webgl-image-trail/{image-plane,shaders}.ts`
    — intermediate dirs created via `fs.mkdir(recursive)`.
  - Installed file is BYTE-IDENTICAL to the registry source
    (`diff` clean on `shaders.ts`).
  - Dependency prompt, DECLINE: `gsap` reported missing,
    install skipped with the spec's message, files still
    written.
  - Dependency prompt, ACCEPT: `npm install gsap` really
    ran and `gsap` landed in the test project's
    `dependencies`.
  - Already-satisfied deps produce NO prompt at all
    (`marquee` into a project with clsx / tailwind-merge /
    cva installed was silent).
  - `add does-not-exist` → red `✗` + the full
    comma-separated list of the 9 available components,
    exit 1, no crash, no partial write.
  - `add webgl-image-trail` without `--token` → the spec's
    Pro message + purchase link, exit 1.
  - No `package.json` in cwd → red `✗` + "Are you in a
    project directory?", exit 1.
  - Unreachable registry URL → red `✗` + the HTTP status on
    a dim second line, exit 1 (this is what the placeholder
    URL does today: `HTTP 404 Not Found`).
  - The REMOTE path was proven independently of the local
    fallback by pointing `DEADUI_REGISTRY_BASE_URL` at a
    real public raw URL and parsing the response — native
    `fetch` against `raw.githubusercontent.com` works, so
    the only thing standing between this and a working
    release is the repo coordinates.
  SCREENSHOTS n/a (a terminal, not a browser).

- Feature 16 (feature spec `16-css-image-trail.md`): the CSS
  Image Trail Effects — the Free-tier, DOM-based companion to
  the WebGL trail (Component #8 / 8b). Files:
  - `registry/image-trail/image-trail.tsx` — `'use client'`;
    spec-exact `imageTrailVariants` cva (base `fixed top-0
    left-0 pointer-events-none will-change-transform` + empty
    `variants`/`defaultVariants` per spec) and spec-exact
    `ImageTrailProps` (`images`, `effect` 'fade-scale',
    `trailSize` 6, `velocityThreshold` 15, `spawnRate` 50,
    `imageSize` 120, `duration` 0.8, `borderRadius`
    'rounded-lg'). Exports `TrailEffect`, `TRAIL_EFFECTS`,
    `EFFECT_VARIANTS`, `TrailEffectDefinition`, `TrailItem`.
  - `registry/image-trail/index.ts` — barrel.
  - `registry.json` — added `image-trail` before
    `webgl-image-trail`: `tier: "free"`, `dependencies:
    ["motion", "clsx", "tailwind-merge",
    "class-variance-authority"]`, tsx →
    `components/ui/image-trail.tsx`, `variants: []` (the
    spec's cva has none, same as the two Pro entries) plus a
    six-entry `effects` array, mirroring how 15b recorded
    the WebGL trail's shader effects.
  - `app/test-image-trail/page.tsx` — `'use client'` page.

  THE CVA GOES ON THE TRAIL ITEM, NOT THE CONTAINER. The
  spec's cva base is `fixed top-0 left-0`, which is a
  description of a trail IMAGE (`pointer-events-none` and
  `will-change-transform` are both item concerns) and the
  spec's own example never applies it — it hands the
  container `cn('relative w-full h-full overflow-hidden')`
  instead. Applying it to the container would take the stage
  out of flow entirely and collapse it to the size of its
  (empty) content box, so it is applied to the item with
  `cn(imageTrailVariants(), 'absolute overflow-hidden',
  borderRadius)`; twMerge resolves `position` to `absolute`,
  which is what puts the item in the container's padding box
  where `overflow-hidden` can clip it. The cva string itself
  is spec-verbatim. Verified in-browser: the item computes
  `position: absolute`, `will-change: transform`,
  `pointer-events: none`.

  THE TIMESTAMP CLEANUP, AND WHY THERE IS NO
  `AnimatePresence`. Each spawn pushes
  `{ id, x, y, imageIndex, timestamp }` into state and runs
  its animation to completion on its own. A single 50ms
  interval (the spec's "e.g. every 50ms") filters the queue
  down to `now - item.timestamp < duration * 1000` and
  slices it back to `trailSize`. Three properties make this
  cheap:
  1. The lifetime IS the animation duration, so an item is
     only ever unmounted at `duration` or later — React never
     interrupts a running animation, and there is no exit
     animation to pay for. `AnimatePresence` would have to
     diff the children list on every commit AND hold a
     finished node alive for a second pass; at up to 20
     spawns a second (`1 / spawnRate`) that reconciliation is
     the most expensive thing on the page.
  2. The sweep returns the PREVIOUS array untouched when
     nothing expired, so a page whose pointer has not moved
     commits nothing at all. (Measured: a stationary page
     registers no new work over 700ms.)
  3. The filter runs over at most `trailSize` elements, so
     the per-tick cost is bounded by the prop the caller set,
     not by how long the page has been open.
  The spawn path ALSO slices to `trailSize` on every push, so
  the queue is bounded at both ends — and the sweep enforces
  the cap too, which is what makes dragging the `trailSize`
  slider DOWN shrink a live trail immediately instead of
  waiting for the next spawn (measured 10 → 2 with the
  pointer stationary).

  `velocityThreshold` WAS NOT A THRESHOLD IN THE SPEC'S
  EXAMPLE. The spec advances `lastMouse` only INSIDE the
  spawn branch, so `distance` accumulates from the last
  SPAWN rather than from the last EVENT: a pointer creeping 2px
  per event grows the distance without bound and crosses any
  threshold within a second or two. The pointer ref is now
  advanced on every event, before the test. Because the spec
  uses that one ref for the `spawnRate` gate as well, and
  advancing it unconditionally would make `now - lastMouse.time`
  the time since the last EVENT (i.e. always < `spawnRate`, so
  nothing would ever spawn), the two clocks are split into two
  refs: `pointerRef` (position, event clock) and
  `lastSpawnRef` (spawn clock). Verified: a 2px-per-event
  creep spawns 0 items at `velocityThreshold={80}` and 10 at
  `0`, and a stationary pointer spawns nothing at all.

  THE REAL BUG: `transformPerspective: 800` DOES NOTHING.
  The spec's dictionary puts it in the trail item's `style`
  and its note says the effect "requires transformPerspective:
  800 on the parent or element". Neither half survives
  contact with a browser, and the harness caught it (the
  computed `transform` came back a plain `matrix3d` with no
  perspective in it). Measured in Chrome:
  * On the ELEMENT it is inert. `transform-perspective` is a
    CSS Transforms 2 property Blink has never shipped: React
    writes it, but `getComputedStyle(el).transformPerspective`
    comes back EMPTY and the resolved matrix3d is
    byte-identical to the same rotation with no perspective.
    (The standalone `perspective` property is no use either —
    it applies to an element's CHILDREN, not its own
    transform; measured.)
  * Motion would drop it anyway. `scrapeMotionValuesFromProps`
    only lifts a `style` key into `latestValues` when the
    value is a `MotionValue` or a forced motion value, and
    `buildTransform` reads the perspective from
    `latestValues.transformPerspective` — so a plain `800`
    never reaches the transform string even in an engine that
    does implement the property.
  FIXED THE WAY THE SPEC'S OWN NOTE ALLOWS ("on the
  parent"), which is also what the Codrops demo does
  (`.trail { perspective: 800px }`): the number stays where
  the spec puts it — the definition is the single source of
  truth — and the component reads it back off the ACTIVE
  definition to give the container `perspective: 800px`. The
  other five effects declare no perspective and get none.
  Verified: computed container `perspective` is `800px` for
  `3d-rotate` and `none` for all five others, the item emits
  a real `matrix3d`, and the `3d-rotate` crop is 9.6-12.1
  mean-abs away from every other effect against a 0.00 drift
  floor. A caller who genuinely wants a per-item perspective
  (not a stage-centred one) is out of luck until Motion
  accepts a `MotionValue` there; that would be a prop change
  the 16 spec does not authorise, so it was not taken.

  A SECOND REAL BUG, IN THE TEST PAGE: the control panel was
  taller than a 720px viewport, so its Reset / Unmount row fell
  off the bottom of the screen and could not be clicked at all
  (Playwright: "element is outside of the viewport"). The
  panel now carries `max-h-[calc(100vh-2rem)] overflow-y-auto
  overscroll-contain`, which is a functional fix, not polish.

  OTHER ADAPTATIONS vs the spec (all behaviour-preserving,
  all forced by real-React / real-browser reality):
  1. `Record<TrailEffect, any>` → `TrailEffectDefinition`
     (`initial: TargetAndTransition`, `animate:
     TargetAndTransition`, `style?: MotionStyle`). No `any`
     in a public API (code-standards), and the shape is the
     spec's own `{ initial, animate, style }`. `MotionStyle`
     rather than `React.CSSProperties` because
     `transform-perspective` is not in csstype at all (see
     above) — and `MotionStyle` is the exact type of the
     `style` prop the object is spread into, so it typechecks
     with no cast.
  2. Item ids come from a monotonic counter, not
     `performance.now()` as in the spec's sketch (which
     collides at sub-millisecond rates), and
     `imageIndexRef` is advanced OUTSIDE the `setTrailItems`
     updater so a StrictMode replay cannot skip an image
     (same reasoning as Feature 15/15b).
  3. `onMouseMove` and `style` are destructured out of
     `...props` and composed/re-applied, because `{...props}`
     is spread last and a caller's own handler would otherwise
     silently delete the trail (the same trap Feature 15
     fixed for `style`).
  4. `getBoundingClientRect()` is read AFTER the cheap gates
     rather than before. It is the only layout read on the hot
     path and there is no reason to pay for it on an event
     that cannot spawn.
  5. `alt=""` + `aria-hidden` on the item instead of the
     spec's `alt="trail"`. A trail repeats the same decorative
     photo up to `trailSize` times and spawns up to 20 times a
     second; announcing "trail" per spawn is noise, and
     Feature 11 set the precedent for marking decorative
     layers hidden.
  6. A plain `<img>`, not `next/image` (one documented
     `eslint-disable`): `images` is a caller-supplied list of
     arbitrary URLs and `next/image` would reject every host
     absent from `remotePatterns`, and it applies its own
     inline styles — which is exactly what the parent
     animates.
  7. Reduced motion stops the trail entirely and renders a
     one-line explanation, via `useSyncExternalStore` over
     `matchMedia` with an explicit server snapshot. The
     spec has no `fallbackText` prop and none was invented.
     `useReducedMotion()` was rejected: it seeds its state
     from a module-level flag that is `null` on the server and
     filled in on the first client render, so a reduced-motion
     browser would hydrate a different tree than the server
     sent. Verified: 0 items and the message present under
     `reduced_motion="reduce"`, 0 page errors, and the SSR
     payload still contains all six `<option>`s and zero trail
     items.

  VERIFY: `npm run build` zero TS errors, `npm run lint`
  clean, and automated Playwright/Chrome (headless, system
  Chrome via `channel="chrome"`): **96/96 assertions PASS**.
  - RENDER: stage is `position: relative` + `overflow: hidden`
    and fills 1280x720 exactly; 0 items before the pointer
    moves; 6 `<option>`s in the Select; 3 range sliders; all 6
    Unsplash images decode (naturalWidth 800 each).
  - SPAWN + FOLLOW: a real trusted `page.mouse` sweep spawns,
    and the newest item's `left`/`top` equal the delivered
    `clientX/Y` minus exactly `imageSize / 2` (cursor 640,400
    → `left: 580px, top: 340px, width/height: 120px`).
  - SIX EFFECTS, COMPUTED: every pair differs on its
    GEOMETRY (transform / clip-path / filter) — opacity alone
    is not evidence, since two spawns sampled a few ms apart
    always have slightly different fade phases.
    `3d-rotate` emits `matrix3d`; `clip-circle` walks
    `circle(50% at 50% 50%)` down to `circle(32.9% at 50%
    50%)`; `blur-fade` grows `blur(0px)` → `blur(2.70px)` and
    leaves `clip-path` at `none`; `fade-scale` is transform +
    opacity only; `rotate-scale` is a rotated `matrix`;
    `skew-fade` is a sheared `matrix`.
  - SIX EFFECTS, PIXELS: all 15 pairs are distinct on a 200x200
    crop of one identically-aged spawn of the SAME photograph
    (fresh page per effect so the image index matches):
    mean-abs 6.50-19.15 against a 0.00 drift floor.
  - `trailSize`: peak DOM items is EXACTLY 2, 3 and 8 for
    those three slider values, and lowering the slider trims a
    live 10-item trail to 2 with the pointer stationary.
  - `velocityThreshold`: a 2px-per-event creep gives 0 items
    at 80 and peak 10 at 0; a still pointer gives 0 and never
    re-spawns.
  - `duration`: 0.3s → 0 items 0.9s after the last spawn;
    2.6s → 7 items still alive 1.2s after.
  - POINTER EVENTS: item and `<img>` both compute
    `pointer-events: none` (and the img `user-select: none`,
    `draggable="false"`). A button parked UNDER a live trail
    item is what `document.elementFromPoint` returns at that
    point, and a real `page.mouse.click` there increments the
    button's counter.
  - CLEANUP: 1 interval outstanding while mounted, 0 after
    unmount, and 4 mount/unmount cycles leave `created ==
    cleared == 19`, 0 outstanding (handles tracked by identity
    in a `Set`, so a foreign `setInterval` from dev HMR cannot
    skew the balance). Every item prunes back to an empty
    queue; the 6 images cycle (6 distinct `src` in one
    trail).
  - PERFORMANCE — 20s of continuous movement driven ENTIRELY
    in-page (no CDP chatter): 366 spawns, peak exactly 12
    items, 2400 frames, median 8.3ms / p95 9.9ms / worst
    10.4ms, **0 frames over 32ms, 0 long tasks**; the queue
    drains to empty afterwards. Same again for 20s with the
    effect switched 114 times underneath the movement: 2403
    frames, median 8.3ms / p95 10.1ms / worst 10.4ms, 0 over
    32ms, 0 long tasks. A rapid real-input burst (120
    `page.mouse.move` in 1.3s): p95 9.9ms, worst 10.3ms, 0
    long tasks.
  - SSR: all six `<option value="...">`s are in the server
    payload and the stage ships with zero trail items.
  - Zero console errors and zero page errors across the run.
  SCREENSHOTS captured to the temp dir (this model cannot
  render images), one mid-flight comet per effect plus a 3x2
  six-up; the pixel-delta numbers above are the actual visual
  confirmation.
- Feature 15b (feature spec `15b-webgl-image-trail-multi-effect.md`):
  the WebGL Image Trail Multi-Effect Upgrade — a rename plus four
  switchable GLSL effects and a tint. Files:
  - `registry/webgl-image-trail/shaders.ts` (renamed from
    `trail-shader.ts`) — the spec's `shaders` dictionary, verbatim: one
    shared `VERTEX` pass-through and four fragment shaders with the
    exact math from the spec, each applying
    `color.rgb = mix(color.rgb, uTintColor, 0.3)`. Also exports
    `TrailEffect`, `TrailShader` and `TRAIL_EFFECTS`.
  - `registry/webgl-image-trail/image-plane.tsx` — `ImagePlane`
    (renamed from `TrailImage`). Selects `shaders[effect]`, takes the
    full superset, and writes all of it to the material in `useFrame`.
  - `registry/webgl-image-trail/webgl-image-trail.tsx` — the five new
    props threaded through `TrailScene` to `ImagePlane`.
  - `app/test-webgl-trail/page.tsx` — effect `<select>`, conditional
    sliders driven by an `EFFECT_UNIFORMS` map, and an
    `<input type="color">` for `tintColor`.

  THE RENAME. The 15b spec addresses the component as
  `registry/webgl-image-trail/webgl-image-trail.tsx` with
  `WebGLImageTrailProps` / `ImagePlane` and the test page at
  `app/test-webgl-trail/page.tsx`, but Feature 15's spec delivered it
  as `registry/liquid-image-trail/liquid-image-trail.tsx` with
  `LiquidImageTrailProps` / `TrailImage` and `/test-liquid-trail`.
  15b is the newer and more specific document and its paths appear
  verbatim in the task's step list, so the directory, both files, the
  component, the props type, the cva, the plane and the route were all
  renamed, and the `registry.json` entry with them. No behaviour was
  lost in the move: the cva, the container classes, the WebGL probe,
  the reduced-motion store, the prune interval, the single-loader
  texture batch and the explicit disposal all came across unchanged and
  were re-verified by the Feature 15 regression suites.

  THE SUPERSET. `ImagePlane` builds one uniform object with all eight
  entries and hands it to `<shaderMaterial>` unconditionally. There is
  no filtering, per the spec's constraint: the GLSL compiler drops
  whatever a shader does not read (`distortion` never touches
  `uPixelSize`, `pixelate` never touches `uTime`) and three then never
  looks those names up in the linked program. Verified: **zero
  Three.js warnings of any kind** across the whole run, including
  none about uniforms or shaders, and a `distortion`-only run and a
  `wave`-only run both render with 0 console output. Keeping the
  superset flat is also what lets the test page hide the irrelevant
  sliders while the component still receives them.

  `key={effect}` ON THE MATERIAL IS LOAD-BEARING. three.js only
  re-fetches a program when `material.version` changes, which only
  `material.needsUpdate = true` does — R3F's `applyProps` assigns a
  new `fragmentShader` string and leaves `version` alone, so a naive
  prop swap would keep DRAWING WITH THE PREVIOUS EFFECT'S PROGRAM
  while reporting a successful React update. The harness proves both
  halves: with the key in place, parking the trail in `pixelate` at
  `pixelSize 0.08` and switching to `wave` moves the quad by 28.90
  (a different image) and raising the wave amplitude from 0 to 0.1
  then moves it by a further 30.26 (the wave program is live); remove
  the key and the second number collapses to ~0.

  Remounting on an effect change does not recompile per switch:
  three's `releaseProgram` destroys a program when its last user lets
  go, but the four programs stay alive across the churn because a
  trail holds live quads of more than one effect. Measured: **10
  programs total (4 shaders + renderer internals) for ~45 852 quad
  draws and ~712 effect switches** over 60s — a per-switch recompile
  would be ~712.

  THE `tintColor` DEFAULT IS A LIFT, NOT A NEUTRAL. The spec's shader
  is `mix(color.rgb, uTintColor, 0.3)` and the spec's default is
  `#ffffff`. Those two cannot both give what they read like:
  `mix(c, white, 0.3) === c * 0.7 + 0.3`, so in three's LINEAR
  working space every opaque pixel is lifted by a flat 0.3 of linear
  light. Measured consequences: nothing opaque can render darker than
  linear 0.3 = sRGB 149 (a near-black photo comes back as a pale
  card), and because every pixel moves toward the tint by the same
  amount, contrast compresses — a full-strength white grade is a
  visible soft haze over the trail. This is inherent to a
  fixed-factor mix toward a constant and cannot be fixed without
  changing the factor or the default, both of which the spec fixes.
  Implemented spec-exact and documented precisely instead of papered
  over: the shader file, the prop's JSDoc and the test page all say
  what white actually does and recommend picking a colour near the
  surface to bring the trail back down. Measured: with a red tint the
  quad's mean green channel drops 159.5 → 106.0 and its blue 162.6 →
  111.5 while red holds at 153 → 152; with blue it goes the other way
  (blue:red 1.06 → 1.79); and white leaves the HUE untouched (a
  unit-brightness colour shift of 0.0002 against a 0.0015 drift floor)
  while changing only brightness. **DECISION FOR THE TEAM:** if the
  default should reproduce the un-tinted Feature 15 look, the fix is a
  tint strength (`mix(..., uTintStrength)`, default 0) or scaling the
  factor by the tint's distance from white — both are prop/shader
  changes the 15b spec does not authorise, so they were not taken.

  A FALSE CLAIM IN MY OWN FIRST DRAFT, CAUGHT BY THE HARNESS. I had
  documented `#ffffff` as "a provable no-op, since `mix(c, white,
  0.3) === c`". The harness's identity test disagreed (a white tint
  moved the quad by 6.6 where a true no-op would move it by 0) and
  the arithmetic above shows why: the mix factor is 0.3, not 0. The
  docs were corrected; the shader was not touched.

  MEASUREMENT NOTES FOR ANY FUTURE TINT OR FADE TEST ON THIS
  COMPONENT (both cost me a wrong result first):
  * A fading quad DIMS every channel by the same factor and SHRINKS.
    A raw screenshot delta taken seconds apart is therefore dominated
    by drift, not by the change under test — the observed drift floor
    (14-44 mean abs) exceeded a real tint change (31) until the shots
    were taken ~250ms apart. Two fixes used here: BRACKET each change
    between two shots of the same state and use their difference as
    the drift floor; and, for anything colour-related, NORMALISE each
    shot to unit brightness, which cancels the fade exactly and leaves
    the hue. (The same trap applies to the quad's silhouette: an inset
    crop well inside the quad stops the shrinking edge from dominating.
    And a full-stage mean dilutes a ~100x150px quad by 50x, which hid
    a real 20-unit change as 0.4 until the delta was cropped to the
    quad.)
  * `linearToOutputTexel` must stay LAST in every fragment shader.
    Feature 15 established that a `ShaderMaterial` gets no automatic
    output-colour-space conversion; the 15b shaders all keep the
    `linearToOutputTexel(gl_FragColor)` line, which is also what makes
    the tint the colour that was asked for.
  * Fitting "is this the same image, moved?" with an optimal linear
    gain only works if the patch is ZERO-MEAN first. On a low-contrast
    (white-graded) photo the DC term does all the fitting and a
    VERTICALLY FLIPPED copy scores 95% "explained" against it. With
    the mean subtracted, the same measurement is decisive.

  VERIFY: `npm run build` zero TS errors, `npm run lint` clean, and
  **96/96 automated Playwright/Chrome assertions PASS** across the 15b
  suite plus the two Feature 15 regression suites re-pointed at
  `/test-webgl-trail`.

  15b suite (42/42):
  - SSR: 0 `<canvas>` in the server payload, `next/dynamic`'s loading
    fallback present in the server markup, and all four `<option
    value="...">`s server rendered.
  - All four effects render one quad with real content, and every PAIR
    of effects renders measurably differently (mean |a - b| inside the
    quad: liquid/distortion 30.06, liquid/pixelate 25.76,
    liquid/wave 14.66, distortion/pixelate 21.89, distortion/wave
    30.68, pixelate/wave 25.70).
  - The compiled program really swaps (both halves described above).
  - TINT: `#ff0000` and `#0000ff` each move the quad's
    unit-brightness colour by 0.5369 / 0.6423 against drift floors of
    0.0012 / 0.0030; the red tint pushes red:green 0.96 → 1.44 and
    drops green 159.5 → 106.0 and blue 162.6 → 111.5; the blue tint
    pushes blue:red 1.06 → 1.79. `#ffffff` leaves the hue alone
    (0.0002 vs a 0.0015 floor) and changes only brightness.
  - LIVE UNIFORMS, each with the shader clock frozen so only the
    uniform moves: `distortionStrength` 0 → 2 moves the liquid quad by
    37.66 and the distortion quad by 26.74; `pixelSize` 0.002 → 0.2 by
    32.97; `waveFrequency` 0 → 30 by 32.55; `waveAmplitude` 0 → 0.4 by
    29.00.
  - A zero-amplitude `wave` and a zero-strength `distortion` render
    the IDENTICAL photo (13.50 against a 28.31 drift floor) — two
    independent static shaders each compiling their own exact
    pass-through.
  - The liquid warp is a FIELD, not a move: with the clock frozen,
    `uDistortionStrength` 0 → 2 is explained by only 9.7% under the
    best single global translation, against 100.0% for a real 14px
    roll of the same image (positive control) and 2.1% for a vertically
    flipped copy (negative control).
  - 4 mount/unmount cycles with all four effects exercised: 30 of the
    40 created textures deleted (residue is R3F's forceContextLoss
    path, per-renderer), outstanding quad buffers 0 to -4, and the
    open-program balance moves by -1 rather than growing.
  - Zero console errors and zero console warnings for the entire run.

  Feature 15 regression suite 1 (27/27) — the base trail is intact:
  stage box and cva (`cursor: none`, `overflow: hidden`,
  `rgb(9, 9, 11)`, `relative`, fills the stage content box), one
  canvas, zero quads before the pointer moves, 620 draws and 60 929 lit
  pixels on a sweep, the lit centroid tracking the delivered pointer to
  within 0.001, `trailSize` capping the peak quads per frame exactly
  (3 and 20) and trimming a live 24-quad trail to 2 with the pointer
  stationary, a monotonic fade back to the empty-stage baseline with
  zero quads left on the GPU, a longer `fadeDuration` holding the
  trail longer, `velocityThreshold` gating a 0.25 px/ms drag (0 quads
  at 2.0, 14 at 0.05), `imageScale` changing the painted area
  (0.021 → 0.200), reduced motion, the no-WebGL fallback, and the
  all-images-404 path.

  Feature 15 regression suite 3 (27/27) — 60s of churn with the effect
  cycled every iteration: 400/400 sampled frames drew quads, exactly 6
  image requests ever, **0 texture uploads and 0 new GL textures**
  across the run, bounded program count, quad buffers tracking the live
  trail (median 24, max 56) over ~45 852 quad draws, heap +4.1MB,
  frame pacing median 8.3ms / p95 9.6ms, unmount giving back all 6
  textures and the program, and 10 mount/unmount cycles leaving
  intervals and media-query subscriptions at 22/22.

  SCREENSHOTS captured to the temp dir (this model cannot render
  images). A four-up of all four effects with a `#ff4d4d` tint and
  each effect's own uniform pushed to a visible setting confirms all
  four are unmistakably distinct and that the tint grades rather than
  replaces; a second four-up at the default white tint is the visual
  evidence for the brightness-floor finding above.
- Feature 15 (feature spec `15-webgl-liquid-image-trail-pro.md`):
  the WebGL Liquid Image Trail — Component #8 and the first
  genuinely WebGL-rendered component in the library (R3F + a
  hand-written GLSL shader). Files:
  - `registry/liquid-image-trail/trail-shader.ts` — the vertex
    (pass-through, forwards `vUv`) and fragment shaders as template
    literals. The fragment shader is the spec's math verbatim
    (`uv + vec2(sin(uv.y*10+uTime), cos(uv.x*10+uTime)) * uDistortion
    * 0.1`, `texture2D`, `gl_FragColor`) plus ONE added line:
    `gl_FragColor = linearToOutputTexel(gl_FragColor);`. See "THE
    SHADER WOULD NOT COMPILE" below.
  - `registry/liquid-image-trail/image-plane.tsx` — `TrailImage`, the
    per-quad R3F component. One `<mesh>` with declarative
    `<planeGeometry args={[1, 1.5]}>` (the spec's geometry) and
    `<shaderMaterial transparent depthWrite={false}>` whose `uniforms`
    object is `useMemo`'d on the texture. `useFrame` is the ONLY
    writer of the uniforms and the mesh scale, so no React commit
    ever happens per frame.
  - `registry/liquid-image-trail/liquid-image-trail.tsx` — spec-exact
    `liquidTrailVariants` cva (empty `variants`/`defaultVariants`
    objects per spec) and spec-exact `LiquidImageTrailProps`
    (`images`, `distortion` 0.5, `distortionSpeed` 2, `trailSize` 8,
    `fadeDuration` 1.2, `imageScale` 0.4, `velocityThreshold` 0.1,
    `fallbackText`). Owns the pointer refs, the trail-item queue, the
    prune interval, the texture batch, the WebGL capability probe, the
    reduced-motion store, and an internal `TrailScene` that renders
    drei's `<OrthographicCamera makeDefault manual>` plus the live
    quads.
  - `registry/liquid-image-trail/index.ts` — barrel: component +
    props type + cva + `TrailImage` + both shader strings.
  - `registry.json` — added `liquid-image-trail` entry before
    `text-fill-animation`: `tier: "pro"`, `dependencies: ["three",
    "@react-three/fiber", "@react-three/drei", "clsx",
    "tailwind-merge", "class-variance-authority"]`, three files
    (main → `components/ui/liquid-image-trail.tsx`, plus
    `image-plane.tsx` and `trail-shader.ts` under
    `components/ui/liquid-image-trail/`), `variants: []` (the spec's
    cva has none, same as `text-fill-animation`).
  - `app/test-liquid-trail/page.tsx` — `'use client'` page (REQUIRED:
    Next 16 refuses `ssr: false` in a Server Component) with
    `dynamic(() => import('@/registry/liquid-image-trail').then(m =>
    m.LiquidImageTrail), { ssr: false, loading: … })`, a
    `h-[70vh]` stage, the 6 spec'd Unsplash images, 6 live sliders,
    a reset button, and a mount/unmount toggle (see "why the toggle").

  THE SHADER WOULD NOT COMPILE (found by the harness, not by
  reading the code). The fragment shader originally ended with
  `#include <colorspace_pars_fragment>` + `sRGBTransferOETF(...)` to
  convert three's linear working space back to sRGB — without it every
  photo renders visibly too dark, because a built-in material gets
  `#include <colorspace_fragment>` and a hand-written `ShaderMaterial`
  gets nothing. That include is WRONG: three already prepends
  `ShaderChunk['colorspace_pars_fragment']` to the fragment prefix of
  every non-raw `ShaderMaterial` (WebGLProgram.js, in the
  `isRawShaderMaterial !== true` block), so the include redeclares all
  three transfer functions and the program fails to link with
  `'sRGBTransferOETF' : function already has a body`. The failure is
  SILENT-ish: three logs one `WebGLProgram: Shader Error` and then
  every frame produces `INVALID_OPERATION: drawElements: no valid
  shader program in use` — the quads are still submitted (so a
  draw-call counter sees them) but nothing is ever painted, and the
  stage stays a black rectangle. The fix is to CALL three's own
  `linearToOutputTexel()` (which is exactly what the
  `colorspace_fragment` chunk expands to) and never re-include the
  chunk.

  THREE REAL BUGS THE HARNESS CAUGHT (all fixed):
  1. THE FADE NEVER HAPPENED. The spec's `§Implementation Logic`
     computes `age = clock.getElapsedTime() - birthTime` in
     `image-plane.tsx`, while its example stamps `birthTime` with
     `performance.now() / 1000` in the parent. Those are two
     different time bases with an arbitrary offset (the `THREE.Clock`
     starts when the `<Canvas>` mounts, `performance.now()` at page
     load), so `age` comes out large and NEGATIVE, `1 - age/fade` is
     clamped to 1, and every quad sits at full opacity until React
     happens to unmount it. Each quad now stamps its own birth on its
     first `useFrame`, in the only clock it can see.
  2. `velocityThreshold` WAS NOT A THRESHOLD. The spec advances
     `lastX`/`lastY` only INSIDE the spawn branch, so `dx` accumulates
     from the last spawn while `dt` measures the last event. A pointer
     creeping at 0.25 px/ms therefore grows `dx` without bound and
     crosses any threshold within a second or two — measured: a
     0.25 px/ms drag spawned a full 14-quad trail at
     `velocityThreshold={1.9}`. Both are now advanced on every
     accepted event, so the two terms describe the same interval and
     the prop means what its own doc comment says. (Verified: the
     same drag now spawns 0 quads at 2.0 and 14 at 0.05.)
  3. TEXTURES 2..n NEVER REACHED THE SCENE. The loader published its
     texture map into state on every image load, but it reused ONE
     `Map` instance across calls. React bails out of a state update
     whose value is `Object.is`-equal to the current one, so only the
     first publish ever re-rendered. Each publish now builds a fresh
     `Map`.

  ADAPTATIONS vs the spec (all behaviour-preserving, all forced by
  real-browser / real-React reality):
  1. `bg-dead-black` → `bg-dead-950` in the cva (the v4
     `@theme static` palette has no `dead-black`; same 1:1 token
     mapping as Features 09-11). The rest of the string is verbatim.
  2. Position maths against the CONTAINER, not the window. The spec's
     `(clientX / window.innerWidth) * 2 - 1` is only correct for a
     component that fills the viewport; inside a 600px panel it
     throws the whole trail into the top-left sixth of the scene.
     `getBoundingClientRect()` + the rect's own aspect is used, which
     also makes the stage-relative mapping independent of scroll.
  3. A fixed world view height instead of a pixel frustum. R3F's
     default orthographic camera puts the CANVAS PIXELS in world units,
     which would make `imageScale` mean something different on every
     screen. drei's `<OrthographicCamera makeDefault manual>` is given
     `top = VIEW_HEIGHT/2, bottom = -VIEW_HEIGHT/2` with
     `left/right` derived from the live aspect, where
     `VIEW_HEIGHT = 2 * 5 * tan(50°/2)` — i.e. exactly what the
     spec's own perspective camera (`z = 5`, default 50° fov) shows at
     the z=0 plane, so `imageScale`'s documented 0.4 keeps its
     meaning. `manual` is load-bearing: without it R3F's resize path
     overwrites the frustum with the pixel box.
  4. The camera is drei's rather than the `<Canvas camera>` prop
     because R3F only reads `camera` options on its first configure,
     and the aspect ratio is not known until the canvas has measured
     itself. It also keeps the frustum out of the React Compiler's
     reach (see below).
  5. `imageIndexRef` advanced OUTSIDE the `setTrailItems` updater. The
     spec mutates the ref inside the updater, which React may call more
     than once (StrictMode replays it), so every replay would skip an
     image. Item ids come from a monotonic counter, not
     `performance.now()` (which collides at sub-millisecond rates).
  6. The prune interval also enforces the `trailSize` cap, not just
     expiry. The spec's spawn path caps the queue on the NEXT spawn,
     so dragging the slider down would otherwise not shrink a live
     trail until the pointer moved again. It also returns the
     previous array when nothing changed, so a stationary page does
     not commit a React render every 100ms forever.
  7. `onMouseMove` and `style` are destructured out of `...props`
     and composed/re-applied, because `{...props}` is spread last and
     a caller's own handler would otherwise silently delete the trail
     (the same trap Feature 11 fixed for `style`).
  8. Textures are preloaded by the component itself rather than
     through drei's `useTexture`. Reasons: (a) `useTexture` suspends,
     so the first sweep of each new image would suspend the whole R3F
     tree, (b) drei's cache is a module-level `Map` that the component
     cannot evict without breaking a second instance sharing the same
     URLs, and (c) code-standards requires explicit disposal, which a
     global cache makes awkward. A single lazily-created module-level
     `THREE.TextureLoader` singleton loads each URL exactly once, and
     the effect's cleanup disposes the whole batch. Failed images get
     a 2×2 `DataTexture` in `dead-800` so a 404 leaves a neutral tile
     rather than a hole in the cycle.
  9. Quads whose texture has not arrived are SKIPPED, not rendered.
     A freshly constructed `THREE.Texture` has `version === 0`, so
     three never uploads it and sampling an unbound texture returns
     `(0,0,0,1)` — a black rectangle at full alpha on the first
     sweeps.
  10. Reduced motion swaps the canvas for `fallbackText` via
     `useSyncExternalStore` over `matchMedia`. A ref could only stop
     spawning, which would leave a bare black rectangle with no
     explanation; `useSyncExternalStore` subscribes, re-renders only
     when the answer flips, and takes a server snapshot so the module
     stays importable during a server render.
  11. WebGL support is probed once per browser (module-level cache,
   `webgl2` → `webgl` → `experimental-webgl`, the same list
   `WebGLRenderer` uses) and the probe context is released with
   `WEBGL_lose_context`. When WebGL is missing, no `<canvas>` is
   created at all and `fallbackText` renders, with `cursor-auto`
   lifting the container's `cursor-none`.
  12. `linearTransferOETF` is NOT included for the same reason as
   point 4: three already supplies the transfer functions (see above).

  TWO REACT-COMPILER ESCAPES WORTH RECORDING. `eslint-config-next`
   16 enables `react-hooks/immutability`, which flags any write to a
   value produced by a hook — including `material.uniforms.uTime.value
   = …` inside `useFrame` and `camera.zoom = …` inside `useFrame`.
   Neither is React state: both are imperative three.js objects
   mutated on the render loop. Rather than suppress the rule, both
   were restructured: the material is now declarative with a
   `useMemo`'d `uniforms` object and the frame loop writes through
   `materialRef.current` (a ref, which the rule allows), and the
   camera frustum is applied by drei's `<OrthographicCamera>` through
   R3F's own reconciler, which the React Compiler cannot see. The only
   remaining `eslint-disable` in the component is
   `react-hooks/exhaustive-deps` on the memo that deliberately omits
   `distortion` (it is read live in `useFrame` so a slider drag does
   not rebuild the uniform object) and on the effect keyed by
   `imagesKey` instead of `images` identity. `npm run lint` is clean.

  THREE CACHING BEHAVIOURS THAT MATTER WHEN PROVING THIS
  COMPONENT (each one initially produced a false result in the
   harness):
   * three's `SingleUniform.setValueV1f` returns early when the value
     equals the last one it uploaded, so a uniform only reaches the
     GPU when it CHANGES. `uTime` and `uOpacity` change every frame
     and are always observable; `uDistortion` and a frozen `uTime`
     (at `distortionSpeed={0}`) are uploaded exactly once, so a test
     that resets its log before moving the slider sees nothing.
   * R3F special-cases `ShaderMaterial.uniforms` in `applyProps`: it
     patches the existing `{ value }` wrappers in place
     (`Object.assign(targetUniform, uniform)`) instead of replacing
     the object, which is what makes mutating a stable memoised
     uniform object safe across re-renders.
   * `THREE.TextureLoader().load()` returns a texture with
     `version === 0`; `setTexture2D` guards on `version > 0`, so
     nothing is uploaded and no warning is printed until the image
     lands and `needsUpdate` bumps the version.

  VERIFY: `npm run build` zero TS errors, `npm run lint` clean, and
  automated Playwright/Chrome (headless, system Chrome via
  `channel="chrome"`): **91/91 assertions PASS** across three
  harnesses. The instrument is an `add_init_script` that patches the
  WebGL context and records a PER-FRAME log: `drawElements` counts
  (bucketed per rAF tick, so the live quad count is exact), the
  `u*` uniform values actually uploaded (via
  `getUniformLocation` + `uniform1f`), and `create*`/`delete*` pairs
  for textures, buffers, programs, shaders and framebuffers.

  Harness 1 — behaviour (27/27) on `app/test-liquid-trail`:
  - RENDER: stage box 1152×630, the component fills the stage's
    1150×628 content box, one `<canvas>`, `cursor: none`,
    `overflow: hidden`, `background-color: rgb(9, 9, 11)`,
    `position: relative`.
  - SPAWN: 0 quads submitted before the pointer moves; a sweep
    submits 620 draws and paints 60 929 lit pixels with max
    luminance 241 / p99 198 (real photographic content, not a fill).
    An untouched stage measures a 0.00346 lit-fraction baseline,
    which is the compositor noise floor every fade assertion is
    compared against.
  - FOLLOW: the lit centroid tracks the delivered pointer to within
    0.001 of the fractional x (0.801 for a 0.800 delivery) and 0.003
    of the fractional y.
  - `trailSize`: peak quads per frame is EXACTLY 3 and EXACTLY 20 for
    the two slider values, and dragging the slider 24 → 2 while the
    pointer is stationary trims a live 24-quad trail to 2.
  - FADE: `fadeDuration={1.0}` peaks at 0.057 lit fraction, decays
    monotonically (early 0.057 / mid 0.007 / late 0.0035) and returns
    to the baseline; the quads are then fully released (0 draws per
    frame). `fadeDuration={4.0}` still shows 14 quads 1.5s after the
    sweep and expires by ~4.7s.
  - `velocityThreshold`: a 0.25 px/ms drag spawns 0 quads at 2.0 and
    14 at 0.05.
  - `imageScale`: 0.2 → 0.021 lit fraction, 1.0 → 0.186.
  - Zero console errors, zero page errors.

  Harness 2 — shader + fallbacks (37/37):
  - SSR: HTTP 200, 19 408 chars of markup, ZERO `<canvas>` in the
    server payload, `next/dynamic`'s `loading` fallback present in the
    server markup, no error boundary, and the only `THREE.` string
    outside a `<script>` is `THREE.TextureLoader` inside a visible
    `<code>` in the page's own footer copy.
  - UNIFORMS, read off the GPU calls: `uDistortion` is exactly
    0 / 0.5 / 1 / 2 for the four slider values; `uTime` advances at
    0.000 / 0.996 / 4.023 rad/s for `distortionSpeed` 0 / 1 / 4;
    `uOpacity` falls at 1.011 /s and 0.335 /s for `fadeDuration`
    1.0 / 3.0 (expected 1.000 / 0.333).
  - THE WARP IS A FIELD, NOT A MOVE (the "liquid" claim, measured on
    two fresh-page runs that differ ONLY in `distortion`, both with
    the shader clock frozen and the same single quad at the identical
    pixel bbox (515, 219)–(644, 410)): mean |flat − warped| = 35.6
    inside the 93×137px quad, and the best single global
    translation explains only 82.4% of it — against 100.0% for a
    genuine 14px shift of the same image (positive control) and
    0.0% for a vertically flipped quad (negative control). So the
    render is provably the same photo, and provably not the same
    photo moved.
  - ANIMATION: the same frozen quad's frame-to-frame delta is 11.9
    (flat), 12.1 (warped, clock frozen) and 19.8 (warped, clock
    live) — the shrink-and-fade term is common to all three, so the
    difference is the warp's own churn.
  - REDUCED MOTION (`reduced_motion="reduce"`): 0 quads, 0 canvases,
    the fallback `<span>` is shown.
  - NO WEBGL (`getContext` stubbed to return null for webgl*): 0
    canvases, `fallbackText` rendered, `cursor` lifted to `auto`,
    the stage keeps its 630px height (no CLS), 0 page errors.
  - ALL IMAGES 404 (request interception): 14 quads still drawn,
    lit fraction 0.060, p99.9 luminance 39.0 — the `dead-800`
    placeholder, not a black hole.

  Harness 3 — memory and cleanup (27/27):
  - 60s of continuous pointer movement: 400/400 sampled frames drew
    quads (peak 14/frame), and between t=12s and t=60s the
    `texImage2D` delta is 0 and the `createTexture` delta is 0 — a
    `TextureLoader` in the frame loop would produce thousands. 4
    shader programs in total for ~45 079 quad draws (no per-quad
    recompilation). Outstanding geometry buffers track the live
    trail (median 30, max 56 — a 14-quad trail holds 4 buffers each)
    over 45 079 quad draws. JS heap +26MB over the minute.
    Frame pacing: median 8.3ms, p95 9.0ms, worst 9.3ms.
  - UNMOUNT (via the test page's toggle): 6 textures deleted, 0 left
    open; 84 buffers created / 84 deleted; the program is released;
    the canvas is gone; the 100ms prune interval is cleared; the
    reduced-motion media query is unsubscribed.
  - 10 MOUNT/UNMOUNT CYCLES: 91 textures created / 57 deleted
    (residue 3.4 per cycle, which is R3F's `forceContextLoss`
    path reclaiming renderer-internal objects without an individual
    `deleteTexture`, and is per-renderer not per-quad — a trail leak
    would be 6 per mount), 0 outstanding buffers, programs +6/−6,
    heap +4.7MB, intervals 22/22 registered/cleared, media queries
    22/22. 0 canvases, 0 console errors, 0 console warnings.

  WHY THE TEST PAGE HAS A MOUNT/UNMOUNT TOGGLE. A leak can only be
  observed on a React unmount. Navigating away tears down the JS
  realm and the browser reclaims everything whether or not the
  component cleaned up, so a navigation-based test proves nothing —
  the first version of this harness "failed" exactly that way (0
  `deleteTexture` after a navigation). The toggle unmounts the
  component in place, which is also how the spec's own "check the
  Memory tab after 1 minute" item is meant to be read.

  SCREENSHOTS captured to the temp dir (this model cannot render
  images). A side-by-side of the same quad at `distortion={0}` and
  `distortion={2}` (shader clock frozen, identical bbox) shows a
  clean photo vs a fully liquefied one, which is the visual
  confirmation behind the "field, not translation" measurement.
- Feature 12 (feature spec `12-scroll-media-scrub.md`): the
  Scroll-Linked Media Scrub — one component with two modes, an
  image sequence (frame-by-frame) and a video timeline. This is the
  first component in the library that paints into a `<canvas>`, and
  the second (after Feature 11) with ZERO React commits during its
  animation. Files:
  - `registry/scroll-scrub/scroll-scrub.tsx` — `'use client'`;
    spec-exact `scrollScrubVariants` cva (4 `aspectRatio` values) and
    spec-exact `ScrollScrubProps` interface (extends
    `HTMLAttributes<HTMLDivElement>` + VariantProps; `images`,
    `videoSrc`, `start`, `end`, `scrub`, `pin`, `objectFit`,
    `fallbackImage`). Two elements instead of the spec's one:
    an outer trigger `<div>` (owns `ref`, `{...props}`, `className`
    and the scroll length) wrapping the inner "stage" `<div>` that
    carries the cva and the media.
  - `registry/scroll-scrub/index.ts` — barrel: component + props
    type + cva variants.
  - `registry.json` — added `scroll-scrub` entry before
    magnetic-button: `tier: "free"`, `dependencies: ["gsap", "clsx",
    "tailwind-merge", "class-variance-authority"]`, tsx →
    `components/ui/scroll-scrub.tsx`, `variants: ["image-sequence",
    "video"]` (spec did NOT request this file but the code-standards
    review checklist requires a registry entry; matches prior
    components).
  - `app/test-scroll-scrub/page.tsx` — server page (ScrollScrub is
    the client boundary) with the spec-exact 4 sections on the Dead
    palette: (1) default image sequence, zero props, (2) default
    video scrub, (3) custom 5-frame Unsplash sequence, (4) unpinned
    `pin={false}` + `className="h-[150vh]"`, plus a footer note on
    preloading/proxy painting/reduced motion. Every instance carries
    an `id` so the harness can target it.

  TWO STRUCTURAL ADAPTATIONS, both forced by the spec's own default
  props (documented in-file):
  1. THE SPEC'S `start`/`end` CANNOT WORK ON THE SPEC'S BOX. The
     range between `top top` and `bottom bottom` is
     `containerHeight - viewportHeight`, but the cva gives the
     container an aspect-ratio box (~468px tall in a 1024px column).
     A 468px container yields a NEGATIVE 432px range, i.e. no scrub
     at all. The trigger therefore has to be taller than the
     viewport, so the component renders an outer trigger section
     (`h-[300vh]` by default, twMerge-overridable through `className`)
     around the short media box, and ScrollTrigger gets
     `trigger: container, start, end, scrub, pin: stage,
     pinSpacing: false` — the trigger measures the range, the STAGE
     (not the 300vh trigger) is pinned. `pinSpacing: false` because
     the trigger already reserves the scroll length; a spacer would
     double it. GSAP creates its `pin-spacer` either way and moves
     the stage into it, so `ctx.revert()` on cleanup unwraps it (a
     client-side navigation away from a pinned instance was tested
     explicitly: 0 page errors, 0 orphaned spacers).
  2. `objectFit` is the spec's inline `style={{ objectFit }}` (the
     only form that supports all four values); the spec's extra
     conditional `object-cover`/`object-contain` classes were dropped
     as redundant. For canvas mode the same four values are computed
     as `drawImage` destination math (cover/contain/fill/none), which
     is what makes `objectFit` work identically in both modes.

  THE DEFAULT VIDEO URL IS DEAD. The spec's
  `commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4`
  now answers `403 AccessDenied` for anonymous callers — that whole
  GCS sample bucket is no longer public (verified with curl; so is
  `BigBuckBunny.mp4` from the same bucket, and `w3schools.com/html/mov_bbb.mp4`).
  A default that cannot load is not a default, so `DEFAULT_VIDEO` is
  MDN's CC0 `flower.mp4` (5.055s, 960x540, 1.1MB, byte-range
  friendly, measured in-browser). `DEFAULT_IMAGES` is the spec's ten
  `picsum.photos/seed/deadui{i}/800/600` frames, unchanged and
  verified loading.

  WHY A CANVAS. The spec allows either a single `<canvas>` ("most
  performant for rapid frame swapping without DOM flicker") or a
  single `<img>` whose `src` is swapped (its own recommendation).
  The canvas option was taken because the checklist's flicker item is
  exactly the `<img>`-swap failure mode: changing `src` schedules an
  async decode, so a fast scrub can flash the previous frame, and a
  frame that has not arrived renders as a broken-image icon.
  `drawImage` from the preloaded `Image` objects is synchronous and
  decode-free. The backing store is sized from the stage box by a
  `ResizeObserver` (DPR capped at 2) so no draw is resampled.

  ADAPTATIONS vs the spec (behaviour-preserving):
  1. Frame order. The spec's preloader does `imgElements.push(img)`
     inside `onload`, so the array lands in COMPLETION order, not
     source order — with variable image sizes that shows the wrong
     frame for a given index. Frames are created up front in array
     order and filled by index.
  2. Broken frames. The spec's `onerror` resolves without pushing, so
     the frame count silently shrinks and the index math shifts. A
     failed frame now inherits its nearest good neighbour, so the
     sequence keeps its length and never holes.
  3. `isVideoMode` is derived (`Boolean(videoSrc)`) instead of held in
     `useState(!!videoSrc)`, which would have been a state variable
     that never changes. Same behaviour, no dead state.
  4. Readiness is derived, not reset. The spec's
     `setFramesReady(false)` at the top of the preload effect is a
     synchronous setState inside an effect body (an ESLint error under
     this repo's `react-hooks/set-state-in-effect`). Replaced with
     `loadedKey` (which source list finished) + `framesKey`
     (the current source list), so `framesReady` is a comparison and
     swapping `images` invalidates the gate for free.
  5. `bg-dead-surface` → `bg-dead-800` in the cva base (same class of
     v4-token issue adapted in Features 09/10/11; the rest of the cva
     string is verbatim).
  6. Video metadata gate uses a ref CALLBACK, not only the
     `loadedmetadata` prop. On a statically prerendered page the
     `<video preload="auto">` starts loading while the HTML parses, so
     the element can already be at `readyState >= 1` before React
     hydrates — and React never replays a missed `loadedmetadata`, so
     the prop alone would deadlock the gate. The ref callback
     reconciles node-mounted-with-state. The effect still re-checks
     `Number.isFinite(duration)` before touching GSAP.
  7. `fallbackImage` is used for both modes: the `<video>`'s `poster`
     and the first paint on the canvas.
  8. `aspectRatio="auto"` is implemented rather than left broken. With
     `h-auto` the stage is sized by the canvas's default 300x150
     attribute, so the resize effect would read back 2:1 forever; for
     `auto` the height is derived from the first decoded frame's own
     ratio instead (verified: 832x624 for 800x600 frames). This was
     caught by the harness, not by reading the code.
  9. Reduced motion goes through `gsap.matchMedia()`
     (`no-preference` builds the scrub, `reduce` pins nothing, paints
     the LAST frame and seeks the video to `duration` in a
     `try/catch`) — a scroll-driven effect, not a self-running
     animation, but code-standards makes `prefers-reduced-motion`
     non-negotiable.

  VERIFY: `npm run build` zero TS errors, `npm run lint` clean, and
  automated Playwright/Chrome (headless, system Chrome via
  `channel="chrome"`, run under the `pw-venv2` uv venv): **78/78
  assertions PASS** across three harnesses.

  Harness 1 — `app/test-scroll-scrub` (52/52):
  - RENDER: 4 sections; 3 canvases (`role="img"` + `aria-label`) + 1
    `<video>`; video is `muted` + `playsInline` + `preload="auto"` +
    labelled; computed `object-fit: cover`.
  - ZERO RE-RENDERS: a minimal `__REACT_DEVTOOLS_GLOBAL_HOOK__` via
    `addInitScript` counts `onCommitFiberRoot` (positive control: 13
    commits after mount). 24 scroll steps across the whole range
    produce **delta 0 commits** while the frame provably changes.
  - FLICKER (the checklist's item): 25 settled samples AND 30 rapid
    un-settled scroll jumps (40ms apart) → **0 blank frames** in
    either sweep, measured as "every sampled pixel is the
    `bg-dead-800` stage colour". Last frame mean lum 172.9 / std 58.7
    = real content.
  - SCRUB: 10/10 distinct frames over 25 samples (exactly the 10-frame
    default sequence); the 5-frame Unsplash instance shows 5/5.
  - PIN: the stage's viewport top holds at 0.0 across 900px of scroll
    with `position: fixed` inside a `pin-spacer`; exactly 3
    pin-spacers on the page (the 3 `pin` sections).
  - GEOMETRY/CLS: the trigger is 2700px vs a 900px viewport (1800px of
    range) and the stage measures 832x468 = 1.778 (16:9) before any
    media lands; the canvas backing store equals the CSS box x DPR.
  - VIDEO: `currentTime` 0.00 → 5.05s monotonically over 11 stops,
    max deviation from `progress x duration` = 0.001s; the element
    stays `paused` (seek-driven, never played); real frames painted;
    scrolling back rewinds to 0.00s.
  - RACE: `loadedmetadata` is withheld at the window capture phase
    (React 19 delegates media events from the root container, so the
    gate stays shut) → 0 pin-spacers, `currentTime` 0, no errors;
    after releasing it, 1 pin-spacer appears and the new trigger
    **catches up to the scroll position that is live at that moment**
    (3.37s vs 3.37s expected at 67% progress).
  - NaN GUARD: with `HTMLMediaElement.prototype.duration` forced to
    NaN forever while the event still fires → no ScrollTrigger, no
    seek, no error.
  - REDUCED MOTION (`reduced_motion="reduce"`): 0 pin-spacers, the
    image stage is pixel-identical at both ends of its range (and not
    blank), the video sits at 5.05 of 5.05s.
  - CLEANUP: navigate away and back → still exactly 3 pin-spacers, one
    canvas per section, and the video section scrubs again (2.53s at
    50% of the clip) off a fresh trigger.
  - Zero console errors, zero page errors across the whole run. Note
    the canvas is cross-origin-tainted by design, so all pixel proof
    comes from Playwright element screenshots, not in-page
    `getImageData`.

  Harness 2 — variant coverage (22/22) on a scratch route that was
  deleted after the run:
  - `objectFit` all four values pixel-proven at the same frame index:
    `cover` fills edge to edge (0,0,831,467); `contain` letterboxes
    with 104px bars and content bounds (104,0,727,467) = exactly
    `800 x min(832/800, 468/600)` centred; `fill` shares cover's
    bounds but its pixel signature differs by 43 (the distortion);
    `none` draws at natural size with a 16px bar (bounds 16,0,815,467).
    HARNESS TRAP worth remembering: `content_bounds` first scanned
    the whole rectangle and reported full-bleed for every value,
    because the stage is `rounded-lg` and its 8px corner arcs show the
    PAGE background, not the stage background. Measuring the middle
    row/column only fixed it — the component was right all along.
  - `aspectRatio` all four values: 468 / 832 / 1109 / 624px tall for
    video / square / portrait / auto (auto = the frame's own 4:3).
  - `fallbackImage`: an `images` list where every URL 404s still
    paints the fallback (mean lum 141.2, never blank, never a
    broken-image icon) and still creates its ScrollTrigger.
  - `scrub` / `start` / `end` / `className` are wired: jumping 0 → 0.5
    changes the frame by 187 (mean-channel delta) 220ms later with
    `scrub={0.05}` vs 122 with the `scrub={1}` default, and the fast
    instance reaches its settled frame (187) by 1.6s.
  - Only console errors are the 2 intentional `.invalid` lookups.

  Harness 3 — unmount-while-pinned (4/4 real assertions; the 2
  reported "failures" were only the scratch page's intentional
  `.invalid` network errors): a client-side `<Link>` navigation away
  from a section whose stage is confirmed `position: fixed` inside a
  `pin-spacer` produces **0 page errors and 0 console errors**, two
  repeated cycles stay clean, and 0 pin-spacers survive in the DOM
  after leaving — i.e. GSAP's spacer round-trip survives React
  unmounting a pinned container.
  Full-page screenshot captured (model cannot render images, so
  confirmation relied on the DOM/computed-style/pixel assertions).
- Feature 11 (feature spec `11-spotlight-hover-card.md`): Component #4
  (Free), the Spotlight Hover Card — a mouse-tracking card whose
  spotlight position lives entirely in CSS custom properties. This is
  the first component in the library with ZERO React re-renders during
  an interaction (no `useState`/`useReducer` for the pointer at all).
  Files:
  - `registry/spotlight-card/spotlight-card.tsx` — `'use client'`;
    spec-exact `spotlightCardVariants` cva (base
    `relative overflow-hidden rounded-xl border transition-colors
    duration-300` + shape rounded/soft/sharp) and spec-exact
    `SpotlightCardProps` interface (extends `HTMLAttributes<HTMLDivElement>`
    + VariantProps; `children`, `spotlightColor`, `spotlightSize`,
    `spotlightOpacity`, `glowType`, `borderColor`, `hoveredBorderColor`,
    `enableTilt`, `tiltIntensity`). `onMouseMove` writes
    `--mouse-x`/`--mouse-y` (and `--rotate-x`/`--rotate-y` when
    `enableTilt`) straight onto the node via
    `element.style.setProperty`; props land as CSS vars on the root
    (`--spotlight-color`, `--spotlight-size`, `--spotlight-opacity`,
    `--border-color`, `--hovered-border-color`) and the three child
    layers consume them, so a prop change costs one render and a
    mousemove costs zero.
  - `registry/spotlight-card/index.ts` — barrel: component + props
    type + cva variants.
  - `registry.json` — added `spotlight-card` entry before
    magnetic-button: `tier: "free"`, `dependencies: ["clsx",
    "tailwind-merge", "class-variance-authority"]`, tsx →
    `components/ui/spotlight-card.tsx`, `variants: [border, background,
    both, none]` (spec did NOT request this file but the code-standards
    review checklist requires a registry entry; matches prior
    components).
  - `app/test-spotlight-card/page.tsx` — server page (SpotlightCard is
    the client boundary) with the spec's 4 sections on the Dead
    palette: (1) 3×3 Linear-style grid, (2) all four `glowType`
    variants side by side, (3) `enableTilt` + `tiltIntensity={14}` card,
    (4) custom colors (`rgba(220,38,38,0.55)` red,
    `rgba(56,189,248,0.5)` blue) + sizes (120 / 520) + opacity 0.55 —
    plus a footer note on the mask + reduced-motion behaviour. The
    grid carries one `shape` per row (rounded / soft / sharp) so the
    cva shape variants are exercisable without adding a 5th section.
    Every card has an `id` so the harness can target it.

  THE BORDER MASK (the part the checklist cares about). A dedicated
  layer holds the ring gradient with `padding: 1px` and
  `mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff
  0 0)` + `mask-composite: exclude` (plus the `-webkit-` prefixed
  `mask` / `xor` pair for older WebKit). Two identical opaque mask
  layers: layer 1 is pinned to the `content-box`, layer 2 fills the
  `border-box`; `exclude` subtracts one from the other, so what survives
  is exactly the 1px padding ring = the border. The card face is
  therefore never painted by the border glow. Blink canonicalizes the
  standard `exclude` to `xor` in computed styles (they are aliases
  there), so the computed value reads `xor, xor` — the proof that it is
  NOT the default `add` is what matters, and the pixel test confirms it.
  No `-webkit-mask-clip` hacks needed.

  ADAPTATIONS vs the spec (all behaviour-preserving, all forced by
  real-browser/CSS reality):
  1. Opacity split. The spec sets `opacity: var(--spotlight-opacity)`
     inline on the same element that carries
     `opacity-0 group-hover:opacity-100`; inline opacity always beats
     a class, so the hover fade would be dead and the glow would sit
     permanently on. Each glow layer is therefore split in two: the
     outer div owns the `group-hover` fade, the inner div owns the
     gradient and `opacity: var(--spotlight-opacity)`. Both effects
     now work, and `spotlightOpacity` scales the gradient instead of
     replacing the hover fade.
  2. One ring, not two. The cva base ships `border` AND the spec's
     JSX has a separate "Base Border" child div — together they draw
     two rings, and in Tailwind v4 a bare `border` defaults to
     `currentColor`, i.e. a bright white hairline. The spec's Base
     Border div is kept as the single visible ring (that is where
     `--border-color` is consumed) and the cva's own border is
     collapsed with an inline `borderWidth: 0`; the exported cva string
     stays spec-verbatim. Inline `borderWidth: 0` (rather than
     `borderColor: transparent`) also keeps the child ring flush with
     the card edge instead of 1px inside it.
  3. `style` merge. The spec's `{...props}` last means a caller's
     `style` would replace the whole CSS-var object and silently kill
     the effect. `style` is destructured out of props and spread last
     inside the style object, so caller styles win per property and the
     spotlight vars always survive. Everything else keeps the spec's
     spread order.
  4. Tilt transition timing. The spec says `0.1s` in §Implementation
     Logic and `0.3s` in the example JSX. Used the example's 300ms for
     the at-rest/return timing and implemented the logic section's
     intent by swapping ONLY the duration to `0ms` on the first
     mousemove (guarded by a ref so it is one write, not one per
     event) and restoring `300ms` in the SAME style batch as the
     `0deg` target on `mouseleave`. Because CSS reads transition
     parameters from the after-change style, that batch produces a
     smooth ease-out return rather than a jump — verified below.
  5. Tilt-aware pointer math. With `enableTilt`, `getBoundingClientRect()`
     returns the *rotated* bounding box, so the spec's
     `clientX - rect.left` drifts by the transform overflow (measured
     2.5px at `tiltIntensity` 14 and growing with angle + card size,
     because the AABB grows ~25px on a wide card at 10°). When
     `enableTilt` is set the handler anchors on the visual center and
     re-expands by `offsetWidth/offsetHeight`; when it is not set the
     spec's exact formula is used unchanged.
  6. Reduced motion (code-standards non-negotiable, no new dependency):
     a native `matchMedia('(prefers-reduced-motion: reduce)')` in a
     `useEffect` writes a ref (no re-render, no `motion` import), the
     tilt is pinned to 0deg when it matches, and the glow layers use
     `motion-reduce:transition-none` so they appear instantly. The
     gradient still follows the cursor under reduced motion: it is a
     direct response to pointer position, not autonomous motion.
  7. `aria-hidden` on the three decorative layers (they are purely
     visual and sit under `pointer-events-none`).

  VERIFY: `npm run build` zero TS errors, `npm run lint` clean, and
  automated Playwright/Chrome (headless, system Chrome via
  `channel="chrome"`): **47/47 assertions PASS**.
  - RENDER: all 18 cards mount exactly once; shape variants resolve to
    `rounded-2xl` / `rounded-lg` / `rounded-none` (twMerge overrides the
    cva base `rounded-xl`).
  - NO RE-RENDERS (the checklist's profiler item, proven without
    DevTools UI): a minimal `__REACT_DEVTOOLS_GLOBAL_HOOK__` is injected
    via `addInitScript` and counts `onCommitFiberRoot`. Positive control
    = 9-10 commits after mount. Then sweeping the mouse across all 9
    grid cards AND the tilt card (with `steps` interpolation) leaves the
    counter at exactly the same value — **delta 0 commits**.
  - TRACKING ACCURACY: `--mouse-x/--mouse-y` equal the delivered
    `clientX/clientY` minus the card origin exactly (206px vs 206.00
    computed). A 60-move rAF sweep advances the var 1:1 on every frame
    (expected step 4.79px, min 4.00, max 5.00, total 287.0px) — no lag,
    no easing, no jitter. Computed `background-image` resolves the vars
    to real px: `radial-gradient(circle at 206px 62px,
    rgba(255,255,255,0.15), rgba(0,0,0,0) 300px)`.
  - FRAME PACING during a continuous 72-move sweep: 144 frames, median
    8.3ms, p95 9.9ms, worst 10.4ms, **0 frames over 32ms, 0 long
    tasks** — the per-frame work is paint/composite only.
  - `glowType="border"` (the key item): max ring dLum **+60.0** (1px
    ring, 0.0 everywhere else along the top edge) and max interior
    dLum **0.0** at a 6px inset — pixel proof the mask keeps the glow on
    the border. Computed `mask-origin: content-box, border-box`,
    `mask-composite: xor, xor` (≠ default `add`), `padding: 1px`.
  - `glowType="background"`: max interior dLum +34.0, and the ring band
    delta (22.1) matches the adjacent face band (25.9) — illumination is
    continuous across the face edge, i.e. no ring-only boost.
  - `glowType="both"`: interior +44.9 (both layers present: 3 layers vs
    2 vs 1 for none).
  - `glowType="none"`: 1 layer only, deltas 0.0 everywhere.
  - Custom colors/sizes: `--spotlight-size` 120px vs 520px reaches the
    gradient's transparent stop; lit-pixel footprint 158 vs 211 at a
    12-dLum threshold; red spotlight renders `rgb(131,32,33)`.
  - TILT: rest transform is
    `matrix3d(1,0,0,0, 0,1,0,0, 0,0,1,-0.001, 0,0,0,1)` — the `-0.001`
    term proves `perspective(1000px)` is live — with
    `transition: transform 0.3s ease-out` and `will-change: transform`.
    Tilt math matches the spec formula: expected `(7.00, -8.40)` at
    cursor (0.2, 0.25) with `tiltIntensity 14`, got `(7.04, -8.41)`.
    `transition-duration` = `0s` while tracking, `0.3s ease-out`
    restored on leave, and the card is **still mid-rotation on the frame
    right after leave** (`matrix3d(0.997…, …)`) before settling to the
    exact rest matrix — a smooth snap-back, not a jump. `enableTilt={false}`
    cards keep `transform: none`. While tilted, the spotlight stays
    anchored to the LAYOUT box (0.31px residual, `offsetWidth` integer
    rounding) even though the rect is the 581.1px rotated AABB of a
    576px card.
  - REDUCED MOTION (`reduced_motion="reduce"`): rotation stays `0deg`
    and the matrix stays at rest after moving the pointer to the far
    corner, glow layers report `transition-property: none`, and the
    spotlight still tracks the cursor (`--mouse-x: 114px`).
  - Zero console errors, zero page errors across the whole run.
  KNOWN CHARACTERISTIC (measured, not a bug): a `content-box` mask
  punches a SHARP rectangle, so on a rounded card the area between that
  sharp corner and the rounded corner curve is not subtracted — the 4
  corners keep a wedge of glow no wider than ~6px (max dLum 42.9 within
  2px of the edge, exactly 0.0 beyond a 6px inset). It is inherent to
  the spec's prescribed technique, invisible on `shape="sharp"`, and
  reads as the glow wrapping the corner. A CSS-only fix would need an
  SVG/`clip-path` rounded mask and would break `rounded-[inherit]`
  across the three shape variants, so it was left as-is.
  Full-page screenshot captured (model cannot render images, so
  confirmation relied on the DOM/computed-style/pixel assertions above).
- Feature 10 (feature spec `10-infinite-blur-marquee.md`): Component #3
  (Free), the Infinite Blur Marquee — a pure-CSS, GPU-accelerated infinite
  scroller with direction variants, per-instance speed/direction CSS vars,
  pause-on-hover, and `mask-image` edge blur (no JS animation, no SVG
  filters). Files:
  - `app/globals.css` — spec keyframes `marquee` (translateX) and
    `marquee-vertical` (translateY), both at `to` =
    `translate(100% / var(--repeat, 4))`, plus `animate-marquee` /
    `animate-marquee-vertical` utilities. DEVIATION (spec said update
    `tailwind.config.ts`): this repo is Tailwind v4 (no config file), so
    the v4 home for theme/animations is `globals.css`. Two real browser
    findings drove the final form:
      1) Defining the animations as `@theme` `--animate-*` tokens FAILS —
         the `.animate-marquee { animation: var(--animate-marquee) }`
         class resolves `--animate-marquee` from `:root`, and Chrome does
         NOT re-resolve the nested `var(--duration, 30s)` /
         `var(--direction, normal)` inside that `:root`-declared custom
         property against the track element — every marquee computed to
         the 30s/normal fallbacks. Verified by experiment: the identical
         shorthand as an inline style or as a plain (non-theme) class
         resolves the vars correctly. Fixed by declaring the utilities as
         plain classes composed of `animation-*` LONGHANDS (each `var()`
         resolves on the animated element directly), kept inside
         `@layer utilities` so variant utilities sort after them.
      2) With longhands, `motion-reduce:[animation:none]` lost to the
         later-in-source `.animate-marquee { animation-name: ... }` rule
         (equal specificity, same layer) — reduced-motion test failed.
         Fixed with `motion-reduce:[animation:none]!` (important).
  - `registry/marquee/marquee.tsx` — `'use client'`; spec-exact
    `marqueeVariants` cva (direction horizontal/vertical, blur
    none/edges/left/right, defaults horizontal+edges) and spec-exact
    `MarqueeProps` interface (extends `HTMLAttributes<HTMLDivElement>` +
    VariantProps; `children`, `speed` 30, `gap` 16, `pauseOnHover`,
    `reverse`, `repeat` 4, `scrollLinked`). CSS var injection:
    `--gap`/`--repeat` on the root, `--duration`/`--direction` on the
    track (typed via `['--x' as string]` per the spec example and prior
    repo precedent). `pauseOnHover` → `hover:[animation-play-state:paused]`
    longhand on the track (no re-render, no shorthand-reset conflict with
    the longhand block). `scrollLinked` implemented minimally per the
    spec's final correction: disables the CSS animation and a passive
    window `scroll` listener sets `--scroll-progress` to `window.scrollY`
    (px), which the track transform consumes 1:1 (reversed sign), so
    page scroll scrubs the track. Reduced motion: `motion-reduce:
    [animation:none]!` renders a static strip.
    THE SEAMLESS LOOP (this is the part the spec's checklist cares about):
    each copy is a SELF-CONTAINED period. The copy wrapper lays children
    out with the inter-item `gap` AND bakes a trailing spacing equal to
    `gap` into itself (`pr-[var(--gap)]` horizontal / `pb-[var(--gap)]`
    vertical); the track sets NO gap of its own. So children stay
    uniformly `gap`-spaced across copies (verified: min==max==16.00px
    across all 23 chip boundaries) while the distance between two
    identical copies = exactly one copy's width. Then
    `translateX(calc(-100% / var(--repeat)))` = `-trackWidth / repeat` =
    exactly one period per loop → the wrap point is pixel-identical.
    The spec sketch put `gap` on both the wrapper AND the track, which
    the math shows leaves a residual `gap/repeat` jump (track width
    `repeat·W + (repeat-1)·gap` vs period `W+gap`); baking the trailing
    gap into each copy makes it exact. `--repeat` proven consumed by the
    keyframes (flipping it to 2 changed the observed wrap jump from one
    period to a full half-track, 1535.7px ≈ 1536.9px).
  - `registry/marquee/index.ts` — barrel: component + props type + cva.
  - `registry.json` — added `marquee` entry (before magnetic-button):
    `tier: "free"`, `dependencies: ["clsx","tailwind-merge",
    "class-variance-authority"]`, tsx → `components/ui/marquee.tsx`,
    `variants: [horizontal, vertical]` (spec did NOT request this file
    but the code-standards review checklist requires a registry entry;
    matches prior components).
  - `app/test-marquee/page.tsx` — server page (Marquee is the client
    boundary) with the spec-exact 5 sections on the Dead palette:
    (1) default horizontal with chip badges, (2) `direction="vertical"`
    speed 20, (3) `pauseOnHover` speed 15, (4) `reverse` + `speed={10}`,
    (5) `blur="none"` — plus a footer note on the loop math and
    reduced-motion. Each `Marquee` carries an `id` (via the component's
    `HTMLAttributes` spread) so the harness can target it.
  VERIFY: `npm run build` zero TS errors, `npm run lint` clean, and
  automated Playwright/Chrome (headless, system Chrome via
  `channel="chrome"`, run under `uv` venv since Python had no playwright):
  **32/32 assertions PASS** incl. two pixel-exact seamlessness proofs:
  - Horizontal (reverse, speed 10): 13.5s rAF sampling → deltas uniform
    (~+0.55px/frame within loop), exactly ONE wrap whose jump =
    +767.7px vs measured copy period 768.4px (≤1px), no mid-loop jumps
    (max 0.80px), empirical loop duration 10.0s. Period constant across
    all copies (768.4/768.4/768.4) and track width = 4·P exactly
    (3073.8px). Gap uniform 16.00px across all 23 chip boundaries
    INCLUDING copy-to-copy boundaries — this is the visible seamproof:
    the neighbors across a wrap boundary are spaced like any two adjacent
    chips.
  - Vertical (speed 20): 21.5s sampling → wrap jump +657.7px vs period
    658.0px measured by first-phrase card spacing.
  - `pauseOnHover`: transforms frozen to 0.00px drift over 800ms hovered,
    resume after unhover (c=−34.19 → d=−76.05 in 800ms).
  - `reverse` = increasing offsets (pos=1619 / small=0 / wrap=1); default
    = decreasing.
  - `blur`: `edges` computed mask-image
    `linear-gradient(to right, transparent, black 10% …)`, `none` → no
    mask.
  - `speed`: empirical 10.0s loop for speed=10.
  - `--repeat` var: runtime override to 2 → wrap jump = half-track.
  - reduced-motion context (`reduced_motion="reduce"`): animation names
    `none`, transforms static.
  - Vertical box height exactly 500px; 24 chips (6 brands × 4 repeats) in
    each horizontal, 28 cards (7 × 4) vertical.
  - Zero console errors, zero page errors.
  Full-page screenshot captured to the temp dir (model cannot render
  images, so confirmation relied on the DOM/computed-style assertions).
  ADAPTATION NOTE (known vertical nicety): the spec's `mask-image` blur
  variants are all `to_right` (left/right fade); a vertical marquee gets
  a side fade rather than a top/bottom fade. Kept spec-verbatim per "do
  not invent behavior"; flagged here for a possible future
  direction-aware blur.
- Feature 09 (feature spec `09-magnetic-button.md`): Component #2
  (Free), the Magnetic Elastic Button — mouse-tracking physics via
  `motion/react` (motion 11.18.2, same dep as Session 2). This is
  the first component in the library that uses Motion for interaction
  physics (all prior animation used GSAP). Files:
  - `registry/magnetic-button/magnetic-button.tsx` — `'use client'`;
    spec-exact cva (4 variant × 3 size × 3 shape) + spec-exact
    `MagneticButtonProps` interface (extends
    `React.ButtonHTMLAttributes<HTMLButtonElement>` + VariantProps,
    adding `children`, `magneticStrength?` (0.4), `elasticity?`
    (0.2)). Junky `useMotionValue` x/y + `useSpring` per axis with
    the spec spring `{ stiffness: 150, damping: 15, mass: 0.8 }`,
    driven by `onMouseMove` (offset from the button center ×
    `magneticStrength`) and reset to 0 by `onMouseLeave`; transform
    applied via motion `style` (GPU transform → zero CLS).
  - `registry/magnetic-button/index.ts` — barrel: component + props
    type + cva variants.
  - `registry.json` — added `magnetic-button` entry before
    text-fill-animation: `tier: "free"`, `dependencies: ["motion"]`,
    tsx → `components/ui/magnetic-button.tsx`, `variants: [default,
    outline, glow, ghost]` (spec did NOT request this file but the
    code-standards review checklist requires a registry entry;
    matches prior components).
  - `app/test-magnetic-button/page.tsx` — server page (MagneticButton
    is the client boundary) with 5 labeled demo sections built on the
    Dead palette: (1) all 4 variants, (2) all 3 sizes, (3) extreme
    pull `magneticStrength={0.8}`, (4) elasticity 0.1/0.2/0.4, (5)
    shapes rounded/soft/sharp — plus a keyboard + reduced-motion
    footnote. Every section has onboarding copy so the pull can be
    felt against real surrounding content.
  VERIFY: `npm run build` zero TS errors, `npm run lint` clean, and
  automated Playwright/Chrome (headless, system Chrome via
  `channel="chrome"`) — 21/21 assertions PASS:
  - All 4 variants pixel-verified: default bg `rgb(250,250,250)` +
    text `rgb(9,9,11)`; outline 1px border `rgb(39,39,42)` + light
    text; glow bg `rgb(220,38,38)` + white text; ghost transparent
    bg + muted text `rgb(161,161,170)`. All 3 sizes 36/44/56px.
  - Physics math verified: hovering 42% off-center at strength 0.4
    yields translate ≈ `0.4 × distance` (x=17.06px vs expected
    0.4×42.6; y=5.2 vs 0.3×44×0.4); strength 0.8 gives x=32.5 (2×).
    Snap-back returns to exactly (0,0) after mouse leave.
  - Elasticity knob CONFIRMED as spring-stiffness scaling: bouncy
    (0.4) overshoots −3.95px past center on return; rigid (0.1)
    0.04px (near-critical). Higher elasticity = springier, exactly
    as documented.
  - Keyboard: Tab reaches the buttons, transform stays (0,0) on
    focus (magnetism only fires on mouse events — spec §4), Enter
    and Space both fire click. Reduced motion (`reduced_motion=
    "reduce"` context): buttons fully static under hover. No CLS:
    neighboring copy stays at identical coords while a button is
    magnetized. Zero console/page errors across the whole run.
  TYPE NOTE — the raw spec JSX `<motion.button {...props}/>` fails
  TypeScript in this stack: `HTMLMotionProps<"button">` redefines
  gesture/animation handler signatures (`onDrag`, `onDrop`,
  `onAnimationStart`, ...) with Motion-style params, so spreading
  `ButtonHTMLAttributes` is rejected (TS2322 on `onDrag`). Fixed
  without touching the public interface or adding `any` by casting
  the rest-spread at the JSX site:
  `{...(props as React.ComponentProps<typeof motion.button>)}`
  (assertion is accepted because HTMLMotionProps is comparable to
  the DOM attributes type). `magneticButtonVariants` lives in the
  same file as the component (single self-import in the spec
  structure sketch is a spec artifact; no self-import needed).
  ADAPTATION — the spec's cva applies class names that do not exist
  in the Tailwind v4 `@theme static` palette (`bg-dead-white`,
  `text-dead-black`, `hover:bg-dead-muted`, `border-dead-border`,
  `hover:bg-dead-surface`, `bg-dead-accent`, `text-dead-muted`,
  `text-dead-white` are all inert in v4 → variants would render
  identically/transparent, failing the spec's own "all variants
  render correctly" check). Same class of issue flagged as cosmetic
  in Session 7 and adapted in Feature 08; per the project precedent
  (identical visual output) the spec names were mapped 1:1 to the
  real tokens: dead-white→dead-50, dead-black→dead-950, dead-muted
  →dead-400, dead-accent→dead-red, dead-surface/dead-border→
  dead-800. Everything else in the cva string is verbatim (incl.
  the `rounded-full` in both base and `shape.round`).
  ADAPTATION 2 — the interface ships `elasticity?: number` but the
  spec's own example structure destructures it without wiring it to
  anything (and its comment, "spring stiffness/damping ratio", is a
  loose hint). Left unused it would be an ESLint unused-var failure;
  wired as stiffness scaling so the DEFAULT 0.2 reproduces the spec
  spring bit-for-bit: `stiffness = 150 × (elasticity / 0.2)`,
  `damping 15`, `mass 0.8` — verified in-browser (see elasticity
  check above). No animation behavior beyond the spec was added.
  ADAPTATION 3 — reduced motion: checklist item said optional; the
  code-standards non-negotiable requires ALL animations to respect
  `prefers-reduced-motion`, so `useReducedMotion()` now zeroes the
  x/y springs entirely when reduced (handlers return early, style
  pins x/y to 0). Keyboard focus never moves the button.
  Screenshots captured (page top + hover clip) but this model cannot
  render image input, so visual confirmation relied on the 21
  DOM/computed-style assertions above instead.
- Feature 08 (feature spec `08-text-fill-animation-pro.md`): first
  Pro-tier component — scroll-linked, velocity-reactive text fill.
  Port of the Obsidian UI Text Fill pattern adapted to Dead UI
  conventions. Files:
  - `registry/text-fill-animation/text-fill-animation.tsx` —
    full `TextFillAnimationProps` interface (exact spec surface:
    text, showDetails, 4 color props, 6 sizing props, start/
    end/scrub/height/viewportHeight, scroller/trigger).
    Plugins registered at module scope under `typeof window
    !== 'undefined'` guard; all GSAP logic in `gsap.matchMedia()`
    scoped to `(prefers-reduced-motion: no-preference)` so the
    reduced-motion branch splits nothing and CSS collapses the
    section. SplitText via `SplitText.create(h2, { type: 'words
    chars', aria: 'auto', tag: 'span', charsClass:
    'split-chars' })`. Single `gsap.timeline()` with
    `scrollTrigger` (start/end/scrub/invalidateOnRefresh;
    scroller/trigger resolved from refs or elements directly) and
    one `.to(characters, { className: 'split-chars show',
    duration: 0.4, stagger: 0.05, ease: 'power2.inOut' })` — the
    keyframes handle the color, GSAP only toggles the class.
    Cleanup: matchMedia callback returns `split.revert()`; effect
    returns `media.revert()`. CSS-variable injection via typed
    inline style vars (`TextFillStyleVars extends
    React.CSSProperties`) holding `--tfa-*` custom props + height/
    backgroundColor on the root `<section>`; sticky inner
    `.tfa-viewport` (`top:0; height:var(--tfa-viewport-height)`)
    gives the pinning with NO GSAP pinning.
  - `registry/text-fill-animation/text-fill-animation.module.css`
    — `@keyframes obsidian-text-fill-color` (0% dim → 30% primary
    → 100% final), `.root` fallback defaults for every `--tfa-*`
    var, `.viewport`, `.glow`, `.wrapper`, `.heading` (base
    desktop + `@media (641-1024px)` tablet + `@media (≤640px)`
    mobile overrides that read `--tfa-*-size/width` vars), global
    `.split-chars` (dim + color transition) and `.split-chars.show`
    (final color + 0.5s keyframe animation) scoped under `.root`,
    and a `@media (prefers-reduced-motion: reduce)` block that
    collapses `.root` to `height: auto !important`, neuters
    sticky, and forces the filled text color. NOTE — Turbopack
    rejected a bare `:global { @keyframes ... }` block
    ("Ambiguous CSS module class not supported"); fixed by
    declaring the keyframes at module top level. Verified in the
    emitted CSS chunk that the hashed keyframe name and its
    `animation:` reference stay consistent, and `.split-chars`/
    `.show` remain literal (SplitText + GSAP className tween write
    global class strings, so they MUST NOT be module-scoped).
  - `registry/text-fill-animation/index.ts` — barrel:
    `TextFillAnimation` + `TextFillAnimationProps` type.
  - `registry.json` — added `text-fill-animation` entry verbatim
    from the spec: `tier: "pro"`, `dependencies: ["gsap"]`,
    tsx → `components/ui/text-fill-animation.tsx`, css →
    `styles/text-fill-animation.module.css`, `variants: []`.
  - `app/test-text-fill/page.tsx` — client page with 6 labeled
    demo sections: (1) default, (2) custom colors (blue #3b82f6
    primary, lighter dim, warm bg #0c0a09), (3) custom sizing
    (3.4vw / 62% width + tablet/mobile overrides), (4) scrub
    {0.1} fast, (5) scrub {1} slow, (6) custom scroller — the
    component pinned inside its own `overflow-y-auto` container
    (`height="850px"`, `viewportHeight="400px"`,
    `scroller={ref}`).
  Verified with `npm run build` (zero TS errors) + automated
  Playwright/Chrome (headless, system Chrome via
  `channel="chrome"`):
  - Split chars = 47 at load, all dim (`rgb(57,57,59)` ≈
    color-mix 20% white / 80% bg), no `.show`, 250vh section.
  - aria: h2 carries `aria-label` equal to the full text; all
    split spans `aria-hidden="true"`.
  - Slow scroll to mid (scrub ≈ 0.5) + 900ms settle: dim=20,
    filled=27, show=27, transition band=0 — narrow, clean edge.
  - Fast instant jump to same position + 90ms sample: band=26
    chars mid-`obsidian-text-fill-color` (computed
    `rgb(161,29,29)`, between dim and the #ff6b00 stop). Velocity
    gradient CONFIRMED: fast band 26 > slow band 0.
  - Full scrub past end: all 47 `.show`, all final
    `rgb(250,250,250)`, band 0.
  - Reduced motion (`Emulation.setEmulatedMedia` reduce): zero
    split chars, section computed height = 151px (collapsed auto,
    not 2000px), heading color `rgb(250,250,250)` = filled state
    instantly.
  - Custom scroller: splits and fully fills (39/39) on inner
    container scroll.
  - Remount (navigate away + back): exactly 47 chars again (no
    stacked SplitText wrappers → matchMedia/media.revert clean),
    chars dim again at top.
  - Zero console errors, zero page errors across the whole run.
  Test-metrics side note: `color-mix()` colors are reported by
  getComputedStyle as 0–1 float scale (`rgb(0.224314,...)`); test
  harness normalized those before RGB distance math.
  Adaptation vs spec: spec's default color props read
  `var(--foreground)`/`var(--background)`, but Tailwind v4
  (this repo) only emits `--color-foreground`/`--color-background`
  tokens; defaults use the real tokens (identical visual output,
  still 100% overridable). `dimColor` default uses those tokens
  inside color-mix per the spec's "color-mix(...)" note.
- Feature 08 bugfix (reported via preview at
  `/test-text-fill`): the sticky `.viewport` never pinned.
  Root cause: `.root { overflow: hidden }` turns the section
  into a scroll container, so the sticky child pins against
  the never-scrolling section instead of the page/container.
  Fixed by switching `.root` to `overflow: clip` (clips the
  same way but does NOT create a scroll container, so sticky
  resolves against the outer scroller). Re-verified: section 1
  `.viewport` top stays at 0 (viewport-relative) across 15%/
  50%/85% of its range, custom-scroller section pins at 1px
  (container border) inside its `overflow-y-auto` box; full
  Playwright suite re-ran green (same velocity/reduced-motion/
  aria/remount numbers), `npm run build` clean.
- Feature 08 extension (user request, spec-addendum): added
  `velocityPrimary?: boolean` (default `true`) to
  `TextFillAnimationProps` so consumers can disable the
  velocity-reactive color without passing a hacky
  `primaryColor={textColor}`. When `false` the component maps
  `--tfa-primary-color` to `textColor` at render time, so the
  `@keyframes obsidian-text-fill-color` 30% stop equals the
  final color and chars go dim → final with no tinted band.
  Purely a CSS-variable change — no GSAP path touched, no
  ScrollTrigger re-measure. Feature spec interface + checklist
  + implementation notes updated (incl. Addendum). Test page
  gained two sections: 7 "NO VELOCITY PRIMARY"
  (`velocityPrimary={false}`, `primaryColor="#ff6b00"` kept
  but ignored, dim `color-mix 18%`, final `#fafafa`) and 8
  "CUSTOM FILL & DIM COLORS" (fill `#fbbf24`, velocity
  `#fb923c`, dim `color-mix 14%`, bg `#1c1917`). Verified via
  computed styles in headless Chrome: with `velocityPrimary
  ={false}` the velocity-tinted band is 0 chars at full speed
  (was 26 with the tint on; max hue across any mid-transition
  char drops 0.19 → 0.004 while the dim→final ramp still
  animates); section 8 shows three distinct endpoint
  colors. `npm run build` clean.
- Feature 07b (feature spec
  `07b-component-cinematic-text-enhancements.md`): added
  advanced scroll config to `CinematicText`. New optional
  props: `start?: string` (default from
  `SCROLL_TRIGGER_DEFAULTS.start`, "top 85%"), `end?: string`
  (default from `SCROLL_TRIGGER_DEFAULTS.end`, "bottom top"),
  `once?: boolean` (default true), `scrub?: boolean | number`
  (default false). The `useEffect` builds a single shared
  `scrollTriggerConfig` object spread into both the
  `gsap.from(split[splitBy])` tween and the container-reveal
  `gsap.to()` tween, so scrub/once/toggleActions stay in sync:
  - `scrub` truthy → `{ scrub: typeof scrub === 'number' ? scrub : true }`
    (GSAP ignores toggleActions/once in scrub mode).
  - `!scrub && once !== false` → `{ once: true }` (default,
    plays once, no reverse).
  - `!scrub && once === false` → `{ toggleActions: 'play none
    none reverse' }` (reverses when scrolling back up).
  - `start`/`end` passed through, falling back to
    `SCROLL_TRIGGER_DEFAULTS`.
  Props added to the `useEffect` deps array and destructured
  out of `...props` so they don't leak onto the DOM div.
  Test page rebuilt as 4 labeled sections separated by
  `h-[100vh]`/`h-[50vh]` spacers: (1) Default fade-up,
  (2) `start="center center"` blur-in, (3) `once={false}`
  slide-stagger words, (4) `scrub={true}` blur-in words.
  Verify via Playwright/Chrome against running dev server:
  default plays once at top 85%; center-center fires with
  element center ≈ viewport center (detected at offset 242 vs
  250 viewport center within 8px sampling granularity);
  repeat reverses to opacity 0 on scroll-back to top while
  default+center stay revealed (once default); scrub opacity
  tracks scrollbar progressively (0.01 → 0.42 → 0.69 → 0.85
  → 0.94 → 0.98) and returns to ~0 when scrolled back out;
  reduced-motion skips splits and forces all containers to
  opacity 1. Zero console/page errors. `npm run build`:
  zero TS errors.
- Feature 07c (discussion-driven refinement, no spec file):
  on review the user flagged that `once={false}` with
  `toggleActions:'play none none reverse'` only played when
  scrolling down (its onEnter slot). Decided (brainstormed +
  user-approved) that `once` = frequency (once total vs every
  entry) and *direction* = a separate axis. Implemented:
  - `once={false}` default is now direction-agnostic
    `'play reverse play reverse'` — plays on every entry
    (both onEnter and onEnterBack) and reverses on every exit
    (onLeave and onLeaveBack), so the reveal repeats every
    time it enters the viewport regardless of scroll
    direction.
  - New `toggleActions?: string` prop passes straight through
    to GSAP and overrides the `once`-derived default for full
    user direction control (`'play none none reverse'` =
    down-only, `'none reverse none none'` = up-only, etc.).
  - Precedence: `scrub` wins > explicit `toggleActions` >
    `once`-derived default. `toggleActions` added to deps and
    destructured out of `...props`.
  - Test page added a "DOWN ONLY" section (once={false} +
    toggleActions="play none none reverse"); REPEAT section
    now demonstrates both-ways replay.
  Verified via Playwright/Chrome: REPEAT hidden at load, plays
  on scroll-down entry, reverses to 0 after leaving top,
  plays again on scroll-up entry (the fix); DOWN ONLY plays
  on down entry, stays revealed after leaving top (onLeave
  none), no reverse on up entry, reverses on exit-bottom
  upward (leaveBack), replays on next down entry. All 9/9
  assertions PASS. `npm run build`: zero TS errors.
- Session 7 (feature spec `07-component-cinematic-text.md`):
  Component #1 Cinematic Text Reveal implemented and fully
  verified. Files: `registry/cinematic-text/cinematic-text.tsx`
  (exact spec code + two shared-default imports),
  `registry/cinematic-text/index.ts` (barrel: component, props
  type, cva variants), `registry.json` (new file — didn't
  exist; first component entry added), and test page
  `app/test-cinematic-text/page.tsx` (spec-exact, incl.
  spec's `dead-*` utility classes).
  Verification pass via `npm run build` (zero TS errors) and
  automated Playwright/Chrome testing of the running dev
  server: chars/words/lines all split; all 4 variants play on
  scroll (invisible at load, revealed after scroll, pixel-
  verified); reduced-motion emulation skips splitting and
  forces container visible; no page/console errors.
  NOTE — spec bug found + fixed (ask-first, user-approved):
  the exact spec code left container permanently invisible.
  cva `opacity-0 blur-[10px]` etc. hid the container, and the
  single `gsap.from(split[splitBy])` tween only animated the
  split children, so CSS parent opacity (0) × child opacity (1)
  kept text invisible even after the tween completed. Fixed by
  adding a matched `gsap.to(containerRef.current, { opacity: 1,
  filter: 'none', y: 0, x: 0, scale: 1, ... })` inside the same
  `gsap.context()`/ScrollTrigger block. Reduced-motion branch
  already set the same state, confirming intent.
  ALSO — spec imports `GSAP_DEFAULTS` and
  `SCROLL_TRIGGER_DEFAULTS` from `@/lib/animations`, which did
  not exist (lib/animations.ts exported EASE/DURATION/SCROLL_START/
  SCROLL_TOGGLE_ACTIONS etc.). Resolved (ask-first, user-approved)
  by adding the two new exports (duration 0.8, stagger 0.05,
  start "top 85%", end "bottom top", toggleActions
  "play none none reverse") rather than deviating from spec code.
  Known test-page nit: spec uses `bg-dead-black`/`text-dead-white`/
  `text-dead-muted`/`text-dead-accent`, but the v4 theme only
  ships `dead-950/50/400/red` + semantic tokens — inert classes
  fall back to body bg/foreground (still dark/light). Cosmetic.
- Session 6 (final verification, feature spec
  `06-cli-scaffold.md`): all 7 files present with exact
  spec code — `package.json` (bin `deadui → dist/index.js`,
  ESM), `tsconfig.json` (strict), `src/index.ts` (shebang +
  commander), `src/commands/add.ts`, and the three
  placeholder utils (`detect-framework.ts`, `install-deps.ts`,
  `fetch-registry.ts`). `dist/` added to `packages/cli/.gitignore`.
  Verify pass: `npm install` clean, `npm run build` zero TS
  errors, dist tree emits `index.js` + `commands/` + `utils/`.
  Tested from repo root: `--help` shows branding/version,
  `add cinematic-text` detects project (`dead-ui`) and prints
  FREE placeholder (exit 0), `add webgl-trail --pro` shows the
  license-token warning (exit 1).
- Session 6 (original scaffold): commander `add` command,
  chalk output, prompts dep reserved for
  Session 8 interactive flows. Package name `deadui`, bin
  `deadui → dist/index.js`, ESM (`"type": "module"`).
- registry fetching, framework detection, dependency install
  logic intentionally deferred to Session 8.

- Next.js 16.3.5 (App Router, Turbopack) + React 19.2.8 +
  TypeScript 5 + Tailwind 4 (`@theme static` Dead palette
  in `app/globals.css`).
- Installed: gsap 3.15, lenis 1.3, motion 11.18, three 0.170,
  @react-three/fiber 9.7, @react-three/drei 10.7,
  class-variance-authority 0.7.1, clsx 2.1.1, tailwind-merge 2.6.1,
  lucide-react, sonner.
- Tailwind token outage found: v4 tree-shakes unused `@theme`
  vars; fixed with `@theme static` so the full palette ships.
- GSAP submodule typing requires importing root `gsap` first so
  the ambient `declare module "gsap/ScrollTrigger"` chain loads;
  `gsap.EaseString` is the canonical ease type.
- Note: ui-context.md red accent token lists #DC2626 in the token
  table but stores #EF4444 as the brand red in Architecture
  Decisions; kept die token table values (#DC2626 accent).

- Project name: Dead UI
- Tagline: "Dead simple animations for React."
- Domain: TBD (check deadui.dev, dead-ui.com)
- GitHub repo: TBD
- Inspired by: Aceternity UI, Magic UI, React Bits,
  Obsidian UI, Codrops, Awwwards
- Key differentiator: Awwwards/Codrops-grade effects
  (not generic micro-interactions), GSAP-powered,
  variant-driven architecture
- Feature 14 (feature spec `14-gradient-border-glow.md`): Component #7,
  Gradient Border Glow (Free) — a wrapper that paints an animated gradient
  into a `width`-thick ring using pure CSS (no JS animation library). This
  entry replaces an earlier, WRONG note from the same feature: that version
  was marked complete on the strength of computed-style `animation-name`
  checks only, and shipped a visibly broken border. The bugs below were found
  by pixel-sampling the rendered border, not by reading the code.
  Files:
  - `registry/gradient-border/gradient-border.tsx` — `'use client'`; cva with
    4 variants (rotating / pulsing / static / spotlight) x 4 radii, and
    `GradientBorderProps` (extends `HTMLAttributes<HTMLDivElement>` +
    VariantProps; `colors`, `speed`, `width`, `blur`, `intensity`). Mouse
    tracking writes `--mouse-x`/`--mouse-y` via `element.style.setProperty`
    (no state) — measured at 0.00px error and 0 React commits.
  - `registry/gradient-border/index.ts` — barrel.
  - `app/globals.css` — `gradient-rotate` / `gradient-pulse` keyframes,
    `.animate-gradient-*` utilities driven by `var(--gb-duration)`, and an
    unlayered `prefers-reduced-motion` block.
  - `app/test-gradient-border/page.tsx` — 5 sections plus two deliberately
    elongated rotating pills (10.5:1 and 19.2:1), which are the shapes that
    expose the coverage bug.

  THE SPEC IS INTERNALLY INCONSISTENT, in two places. Both were followed in
  intent and documented in-file:
  1. The spec's cva puts `animate-gradient-rotate` on the ROOT. A transform on
     the root rotates the content along with the border, and the masking cannot
     work at all. The animation belongs on the glow LAYER (§Implementation
     Logic says so: "rotates the Glow Layer"), so the cva variants are empty
     strings and the layer carries the class. The exported cva string is
     therefore not spec-verbatim.
  2. The spec's example puts `animationDuration` on both glow layers but never
     sets `animationName` on them — with the name only on the root, NEITHER
     layer animates. The blur "duplicate" layer is consequently static in the
     spec's own code, which is what it is here too (it pulses, but does not
     rotate: a soft out-of-focus copy gains nothing from rotating, and rotating
     it would only reintroduce the coverage problem where the eye cannot see
     it).

  THE ACTUAL BUG (the one the user reported twice: "the border is not
  connected, separate borders rotate around the component"). The glow layer was
  `absolute inset-0`, i.e. exactly the card's size. A W x H rectangle does NOT
  keep covering itself under rotation: it only contains itself at multiples of
  90deg, and even then only when square. At 45deg the card's own corners fall
  outside the rotated rectangle, so the border is painted only where the two
  still overlap — which reads as disconnected arcs sliding around the card.
  Measured before the fix: 70-84% of the ring unpainted, and ~25% even on a
  1.3:1 card; the `element is not stable` actionability error from Playwright
  was the same fact surfacing (that element's box really does move).
  FIX: size the rotating layer to the card's DIAGONAL, whose inscribed circle
  contains the card at every angle. `sqrt(w^2 + h^2)` is not expressible in
  CSS, so it is measured once per resize by a `ResizeObserver` and written
  straight to the node (no state, no re-render, nothing in the animation loop).
  Measured after: layer 415x415 for a 325x244 card (diagonal 407), and
  0/1728 ring samples unpainted at 12 sampled angles on 1.3:1, 10.5:1 and
  19.2:1 shapes.
  A `scale()` factor is the tempting fix and was tried first: it brought the
  1.3:1 card to 1.4% but left the 19:1 bar at 57%, because the factor needed
  is `sqrt(r^2+1)` — ~19.2 for that bar, i.e. up to ~370x the raster area. The
  diagonal square is exact for every aspect ratio AND ~6x cheaper than the
  3.5x scale it replaced (0.66MB vs 3.9MB for a 325x244 card). The size does
  not alter the look: a conic gradient's hue depends only on angle around its
  centre, not on radius, and the square is centred on the card.

  FOUR MORE BUGS, all found in the same pass:
  1. `bg-dead-black` (the spec's mask colour) does not exist in this repo's
     Tailwind v4 palette, so the mask was TRANSPARENT and the gradient showed
     through the entire card — the "whole background is rotating" symptom.
     Now `bg-dead-950` (the real token, `#09090b`). Same class of v4-token
     issue adapted in Features 09/10/11.
  2. The `blur` glow was clipped. The root had `overflow: hidden`, and a
     `filter: blur()` on a DESCENDANT is cut off by an ancestor's overflow
     clip — no negative `z-index` and no `transform: scale()` escapes an
     overflow clip, so the spec's `scale(1.05)` "prevent blur clipping" claim
     is false (5% of a ~300px card is ~7px per side against a 16-24px blur).
     FIX: the root is now deliberately unclipped and owns only the radius, the
     pointer handler and the CSS vars; a child "border box" carries the
     padding + `overflow: hidden`. The glow is a sibling of that box, so it
     paints outside the clip. Measured: 6802 lit pixels in the 6-40px band
     outside the card.
  3. `intensity` was DEAD on the `pulsing` variant. A CSS animation beats an
     inline `opacity` in the cascade, so the spec's literal `0.4 -> 1`
     keyframes overrode `opacity: intensity` on every pulsing card. The
     keyframes now scale by `var(--gb-intensity)`; the 0.4 floor is preserved.
  4. `prefers-reduced-motion` was claimed in the previous note but NEVER
     IMPLEMENTED. Added as an unlayered `@media` block, which outranks the
     `@layer utilities` rules without `!important` (the marquee utilities
     needed `!important` only because their opt-out was itself a utility).
     Verified: both animations report `animation-name: none` and the border
     falls back to full opacity.
  Also: `will-change-transform` was applied to every layer including the static
  and spotlight ones, permanently promoting layers that never animate. It is
  now conditional — and note `will-change-opacity` DOES NOT EXIST in Tailwind
  v4 (only `will-change-transform` is emitted, verified in the built CSS), so
  the pulse uses the arbitrary property `[will-change:opacity]`. Dead code
  (an unused `gradientStyle` object) removed.

  VERIFY: `npm run build` zero TS errors, `npm run lint` clean, and automated
  Playwright/Chrome (headless, system Chrome via `channel="chrome"`):
  **27/27 assertions PASS**, zero console/page errors.
  - RING CONTINUITY (the reported bug): 0/1728 unpainted ring samples across
    12 sampled rotation angles for all four rotating targets (4:3 card, 4:3
    fast, 10.5:1 pill, 19.2:1 bar). Measured as "pixel is not the page
    background", sampled along the ring's true midline — separate horizontal
    and vertical spans, since the cards are not square.
  - Root is not the animated element (`animation-name: none` on root and
    border box, `gradient-rotate` on the layer); root `overflow: visible`;
    layer >= diagonal; centring `translate: -50% -50%` composes with the
    keyframes' `transform: rotate()` instead of being overwritten (this is why
    the keyframes need no translate of their own).
  - Blur glow unclipped; `intensity` live on the pulse (0.405..1.000 range,
    capped at 0.320 for `intensity={0.8}`); `will-change` correct per variant.
  - Spotlight: 0.00px tracking error over an 8-point sweep, computed
    `background-image` resolves the vars to real px
    (`radial-gradient(circle at 253px 155px, ...)`), and **delta 0 React
    commits** over 30 mousemoves — with a POSITIVE CONTROL (10 commits after
    mount) so a non-hydrating page cannot fake the result. That control is why
    the first run of this check was a false negative: a partial devtools hook
    silently blocked hydration.
  - Auto-height layout (aspect-ratio removed and taken out of the grid's row
    stretch, so height can only come from content): root 124 = box 124 =
    mask 120 + 2x1px, and the ring is still 0/144 unpainted — the wrapper does
    not collapse when no aspect class is supplied.

  HARNESS TRAPS worth remembering (all three produced FALSE FAILURES first,
  and each would have sent me "fixing" a component that was already correct):
  1. `getBoundingClientRect()` on the rotating layer returns the AABB OF THE
     ROTATION, so it reads as transposed near 90deg (244x325 for a 325x244
     card). It looks like a layout bug and is not; use the card root's box.
  2. Ring sampling must derive the horizontal and vertical spans SEPARATELY.
     Reusing the width-derived range for the left/right edges walks the sample
     into the corner arc and reports a gap that is not there.
  3. Corner rays must scan a NARROW band around the expected ring. A wide ray
     crosses the card's own TEXT, and white text reads as "lit", inventing a
     non-uniform corner. On a tight pill (20px radius) a 0.1mm step is also
     below the pixel grid, so rays near the tangent quantise badly (2.8 vs
     2.0); concentricity is asserted exactly on the computed radius instead.
  Screenshots of the rotating and pulsing sections captured (this model cannot
     render images, so confirmation rested on the pixel/DOM assertions above).

  FOLLOW-UP — DEFAULT `width` 2px -> 1px (user request). The default is now a
  1px hairline. Documentation updated to match: the prop comment in
  `gradient-border.tsx`, and BOTH places in the feature spec that stated the
  default (the props-interface comment and the example's `width = 2`
  destructuring). The spec's cva base was already `p-[1px]`, which is
  consistent. Test-page captions that asserted the default ("4s • 2px • no
  blur" etc.) were corrected to 1px, and the spotlight row was re-cut to
  showcase 1 / 2 / 3 distinctly — its first card now takes NO `width` prop at
  all, so the default is itself exercised rather than restated.

  Two harness traps surfaced by the thinner ring, both FALSE FAILURES:
  1. An element screenshot is ceil(w) x ceil(h), so the final column of a
     325.33px-wide card is only 33% covered by the element and legitimately
     contains page background. Sampling the right edge there reported ~25%
     "gaps" that were all on that single column. Ring samples are now clamped
     to the fully covered pixel core.
  2. A 1px ring on a 12px corner radius is only ~12px across, so `round()` can
     land a sample half a pixel outside the shape. A single-pixel test reported
     a constant 10 false gaps per frame (all inside the corner radius, and
     identical at all 10 sampled angles — the tell that it was sampling, not
     rendering). The test now asks whether any pixel in a 3x3 neighbourhood is
     gradient, which a real multi-pixel gap would still fail.
  After both fixes: 27/27 pass at the 1px default, 0/1728 unpainted ring
  samples on all four rotating targets, and the concentric check reports
  `outer_eff=12 - width=1 -> mask_eff=11`.
  KNOWN 1px CHARACTERISTIC (inherent, not a defect): on an element whose width
  is fractional (here 325.33px, from the 1fr grid track) the outermost column
  is only partly covered, so the right-hand border of a 1px ring is spread
  across two device pixels and reads slightly softer than the other three
  edges. That is a property of 1px borders on fractional boxes, not of this
  component; pass `width={2}` where crispness matters more than weight.
