'use client'
import dynamic from 'next/dynamic'

export const ImageComparisonSlider = dynamic(
  () =>
    import('@/components/features/catalog/ImageComparisonSlider').then((m) => ({
      default: m.ImageComparisonSlider,
    })),
  { ssr: false },
)
