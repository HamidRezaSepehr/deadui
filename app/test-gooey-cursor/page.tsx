"use client"

import { useState } from "react"
import { GooeyCursor, type GooeyVariant } from "@/components/ui/gooey-cursor"

const VARIANTS: GooeyVariant[] = ['standard', 'blurry', 'noise', 'outline', 'displaced', 'shadowed', 'multicolor', 'radial']

export default function TestGooeyCursorPage() {
  const [currentVariant, setCurrentVariant] = useState<GooeyVariant>('standard')
  const [clickEnabled, setClickEnabled] = useState(true)

  return (
    <main className="min-h-screen bg-neutral-900 text-white p-8 relative overflow-hidden">
      <GooeyCursor 
        variant={currentVariant} 
        enableClickEffect={clickEnabled}
        columns={40}
      />
      
      <div className="relative z-10 max-w-4xl mx-auto pt-20">
        <h1 className="text-5xl font-bold mb-8">Gooey Cursor Playground</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {VARIANTS.map(v => (
            <button
              key={v}
              onClick={() => setCurrentVariant(v)}
              className={`p-4 rounded-xl border transition-all ${
                currentVariant === v 
                  ? 'bg-white text-black border-white' 
                  : 'bg-transparent border-white/20 hover:border-white/50'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-12">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={clickEnabled} 
              onChange={(e) => setClickEnabled(e.target.checked)}
              className="w-5 h-5 accent-white"
            />
            <span>Enable Click Explosion Effect</span>
          </label>
        </div>

        <div className="space-y-8 text-lg leading-relaxed opacity-80">
          <p>Move your mouse around. Notice how the cells merge together due to the SVG filter.</p>
          <p>Try clicking anywhere to see the explosion effect (if enabled).</p>
          <p>The Multicolor variant assigns random colors and scales to each cell upon resize.</p>
        </div>
      </div>
    </main>
  )
}
