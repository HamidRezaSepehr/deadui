import { promises as fs } from 'fs'
import path from 'path'
import chalk from 'chalk'

/**
 * Base URL that `registry.json` and every FREE component file are fetched from.
 *
 * The public `deadui` repository holds the registry plus all Free sources, so
 * this URL is also the one `fetchRegistry()` reads: the registry that describes
 * Pro components lives in the PUBLIC repo, and only the files it points at under
 * `registry/pro/` are served from the private repo below.
 */
export const DEFAULT_REGISTRY_BASE_URL =
  'https://raw.githubusercontent.com/HamidRezaSepehr/deadui/main'

/**
 * Base URL that PRO component files are fetched from.
 *
 * `registry/pro/**` is not served by the public repo — it lives in the private
 * `deadui-pro` repository, so a Pro file is only readable with a GitHub token
 * belonging to an account that has been granted access. The registry paths are
 * unchanged (`registry/pro/<name>/<file>`); only the repository they resolve
 * against differs, which is why the same `path` value works for both tiers.
 */
export const PRO_REGISTRY_BASE_URL =
  'https://raw.githubusercontent.com/HamidRezaSepehr/deadui-pro/main'

export type RegistryTier = 'free' | 'pro'

export interface RegistryFile {
  path: string
  target: string
}

export interface RegistryComponent {
  name: string
  title: string
  description?: string
  tier: RegistryTier
  dependencies: string[]
  files: RegistryFile[]
  variants?: string[]
  effects?: string[]
}

export interface Registry {
  components: RegistryComponent[]
}

export interface FetchOptions {
  /** Which repository to read from. Defaults to the public Free repo. */
  tier?: RegistryTier
  /** GitHub PAT. Required — and only ever sent — for `tier: 'pro'`. */
  token?: string
}

/**
 * An HTTP failure from a registry request.
 *
 * The status is kept because Pro and Free failures need DIFFERENT advice: a 404
 * on the private repo almost always means "this token cannot see
 * `deadui-pro`" (GitHub answers 404 rather than 403 for content the caller is
 * not allowed to know exists), which is an access problem, not a broken URL.
 */
export class RegistryFetchError extends Error {
  readonly status: number

  constructor(status: number, statusText: string) {
    super(`HTTP ${status} ${statusText}`)
    this.name = 'RegistryFetchError'
    this.status = status
  }
}

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

/**
 * Resolve the base URL for a tier.
 *
 * `DEADUI_REGISTRY_BASE_URL` overrides BOTH tiers, which is what local
 * development and the test harness use:
 *
 *   DEADUI_REGISTRY_BASE_URL=/path/to/dead-ui node dist/index.js add cinematic-text
 *
 * A single override rather than one per tier is deliberate: a local checkout
 * serves Free and Pro sources from the same `registry/` tree, so splitting the
 * override would force every local run to set two variables to describe one
 * directory.
 *
 * Any non-`http(s)` value is treated as a local directory on disk, and file
 * paths from the registry are resolved relative to it. In that mode no
 * authorization header is sent, because there is no remote to authenticate to.
 */
export function getRegistryBaseUrl(tier: RegistryTier = 'free'): string {
  const configured = process.env.DEADUI_REGISTRY_BASE_URL?.trim()
  const base =
    configured && configured.length > 0
      ? configured
      : tier === 'pro'
        ? PRO_REGISTRY_BASE_URL
        : DEFAULT_REGISTRY_BASE_URL

  return trimTrailingSlash(base)
}

function isRemoteBase(base: string): boolean {
  return base.startsWith('https://') || base.startsWith('http://')
}

async function requestText(filePath: string, options: FetchOptions = {}): Promise<string> {
  const tier = options.tier ?? 'free'
  const base = getRegistryBaseUrl(tier)

  if (isRemoteBase(base)) {
    const headers: Record<string, string> = {}

    // The token is attached on the Pro repository only. A Free request never
    // carries a credential, so there is nothing to leak if a Free URL is ever
    // redirected or logged.
    if (tier === 'pro') {
      const token = options.token?.trim()
      if (!token) {
        throw new Error(
          `a GitHub token is required to read ${PRO_REGISTRY_BASE_URL} (private Pro repository)`
        )
      }
      headers.Authorization = `token ${token}`
    }

    const response = await fetch(`${base}/${filePath}`, { headers })
    if (!response.ok) throw new RegistryFetchError(response.status, response.statusText)
    return await response.text()
  }

  const localBase = base.startsWith('file://') ? new URL(base).pathname : base
  return await fs.readFile(path.join(localBase, filePath), 'utf-8')
}

/**
 * Fetch and validate `registry.json`.
 *
 * Always read from the PUBLIC repository, whatever tier is being installed:
 * the registry has to list every component, Pro included, so that a Free user
 * can discover them and a Pro user is told what exists before being asked for
 * credentials.
 */
export async function fetchRegistry(): Promise<Registry> {
  try {
    const raw = await requestText('registry.json')
    const registry = JSON.parse(raw) as Registry

    if (!registry || !Array.isArray(registry.components)) {
      throw new Error('registry.json does not contain a "components" array')
    }

    return registry
  } catch (error) {
    console.error(
      chalk.red('✗') + ' Failed to fetch registry. Check your internet connection or repository URL.'
    )
    if (error instanceof Error) console.error(chalk.dim(`  ${error.message}`))
    process.exit(1)
  }
}

export async function fetchFile(filePath: string, options: FetchOptions = {}): Promise<string> {
  const tier = options.tier ?? 'free'

  try {
    return await requestText(filePath, options)
  } catch (error) {
    console.error(chalk.red('✗') + ` Failed to fetch file: ${filePath}`)

    if (error instanceof RegistryFetchError && tier === 'pro') {
      if (error.status === 404) {
        console.error(
          chalk.dim(
            '  GitHub returns 404 for private content a token cannot read, so your token'
          )
        )
        console.error(
          chalk.dim('  most likely has no access to HamidRezaSepehr/deadui-pro.')
        )
        console.error(
          chalk.dim('  Check the token has "repo" scope, and that your GitHub account was')
        )
        console.error(chalk.dim('  added as a collaborator on the private Pro repository.'))
      } else if (error.status === 401) {
        console.error(chalk.dim('  Your GitHub token was rejected. Check it has not expired.'))
      }
    }

    if (error instanceof Error) console.error(chalk.dim(`  ${error.message}`))
    process.exit(1)
  }
}