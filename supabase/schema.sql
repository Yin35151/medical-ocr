-- Medical OCR database schema
-- Run this file in the Supabase SQL Editor.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS patients (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id      TEXT UNIQUE NOT NULL,
  name            TEXT,
  gender          TEXT CHECK (gender IN ('男', '女', '')),
  age             INTEGER,
  address         TEXT,
  marital_status  TEXT,
  phone1          TEXT,
  phone2          TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_records (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id      TEXT NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  record_type     TEXT NOT NULL,
  collection_date DATE,
  variables       JSONB NOT NULL DEFAULT '{}',
  image_url       TEXT,
  raw_ocr_text    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_projects (
  patient_id  TEXT NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (patient_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_patient_records_patient_id ON patient_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_records_type ON patient_records(record_type);
CREATE INDEX IF NOT EXISTS idx_patient_records_date ON patient_records(collection_date);
CREATE INDEX IF NOT EXISTS idx_patient_projects_project ON patient_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_patient_projects_patient ON patient_projects(patient_id);

CREATE OR REPLACE VIEW v_patient_summary AS
SELECT
  p.patient_id,
  p.name,
  p.gender,
  p.age,
  COUNT(r.id) AS record_count,
  MIN(r.collection_date) AS first_record,
  MAX(r.collection_date) AS last_record
FROM patients p
LEFT JOIN patient_records r ON p.patient_id = r.patient_id
GROUP BY p.patient_id, p.name, p.gender, p.age;

-- Security defaults:
-- 1. RLS is enabled on every table containing project or patient data.
-- 2. No anon/authenticated policies are created here, so browser-side Supabase keys
--    cannot directly read or write these tables.
-- 3. The Next.js server API should use SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS
--    and must never be exposed to the browser or committed to GitHub.

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_projects ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE patients FROM anon, authenticated;
REVOKE ALL ON TABLE patient_records FROM anon, authenticated;
REVOKE ALL ON TABLE projects FROM anon, authenticated;
REVOKE ALL ON TABLE patient_projects FROM anon, authenticated;
REVOKE ALL ON TABLE v_patient_summary FROM anon, authenticated;
