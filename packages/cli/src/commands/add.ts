import { promises as fs } from 'fs'
import path from 'path'
import chalk from 'chalk'
import prompts from 'prompts'
import {
  fetchRegistry,
  fetchFile,
  type Registry,
  type RegistryComponent,
} from '../utils/fetch-registry.js'
import { installDependencies } from '../utils/install-deps.js'
import { detectFramework } from '../utils/detect-framework.js'
import { checkLicense } from '../utils/validate-license.js'

const PRO_PURCHASE_URL = 'https://deadui.dev/pro'
const PRO_TOKEN_URL = 'https://github.com/settings/tokens/new?scopes=repo&description=deadui-pro'
const PRO_REPO = 'HamidRezaSepehr/deadui-pro'

interface UserPackageJson {
  name?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

function resolveTargetPath(target: string, hasSrc: boolean): string {
  let targetPath = target

  if (hasSrc) {
    if (targetPath.startsWith('components/')) {
      targetPath = targetPath.replace('components/', 'src/components/')
    }
    if (targetPath.startsWith('lib/')) {
      targetPath = targetPath.replace('lib/', 'src/lib/')
    }
  }

  return targetPath
}

function describeFramework(framework: ReturnType<typeof detectFramework>): string {
  if (framework.isNext) return 'Next.js'
  if (framework.isVite) return 'Vite'
  return 'Generic'
}

/**
 * Ask for a secret on stdin, masked.
 *
 * `prompts` alone is not safe here: with stdin closed and no answer piped in
 * (a bare CI step, `< /dev/null`) its promise NEVER settles, so the process
 * drains the event loop and exits 0 — a Pro install that validated nothing
 * would look like a success. Racing stdin EOF against the prompt turns that
 * silent exit into a normal "nothing provided" failure, while still allowing a
 * piped answer and Ctrl+C.
 */
function promptSecret(name: string, message: string): Promise<string> {
  return new Promise((resolve) => {
    let settled = false

    const finish = (value: string): void => {
      if (settled) return
      settled = true
      resolve(value)
    }

    process.stdin.once('end', () => finish(''))
    process.stdin.once('error', () => finish(''))

    prompts({
      type: 'password',
      name,
      message,
    })
      .then((response) =>
        finish(typeof response[name] === 'string' ? String(response[name]) : '')
      )
      .catch(() => finish(''))
  })
}

async function resolveSecret(
  provided: string | undefined,
  name: string,
  message: string
): Promise<string | undefined> {
  const trimmed = provided?.trim()
  if (trimmed && trimmed.length > 0) return trimmed

  const entered = (await promptSecret(name, message)).trim()
  return entered.length > 0 ? entered : undefined
}

function resolveLicenseKey(token?: string): Promise<string | undefined> {
  return resolveSecret(token, 'key', 'Enter your Dead UI Pro license key:')
}

/**
 * Resolve the GitHub PAT used to read the private Pro repository.
 *
 * The license key proves the user bought Pro; it does NOT grant read access to
 * `deadui-pro`, which is a GitHub-side permission and so needs a GitHub
 * credential of its own. Both are required, they are different secrets, and
 * they are collected separately: the license key is validated against the Dead
 * UI API first, so a bad key is rejected before asking for a token that would
 * then never be used.
 */
function resolveGitHubToken(token?: string): Promise<string | undefined> {
  return resolveSecret(
    token,
    'githubToken',
    `Enter your GitHub PAT (read access to ${PRO_REPO}):`
  )
}

export async function addCommand(
  componentName: string,
  options: { pro?: boolean; token?: string; githubToken?: string }
): Promise<void> {
  console.log('')
  console.log(chalk.bold('💀 Dead UI — Adding component...'))
  console.log('')

  const cwd = process.cwd()
  const packageJsonPath = path.join(cwd, 'package.json')

  // 1. Verify we are in a project
  let packageJson: UserPackageJson
  try {
    const content = await fs.readFile(packageJsonPath, 'utf-8')
    packageJson = JSON.parse(content) as UserPackageJson
  } catch {
    console.error(
      chalk.red('✗') + ' Could not find package.json. Are you in a project directory?'
    )
    process.exit(1)
  }

  console.log(chalk.green('✓') + ` Detected project: ${chalk.cyan(packageJson.name || 'unnamed')}`)

  // 2. Fetch registry
  const registry: Registry = await fetchRegistry()
  const component: RegistryComponent | undefined = registry.components.find(
    (entry) => entry.name === componentName
  )

  // 3. Lookup component
  if (!component) {
    console.error(chalk.red('✗') + ` Component "${componentName}" not found in registry.`)
    console.log(
      chalk.dim('Available components: ') + registry.components.map((entry) => entry.name).join(', ')
    )
    process.exit(1)
  }

  // 4. Tier check — Pro components need a validated license key AND a GitHub
  //    PAT, because they are served from a private repository rather than the
  //    public one. Both gates run before any file is fetched or written.
  //
  //    INVARIANT: the Pro sources are also committed to the PUBLIC repository
  //    under `registry/pro/`, because this repository's own docs site imports
  //    them and cannot build without them. Their visibility is NOT a licence
  //    and must never be treated as one: this gate is an honour system, and the
  //    only supported way to obtain a Pro component is a validated key. Do not
  //    add a skip flag, an env-var bypass, or an "install without a key" path.
  let githubToken: string | undefined
  if (component.tier === 'pro') {
    console.log(
      chalk.yellow('⚠') + ` ${component.title} is a Pro component and requires a license key.`
    )
    console.log(chalk.dim(`  Purchase at: ${PRO_PURCHASE_URL}`))
    console.log(
      chalk.dim('  Its source is public so the docs site can build, but that is not a')
    )
    console.log(chalk.dim('  license — a valid license key is still required.'))

    const key = await resolveLicenseKey(options.token)

    if (!key) {
      console.error(chalk.red('✗') + ' No license key provided.')
      console.log(chalk.dim('  Reading the source in the public repo does not grant one.'))
      console.log(chalk.dim('  Re-run with --token <key> to skip this prompt.'))
      process.exit(1)
    }

    console.log(chalk.dim('Validating license...'))
    const license = await checkLicense(key)

    if (!license.valid) {
      console.error(
        license.reason === 'network'
          ? chalk.red('✗') +
              ' Failed to connect to license server. Check your internet connection.'
          : chalk.red('✗') + ' Invalid license key.'
      )
      console.log(chalk.dim(`  Purchase at: ${PRO_PURCHASE_URL}`))
      process.exit(1)
    }

    console.log(chalk.green('✓') + ' License validated.')

    // The license key unlocks the component, not the repository. Reading the
    // file needs a GitHub credential, so ask for one now that the key has
    // already been accepted and we know a fetch is actually coming.
    console.log(chalk.dim(`\nPro components are served from the private ${PRO_REPO} repository.`))
    console.log(
      chalk.dim('  Your GitHub account must have been added as a collaborator on it.')
    )

    githubToken = await resolveGitHubToken(options.githubToken)

    if (!githubToken) {
      console.error(chalk.red('✗') + ' No GitHub token provided.')
      console.log(
        chalk.dim(`  Create one with the "repo" scope: ${PRO_TOKEN_URL}`)
      )
      console.log(chalk.dim('  Re-run with --github-token <pat> to skip this prompt.'))
      process.exit(1)
    }
  }

  // 5. Detect framework
  //    Reached by Free components directly, and by Pro components only once the
  //    license and token gates above have passed — everything below this line is
  //    one shared install path for both tiers.
  const framework = detectFramework(cwd)
  console.log(
    chalk.green('✓') + ` Detected framework setup: ${describeFramework(framework)}`
  )

  // 6. Check and install missing dependencies
  const declaredDeps: Record<string, string> = {
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
  }
  const missingDeps = component.dependencies.filter((dep) => !(dep in declaredDeps))
  await installDependencies(missingDeps)

  // 7. Fetch each file and write it to the resolved target path
  //    The tier decides the repository: Free paths resolve against the public
  //    `deadui` repo, `registry/pro/…` paths against the private one, with the
  //    PAT attached. Registry paths are otherwise identical.
  console.log(chalk.dim(`\nInstalling ${component.title}...`))
  for (const file of component.files) {
    const targetPath = resolveTargetPath(file.target, framework.hasSrc)
    const absoluteTargetPath = path.join(cwd, targetPath)

    // Ensure directory exists
    await fs.mkdir(path.dirname(absoluteTargetPath), { recursive: true })

    // Fetch and write
    const content = await fetchFile(file.path, {
      tier: component.tier,
      token: githubToken,
    })
    await fs.writeFile(absoluteTargetPath, content, 'utf-8')
    console.log(chalk.green('✓') + ` Created: ${chalk.cyan(targetPath)}`)
  }

  // 8. Success output
  console.log('')
  console.log(chalk.green('🎉') + ` ${component.title} installed successfully!`)
  console.log(
    chalk.dim(`\n📖 Documentation: https://deadui.dev/docs/components/${component.name}`)
  )
  if (component.tier === 'pro') {
    console.log(
      chalk.dim('🔒 Licensed commercially — installed under your license key. Do not redistribute.')
    )
  }
  console.log('')
}
