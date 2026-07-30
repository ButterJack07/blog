import { useState, useRef, useEffect, useCallback } from 'react'
import { FaPlay, FaPause, FaBackward, FaForward, FaVolumeLow, FaMusic, FaPlus } from 'react-icons/fa6'
import { parseLRC, formatTime } from '../utils/lrcParser'
import { useEditStore } from '../stores/editStore'
import type { MusicTrack, LyricLine } from '../types'

const demoTracks: MusicTrack[] = [
  { id: '1', title: '渺小', artist: '黄油夹克', genre: '流行', year: '2026', audioUrl: '/music/黄油夹克 - 渺小.mp3', lrcUrl: '/music/黄油夹克 - 渺小.lrc', description: '「渺小的我，在偌大的世界里寻找自己的声音」' },
]

export default function Music() {
  const { isEditMode } = useEditStore()
  const [tracks] = useState<MusicTrack[]>(demoTracks)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [lyrics, setLyrics] = useState<LyricLine[]>([])
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1)

  const audioRef = useRef<HTMLAudioElement>(null)
  const lyricsRef = useRef<HTMLUListElement>(null)

  const track = tracks[currentIndex]

  // Load lyrics
  useEffect(() => {
    if (!track?.lrcUrl) return
    fetch(track.lrcUrl)
      .then((r) => r.text())
      .then((text) => setLyrics(parseLRC(text)))
      .catch(() => setLyrics([]))
  }, [track])

  // Audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      const idx = lyrics.findLastIndex((l) => audio.currentTime >= l.time)
      setActiveLyricIndex(idx)
    }
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0) }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    audio.volume = volume

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
    }
  }, [lyrics, volume])

  // Play/Pause
  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) { audio.pause() } else { audio.play() }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  // Seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    if (audioRef.current) {
      audioRef.current.currentTime = pct * duration
    }
  }

  // Volume
  const handleVolume = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setVolume(pct)
    if (audioRef.current) audioRef.current.volume = pct
  }

  // Scroll lyrics
  useEffect(() => {
    if (activeLyricIndex < 0 || !lyricsRef.current) return
    const active = lyricsRef.current.children[activeLyricIndex] as HTMLElement
    if (active) {
      const container = active.parentElement?.parentElement
      if (container) {
        const offset = active.offsetTop - container.offsetHeight / 2 + active.offsetHeight / 2
        lyricsRef.current.style.transform = `translateY(-${offset}px)`
      }
    }
  }, [activeLyricIndex])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-1">音乐创作</h2>
          <p className="text-gray-500">那些代码写不出的情绪，都写在歌里了。</p>
        </div>
        {isEditMode && (
          <button className="glass-card px-4 py-2 rounded-lg text-sm text-indigo-600 flex items-center gap-2">
            <FaPlus /> 新建乐曲
          </button>
        )}
      </div>

      {/* Now Playing */}
      <div className="player-glass rounded-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Player Controls */}
          <div className="flex-shrink-0 w-full md:w-72">
            <div className="aspect-square rounded-xl bg-gradient-to-br from-rose-100 to-orange-50 mb-4 flex items-center justify-center glass">
              <FaMusic className="text-white/50" size={64} />
            </div>
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{track?.title || '未选择'}</h3>
              <p className="text-sm text-gray-500">{track?.artist} · {track?.genre} · {track?.year}</p>
            </div>
            <div className="flex items-center justify-center gap-6 mb-4">
              <button onClick={() => setCurrentIndex((i) => (i - 1 + tracks.length) % tracks.length)} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-indigo-500 hover:bg-white/50 transition-all">
                <FaBackward size={16} />
              </button>
              <button onClick={togglePlay} className="w-14 h-14 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-200">
                {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} className="ml-0.5" />}
              </button>
              <button onClick={() => setCurrentIndex((i) => (i + 1) % tracks.length)} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-indigo-500 hover:bg-white/50 transition-all">
                <FaForward size={16} />
              </button>
            </div>
            <div className="mb-3">
              <div className="h-1.5 bg-white/50 rounded-full cursor-pointer" onClick={handleSeek}>
                <div className="h-full bg-gradient-to-r from-indigo-400 to-rose-400 rounded-full" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <FaVolumeLow size={12} />
              <div className="flex-1 h-1 bg-white/50 rounded-full cursor-pointer" onClick={handleVolume}>
                <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${volume * 100}%` }} />
              </div>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <audio ref={audioRef} src={track?.audioUrl} preload="metadata" />
          </div>

          {/* Lyrics */}
          <div className="flex-1 relative overflow-hidden" style={{ height: 400 }}>
            <div className="lyrics-container h-full">
              <ul ref={lyricsRef} className="text-center transition-transform duration-500 ease-out" style={{ paddingTop: '160px' }}>
                {lyrics.length === 0 ? (
                  <>
                    <li className="py-3 text-gray-300">暂无歌词</li>
                    <li className="py-3 text-gray-300 text-sm">可将同名 .lrc 文件放入 music 文件夹</li>
                  </>
                ) : (
                  lyrics.map((line, i) => (
                    <li
                      key={i}
                      className={`py-3 cursor-pointer transition-all duration-300 ${
                        i === activeLyricIndex
                          ? 'text-indigo-600 text-lg font-medium scale-105'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      onClick={() => { if (audioRef.current) audioRef.current.currentTime = line.time }}
                    >
                      {line.text}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
        {track?.description && (
          <p className="text-sm text-gray-400 italic mt-6 text-center">「{track.description}」</p>
        )}
      </div>

      {/* Playlist */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">播放列表</h3>
      <div className="space-y-3">
        {tracks.map((t, i) => (
          <div
            key={t.id}
            onClick={() => { setCurrentIndex(i); setIsPlaying(false) }}
            className={`glass-card rounded-xl p-4 flex items-center gap-4 cursor-pointer ${
              i === currentIndex ? 'ring-2 ring-indigo-300 bg-indigo-50/30' : ''
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-100 to-orange-50 flex items-center justify-center flex-shrink-0">
              <FaMusic className="text-rose-300" size={18} />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">{t.title}</h4>
              <p className="text-xs text-gray-500">{t.artist} · {t.genre}</p>
            </div>
            <span className="text-xs text-gray-400">{t.year}</span>
          </div>
        ))}
      </div>
    </div>
  )
}