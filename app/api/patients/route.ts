import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/patients - 获取所有患者
export async function GET() {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/patients - 创建新患者
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { patient_id, name, gender, age, address, marital_status } = body

  if (!patient_id) {
    return NextResponse.json({ error: '病案号不能为空' }, { status: 400 })
  }

  // 检查是否已存在
  const { data: existing } = await supabase
    .from('patients')
    .select('id')
    .eq('patient_id', patient_id)
    .single()

  if (existing) {
    return NextResponse.json({ error: '该病案号已存在' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('patients')
    .insert({ patient_id, name, gender, age, address, marital_status })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
