export interface MusicTrack {
  id: string
  title: string
  artist: string
  album?: string
  genre?: string
  year?: string
  coverUrl?: string
  audioUrl: string
  lrcUrl?: string
  description?: string
}

export interface LyricLine {
  time: number
  text: string
}

export interface Notebook {
  id: string
  title: string
  coverColor?: string
  description?: string
  createdAt: string
  updatedAt: string
  chapters: Chapter[]
}

export interface Chapter {
  id: string
  title: string
  content: string
  order: number
}

export interface GithubRepo {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  language: string
  stargazers_count: number
  fork: boolean
  topics: string[]
}

export interface WebLink {
  id: string
  title: string
  url: string
  description: string
  icon?: string
  category: string
}

export interface BlogConfig {
  username: string
  title: string
  subtitle: string
  bio: string
  avatarUrl?: string
  social: {
    github?: string
    bilibili?: string
    email?: string
    netease?: string
  }
  tags: string[]
}