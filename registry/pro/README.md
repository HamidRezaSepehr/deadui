# 🔒 Dead UI — Pro components (commercial license)

**Pro components are visible in this repository for build/deployment purposes.
However, they are licensed under a commercial license. Usage requires a valid
license key. See [deadui.dev/pro](https://deadui.dev/pro) for details.**

## What this folder is

`registry/pro/<component>/` holds the source for every Pro-tier component. Every
file here carries a `🔒 PRO COMPONENT` header, and the same paths are listed in
the public `registry.json` — the registry is the single source of truth for what
`npx deadui add <component>` installs and where it writes it.

These sources are committed here because the documentation site imports them
directly (`components/landing/hero.tsx`, `components/docs/preview-wrappers.tsx`,
the Pro MDX pages and the `/test-*` routes). Without them this repository cannot
build, and the docs site cannot be deployed.

## Seeing the source is not a license

Readability is not permission. Installing a Pro component through the CLI still
requires a valid license key, which the CLI validates against the Dead UI API
(`/api/validate-license`) **before** any file is fetched or written:

```text
$ npx deadui add webgl-image-trail
⚠ WebGL Image Trail is a Pro component and requires a license key.
  Purchase at: https://deadui.dev/pro
```

A Pro install needs two separate credentials:

1. **A license key** — proof of purchase, validated server-side.
2. **A GitHub PAT** — read access to the `deadui-pro` repository.

Copying a file out of this folder does not grant a license. If you did not buy
one, do not use it.

## Components in this folder

| Component | Tier | Files |
|---|---|---|
| `text-fill-animation` | Pro | `text-fill-animation.tsx`, `text-fill-animation.module.css` |
| `webgl-image-trail` | Pro | `webgl-image-trail.tsx`, `image-plane.tsx`, `shaders.ts`, `index.ts` |

## Related

- Public repository: [HamidRezaSepehr/deadui](https://github.com/HamidRezaSepehr/deadui)
- Private Pro mirror: `HamidRezaSepehr/deadui-pro`
- License terms: [deadui.dev/pro](https://deadui.dev/pro)