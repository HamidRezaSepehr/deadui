# Feature 21: CLI `init` Command

## Overview

Implement the `init` command for the Dead UI CLI. This command bootstraps a user's project with all the foundational dependencies, utility functions, and Tailwind CSS configurations required to use Dead UI components. It ensures a seamless, "shadcn-style" developer experience where a single command prepares the project for `deadui add`.

## Goals

1. Create the `init` command in the CLI that users can run via `npx deadui@latest init`.
2. Automatically detect and install missing core dependencies (`gsap`, `motion`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`).
3. Generate the `lib/utils.ts` file containing the `cn()` utility function if it doesn't exist.
4. Safely inject Dead UI's custom theme tokens (colors, keyframes, animations) into the user's existing `tailwind.config.ts` (or `.js`/`.mjs`).
5. Verify and configure the `@/*` path alias in `tsconfig.json` to ensure component imports work out of the box.

## Technical Specifications

### Command Syntax
```bash
npx deadui@latest init
```

### Implementation Logic

#### 1. Dependency Installation (`utils/install-deps.ts` update)
- Read the user's `package.json`.
- Check for the presence of: `gsap`, `motion`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`.
- If any are missing, use the existing `prompts` logic to ask the user if they want to install them automatically.

#### 2. Utility Generation (`lib/utils.ts`)
- Check if `lib/utils.ts` (or `src/lib/utils.ts`) exists.
- If it does not exist, create it with the following content:
  ```typescript
  import { clsx, type ClassValue } from "clsx"
  import { twMerge } from "tailwind-merge"

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
  }
  ```
- If it already exists, check if it exports a `cn` function. If not, append it or notify the user.

#### 3. Tailwind Configuration Injection
- Detect the user's Tailwind config file (`tailwind.config.ts`, `.js`, or `.mjs`).
- Read the file content.
- Inject the Dead UI theme tokens into the `theme.extend` object. 
- *MVP Approach for Injection:* Use a robust string replacement or regex to find `theme: { extend: {` and inject the Dead UI colors and keyframes right after it. 
- **Dead UI Tokens to Inject:**
  ```javascript
  colors: {
    dead: {
      black: '#050505', surface: '#0a0a0a', elevated: '#111111',
      white: '#fafafa', muted: '#71717a', accent: '#ef4444',
      'accent-hover': '#dc2626', border: '#27272a', 'border-hover': '#3f3f46',
    }
  },
  keyframes: {
    marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(calc(-100% / var(--repeat, 4)))' } },
    'gradient-rotate': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
    'gradient-pulse': { '0%, 100%': { opacity: '0.4' }, '50%': { opacity: '1' } },
  },
  animation: {
    marquee: 'marquee var(--duration, 30s) linear infinite var(--direction, normal)',
    'gradient-rotate': 'gradient-rotate var(--duration, 4s) linear infinite',
    'gradient-pulse': 'gradient-pulse var(--duration, 4s) ease-in-out infinite',
  }
  ```
- If no Tailwind config is found, prompt the user or create a basic one.

#### 4. Path Alias Verification
- Read `tsconfig.json` (or `tsconfig.app.json`).
- Ensure `compilerOptions.paths` includes `"@/*": ["./src/*"]` or `["./*"]` depending on if they have a `src` directory.
- If missing, inject it and notify the user to restart their IDE.

### Example `init.ts` Command Structure

```typescript
import { promises as fs } from 'fs'
import path from 'path'
import chalk from 'chalk'
import { installDependencies } from '../utils/install-deps.js'
import { detectFramework } from '../utils/detect-framework.js'

export async function initCommand() {
  console.log('')
  console.log(chalk.bold('💀 Dead UI — Initializing project...'))
  console.log('')

  const cwd = process.cwd()
  const framework = detectFramework(cwd)

  // 1. Install Dependencies
  const requiredDeps = ['gsap', 'motion', 'class-variance-authority', 'clsx', 'tailwind-merge', 'lucide-react']
  const packageJsonPath = path.join(cwd, 'package.json')
  let packageJson: any = {}
  try {
    packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))
  } catch { /* handle error */ }

  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies?.[dep])
  if (missingDeps.length > 0) {
    await installDependencies(missingDeps)
  } else {
    console.log(chalk.green('✓') + ' All core dependencies are already installed.')
  }

  // 2. Generate lib/utils.ts
  const utilsDir = path.join(cwd, framework.hasSrc ? 'src/lib' : 'lib')
  const utilsPath = path.join(utilsDir, 'utils.ts')
  await fs.mkdir(utilsDir, { recursive: true })
  
  if (!await fs.access(utilsPath).then(() => true).catch(() => false)) {
    await fs.writeFile(utilsPath, `import { clsx, type ClassValue } from "clsx"\nimport { twMerge } from "tailwind-merge"\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs))\n}\n`)
    console.log(chalk.green('✓') + ' Created lib/utils.ts')
  } else {
    console.log(chalk.dim('•') + ' lib/utils.ts already exists.')
  }

  // 3. Inject Tailwind Config (Simplified string injection for MVP)
  // ... (Implement regex/string replacement to inject dead colors and keyframes)
  console.log(chalk.green('✓') + ' Updated tailwind.config.ts with Dead UI theme tokens.')

  // 4. Verify Path Alias
  // ... (Check tsconfig.json)
  console.log(chalk.green('✓') + ' Verified @/* path alias.')

  console.log('')
  console.log(chalk.green('') + ' Dead UI initialized successfully!')
  console.log(chalk.dim('Run `npx deadui@latest add <component>` to install your first component.'))
  console.log('')
}
```

## Implementation Steps

1. Create `packages/cli/src/commands/init.ts` with the logic outlined above.
2. Update `packages/cli/src/index.ts` to register the `init` command: `program.command('init').description('Initialize your project with Dead UI dependencies and config').action(initCommand)`.
3. Implement the Tailwind config injection logic. (Use a simple regex to find `theme: { extend: {` and inject the tokens. Ensure it handles both single and double quotes).
4. Implement the `tsconfig.json` path alias check.
5. Build the CLI: `cd packages/cli && npm run build`.
6. **Local Testing:** Create a fresh Next.js app in `/tmp`, run `node ../dead-ui/packages/cli/dist/index.js init`, and verify that `utils.ts` is created, dependencies are prompted, and `tailwind.config.ts` is updated.
7. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] `npx deadui@latest init` runs without crashing.
- [ ] Missing dependencies are correctly identified and installed upon user confirmation.
- [ ] `lib/utils.ts` is created with the correct `cn` function.
- [ ] `tailwind.config.ts` successfully receives the `dead` colors and `keyframes` without breaking the existing file syntax.
- [ ] `tsconfig.json` path aliases are verified/updated.
- [ ] Running the command a second time does not duplicate the Tailwind config injections (idempotency).
- [ ] `npm run build` inside `packages/cli/` passes with zero TypeScript errors.
- [ ] `progress-tracker.md` is updated.

## Constraints

- **Idempotency:** The `init` command must be safe to run multiple times. It should not duplicate the `cn` function or inject the Tailwind tokens twice.
- **Non-Destructive:** Do not overwrite the user's existing Tailwind config. Only append/merge the Dead UI tokens.
- **Framework Agnostic:** While optimized for Next.js, the basic dependency and utility generation should work for Vite/Remix as well.

## Files to Create/Update

1. `packages/cli/src/commands/init.ts` (New)
2. `packages/cli/src/index.ts` (Update to register command)
3. `context/progress-tracker.md` (Update)