import { SphereGallery } from "@/registry/sphere-gallery"

const ITEMS = [
  { src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80", alt: "Portrait 1" },
  { src: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=800&q=80", alt: "Portrait 2" },
  { src: "https://images.unsplash.com/photo-1531746020798-e6948c51b64f?w=800&q=80", alt: "Portrait 3" },
  { src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80", alt: "Portrait 4" },
  { src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80", alt: "Portrait 5" },
  { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", alt: "Portrait 6" },
]

export default function TestSphereGalleryPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[80vh]">
        <SphereGallery 
          items={ITEMS} 
          rows={6} 
          columns={10} 
          tileColor="#111" 
          sphereColor="#222"
          className="h-full w-full rounded-3xl overflow-hidden border border-white/10"
        />
      </div>
    </main>
  )
}