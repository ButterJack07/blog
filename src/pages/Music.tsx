import { useState, useRef, useEffect } from 'react'
import { FaPlay, FaPause, FaBackward, FaForward, FaVolumeLow, FaMusic, FaPlus, FaXmark, FaUpload, FaCheck, FaSpinner } from 'react-icons/fa6'
import { formatTime } from '../utils/lrcParser'
import { usePlayer } from '../contexts/PlayerContext'
import { useEditStore } from '../stores/editStore'
import type { MusicTrack } from '../types'

const GITHUB_API = 'https://api.github.com'
const OWNER = 'ButterJack07'
const REPO = 'blog'
const BASE = import.meta.env.DEV ? '' : import.meta.env.BASE_URL.replace(/\/$/, '')
const MUSIC_PATH = 'public/music'
const CACHE_KEY = 'blog_music_tracks'

interface GitHubContentItem {
  name: string
  path: string
  type: 'dir' | 'file'
  download_url: string | null
}

function fileNameToTrack(name: string, folder: string): Partial<MusicTrack> | null {
  if (!name.endsWith('.mp3') && !name.endsWith('.wav') && !name.endsWith('.ogg') && !name.endsWith('.flac')) return null
  const clean = name.replace(/\.(mp3|wav|ogg|flac)$/, '')
  const parts = clean.split(' - ')
  return {
    title: parts.length > 1 ? parts[1] : clean,
    artist: parts.length > 1 ? parts[0] : '黄油夹克',
    audioUrl: `${BASE}/music/${folder}/${name}`,
    lrcUrl: `${BASE}/music/${folder}/${clean}.lrc`,
  }
}

async function fetchDir(path: string, token?: string): Promise<GitHubContentItem[]> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' }
  if (token) headers.Authorization = `token ${token}`
  const res = await fetch(`${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${path}`, { headers })
  if (!res.ok) throw new Error('Failed to fetch directory')
  return res.json()
}

async function fetchInfo(path: string, token?: string): Promise<MusicTrack | null> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' }
  if (token) headers.Authorization = `token ${token}`
  try {
    const res = await fetch(`${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${path}`, { headers })
    if (!res.ok) return null
    const data = await res.json()
    const content = atob(data.content)
    const info = JSON.parse(content)
    return {
      ...info,
      audioUrl: `${BASE}${info.audioUrl}`,
      lrcUrl: info.lrcUrl ? `${BASE}${info.lrcUrl}` : undefined,
      coverUrl: info.coverUrl ? `${BASE}${info.coverUrl}` : undefined,
    }
  } catch {
    return null
  }
}

async function loadTracksFromRepo(_token?: string): Promise<MusicTrack[]> {
  const cached = localStorage.getItem(CACHE_KEY)
  if (cached) {
    try { return JSON.parse(cached) } catch {}
  }

  const results: MusicTrack[] = []

  try {
    const res = await fetch(`${BASE}/music/tracks.json`)
    if (res.ok) {
      const list = await res.json()
      results.push(...list.map((t: MusicTrack) => ({
        ...t,
        audioUrl: `${BASE}${t.audioUrl}`,
        lrcUrl: t.lrcUrl ? `${BASE}${t.lrcUrl}` : undefined,
        coverUrl: t.coverUrl ? `${BASE}${t.coverUrl}` : undefined,
      })))
    }
  } catch {}

  if (results.length === 0) {
    try {
      const items = await fetchDir(MUSIC_PATH, _token)
      for (const item of items) {
        if (item.type === 'dir') {
          const info = await fetchInfo(`${MUSIC_PATH}/${item.name}/info.json`, _token)
          if (info) { results.push(info); continue }
          const files = await fetchDir(`${MUSIC_PATH}/${item.name}`, _token)
          for (const f of files) {
            const p = fileNameToTrack(f.name, item.name)
            if (p) {
              results.push({ id: String(Date.now() + results.length), ...p } as MusicTrack)
              break
            }
          }
        } else if (item.type === 'file' && item.name.endsWith('.mp3')) {
          const p = fileNameToTrack(item.name, '')
          if (p) {
            results.push({ id: String(Date.now() + results.length), ...p } as MusicTrack)
          }
        }
      }
    } catch {}
  }

  if (results.length > 0) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(results))
  }

  return results
}

export default function Music() {
  const { isEditMode } = useEditStore()
  const player = usePlayer()
  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadDone, setUploadDone] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [loadError, setLoadError] = useState('')

  const lyricsRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    loadTracksFromRepo().then((list) => {
      if (list.length > 0) setTracks(list)
      setLoading(false)
    }).catch((err) => {
      setLoadError(String(err))
      setLoading(false)
    })
  }, [])

  const [form, setForm] = useState({
    title: '', artist: '黄油夹克', genre: '流行', year: String(new Date().getFullYear()),
    description: '', audioFile: null as File | null, lrcFile: null as File | null, coverFile: null as File | null,
  })

  const track = tracks[currentIndex]

  // Sync current track with player
  useEffect(() => {
    if (track && player.currentTrack?.id !== track.id) {
      player.setQueue(tracks)
    }
  }, [track, tracks, player])

  // Scroll lyrics
  useEffect(() => {
    if (player.activeLyricIndex < 0 || !lyricsRef.current) return
    const active = lyricsRef.current.children[player.activeLyricIndex] as HTMLElement
    if (active) {
      const container = active.parentElement?.parentElement
      if (container) {
        const offset = active.offsetTop - container.offsetHeight / 2 + active.offsetHeight / 2
        lyricsRef.current.style.transform = `translateY(-${offset}px)`
      }
    }
  }, [player.activeLyricIndex])

  async function uploadFileToGitHub(path: string, file: File, token: string): Promise<void> {
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    const encoded = btoa(binary)
    const res = await fetch(`${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${path}`, {
      method: 'PUT',
      headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `上传音乐: ${form.title}`, content: encoded }),
    })
    if (!res.ok) throw new Error(`Failed to upload ${path}`)
  }

  async function handleUpload() {
    const token = localStorage.getItem('github_token')
    if (!token) { setUploadError('请先登录'); return }
    if (!form.title.trim() || !form.audioFile) { setUploadError('请填写标题并选择音频文件'); return }

    setUploading(true)
    setUploadError('')
    const folder = form.title.trim().replace(/[/\\?%*:|"<>]/g, '_')
    const ts = Date.now().toString()

    try {
      await uploadFileToGitHub(`${MUSIC_PATH}/${folder}/${form.title}.mp3`, form.audioFile, token)
      if (form.lrcFile) {
        await uploadFileToGitHub(`${MUSIC_PATH}/${folder}/${form.title}.lrc`, form.lrcFile, token)
      }
      let coverUrl: string | undefined
      if (form.coverFile) {
        const ext = form.coverFile.name.split('.').pop() || 'jpg'
        await uploadFileToGitHub(`${MUSIC_PATH}/${folder}/cover.${ext}`, form.coverFile, token)
        coverUrl = `/music/${folder}/cover.${ext}`
      }
      const info = {
        id: ts, title: form.title.trim(), artist: form.artist, genre: form.genre,
        year: form.year, description: form.description, coverUrl,
        audioUrl: `/music/${folder}/${form.title}.mp3`,
        lrcUrl: form.lrcFile ? `/music/${folder}/${form.title}.lrc` : undefined,
      }
      const infoJson = JSON.stringify(info, null, 2)
      const encodedInfo = btoa(unescape(encodeURIComponent(infoJson)))
      await fetch(`${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${MUSIC_PATH}/${folder}/info.json`, {
        method: 'PUT',
        headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `创建音乐信息: ${form.title}`, content: encodedInfo }),
      })

      const newTrack: MusicTrack = {
        id: ts, title: form.title.trim(), artist: form.artist, genre: form.genre,
        year: form.year, description: form.description, coverUrl: coverUrl ? `${BASE}${coverUrl}` : undefined,
        audioUrl: `${BASE}/music/${folder}/${form.title}.mp3`,
        lrcUrl: form.lrcFile ? `${BASE}/music/${folder}/${form.title}.lrc` : undefined,
      }
      setTracks((prev) => [...prev, newTrack])
      setUploadDone(true)
      setTimeout(() => { setShowUpload(false); setUploadDone(false) }, 1500)
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : '上传失败')
    } finally {
      setUploading(false)
    }
  }

  const playTrack = (index: number) => {
    setCurrentIndex(index)
    const t = tracks[index]
    player.setQueue(tracks)
    player.play(t)
  }

  return (
    <div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <FaSpinner className="animate-spin mb-4" size={28} />
          <p className="text-sm">正在加载音乐列表...</p>
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <FaXmark className="mb-4 text-red-400" size={28} />
          <p className="text-sm text-red-400 mb-2">加载失败</p>
          <p className="text-xs text-gray-400 mb-4">{loadError}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 transition-colors">重试</button>
        </div>
      ) : (
      <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-1">原创音乐</h2>
          <p className="text-gray-500">那些代码写不出的情绪，都写在歌里了。</p>
        </div>
        {isEditMode && !showUpload && (
          <button onClick={() => { setShowUpload(true); setUploadDone(false); setUploadError('') }}
            className="glass-card px-4 py-2 rounded-lg text-sm text-indigo-600 flex items-center gap-2 hover:bg-indigo-50"
          ><FaPlus /> 新建乐曲</button>
        )}
      </div>

      {showUpload && (
        <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">上传新乐曲</h3>
            <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600"><FaXmark /></button>
          </div>
          {uploadDone ? (
            <div className="text-center py-8 text-emerald-500"><FaCheck className="mx-auto mb-2" size={32} /><p>上传成功！</p></div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input placeholder="歌曲标题 *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="glass-input rounded-lg px-4 py-2.5 text-sm" />
                <input placeholder="艺术家" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} className="glass-input rounded-lg px-4 py-2.5 text-sm" />
                <select value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className="glass-input rounded-lg px-4 py-2.5 text-sm">
                  {['流行', '民谣', '摇滚', '电子', '古典', '爵士', '说唱', 'R&B', '其他'].map((g) => <option key={g}>{g}</option>)}
                </select>
                <input placeholder="年份" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="glass-input rounded-lg px-4 py-2.5 text-sm" />
                <div className="md:col-span-2">
                  <input placeholder="描述（可选）" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="glass-input rounded-lg px-4 py-2.5 text-sm w-full" />
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="glass-input rounded-lg px-4 py-2.5 text-sm flex items-center gap-3 cursor-pointer hover:bg-white/40">
                    <FaUpload className="text-indigo-400" size={14} />
                    <span className="text-gray-500 truncate">{form.audioFile ? form.audioFile.name : '选择音频 *'}</span>
                    <input type="file" accept=".mp3,.wav,.ogg,.flac" onChange={(e) => setForm({ ...form, audioFile: e.target.files?.[0] || null })} className="hidden" />
                  </label>
                  <label className="glass-input rounded-lg px-4 py-2.5 text-sm flex items-center gap-3 cursor-pointer hover:bg-white/40">
                    <FaUpload className="text-indigo-400" size={14} />
                    <span className="text-gray-500 truncate">{form.lrcFile ? form.lrcFile.name : '选择 LRC 歌词（可选）'}</span>
                    <input type="file" accept=".lrc,.txt" onChange={(e) => setForm({ ...form, lrcFile: e.target.files?.[0] || null })} className="hidden" />
                  </label>
                  <label className="glass-input rounded-lg px-4 py-2.5 text-sm flex items-center gap-3 cursor-pointer hover:bg-white/40">
                    <FaUpload className="text-indigo-400" size={14} />
                    <span className="text-gray-500 truncate">{form.coverFile ? form.coverFile.name : '选择封面'}</span>
                    <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setForm({ ...form, coverFile: e.target.files?.[0] || null })} className="hidden" />
                  </label>
                </div>
              </div>
              {uploadError && <p className="text-red-500 text-xs mb-3">{uploadError}</p>}
              <div className="flex gap-3">
                <button onClick={handleUpload} disabled={uploading}
                  className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors text-sm flex items-center gap-2"
                >{uploading ? '上传中...' : <><FaUpload /> 上传到 GitHub</>}</button>
                <button onClick={() => setShowUpload(false)} className="px-6 py-2 glass-card rounded-lg text-sm text-gray-600">取消</button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="player-glass rounded-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0 w-full md:w-72">
            <div className="aspect-square rounded-xl mb-4 overflow-hidden bg-gradient-to-br from-rose-100 to-orange-50 flex items-center justify-center glass">
              {track?.coverUrl ? (
                <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
              ) : (
                <FaMusic className="text-white/50" size={64} />
              )}
            </div>
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{player.currentTrack?.title || track?.title || '未选择'}</h3>
              <p className="text-sm text-gray-500">{player.currentTrack?.artist || track?.artist} · {player.currentTrack?.genre || track?.genre} · {player.currentTrack?.year || track?.year}</p>
            </div>
            <div className="flex items-center justify-center gap-6 mb-4">
              <button onClick={player.playPrev} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-indigo-500 hover:bg-white/50 transition-all"><FaBackward size={16} /></button>
              <button onClick={() => {
                if (player.currentTrack?.id === track?.id) {
                  player.togglePlay()
                } else {
                  playTrack(currentIndex)
                }
              }} className="w-14 h-14 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-200">
                {player.isPlaying && player.currentTrack?.id === track?.id ? <FaPause size={20} /> : <FaPlay size={20} className="ml-0.5" />}
              </button>
              <button onClick={player.playNext} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-indigo-500 hover:bg-white/50 transition-all"><FaForward size={16} /></button>
            </div>
            <div className="mb-3">
              <div className="h-1.5 bg-white/50 rounded-full cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const pct = (e.clientX - rect.left) / rect.width
                player.seek(pct * player.duration)
              }}>
                <div className="h-full bg-gradient-to-r from-indigo-400 to-rose-400 rounded-full" style={{ width: `${player.duration ? (player.currentTime / player.duration) * 100 : 0}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatTime(player.currentTime)}</span>
                <span>{formatTime(player.duration)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <FaVolumeLow size={12} />
              <div className="flex-1 h-1 bg-white/50 rounded-full cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                player.setVolume(pct)
              }}>
                <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${player.volume * 100}%` }} />
              </div>
              <span>{Math.round(player.volume * 100)}%</span>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden" style={{ height: 400 }}>
            <div className="lyrics-container h-full">
              <ul ref={lyricsRef} className="text-center transition-transform duration-500 ease-out" style={{ paddingTop: '160px' }}>
                {player.lyrics.length === 0 ? (
                  <>
                    <li className="py-3 text-gray-300">暂无歌词</li>
                    <li className="py-3 text-gray-300 text-sm">上传时添加 .lrc 歌词文件即可显示</li>
                  </>
                ) : (
                  player.lyrics.map((line, i) => (
                    <li key={i} className={`py-3 cursor-pointer transition-all duration-300 ${i === player.activeLyricIndex ? 'text-indigo-600 text-lg font-medium scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                      onClick={() => player.seek(line.time)}>{line.text}</li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
        {player.currentTrack?.description && <p className="text-sm text-gray-400 italic mt-6 text-center">「{player.currentTrack.description}」</p>}
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-4">播放列表</h3>
      <div className="space-y-3">
        {tracks.map((t, i) => (
          <div key={t.id} onClick={() => playTrack(i)}
            className={`glass-card rounded-xl p-4 flex items-center gap-4 cursor-pointer card-lift ${i === currentIndex ? 'ring-2 ring-indigo-300 bg-indigo-50/30' : ''}`}
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-rose-100 to-orange-50 flex items-center justify-center flex-shrink-0">
              {t.coverUrl ? (
                <img src={t.coverUrl} alt={t.title} className="w-full h-full object-cover" />
              ) : (
                <FaMusic className="text-rose-300" size={18} />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">{t.title}</h4>
              <p className="text-xs text-gray-500">{t.artist} · {t.genre}</p>
            </div>
            <span className="text-xs text-gray-400">{t.year}</span>
          </div>
        ))}
      </div>
    </>
    )}
    </div>
  )
}