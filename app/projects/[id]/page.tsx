'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { Patient, Project } from '@/lib/supabase'

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState('')
  const [adding, setAdding] = useState(false)
  const [search, setSearch] = useState('')
  const [editProject, setEditProject] = useState(false)
  const [projForm, setProjForm] = useState({ name: '', description: '' })
  const [allPatients, setAllPatients] = useState<Patient[]>([])
  const [showAddExisting, setShowAddExisting] = useState(false)

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    const [projRes, allRes] = await Promise.all([
      fetch(`/api/projects/${id}`),
      fetch('/api/patients'),
    ])
    const projData = await projRes.json()
    const allData = await allRes.json()
    setProject(projData.project)
    setProjForm({ name: projData.project?.name || '', description: projData.project?.description || '' })
    setPatients(projData.patients || [])
    setAllPatients(allData || [])
    setLoading(false)
  }

  async function addPatient(patient_id: string) {
    if (!patient_id.trim()) return alert('请输入病案号')
    setAdding(true)
    const res = await fetch(`/api/projects/${id}/patients`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id: patient_id.trim() }),
    })
    if (res.ok) {
      setAddingId('')
      await load()
    } else {
      const e = await res.json()
      alert(e.error)
    }
    setAdding(false)
  }

  async function removePatient(patient_id: string) {
    if (!confirm(`从项目中移除患者 ${patient_id}？（不删除患者数据）`)) return
    await fetch(`/api/projects/${id}/patients/${patient_id}`, { method: 'DELETE' })
    setPatients(p => p.filter(x => x.patient_id !== patient_id))
  }

  async function saveProject() {
    await fetch(`/api/projects/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projForm),
    })
    setProject(p => p ? { ...p, ...projForm } : null)
    setEditProject(false)
  }

  async function exportExcel() {
    const XLSX = await import('xlsx')
    // 获取所有患者记录
    const recordsArr = await Promise.all(
      patients.map(p => fetch(`/api/patients/${p.patient_id}`).then(r => r.json()))
    )
    const { VARIABLES } = await import('@/lib/variables')

    const rows = patients.map((pat, i) => {
      const row: Record<string, string | number | null> = {
        '病案号': pat.patient_id, '姓名': pat.name, '性别': pat.gender,
        '年龄': pat.age, '地址': pat.address, '婚姻': pat.marital_status,
        '电话1': pat.phone1 || '', '电话2': pat.phone2 || '',
      }
      for (const rec of (recordsArr[i] || [])) {
        const dateStr = rec.collection_date || rec.created_at?.split('T')[0] || ''
        for (const [k, v] of Object.entries(rec.variables || {})) {
          const def = VARIABLES[k]
          if (!def) continue
          const col = def.needsDate ? `${def.label}_${dateStr}` : def.label
          row[col] = (v as { value: string | number }).value
        }
      }
      return row
    })

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!freeze'] = { xSplit: 0, ySplit: 1 }
    XLSX.utils.book_append_sheet(wb, ws, '数据')
    XLSX.writeFile(wb, `${project?.name}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const filtered = patients.filter(p =>
    p.patient_id?.includes(search) || p.name?.includes(search)
  )

  // 可加入项目的患者（尚未在项目中）
  const inProjectIds = new Set(patients.map(p => p.patient_id))
  const notInProject = allPatients.filter(p => !inProjectIds.has(p.patient_id))

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>
  if (!project) return <div className="text-center py-20 text-red-400">项目不存在</div>

  return (
    <div className="space-y-5">
      {/* 项目头部 */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {editProject ? (
              <div className="space-y-2">
                <input className="input text-xl font-bold" value={projForm.name}
                  onChange={e => setProjForm(p => ({ ...p, name: e.target.value }))} />
                <textarea className="input text-sm h-16 resize-none" value={projForm.description}
                  onChange={e => setProjForm(p => ({ ...p, description: e.target.value }))} />
                <div className="flex gap-2">
                  <button className="btn-primary text-sm py-1" onClick={saveProject}>保存</button>
                  <button className="btn-secondary text-sm py-1" onClick={() => setEditProject(false)}>取消</button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-800">{project.name}</h2>
                {project.description && <p className="text-gray-500 text-sm mt-1">{project.description}</p>}
              </>
            )}
          </div>
          <div className="flex gap-2 ml-4 shrink-0">
            {!editProject && (
              <button className="btn-secondary text-sm" onClick={() => setEditProject(true)}>✏️ 编辑</button>
            )}
            <button className="btn-success text-sm" onClick={exportExcel} disabled={patients.length === 0}>
              📥 导出Excel
            </button>
            <Link href="/" className="btn-secondary text-sm">← 返回</Link>
          </div>
        </div>

        {/* 统计 */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center"><div className="text-2xl font-bold text-blue-600">{patients.length}</div><div className="text-xs text-gray-400">患者总数</div></div>
          <div className="text-center"><div className="text-2xl font-bold text-blue-400">{patients.filter(p => p.gender === '男').length}</div><div className="text-xs text-gray-400">男性</div></div>
          <div className="text-center"><div className="text-2xl font-bold text-pink-400">{patients.filter(p => p.gender === '女').length}</div><div className="text-xs text-gray-400">女性</div></div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="flex items-center gap-3 flex-wrap">
        <input className="input max-w-xs" placeholder="搜索病案号或姓名..."
          value={search} onChange={e => setSearch(e.target.value)} />
        {/* 快速添加 */}
        <div className="flex gap-1">
          <input className="input w-36" placeholder="输入病案号"
            value={addingId} onChange={e => setAddingId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPatient(addingId)} />
          <button className="btn-primary text-sm" onClick={() => addPatient(addingId)} disabled={adding}>
            {adding ? '...' : '+ 加入'}
          </button>
        </div>
        {/* 从已有患者中加入 */}
        {notInProject.length > 0 && (
          <button className="btn-secondary text-sm" onClick={() => setShowAddExisting(v => !v)}>
            从已有患者添加 ({notInProject.length})
          </button>
        )}
        <Link href={`/upload?project=${id}`} className="btn-secondary text-sm">📷 上传</Link>
      </div>

      {/* 从已有患者选择 */}
      {showAddExisting && (
        <div className="card bg-blue-50 border-blue-100">
          <p className="text-sm font-medium text-blue-700 mb-2">选择要加入本项目的患者：</p>
          <div className="flex flex-wrap gap-2">
            {notInProject.map(p => (
              <button key={p.patient_id}
                className="text-xs bg-white border border-blue-200 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                onClick={() => { addPatient(p.patient_id); setShowAddExisting(false) }}>
                {p.name || p.patient_id} ({p.patient_id})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 患者列表 */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
          <span className="font-medium text-gray-700">患者列表</span>
          <span className="text-sm text-gray-400">{filtered.length} 名</span>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-3xl mb-2">👥</div>
            <p>暂无患者，输入病案号点击「加入」添加</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-2 text-left font-medium">病案号</th>
                <th className="px-4 py-2 text-left font-medium">姓名</th>
                <th className="px-4 py-2 text-left font-medium">性别</th>
                <th className="px-4 py-2 text-left font-medium">年龄</th>
                <th className="px-4 py-2 text-left font-medium">地址</th>
                <th className="px-4 py-2 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.patient_id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm font-mono text-blue-600">{p.patient_id}</td>
                  <td className="px-4 py-2.5 text-sm font-medium">{p.name || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-2.5 text-sm">{p.gender || '—'}</td>
                  <td className="px-4 py-2.5 text-sm">{p.age ? `${p.age}岁` : '—'}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-500 truncate max-w-xs">{p.address || '—'}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex gap-1 justify-end">
                      <Link href={`/upload?patient=${p.patient_id}&project=${id}`}
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">📷</Link>
                      <Link href={`/patients/${p.patient_id}`}
                        className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded hover:bg-gray-100">详情</Link>
                      <button onClick={() => removePatient(p.patient_id)}
                        className="text-xs bg-red-50 text-red-400 px-2 py-1 rounded hover:bg-red-100">移除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
