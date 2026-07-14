import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST - 将患者加入项目
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { patient_id } = await req.json()
  if (!patient_id) return NextResponse.json({ error: '缺少patient_id' }, { status: 400 })

  // 确保患者存在（如果不存在则创建空记录）
  await supabase.from('patients')
    .upsert({ patient_id }, { onConflict: 'patient_id', ignoreDuplicates: true })

  const { error } = await supabase.from('patient_projects')
    .upsert({ patient_id, project_id: params.id }, { onConflict: 'patient_id,project_id', ignoreDuplicates: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
