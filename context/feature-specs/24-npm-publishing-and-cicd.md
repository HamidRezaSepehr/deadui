# Feature 24: NPM Publishing & CI/CD Pipeline (Two-Repo Architecture)

## Overview

Finalize the Dead UI repository for public launch, automated npm publishing, and Vercel deployment. This feature implements a secure two-repo architecture: a public repo (`deadui`) for free components and the CLI, and a private repo (`deadui-pro`) for Pro components. It also sets up GitHub Actions using OIDC (OpenID Connect) to publish the CLI to npm without requiring deprecated 2FA-bypass tokens.

## Goals

1. Update the CLI to fetch Pro components from the private `HamidRezaSepehr/deadui-pro` repository using a user-provided GitHub Personal Access Token (PAT).
2. Create a GitHub Actions workflow to automatically build and publish the CLI to npm using secure OIDC authentication (no NPM_TOKEN required).
3. Configure `vercel.json` for optimal deployment of the documentation site to `https://deadui.vercel.app/`.
4. Prepare all files for Git commit and provide the exact terminal commands for the user to push to both the public and private repositories.

## Technical Specifications

### 1. CLI Pro Fetch Logic Update
Update `packages/cli/src/utils/fetch-registry.ts` and `packages/cli/src/commands/add.ts` to handle the two-repo split.
- Free components fetch from: `https://raw.githubusercontent.com/HamidRezaSepehr/deadui/main/...`
- Pro components fetch from: `https://raw.githubusercontent.com/HamidRezaSepehr/deadui-pro/main/...`
- When fetching Pro files, the CLI must prompt the user for their GitHub Personal Access Token (PAT) and include it in the request headers: `Authorization: token <USER_PAT>`.

### 2. Registry Update (`registry.json`)
Update the `files` paths for Pro components (`text-fill-animation`, `webgl-image-trail`) to reflect the `registry/pro/` structure, which the CLI will map to the `deadui-pro` repo.

### 3. GitHub Actions OIDC Workflow (`.github/workflows/publish-cli.yml`)
Create a workflow that triggers on GitHub Release creation. It uses `id-token: write` to authenticate with npm securely, bypassing the need for an `NPM_TOKEN` secret.

```yaml
name: Publish CLI to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      id-token: write # Required for OIDC npm authentication
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: cd packages/cli && npm ci
      
      - name: Build CLI
        run: cd packages/cli && npm run build
      
      - name: Publish to npm
        run: cd packages/cli && npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }} # Fallback, but OIDC handles auth if configured in npm
```
*(Note: npm officially supports OIDC. The `NODE_AUTH_TOKEN` can be omitted if npm org settings allow OIDC, but keeping it as a fallback or using `npm set "//registry.npmjs.org/:_authToken=${{ secrets.NPM_TOKEN }}"` is standard. For pure OIDC, npm requires enabling "Enable OpenID Connect" in the npm package access settings. We will set up the YAML for OIDC).*

**Pure OIDC YAML (Recommended):**
```yaml
name: Publish CLI to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20.x'
      
      - name: Install dependencies
        run: cd packages/cli && npm ci
      
      - name: Build CLI
        run: cd packages/cli && npm run build
      
      - name: Publish to npm (OIDC)
        run: |
          cd packages/cli
          echo "//registry.npmjs.org/:_authToken=${{ secrets.NPM_TOKEN }}" >> .npmrc
          # Note: User must enable OIDC in npm package settings, or use a granular token as fallback.
          npm publish --access public
```
*Correction*: Since OIDC setup on npm requires manual UI clicks per package, we will provide the YAML that uses the `NPM_TOKEN` secret as the primary reliable method, but structured so the user can easily swap to pure OIDC later. We will instruct the user to use a Granular Access Token (which does not require 2FA bypass) if they haven't enabled OIDC in npm.

### 4. Vercel Configuration (`vercel.json`)
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### 5. Git Preparation
The AI must stage all changes, create a commit, and output the exact `git remote add` and `git push` commands for the user to execute locally to push to both `HamidRezaSepehr/deadui` and `HamidRezaSepehr/deadui-pro`.

## Implementation Steps

1. Update `registry.json` to point Pro component files to the `registry/pro/` paths.
2. Update `packages/cli/src/utils/fetch-registry.ts` to dynamically switch base URLs and add `Authorization` headers for Pro components.
3. Update `packages/cli/src/commands/add.ts` to prompt for a GitHub PAT when installing a Pro component.
4. Create `.github/workflows/publish-cli.yml`.
5. Create `vercel.json` at the root.
6. Stage all changes and generate the exact Git commands for the user to push to both repositories.
7. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] CLI correctly identifies Pro components and prompts for a GitHub PAT.
- [ ] CLI fetch URLs are correctly mapped to `HamidRezaSepehr/deadui` (Free) and `HamidRezaSepehr/deadui-pro` (Pro).
- [ ] `.github/workflows/publish-cli.yml` is created with correct permissions.
- [ ] `vercel.json` is created at the root.
- [ ] AI provides clear, copy-pasteable Git commands for the user to push the code.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `registry.json` (Update Pro paths)
2. `packages/cli/src/utils/fetch-registry.ts` (Update)
3. `packages/cli/src/commands/add.ts` (Update)
4. `.github/workflows/publish-cli.yml` (New)
5. `vercel.json` (New)
6. `context/progress-tracker.md` (Update)