import { useState } from 'react'
import { FaPlus, FaArrowUpRightFromSquare } from 'react-icons/fa6'
import { useEditStore } from '../stores/editStore'
import type { WebLink } from '../types'

const demoLinks: WebLink[] = [
  { id: 'w1', title: 'Vite', url: 'https://vite.dev', description: '下一代前端构建工具', icon: '⚡', category: '工具' },
  { id: 'w2', title: 'Tailwind CSS', url: 'https://tailwindcss.com', description: '实用优先的CSS框架', icon: '🎨', category: '工具' },
  { id: 'w3', title: 'React', url: 'https://react.dev', description: '用于构建用户界面的JavaScript库', icon: '⚛️', category: '框架' },
  { id: 'w4', title: 'GitHub', url: 'https://github.com', description: '代码托管与协作平台', icon: '🐙', category: '平台' },
  { id: 'w5', title: 'Iconify', url: 'https://iconify.design', description: '统一图标框架', icon: '✨', category: '设计' },
  { id: 'w6', title: 'Excalidraw', url: 'https://excalidraw.com', description: '在线白板工具', icon: '✏️', category: '工具' },
  { id: 'w7', title: 'Vercel', url: 'https://vercel.com', description: '前端部署平台', icon: '▲', category: '平台' },
  { id: 'w8', title: 'Dribbble', url: 'https://dribbble.com', description: '设计灵感社区', icon: '🏀', category: '设计' },
]

const categories = [...new Set(demoLinks.map((l) => l.category))]

export default function WebNav() {
  const { isEditMode } = useEditStore()
  const [links] = useState<WebLink[]>(demoLinks)
  const [activeCategory, setActiveCategory] = useState<string>('全部')

  const filtered = activeCategory === '全部' ? links : links.filter((l) => l.category === activeCategory)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-1">网页导航</h2>
          <p className="text-gray-500">精选网页工具与资源导航。</p>
        </div>
        {isEditMode && (
          <button className="glass-card px-4 py-2 rounded-lg text-sm text-indigo-600 flex items-center gap-2">
            <FaPlus /> 添加链接
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {['全部', ...categories].map((cat) => (
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card rounded-xl p-5 group"
          >
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
  )
}