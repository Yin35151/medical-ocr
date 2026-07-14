'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Project } from '@/lib/supabase'

interface ProjectWithCount extends Project { patient_count: number }

export default function HomePage() {
  const [projects, setProjects] = useState<ProjectWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const res = await fetch('/api/projects')
    const data = await res.json()
    setProjects(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function create() {
    if (!form.name.trim()) return alert('项目名称不能为空')
    setSaving(true)
    const res = await fetch('/api/projects', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setProjects(p => [{ ...data, patient_count: 0 }, ...p])
      setShowForm(false); setForm({ name: '', description: '' })
    } else { alert(data.error) }
    setSaving(false)
  }

  async function deleteProject(id: string, name: string) {
    if (!confirm(`删除项目「${name}」？（不会删除患者数据，只删除项目标签）`)) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    setProjects(p => p.filter(x => x.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">研究项目</h2>
          <p className="text-gray-500 text-sm mt-1">每个项目是一个患者队列，患者数据跨项目共享</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ 新建项目</button>
          <Link href="/upload" className="btn-secondary">📷 上传识别</Link>
          <Link href="/patients" className="btn-secondary">👥 所有患者</Link>
        </div>
      </div>

      {/* 新建表单 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">新建研究项目</h3>
            <div className="space-y-3">
              <div>
                <label className="label">项目名称 *</label>
                <input className="input" placeholder="如：心衰队列2024" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && create()} />
              </div>
              <div>
                <label className="label">项目描述（可选）</label>
                <textarea className="input h-20 resize-none" placeholder="描述研究目的、入排标准等..."
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button className="btn-primary flex-1" onClick={create} disabled={saving}>
                {saving ? '创建中...' : '✓ 创建项目'}
              </button>
              <button className="btn-secondary flex-1" onClick={() => setShowForm(false)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 项目列表 */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">加载中...</div>
      ) : projects.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-5xl mb-3">🗂️</div>
          <p className="text-gray-500 text-lg font-medium">还没有项目</p>
          <p className="text-gray-400 text-sm mt-1">点击「新建项目」开始创建你的第一个研究队列</p>
          <button className="btn-primary mt-4" onClick={() => setShowForm(true)}>+ 新建项目</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <div key={p.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-lg truncate">{p.name}</h3>
                  {p.description && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{p.description}</p>
                  )}
                </div>
                <button onClick={() => deleteProject(p.id, p.name)}
                  className="text-gray-300 hover:text-red-400 ml-2 shrink-0 text-lg">×</button>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-50 text-blue-600 text-sm font-medium px-3 py-1 rounded-full">
                    {p.patient_count} 名患者
                  </span>
                  <span className="text-gray-400 text-xs">
                    {new Date(p.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <Link href={`/projects/${p.id}`}
                  className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                  进入 →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
