// ================================================================
// 变量定义表
// 标签规则：中文名≤4字用中文，>4字用英文缩写
// needsDate: true = 该变量采集时需要带日期
// ================================================================

export interface VariableDef {
  label: string                         // 显示标签（短名）
  fullname: string                      // 完整中文名
  unit: string
  needsDate: boolean
  category: string
  type: 'number' | 'text' | 'yesno'
}

export const VARIABLES: Record<string, VariableDef> = {

  // ── 基础信息（不带日期）──────────────────────────────────────────
  patient_id:     { label:'病案号',   fullname:'病案号',       unit:'',      needsDate:false, category:'基础信息', type:'text' },
  name:           { label:'姓名',     fullname:'姓名',         unit:'',      needsDate:false, category:'基础信息', type:'text' },
  gender:         { label:'性别',     fullname:'性别',         unit:'',      needsDate:false, category:'基础信息', type:'text' },
  age:            { label:'年龄',     fullname:'年龄',         unit:'岁',    needsDate:false, category:'基础信息', type:'number' },
  address:        { label:'地址',     fullname:'地址',         unit:'',      needsDate:false, category:'基础信息', type:'text' },
  marital_status: { label:'婚姻',     fullname:'婚姻状况',     unit:'',      needsDate:false, category:'基础信息', type:'text' },
  phone1:         { label:'电话1',    fullname:'联系电话1',    unit:'',      needsDate:false, category:'基础信息', type:'text' },
  phone2:         { label:'电话2',    fullname:'联系电话2',    unit:'',      needsDate:false, category:'基础信息', type:'text' },

  // ── 既往史（带日期）──────────────────────────────────────────────
  hypertension:           { label:'高血压',   fullname:'高血压',         unit:'是/否', needsDate:true, category:'既往史', type:'yesno' },
  hypertension_duration:  { label:'高血压年', fullname:'高血压时长',     unit:'年',    needsDate:true, category:'既往史', type:'number' },
  diabetes:               { label:'糖尿病',   fullname:'糖尿病',         unit:'是/否', needsDate:true, category:'既往史', type:'yesno' },
  diabetes_duration:      { label:'糖尿病年', fullname:'糖尿病时长',     unit:'年',    needsDate:true, category:'既往史', type:'number' },
  smoking:                { label:'吸烟',     fullname:'吸烟史',         unit:'是/否', needsDate:true, category:'既往史', type:'yesno' },
  smoking_duration:       { label:'吸烟年',   fullname:'吸烟史时长',     unit:'年',    needsDate:true, category:'既往史', type:'number' },
  alcohol:                { label:'饮酒',     fullname:'饮酒史',         unit:'是/否', needsDate:true, category:'既往史', type:'yesno' },
  alcohol_duration:       { label:'饮酒年',   fullname:'饮酒史时长',     unit:'年',    needsDate:true, category:'既往史', type:'number' },
  prior_pci:              { label:'既往PCI',  fullname:'既往PCI',        unit:'是/否', needsDate:true, category:'既往史', type:'yesno' },
  cerebral_hemorrhage:    { label:'脑出血',   fullname:'脑出血',         unit:'是/否', needsDate:true, category:'既往史', type:'yesno' },
  cerebral_infarction:    { label:'脑梗死',   fullname:'脑梗死',         unit:'是/否', needsDate:true, category:'既往史', type:'yesno' },
  chronic_kidney_disease: { label:'慢性肾衰', fullname:'慢性肾衰史',     unit:'是/否', needsDate:true, category:'既往史', type:'yesno' },
  digestive_disease:      { label:'消化病史', fullname:'消化系统疾病史', unit:'是/否', needsDate:true, category:'既往史', type:'yesno' },

  // ── 体格检查（带日期）────────────────────────────────────────────
  height:     { label:'身高',  fullname:'身高',  unit:'cm',    needsDate:true, category:'体格检查', type:'number' },
  weight:     { label:'体重',  fullname:'体重',  unit:'kg',    needsDate:true, category:'体格检查', type:'number' },
  bmi:        { label:'BMI',   fullname:'BMI',   unit:'kg/m²', needsDate:true, category:'体格检查', type:'number' },
  heart_rate: { label:'心率',  fullname:'心率',  unit:'次/分', needsDate:true, category:'体格检查', type:'number' },
  sbp:        { label:'收缩压',fullname:'收缩压',unit:'mmHg',  needsDate:true, category:'体格检查', type:'number' },
  dbp:        { label:'舒张压',fullname:'舒张压',unit:'mmHg',  needsDate:true, category:'体格检查', type:'number' },

  // ── 血常规（带日期）──────────────────────────────────────────────
  wbc:       { label:'WBC',    fullname:'白细胞总数',          unit:'×10⁹/L',  needsDate:true, category:'血常规', type:'number' },
  neut_pct:  { label:'NEUT%',  fullname:'中性粒细胞百分率',    unit:'%',        needsDate:true, category:'血常规', type:'number' },
  neut_abs:  { label:'NEUT#',  fullname:'中性粒细胞绝对值',    unit:'×10⁹/L',  needsDate:true, category:'血常规', type:'number' },
  lymph_pct: { label:'LYMPH%', fullname:'淋巴细胞百分率',      unit:'%',        needsDate:true, category:'血常规', type:'number' },
  lymph_abs: { label:'LYMPH#', fullname:'淋巴细胞绝对值',      unit:'×10⁹/L',  needsDate:true, category:'血常规', type:'number' },
  mono_pct:  { label:'MONO%',  fullname:'单核细胞百分率',      unit:'%',        needsDate:true, category:'血常规', type:'number' },
  mono_abs:  { label:'MONO#',  fullname:'单核细胞绝对值',      unit:'×10⁹/L',  needsDate:true, category:'血常规', type:'number' },
  eo_pct:    { label:'EO%',    fullname:'嗜酸粒细胞百分率',    unit:'%',        needsDate:true, category:'血常规', type:'number' },
  eo_abs:    { label:'EO#',    fullname:'嗜酸粒细胞绝对值',    unit:'×10⁹/L',  needsDate:true, category:'血常规', type:'number' },
  baso_pct:  { label:'BASO%',  fullname:'嗜碱粒细胞百分率',    unit:'%',        needsDate:true, category:'血常规', type:'number' },
  baso_abs:  { label:'BASO#',  fullname:'嗜碱粒细胞绝对值',    unit:'×10⁹/L',  needsDate:true, category:'血常规', type:'number' },
  rbc:       { label:'RBC',    fullname:'红细胞总数',          unit:'×10¹²/L', needsDate:true, category:'血常规', type:'number' },
  hgb:       { label:'HGB',    fullname:'血红蛋白浓度',        unit:'g/L',      needsDate:true, category:'血常规', type:'number' },
  hct:       { label:'HCT',    fullname:'红细胞比积',          unit:'%',        needsDate:true, category:'血常规', type:'number' },
  mcv:       { label:'MCV',    fullname:'平均红细胞体积',      unit:'fL',       needsDate:true, category:'血常规', type:'number' },
  mch:       { label:'MCH',    fullname:'平均红细胞血红蛋白',  unit:'pg',       needsDate:true, category:'血常规', type:'number' },
  mchc:      { label:'MCHC',   fullname:'平均RBC血红蛋白浓度', unit:'g/L',      needsDate:true, category:'血常规', type:'number' },
  rdw_sd:    { label:'RDW-SD', fullname:'红细胞分布宽度标准差',unit:'fL',       needsDate:true, category:'血常规', type:'number' },
  rdw:       { label:'RDW',    fullname:'红细胞体积分布宽度',  unit:'%',        needsDate:true, category:'血常规', type:'number' },
  plt:       { label:'PLT',    fullname:'血小板数',            unit:'×10⁹/L',  needsDate:true, category:'血常规', type:'number' },
  pdw:       { label:'PDW',    fullname:'血小板体积分布宽度',  unit:'fL',       needsDate:true, category:'血常规', type:'number' },
  mpv:       { label:'MPV',    fullname:'平均血小板体积',      unit:'fL',       needsDate:true, category:'血常规', type:'number' },
  plcr:      { label:'P-LCR',  fullname:'大血小板比率',        unit:'%',        needsDate:true, category:'血常规', type:'number' },
  plt_pct:   { label:'PCT-PLT',fullname:'血小板压积',          unit:'%',        needsDate:true, category:'血常规', type:'number' },

  // ── 肝功能（带日期）──────────────────────────────────────────────
  pa:   { label:'PA',   fullname:'前白蛋白',         unit:'mg/L',   needsDate:true, category:'肝功能', type:'number' },
  tp:   { label:'TP',   fullname:'总蛋白',           unit:'g/L',    needsDate:true, category:'肝功能', type:'number' },
  alb:  { label:'ALB',  fullname:'白蛋白',           unit:'g/L',    needsDate:true, category:'肝功能', type:'number' },
  alt:  { label:'ALT',  fullname:'丙氨酸氨基转移酶', unit:'IU/L',   needsDate:true, category:'肝功能', type:'number' },
  ast:  { label:'AST',  fullname:'天门冬氨酸氨基转移酶', unit:'IU/L', needsDate:true, category:'肝功能', type:'number' },
  tbil: { label:'TBil', fullname:'总胆红素',         unit:'μmol/L', needsDate:true, category:'肝功能', type:'number' },
  dbil: { label:'DBil', fullname:'直接胆红素',       unit:'μmol/L', needsDate:true, category:'肝功能', type:'number' },
  tba:  { label:'TBA',  fullname:'总胆汁酸',         unit:'μmol/L', needsDate:true, category:'肝功能', type:'number' },
  alp:  { label:'ALP',  fullname:'碱性磷酸酶',       unit:'IU/L',   needsDate:true, category:'肝功能', type:'number' },
  ggt:  { label:'GGT',  fullname:'谷氨酰转肽酶',     unit:'IU/L',   needsDate:true, category:'肝功能', type:'number' },
  amylase: { label:'AMY', fullname:'淀粉酶',         unit:'U/L',    needsDate:true, category:'肝功能', type:'number' },

  // ── 肾功能（带日期）──────────────────────────────────────────────
  creatinine: { label:'CREA',  fullname:'血肌酐',                unit:'μmol/L',       needsDate:true, category:'肾功能', type:'number' },
  egfr:       { label:'eGFR',  fullname:'肾小球滤过率',          unit:'mL/min/1.73m²',needsDate:true, category:'肾功能', type:'number' },
  bun:        { label:'BUN',   fullname:'尿素氮',                unit:'mmol/L',       needsDate:true, category:'肾功能', type:'number' },
  uric_acid:  { label:'URIC',  fullname:'尿酸',                  unit:'μmol/L',       needsDate:true, category:'肾功能', type:'number' },
  cystatin_c: { label:'CYSC',  fullname:'血清胱抑素C',           unit:'mg/L',         needsDate:true, category:'肾功能', type:'number' },
  pth:        { label:'PTH',   fullname:'全段甲状旁腺素',        unit:'pg/mL',        needsDate:true, category:'肾功能', type:'number' },

  // ── 电解质（带日期）──────────────────────────────────────────────
  k:           { label:'钾',   fullname:'钾',    unit:'mmol/L', needsDate:true, category:'电解质', type:'number' },
  na:          { label:'钠',   fullname:'钠',    unit:'mmol/L', needsDate:true, category:'电解质', type:'number' },
  cl:          { label:'氯',   fullname:'氯',    unit:'mmol/L', needsDate:true, category:'电解质', type:'number' },
  co2:         { label:'CO₂',  fullname:'二氧化碳',unit:'mmol/L',needsDate:true, category:'电解质', type:'number' },
  calcium:     { label:'钙',   fullname:'钙',    unit:'mmol/L', needsDate:true, category:'电解质', type:'number' },
  phosphorus:  { label:'磷',   fullname:'磷',    unit:'mmol/L', needsDate:true, category:'电解质', type:'number' },

  // ── 血糖代谢（带日期）────────────────────────────────────────────
  glucose:      { label:'GLU',   fullname:'葡萄糖',     unit:'mmol/L', needsDate:true, category:'血糖代谢', type:'number' },
  hba1c:        { label:'HbA1C', fullname:'糖化血红蛋白',unit:'%',      needsDate:true, category:'血糖代谢', type:'number' },
  homocysteine: { label:'HCY',   fullname:'同型半胱氨酸',unit:'μmol/L', needsDate:true, category:'血糖代谢', type:'number' },
  ffa:          { label:'FFA',   fullname:'游离脂肪酸',  unit:'mmol/L', needsDate:true, category:'血糖代谢', type:'number' },

  // ── 血脂（带日期）────────────────────────────────────────────────
  chol:    { label:'CHOL',   fullname:'总胆固醇',            unit:'mmol/L', needsDate:true, category:'血脂', type:'number' },
  tg:      { label:'TG',     fullname:'甘油三酯',            unit:'mmol/L', needsDate:true, category:'血脂', type:'number' },
  ldl:     { label:'LDL-C',  fullname:'低密度脂蛋白胆固醇',  unit:'mmol/L', needsDate:true, category:'血脂', type:'number' },
  hdl:     { label:'HDL-C',  fullname:'高密度脂蛋白胆固醇',  unit:'mmol/L', needsDate:true, category:'血脂', type:'number' },
  non_hdl: { label:'NonHDL', fullname:'非高密度脂蛋白胆固醇',unit:'mmol/L', needsDate:true, category:'血脂', type:'number' },
  sdldl:   { label:'SdLDL',  fullname:'小密低密度脂蛋白',    unit:'mmol/L', needsDate:true, category:'血脂', type:'number' },
  apoa1:   { label:'ApoA1',  fullname:'载脂蛋白A1',          unit:'g/L',    needsDate:true, category:'血脂', type:'number' },
  apob:    { label:'ApoB',   fullname:'载脂蛋白B',           unit:'g/L',    needsDate:true, category:'血脂', type:'number' },
  lpa:     { label:'Lp(a)',  fullname:'脂蛋白(a)',           unit:'mg/L',   needsDate:true, category:'血脂', type:'number' },

  // ── 炎症指标（带日期）────────────────────────────────────────────
  crp:   { label:'CRP',   fullname:'C反应蛋白',    unit:'mg/L', needsDate:true, category:'炎症指标', type:'number' },
  hscrp: { label:'HsCRP', fullname:'超敏C反应蛋白',unit:'mg/L', needsDate:true, category:'炎症指标', type:'number' },

  // ── 心脏标志物（带日期）──────────────────────────────────────────
  nt_probnp:     { label:'NT-proBNP', fullname:'N末端B型利钠肽原', unit:'pg/mL', needsDate:true, category:'心脏标志物', type:'number' },
  bnp:           { label:'BNP',       fullname:'B型利钠肽',       unit:'pg/mL', needsDate:true, category:'心脏标志物', type:'number' },
  ck:            { label:'CK',        fullname:'肌酸激酶',        unit:'IU/L',  needsDate:true, category:'心脏标志物', type:'number' },
  ckmb:          { label:'CKMB',      fullname:'肌酸激酶同工酶',  unit:'ng/mL', needsDate:true, category:'心脏标志物', type:'number' },
  ldh:           { label:'LDH',       fullname:'乳酸脱氢酶',      unit:'IU/L',  needsDate:true, category:'心脏标志物', type:'number' },
  troponin_i:    { label:'TnI',       fullname:'肌钙蛋白I',       unit:'ng/mL', needsDate:true, category:'心脏标志物', type:'number' },
  hs_troponin_i: { label:'Hs-TnI',   fullname:'高敏肌钙蛋白I',   unit:'pg/mL', needsDate:true, category:'心脏标志物', type:'number' },
  hs_ctnt:       { label:'Hs-cTnT',  fullname:'高敏肌钙蛋白T',   unit:'ng/mL', needsDate:true, category:'心脏标志物', type:'number' },
  pct:           { label:'PCT',       fullname:'降钙素原',        unit:'ng/mL', needsDate:true, category:'心脏标志物', type:'number' },
  plt_aa:        { label:'PLT-AA',    fullname:'血小板聚集率(AA)',unit:'%',     needsDate:true, category:'心脏标志物', type:'number' },
  plt_adp:       { label:'PLT-ADP',   fullname:'血小板聚集率(ADP)',unit:'%',    needsDate:true, category:'心脏标志物', type:'number' },
  tsh:           { label:'TSH',       fullname:'促甲状腺素',      unit:'uIU/mL',needsDate:true, category:'心脏标志物', type:'number' },

  // ── 尿液类（带日期）──────────────────────────────────────────────
  urine_crea:    { label:'尿CREA',  fullname:'尿肌酐',          unit:'μmol/L', needsDate:true, category:'尿常规', type:'number' },
  malb:          { label:'MALB',    fullname:'尿微量白蛋白',    unit:'mg/L',   needsDate:true, category:'尿常规', type:'number' },
  uacr:          { label:'UACR',    fullname:'尿微量白蛋白/肌酐',unit:'mg/g',  needsDate:true, category:'尿常规', type:'number' },
  urine_sg:      { label:'尿比重',  fullname:'尿比重',          unit:'',       needsDate:true, category:'尿常规', type:'number' },
  urine_ph:      { label:'尿pH',    fullname:'尿pH',            unit:'',       needsDate:true, category:'尿常规', type:'number' },
  urine_wbc:     { label:'尿WBC',   fullname:'尿白细胞(高倍)',  unit:'/HPF',   needsDate:true, category:'尿常规', type:'number' },
  urine_rbc:     { label:'尿RBC',   fullname:'尿红细胞(高倍)',  unit:'/HPF',   needsDate:true, category:'尿常规', type:'number' },
  urine_protein: { label:'尿蛋白',  fullname:'尿蛋白',          unit:'',       needsDate:true, category:'尿常规', type:'text' },

  // ── 超声心动图（带日期）──────────────────────────────────────────
  aortic_valve_d: { label:'主动脉瓣', fullname:'主动脉瓣环内径', unit:'mm', needsDate:true, category:'超声心动图', type:'number' },
  sinus_d:        { label:'窦部径',   fullname:'窦部前后径',     unit:'mm', needsDate:true, category:'超声心动图', type:'number' },
  ascending_ao:   { label:'升主动脉', fullname:'升主动脉径',     unit:'mm', needsDate:true, category:'超声心动图', type:'number' },
  ef:             { label:'EF',        fullname:'左室射血分数',   unit:'%',  needsDate:true, category:'超声心动图', type:'number' },
  ivs:            { label:'IVS',       fullname:'室间隔厚度',     unit:'mm', needsDate:true, category:'超声心动图', type:'number' },
  lvedd:          { label:'LVEDD',     fullname:'左室舒张末径',   unit:'mm', needsDate:true, category:'超声心动图', type:'number' },
  lvedv:          { label:'LVEDV',     fullname:'左室舒末体积',   unit:'mL', needsDate:true, category:'超声心动图', type:'number' },
  lvesd:          { label:'LVESD',     fullname:'左室收缩末径',   unit:'mm', needsDate:true, category:'超声心动图', type:'number' },
  lvesv:          { label:'LVESV',     fullname:'左室收末体积',   unit:'mL', needsDate:true, category:'超声心动图', type:'number' },
  lvpw:           { label:'LVPW',      fullname:'左室后壁厚度',   unit:'mm', needsDate:true, category:'超声心动图', type:'number' },
  sv:             { label:'SV',         fullname:'左室每搏量',    unit:'mL', needsDate:true, category:'超声心动图', type:'number' },
  la_ap:          { label:'左房径',    fullname:'左房前后径',     unit:'mm', needsDate:true, category:'超声心动图', type:'number' },
  la_volume:      { label:'左房容积',  fullname:'左房容积',       unit:'mL', needsDate:true, category:'超声心动图', type:'number' },
  ra_lr:          { label:'右房左右',  fullname:'右房左右径',     unit:'mm', needsDate:true, category:'超声心动图', type:'number' },
  ra_ap:          { label:'右房前后',  fullname:'右房前后径',     unit:'mm', needsDate:true, category:'超声心动图', type:'number' },
  rv_ap:          { label:'右室前后',  fullname:'右心室前后径',   unit:'mm', needsDate:true, category:'超声心动图', type:'number' },

  // ── 出院信息（带日期）────────────────────────────────────────────
  discharge_diagnosis:  { label:'出院诊断', fullname:'出院诊断', unit:'', needsDate:true, category:'出院信息', type:'text' },
  discharge_medication: { label:'出院带药', fullname:'出院带药', unit:'', needsDate:true, category:'出院信息', type:'text' },
}

// ── 别名映射（供AI Prompt使用）───────────────────────────────────
export const VARIABLE_ALIASES: Record<string, string> = {
  // 血常规
  '白细胞':'wbc','WBC':'wbc','白细胞总数':'wbc',
  '中性粒细胞%':'neut_pct','NEUT%':'neut_pct','中性粒百分':'neut_pct',
  '中性粒细胞#':'neut_abs','NEUT#':'neut_abs','中性粒细胞绝对值':'neut_abs','中性粒绝对':'neut_abs',
  '淋巴细胞%':'lymph_pct','LYMPH%':'lymph_pct',
  '淋巴细胞#':'lymph_abs','LYMPH#':'lymph_abs','淋巴细胞绝对值':'lymph_abs',
  '单核细胞%':'mono_pct','MONO%':'mono_pct',
  '单核细胞#':'mono_abs','MONO#':'mono_abs',
  '嗜酸粒细胞%':'eo_pct','EO%':'eo_pct',
  '嗜酸粒细胞#':'eo_abs','EO#':'eo_abs',
  '嗜碱粒细胞%':'baso_pct','BASO%':'baso_pct',
  '嗜碱粒细胞#':'baso_abs','BASO#':'baso_abs',
  '红细胞':'rbc','RBC':'rbc',
  '血红蛋白':'hgb','HGB':'hgb','HB':'hgb','Hb':'hgb',
  '红细胞比容':'hct','HCT':'hct','红细胞压积':'hct','红细胞比积':'hct',
  'MCV':'mcv','平均红细胞体积':'mcv',
  'MCH':'mch',
  'MCHC':'mchc',
  'RDW-SD':'rdw_sd','RDWSD':'rdw_sd',
  'RDW':'rdw','红细胞分布宽度':'rdw',
  '血小板':'plt','PLT':'plt',
  'PDW':'pdw',
  'MPV':'mpv','平均血小板体积':'mpv',
  'P-LCR':'plcr','PLCR':'plcr','大血小板比率':'plcr',
  'PCT-PLT':'plt_pct','血小板压积':'plt_pct',
  // 肝功能
  'PA':'pa','前白蛋白':'pa',
  'TP':'tp','总蛋白':'tp',
  'ALB':'alb','白蛋白':'alb','Alb':'alb',
  'ALT':'alt','谷丙转氨酶':'alt','SGPT':'alt',
  'AST':'ast','谷草转氨酶':'ast','SGOT':'ast',
  'TBIL':'tbil','TBil':'tbil','总胆红素':'tbil',
  'DBIL':'dbil','DBil':'dbil','直接胆红素':'dbil',
  'TBA':'tba','总胆汁酸':'tba',
  'ALP':'alp','碱性磷酸酶':'alp',
  'GGT':'ggt','谷氨酰转肽酶':'ggt','γ-GT':'ggt',
  'AMY':'amylase','淀粉酶':'amylase',
  // 肾功能
  'CREA':'creatinine','Cr':'creatinine','SCr':'creatinine','肌酐':'creatinine','血肌酐':'creatinine',
  'eGFR':'egfr','EGFR':'egfr','肾小球滤过率':'egfr','GFR':'egfr','eGFR(CKD-EPI 2009)':'egfr',
  'BUN':'bun','尿素氮':'bun','尿素':'bun','UREA':'bun',
  'URIC':'uric_acid','UA':'uric_acid','SUA':'uric_acid','尿酸':'uric_acid',
  'CYSC':'cystatin_c','Cys-C':'cystatin_c','胱抑素':'cystatin_c',
  'PTH':'pth','iPTH':'pth','甲状旁腺素':'pth',
  // 电解质
  '钾':'k','K':'k','K+':'k',
  '钠':'na','Na':'na','Na+':'na',
  '氯':'cl','Cl':'cl','Cl-':'cl',
  'CO2':'co2','CO₂':'co2','二氧化碳':'co2',
  '钙':'calcium','Ca':'calcium','Ca2+':'calcium',
  '磷':'phosphorus','P':'phosphorus',
  // 血糖代谢
  'GLU':'glucose','Glu':'glucose','血糖':'glucose','葡萄糖':'glucose',
  'HbA1c':'hba1c','HbAlC':'hba1c','GHb':'hba1c','糖化血红蛋白':'hba1c',
  'HCY':'homocysteine','Hcy':'homocysteine','同型半胱氨酸':'homocysteine',
  'FFA':'ffa','NEFA':'ffa','游离脂肪酸':'ffa',
  // 血脂
  'CHOL':'chol','TC':'chol','总胆固醇':'chol',
  'TG':'tg','甘油三酯':'tg','TRIG':'tg',
  'LDL-C':'ldl','LDL':'ldl','低密度脂蛋白':'ldl',
  'HDL-C':'hdl','HDL':'hdl','高密度脂蛋白':'hdl',
  'NonHDL':'non_hdl','non-HDL':'non_hdl','非高密度':'non_hdl',
  'SdLDL':'sdldl','sdLDL':'sdldl','小密低密度':'sdldl',
  'ApoA1':'apoa1','apoA1':'apoa1','载脂蛋白A1':'apoa1',
  'ApoB':'apob','apoB':'apob','载脂蛋白B':'apob',
  'Lp(a)':'lpa','LP(a)':'lpa','脂蛋白a':'lpa','脂蛋白(a)':'lpa',
  // 炎症
  'CRP':'crp','C反应蛋白':'crp',
  'HsCRP':'hscrp','hs-CRP':'hscrp','hsCRP':'hscrp','超敏C反应蛋白':'hscrp',
  // 心脏标志物
  'NT-proBNP':'nt_probnp','NT proBNP':'nt_probnp','NTproBNP':'nt_probnp','NT-ProBNP':'nt_probnp',
  'BNP':'bnp','B型利钠肽':'bnp',
  'CK':'ck','肌酸激酶':'ck',
  'CKMB':'ckmb','CK-MB':'ckmb','CK-MB-Mass':'ckmb','肌酸激酶同工酶':'ckmb',
  'LDH':'ldh','乳酸脱氢酶':'ldh',
  'TnI':'troponin_i','肌钙蛋白I':'troponin_i',
  'Hs-TnI':'hs_troponin_i','高敏肌钙蛋白I':'hs_troponin_i',
  'Hs-cTnT':'hs_ctnt','hsTnT':'hs_ctnt','高敏肌钙蛋白T':'hs_ctnt',
  'PCT':'pct','降钙素原':'pct',
  'PLT-AA':'plt_aa','血小板聚集率花生四烯酸':'plt_aa','血小板最大聚集率-花生四烯酸':'plt_aa',
  'PLT-ADP':'plt_adp','血小板聚集率二磷酸腺苷':'plt_adp','血小板最大聚集率-二磷酸腺苷':'plt_adp',
  'TSH':'tsh','促甲状腺素':'tsh',
  // 尿液
  '尿肌酐':'urine_crea','尿CREA':'urine_crea',
  'MALB':'malb','尿微量白蛋白':'malb',
  'UACR':'uacr','尿微量白蛋白/肌酐':'uacr',
  '尿比重':'urine_sg','SG':'urine_sg',
  '尿pH':'urine_ph','尿PH':'urine_ph',
  // 心动图
  'EF':'ef','射血分数':'ef',
  'IVS':'ivs','室间隔':'ivs',
  'LVEDD':'lvedd','LVDd':'lvedd',
  'LVEDV':'lvedv',
  'LVESD':'lvesd','LVDs':'lvesd',
  'LVESV':'lvesv',
  'LVPW':'lvpw','后壁':'lvpw',
  'SV':'sv','每搏量':'sv',
}

export function getVariablesByCategory() {
  const groups: Record<string, Array<[string, VariableDef]>> = {}
  for (const [key, def] of Object.entries(VARIABLES)) {
    if (!groups[def.category]) groups[def.category] = []
    groups[def.category].push([key, def])
  }
  return groups
}
