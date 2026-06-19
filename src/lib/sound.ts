const STORAGE_KEY = 'wings_sound_enabled'

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function toggleSound(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const next = !isSoundEnabled()
    localStorage.setItem(STORAGE_KEY, String(next))
    return next
  } catch {
    return false
  }
}

export function playPaperSound(): void {
  if (!isSoundEnabled()) return
  try {
    const ctx = new AudioContext()
    const bufferSize = Math.floor(ctx.sampleRate * 0.08) // 80ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    // Decaying white noise burst — short percussive stamp
    for (let i = 0; i < bufferSize; i++) {
      const decay = Math.exp(-i / (bufferSize * 0.3))
      data[i] = (Math.random() * 2 - 1) * decay
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)

    source.connect(gain)
    gain.connect(ctx.destination)
    source.start()
    source.onended = () => ctx.close()
  } catch {
    // AudioContext unavailable or blocked — silent no-op
  }
}
