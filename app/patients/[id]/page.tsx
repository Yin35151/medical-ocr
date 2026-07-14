'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { Patient, PatientRecord } from '@/lib/supabase'
import { VARIABLES } from '@/lib/variables'

const TYPE_LABELS: Record<string, string> = {
  medical_history: '既往史',
  vital_signs: '体格检查',
  blood_routine: '血常规',
  biochemistry: '生化检查',
  lipids: '血脂',
  cardiac_markers: '心脏标志物',
  urine: '尿常规',
  echo: '超声心动图',
  discharge_diagnosis: '出院诊断',
  discharge_medication: '出院带药',
}

export default function PatientDetailPage() {
  const params = useParams()
  const patientId = params.id as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [records, setRecords] = useState<PatientRecord[]>([])
  const [loading, setLoading] = useState(true)

  // 编辑患者基础信息
  const [editingPatient, setEditingPatient] = useState(false)
  const [patientForm, setPatientForm] = useState<Partial<Patient>>({})
  const [savingPatient, setSavingPatient] = useState(false)

  // 编辑记录
  const [editingRecord, setEditingRecord] = useState<string | null>(null)  // record.id
  const [editingValues, setEditingValues] = useState<Record<string, string>>({})
  const [editingDate, setEditingDate] = useState('')
  const [savingRecord, setSavingRecord] = useState(false)

  useEffect(() => { loadData() }, [patientId])

  async function loadData() {
    setLoading(true)
    const [pRes, rRes] = await Promise.all([
      fetch('/api/patients'),
      fetch(`/api/patients/${patientId}`),
    ])
    const patients: Patient[] = await pRes.json()
    const p = patients.find(x => x.patient_id === patientId) || null
    setPatient(p)
    if (p) setPatientForm(p)
    const recs: PatientRecord[] = await rRes.json()
    setRecords(recs || [])
    setLoading(false)
  }

  // ── 保存患者基础信息 ────────────────────────────────────────────
  async function savePatient() {
    setSavingPatient(true)
    const res = await fetch(`/api/patients/${patientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientForm),
    })
    if (res.ok) {
      setPatient(prev => prev ? { ...prev, ...patientForm } : null)
      setEditingPatient(false)
    } else {
      alert('保存失败')
    }
    setSavingPatient(false)
  }

  // ── 开始编辑某条记录 ────────────────────────────────────────────
  function startEditRecord(record: PatientRecord) {
    setEditingRecord(record.id)
    setEditingDate(record.collection_date || '')
    const vals: Record<string, string> = {}
    for (const [k, v] of Object.entries(record.variables || {})) {
      vals[k] = String((v as { value: string | number }).value)
    }
    setEditingValues(vals)
  }

  // ── 保存记录编辑 ────────────────────────────────────────────────
  async function saveRecord(record: PatientRecord) {
    setSavingRecord(true)
    const variables: Record<string, { value: string | number; unit: string }> = {}
    for (const [key, strVal] of Object.entries(editingValues)) {
      if (!strVal) continue
      const def = VARIABLES[key]
      const numVal = parseFloat(strVal)
      variables[key] = {
        value: isNaN(numVal) || def?.type === 'text' || def?.type === 'yesno' ? strVal : numVal,
        unit: def?.unit || '',
      }
    }

    // 通过 Supabase 直接更新（用 record id）
    const res = await fetch(`/api/records/${record.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variables, collection_date: editingDate }),
    })
    if (res.ok) {
      setRecords(prev => prev.map(r =>
        r.id === record.id
          ? { ...r, variables, collection_date: editingDate }
          : r
      ))
      setEditingRecord(null)
    } else {
      alert('保存失败')
    }
    setSavingRecord(false)
  }

  // ── 删除记录 ────────────────────────────────────────────────────
  async function deleteRecord(recordId: string) {
    if (!confirm('确认删除这条记录？')) return
    const res = await fetch(`/api/records/${recordId}`, { method: 'DELETE' })
    if (res.ok) {
      setRecords(prev => prev.filter(r => r.id !== recordId))
    } else {
      alert('删除失败')
    }
  }

  // ── 导出 Excel ──────────────────────────────────────────────────
  async function exportExcel() {
    const XLSX = await import('xlsx')
    const wb = XLSX.utils.book_new()
    const grouped = new Map<string, PatientRecord[]>()
    for (const r of records) {
      if (!grouped.has(r.record_type)) grouped.set(r.record_type, [])
      grouped.get(r.record_type)!.push(r)
    }
    for (const [type, recs] of grouped) {
      const rows = recs.map(r => {
        const row: Record<string, string | number> = { '采集日期': r.collection_date || '' }
        for (const [k, v] of Object.entries(r.variables || {})) {
          const def = VARIABLES[k]
          row[def?.label || k] = (v as { value: string | number }).value
        }
        return row
      })
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), TYPE_LABELS[type] || type)
    }
    XLSX.writeFile(wb, `${patientId}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const grouped = new Map<string, PatientRecord[]>()
  for (const r of records) {
    if (!grouped.has(r.record_type)) grouped.set(r.record_type, [])
    grouped.get(r.record_type)!.push(r)
  }

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>

  return (
    <div className="space-y-5">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {patient?.name || '未知姓名'} <span className="text-gray-400 font-mono text-base ml-2">{patientId}</span>
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">{records.length} 条检查记录</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/upload?patient=${patientId}`} className="btn-primary">📷 继续上传</Link>
          <button className="btn-success" onClick={exportExcel}>📥 导出Excel</button>
          <Link href="/" className="btn-secondary">← 返回</Link>
        </div>
      </div>

      {/* 患者基础信息卡片 */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">患者基础信息</h3>
          {!editingPatient ? (
            <button className="text-xs text-blue-600 hover:underline" onClick={() => setEditingPatient(true)}>
              ✏️ 编辑
            </button>
          ) : (
            <div className="flex gap-2">
              <button className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                onClick={savePatient} disabled={savingPatient}>
                {savingPatient ? '保存中...' : '✓ 保存'}
              </button>
              <button className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200"
                onClick={() => { setEditingPatient(false); setPatientForm(patient || {}) }}>
                取消
              </button>
            </div>
          )}
        </div>

        {!editingPatient ? (
          <div className="grid grid-cols-4 gap-3 text-sm">
            {[
              { label: '姓名', val: patient?.name },
              { label: '性别', val: patient?.gender },
              { label: '年龄', val: patient?.age ? `${patient.age}岁` : undefined },
              { label: '婚姻状况', val: patient?.marital_status },
              { label: '地址', val: patient?.address },
              { label: '电话1', val: (patient as any)?.phone1 },
              { label: '电话2', val: (patient as any)?.phone2 },
            ].map(({ label, val }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">{label}</div>
                <div className="font-medium text-gray-800">{val || <span className="text-gray-300">—</span>}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'name', label: '姓名', type: 'text' },
              { key: 'gender', label: '性别', type: 'select', options: ['男', '女'] },
              { key: 'age', label: '年龄', type: 'number' },
              { key: 'marital_status', label: '婚姻状况', type: 'select', options: ['已婚', '未婚', '离异', '丧偶'] },
              { key: 'address', label: '地址', type: 'text' },
              { key: 'phone1', label: '电话1', type: 'text' },
              { key: 'phone2', label: '电话2', type: 'text' },
            ].map(({ key, label, type, options }) => (
              <div key={key}>
                <label className="label">{label}</label>
                {type === 'select' ? (
                  <select className="input" value={(patientForm as any)[key] || ''}
                    onChange={e => setPatientForm(p => ({ ...p, [key]: e.target.value }))}>
                    <option value="">—</option>
                    {options?.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input className="input" type={type} value={(patientForm as any)[key] || ''}
                    onChange={e => setPatientForm(p => ({ ...p, [key]: e.target.value }))} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 检查记录 */}
      {records.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">📋</div>
          <p>暂无记录，<Link href={`/upload?patient=${patientId}`} className="text-blue-500">去上传</Link></p>
        </div>
      ) : (
        Array.from(grouped.entries()).map(([type, typeRecords]) => (
          <div key={type} className="card">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                {TYPE_LABELS[type] || type}
              </span>
              <span className="text-xs text-gray-400">{typeRecords.length} 次</span>
            </h3>

            <div className="space-y-3">
              {typeRecords
                .sort((a, b) => (a.collection_date || '').localeCompare(b.collection_date || ''))
                .map(record => {
                  const isEditing = editingRecord === record.id
                  return (
                    <div key={record.id} className={`border rounded-lg p-3 ${isEditing ? 'border-blue-300 bg-blue-50' : 'border-gray-100'}`}>
                      {/* 记录头部 */}
                      <div className="flex items-center justify-between mb-2">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">采集日期:</span>
                            <input type="date" className="input text-xs py-1 w-36"
                              value={editingDate}
                              onChange={e => setEditingDate(e.target.value)} />
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-blue-600">
                            {record.collection_date || '日期未知'}
                          </span>
                        )}
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <button
                                className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                                onClick={() => saveRecord(record)} disabled={savingRecord}>
                                {savingRecord ? '保存中...' : '✓ 保存'}
                              </button>
                              <button
                                className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200"
                                onClick={() => setEditingRecord(null)}>
                                取消
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                                onClick={() => startEditRecord(record)}>
                                ✏️ 编辑
                              </button>
                              <button
                                className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded hover:bg-red-100"
                                onClick={() => deleteRecord(record.id)}>
                                删除
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* 数据展示/编辑 */}
                      {isEditing ? (
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(editingValues).map(([key, val]) => {
                            const def = VARIABLES[key]
                            return (
                              <div key={key} className="flex items-center gap-1 bg-white rounded p-2 border border-gray-200">
                                <span className="text-xs text-gray-500 shrink-0 w-20 truncate">{def?.label || key}</span>
                                <input
                                  className="flex-1 text-sm border-0 bg-transparent focus:outline-none min-w-0"
                                  value={val}
                                  onChange={e => setEditingValues(p => ({ ...p, [key]: e.target.value }))}
                                />
                                <span className="text-xs text-gray-400 shrink-0">{def?.unit || ''}</span>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2">
                          {Object.entries(record.variables || {}).map(([key, val]) => {
                            const def = VARIABLES[key]
                            return (
                              <div key={key} className="bg-gray-50 rounded p-2 text-center">
                                <div className="text-xs text-gray-400 truncate">{def?.label || key}</div>
                                <div className="font-semibold text-sm text-gray-800">{(val as { value: string | number }).value}</div>
                                <div className="text-xs text-gray-400">{def?.unit || (val as { unit: string }).unit}</div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
