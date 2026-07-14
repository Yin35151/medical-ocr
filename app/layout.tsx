import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '病历OCR系统',
  description: '医学病历照片识别与结构化数据采集',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-blue-700 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏥</span>
              <div>
                <h1 className="font-bold leading-tight">病历OCR数据采集</h1>
                <p className="text-blue-200 text-xs">两阶段AI识别 · 异常高亮 · 队列管理</p>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <a href="/" className="hover:text-blue-200">🗂️ 项目</a>
              <a href="/upload" className="hover:text-blue-200">📷 上传</a>
              <a href="/patients" className="hover:text-blue-200">👥 患者</a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  )
}
