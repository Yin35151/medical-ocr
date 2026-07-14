import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  // 获取所有项目，并附带患者数量
  const { data: projects, error } = await supabase
    .from('projects').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 统计每个项目的患者数
  const counts = await Promise.all(
    (projects || []).map(async p => {
      const { count } = await supabase
        .from('patient_projects').select('*', { count: 'exact', head: true })
        .eq('project_id', p.id)
      return { project_id: p.id, count: count || 0 }
    })
  )
  const countMap = Object.fromEntries(counts.map(c => [c.project_id, c.count]))
  const result = (projects || []).map(p => ({ ...p, patient_count: countMap[p.id] || 0 }))
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const { name, description } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: '项目名称不能为空' }, { status: 400 })
  const { data, error } = await supabase
    .from('projects').insert({ name: name.trim(), description }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
