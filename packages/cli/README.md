# Dead UI CLI

Dead simple animations for React.

The `deadui` CLI installs production-ready animation components into React,
Next.js, and Vite projects. Run `init` once, add the components you want, then
own the copied source in your app.

[Documentation](https://deadui.dev/docs) · [npm](https://www.npmjs.com/package/deadui) · [GitHub](https://github.com/HamidRezaSepehr/deadui)

## Quick Start

Initialize Dead UI in your project:

```bash
npx deadui@latest init
```

Add a component:

```bash
npx deadui@latest add cinematic-text
```

Import and use it:

```tsx
import { CinematicText } from "@/components/ui/cinematic-text"

export default function Page() {
  return (
    <CinematicText variant="blur-in" className="text-6xl font-bold">
      Dead simple animations.
    </CinematicText>
  )
}
```

## What `init` Does

`deadui init` prepares an existing project for Dead UI components. It detects
your project layout and applies the setup needed by the registry components:

- Installs core runtime dependencies when they are missing.
- Creates or reuses the `cn()` utility.
- Adds Dead UI theme tokens, keyframes, animations, and rainbow color variables.
- Configures the `@/*` path alias for projects with or without a `src/`
  directory.
- Keeps repeated runs idempotent, so it will not double-inject generated blocks.

## Commands

```bash
npx deadui@latest init
```

Initialize a project with Dead UI dependencies, utility files, Tailwind tokens,
and aliases.

```bash
npx deadui@latest add <component>
```

Install a Free component from the public registry.

```bash
npx deadui@latest add <component> --pro
```

Install a Pro component. The CLI validates your license key before fetching any
Pro files.

```bash
npx deadui@latest add <component> --pro --token <license-key> --github-token <pat>
```

Install a Pro component non-interactively. The GitHub token must have access to
the private Pro registry repository.

## Available Components

### Free

| Name | Install | Description |
| --- | --- | --- |
| Cinematic Text Reveal | `cinematic-text` | GSAP SplitText + ScrollTrigger letter-by-letter reveal. |
| Infinite Blur Marquee | `marquee` | GPU-accelerated marquee with edge blur, vertical mode, pause-on-hover, and reverse. |
| Spotlight Hover Card | `spotlight-card` | Mouse-tracking spotlight card with border glow and optional 3D tilt. |
| Scroll-Linked Media Scrub | `scroll-scrub` | Scroll-linked image sequence or video timeline scrubbing. |
| Gradient Border Glow | `gradient-border` | Animated gradient borders with rotating, pulsing, static, and spotlight variants. |
| Magnetic Elastic Button | `magnetic-button` | Physics-based button that pulls toward the cursor and snaps back elastically. |
| Rainbow Button | `rainbow-button` | Animated rainbow button with outline, gradient-text, and glow variants. |
| CSS Image Trail | `image-trail` | Lightweight DOM image trail with six cursor-following effects and no WebGL. |

### Pro

| Name | Install | Description |
| --- | --- | --- |
| WebGL Image Trail | `webgl-image-trail` | React Three Fiber image trail with liquid, distortion, pixelate, and wave shader effects. |
| Text Fill Animation | `text-fill-animation` | Scroll-linked sticky text fill with a velocity-reactive gradient. |

## Pro Components

Pro components require two credentials:

- A Dead UI license key, passed with `--token` or entered at the prompt.
- A GitHub personal access token with access to the private Pro registry,
  passed with `--github-token` or entered at the prompt.

Example:

```bash
npx deadui@latest add webgl-image-trail --pro --token <license-key> --github-token <pat>
```

The public repository may include Pro source files so the documentation site can
build, but reading the source is not a license. The CLI still validates your
license before installing Pro components.

## Configuration

The CLI supports these environment variables for local development and testing:

| Variable | Purpose |
| --- | --- |
| `DEADUI_API_URL` | Override the API host used for license validation. |
| `DEADUI_REGISTRY_BASE_URL` | Override the registry base URL or point to a local registry checkout. |

## Troubleshooting

### `Could not find package.json`

Run the command from the root of your React, Next.js, or Vite project.

### Component not found

Check the install name in the component tables above. The CLI prints all
available registry component names when a lookup fails.

### Pro install fails

Confirm that your license key is valid and that your GitHub account has access
to the private Pro registry. For non-interactive installs, pass both `--token`
and `--github-token`.

## License

Free components are MIT licensed.

Pro components are commercially licensed and require a valid Dead UI license.
