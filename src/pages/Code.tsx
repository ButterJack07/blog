import { useState } from 'react'
import { FaGithub, FaStar, FaCodeFork } from 'react-icons/fa6'
import type { GithubRepo } from '../types'

const demoRepos: GithubRepo[] = [
  { id: 1, name: 'blog', full_name: 'ButterJack07/blog', description: '个人博客系统，纯静态，支持Markdown渲染。', html_url: 'https://github.com/ButterJack07', language: 'HTML', stargazers_count: 3, fork: false, topics: ['blog', 'frontend'] },
  { id: 2, name: 'pdf-parser', full_name: 'ButterJack07/pdf-parser', description: '基于Qwen-VL的多模态PDF结构化解析工具。', html_url: 'https://github.com/ButterJack07', language: 'Python', stargazers_count: 12, fork: false, topics: ['nlp', 'multimodal'] },
  { id: 3, name: 'riscv-cpu', full_name: 'ButterJack07/riscv-cpu', description: '五级流水线RISC-V CPU，支持冒险处理和中断。', html_url: 'https://github.com/ButterJack07', language: 'Verilog', stargazers_count: 8, fork: false, topics: ['cpu', 'architecture'] },
  { id: 4, name: 'platform-game', full_name: 'ButterJack07/platform-game', description: 'C++/Qt 2D横版跳跃游戏，支持物理引擎。', html_url: 'https://github.com/ButterJack07', language: 'C++', stargazers_count: 5, fork: false, topics: ['game', 'qt'] },
]

const tagColors: Record<string, string> = {
  HTML: 'bg-orange-100 text-orange-700',
  Python: 'bg-blue-100 text-blue-700',
  Verilog: 'bg-green-100 text-green-700',
  'C++': 'bg-purple-100 text-purple-700',
  JavaScript: 'bg-yellow-100 text-yellow-700',
}

export default function Code() {
  const [repos] = useState<GithubRepo[]>(demoRepos)
  const [filter, setFilter] = useState('')

  const filtered = filter
    ? repos.filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()) || r.language?.toLowerCase().includes(filter.toLowerCase()))
    : repos

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-1">代码作品</h2>
          <p className="text-gray-500">课程项目与开源尝试，所有代码都在GitHub。</p>
        </div>
        <a
          href="https://github.com/ButterJack07"
          target="_blank"
          className="glass-card px-4 py-2 rounded-lg text-sm text-gray-600 flex items-center gap-2 hover:text-indigo-600"
        >
          <FaGithub size={16} /> GitHub
        </a>
      </div>

      <input
        type="text"
        placeholder="搜索项目..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full glass-input rounded-xl px-4 py-3 mb-6 text-sm"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((repo) => (
          <div key={repo.id} className="glass-card rounded-xl overflow-hidden group">
            <div className={`h-36 flex items-center justify-center ${
              repo.language === 'Python' ? 'bg-gradient-to-br from-blue-100 to-indigo-50' :
              repo.language === 'Verilog' ? 'bg-gradient-to-br from-green-100 to-emerald-50' :
              repo.language === 'C++' ? 'bg-gradient-to-br from-purple-100 to-pink-50' :
              repo.language === 'HTML' ? 'bg-gradient-to-br from-orange-100 to-yellow-50' :
              'bg-gradient-to-br from-gray-100 to-slate-50'
            }`}>
              <FaGithub className="text-white/40 group-hover:scale-110 transition-transform" size={64} />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{repo.name}</h3>
                <a href={repo.html_url} target="_blank" className="text-gray-400 hover:text-indigo-600 transition-colors">
                  <FaGithub size={16} />
                </a>
              </div>
              <p className="text-sm text-gray-500 mb-3">{repo.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {repo.language && (
                  <span className={`text-xs px-2 py-0.5 rounded ${tagColors[repo.language] || 'bg-gray-100 text-gray-600'}`}>
                    {repo.language}
                  </span>
                )}
                {repo.topics?.map((topic) => (
                  <span key={topic} className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">
                    {topic}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><FaStar size={12} /> {repo.stargazers_count}</span>
                <span className="flex items-center gap-1"><FaCodeFork size={12} /> {repo.fork ? 'Fork' : 'Original'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}