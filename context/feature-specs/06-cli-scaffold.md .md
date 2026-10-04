# Feature 06: CLI Package Scaffold

## Overview

Create the foundational CLI package structure that will enable developers to install Dead UI components via `npx deadui@latest add <component>`. This is a separate Node.js package within the monorepo that will be published to npm. For this session, we scaffold the structure and write a minimal working `add` command that detects the project and prints placeholder messages. The full registry-fetching logic will be implemented in a later session.

## Goals

1. Create a standalone CLI package in `packages/cli/`
2. Implement a basic `add` command that detects the user's project
3. Set up the CLI to be executable via `npx deadui@latest`
4. Establish the foundation for future registry-based component installation
5. Ensure the CLI can be built and tested locally

## Scope

### In Scope
- CLI package structure with TypeScript configuration
- `add` command with project detection
- Basic argument parsing and option handling
- Placeholder messages for component installation
- Local build and test workflow

### Out of Scope
- Actual registry fetching from GitHub (later session)
- Pro component license validation (later session)
- Dependency auto-installation (later session)
- File copying logic (later session)
- Publishing to npm (later session)

## Technical Specifications

### Directory Structure

```
packages/cli/
├── src/
│   ├── index.ts              # CLI entry point with commander setup
│   ├── commands/
│   │   └── add.ts            # Add command implementation
│   └── utils/
│       ├── detect-framework.ts    # (placeholder for later)
│       ├── install-deps.ts        # (placeholder for later)
│       └── fetch-registry.ts      # (placeholder for later)
├── package.json
├── tsconfig.json
└── dist/                     # Compiled output (gitignored)
```

### package.json

```json
{
  "name": "deadui",
  "version": "0.1.0",
  "description": "CLI for Dead UI — Dead simple animations for React",
  "type": "module",
  "bin": {
    "deadui": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "commander": "^12.0.0",
    "prompts": "^2.4.2",
    "chalk": "^5.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/prompts": "^2.4.9",
    "typescript": "^5.0.0"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### src/index.ts

The CLI entry point must:
1. Have the `#!/usr/bin/env node` shebang (first line)
2. Use `commander` to define the CLI structure
3. Register the `add` command with proper argument and option parsing
4. Display Dead UI branding in help text

```typescript
#!/usr/bin/env node

import { Command } from 'commander'
import { addCommand } from './commands/add.js'

const program = new Command()

program
  .name('deadui')
  .description('💀 Dead UI — Dead simple animations for React')
  .version('0.1.0')

program
  .command('add')
  .description('Add a Dead UI component to your project')
  .argument('<component>', 'Component name to add (e.g., cinematic-text)')
  .option('--pro', 'Install a Pro component (requires license)')
  .option('--token <token>', 'License token for Pro components')
  .action(addCommand)

program.parse()
```

### src/commands/add.ts

The `add` command must:
1. Print a welcome message with skull emoji
2. Read the user's `package.json` to verify they're in a project directory
3. Check if the component is a Pro tier (placeholder logic)
4. Print placeholder messages indicating the component would be installed
5. Exit cleanly with appropriate status codes

```typescript
import { promises as fs } from 'fs'
import path from 'path'
import chalk from 'chalk'

export async function addCommand(
  component: string,
  options: { pro?: boolean; token?: string }
) {
  console.log('')
  console.log(chalk.bold('💀 Dead UI — Adding component...'))
  console.log('')

  // Step 1: Verify we're in a project directory
  const packageJsonPath = path.join(process.cwd(), 'package.json')
  
  try {
    const content = await fs.readFile(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(content)
    console.log(chalk.green('✓') + ` Detected project: ${chalk.cyan(packageJson.name || 'unnamed')}`)
  } catch {
    console.error(chalk.red('✗') + ' Could not find package.json. Are you in a project directory?')
    process.exit(1)
  }

  // Step 2: Pro tier check (placeholder)
  if (options.pro && !options.token) {
    console.log(chalk.yellow('⚠') + ' Pro component detected. Please provide a license token with --token')
    console.log(chalk.dim('  Purchase at: https://deadui.dev/pro'))
    process.exit(1)
  }

  // Step 3: Placeholder for registry fetch (to be implemented later)
  console.log('')
  console.log(chalk.dim(`  Component: ${chalk.white(component)}`))
  console.log(chalk.dim(`  Tier:      ${options.pro ? chalk.red('PRO') : chalk.green('FREE')}`))
  console.log('')
  console.log(chalk.yellow('⚠') + ' Registry fetch not yet implemented. This is a scaffold.')
  console.log(chalk.dim('  Full implementation coming in a later session.'))
  console.log('')
}
```

### Placeholder Utility Files

Create empty placeholder files for future sessions:

**src/utils/detect-framework.ts**
```typescript
// Placeholder for future: Framework detection logic
export function detectFramework() {
  // TODO: Implement framework detection
  return 'nextjs'
}
```

**src/utils/install-deps.ts**
```typescript
// Placeholder for future: Dependency installation logic
export async function installDependencies(deps: string[]) {
  // TODO: Implement dependency installation
  console.log('Would install:', deps.join(', '))
}
```

**src/utils/fetch-registry.ts**
```typescript
// Placeholder for future: Registry fetching logic
export async function fetchRegistry() {
  // TODO: Implement registry fetching from GitHub
  return { components: [] }
}
```

## Implementation Steps

1. **Create directory structure**: `mkdir -p packages/cli/src/commands packages/cli/src/utils`
2. **Create package.json**: Copy the JSON specification above
3. **Create tsconfig.json**: Copy the JSON specification above
4. **Create src/index.ts**: Copy the TypeScript code above
5. **Create src/commands/add.ts**: Copy the TypeScript code above
6. **Create placeholder utility files**: Copy the three placeholder files above
7. **Install dependencies**: `cd packages/cli && npm install`
8. **Build the CLI**: `npm run build`
9. **Test locally**: 
   - `node packages/cli/dist/index.js --help`
   - `node packages/cli/dist/index.js add cinematic-text`
   - `node packages/cli/dist/index.js add webgl-trail --pro`

## Verification Checklist

- [ ] `packages/cli/package.json` exists with correct `bin` field pointing to `./dist/index.js`
- [ ] `packages/cli/tsconfig.json` exists with strict mode enabled
- [ ] `packages/cli/src/index.ts` has the shebang on the first line
- [ ] `packages/cli/src/index.ts` uses commander to define the CLI structure
- [ ] `packages/cli/src/commands/add.ts` implements the add command with project detection
- [ ] All three placeholder utility files exist in `packages/cli/src/utils/`
- [ ] `npm install` inside `packages/cli/` completes successfully
- [ ] `npm run build` inside `packages/cli/` completes with zero TypeScript errors
- [ ] `node packages/cli/dist/index.js --help` displays Dead UI branding and version
- [ ] `node packages/cli/dist/index.js add cinematic-text` runs without crashing and shows placeholder message
- [ ] `node packages/cli/dist/index.js add webgl-trail --pro` shows license token warning
- [ ] `progress-tracker.md` has been updated to reflect Session 6 completion

## Constraints

- Do NOT implement actual registry fetching (that's a later session)
- Do NOT implement dependency auto-installation (that's a later session)
- Do NOT implement file copying logic (that's a later session)
- Do NOT build any animation components (that's a later session)
- Do NOT modify any files outside `packages/cli/` except `progress-tracker.md`
- Do NOT set up Nextra documentation (that's a later session)
- If anything is unclear, ask BEFORE implementing — do not guess

## Success Criteria

1. The CLI package builds successfully with zero TypeScript errors
2. The CLI can be executed locally via `node packages/cli/dist/index.js`
3. The `add` command detects the project and prints appropriate messages
4. The CLI structure is ready for future registry fetch implementation
5. All verification checks pass

## Dependencies

- `commander` ^12.0.0 — CLI framework
- `prompts` ^2.4.2 — Interactive prompts (for future use)
- `chalk` ^5.3.0 — Terminal string styling
- `@types/node` ^20.0.0 — Node.js type definitions
- `@types/prompts` ^2.4.9 — Prompts type definitions
- `typescript` ^5.0.0 — TypeScript compiler

## Files to Create

1. `packages/cli/package.json`
2. `packages/cli/tsconfig.json`
3. `packages/cli/src/index.ts`
4. `packages/cli/src/commands/add.ts`
5. `packages/cli/src/utils/detect-framework.ts`
6. `packages/cli/src/utils/install-deps.ts`
7. `packages/cli/src/utils/fetch-registry.ts`

## Files to Update

1. `context/progress-tracker.md` — Mark Session 6 as complete

## Next Steps After Completion

Once this session is verified:
- Session 7: Build Component #1 — Cinematic Text Reveal
- Session 8: Implement CLI Registry Fetch Logic
- Session 9: Implement Pro License Validation
- Session 10: Write MDX Documentation for Component #1