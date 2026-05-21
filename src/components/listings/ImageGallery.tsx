"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  images: string[];
  alt: string;
}

export default function ImageGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="space-y-2">
      <div className="relative h-72 overflow-hidden rounded-2xl bg-[#EEE9E0] sm:h-[32rem]">
        <Image
          src={current}
          alt={alt}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 overflow-hidden rounded-xl border-2 bg-[#EEE9E0] transition-colors ${
                i === active
                  ? "border-[#C4933F]"
                  : "border-transparent hover:border-[#C4933F]/40"
              }`}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${alt} – vista ${i + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
