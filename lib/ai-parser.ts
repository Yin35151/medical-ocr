import { VARIABLES } from './variables'

// ── 构建变量列表（给清洗Agent使用）──────────────────────────────
function buildVarList() {
  const lines: string[] = []
  for (const [key, def] of Object.entries(VARIABLES)) {
    if (def.category === '基础信息') continue
    lines.push(`"${key}"=${def.label}/${def.fullname}（${def.unit || '文本'}）`)
  }
  return lines.join('\n')
}

// ── Agent 1：OCR提取（仅视觉模型，不做理解）────────────────────
const OCR_PROMPT = `你是一个纯粹的OCR文字提取工具。
任务：将图片中的所有文字、数字、符号原样逐字提取出来。
要求：
1. 原样输出所有可见文字，不做任何分析或整理
2. 保持表格的行列结构，用空格或制表符对齐
3. 特别注意数字精度，不要修改任何数字
4. 如果有多列数据，每行保持对应关系
5. 只输出提取到的文字内容，不要添加任何说明`

// ── Agent 2：清洗整理（文字模型，不需要视觉）────────────────────
function buildCleanPrompt(): string {
  return `你是医疗数据结构化提取专家。
根据以下原始文本（来自病历图片OCR或手工粘贴），提取结构化医疗数据。

【⚠️ 核心规则】
1. 只输出原始文本中实际存在的数据，没有的变量一律不输出
2. 只能使用下面列表中的变量名，严禁自创变量名
3. 变量名不在列表中的检验项目，直接忽略

【标准变量列表（变量名=标签/全名）】
${buildVarList()}

【变量别名统一】
- 前白蛋白/PA → pa
- 总蛋白/TP → tp  
- 白蛋白/ALB/Alb → alb
- ALT/谷丙转氨酶/SGPT → alt
- AST/谷草转氨酶/SGOT → ast
- 总胆红素/TBIL/TBil → tbil
- 直接胆红素/DBIL/DBil → dbil
- 总胆汁酸/TBA → tba
- 碱性磷酸酶/ALP → alp
- 谷氨酰转肽酶/GGT/γ-GT → ggt
- 淀粉酶/AMY → amylase
- 肌酐/CREA/Cr/SCr → creatinine
- 肾小球滤过率/eGFR/EGFR/GFR/eGFR(CKD-EPI 2009) → egfr
- 尿素氮/BUN/UREA/尿素 → bun
- 尿酸/URIC/UA → uric_acid
- 胱抑素C/CYSC/Cys-C → cystatin_c
- 钾/K/K+ → k
- 钠/Na/Na+ → na
- 氯/Cl/Cl- → cl
- 二氧化碳/CO2/CO₂ → co2
- 钙/Ca/Ca2+ → calcium
- 磷/P → phosphorus
- 葡萄糖/血糖/GLU → glucose
- 糖化血红蛋白/HbA1c/HbAlC → hba1c
- 同型半胱氨酸/HCY/Hcy → homocysteine
- 游离脂肪酸/FFA/NEFA → ffa
- 总胆固醇/CHOL/TC → chol
- 甘油三酯/TG/TRIG → tg
- 低密度脂蛋白/LDL-C/LDL → ldl
- 高密度脂蛋白/HDL-C/HDL → hdl
- 非高密度脂蛋白/NonHDL/non-HDL → non_hdl
- 小密低密度/SdLDL/sdLDL → sdldl
- 载脂蛋白A1/ApoA1 → apoa1
- 载脂蛋白B/ApoB → apob
- 脂蛋白(a)/Lp(a)/LP(a) → lpa
- C反应蛋白/CRP → crp
- 超敏C反应蛋白/HsCRP/hsCRP/hs-CRP → hscrp
- NT-proBNP/NT proBNP/NT-ProBNP → nt_probnp
- BNP/B型利钠肽 → bnp
- 肌酸激酶/CK → ck
- 肌酸激酶同工酶/CKMB/CK-MB/CK-MB-Mass → ckmb
- 乳酸脱氢酶/LDH → ldh
- 肌钙蛋白I/TnI → troponin_i
- 高敏肌钙蛋白I/Hs-TnI/hsTnI → hs_troponin_i
- 高敏肌钙蛋白T/Hs-cTnT/hsTnT → hs_ctnt
- 降钙素原/PCT → pct
- 促甲状腺素/TSH → tsh
- 血小板聚集率(AA)/PLT-AA/花生四烯酸 → plt_aa
- 血小板聚集率(ADP)/PLT-ADP/二磷酸腺苷 → plt_adp
- 白细胞/WBC → wbc
- 中性粒细胞%/NEUT% → neut_pct
- 中性粒细胞#/NEUT# → neut_abs
- 淋巴细胞%/LYMPH% → lymph_pct
- 淋巴细胞#/LYMPH# → lymph_abs
- 单核细胞%/MONO% → mono_pct
- 单核细胞#/MONO# → mono_abs
- 嗜酸粒细胞%/EO% → eo_pct
- 嗜酸粒细胞#/EO# → eo_abs
- 嗜碱粒细胞%/BASO% → baso_pct
- 嗜碱粒细胞#/BASO# → baso_abs
- 红细胞/RBC → rbc
- 血红蛋白/HGB/HB/Hb → hgb
- 红细胞比容/HCT → hct
- MCV → mcv
- MCH → mch
- MCHC → mchc
- RDW-SD → rdw_sd
- 红细胞分布宽度/RDW → rdw
- 血小板/PLT → plt
- PDW → pdw
- MPV/平均血小板体积 → mpv
- P-LCR/大血小板比率 → plcr
- 血小板压积/PCT-PLT → plt_pct
- 尿肌酐/尿CREA → urine_crea
- 尿微量白蛋白/MALB → malb
- 尿微量白蛋白/肌酐/UACR → uacr
- 尿比重 → urine_sg
- 尿pH → urine_ph
- 射血分数/EF → ef
- 室间隔/IVS → ivs
- LVEDD/左室舒张末径 → lvedd
- LVPW/左室后壁 → lvpw
- 收缩压/SBP → sbp
- 舒张压/DBP → dbp
- 心率/HR/脉搏 → heart_rate
- 高血压 → hypertension（值用是/否）
- 糖尿病 → diabetes（值用是/否）
- 吸烟史 → smoking（值用是/否）
- 饮酒史 → alcohol（值用是/否）

【图片类型】
medical_history=现病史/既往史，vital_signs=体格检查，blood_routine=血常规，
biochemistry=生化检查，lipids=血脂，cardiac_markers=心脏标志物，
urine=尿常规，echo=超声心动图，discharge_diagnosis=出院诊断，discharge_medication=出院带药

【患者基础信息提取】
如果文本中能识别到以下信息，放入 patient_info（找不到就不输出该字段）：
- 姓名 → patient_name
- 性别（统一为"男"或"女"）→ gender
- 年龄（数字）→ age
- 婚姻状况（统一为：已婚/未婚/离异/丧偶）→ marital_status
- 联系电话/手机号 → phone1（第一个），phone2（第二个）
- 地址（北京市整理到区如"北京市海淀区"，非北京整理到市如"河南省郑州市"）→ address

【多日期处理规则 - 非常重要】
- 如果文本中包含多个不同检查日期的数据（如一张报告单上有多列日期），必须按日期拆分，每个日期输出一条record
- 如果只有一个日期（或没有日期），records数组只有一条
- 同一条record内只放属于该日期的变量值

【文本类变量特殊规则 - 非常重要】
- discharge_medication 的 value 必须是完整药品列表的全文，包括所有药品名、剂量、用法，不允许只取第一个药品
- discharge_diagnosis 的 value 必须包含所有诊断的完整文本，不允许截断
- 如果判断 image_type 为 discharge_diagnosis 或 discharge_medication，则每条record的data中只允许出现 discharge_diagnosis 和 discharge_medication 两个变量

【输出格式 - 严格JSON，不加任何说明文字和markdown代码块】
{
  "image_type": "图片类型（所有records共用同一类型）",
  "patient_info": {
    "patient_name": "姓名",
    "gender": "男或女",
    "age": 年龄数字,
    "marital_status": "婚姻状况",
    "phone1": "第一个电话",
    "phone2": "第二个电话（如有）",
    "address": "地址"
  },
  "confidence": "high/medium/low",
  "notes": "备注",
  "records": [
    {
      "collection_date": "日期YYYY-MM-DD或null",
      "data": {
        "变量名": {"value": 数值或字符串, "unit": "单位"}
      }
    }
  ]
}`
}

// ── API请求封装 ────────────────────────────────────────────────
async function callQwenVL(messages: object[], apiKey: string) {
  const res = await fetch(
    'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'qwen-vl-max', messages, max_tokens: 4000, temperature: 0.05 }),
    }
  )
  if (!res.ok) throw new Error(`API错误(${res.status}): ${await res.text()}`)
  const json = await res.json()
  return json.choices?.[0]?.message?.content || ''
}

async function callQwenText(messages: object[], apiKey: string) {
  const res = await fetch(
    'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'qwen-max', messages, max_tokens: 4000, temperature: 0.05 }),
    }
  )
  if (!res.ok) throw new Error(`API错误(${res.status}): ${await res.text()}`)
  const json = await res.json()
  return json.choices?.[0]?.message?.content || ''
}

function parseJSON(text: string) {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try { return JSON.parse(cleaned) } catch { /* try extract */ }
  const m = cleaned.match(/\{[\s\S]*\}/)
  if (m) try { return JSON.parse(m[0]) } catch { /* fall through */ }
  return null
}

// ── 主函数：图片 → 双Agent → 结构化数据 ────────────────────────
export async function analyzeImage(imageBase64: string, mimeType: string) {
  const apiKey = process.env.DASHSCOPE_API_KEY
  if (!apiKey) return { success: false, error: '未找到 DASHSCOPE_API_KEY' }

  // ── Step 1: OCR Agent（视觉模型，纯文字提取）──────────────────
  let rawText = ''
  try {
    rawText = await callQwenVL([
      { role: 'system', content: OCR_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
          { type: 'text', text: '请将图片中所有文字原样提取输出，保持表格行列结构。' },
        ],
      },
    ], apiKey)
  } catch (e) {
    return { success: false, error: `OCR识别失败: ${(e as Error).message}` }
  }

  if (!rawText) return { success: false, error: 'OCR未识别到内容' }

  // ── Step 2: 清洗Agent（文字模型，理解+结构化）────────────────
  return cleanText(rawText, apiKey)
}

// ── 直接清洗文字（跳过OCR，用于手动粘贴文字场景）───────────────
export async function analyzeText(rawText: string) {
  const apiKey = process.env.DASHSCOPE_API_KEY
  if (!apiKey) return { success: false, error: '未找到 DASHSCOPE_API_KEY' }
  return cleanText(rawText, apiKey)
}

async function cleanText(rawText: string, apiKey: string) {
  let structuredText = ''
  try {
    structuredText = await callQwenText([
      { role: 'system', content: buildCleanPrompt() },
      { role: 'user', content: `请从以下病历文本中提取结构化数据：\n\n${rawText}` },
    ], apiKey)
  } catch (e) {
    return { success: false, error: `数据清洗失败: ${(e as Error).message}` }
  }

  const parsed = parseJSON(structuredText)
  if (!parsed) {
    return { success: false, error: '返回格式无法解析，请重试', rawText: structuredText }
  }

  // ── 兼容旧格式：如果AI返回的是单条 data+collection_date，统一转为 records 数组
  if (!parsed.records && parsed.data) {
    parsed.records = [{ collection_date: parsed.collection_date || null, data: parsed.data }]
    delete parsed.data
    delete parsed.collection_date
  }
  // 确保 records 一定是数组
  if (!Array.isArray(parsed.records)) parsed.records = []

  return { success: true, data: parsed, ocrText: rawText }
}
