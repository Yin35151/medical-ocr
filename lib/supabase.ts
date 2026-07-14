import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Patient {
  id: string
  patient_id: string
  name: string
  gender: string
  age: number | null
  address: string
  marital_status: string
  phone1?: string
  phone2?: string
  created_at: string
}

export interface PatientRecord {
  id: string
  patient_id: string
  record_type: string
  collection_date: string | null
  variables: Record<string, { value: string | number; unit: string }>
  image_url: string | null
  raw_ocr_text: string | null
  created_at: string
}

export interface Project {
  id: string
  name: string
  description: string
  created_at: string
}
