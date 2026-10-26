import { UnwovenSlider } from "@/components/ui/unwoven-slider"

const IMAGES = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80",
  "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=800&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6948c51b64f?w=800&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
]

export default function TestUnwovenPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white py-12">
      <div className="mx-auto max-w-6xl space-y-16">
        
        <section>
          <h2 className="text-2xl font-bold mb-4">Standard Loom</h2>
          <UnwovenSlider images={IMAGES} />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">High Density Threads</h2>
          <UnwovenSlider 
            images={IMAGES} 
            config={{ threads: 50, tearZoneRatio: 0.35, scrollSpeed: 120 }} 
          />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Wide Cards / Slow Tear</h2>
          <UnwovenSlider 
            images={IMAGES} 
            config={{ 
              threads: 12, 
              cardAspect: 1.5, 
              tearZoneRatio: 0.15,
              scrollSpeed: 50
            }} 
          />
        </section>

      </div>
    </main>
  )
}
