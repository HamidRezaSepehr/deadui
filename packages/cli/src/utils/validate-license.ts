import chalk from 'chalk'

/**
 * Base URL that license validation requests are sent to.
 *
 * NOTE: `https://deadui.dev` is the placeholder production host. It can be
 * overridden at runtime with the `DEADUI_API_URL` environment variable, which
 * is what local development against `next dev` uses:
 *
 *   DEADUI_API_URL=http://localhost:3000 node dist/index.js add text-fill-animation
 */
export const DEFAULT_API_BASE_URL = 'https://deadui.dev'

const REQUEST_TIMEOUT_MS = 10_000

export type LicenseFailureReason = 'network' | 'rejected'

export type LicenseCheck =
  | { valid: true }
  | { valid: false; reason: LicenseFailureReason }

export function getApiBaseUrl(): string {
  const configured = process.env.DEADUI_API_URL?.trim()
  const base = (configured && configured.length > 0 ? configured : DEFAULT_API_BASE_URL).trim()
  return base.endsWith('/') ? base.slice(0, -1) : base
}

/**
 * Ask the Dead UI API whether a license key is valid.
 *
 * Returns `rejected` when the endpoint answered and said no, and `network` when
 * it could not be reached (offline, wrong `DEADUI_API_URL`, non-JSON body from
 * a proxy, timeout) — the two need different advice, so they are not collapsed.
 * The key itself is never printed or logged.
 */
export async function checkLicense(key: string): Promise<LicenseCheck> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/validate-license`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    const data = (await response.json()) as { valid?: unknown }
    if (data.valid === true) return { valid: true }
    return { valid: false, reason: 'rejected' }
  } catch {
    return { valid: false, reason: 'network' }
  }
}

/**
 * Validate a license key against the Dead UI API.
 *
 * Returns `true` only when the API explicitly confirms the key. A failure to
 * reach the server is reported to the user here and also returns `false`.
 */
export async function validateLicense(key: string): Promise<boolean> {
  const result = await checkLicense(key)

  if (result.valid) return true

  if (result.reason === 'network') {
    console.error(
      chalk.red('✗') +
        ' Failed to connect to license server. Check your internet connection.'
    )
  }

  return false
}