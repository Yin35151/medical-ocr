'use client'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { VARIABLES } from '@/lib/variables'
import { checkAbnormal } from '@/lib/reference-ranges'

const TYPE_LABELS: Record<string, string> = {
  medical_history:'既往史', vital_signs:'体格检查', blood_routine:'血常规',
  biochemistry:'生化', lipids:'血脂', cardiac_markers:'心脏标志物',
  urine:'尿常规', echo:'超声心动图', discharge_diagnosis:'出院诊断', discharge_medication:'出院带药',
}

interface RecordEntry {
  collection_date: string | null
  data: Record<string, { value: string | number; unit: string }>
}

type VariableValue = { value: string | number; unit: string }

interface ParsedResult {
  image_type: string
  confidence: string
  notes: string
  patient_info?: {
    patient_name?: string; gender?: string; age?: number
    marital_status?: string; phone1?: string; phone2?: string; address?: string
  }
  records: RecordEntry[]
}

interface EditableRecord {
  date: string
  data: Record<string, string>
  saved: boolean
}

interface BatchItem {
  filename: string
  status: 'pending' | 'ocr' | 'cleaning' | 'done' | 'error'
  result?: ParsedResult
  error?: string
}

type InputMode = 'image' | 'text' | 'zip'

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <UploadPageContent />
    </Suspense>
  )
}

function UploadPageContent() {
  const searchParams = useSearchParams()
  const [patientId, setPatientId] = useState(searchParams.get('patient') || '')
  const [projectId] = useState(searchParams.get('project') || '')
  const [mode, setMode] = useState<InputMode>('image')

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [parsed, setParsed] = useState<ParsedResult | null>(null)
  const [editableRecords, setEditableRecords] = useState<EditableRecord[]>([])
  const [saving, setSaving] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  const [rawText, setRawText] = useState('')

  const [batchItems, setBatchItems] = useState<BatchItem[]>([])
  const [batchRunning, setBatchRunning] = useState(false)
  const [batchSaved, setBatchSaved] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const zipInputRef = useRef<HTMLInputElement>(null)

  // ── 剪贴板粘贴 ────────────────────────────────────────────────
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (mode !== 'image') return
      const items = Array.from(e.clipboardData?.items || [])
      const imgItem = items.find(i => i.type.startsWith('image/'))
      if (imgItem) {
        const file = imgItem.getAsFile()
        if (file) handleFile(file)
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [mode])

  function handleFile(file: File) {
    setImageFile(file); setParsed(null); setEditableRecords([])
    const reader = new FileReader()
    reader.onload = e => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) handleFile(file)
  }, [])

  async function compressAndEncode(file: File): Promise<{ base64: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const MAX = 2048
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX }
          else { width = Math.round(width * MAX / height); height = MAX }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        URL.revokeObjectURL(url)
        resolve({ base64: canvas.toDataURL('image/jpeg', 0.85).split(',')[1], mimeType: 'image/jpeg' })
      }
      img.onerror = reject; img.src = url
    })
  }

  // ── 分析（图片或文字）─────────────────────────────────────────
  async function analyze() {
    if (!patientId.trim()) return alert('请先填写病案号')
    setAnalyzing(true)
    try {
      let body: object
      if (mode === 'image') {
        if (!imageFile) return alert('请上传图片')
        const { base64, mimeType } = await compressAndEncode(imageFile)
        body = { imageBase64: base64, mimeType }
      } else {
        if (!rawText.trim()) return alert('请粘贴待识别文字')
        body = { rawText }
      }
      const res = await fetch('/api/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await res.json()
      if (!res.ok) return alert(`识别失败: ${result.error}`)
      applyResult(result)
    } catch { alert('请求失败，请检查网络') }
    finally { setAnalyzing(false) }
  }

  function applyResult(result: ParsedResult) {
    setParsed(result)
    const today = new Date().toISOString().split('T')[0]
    const recs: EditableRecord[] = (result.records || []).map(r => ({
      date: r.collection_date || today,
      data: Object.fromEntries(Object.entries(r.data || {}).map(([k, v]) => [k, String(v.value)])),
      saved: false,
    }))
    // 如果AI没返回任何record，创建一个空的
    if (recs.length === 0) recs.push({ date: today, data: {}, saved: false })
    setEditableRecords(recs)
  }

  // ── 更新某条记录的某个字段 ─────────────────────────────────────
  function updateRecordDate(idx: number, date: string) {
    setEditableRecords(prev => prev.map((r, i) => i === idx ? { ...r, date } : r))
  }
  function updateRecordValue(idx: number, key: string, val: string) {
    setEditableRecords(prev => prev.map((r, i) => i === idx ? { ...r, data: { ...r.data, [key]: val } } : r))
  }
  function addRecord() {
    setEditableRecords(prev => [...prev, { date: new Date().toISOString().split('T')[0], data: {}, saved: false }])
  }
  function removeRecord(idx: number) {
    setEditableRecords(prev => prev.filter((_, i) => i !== idx))
  }

  // ── 保存所有记录 ──────────────────────────────────────────────
  async function saveAllRecords() {
    if (!parsed || !patientId.trim()) return
    const unsaved = editableRecords.filter(r => !r.saved)
    if (unsaved.length === 0) return
    setSaving(true)
    let successCount = 0
    for (let i = 0; i < editableRecords.length; i++) {
      const rec = editableRecords[i]
      if (rec.saved) continue
      const variables: Record<string, { value: string | number; unit: string }> = {}
      for (const [k, v] of Object.entries(rec.data)) {
        if (!v) continue
        const def = VARIABLES[k]
        const num = parseFloat(v)
        variables[k] = { value: isNaN(num) || def?.type === 'text' || def?.type === 'yesno' ? v : num, unit: def?.unit || '' }
      }
      const res = await fetch(`/api/patients/${patientId.trim()}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          record_type: parsed.image_type || 'other',
          collection_date: rec.date,
          variables,
          raw_ocr_text: JSON.stringify(parsed),
          patient_name: parsed.patient_info?.patient_name || '',
          patient_info: parsed.patient_info || {},
          project_id: projectId || null,
        }),
      })
      if (res.ok) {
        successCount++
        setEditableRecords(prev => prev.map((r, idx) => idx === i ? { ...r, saved: true } : r))
      } else {
        const e = await res.json()
        alert(`第${i + 1}条保存失败: ${e.error}`)
      }
    }
    if (successCount > 0) {
      setSavedCount(c => c + successCount)
    }
    setSaving(false)
  }

  function reset() {
    setParsed(null); setImageFile(null); setImagePreview('')
    setEditableRecords([]); setRawText('')
  }

  // ── ZIP批量 ───────────────────────────────────────────────────
  async function handleZip(file: File) {
    if (!patientId.trim()) return alert('请先填写病案号')
    const JSZip = (await import('jszip')).default
    const zip = await JSZip.loadAsync(file)
    const imgExts = /\.(jpe?g|png|webp|heic|bmp)$/i
    const files = Object.values(zip.files).filter(f => !f.dir && imgExts.test(f.name))
    if (files.length === 0) return alert('ZIP中未找到图片文件')
    setBatchItems(files.map(f => ({ filename: f.name, status: 'pending' })))
    setBatchRunning(true); setBatchSaved(0)

    for (let i = 0; i < files.length; i++) {
      const zipFile = files[i]
      setBatchItems(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'ocr' } : item))
      try {
        const blob = await zipFile.async('blob')
        const imgFile = new File([blob], zipFile.name, { type: 'image/jpeg' })
        const { base64, mimeType } = await compressAndEncode(imgFile)
        setBatchItems(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'cleaning' } : item))
        const res = await fetch('/api/analyze', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType }),
        })
        const result = await res.json()
        if (!res.ok) throw new Error(result.error)

        // 每条record分别保存
        for (const rec of (result.records || [])) {
          const variables: Record<string, VariableValue> = {}
          for (const [k, v] of Object.entries(rec.data || {}) as [string, VariableValue][]) {
            const def = VARIABLES[k]; const num = parseFloat(String(v.value))
            variables[k] = { value: isNaN(num) || def?.type === 'text' || def?.type === 'yesno' ? v.value : num, unit: def?.unit || '' }
          }
          await fetch(`/api/patients/${patientId.trim()}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              record_type: result.image_type || 'other', collection_date: rec.collection_date,
              variables, raw_ocr_text: JSON.stringify(result),
              patient_name: result.patient_info?.patient_name || '',
              patient_info: result.patient_info || {},
              project_id: projectId || null,
            }),
          })
        }
        setBatchSaved(c => c + 1)
        setBatchItems(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'done', result } : item))
      } catch (e) {
        setBatchItems(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'error', error: (e as Error).message } : item))
      }
      if (i < files.length - 1) await new Promise(r => setTimeout(r, 1000))
    }
    setBatchRunning(false)
  }

  const allSaved = editableRecords.length > 0 && editableRecords.every(r => r.saved)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800">📷 病历照片识别</h2>
        {projectId && <p className="text-blue-600 text-sm mt-0.5">当前项目：自动关联</p>}
      </div>

      {/* 模式切换 */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['image','text','zip'] as InputMode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === m ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {m === 'image' ? '📷 上传图片' : m === 'text' ? '📝 粘贴文字' : '📦 批量ZIP'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 左列 */}
        <div className="space-y-4">
          <div className="card">
            <label className="label">病案号（必填）</label>
            <input className="input" placeholder="输入患者病案号" value={patientId}
              onChange={e => setPatientId(e.target.value)} />
            {savedCount > 0 && <p className="text-green-600 text-xs mt-1">✓ 本次已保存 {savedCount} 条记录</p>}
          </div>

          {mode === 'image' && (
            <>
              <div
                className={`card border-2 border-dashed cursor-pointer transition-colors
                  ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
                {imagePreview ? (
                  <div className="space-y-2">
                    <img src={imagePreview} alt="预览" className="w-full rounded-lg max-h-60 object-contain bg-gray-100" />
                    <p className="text-xs text-center text-gray-400">点击更换 | Ctrl+V 粘贴</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📸</div>
                    <p className="text-gray-600 font-medium">点击选择 / 拖拽 / Ctrl+V 粘贴</p>
                    <p className="text-gray-400 text-xs mt-1">支持 JPG/PNG/HEIC，自动压缩</p>
                  </div>
                )}
              </div>
              <button className="btn-primary w-full py-3" onClick={analyze} disabled={analyzing || !imageFile}>
                {analyzing ? <Spinner text="AI识别中（两阶段，约30秒）..." /> : '🔍 开始识别'}
              </button>
            </>
          )}

          {mode === 'text' && (
            <>
              <div className="card">
                <label className="label">粘贴病历文字</label>
                <textarea className="input h-48 resize-none font-mono text-xs"
                  placeholder="直接粘贴化验单、病历文字，AI自动识别并结构化..."
                  value={rawText} onChange={e => setRawText(e.target.value)} />
              </div>
              <button className="btn-primary w-full py-3" onClick={analyze} disabled={analyzing || !rawText.trim()}>
                {analyzing ? <Spinner text="AI整理中..." /> : '🧹 开始整理文字'}
              </button>
            </>
          )}

          {mode === 'zip' && (
            <>
              <div className="card border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-300"
                onClick={() => zipInputRef.current?.click()}>
                <input ref={zipInputRef} type="file" accept=".zip" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleZip(e.target.files[0]) }} />
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📦</div>
                  <p className="text-gray-600 font-medium">点击选择ZIP压缩包</p>
                  <p className="text-gray-400 text-xs mt-1">同一患者多图打包上传，逐张处理后自动保存</p>
                </div>
              </div>
              {batchItems.length > 0 && (
                <div className="card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">进度 {batchSaved}/{batchItems.length}</span>
                    {!batchRunning && <span className="text-green-600 text-sm">✓ 完成</span>}
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all" style={{ width: `${(batchSaved / batchItems.length) * 100}%` }} />
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {batchItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] shrink-0
                          ${item.status === 'done' ? 'bg-green-500' : item.status === 'error' ? 'bg-red-400' : item.status === 'pending' ? 'bg-gray-200' : 'bg-blue-500'}`}>
                          {item.status === 'done' ? '✓' : item.status === 'error' ? '!' : item.status === 'pending' ? '·' : '→'}
                        </span>
                        <span className="truncate text-gray-600 flex-1">{item.filename}</span>
                        <span className={`shrink-0 ${item.status === 'error' ? 'text-red-500' : 'text-gray-400'}`}>
                          {item.status === 'pending' ? '等待' : item.status === 'ocr' ? 'OCR中...' : item.status === 'cleaning' ? '整理...' : item.status === 'done' ? (item.result ? `${TYPE_LABELS[item.result.image_type] || item.result.image_type} (${item.result.records?.length || 1}条)` : '完成') : item.error || '失败'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="card bg-blue-50 border-blue-100 text-xs text-blue-600 space-y-1">
            <div className="font-semibold text-blue-700 mb-1">📌 使用提示</div>
            <div>• 图片模式：支持Ctrl+V粘贴剪贴板截图</div>
            <div>• 文字模式：粘贴化验单文字，跳过OCR更快更准</div>
            <div>• 含多个日期的报告单会自动拆分为多条记录</div>
            <div>• 可在右侧编辑后再保存，也可手动增减日期组</div>
          </div>
        </div>

        {/* 右列：识别结果（多日期组） */}
        <div>
          {!parsed ? (
            <div className="card h-full flex items-center justify-center text-gray-400 min-h-64">
              <div className="text-center"><div className="text-4xl mb-2">📋</div><p>识别结果将在此显示</p><p className="text-xs mt-1">支持一次识别多个检查日期</p></div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* 头部信息 */}
              <div className="card">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                    {TYPE_LABELS[parsed.image_type] || parsed.image_type}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${parsed.confidence === 'high' ? 'bg-green-100 text-green-700' : parsed.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    置信度：{parsed.confidence === 'high' ? '高' : parsed.confidence === 'medium' ? '中' : '低'}
                  </span>
                  <span className="text-xs text-gray-400">{editableRecords.length} 个日期组</span>
                </div>

                {/* 识别到的患者信息 */}
                {parsed.patient_info && Object.values(parsed.patient_info).some(Boolean) && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-green-700 mb-2">✓ 识别到患者信息（已自动填入档案）</p>
                    <div className="flex flex-wrap gap-1.5">
                      {parsed.patient_info.patient_name && <Chip>{`姓名: ${parsed.patient_info.patient_name}`}</Chip>}
                      {parsed.patient_info.gender && <Chip>{`性别: ${parsed.patient_info.gender}`}</Chip>}
                      {parsed.patient_info.age && <Chip>{`年龄: ${parsed.patient_info.age}岁`}</Chip>}
                      {parsed.patient_info.marital_status && <Chip>{`婚姻: ${parsed.patient_info.marital_status}`}</Chip>}
                      {parsed.patient_info.phone1 && <Chip>{`电话1: ${parsed.patient_info.phone1}`}</Chip>}
                      {parsed.patient_info.phone2 && <Chip>{`电话2: ${parsed.patient_info.phone2}`}</Chip>}
                      {parsed.patient_info.address && <Chip>{`地址: ${parsed.patient_info.address}`}</Chip>}
                    </div>
                  </div>
                )}

                {parsed.notes && (
                  <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-700">⚠️ {parsed.notes}</div>
                )}
              </div>

              {/* 每个日期组 */}
              {editableRecords.map((rec, idx) => (
                <div key={idx} className={`card border ${rec.saved ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        第 {idx + 1} 组
                      </span>
                      {rec.saved && <span className="text-xs text-green-600 font-medium">✓ 已保存</span>}
                    </div>
                    {!rec.saved && (
                      <button onClick={() => removeRecord(idx)}
                        className="text-xs text-red-400 hover:text-red-600">× 删除本组</button>
                    )}
                  </div>

                  {/* 日期 */}
                  <div className="mb-3">
                    <label className="label text-xs">检查日期</label>
                    <input type="date" className="input text-sm py-1.5" value={rec.date}
                      onChange={e => updateRecordDate(idx, e.target.value)}
                      disabled={rec.saved} />
                  </div>

                  {/* 变量表 */}
                  {Object.keys(rec.data).length > 0 ? (
                    <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-gray-50">
                          <tr className="text-xs text-gray-500">
                            <th className="px-3 py-1.5 text-left font-medium w-2/5">变量</th>
                            <th className="px-3 py-1.5 text-left font-medium w-2/5">数值</th>
                            <th className="px-3 py-1.5 text-left font-medium w-1/5">单位</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(rec.data).map(([key, value]) => {
                            const def = VARIABLES[key]
                            const num = parseFloat(value)
                            const abnormal = !isNaN(num) ? checkAbnormal(key, num) : null
                            return (
                              <tr key={key} className={`border-t ${abnormal === 'high' ? 'bg-red-50' : abnormal === 'low' ? 'bg-blue-50' : ''}`}>
                                <td className="px-3 py-1 text-gray-700 text-xs">
                                  {def?.label || key}
                                  {abnormal === 'high' && <span className="text-red-500 font-bold ml-0.5">↑</span>}
                                  {abnormal === 'low' && <span className="text-blue-500 font-bold ml-0.5">↓</span>}
                                </td>
                                <td className="px-3 py-1">
                                  <input value={value}
                                    onChange={e => updateRecordValue(idx, key, e.target.value)}
                                    disabled={rec.saved}
                                    className={`border rounded px-2 py-0.5 text-xs w-full focus:outline-none focus:border-blue-400 disabled:bg-transparent disabled:border-transparent
                                      ${abnormal === 'high' ? 'border-red-200' : abnormal === 'low' ? 'border-blue-200' : 'border-gray-200'}`}
                                  />
                                </td>
                                <td className="px-3 py-1 text-gray-400 text-xs">{def?.unit || ''}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-2">无变量数据</p>
                  )}
                </div>
              ))}

              {/* 添加日期组按钮 */}
              {!allSaved && (
                <button onClick={addRecord}
                  className="w-full border-2 border-dashed border-gray-300 text-gray-400 rounded-lg py-2 text-xs hover:border-blue-300 hover:text-blue-400 transition-colors">
                  + 手动添加一个日期组
                </button>
              )}

              {/* 保存/重置 */}
              <div className="flex gap-2">
                {!allSaved ? (
                  <button className="btn-success flex-1" onClick={saveAllRecords} disabled={saving}>
                    {saving ? '保存中...' : `💾 保存全部（${editableRecords.filter(r => !r.saved).length} 条）`}
                  </button>
                ) : (
                  <div className="flex-1 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center text-sm text-green-700 font-medium">
                    ✓ 全部已保存
                  </div>
                )}
                <button className="btn-secondary" onClick={reset}>重新来</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Spinner({ text }: { text: string }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      {text}
    </span>
  )
}

function Chip({ children }: { children: string }) {
  return <span className="text-xs bg-white text-green-700 px-2 py-0.5 rounded border border-green-200">{children}</span>
}
