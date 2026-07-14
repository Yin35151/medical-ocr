import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await supabase.from('patient_records')
    .select('*').eq('patient_id', params.id).order('collection_date', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { record_type, collection_date, variables, image_url, raw_ocr_text, patient_name, patient_info, project_id } = body

  // ── 智能建档/更新：只填入原来空白的字段 ────────────────────────
  const { data: existing } = await supabase.from('patients')
    .select('*').eq('patient_id', params.id).single()

  if (!existing) {
    // 新患者，直接创建
    await supabase.from('patients').insert({
      patient_id: params.id,
      name: patient_info?.patient_name || patient_name || '',
      gender: patient_info?.gender || '',
      age: patient_info?.age || null,
      marital_status: patient_info?.marital_status || '',
      address: patient_info?.address || '',
      phone1: patient_info?.phone1 || '',
      phone2: patient_info?.phone2 || '',
    })
  } else {
    // 已存在患者，只更新空白字段
    const updates: Record<string, string | number> = {}
    const pi = patient_info || {}
    if (!existing.name && (pi.patient_name || patient_name)) updates.name = pi.patient_name || patient_name
    if (!existing.gender && pi.gender) updates.gender = pi.gender
    if (!existing.age && pi.age) updates.age = pi.age
    if (!existing.marital_status && pi.marital_status) updates.marital_status = pi.marital_status
    if (!existing.address && pi.address) updates.address = pi.address
    if (!existing.phone1 && pi.phone1) updates.phone1 = pi.phone1
    if (!existing.phone2 && pi.phone2) updates.phone2 = pi.phone2
    if (Object.keys(updates).length > 0) {
      await supabase.from('patients').update(updates).eq('patient_id', params.id)
    }
  }

  // 如果指定了项目，自动加入项目
  if (project_id) {
    await supabase.from('patient_projects')
      .upsert({ patient_id: params.id, project_id }, { onConflict: 'patient_id,project_id', ignoreDuplicates: true })
  }

  const { data, error } = await supabase.from('patient_records')
    .insert({ patient_id: params.id, record_type, collection_date, variables, image_url, raw_ocr_text })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { error } = await supabase.from('patients').update(body).eq('patient_id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await supabase.from('patient_records').delete().eq('patient_id', params.id)
  const { error } = await supabase.from('patients').delete().eq('patient_id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
