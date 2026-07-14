import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - 获取项目信息及其所有患者
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const [{ data: project }, { data: relations }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', params.id).single(),
    supabase.from('patient_projects').select('patient_id').eq('project_id', params.id),
  ])
  if (!project) return NextResponse.json({ error: '项目不存在' }, { status: 404 })

  const patientIds = (relations || []).map(r => r.patient_id)
  let patients: object[] = []
  if (patientIds.length > 0) {
    const { data } = await supabase.from('patients').select('*').in('patient_id', patientIds)
    patients = data || []
  }
  return NextResponse.json({ project, patients })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { error } = await supabase.from('projects').update(body).eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await supabase.from('patient_projects').delete().eq('project_id', params.id)
  const { error } = await supabase.from('projects').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
