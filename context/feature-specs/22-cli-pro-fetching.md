# Feature 22: CLI Pro Component Fetching

## Overview

Complete the CLI's Pro component installation flow. In Feature 18, we implemented license validation but left the actual file downloading as a stub. This feature updates the `add` command to fetch and write Pro component files (like `text-fill-animation` and `webgl-image-trail`) to the user's project after successful validation. It also ensures Pro-specific dependencies (e.g., `three`, `@react-three/fiber`) are correctly identified and installed.

## Goals

1. Update the `add` command to execute the file fetch/write loop for Pro components after license validation passes.
2. Define a clear repository structure for Pro files (e.g., `registry/pro/[component-name]/`).
3. Ensure the dependency installation logic correctly handles Pro-specific packages.
4. Maintain the existing Free component flow without regression.

## Technical Specifications

### Repository Structure for Pro Files
Pro component source files will be stored in a dedicated `pro/` subdirectory within the registry to allow for future access control or separate packaging if needed.
- Free: `registry/cinematic-text/cinematic-text.tsx`
- Pro: `registry/pro/text-fill-animation/text-fill-animation.tsx`

### Registry Update (`registry.json`)
The `files` array for Pro components must point to the new paths:
```json
{
  "name": "text-fill-animation",
  "tier": "pro",
  "dependencies": ["gsap"],
  "files": [
    {
      "path": "registry/pro/text-fill-animation/text-fill-animation.tsx",
      "target": "components/ui/text-fill-animation.tsx"
    },
    {
      "path": "registry/pro/text-fill-animation/text-fill-animation.module.css",
      "target": "styles/text-fill-animation.module.css"
    }
  ]
}
```

### CLI Logic Updates (`commands/add.ts`)
1. **Remove Placeholder:** Delete the stub success message for Pro components.
2. **Unified Fetch Loop:** The existing file fetch/write loop (currently used for Free components) must run for Pro components immediately after `validateLicense(key)` returns `true`.
3. **Dependency Handling:** The existing `installDependencies` logic already reads `component.dependencies`. Since Pro components list their specific deps (like `three`), the CLI will automatically prompt to install them. No new logic is needed here, but it must be verified.

### Implementation Steps

1. **Update `registry.json`:** Modify the entries for `text-fill-animation` and `webgl-image-trail` to point their `files` paths to the `registry/pro/` directory.
2. **Move Component Files:** In the main Dead UI repo, move the source files for Pro components from `registry/[name]/` to `registry/pro/[name]/`. *(Note: The AI should simulate this path update in the registry JSON. Actual file moving in the main repo is a manual step for the user, but the CLI must be coded to fetch from the new paths).*
3. **Update `commands/add.ts`:** 
   - Ensure the `if (component.tier === 'pro')` block calls `validateLicense`.
   - If valid, fall through to the standard file fetching and writing loop.
   - If invalid, exit.
4. **Verify Dependency Logic:** Confirm that `installDependencies` correctly processes the `dependencies` array for Pro components.
5. **Build & Test:** `cd packages/cli && npm run build`. Test adding a Pro component with a valid key in a local test project.
6. **Update Progress Tracker.**

## Verification Checklist

- [ ] `registry.json` has updated paths for Pro components (`registry/pro/...`).
- [ ] `add.ts` successfully fetches and writes Pro files after license validation.
- [ ] Pro-specific dependencies (e.g., `three`) are prompted for installation.
- [ ] Free components continue to install correctly without license checks.
- [ ] Invalid license keys still block Pro installation.
- [ ] `npm run build` passes with zero TypeScript errors.
- [ ] `progress-tracker.md` is updated.

## Constraints

- Do not change the validation API endpoint.
- Do not alter the Free component installation flow.
- Ensure file paths in `registry.json` are consistent and correctly formatted.

## Files to Update

1. `registry.json` (Update Pro component file paths)
2. `packages/cli/src/commands/add.ts` (Integrate Pro fetch loop)
3. `context/progress-tracker.md`