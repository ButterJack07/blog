import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaGithub, FaBilibili, FaEnvelope, FaMusic, FaCode, FaBook, FaHouse, FaUser, FaLock, FaLockOpen } from 'react-icons/fa6'
import { useEditStore } from '../../stores/editStore'

const navItems = [
  { path: '/', label: '首页', icon: FaHouse },
  { path: '/music', label: '音乐创作', icon: FaMusic },
  { path: '/library', label: '图书馆', icon: FaBook },
  { path: '/code', label: '代码作品', icon: FaCode },
]

export default function Sidebar() {
  const location = useLocation()
  const { isEditMode, toggleEditMode } = useEditStore()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [token, setToken] = useState('')

  const handleLogin = () => {
    if (token.trim()) {
      localStorage.setItem('github_token', token.trim())
      setIsLoggedIn(true)
      setShowLogin(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('github_token')
    setIsLoggedIn(false)
  }

  return (
    <aside className="fixed md:sticky top-0 left-0 h-screen w-64 glass-strong flex flex-col z-30 overflow-y-auto">
      <div className="text-center mb-6 mt-8 px-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 mx-auto mb-4 flex items-center justify-center glass">
          <span className="text-2xl font-bold text-indigo-400">B</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-800 mb-1">ButterJack</h1>
        <p className="text-sm text-gray-500 mb-4">CS学生 / 独立音乐人</p>
        <div className="flex justify-center gap-3 text-gray-400">
          <a href="https://github.com/ButterJack07" target="_blank" className="hover:text-gray-600 transition-colors"><FaGithub size={18} /></a>
          <a href="https://space.bilibili.com/1453945101" target="_blank" className="hover:text-pink-500 transition-colors"><FaBilibili size={18} /></a>
          <a href="mailto:butterjack@email.com" className="hover:text-indigo-400 transition-colors"><FaEnvelope size={18} /></a>
        </div>
      </div>

      <nav className="flex-1 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-all ${
                isActive
                  ? 'bg-white/70 text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:bg-white/40 hover:text-gray-800'
              }`}
            >
              <item.icon size={16} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-4 mb-4">
        <div className="rounded-lg overflow-hidden">
          <img
            src="https://github-readme-stats.vercel.app/api?username=ButterJack07&show_icons=true&hide_border=true&bg_color=fff&title_color=6366f1&icon_color=818cf8&text_color=666&line_height=24"
            alt="GitHub Stats"
            className="w-full"
          />
        </div>
      </div>

      <div className="px-4 pb-4 space-y-2">
        {isLoggedIn ? (
          <>
            <button
              onClick={toggleEditMode}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                isEditMode
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'glass-card text-gray-600 hover:text-indigo-600'
              }`}
            >
              {isEditMode ? <FaLockOpen size={14} /> : <FaLock size={14} />}
              {isEditMode ? '编辑模式' : '浏览模式'}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <FaUser size={14} /> 退出登录
            </button>
          </>
        ) : (
          showLogin ? (
            <div className="glass-card rounded-xl p-4 space-y-3">
              <p className="text-xs text-gray-500">输入 GitHub Token 登录以编辑内容</p>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_..."
                className="w-full glass-input rounded-lg px-3 py-2 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <div className="flex gap-2">
                <button onClick={handleLogin} className="flex-1 px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-xs hover:bg-indigo-600">登录</button>
                <button onClick={() => setShowLogin(false)} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700">取消</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm glass-card text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <FaGithub size={14} /> GitHub 登录
            </button>
          )
        )}
      </div>

      <div className="px-6 py-3 text-xs text-gray-400 text-center border-t border-white/20">
        <p>© 2026 ButterJack</p>
        <p className="mt-0.5">Code & Melody</p>
      </div>
    </aside>
  )
}