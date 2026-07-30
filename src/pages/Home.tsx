import { useState, useEffect } from 'react'
import { FaGlobe, FaGithub, FaBolt, FaPlus, FaTrash, FaArrowUpRightFromSquare, FaCodeFork, FaStar, FaCode } from 'react-icons/fa6'
import { useEditStore } from '../stores/editStore'
import type { WebLink } from '../types'

interface GitHubEvent {
  id: string
  type: string
  repo: { name: string }
  payload: {
    action?: string
    ref?: string
    ref_type?: string
    commits?: { message: string; sha: string }[]
    pull_request?: { title: string; html_url: string }
    issue?: { title: string; html_url: string }
    forkee?: { full_name: string }
  }
  created_at: string
}

function getEventIcon(type: string) {
  if (type.startsWith('Push')) return FaCode
  if (type.startsWith('Create')) return FaCodeFork
  if (type.startsWith('Watch')) return FaStar
  if (type.startsWith('Fork')) return FaCodeFork
  if (type.startsWith('PullRequest')) return FaCode
  if (type.startsWith('Issues')) return FaCodeFork
  if (type.startsWith('Delete')) return FaTrash
  return FaGithub
}

function formatEventText(event: GitHubEvent): string {
  const repo = event.repo.name.replace('ButterJack07/', '')
  switch (event.type) {
    case 'PushEvent': {
      const count = event.payload.commits?.length || 0
      const msg = event.payload.commits?.[0]?.message?.split('\n')[0] || ''
      return `推送到 <strong>${repo}</strong> · ${msg}${count > 1 ? ` (+${count - 1} commits)` : ''}`
    }
    case 'CreateEvent':
      return `创建了 ${event.payload.ref_type} <strong>${event.payload.ref || repo}</strong>`
    case 'WatchEvent':
      return `收藏了 <strong>${repo}</strong> ⭐`
    case 'ForkEvent':
      return `Fork 了 <strong>${repo}</strong>`
    case 'PullRequestEvent':
      return `${event.payload.action === 'opened' ? '创建' : event.payload.action} PR: <strong>${event.payload.pull_request?.title || repo}</strong>`
    case 'IssuesEvent':
      return `${event.payload.action === 'opened' ? '创建' : event.payload.action} Issue: <strong>${event.payload.issue?.title || repo}</strong>`
    case 'DeleteEvent':
      return `删除了 ${event.payload.ref_type} <strong>${event.payload.ref}</strong>`
    default:
      return `${event.type} · <strong>${repo}</strong>`
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const defaultLinks: WebLink[] = [
  { id: '1', title: 'Vite', url: 'https://vite.dev', description: '下一代前端构建工具', icon: '⚡', category: '工具' },
  { id: '2', title: 'Tailwind CSS', url: 'https://tailwindcss.com', description: '实用优先的CSS框架', icon: '🎨', category: '工具' },
  { id: '3', title: 'React', url: 'https://react.dev', description: '用于构建用户界面的JavaScript库', icon: '⚛️', category: '框架' },
  { id: '4', title: 'GitHub', url: 'https://github.com', description: '代码托管与协作平台', icon: '🐙', category: '平台' },
  { id: '5', title: 'Iconify', url: 'https://iconify.design', description: '统一图标框架', icon: '✨', category: '设计' },
  { id: '6', title: 'Excalidraw', url: 'https://excalidraw.com', description: '在线白板工具', icon: '✏️', category: '工具' },
]

const STORAGE_KEY = 'blog_web_links'

function loadLinks(): WebLink[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return defaultLinks
}

export default function Home() {
  const { isEditMode } = useEditStore()
  const [links, setLinks] = useState<WebLink[]>(loadLinks)
  const [activeCategory, setActiveCategory] = useState('全部')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLink, setNewLink] = useState({ title: '', url: '', description: '', icon: '🔗', category: '工具' })
  const [events, setEvents] = useState<GitHubEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [eventsExpanded, setEventsExpanded] = useState(false)

  useEffect(() => {
    fetch('https://api.github.com/users/ButterJack07/events/public')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data.slice(0, 10))
      })
      .catch(() => {})
      .finally(() => setEventsLoading(false))
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links))
  }, [links])

  const filtered = activeCategory === '全部' ? links : links.filter((l) => l.category === activeCategory)
  const allCategories = [...new Set(links.map((l) => l.category))]

  const addLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) return
    const id = Date.now().toString()
    setLinks([...links, { ...newLink, id }])
    setNewLink({ title: '', url: '', description: '', icon: '🔗', category: '工具' })
    setShowAddForm(false)
  }

  const deleteLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id))
  }

  return (
    <>
      <div className="mb-12">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <FaBolt className="text-indigo-400" size={18} /> GitHub 最新动态
        </h3>
        {eventsLoading ? (
          <div className="space-y-4">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <FaGithub className="mx-auto mb-3 text-gray-300" size={32} />
            <p className="text-gray-500 text-sm">暂无动态</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(eventsExpanded ? events : events.slice(0, 2)).map((event) => {
              const Icon = getEventIcon(event.type)
              return (
                <a
                  key={event.id}
                  href={`https://github.com/${event.repo.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card rounded-xl p-4 flex items-start gap-4 group"
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="text-indigo-400" size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: formatEventText(event) }} />
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(event.created_at)}</p>
                  </div>
                  <FaArrowUpRightFromSquare className="text-gray-200 group-hover:text-indigo-400 transition-colors flex-shrink-0 mt-1" size={12} />
                </a>
              )
            })}
          </div>
        )}
        <div className="mt-4 text-center flex items-center justify-center gap-4">
          {events.length > 2 && (
            <button
              onClick={() => setEventsExpanded(!eventsExpanded)}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
            >
              {eventsExpanded ? '收起' : `展开全部 ${events.length} 条`}
            </button>
          )}
          <a
            href="https://github.com/ButterJack07"
            target="_blank"
            className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <FaGithub size={14} /> 查看全部 GitHub 动态 →
          </a>
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FaGlobe className="text-purple-400" size={18} /> 网页导航
          </h3>
          {isEditMode && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-indigo-600 glass-card hover:bg-indigo-50"
            >
              <FaPlus size={14} /> 添加链接
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {['全部', ...allCategories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200'
                  : 'glass-card text-gray-600 hover:text-indigo-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {showAddForm && (
          <div className="glass-card rounded-xl p-6 mb-6 space-y-4 animate-fade-in">
            <h4 className="font-medium text-gray-700">新增导航链接</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="链接名称"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                className="glass-input rounded-lg px-4 py-2.5 text-sm"
              />
              <input
                placeholder="URL（https://...）"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                className="glass-input rounded-lg px-4 py-2.5 text-sm"
              />
              <input
                placeholder="描述"
                value={newLink.description}
                onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                className="glass-input rounded-lg px-4 py-2.5 text-sm"
              />
              <div className="flex gap-2">
                <input
                  placeholder="图标（如 ⚡🎨）"
                  value={newLink.icon}
                  onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
                  className="glass-input rounded-lg px-4 py-2.5 text-sm flex-1"
                />
                <select
                  value={newLink.category}
                  onChange={(e) => setNewLink({ ...newLink, category: e.target.value })}
                  className="glass-input rounded-lg px-3 py-2.5 text-sm"
                >
                  {['工具', '框架', '平台', '设计', '博客', '其他'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={addLink} className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm">添加</button>
              <button onClick={() => setShowAddForm(false)} className="px-6 py-2 glass-card rounded-lg text-sm text-gray-600">取消</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-xl p-5 group relative card-lift"
            >
              {isEditMode && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteLink(link.id) }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-50 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                >
                  <FaTrash size={11} />
                </button>
              )}
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{link.icon}</span>
                <FaArrowUpRightFromSquare className="text-gray-300 group-hover:text-indigo-500 transition-colors" size={12} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1 text-sm">{link.title}</h3>
              <p className="text-xs text-gray-500">{link.description}</p>
              <span className="inline-block mt-3 text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500">{link.category}</span>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}