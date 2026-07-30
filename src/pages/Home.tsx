import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaMusic, FaCode, FaBook, FaGlobe, FaGithub, FaBolt, FaPlus, FaTrash, FaArrowUpRightFromSquare } from 'react-icons/fa6'
import { useEditStore } from '../stores/editStore'
import type { WebLink } from '../types'

const quickCards = [
  { path: '/music', icon: FaMusic, title: '音乐创作间', desc: '原创歌曲、demo片段，那些代码写不出的话都在这里。', color: 'from-rose-100 to-orange-50' },
  { path: '/code', icon: FaCode, title: '技术实验室', desc: '课程项目、技术笔记，从C++到大模型的所有探索。', color: 'from-blue-100 to-indigo-50' },
  { path: '/library', icon: FaBook, title: '图书馆', desc: '知识笔记本，按书目整理，支持在线编辑与阅读。', color: 'from-emerald-100 to-teal-50' },
]

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
      <div className="min-h-[60vh] flex flex-col justify-center mb-12">
        <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
          代码写逻辑，<br />
          <span className="text-indigo-500">旋律</span>写<span className="text-rose-400">情绪</span>
        </h2>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl">
          南京大学计算机系在读，一边写bug一边写歌。在这里记录技术成长、课程笔记，还有那些没说出口的情绪都藏在旋律里。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
          {quickCards.map((card) => (
            <Link
              key={card.path}
              to={card.path}
              className={`glass-card rounded-xl p-6 cursor-pointer bg-gradient-to-br ${card.color}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center text-indigo-400">
                  <card.icon size={20} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
              </div>
              <p className="text-sm text-gray-500">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <FaBolt className="text-indigo-400" size={18} /> 最新动态
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="https://github.com/ButterJack07" target="_blank" className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3 text-gray-400 text-xs"><FaGithub /> GitHub</div>
            <p className="text-sm text-gray-700">查看我的开源项目和代码贡献</p>
          </a>
          <a href="https://space.bilibili.com/1453945101" target="_blank" className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3 text-gray-400 text-xs">
              <span className="text-pink-500"><FaMusic /></span> Bilibili
            </div>
            <p className="text-sm text-gray-700">技术分享、编程vlog和音乐作品</p>
          </a>
          <Link to="/library" className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3 text-gray-400 text-xs">
              <FaBook className="text-emerald-400" /> 最新笔记
            </div>
            <p className="text-sm text-gray-700">浏览我的知识笔记库</p>
          </Link>
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
              className="glass-card rounded-xl p-5 group relative"
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