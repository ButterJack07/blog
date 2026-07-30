import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Music from './pages/Music'
import Library from './pages/Library'
import Code from './pages/Code'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/music" element={<Music />} />
        <Route path="/library" element={<Library />} />
        <Route path="/code" element={<Code />} />
      </Routes>
    </Layout>
  )
}