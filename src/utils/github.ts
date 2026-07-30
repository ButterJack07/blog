const GITHUB_API = 'https://api.github.com'
const OWNER = 'ButterJack07'
const REPO = 'blog'

export async function fetchContent(path: string) {
  const res = await fetch(`${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${path}`)
  if (!res.ok) throw new Error('Failed to fetch content')
  return res.json()
}

export async function fetchFileText(path: string) {
  const data = await fetchContent(path)
  if (data.content) {
    return atob(data.content.replace(/\n/g, ''))
  }
  throw new Error('No content found')
}

export async function fetchGitHubRepos(username: string) {
  const res = await fetch(`${GITHUB_API}/users/${username}/repos?sort=updated&per_page=50`)
  if (!res.ok) throw new Error('Failed to fetch repos')
  return res.json()
}

export async function commitFile(path: string, content: string, message: string, token: string, sha?: string) {
  const encoded = btoa(unescape(encodeURIComponent(content)))
  const body: Record<string, unknown> = {
    message,
    content: encoded,
  }
  if (sha) body.sha = sha

  const res = await fetch(`${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to commit file')
  return res.json()
}

export async function uploadFile(path: string, file: File, message: string, token: string) {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  const encoded = btoa(binary)

  const res = await fetch(`${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, content: encoded }),
  })
  if (!res.ok) throw new Error('Failed to upload file')
  return res.json()
}