'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Patient } from '@/lib/supabase'

export default function AllPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/patients').then(r => r.json()).then(d => { setPatients(d || []); setLoading(false) })
  }, [])

  async function exportAll() {
    const XLSX = await import('xlsx')
    const { VARIABLES } = await import('@/lib/variables')
    const recordsArr = await Promise.all(
      patients.map(p => fetch(`/api/patients/${p.patient_id}`).then(r => r.json()))
    )
    const rows = patients.map((pat, i) => {
      const row: Record<string, string | number | null> = {
        '病案号': pat.patient_id, '姓名': pat.name, '性别': pat.gender,
        '年龄': pat.age, '地址': pat.address, '婚姻': pat.marital_status,
        '电话1': pat.phone1 || '', '电话2': pat.phone2 || '',
      }
      for (const rec of (recordsArr[i] || [])) {
        const dateStr = rec.collection_date || rec.created_at?.split('T')[0] || ''
        for (const [k, v] of Object.entries(rec.variables || {})) {
          const def = VARIABLES[k]; if (!def) continue
          const col = def.needsDate ? `${def.label}_${dateStr}` : def.label
          row[col] = (v as { value: string | number }).value
        }
      }
      return row
    })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), '所有患者')
    XLSX.writeFile(wb, `全部患者_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const filtered = patients.filter(p =>
    p.patient_id?.includes(search) || p.name?.includes(search)
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">👥 全部患者</h2>
          <p className="text-gray-500 text-sm">跨项目的患者数据总览</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-success" onClick={exportAll} disabled={patients.length === 0}>📥 导出全部Excel</button>
          <Link href="/" className="btn-secondary">← 返回项目</Link>
        </div>
      </div>
      <div className="flex gap-3">
        <input className="input max-w-xs" placeholder="搜索病案号或姓名..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
          <span className="font-medium text-gray-700">患者列表</span>
          <span className="text-sm text-gray-400">{filtered.length} 名</span>
        </div>
        {loading ? <div className="text-center py-12 text-gray-400">加载中...</div> :
          filtered.length === 0 ? <div className="text-center py-12 text-gray-400">暂无患者</div> : (
          <table className="w-full">
            <thead><tr className="text-xs text-gray-500 border-b bg-gray-50">
              <th className="px-4 py-2 text-left">病案号</th><th className="px-4 py-2 text-left">姓名</th>
              <th className="px-4 py-2 text-left">性别</th><th className="px-4 py-2 text-left">年龄</th>
              <th className="px-4 py-2 text-left">地址</th><th className="px-4 py-2 text-left">电话</th>
              <th className="px-4 py-2 text-right">操作</th>
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-t hover:bg-gray-50 text-sm">
                  <td className="px-4 py-2 font-mono text-blue-600">{p.patient_id}</td>
                  <td className="px-4 py-2 font-medium">{p.name || '—'}</td>
                  <td className="px-4 py-2">{p.gender || '—'}</td>
                  <td className="px-4 py-2">{p.age ? `${p.age}岁` : '—'}</td>
                  <td className="px-4 py-2 text-gray-500 truncate max-w-xs">{p.address || '—'}</td>
                  <td className="px-4 py-2 text-gray-500">{p.phone1 || '—'}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex gap-1 justify-end">
                      <Link href={`/upload?patient=${p.patient_id}`} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">📷</Link>
                      <Link href={`/patients/${p.patient_id}`} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded hover:bg-gray-100">详情</Link>
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
