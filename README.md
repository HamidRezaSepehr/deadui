<div align="center">

# 💀 Dead UI

**Dead simple animations for React.**

[![npm](https://img.shields.io/npm/v/deadui?color=ef4444&labelColor=09090b)](https://www.npmjs.com/package/deadui)
![license](https://img.shields.io/npm/l/deadui?color=ef4444&labelColor=09090b)
[![docs](https://img.shields.io/badge/docs-deadui.dev-ef4444?labelColor=09090b)](https://deadui.dev/docs)

</div>

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

## Tech Stack

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

Built with 💀 by [HamidRezaSepehr](https://github.com/HamidRezaSepehr)
