import * as XLSX from 'xlsx'
import { VARIABLES } from './variables'
import type { Patient, PatientRecord } from './supabase'

// ─── 导出为 Excel ─────────────────────────────────────────────────
// 生成宽格式表：每个患者一行，变量名为列头
// 如果同一患者有多次采集，则附加采集日期后缀

export function exportToExcel(patients: Patient[], records: PatientRecord[]) {
  // 1. 构建每个患者的数据行
  const rows: Record<string, string | number | null>[] = []

  for (const patient of patients) {
    const row: Record<string, string | number | null> = {}

    // 基础信息（不带日期）
    row['病案号'] = patient.patient_id
    row['姓名'] = patient.name
    row['性别'] = patient.gender
    row['年龄'] = patient.age
    row['地址'] = patient.address
    row['婚姻状况'] = patient.marital_status

    // 该患者的所有记录
    const patientRecords = records.filter(r => r.patient_id === patient.patient_id)

    for (const record of patientRecords) {
      const dateStr = record.collection_date
        ? `_${record.collection_date}`
        : `_${record.created_at.split('T')[0]}`

      for (const [varKey, varData] of Object.entries(record.variables)) {
        const def = VARIABLES[varKey]
        if (!def) continue

        const colName = def.needsDate
          ? `${def.label}${dateStr}`
          : def.label

        // 单位列
        const unitColName = def.needsDate
          ? `${def.label}_单位${dateStr}`
          : `${def.label}_单位`

        row[colName] = varData.value
        if (def.unit) row[unitColName] = def.unit
      }
    }

    rows.push(row)
  }

  // 2. 创建工作簿
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)

  // 调整列宽
  const colWidths = Object.keys(rows[0] || {}).map(key => ({
    wch: Math.max(key.length * 1.5, 10),
  }))
  ws['!cols'] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, '患者队列数据')

  // 3. 导出
  XLSX.writeFile(wb, `患者队列数据_${new Date().toISOString().split('T')[0]}.xlsx`)
}

// ─── 导出单个患者的详细数据（长格式，含日期） ────────────────────
export function exportPatientDetail(patient: Patient, records: PatientRecord[]) {
  const wb = XLSX.utils.book_new()

  // 按记录类型分sheet
  const typeLabels: Record<string, string> = {
    medical_history: '病史',
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

  const grouped = new Map<string, PatientRecord[]>()
  for (const record of records) {
    if (!grouped.has(record.record_type)) {
      grouped.set(record.record_type, [])
    }
    grouped.get(record.record_type)!.push(record)
  }

  for (const [type, typeRecords] of grouped) {
    const rows = typeRecords.map(r => {
      const row: Record<string, string | number | null> = {
        '采集日期': r.collection_date || '',
      }
      for (const [varKey, varData] of Object.entries(r.variables)) {
        const def = VARIABLES[varKey]
        const label = def?.label || varKey
        row[label] = varData.value
        if (def?.unit) row[`${label}_单位`] = def.unit
      }
      return row
    })

    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, typeLabels[type] || type)
  }

  XLSX.writeFile(wb, `${patient.name}_${patient.patient_id}_${new Date().toISOString().split('T')[0]}.xlsx`)
}
