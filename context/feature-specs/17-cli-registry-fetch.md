# Feature 17: CLI Registry Fetch Logic

## Overview

Upgrade the Dead UI CLI from a scaffolded placeholder to a fully functional installation tool. The CLI must now fetch the `registry.json` manifest from the Dead UI GitHub repository, resolve the requested component, download the raw source files, write them to the user's project directory, and automatically install any missing peer dependencies.

## Goals

1. Implement robust HTTP fetching to retrieve the registry and component files from GitHub raw URLs.
2. Parse the registry to find the requested component and its metadata (files, dependencies, tier).
3. Write the downloaded files to the correct target paths in the user's current working directory.
4. Detect missing dependencies in the user's `package.json` and interactively prompt to install them.
5. Provide clear, color-coded success and error messages using `chalk`.

## Technical Specifications

### Directory Structure Updates

```
packages/cli/
└── src/
    ├── index.ts
    ├── commands/
    │   └── add.ts              # Updated with full fetch/install logic
    └── utils/
        ├── detect-framework.ts # Implement basic framework detection
        ├── install-deps.ts     # Implement interactive dependency installation
        └── fetch-registry.ts   # Implement GitHub raw file fetching
```

### Dependencies (Add to `packages/cli/package.json`)

```json
{
  "dependencies": {
    "commander": "^12.0.0",
    "prompts": "^2.4.2",
    "chalk": "^5.3.0",
    "node-fetch": "^3.3.2" 
  }
}
```
*(Note: Node 18+ has native `fetch`, but `node-fetch` ensures compatibility. Alternatively, use native `fetch` if targeting Node 18+ only. We will use native `fetch` to keep dependencies minimal, as Next.js requires Node 18+).*

### Implementation Logic

#### 1. `utils/fetch-registry.ts`
Fetch the `registry.json` and individual component files from the Dead UI GitHub repository.
```typescript
import chalk from 'chalk'

const REGISTRY_URL = 'https://raw.githubusercontent.com/yourusername/deadui/main/registry.json'
// Note: The AI should replace 'yourusername' with a placeholder or make it configurable. 
// For local testing, we can fallback to reading the local file if the URL fails.

export async function fetchRegistry() {
  try {
    const response = await fetch(REGISTRY_URL)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error(chalk.red('✗') + ' Failed to fetch registry. Check your internet connection or repository URL.')
    process.exit(1)
  }
}

export async function fetchFile(filePath: string) {
  const fileUrl = `https://raw.githubusercontent.com/yourusername/deadui/main/${filePath}`
  try {
    const response = await fetch(fileUrl)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.text()
  } catch (error) {
    console.error(chalk.red('✗') + ` Failed to fetch file: ${filePath}`)
    process.exit(1)
  }
}
```

#### 2. `utils/install-deps.ts`
Check the user's `package.json` and interactively install missing dependencies using `execSync`.
```typescript
import { execSync } from 'child_process'
import prompts from 'prompts'
import chalk from 'chalk'

export async function installDependencies(missingDeps: string[]) {
  if (missingDeps.length === 0) return

  console.log(chalk.yellow('⚠') + ` Missing dependencies: ${chalk.cyan(missingDeps.join(', '))}`)
  
  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: 'Would you like to install them automatically?',
    initial: true,
  })

  if (confirm) {
    console.log(chalk.dim('Installing dependencies...'))
    try {
      execSync(`npm install ${missingDeps.join(' ')}`, { stdio: 'inherit' })
      console.log(chalk.green('✓') + ' Dependencies installed successfully.')
    } catch (error) {
      console.error(chalk.red('✗') + ' Failed to install dependencies. Please install them manually.')
      process.exit( is 1)
    }
  } else {
    console.log(chalk.dim('Skipping dependency installation. You may need to install them manually.'))
  }
}
```

#### 3. `utils/detect-framework.ts`
Basic detection to adjust target paths if necessary (e.g., `src/components` vs `components`).
```typescript
import { existsSync } from 'fs'
import path from 'path'

export function detectFramework(cwd: string) {
  const hasSrc = existsSync(path.join(cwd, 'src'))
  const hasVite = existsSync(path.join(cwd, 'vite.config.ts'))
  const hasNext = existsSync(path.join(cwd, 'next.config.js')) || existsSync(path.join(cwd, 'next.config.ts'))

  return {
    hasSrc,
    isVite: hasVite,
    isNext: hasNext,
    componentDir: hasSrc ? 'src/components' : 'components',
    libDir: hasSrc ? 'src/lib' : 'lib',
  }
}
```

#### 4. `commands/add.ts` (Full Implementation)
Wire everything together.
1. Validate we are in a project (check `package.json`).
2. Fetch the registry.
3. Find the component by name.
4. Check Pro tier requirements (if `--pro`, check for `--token` or mock validation for now).
5. Detect framework to resolve target paths.
6. Check and install missing dependencies.
7. Fetch each file in the component's `files` array and write it to the resolved target path using `fs.promises.writeFile`.
8. Print success message with usage instructions.

### Example `add.ts` Structure

```typescript
import { promises as fs } from 'fs'
import path from 'path'
import chalk from 'chalk'
import { fetchRegistry, fetchFile } from '../utils/fetch-registry.js'
import { installDependencies } from '../utils/install-deps.js'
import { detectFramework } from '../utils/detect-framework.js'

export async function addCommand(componentName: string, options: { pro?: boolean; token?: string }) {
  console.log('')
  console.log(chalk.bold('💀 Dead UI — Adding component...'))
  console.log('')

  const cwd = process.cwd()
  const packageJsonPath = path.join(cwd, 'package.json')
  
  // 1. Verify project
  let packageJson: any = {}
  try {
    const content = await fs.readFile(packageJsonPath, 'utf-8')
    packageJson = JSON.parse(content)
  } catch {
    console.error(chalk.red('✗') + ' Could not find package.json. Are you in a project directory?')
    process.exit(1)
  }

  console.log(chalk.green('✓') + ` Detected project: ${chalk.cyan(packageJson.name || 'unnamed')}`)

  // 2. Fetch registry
  const registry = await fetchRegistry()
  const component = registry.components.find((c: any) => c.name === componentName)

  if (!component) {
    console.error(chalk.red('✗') + ` Component "${componentName}" not found in registry.`)
    console.log(chalk.dim('Available components: ') + registry.components.map((c: any) => c.name).join(', '))
    process.exit(1)
  }

  // 3. Pro check
  if (component.tier === 'pro' && !options.token) {
    console.log(chalk.yellow('⚠') + ' Pro component detected. Please provide a license token with --token')
    console.log(chalk.dim('  Purchase at: https://deadui.dev/pro'))
    process.exit(1)
  }

  // 4. Detect framework
  const framework = detectFramework(cwd)
  console.log(chalk.green('✓') + ` Detected framework setup: ${framework.isNext ? 'Next.js' : framework.isVite ? 'Vite' : 'Generic'}`)

  // 5. Install dependencies
  const missingDeps = component.dependencies.filter((dep: string) => !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep])
  await installDependencies(missingDeps)

  // 6. Fetch and write files
  console.log(chalk.dim(`\nInstalling ${component.title}...`))
  for (const file of component.files) {
    // Resolve target path based on framework detection
    let targetPath = file.target
    if (targetPath.startsWith('components/') && framework.hasSrc) {
      targetPath = targetPath.replace('components/', 'src/components/')
    }
    if (targetPath.startsWith('lib/') && framework.hasSrc) {
      targetPath = targetPath.replace('lib/', 'src/lib/')
    }

    const absoluteTargetPath = path.join(cwd, targetPath)
    const dir = path.dirname(absoluteTargetPath)

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true })

    // Fetch and write
    const content = await fetchFile(file.path)
    await fs.writeFile(absoluteTargetPath, content, 'utf-8')
    console.log(chalk.green('✓') + ` Created: ${chalk.cyan(targetPath)}`)
  }

  console.log('')
  console.log(chalk.green('🎉') + ` ${component.title} installed successfully!`)
  console.log(chalk.dim(`\n📖 Documentation: https://deadui.dev/docs/components/${component.name}`))
  console.log('')
}
```

## Implementation Steps

1. Update `packages/cli/package.json` to ensure `prompts` and `chalk` are listed (add `node-fetch` if not using Node 18+ native fetch, but prefer native `fetch`).
2. Implement `packages/cli/src/utils/fetch-registry.ts` with the GitHub raw URL logic.
3. Implement `packages/cli/src/utils/install-deps.ts` with the interactive `prompts` logic.
4. Implement `packages/cli/src/utils/detect-framework.ts`.
5. Completely rewrite `packages/cli/src/commands/add.ts` to replace the placeholder with the full logic above.
6. Build the CLI: `cd packages/cli && npm run build`.
7. **Local Testing**: Create a temporary Next.js project in `/tmp`, run `node ../dead-ui/packages/cli/dist/index.js add cinematic-text`, and verify the files are created and dependencies are prompted.
8. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] `fetch-registry.ts` successfully fetches JSON from a raw GitHub URL (or handles local fallback gracefully for testing).
- [ ] `install-deps.ts` correctly identifies missing deps and prompts the user.
- [ ] `detect-framework.ts` correctly identifies `src/` directory presence.
- [ ] `add.ts` successfully orchestrates the entire flow without crashing.
- [ ] Running the CLI in a test project creates the files in the correct `components/ui/` or `src/components/ui/` directories.
- [ ] The CLI handles "component not found" gracefully with a helpful error message.
- [ ] `npm run build` inside `packages/cli/` passes with zero TypeScript errors.
- [ ] `progress-tracker.md` is updated.

## Constraints

- Use native `fetch` (Node 18+) to avoid adding heavy dependencies to the CLI.
- Ensure all file writes use `fs.promises` (async/await) to prevent blocking.
- The GitHub URL should be easily configurable (e.g., via an environment variable or a constant at the top of the file) so it can be changed when the repo goes public.
- Do not modify any component source code in this session. Focus strictly on the CLI.

## Files to Create/Update

1. `packages/cli/src/utils/fetch-registry.ts` (Update/Implement)
2. `packages/cli/src/utils/install-deps.ts` (Update/Implement)
3. `packages/cli/src/utils/detect-framework.ts` (Update/Implement)
4. `packages/cli/src/commands/add.ts` (Rewrite)
5. `context/progress-tracker.md` (Update)