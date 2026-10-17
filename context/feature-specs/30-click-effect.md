# Feature 30: Click Effect Component

## Overview

Add a new free component, `ClickEffect`, which uses the `@mojs/core` library to render beautiful, high-performance particle and shape burst animations at the user's click coordinates. This component will include 15 pre-configured, Awwwards-grade click effects ported and modernized from a legacy codebase.

## Goals

1. Create `registry/click-effect/effects.ts` containing the 15 cleaned-up, strongly-typed `mo.js` effect configurations.
2. Create `registry/click-effect/click-effect.tsx` as a declarative, behavior-only client component that listens to window clicks and triggers the selected variant.
3. Ensure the CLI `init` or `add` command recognizes `@mojs/core` as a dependency for this component.
4. Create a comprehensive test page `app/test-click-effect/page.tsx` showcasing all 15 variants in an interactive grid.
5. Create the MDX documentation page `app/docs/components/click-effect/page.mdx`.
6. Execute the 4-step Release Workflow for `v0.1.7` and provide manual npm publish instructions.

## Technical Specifications

### 1. Effect Configurations (`registry/click-effect/effects.ts`)
Extract the 15 effects into a clean array. Ensure all `mojs.Burst` and `mojs.Shape` instances are valid. Fix legacy syntax like `{ [2*20]: 0 }` to `{ 40: 0 }`.

```typescript
import mojs from '@mojs/core'

export type ClickEffectVariant = 
  | 'virethos' | 'zynthor' | 'elarisca' | 'gravonix' | 'xypheris'
  | 'vorlana' | 'klyntar' | 'zerionis' | 'marnixus' | 'taviros'
  | 'lothira' | 'xandura' | 'dravonix' | 'voltrisca' | 'elvantis' | 'none'

export interface EffectConfig {
  name: ClickEffectVariant
  animations: {
    requiresGenerate?: boolean
    useRandomCoords?: boolean
    animation: any // mojs.Burst or mojs.Shape
  }[]
}

export const effects: EffectConfig[] = [
  {
    name: 'virethos',
    animations: [
      {
        animation: new mojs.Burst({
          left: 0, top: 0, radius: { 10: 30 }, rotate: 45,
          children: {
            shape: 'line', radius: 3, scale: 1, stroke: '#FD7932',
            strokeDasharray: '100%', strokeDashoffset: { '-100%': '100%' },
            duration: 700, easing: 'quad.out', delay: 150,
          }
        })
      },
      {
        animation: new mojs.Shape({
          left: 0, top: 0, stroke: { '#E5214A': '#FD7932' }, strokeWidth: { 40: 0 },
          fill: 'none', scale: { 0: 1 }, radius: 20, duration: 400, easing: 'cubic.out',
        })
      }
    ],
  },
  // ... (Include all 15 effects from the provided code, cleaned up)
]
```
*(Note to AI: Please port all 15 effects from the user's provided code, ensuring syntax is clean and valid).*

### 2. Component Implementation (`registry/click-effect/click-effect.tsx`)
```tsx
'use client'

import React, { useEffect } from 'react'
import mojs from '@mojs/core'
import { effects, type ClickEffectVariant } from './effects'

export interface ClickEffectProps {
  variant?: ClickEffectVariant
}

export function ClickEffect({ variant = 'virethos' }: ClickEffectProps) {
  useEffect(() => {
    if (variant === 'none') return

    const handleClick = (e: MouseEvent) => {
      const config = effects.find(ef => ef.name === variant)
      if (!config) return

      const coords = { left: e.clientX, top: e.clientY }
      
      config.animations.forEach((wrapper) => {
        const { requiresGenerate, useRandomCoords, animation } = wrapper
        
        if (requiresGenerate && useRandomCoords) {
          const randomCoords = {
            left: e.clientX + (Math.random() * 60 - 30),
            top: e.clientY + (Math.random() * 60 - 30)
          }
          animation.tune(randomCoords).generate().replay()
        } else if (requiresGenerate) {
          animation.tune(coords).generate().replay()
        } else if (useRandomCoords) {
          const randomCoords = {
            left: e.clientX + (Math.random() * 60 - 30),
            top: e.clientY + (Math.random() * 60 - 30)
          }
          animation.tune(randomCoords).replay()
        } else {
          animation.tune(coords).replay()
        }
      })
    }

    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [variant])

  return null // Behavior-only component
}
```

### 3. Test Page (`app/test-click-effect/page.tsx`)
Create a responsive grid of 15 cards. Each card displays the effect name and acts as a click target. When clicked, the global listener will trigger the effect at that exact coordinate. Include a dropdown or state to let the user preview a specific variant globally.

### 4. Documentation (`app/docs/components/click-effect/page.mdx`)
- Explain that this is a behavior-only component meant to be placed at the root of the app (e.g., `layout.tsx`) or a specific container.
- Show the required dependency: `npm install @mojs/core`.
- Provide a code snippet demonstrating usage.

### 5. The 4-Step Release Workflow & Manual Publish
Execute the git workflow for `v0.1.7`, and **CRITICALLY**, provide the manual npm publish commands at the end of your response.

## Implementation Steps

1. Create `registry/click-effect/effects.ts` with all 15 cleaned-up effects.
2. Create `registry/click-effect/click-effect.tsx`.
3. Update `registry.json` to include `@mojs/core` in dependencies and point to the new files.
4. Create `app/test-click-effect/page.tsx`.
5. Create `app/docs/components/click-effect/page.mdx`.
6. Bump `packages/cli/package.json` version to `0.1.7`.
7. Execute git commands: `add`, `commit`, `push`, `tag v0.1.7`, `push tag`.
8. Output GitHub Release UI instructions.
9. **Output the exact manual terminal commands to publish to npm.**
10. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] All 15 effects are ported with valid, modern `mo.js` syntax.
- [ ] The `ClickEffect` component correctly listens to clicks and triggers animations at `clientX`/`clientY`.
- [ ] Randomized effects (`requiresGenerate`) correctly call `.generate()` before `.replay()`.
- [ ] Test page allows easy visual verification of all variants.
- [ ] Documentation clearly explains the behavior-only nature of the component.
- [ ] Git tag `v0.1.7` is pushed.
- [ ] Manual npm publish instructions are clearly provided at the end.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `registry/click-effect/effects.ts` (New)
2. `registry/click-effect/click-effect.tsx` (New)
3. `registry.json` (Update)
4. `app/test-click-effect/page.tsx` (New)
5. `app/docs/components/click-effect/page.mdx` (New)
6. `packages/cli/package.json` (Update version to 0.1.7)
7. `context/progress-tracker.md` (Update)