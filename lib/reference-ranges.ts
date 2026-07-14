// ================================================================
// 参考范围表 - 用于异常值高亮提示
// [min, max]，超出范围显示为红色（高）或蓝色（低）
// 注意：仅用于提示，不作为诊断依据
// ================================================================

export interface ReferenceRange {
  min?: number
  max?: number
  unit: string
}

export const REFERENCE_RANGES: Record<string, ReferenceRange> = {
  // 血常规
  wbc:       { min: 4.0,   max: 10.0,  unit: '×10⁹/L' },
  neut_pct:  { min: 50,    max: 75,    unit: '%' },
  lymph_pct: { min: 20,    max: 50,    unit: '%' },
  mono_pct:  { min: 3,     max: 10,    unit: '%' },
  eo_pct:    { min: 0.5,   max: 5,     unit: '%' },
  baso_pct:  { min: 0,     max: 1,     unit: '%' },
  rbc:       { min: 3.5,   max: 5.5,   unit: '×10¹²/L' },
  hgb:       { min: 110,   max: 175,   unit: 'g/L' },
  hct:       { min: 35,    max: 52,    unit: '%' },
  mcv:       { min: 80,    max: 100,   unit: 'fL' },
  mch:       { min: 27,    max: 34,    unit: 'pg' },
  mchc:      { min: 316,   max: 354,   unit: 'g/L' },
  rdw:       { min: 11.5,  max: 14.5,  unit: '%' },
  plt:       { min: 100,   max: 300,   unit: '×10⁹/L' },
  mpv:       { min: 7,     max: 11,    unit: 'fL' },
  // 肝功能
  pa:        { min: 200,   max: 400,   unit: 'mg/L' },
  tp:        { min: 60,    max: 83,    unit: 'g/L' },
  alb:       { min: 35,    max: 52,    unit: 'g/L' },
  alt:       { min: 7,     max: 40,    unit: 'IU/L' },
  ast:       { min: 13,    max: 35,    unit: 'IU/L' },
  tbil:      { min: 5,     max: 21,    unit: 'μmol/L' },
  dbil:      { min: 0,     max: 7,     unit: 'μmol/L' },
  tba:       { min: 0,     max: 10,    unit: 'μmol/L' },
  alp:       { min: 45,    max: 125,   unit: 'IU/L' },
  ggt:       { min: 10,    max: 60,    unit: 'IU/L' },
  // 肾功能
  creatinine:{ min: 45,    max: 104,   unit: 'μmol/L' },
  bun:       { min: 2.9,   max: 8.2,   unit: 'mmol/L' },
  uric_acid: { min: 155,   max: 428,   unit: 'μmol/L' },
  egfr:      { min: 60,    max: 999,   unit: 'mL/min/1.73m²' },
  // 电解质
  k:         { min: 3.5,   max: 5.5,   unit: 'mmol/L' },
  na:        { min: 135,   max: 145,   unit: 'mmol/L' },
  cl:        { min: 96,    max: 106,   unit: 'mmol/L' },
  co2:       { min: 22,    max: 29,    unit: 'mmol/L' },
  calcium:   { min: 2.1,   max: 2.7,   unit: 'mmol/L' },
  phosphorus:{ min: 0.81,  max: 1.45,  unit: 'mmol/L' },
  // 血糖代谢
  glucose:   { min: 3.9,   max: 6.1,   unit: 'mmol/L' },
  hba1c:     { min: 4.0,   max: 6.5,   unit: '%' },
  homocysteine:{ min: 5,   max: 15,    unit: 'μmol/L' },
  // 血脂
  chol:      { min: 0,     max: 5.2,   unit: 'mmol/L' },
  tg:        { min: 0.56,  max: 1.7,   unit: 'mmol/L' },
  ldl:       { min: 0,     max: 3.37,  unit: 'mmol/L' },
  hdl:       { min: 1.0,   max: 99,    unit: 'mmol/L' },
  // 炎症
  crp:       { min: 0,     max: 10,    unit: 'mg/L' },
  hscrp:     { min: 0,     max: 3,     unit: 'mg/L' },
  // 心脏
  nt_probnp: { min: 0,     max: 125,   unit: 'pg/mL' },
  bnp:       { min: 0,     max: 100,   unit: 'pg/mL' },
  ck:        { min: 22,    max: 200,   unit: 'IU/L' },
  ldh:       { min: 100,   max: 245,   unit: 'IU/L' },
  tsh:       { min: 0.27,  max: 4.2,   unit: 'uIU/mL' },
  // 超声心动图
  ef:        { min: 55,    max: 80,    unit: '%' },
  ivs:       { min: 6,     max: 11,    unit: 'mm' },
  lvedd:     { min: 35,    max: 56,    unit: 'mm' },
  lvpw:      { min: 6,     max: 11,    unit: 'mm' },
  // 体格检查
  sbp:       { min: 90,    max: 140,   unit: 'mmHg' },
  dbp:       { min: 60,    max: 90,    unit: 'mmHg' },
  heart_rate:{ min: 60,    max: 100,   unit: '次/分' },
  bmi:       { min: 18.5,  max: 28,    unit: 'kg/m²' },
}

export function checkAbnormal(key: string, value: number): 'high' | 'low' | 'normal' | null {
  const range = REFERENCE_RANGES[key]
  if (!range) return null
  if (range.max !== undefined && value > range.max) return 'high'
  if (range.min !== undefined && value < range.min) return 'low'
  return 'normal'
}
