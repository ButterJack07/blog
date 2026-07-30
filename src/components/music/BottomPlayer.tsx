import { useRef, useEffect } from 'react'
import { FaPlay, FaPause, FaBackward, FaForward, FaMusic } from 'react-icons/fa6'
import { usePlayer } from '../../contexts/PlayerContext'
import { formatTime } from '../../utils/lrcParser'

export default function BottomPlayer() {
  const { currentTrack, isPlaying, currentTime, duration, togglePlay, playNext, playPrev, analyser, audioRef } = usePlayer()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !analyser || !isPlaying) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      analyser.getByteFrequencyData(dataArray)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height
        ctx.fillStyle = `rgba(99, 102, 241, ${0.3 + (barHeight / canvas.height) * 0.5})`
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight)
        x += barWidth
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [analyser, isPlaying])

  if (!currentTrack) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-white/30 animate-slide-up">
      <div className="h-1 bg-gray-100 cursor-pointer" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const pct = (e.clientX - rect.left) / rect.width
        if (audioRef.current) audioRef.current.currentTime = pct * duration
      }}>
        <div className="h-full bg-gradient-to-r from-indigo-400 to-rose-400 transition-all" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
      </div>

      <div className="flex items-center gap-4 px-4 md:px-8 h-16 max-w-7xl mx-auto">
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-rose-100 to-orange-50 flex items-center justify-center flex-shrink-0">
          {currentTrack.coverUrl ? (
            <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
          ) : (
            <FaMusic className="text-rose-300" size={16} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{currentTrack.title}</p>
          <p className="text-xs text-gray-500 truncate">{currentTrack.artist}</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={playPrev} className="text-gray-500 hover:text-indigo-600 transition-colors"><FaBackward size={14} /></button>
          <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-all shadow-sm">
            {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} className="ml-0.5" />}
          </button>
          <button onClick={playNext} className="text-gray-500 hover:text-indigo-600 transition-colors"><FaForward size={14} /></button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 w-24">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>

        <canvas ref={canvasRef} width={120} height={32} className="hidden md:block rounded" />
      </div>
    </div>
  )
}