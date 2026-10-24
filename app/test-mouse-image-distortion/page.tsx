import { MouseImageDistortion } from "@/registry/mouse-image-distortion"

const items = [
  { title: "Richard Gaston", subtitle: "Creative Direction", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80" },
  { title: "KangHee Kim", subtitle: "Photography", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80" },
  { title: "Inka & Niclas", subtitle: "Art Direction", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80" },
  { title: "Arch McLeish", subtitle: "Motion", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&q=80" },
  { title: "Nadir Bucan", subtitle: "Editing", imageUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&q=80" },
  { title: "Chandler Bondurant", subtitle: "Sound", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80&sat=-100" },
]

export default function Page() {
  return <MouseImageDistortion items={items} />
}