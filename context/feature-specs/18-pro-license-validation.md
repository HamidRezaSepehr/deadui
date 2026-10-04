# Feature 18: Pro License Validation (MVP)

## Overview

Implement a zero-cost, lightweight license validation system for Dead UI Pro components. When a user attempts to install a Pro component (e.g., `text-fill-animation`, `webgl-image-trail`) via the CLI, the CLI must validate their license key before downloading and writing the files. For the MVP, we will use a free Next.js API route hosted on Vercel alongside the documentation site to validate keys against an environment variable.

## Goals

1. Create a Next.js API route (`/api/validate-license`) to handle license key validation.
2. Update the CLI to prompt for a license key when a Pro component is requested.
3. Update the CLI to send the key to the API and only proceed with file installation if the API returns a valid response.
4. Store valid license keys securely in an environment variable for the MVP.

## Technical Specifications

### 1. API Route: `app/api/validate-license/route.ts`
Create a POST endpoint in the main Dead UI Next.js app.
```typescript
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { key } = await request.json()
    
    if (!key) {
      return NextResponse.json({ valid: false, message: 'No key provided' }, { status: 400 })
    }

    // MVP: Check against comma-separated env var
    const validKeys = process.env.VALID_LICENSE_KEYS?.split(',') || []
    
    if (validKeys.includes(key)) {
      return NextResponse.json({ valid: true, message: 'License validated' })
    }

    return NextResponse.json({ valid: false, message: 'Invalid license key' }, { status: 403 })
  } catch (error) {
    return NextResponse.json({ valid: false, message: 'Server error' }, { status: 500 })
  }
}
```

### 2. CLI Utility: `packages/cli/src/utils/validate-license.ts`
Create a utility to handle the API request from the CLI.
```typescript
import chalk from 'chalk'

const API_BASE_URL = process.env.DEADUI_API_URL || 'https://deadui.dev' // Configurable

export async function validateLicense(key: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/validate-license`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    })

    const data = await response.json()
    return data.valid === true
  } catch (error) {
    console.error(chalk.red('✗') + ' Failed to connect to license server. Check your internet connection.')
    return false
  }
}
```

### 3. CLI Command Update: `packages/cli/src/commands/add.ts`
Modify the existing `add` command logic:
1. After detecting the component is `tier: "pro"`, check if `options.token` (license key) was passed via CLI flag.
2. If not, use `prompts` to interactively ask the user for their license key.
3. Call `validateLicense(key)`.
4. If invalid, print an error and exit.
5. If valid, proceed to fetch the Pro component files (for MVP, Pro files can be stored in a separate `registry-pro/` folder and fetched via a different raw GitHub URL, or returned directly by the API. *For this MVP step, just validate the key and print a success message. Actual Pro file fetching will be handled in a follow-up step once the repo structure is finalized.*)

## Implementation Steps

1. Create `app/api/validate-license/route.ts` in the main Next.js app.
2. Add `VALID_LICENSE_KEYS` to `.env.local` (e.g., `VALID_LICENSE_KEYS="test-key-123,deadui-founder-001"`).
3. Create `packages/cli/src/utils/validate-license.ts`.
4. Update `packages/cli/src/commands/add.ts` to integrate the validation flow for Pro components.
5. Build the CLI: `cd packages/cli && npm run build`.
6. Test locally: Run `node dist/index.js add text-fill-animation` and provide an invalid key, then a valid key.
7. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] API route returns `{ valid: true }` for keys in the env var.
- [ ] API route returns 403 for invalid keys.
- [ ] CLI prompts for a key when adding a Pro component.
- [ ] CLI exits gracefully with a red error message for invalid keys.
- [ ] CLI proceeds (prints success placeholder) for valid keys.
- [ ] `npm run build` passes in both the Next.js app and the CLI package.
- [ ] `progress-tracker.md` is updated.

## Constraints

- **Zero Cost:** Do not use paid services like Lemon Squeezy or Auth0. Use Vercel's free API routes.
- **Security:** Never expose the list of valid keys to the client. Only return a boolean.
- **MVP Scope:** Do not implement the actual fetching of Pro files from a private repo yet. Just validate the key and confirm the flow works.

## Files to Create/Update

1. `app/api/validate-license/route.ts` (New)
2. `.env.local` (Update - add VALID_LICENSE_KEYS)
3. `packages/cli/src/utils/validate-license.ts` (New)
4. `packages/cli/src/commands/add.ts` (Update)
5. `context/progress-tracker.md` (Update)