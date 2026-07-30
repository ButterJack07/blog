import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 md:p-12 lg:p-16 ml-64">
        <div className="max-w-5xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}