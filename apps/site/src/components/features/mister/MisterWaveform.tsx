'use client'

import { useRef } from 'react'
import { useMisterWaveform } from '@/hooks/useMisterWaveform'

interface MisterWaveformProps {
  isStreaming: boolean
}

export function MisterWaveform({ isStreaming }: MisterWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useMisterWaveform(canvasRef, isStreaming)

  return (
    <canvas
      ref={canvasRef}
      className="block h-7 w-full"
      aria-hidden
    />
  )
}
