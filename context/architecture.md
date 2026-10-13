# Architecture

## System Structure

Dead UI is a monolithic Next.js application that serves three purposes simultaneously:

1. **Documentation Site** (`/docs/*`): Native MDX docs built directly on `@next/mdx` — one `.mdx` page per component. No Nextra, no docs framework dependency.
2. **Landing Page** (`/`): Marketing homepage with live demos, pricing, and social proof.
3. **Component Registry Source**: The actual component source files live in this repo under `registry/` and are fetched by the CLI via raw GitHub URLs.

The CLI (`packages/cli/`) is a separate Node.js package within the same monorepo, published independently to npm.

### Repository Structure

```text
deadui/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing page
│   ├── docs/               # Docs routes; components/<name>/page.mdx
│   ├── globals.css         # Tailwind theme + dead-* tokens (theme-reactive)
│   └── layout.tsx          # Root layout; wraps children in <ThemeProvider>
├── mdx-components.tsx      # Required by @next/mdx: global element mapping
├── next.config.ts          # MDX loader + rehype-slug + Shiki (vesper)
├── registry/               # Component source files
│   ├── cinematic-text/
│   │   ├── cinematic-text.tsx
│   │   ├── use-cinematic-text.ts
│   │   └── cinematic-text.css (if needed)
│   ├── magnetic-button/
│   │   └── magnetic-button.tsx
│   ├── pro/                # Pro component sources (tier-gated, mirrored into
│   │   │                   # the PRIVATE HamidRezaSepehr/deadui-pro repo)
│   │   ├── text-fill-animation/
│   │   │   └── text-fill-animation.tsx (+ .module.css, index.ts)
│   │   └── webgl-image-trail/
│   │       └── webgl-image-trail.tsx (+ image-plane, shaders, index.ts)
│   └── ...
├── registry.json           # Master registry manifest
├── .github/
│   └── workflows/
│       └── publish-cli.yml # Release -> npm publish for packages/cli (OIDC-ready)
├── vercel.json             # Vercel build config for the docs site
├── packages/
│   └── cli/                # CLI package (published to npm)
│       ├── src/
│       │   ├── index.ts    # CLI entry point
│       │   ├── commands/
│       │   │   ├── add.ts
│       │   │   └── init.ts
│       │   └── utils/
│       │       ├── detect-framework.ts
│       │       ├── install-deps.ts
│       │       └── fetch-registry.ts
│       └── package.json
├── lib/                    # Shared utilities
│   ├── utils.ts            # cn() helper
│   ├── animations.ts       # Shared GSAP defaults
│   ├── docs-nav.ts         # Client-safe nav model derived from registry.json
│   ├── docs-nav-server.ts  # Server-only: marks which components have a page
│   └── github.ts           # Server-only: live GitHub star count (1h revalidate)
├── components/
│   ├── ui/                 # Installed shadcn components
│   │   └── ...             # button, dialog, command, select, slider, tabs
│   ├── docs/               # Docs-only building blocks
│   │   ├── top-nav.tsx           # Sticky nav + ⌘K palette + theme toggle + stars
│   │   ├── sidebar.tsx           # Category filters + search + floating preview box
│   │   ├── table-of-contents.tsx # Scroll-spy TOC
│   │   ├── component-customizer.tsx  # Live prop controls for a component
│   │   ├── install-tabs.tsx      # npm/pnpm/yarn/bun commands
│   │   ├── copy-button.tsx       # Mounted by the global `pre` mapping
│   │   ├── preview-wrappers.tsx  # 'use client' adapters for MDX playgrounds
│   │   └── previews/             # Sidebar hover previews (one file per component)
│   └── landing/            # Landing page sections
├── context/                # Spec files (this folder)
└── public/                 # Static assets
```

### Theming

Colour is theme-reactive without a single per-component `dark:` variant.
`app/globals.css` emits every neutral `dead-*` step as `var(--dead-*)` rather than
as a fixed hex, and declares `--dead-*` once for light mode and once under `.dark`.
Both blocks land on the same element (`<html>`), so flipping the class re-points
every `bg-dead-*` / `text-dead-*` / `border-dead-*` utility in the codebase at
once. Each step keeps its ROLE across modes — `950` is the page background,
`50` is the foreground text — and light mode mirrors the ramp rather than
inverting it by name.

`next-themes` owns the class (`<ThemeProvider attribute="class"
defaultTheme="system" enableSystem>` in `app/layout.tsx`), so first load follows
the OS and nothing is written to `localStorage` until a reader chooses. The
`dark:` Tailwind variant is redefined as `&:where(.dark, .dark *)` to match that
class strategy; it defaults to `prefers-color-scheme`, which would ignore an
explicit toggle. Only three class sites still need `dark:` — the tier badges,
which are the sole non-`dead-*` colours left on the site.

Two hydration constraints are load-bearing and easy to undo by accident:

1. `<html>` needs `suppressHydrationWarning`, because the class is written by a
   blocking script before React hydrates.
2. Nothing in a Client Component may read `resolvedTheme` until it is mounted —
   **including `aria-label`s**. `resolvedTheme` is `undefined` on the server but
   already correct on the client's hydration render, so an unguarded label
   produces an unpatchable mismatch. `components/docs/top-nav.tsx` detects mount
   with `useSyncExternalStore` (server snapshot `false`, client snapshot `true`),
   which the repo lint config's `react-hooks/set-state-in-effect` rule also
   forces in preference to the `useEffect` + `setState` idiom.

### Live GitHub Stars

`lib/github.ts` fetches `stargazers_count` with `next: { revalidate: 3600 }`, so
the docs routes became `1h` ISR routes rather than hitting the unauthenticated
rate limit on every render. It returns `0` on any failure rather than throwing: a
star count is decoration and must not take the docs site down. The fetch runs in
`app/docs/layout.tsx` and the number crosses to the Client Component `<TopNav>` as
a plain prop, so the GitHub API is never called from a browser.

### Two Families of `*Preview` Components

The docs site has two unrelated sets of preview components and **four names exist
in both**:

- `components/docs/previews/` — what the sidebar shows on hover. Tiny,
  auto-playing, zero-prop, mounted on hover, rendered into one fixed-size
  `<PreviewStage>`.
- `components/docs/preview-wrappers.tsx` — adapters that let an MDX page hand a
  real registry component to `<ComponentCustomizer>`, forwarding the playground's
  props.

Always import from an explicit path. Of the eleven sidebar previews, three render
the **real** registry component (`rainbow-button`, `marquee`, `gradient-border` —
pure CSS loops with no ScrollTrigger, no pointer dependency and no WebGL, so they
are already auto-playing). The other eight are stand-ins, because the real
component is defined by scroll position (`cinematic-text`, `text-fill-animation`,
`scroll-scrub`, `staggered-grid`), by pointer movement (`magnetic-button`,
`spotlight-card`, `image-trail`) or by a WebGL context (`webgl-image-trail`) —
none of which a 320x208 hover box that mounts on pointer enter can supply. Their
keyframes live in `app/globals.css` alongside the component animations, take
their stagger from `--d`, and are all disabled by the same unlayered
`prefers-reduced-motion` block.

### Docs Rendering Pipeline

MDX is handled by `@next/mdx` with three additions, all configured in
`next.config.ts`:

- **`pageExtensions`** includes `mdx` so `app/docs/**/page.mdx` is routed.
- **`rehype-slug`** generates stable heading `id`s. This is what makes the
  table of contents possible without parsing MDX at runtime.
- **`@shikijs/rehype`** with the `vesper` theme highlights fenced code at build
  time, emitting `pre.shiki` with inline token colours. No runtime highlighter
  ships to the browser.

`mdx-components.tsx` at the repository root is **required** by `@next/mdx` for
App Router: every `.mdx` page resolves its elements through `useMDXComponents()`
there. That file maps `h1`–`h4`, `p`, lists, tables, `code`, `pre`, and friends
onto the `dead-*` tokens, and wraps `pre` in a `group relative` container that
mounts `<CopyButton />`. There is no `prose` plugin and no docs stylesheet.

Docs navigation is derived, never hand-maintained: `lib/docs-nav.ts` builds the
nav model from `registry.json` plus a static route list, and
`lib/docs-nav-server.ts` (server-only, because it touches the filesystem) sets
each component's `href` to `null` when no `page.mdx` exists. The sidebar renders
those as plain text, and the ⌘K palette renders them as disabled "Soon" rows, so
a component can never be navigated to a 404.

### `<ComponentCustomizer>`

The live prop playground is a generic wrapper rather than per-component code: an
MDX page passes a component, a `defaultProps` object, and a `controls` map, and
the wrapper generates the right control per prop type.

- `slider` — `min`/`max`/`step`, numeric prop.
- `select` — `options`, enum prop.
- `color` — string prop holding a CSS colour.
- Anything else — not rendered, so a typo cannot silently produce a dead control.

State is a single `Record<string, unknown>`, initialised from a clone of
`defaultProps`. Every change is a functional update that merges one key, so
independent controls never clobber each other and two controls touching the same
prop still compose. The preview re-renders with the merged props on every change,
which is what "updates the preview in real time" means here: GSAP re-runs its
timeline and `SplitText` re-splits the text.

`defaultProps` must be complete for every prop a control edits. A controlled prop
missing from `defaultProps` starts at the control's `min` (or blank), which
silently disagrees with the component's own default and misrepresents what a user
gets on install.

## Component Registry Model

The `registry.json` file is the single source of truth for what the CLI can install.

### Free vs Pro Source Layout

Sources are split by tier so a future access-control change can treat `registry/pro/`
as one unit:

- Free: `registry/cinematic-text/cinematic-text.tsx`
- Pro: `registry/pro/text-fill-animation/text-fill-animation.tsx`

Every Pro entry in `registry.json` therefore has a `files[].path` under
`registry/pro/`. Tier itself is still decided **only** by the entry's `tier`
field — the directory prefix is a packaging convention, never an authorisation
signal, so a user cannot reach a Pro file by typing its path. The CLI performs
no `registry/pro/` check of its own; the license gate in `add.ts` is the only
thing that stands between a user and a Pro file.

### Multi-file Components and Relative Imports

A component's satellites must be installed **beside** the component that
imports them, because registry sources use sibling-relative specifiers
(`./image-plane`, `./text-fill-animation.module.css`). `webgl-image-trail`
therefore installs into a directory of its own
(`components/ui/webgl-image-trail/…`) with its `index.ts` barrel included, and
`text-fill-animation` keeps its CSS module at
`components/ui/text-fill-animation.module.css`. Both are the paths the docs
pages already tell users to import from.

### Registry Structure

```json
{
  "components": [
    {
      "name": "cinematic-text",
      "title": "Cinematic Text Reveal",
      "description": "GSAP SplitText + ScrollTrigger letter-by-letter reveal",
      "tier": "free",
      "dependencies": ["gsap"],
      "files": [
        {
          "path": "registry/cinematic-text/cinematic-text.tsx",
          "target": "components/ui/cinematic-text.tsx"
        },
        {
          "path": "registry/cinematic-text/use-cinematic-text.ts",
          "target": "hooks/use-cinematic-text.ts"
        }
      ],
      "variants": [
        "blur-in",
        "fade-up",
        "slide-stagger",
        "scale-pop"
      ]
    }
  ]
}
```

### Registry Responsibilities

The registry defines:

- Component names and metadata
- Component tiers
- Runtime dependencies
- Source file paths
- Target installation paths
- Available component variants

The CLI must treat `registry.json` as authoritative and must not infer or guess component files, paths, or dependencies.

## CLI Architecture

The CLI is invoked through:

```bash
npx deadui@latest
```

For example:

```bash
npx deadui@latest add cinematic-text
```

### Installation Flow

```text
Parse Command
      │
      ▼
add <component-name> [--pro]
      │
      ▼
Fetch Registry
      │
      ▼
Lookup Component
      │
      ▼
Tier Check
      │
      ▼
Detect Framework
      │
      ▼
Check Dependencies
      │
      ▼
Copy Files
      │
      ▼
Success Output
```

### 1. Parse Command

Parse the CLI arguments:

```text
add <component-name> [--pro]
```

The MVP supports installing one component per command.

### 2. Fetch Registry

Perform an HTTP `GET` request for `registry.json` from the GitHub raw URL.

- Always the PUBLIC repository — `registry.json` lists both tiers.
- Free component files then come from the same public repository.
- Pro component files come from the private `deadui-pro` repository, with the
  GitHub PAT attached as `Authorization: token <PAT>`.

### 3. Lookup Component

Find the matching component entry by its `name`.

Example:

```text
cinematic-text
```

maps to:

```json
{
  "name": "cinematic-text"
}
```

### 4. Tier Check

If the component has:

```json
{
  "tier": "pro"
}
```

then two gates run before any file is fetched:

1. Prompt for a license key and validate it against the API, or
2. Display a purchase link.
3. Prompt for a GitHub PAT with read access to the private Pro repository.

### 5. Detect Framework

Read the user's `package.json` to detect the project's framework and routing architecture.

Supported environments include:

- Next.js App Router
- Next.js Pages Router
- Vite
- Remix

Framework detection allows the CLI to adapt installation behavior where necessary.

### 6. Check Dependencies

Compare the component's `dependencies` array against the user's `package.json`.

For example:

```json
{
  "dependencies": ["gsap"]
}
```

If `gsap` is not installed, prompt the user to install it:

```bash
npm install gsap
```

### 7. Copy Files

For every file defined in the registry:

1. Fetch the source file from the GitHub raw URL — the public repo for Free
   components, the private `deadui-pro` repo (with the PAT) for Pro.
2. Resolve its configured target path.
3. Write the file into the user's project.

Example:

```json
{
  "path": "registry/cinematic-text/cinematic-text.tsx",
  "target": "components/ui/cinematic-text.tsx"
}
```

results in:

```text
components/ui/cinematic-text.tsx
```

### 8. Success Output

After installation, print:

- Installed files
- Installed dependencies
- Component name
- Basic usage example

Example:

```text
✓ Installed cinematic-text

Files:
  components/ui/cinematic-text.tsx
  hooks/use-cinematic-text.ts

Dependency:
  gsap

Usage:
  <CinematicText>Welcome to Dead UI</CinematicText>
```

## Pro License Validation

### MVP — Zero-Cost Approach

Pro components live in either:

- A private GitHub repository, or
- A gated `pro/` branch in the main repository.

When a user purchases access through a payment provider such as Stripe Payment Links or Gumroad, their GitHub username is manually added as a collaborator to the private repository.

**As shipped (Features 22 + 24): the two-repo split.** `registry/pro/**` is
served by the **private** `HamidRezaSepehr/deadui-pro` repository; everything
else — `registry.json` and all Free sources — is served by the **public**
`HamidRezaSepehr/deadui` repository. `registry.json` stays public and still
lists both tiers, so a Free user can discover Pro components and a Pro user is
told what exists *before* being asked for credentials; only the files it points
at under `registry/pro/` come from the private repo. Registry `path` values are
identical for both tiers — the repository is chosen by `tier`, not by rewriting
the path.

Two independent gates run before any Pro file is fetched or written:

1. **License key** — validated against `/api/validate-license` (overridable with
   `DEADUI_API_URL`). An invalid key exits 1 having written nothing.
2. **GitHub PAT** — read access to `deadui-pro` is a GitHub-side permission, so
   a valid license does not grant it. Sent as `Authorization: token <PAT>`.

Because GitHub answers **404 rather than 403** for private content a token
cannot read, the CLI treats a 404 on a Pro fetch as an access problem and says
so, instead of reporting a broken URL. `DEADUI_REGISTRY_BASE_URL` overrides the
base URL for **both** tiers (any non-`http(s)` value is read as a local
directory, which is how a bare checkout is used for local development).

### Authentication

Pro files are fetched from the private `deadui-pro` repository using a GitHub
Personal Access Token (PAT), prompted for as a masked input at install time:

```text
Enter your GitHub PAT (read access to HamidRezaSepehr/deadui-pro):
```

It can also be passed directly, which is the non-interactive path:

```bash
npx deadui@latest add premium-component --token <LICENSE> --github-token <PAT>
```

The PAT needs the `repo` scope, and the user's GitHub account must have been
added as a collaborator on the private repository. Neither the license key nor
the PAT is ever written to disk — the token is held in memory for the duration
of the install only.

### Future Scaling

When revenue justifies the additional monthly cost, migrate from GitHub-based access control to a dedicated license-key system such as the Lemon Squeezy License API.

## Dependency Model

All animation libraries are treated as **peer dependencies**, rather than bundled dependencies.

The CLI installs required dependencies directly into the user's project.

| Library | Version | Purpose | License |
|---|---|---|---|
| `gsap` | `^3.13+` | ScrollTrigger, SplitText, timelines | Free (Webflow) |
| `lenis` | `^1.1+` | Smooth scrolling | MIT |
| `motion` / `framer-motion` | `^11+` | Layout animations, springs | MIT |
| `three` | `^0.170+` | WebGL rendering (Pro only) | MIT |
| `@react-three/fiber` | `^8+` | React renderer for Three.js | MIT |
| `@react-three/drei` | `^9+` | R3F helpers (Pro only) | MIT |
| `class-variance-authority` | `^0.7+` | Variant management | Apache-2.0 |
| `clsx` | `^2+` | Class merging | MIT |
| `tailwind-merge` | `^2+` | Tailwind class deduplication | MIT |

## Invariants

These rules apply to every component in the registry.

### No CLS

No component shall cause **Cumulative Layout Shift (CLS)**.

Use:

- Explicit dimensions
- `will-change`
- Absolute positioning for animated elements where appropriate

Animated elements should have their layout space established before animation begins.

### No Inline Styles

All styling must use:

- Tailwind CSS classes, or
- CSS modules

#### Exception

GSAP `gsap.set()` may be used for initial transform states when those states must be established before React hydration.

Example:

```ts
gsap.set(element, {
  opacity: 0,
  y: 20,
});
```

### No `any` Types

All public component props must be strictly typed using TypeScript interfaces.

Avoid:

```ts
interface Props {
  [key: string]: any;
}
```

Prefer explicit types:

```ts
interface CinematicTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: "blur-in" | "fade-up" | "slide-stagger" | "scale-pop";
}
```

### Cleanup on Unmount

Every component that registers any of the following must clean them up:

- GSAP timelines
- ScrollTriggers
- Event listeners
- Animation frames

Cleanup must happen inside the appropriate `useEffect` return function.

Example:

```ts
useEffect(() => {
  const ctx = gsap.context(() => {
    // animations
  });

  return () => {
    ctx.revert();
  };
}, []);
```

### SSR Safe

Components that use:

- `window`
- `document`
- DOM APIs

must be SSR-safe.

Use:

```ts
if (typeof window !== "undefined") {
  // browser-only code
}
```

or dynamic imports with:

```ts
ssr: false
```

when appropriate.

### Registry is Truth

The CLI must never guess:

- File paths
- Target paths
- Dependencies
- Component metadata
- Variants

Everything required for installation must be explicitly defined in `registry.json`.

### One Component Per Command

Each CLI `add` command installs exactly **one component** and its direct files.

Batch installation is **not supported in the MVP**.

Example:

```bash
npx deadui@latest add cinematic-text
```

is valid.

A command such as:

```bash
npx deadui@latest add cinematic-text magnetic-button
```

is outside the MVP scope.
