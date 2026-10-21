# Feature 42: Typewriter Component

## Overview

Add a new free component, `Typewriter`, which creates a classic, engaging text-typing animation. Built on top of the robust `typewriter-effect` library, this component offers full customizability for typing speed, looping, and highly specialized control over the blinking cursor's color, width, and height.

## Goals

1. Create `registry/typewriter/typewriter.tsx` that wraps the `typewriter-effect` library, exposing clean React props for all common configurations.
2. Provide specialized props for the cursor: `cursorColor`, `cursorWidth`, and `cursorHeight`, rendering a custom-styled cursor element.
3. Update `registry.json` to include `typewriter-effect` as a dependency.
4. Create a comprehensive test page `app/test-typewriter/page.tsx` showcasing different configurations (single text, multiple texts, custom cursors).
5. Create the MDX documentation page `app/docs/components/typewriter/page.mdx`.
6. Execute the 4-step Release Workflow for `v0.1.18` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/typewriter/typewriter.tsx`)
```tsx
"use client"

import React, { type HTMLAttributes } from "react"
import TypewriterComponent from "typewriter-effect"
import { cn } from "@/lib/utils"

export interface TypewriterProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  text: string | string[]
  delay?: number
  deleteSpeed?: number
  loop?: boolean
  autoStart?: boolean
  cursor?: string
  cursorColor?: string
  cursorWidth?: string
  cursorHeight?: string
  onComplete?: () => void
}

export function Typewriter({
  text,
  delay = 50,
  deleteSpeed,
  loop = false,
  autoStart = true,
  cursor = "|",
  cursorColor = "currentColor",
  cursorWidth = "2px",
  cursorHeight = "1em",
  onComplete,
  className,
  ...props
}: TypewriterProps) {
  // Create a custom cursor element to have full control over its styling
  const customCursor = (
    <span
      style={{
        color: cursorColor,
        width: cursorWidth,
        height: cursorHeight,
        display: "inline-block",
        verticalAlign: "middle",
        marginLeft: "2px",
      }}
    >
      {cursor}
    </span>
  )

  const texts = Array.isArray(text) ? text : [text]

  return (
    <div className={cn("inline-flex items-center", className)} {...props}>
      <TypewriterComponent
        options={{
          strings: texts,
          autoStart,
          loop,
          delay,
          deleteSpeed: deleteSpeed ?? delay,
          cursor: customCursor as unknown as string, // typewriter-effect accepts React nodes via type coercion or we can use the wrapper's built-in support
          // Note: typewriter-effect v2.21.0+ supports React nodes for cursor directly, 
          // but if it complains, we can use a ref or CSS variables. 
          // Alternative: use the `cursor` string and style the `.Typewriter__cursor` class via CSS variables.
        }}
        onInit={(typewriter) => {
          // Fallback for strict typing: we can inject CSS variables into the container 
          // and let the library's default cursor inherit them.
        }}
        onComplete={onComplete}
      />
      <style jsx>{`
        .Typewriter__cursor {
          color: ${cursorColor} !important;
          width: ${cursorWidth} !important;
          height: ${cursorHeight} !important;
          display: inline-block !important;
          vertical-align: middle !important;
          margin-left: 2px !important;
        }
      `}</style>
    </div>
  )
}
```
*(Note to AI: The `<style jsx>` or inline global style targeting `.Typewriter__cursor` is the most reliable way to force the library's native cursor to adopt our custom width, height, and color without breaking its internal blinking animation logic.)*

### 2. Registry Update (`registry.json`)
```json
{
  "name": "typewriter",
  "title": "Typewriter",
  "description": "A highly customizable text typing animation effect with specialized cursor controls.",
  "tier": "free",
  "dependencies": ["typewriter-effect"],
  "files": [
    {
      "path": "registry/typewriter/typewriter.tsx",
      "target": "components/ui/typewriter.tsx"
    }
  ]
}
```

### 3. Test Page (`app/test-typewriter/page.tsx`)
Create a page demonstrating:
1. **Basic Single Text**: Standard typing effect.
2. **Multiple Strings (Looping)**: An array of strings that type, delete, and loop infinitely.
3. **Custom Cursor**: A thick, colored cursor (e.g., `cursorColor="blue"`, `cursorWidth="4px"`, `cursorHeight="1.2em"`, `cursor="▋"`).
4. **Speed Variations**: Fast typing vs. slow, dramatic typing.

### 4. Documentation (`app/docs/components/typewriter/page.mdx`)
- Explain the required dependency: `npm install typewriter-effect`.
- Detail all props, emphasizing the specialized cursor props (`cursorColor`, `cursorWidth`, `cursorHeight`, `cursor`).
- Provide clear code snippets for single text, looping arrays, and custom cursor styling.

### 5. The 4-Step Release Workflow & Manual Publish
Execute the git workflow for `v0.1.18`, and **CRITICALLY**, provide the manual npm publish commands at the end of your response.

## Implementation Steps

1. Create `registry/typewriter/typewriter.tsx`.
2. Update `registry.json`.
3. Create `app/test-typewriter/page.tsx`.
4. Create `app/docs/components/typewriter/page.mdx`.
5. Bump `packages/cli/package.json` version to `0.1.18`.
6. Execute git commands: `add`, `commit`, `push`, `tag v0.1.18`, `push tag`.
7. Output GitHub Release UI instructions.
8. **Output the exact manual terminal commands to publish to npm.**
9. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] `Typewriter` component renders and animates text correctly.
- [ ] The custom cursor props (`cursorColor`, `cursorWidth`, `cursorHeight`) successfully override the default library styles.
- [ ] Looping with an array of strings works seamlessly.
- [ ] Test page displays all variations clearly.
- [ ] Git tag `v0.1.18` is pushed.
- [ ] Manual npm publish instructions are clearly provided at the end.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `registry/typewriter/typewriter.tsx` (New)
2. `registry.json` (Update)
3. `app/test-typewriter/page.tsx` (New)
4. `app/docs/components/typewriter/page.mdx` (New)
5. `packages/cli/package.json` (Update version to 0.1.18)
6. `context/progress-tracker.md` (Update)