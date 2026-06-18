'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'

interface ImageComparisonSliderProps {
  imageA: { src: string; label: string }
  imageB: { src: string; label: string }
}

export function ImageComparisonSlider({ imageA, imageB }: ImageComparisonSliderProps) {
  const [position, setPosition] = useState(50) // 0–100
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  function handlePointerDown(e: React.PointerEvent) {
    isDragging.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    setPosition((x / rect.width) * 100)
  }

  function handlePointerUp() {
    isDragging.current = false
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-[16/9] w-full overflow-hidden bg-[#EDEAE1] select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Image A — always fully visible underneath */}
      <Image
        src={imageA.src}
        alt={imageA.label}
        fill
        sizes="100vw"
        className="object-cover"
        draggable={false}
      />

      {/* Image B — clipped from the left by sliderPosition */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        <Image
          src={imageB.src}
          alt={imageB.label}
          fill
          sizes="100vw"
          className="object-cover"
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute inset-y-0 w-px bg-white/60 pointer-events-none"
        style={{ left: `${position}%` }}
      />

      {/* Drag handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-white shadow-md flex items-center justify-center cursor-col-resize touch-none"
        style={{ left: `${position}%` }}
        onPointerDown={handlePointerDown}
      >
        <span className="font-mono text-[10px] text-[#001E50] select-none leading-none">
          ⟺
        </span>
      </div>

      {/* Label A — bottom left */}
      <span className="absolute bottom-3 left-3 font-mono text-[9px] uppercase tracking-[0.12em] text-white/70 bg-[#000C1F]/40 px-2 py-1 pointer-events-none">
        {imageA.label}
      </span>

      {/* Label B — bottom right */}
      <span className="absolute bottom-3 right-3 font-mono text-[9px] uppercase tracking-[0.12em] text-white/70 bg-[#000C1F]/40 px-2 py-1 text-right pointer-events-none">
        {imageB.label}
      </span>
    </div>
  )
}
