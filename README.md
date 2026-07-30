# ButterJack 博客

ButterJack 的个人博客，托管于 GitHub Pages。

## 技术栈

纯静态单 HTML 文件，无框架依赖。CSS/JS 全部内嵌，双击 `index.html` 或用 Live Server 打开即可运行。

## 页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `#/home` | 个人介绍 + 最新动态 |
| 原创音乐 | `#/music` | 音乐播放器 + 歌词 + 播放列表 |
| 有趣的东西 | `#/nav` | 收藏的实用网站导航（可编辑、拖拽排序） |
| 知识库 | `#/library` | 笔记本 + 章节管理（可编辑） |

## 功能

### 音乐播放器
- 播放/暂停/上一首/下一首
- 进度条拖拽 + 音量控制
- LRC 歌词解析 + 实时滚动高亮（当前行居中、已过行淡化）
- 点击歌词跳转到对应时间
- 音频可视化（Web Audio API + Canvas 频谱）
- 底部全局播放条
- 编辑模式下支持上传新乐曲（需 GitHub Token）

### 有趣的东西 (网页导航)
- 分类筛选（全部/工具/框架/平台/设计/...）
- 编辑模式：添加/删除链接（localStorage 持久化）
- 拖拽排序（编辑模式下拖拽手柄）

### 知识库 (图书馆)
- 书架 → 笔记本 → 章节三级浏览
- 编辑模式：新建/删除笔记本和章节
- Markdown 编辑器：编辑/预览切换，保存到 localStorage

### 编辑模式
- 侧边栏底部切换按钮
- 启用后显示增删按钮和拖拽手柄
- 无需登录，数据存储在浏览器 localStorage

### 响应式
- 移动端自动隐藏侧边栏，汉堡菜单打开
- 网格和布局自适应

## 音乐数据

`music/tracks.json` 管理音乐清单，支持 LRC 歌词文件。

## 本地预览

用 Live Server 或任何 HTTP 服务器打开 `index.html`：

```bash
# Python
python -m http.server 5500

# Node
npx serve .
```

## 部署

GitHub Pages：Settings → Pages → Source: Deploy from branch `master`, root `/`。

## 目录结构

```
├── index.html          # 主页面（全部 CSS/JS 内嵌）
├── music/
│   ├── tracks.json     # 音乐清单
│   ├── 渺小/           # 歌曲文件夹
│   ├── 彩燕/
│   └── 彩燕2025/
├── images/             # 图片
├── posts/              # 文章
└── README.md
```
