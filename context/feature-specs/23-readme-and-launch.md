# Feature 23: GitHub README & Launch Preparation

## Overview

Prepare the Dead UI repository for public launch and npm publishing. This feature focuses on creating a stunning, developer-focused `README.md` that serves as the primary landing page for the GitHub repository. It also ensures all package metadata, ignore files, and contribution guidelines are polished and production-ready.

## Goals

1. Create a comprehensive, beautifully formatted `README.md` with Dead UI branding, quick-start guides, and a visual showcase of Free and Pro components.
2. Update `package.json` files (root app and CLI) with accurate metadata (description, keywords, author, repository links).
3. Create a `.npmignore` file for the CLI package to ensure only necessary files are published to npm.
4. Create a brief `CONTRIBUTING.md` explaining how developers can add new components to the registry.

## Technical Specifications

### 1. The `README.md` Structure
The README must be written in clean Markdown and include the following sections:

```markdown
# 💀 Dead UI

**Dead simple animations for React.**

Dead UI is a CLI-driven, copy-paste animation component library for React and Next.js. It abstracts complex, award-winning web animation patterns into production-ready components that developers can install in under 10 seconds.

![Dead UI Banner](https://via.placeholder.com/1200x400/050505/ef4444?text=Dead+UI+Banner)

## ✨ Features

- **Dead Simple DX**: One command to install. No config files.
- **Awwwards-Grade**: Jaw-dropping scroll, WebGL, and micro-interactions.
- **60fps Performance**: GPU-accelerated, zero layout shift.
- **Fully Typed**: TypeScript-first with strict interfaces.
- **Variant-Driven**: Customize every component via props.

## 🚀 Quick Start

### 1. Initialize your project
```bash
npx deadui@latest init
```

### 2. Add your first component
```bash
npx deadui@latest add cinematic-text
```

### 3. Import and use
```tsx
import { CinematicText } from "@/components/ui/cinematic-text"

export default function Page() {
  return (
    <CinematicText variant="blur-in" className="text-6xl font-bold">
      Dead simple animations.
    </CinematicText>
  )
}
```

## 📦 Components

### Free Components
| Component | Description |
|-----------|-------------|
| **Cinematic Text Reveal** | GSAP SplitText + ScrollTrigger letter-by-letter reveal. |
| **Magnetic Elastic Button** | Framer Motion spring physics button that pulls toward the cursor. |
| **Infinite Blur Marquee** | High-performance, seamlessly looping CSS marquee. |
| **Spotlight Hover Card** | Mouse-tracking radial gradient with optional 3D tilt. |
| **Scroll-Linked Media Scrub** | Map scroll progress to image sequences or video timelines. |
| **Staggered Grid Reveal** | Declarative container for animating lists and grids sequentially. |
| **Gradient Border Glow** | Animated conic-gradient borders (rotating, pulsing, spotlight). |
| **CSS Image Trail** | Lightweight, DOM-based cursor-following image trail (6 effects). |

### Pro Components 🔒
| Component | Description |
|-----------|-------------|
| **Text Fill Animation** | Scroll-linked sticky text fill with velocity-reactive gradient. |
| **WebGL Liquid Image Trail** | React Three Fiber shader-distorted image trail following the mouse. |

*To unlock Pro components, run `npx deadui@latest add <component> --pro` with a valid license key.*

##  Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Animation**: GSAP (ScrollTrigger, SplitText), Framer Motion
- **3D/WebGL**: React Three Fiber, Three.js
- **Styling**: Tailwind CSS, class-variance-authority
- **CLI**: Commander.js, Node Fetch

## 📄 License

Dead UI Free components are open source under the MIT License. 
Pro components require a commercial license. See [deadui.dev/pro](https://deadui.dev/pro) for details.

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting a PR.

---
Built with 💀 by [Your Name/Handle]
```

### 2. Package Metadata Updates
- **Root `package.json`**: Ensure `name` is "dead-ui", `description` matches the tagline, and `repository` points to the GitHub URL.
- **CLI `packages/cli/package.json`**: Ensure `name` is "deadui", `bin` is correctly mapped, and `files` array only includes `dist/`.

### 3. CLI `.npmignore`
Create `packages/cli/.npmignore` to exclude development files from the npm publish:
```text
src/
node_modules/
*.ts
!dist/
```

### 4. `CONTRIBUTING.md`
Create a brief guide at the root:
```markdown
# Contributing to Dead UI

Thank you for your interest in contributing! 

## Adding a New Component
1. Create your component in `registry/[component-name]/`.
2. Follow the architecture defined in `context/architecture.md`.
3. Add the component entry to `registry.json`.
4. Create a test page in `app/test-[component-name]/`.
5. Submit a Pull Request with a clear description and demo video/GIF.
```

## Implementation Steps

1. Create the root `README.md` with the exact structure provided above.
2. Create `CONTRIBUTING.md` at the root.
3. Create `packages/cli/.npmignore`.
4. Update `package.json` (root) and `packages/cli/package.json` with accurate metadata.
5. Verify the repository structure is clean and ready for a public commit.
6. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] `README.md` renders correctly on GitHub (check local preview).
- [ ] `CONTRIBUTING.md` exists and is readable.
- [ ] `packages/cli/.npmignore` exists and excludes `src/`.
- [ ] `package.json` files have correct names and descriptions.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `README.md` (New)
2. `CONTRIBUTING.md` (New)
3. `packages/cli/.npmignore` (New)
4. `package.json` (Update metadata)
5. `packages/cli/package.json` (Update metadata)
6. `context/progress-tracker.md` (Update)