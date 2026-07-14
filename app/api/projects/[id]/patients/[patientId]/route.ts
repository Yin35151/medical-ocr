import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; patientId: string } }) {
  const { error } = await supabase.from('patient_projects')
    .delete().eq('project_id', params.id).eq('patient_id', params.patientId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
