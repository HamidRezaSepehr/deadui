"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CinematicText, type CinematicTextProps } from "@/registry/cinematic-text"

type VariantId = NonNullable<CinematicTextProps["variant"]>

const GRAIN_VARIANTS: ReadonlySet<string> = new Set([
  "blur-grain",
  "blur-grain-bright",
  "scale-blur-grain",
  "skew-blur-grain",
])

const variants: Array<{ id: VariantId; label: string }> = [
  { id: "blur-in", label: "blur-in" },
  { id: "fade-up", label: "fade-up" },
  { id: "slide-stagger", label: "slide-stagger" },
  { id: "scale-pop", label: "scale-pop" },
  { id: "rise-color", label: "rise-color" },
  { id: "slide-left-color", label: "slide-left-color" },
  { id: "scale-blur-color", label: "scale-blur-color" },
  { id: "diagonal-blur-color", label: "diagonal-blur-color" },
  { id: "flip-x-color", label: "flip-x-color" },
  { id: "heavy-flip-color", label: "heavy-flip-color" },
  { id: "flip-top-color", label: "flip-top-color" },
  { id: "mask-reveal", label: "mask-reveal" },
  { id: "blur-grain", label: "blur-grain" },
  { id: "blur-grain-bright", label: "blur-grain-bright" },
  { id: "scale-blur-grain", label: "scale-blur-grain" },
  { id: "skew-blur-grain", label: "skew-blur-grain" },
]

function VariantCard({ id, label }: { id: VariantId; label: string }) {
  const [key, setKey] = useState(0)
  const isGrain = GRAIN_VARIANTS.has(id)

  return (
    <div className="bg-preview-grid relative flex min-h-[140px] items-center justify-center rounded-xl border border-dead-800 bg-dead-900 p-6">
      <CinematicText
        key={key}
        variant={id}
        className="text-xl font-bold text-dead-50"
        scrub={false}
        preview={isGrain ? true : undefined}
        once={true}
      >
        {label}
      </CinematicText>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute bottom-2 right-2 h-7 px-2 text-xs text-dead-400 hover:text-dead-50"
        onClick={() => setKey((k) => k + 1)}
      >
        Replay
      </Button>
    </div>
  )
}

export function CinematicTextVariants() {
  return (
    <div className="not-prose my-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {variants.map((v) => (
          <VariantCard key={v.id} id={v.id} label={v.label} />
        ))}
      </div>
    </div>
  )
}
