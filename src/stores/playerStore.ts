import { create } from 'zustand'
import type { MusicTrack } from '../types'

interface PlayerState {
  currentTrack: MusicTrack | null
  queue: MusicTrack[]
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  setTrack: (track: MusicTrack) => void
  setQueue: (tracks: MusicTrack[]) => void
  togglePlay: () => void
  setPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  playNext: () => void
  playPrev: () => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,

  setTrack: (track) => set({ currentTrack: track, currentTime: 0 }),
  setQueue: (tracks) => set({ queue: tracks }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),

  playNext: () => {
    const { queue, currentTrack } = get()
    if (!currentTrack || queue.length === 0) return
    const idx = queue.findIndex((t) => t.id === currentTrack.id)
    const next = queue[(idx + 1) % queue.length]
    set({ currentTrack: next, currentTime: 0, isPlaying: true })
  },

  playPrev: () => {
    const { queue, currentTrack } = get()
    if (!currentTrack || queue.length === 0) return
    const idx = queue.findIndex((t) => t.id === currentTrack.id)
    const prev = queue[(idx - 1 + queue.length) % queue.length]
    set({ currentTrack: prev, currentTime: 0, isPlaying: true })
  },
}))