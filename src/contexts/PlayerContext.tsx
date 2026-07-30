import { createContext, useContext, useRef, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { MusicTrack, LyricLine } from '../types'

interface PlayerContextType {
  currentTrack: MusicTrack | null
  queue: MusicTrack[]
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  lyrics: LyricLine[]
  activeLyricIndex: number
  audioContext: AudioContext | null
  analyser: AnalyserNode | null
  play: (track?: MusicTrack) => void
  pause: () => void
  togglePlay: () => void
  setQueue: (tracks: MusicTrack[]) => void
  playNext: () => void
  playPrev: () => void
  seek: (time: number) => void
  setVolume: (v: number) => void
  audioRef: React.RefObject<HTMLAudioElement | null>
}

const PlayerContext = createContext<PlayerContextType>(null!)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null)
  const [queue, setQueueState] = useState<MusicTrack[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.7)
  const [lyrics, setLyrics] = useState<LyricLine[]>([])
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const autoPlayRef = useRef(false)

  // Initialize audio pipeline once
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || sourceRef.current) return
    const ctx = new AudioContext()
    const an = ctx.createAnalyser()
    an.fftSize = 256
    const src = ctx.createMediaElementSource(audio)
    src.connect(an)
    an.connect(ctx.destination)
    setAudioContext(ctx)
    setAnalyser(an)
    sourceRef.current = src
  }, [])

  // Load lyrics when track changes
  useEffect(() => {
    if (!currentTrack?.lrcUrl) { setLyrics([]); return }
    fetch(currentTrack.lrcUrl)
      .then((r) => r.text())
      .then((text) => {
        const lines = text.split('\n').filter(Boolean)
        const parsed: LyricLine[] = []
        const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g
        for (const line of lines) {
          const matches = [...line.matchAll(timeReg)]
          if (!matches.length) continue
          const txt = line.replace(timeReg, '').trim()
          if (!txt) continue
          for (const m of matches) {
            const mins = parseInt(m[1]), secs = parseInt(m[2]), ms = parseInt(m[3].padEnd(3, '0'))
            parsed.push({ time: mins * 60 + secs + ms / 1000, text: txt })
          }
        }
        setLyrics(parsed.sort((a, b) => a.time - b.time))
      })
      .catch(() => setLyrics([]))
  }, [currentTrack])

  // When currentTrack changes and auto-play is requested, play audio
  useEffect(() => {
    if (!currentTrack || !autoPlayRef.current) return
    autoPlayRef.current = false
    const audio = audioRef.current
    if (!audio) return
    audioContext?.resume()
    audio.play().then(() => setIsPlaying(true)).catch(() => {})
  }, [currentTrack, audioContext])

  // Audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => {
      setCurrentTime(audio.currentTime)
      const idx = lyrics.findLastIndex((l) => audio.currentTime >= l.time)
      setActiveLyricIndex(idx)
    }
    const onMeta = () => setDuration(audio.duration)
    const onEnd = () => { setIsPlaying(false); setCurrentTime(0) }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnd)
    audio.volume = volume
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnd)
    }
  }, [lyrics, volume])

  const play = useCallback((track?: MusicTrack) => {
    if (track) {
      setCurrentTrack(track)
      autoPlayRef.current = true
    } else {
      const audio = audioRef.current
      if (audio) { audio.play().then(() => setIsPlaying(true)).catch(() => {}) }
    }
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) { audio.pause(); setIsPlaying(false) }
    else { audio.play().then(() => setIsPlaying(true)).catch(() => {}) }
  }, [isPlaying])

  const setQueue = useCallback((tracks: MusicTrack[]) => setQueueState(tracks), [])

  const playNext = useCallback(() => {
    if (!currentTrack || queue.length === 0) return
    const idx = queue.findIndex((t) => t.id === currentTrack.id)
    const next = queue[(idx + 1) % queue.length]
    setCurrentTrack(next)
    setCurrentTime(0)
    autoPlayRef.current = true
  }, [currentTrack, queue])

  const playPrev = useCallback(() => {
    if (!currentTrack || queue.length === 0) return
    const idx = queue.findIndex((t) => t.id === currentTrack.id)
    const prev = queue[(idx - 1 + queue.length) % queue.length]
    setCurrentTrack(prev)
    setCurrentTime(0)
    autoPlayRef.current = true
  }, [currentTrack, queue])

  const seek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time
  }, [])

  const setVolume = useCallback((v: number) => {
    setVolumeState(v)
    if (audioRef.current) audioRef.current.volume = v
  }, [])

  return (
    <PlayerContext.Provider value={{
      currentTrack, queue, isPlaying, currentTime, duration, volume,
      lyrics, activeLyricIndex, audioContext, analyser,
      play, pause, togglePlay, setQueue, playNext, playPrev, seek, setVolume, audioRef,
    }}>
      {children}
      <audio ref={audioRef} src={currentTrack?.audioUrl} preload="metadata" />
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  return useContext(PlayerContext)
}