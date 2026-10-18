# Feature 31: Avatar Circles Component

## Overview

Add a new free component, `AvatarCircles`, which displays a horizontally stacked group of user avatars. The last item in the stack acts as a counter badge (e.g., "+99"). The component is fully adjustable, allowing developers to control the overlap amount, border radius, size, and whether individual avatars are clickable links.

## Goals

1. Create `registry/avatar-circles/avatar-circles.tsx` with highly customizable props.
2. Support an array of avatar objects (name, image URL, optional href link).
3. Allow exact pixel control over the overlap (negative margin) and border radius.
4. Add a hover effect (`z-index` bump and slight scale) for avatars that have an `href`.
5. Create a comprehensive test page `app/test-avatar-circles/page.tsx` showcasing variations.
6. Create the MDX documentation page `app/docs/components/avatar-circles/page.mdx`.
7. Execute the 4-step Release Workflow for `v0.1.8` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/avatar-circles/avatar-circles.tsx`)
```tsx
'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface AvatarItem {
  name: string
  imageUrl: string
  href?: string
}

export interface AvatarCirclesProps extends React.HTMLAttributes<HTMLDivElement> {
  avatars: AvatarItem[]
  numPeople?: number // Number to display in the last badge (e.g., 99 for "+99")
  size?: 'sm' | 'md' | 'lg' | 'xl'
  overlap?: number // Exact pixels of overlap (translates to negative margin-left)
  radius?: 'sm' | 'md' | 'lg' | 'full'
  bordered?: boolean // Adds a solid border to separate overlapping avatars
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

const radiusClasses = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}

export function AvatarCircles({
  avatars,
  numPeople,
  size = 'md',
  overlap = 16, // Default 16px overlap
  radius = 'full',
  bordered = true,
  className,
  ...props
}: AvatarCirclesProps) {
  const displayAvatars = numPeople ? avatars : avatars
  const showCounter = numPeople !== undefined && numPeople > 0

  return (
    <div className={cn('flex items-center', className)} {...props}>
      {displayAvatars.map((avatar, index) => {
        const style = index === 0 ? {} : { marginLeft: `-${overlap}px` }
        const zIndex = 10 + index // Ensure later avatars stack on top
        
        const avatarContent = (
          <div
            className={cn(
              'relative flex-shrink-0 flex items-center justify-center bg-dead-elevated text-dead-muted transition-all duration-200',
              sizeClasses[size],
              radiusClasses[radius],
              bordered && 'border-2 border-dead-surface',
              avatar.href && 'hover:z-50 hover:scale-110 hover:border-dead-accent cursor-pointer'
            )}
            style={{ zIndex }}
          >
            <img
              src={avatar.imageUrl}
              alt={avatar.name}
              className={cn('w-full h-full object-cover', radiusClasses[radius])}
            />
          </div>
        )

        return (
          <React.Fragment key={avatar.name + index}>
            {avatar.href ? (
              <a href={avatar.href} title={avatar.name} style={style}>
                {avatarContent}
              </a>
            ) : (
              <div style={style} title={avatar.name}>
                {avatarContent}
              </div>
            )}
          </React.Fragment>
        )
      })}

      {showCounter && (
        <div
          className={cn(
            'relative flex-shrink-0 flex items-center justify-center bg-dead-accent text-white font-medium transition-all duration-200',
            sizeClasses[size],
            radiusClasses[radius],
            bordered && 'border-2 border-dead-surface'
          )}
          style={{ marginLeft: `-${overlap}px`, zIndex: 10 + displayAvatars.length }}
        >
          +{numPeople}
        </div>
      )}
    </div>
  )
}
```

### 2. Test Page (`app/test-avatar-circles/page.tsx`)
Create a page demonstrating:
1. **Default**: Standard circular avatars with a "+12" counter.
2. **With Links**: Avatars wrapped in `<a>` tags, demonstrating the hover lift and `z-index` bump.
3. **Custom Overlap & Radius**: A tighter overlap (e.g., `overlap={24}`) with rounded corners (`radius="lg"`) instead of full circles.
4. **No Border**: `bordered={false}` for a seamless blend.
5. **Different Sizes**: `sm`, `md`, `lg`, and `xl` variants side-by-side.

### 3. Documentation (`app/docs/components/avatar-circles/page.mdx`)
- Explain the `avatars` array structure and the `numPeople` prop.
- Highlight the `overlap` prop for precise stacking control.
- Provide a clear code snippet showing how to pass linked avatars.
- Update the `<ComponentCustomizer>` controls to allow tweaking `size`, `overlap`, and `radius`.

### 4. The 4-Step Release Workflow & Manual Publish
As defined in `AGENTS.md`, execute the git workflow for `v0.1.8`, and **CRITICALLY**, provide the manual npm publish commands at the end of your response.

## Implementation Steps

1. Create `registry/avatar-circles/avatar-circles.tsx`.
2. Update `registry.json` to include the new component.
3. Create `app/test-avatar-circles/page.tsx`.
4. Create `app/docs/components/avatar-circles/page.mdx`.
5. Bump `packages/cli/package.json` version to `0.1.8`.
6. Execute git commands: `add`, `commit`, `push`, `tag v0.1.8`, `push tag`.
7. Output GitHub Release UI instructions.
8. **Output the exact manual terminal commands to publish to npm.**
9. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] `AvatarCircles` renders correctly with dynamic overlap and radius.
- [ ] Avatars with `href` props are wrapped in `<a>` tags and exhibit hover lift (`z-50`, `scale-110`).
- [ ] The `+{numPeople}` counter renders correctly at the end of the stack.
- [ ] Test page displays all 5 variations clearly.
- [ ] Documentation customizer includes controls for `size`, `overlap`, and `radius`.
- [ ] Git tag `v0.1.8` is pushed.
- [ ] Manual npm publish instructions are clearly provided at the end.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `registry/avatar-circles/avatar-circles.tsx` (New)
2. `registry.json` (Update)
3. `app/test-avatar-circles/page.tsx` (New)
4. `app/docs/components/avatar-circles/page.mdx` (New)
5. `packages/cli/package.json` (Update version to 0.1.8)
6. `context/progress-tracker.md` (Update)