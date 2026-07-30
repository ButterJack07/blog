import { Routes, Route } from 'react-router-dom'
import { PlayerProvider } from './contexts/PlayerContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Music from './pages/Music'
import Library from './pages/Library'

export default function App() {
  return (
    <PlayerProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/music" element={<Music />} />
          <Route path="/library" element={<Library />} />
        </Routes>
      </Layout>
    </PlayerProvider>
  )
}