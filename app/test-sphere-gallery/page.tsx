"use client"

import dynamic from "next/dynamic"
import { WebglProvider } from "@/registry/webgl-provider/webgl-provider"

const SphereGallery = dynamic(
  () => import("@/registry/sphere-gallery").then((mod) => mod.SphereGallery),
  { ssr: false },
)

const ITEMS = [
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80",
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80",
].map((src, i) => ({ src, alt: `Image ${i + 1}` }))

export default function TestSphereGalleryPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <WebglProvider contained className="relative w-full max-w-4xl h-[80vh]">
        <SphereGallery
          items={ITEMS}
          rows={6}
          columns={10}
          tileColor="#111"
          sphereColor="#222"
          className="absolute inset-0"
        />
      </WebglProvider>
    </main>
  )
}