import { useState } from 'react'
import { FaPlus, FaBook, FaChevronLeft, FaPenToSquare } from 'react-icons/fa6'
import { useEditStore } from '../stores/editStore'
import type { Notebook, Chapter } from '../types'

const demoNotebooks: Notebook[] = [
  {
    id: '1',
    title: '计算机组成原理',
    description: '核心知识点整理，包括流水线、缓存、指令系统、CPU设计等考点。',
    coverColor: 'from-blue-100 to-indigo-50',
    createdAt: '2026-07-20',
    updatedAt: '2026-07-28',
    chapters: [
      { id: 'c1', title: '第一章：计算机系统概述', content: '# 计算机系统概述\n\n计算机系统由硬件和软件两部分组成。', order: 1 },
      { id: 'c2', title: '第二章：数据表示', content: '# 数据表示\n\n## 定点数与浮点数', order: 2 },
    ],
  },
  {
    id: '2',
    title: '算法笔记',
    description: '常见算法题解与模板。',
    coverColor: 'from-emerald-100 to-teal-50',
    createdAt: '2026-07-15',
    updatedAt: '2026-07-25',
    chapters: [
      { id: 'c3', title: '动态规划', content: '# 动态规划\n\n## 背包问题', order: 1 },
    ],
  },
  {
    id: '3',
    title: '大模型部署踩坑',
    description: '记录昇腾910B和消费级显卡上部署大模型遇到的各种坑。',
    coverColor: 'from-purple-100 to-pink-50',
    createdAt: '2026-07-10',
    updatedAt: '2026-07-22',
    chapters: [],
  },
]

export default function Library() {
  const { isEditMode } = useEditStore()
  const [notebooks] = useState<Notebook[]>(demoNotebooks)
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [editingChapter, setEditingChapter] = useState(false)
  const [editContent, setEditContent] = useState('')

  const openChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter)
    setEditContent(chapter.content)
    setEditingChapter(false)
  }

  const saveChapter = () => {
    if (selectedChapter) {
      selectedChapter.content = editContent
      setEditingChapter(false)
    }
  }

  if (selectedChapter) {
    return (
      <div className="animate-fade-in">
        <button
          onClick={() => { setSelectedChapter(null); setEditingChapter(false) }}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <FaChevronLeft size={12} /> 返回目录
        </button>
        <div className="glass-card rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{selectedChapter.title}</h2>
            {isEditMode && (
              <button
                onClick={() => setEditingChapter(!editingChapter)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <FaPenToSquare /> {editingChapter ? '预览' : '编辑'}
              </button>
            )}
          </div>
          {editingChapter ? (
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[400px] p-4 glass-input rounded-xl text-sm font-mono leading-relaxed resize-y"
              />
              <div className="flex gap-3 mt-4">
                <button onClick={saveChapter} className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm">保存</button>
                <button onClick={() => setEditingChapter(false)} className="px-6 py-2 glass-card rounded-lg text-sm text-gray-600">取消</button>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedChapter.content.replace(/^# (.+)$/gm, '<h1>$1</h1>').replace(/^## (.+)$/gm, '<h2>$2</h2>').replace(/\n/g, '<br/>') }} />
          )}
        </div>
      </div>
    )
  }

  if (selectedNotebook) {
    return (
      <div className="animate-fade-in">
        <button
          onClick={() => setSelectedNotebook(null)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <FaChevronLeft size={12} /> 返回书架
        </button>
        <div className={`glass-card rounded-2xl p-8 mb-6 bg-gradient-to-br ${selectedNotebook.coverColor}`}>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedNotebook.title}</h2>
          <p className="text-gray-600 mb-4">{selectedNotebook.description}</p>
          <p className="text-xs text-gray-400">创建于 {selectedNotebook.createdAt} · 更新于 {selectedNotebook.updatedAt}</p>
        </div>
        <div className="space-y-3">
          {selectedNotebook.chapters.length === 0 ? (
            <p className="text-gray-400 text-center py-8">暂无章节</p>
          ) : (
            selectedNotebook.chapters
              .sort((a, b) => a.order - b.order)
              .map((chapter) => (
                <div
                  key={chapter.id}
                  onClick={() => openChapter(chapter)}
                  className="glass-card rounded-xl p-5 cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium text-gray-800">{chapter.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {chapter.content.length > 60 ? chapter.content.slice(0, 60) + '...' : chapter.content}
                    </p>
                  </div>
                  <FaBook className="text-gray-300 flex-shrink-0" size={16} />
                </div>
              ))
          )}
          {isEditMode && (
            <button className="w-full glass-card rounded-xl p-4 text-indigo-500 flex items-center justify-center gap-2 text-sm">
              <FaPlus /> 新建章节
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-1">图书馆</h2>
          <p className="text-gray-500">知识笔记本，一本一本排列在书架上。</p>
        </div>
        {isEditMode && (
          <button className="glass-card px-4 py-2 rounded-lg text-sm text-indigo-600 flex items-center gap-2">
            <FaPlus /> 新建笔记
          </button>
        )}
      </div>
      <div className="bookshelf">
        {notebooks.map((notebook) => (
          <div
            key={notebook.id}
            onClick={() => setSelectedNotebook(notebook)}
            className="glass-card rounded-2xl overflow-hidden cursor-pointer group"
          >
            <div className={`h-40 bg-gradient-to-br ${notebook.coverColor} flex items-center justify-center`}>
              <FaBook className="text-white/60 group-hover:scale-110 transition-transform" size={48} />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-1 text-sm">{notebook.title}</h3>
              <p className="text-xs text-gray-400">{notebook.chapters.length} 章节</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}