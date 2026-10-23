"use client";

import { MouseImageDistortion } from "@/registry/mouse-image-distortion";

const ITEMS = [
  {
    id: "1",
    title: "Richard Gaston",
    subtitle: "Landscape photography",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  },
  {
    id: "2",
    title: "KangHee Kim",
    subtitle: "Surreal composites",
    imageUrl:
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80",
  },
  {
    id: "3",
    title: "Inka and Niclas",
    subtitle: "Portrait series",
    imageUrl:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80",
  },
  {
    id: "4",
    title: "Arch McLeish",
    subtitle: "Architecture minimalism",
    imageUrl:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
  },
  {
    id: "5",
    title: "Nadir Bucan",
    subtitle: "Street photography",
    imageUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
  },
  {
    id: "6",
    title: "Chandler Bondurant",
    subtitle: "Portrait editorials",
    imageUrl:
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80",
  },
  {
    id: "7",
    title: "Arianna Lago",
    subtitle: "Fine art photography",
    imageUrl:
      "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=800&q=80",
  },
];

export default function MouseImageDistortionTestPage() {
  return (
    <main className="min-h-screen bg-dead-950 text-dead-50">
      <div className="h-[50vh]" />
      <MouseImageDistortion items={ITEMS} />
      <div className="h-[50vh]" />
    </main>
  );
}