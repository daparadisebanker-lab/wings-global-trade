import { useState, useEffect } from 'react'

export function useCountUp(target: number, duration: number = 800, trigger: boolean = true) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!trigger) return
    setValue(0)
    const start = performance.now()
    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
      else setValue(target)
    }
    requestAnimationFrame(step)
  }, [target, duration, trigger])
  return value
}
