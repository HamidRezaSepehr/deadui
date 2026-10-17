# Feature 29: Text Video Mask Component

## Overview

Add a new free component, `TextVideoMask`, which displays a playing video clipped perfectly inside text characters. This creates a stunning, premium visual effect often seen on Awwwards-winning sites. We will use an SVG `<mask>` with `<foreignObject>` to ensure maximum compatibility and allow users to style the text with any Tailwind classes.

## Goals

1. Create `registry/text-video-mask/text-video-mask.tsx` using the SVG mask + foreignObject technique.
2. Allow the component to accept a `videoSrc` (string), `children` (the text/HTML to act as the mask), and standard className props for both the container and the text.
3. Ensure the video auto-plays, loops, is muted, and plays inline (required for mobile browsers).
4. Create a comprehensive test page `app/test-text-video-mask/page.tsx` showcasing different fonts, sizes, and video sources.
5. Create the MDX documentation page `app/docs/components/text-video-mask/page.mdx` with a live preview and code snippets.
6. Execute the 4-step Release Workflow for `v0.1.6` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/text-video-mask/text-video-mask.tsx`)
The component must use the following structure to ensure the video is masked by the React children:

```tsx
'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface TextVideoMaskProps extends React.HTMLAttributes<HTMLDivElement> {
  videoSrc: string
  children: React.ReactNode
  textClassName?: string
}

export function TextVideoMask({
  videoSrc,
  children,
  className,
  textClassName,
  ...props
}: TextVideoMaskProps) {
  const maskId = React.useId()

  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)} {...props}>
      {/* The Video Element */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          mask: `url(#${maskId})`,
          WebkitMask: `url(#${maskId})`,
        }}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* The SVG Mask Definition */}
      <svg className="absolute w-0 h-0">
        <defs>
          <mask id={maskId}>
            {/* White reveals the video, black hides it */}
            <rect width="100%" height="100%" fill="white" />
            <foreignObject width="100%" height="100%">
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                className={cn(
                  'w-full h-full flex items-center justify-center',
                  textClassName
                )}
              >
                {children}
              </div>
            </foreignObject>
          </mask>
        </defs>
      </svg>
    </div>
  )
}
```

### 2. Test Page (`app/test-text-video-mask/page.tsx`)
Create a page demonstrating:
1. **Basic Bold Text**: Large, black, font-black text masking a nature/abstract video.
2. **Outlined Text**: Text with `text-transparent stroke-white stroke-2` (if supported) or a fallback showing how typography styles affect the mask.
3. **Multi-line/Complex HTML**: A heading and subheading masked together, proving the `<foreignObject>` handles complex layouts.

### 3. Documentation (`app/docs/components/text-video-mask/page.mdx`)
- Explain the `videoSrc` and `children` props.
- Provide a clear code snippet showing how to use it.
- Note: Recommend using short, optimized, muted MP4 videos for best performance.

### 4. The 4-Step Release Workflow & Manual Publish
As defined in `AGENTS.md`, execute the git workflow for `v0.1.6`, and **CRITICALLY**, provide the manual npm publish commands at the end of your response.

## Implementation Steps

1. Create `registry/text-video-mask/text-video-mask.tsx`.
2. Create `app/test-text-video-mask/page.tsx`.
3. Create `app/docs/components/text-video-mask/page.mdx`.
4. Update `registry.json` to include the new component.
5. Bump `packages/cli/package.json` version to `0.1.6`.
6. Execute git commands: `add`, `commit`, `push`, `tag v0.1.6`, `push tag`.
7. Output GitHub Release UI instructions.
8. **Output the exact manual terminal commands to publish to npm.**
9. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] `TextVideoMask` renders correctly and the video is only visible inside the text.
- [ ] The video auto-plays, loops, and is muted (no browser autoplay blocks).
- [ ] Complex HTML/Tailwind classes passed as `children` render correctly inside the mask.
- [ ] Test page displays all examples without layout shifts.
- [ ] Documentation is complete with code snippets.
- [ ] Git tag `v0.1.6` is pushed.
- [ ] Manual npm publish instructions are clearly provided at the end.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `registry/text-video-mask/text-video-mask.tsx` (New)
2. `registry.json` (Update)
3. `app/test-text-video-mask/page.tsx` (New)
4. `app/docs/components/text-video-mask/page.mdx` (New)
5. `packages/cli/package.json` (Update version to 0.1.6)
6. `context/progress-tracker.md` (Update)