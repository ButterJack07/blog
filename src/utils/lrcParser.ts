import type { LyricLine } from '../types'

export function parseLRC(lrcText: string): LyricLine[] {
  const lines = lrcText.split('\n')
  const result: LyricLine[] = []
  const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g

  for (const line of lines) {
    const matches = [...line.matchAll(timeReg)]
    if (matches.length === 0) continue

    const text = line.replace(timeReg, '').trim()
    if (!text) continue

    for (const m of matches) {
      const minutes = parseInt(m[1])
      const seconds = parseInt(m[2])
      const ms = parseInt(m[3].padEnd(3, '0'))
      const time = minutes * 60 + seconds + ms / 1000
      result.push({ time, text })
    }
  }

  return result.sort((a, b) => a.time - b.time)
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}