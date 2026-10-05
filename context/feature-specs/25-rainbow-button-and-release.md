# Feature 25: Rainbow Button Component & v0.1.1 Release

## Overview

Add a new, highly customizable "Rainbow Button" component inspired by MagicUI, featuring multiple creative variations. This feature also serves as the first end-to-end test of the new 4-step Release Workflow to publish `v0.1.1` to npm via GitHub Actions.

## Goals

1. Create a fully customizable `RainbowButton` component with 4 distinct variants: `default`, `outline`, `gradient-text`, and `glow`.
2. Update the CLI `init` command to automatically inject the required `rainbow` keyframe into `tailwind.config.ts` AND the necessary CSS variables (`--color-1` to `--color-5`) into the user's `globals.css`.
3. Add the component to `registry.json`.
4. Create a test page and a fully interactive MDX documentation page using the `<ComponentCustomizer>`.
5. Execute the 4-step Release Workflow: bump version to `0.1.1`, commit, tag, and prompt the user to create the GitHub Release.

## Technical Specifications

### 1. Component Implementation (`registry/rainbow-button/rainbow-button.tsx`)
The component must support the following variants via `class-variance-authority`:
- **`default`**: Solid background with an animated rainbow border and subtle bottom glow (based on MagicUI reference).
- **`outline`**: Transparent background with an animated rainbow border.
- **`gradient-text`**: Transparent background, but the text itself features the animated rainbow gradient.
- **`glow`**: Similar to default, but with a much wider, more pronounced blurred rainbow glow behind the button.

*Note: The component should use `var(--color-1)` through `var(--color-5)` for the gradient. The `init` command will ensure these are defined.*

### 2. CLI `init` Command Update (`packages/cli/src/commands/init.ts`)
The `init` command must now handle two injections:
1. **Tailwind Config**: Add the `rainbow` keyframe and animation to `theme.extend`.
   ```javascript
   keyframes: {
     rainbow: {
       '0%': { 'background-position': '0%' },
       '100%': { 'background-position': '200%' },
     }
   },
   animation: {
     rainbow: 'rainbow var(--speed, 2s) infinite linear',
   }
   ```
2. **Global CSS**: Find `app/globals.css` or `src/app/globals.css`. If `--color-1` is not already present, append the following to the `:root` selector:
   ```css
   --color-1: hsl(0 100% 63%);
   --color-2: hsl(270 100% 63%);
   --color-3: hsl(210 100% 63%);
   --color-4: hsl(195 100% 63%);
   --color-5: hsl(90 100% 63%);
   ```

### 3. Registry Update (`registry.json`)
Add the new component entry:
```json
{
  "name": "rainbow-button",
  "title": "Rainbow Button",
  "description": "An animated button with a customizable rainbow effect.",
  "tier": "free",
  "dependencies": ["class-variance-authority", "clsx", "tailwind-merge"],
  "files": [
    {
      "path": "registry/rainbow-button/rainbow-button.tsx",
      "target": "components/ui/rainbow-button.tsx"
    }
  ]
}
```

### 4. Documentation (`app/docs/components/rainbow-button/page.mdx`)
Use the `<ComponentCustomizer>` with the following configuration:
```tsx
defaultProps={{ 
  children: "Click Me", 
  variant: "default", 
  size: "default" 
}}
controls={{
  variant: { type: "select", options: ["default", "outline", "gradient-text", "glow"] },
  size: { type: "select", options: ["default", "sm", "lg", "icon"] }
}}
```

### 5. The 4-Step Release Workflow (CRITICAL)
As defined in `AGENTS.md`, you MUST execute these steps to publish `v0.1.1`:
1. **Bump Version**: Change `"version"` in `packages/cli/package.json` to `"0.1.1"`.
2. **Commit & Push**: 
   ```bash
   git add .
   git commit -m "feat: add rainbow button and update init script for v0.1.1"
   git push origin main
   ```
3. **Create Tag**: 
   ```bash
   git tag v0.1.1
   git push origin v0.1.1
   ```
4. **Prompt User**: Output clear instructions for the user to go to GitHub UI, draft a new Release for tag `v0.1.1`, and publish it to trigger the npm workflow.

## Implementation Steps

1. Create `registry/rainbow-button/rainbow-button.tsx`.
2. Update `packages/cli/src/commands/init.ts` to inject the rainbow keyframe and CSS variables.
3. Update `registry.json`.
4. Create `app/test-rainbow-button/page.tsx`.
5. Create `app/docs/components/rainbow-button/page.mdx`.
6. Execute the 4-step Release Workflow (bump, commit, tag, prompt).
7. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] `RainbowButton` renders all 4 variants correctly.
- [ ] `init.ts` successfully injects both the Tailwind keyframe and the `globals.css` variables.
- [ ] `registry.json` includes the new component.
- [ ] MDX documentation renders with a working `<ComponentCustomizer>`.
- [ ] The 4-step release workflow is executed, and the user is prompted to create the GitHub Release.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `registry/rainbow-button/rainbow-button.tsx` (New)
2. `packages/cli/src/commands/init.ts` (Update)
3. `registry.json` (Update)
4. `app/test-rainbow-button/page.tsx` (New)
5. `app/docs/components/rainbow-button/page.mdx` (New)
6. `packages/cli/package.json` (Update version to 0.1.1)
7. `context/progress-tracker.md` (Update)