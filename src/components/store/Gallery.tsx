"use client";

import Image from "next/image";
import { useState } from "react";

export function Gallery({ images, alt }: { images: { id: string; url: string }[]; alt: string }) {
  const [i, setI] = useState(0);
  if (!images.length) return <div className="grid aspect-[3/4] place-items-center rounded-3xl bg-rose-soft font-display text-4xl text-plum/30">Emteyt</div>;
  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-rose-soft">
        <Image src={images[i].url} alt={alt} fill priority sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((im, idx) => (
            <button key={im.id} onClick={() => setI(idx)} aria-label={`صورة ${idx + 1}`}
              className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-xl ring-2 transition ${idx === i ? "ring-gold" : "ring-transparent opacity-70"}`}>
              <Image src={im.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
