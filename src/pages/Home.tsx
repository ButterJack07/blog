import { Link } from 'react-router-dom'
import { FaMusic, FaCode, FaBook, FaGlobe, FaGithub, FaBolt } from 'react-icons/fa6'

const cards = [
  { path: '/music', icon: FaMusic, title: '音乐创作间', desc: '原创歌曲、demo片段，那些代码写不出的话都在这里。', color: 'from-rose-100 to-orange-50' },
  { path: '/code', icon: FaCode, title: '技术实验室', desc: '课程项目、技术笔记，从C++到大模型的所有探索。', color: 'from-blue-100 to-indigo-50' },
  { path: '/library', icon: FaBook, title: '图书馆', desc: '知识笔记本，按书目整理，支持在线编辑与阅读。', color: 'from-emerald-100 to-teal-50' },
  { path: '/webnav', icon: FaGlobe, title: '网页导航', desc: '精选网页项目与工具导航。', color: 'from-purple-100 to-pink-50' },
]

export default function Home() {
  return (
    <>
      <div className="min-h-[70vh] flex flex-col justify-center mb-16">
        <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
          代码写逻辑，<br />
          <span className="text-indigo-500">旋律</span>写<span className="text-rose-400">情绪</span>
        </h2>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl">
          南京大学计算机系在读，一边写bug一边写歌。在这里记录技术成长、课程笔记，还有那些没说出口的情绪都藏在旋律里。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          {cards.map((card) => (
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
            <div className="flex items-center gap-2 mb-3 text-gray-400 text-xs">
              <FaGithub /> GitHub
            </div>
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
    </>
  )
}