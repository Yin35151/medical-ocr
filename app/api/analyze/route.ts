import { NextRequest, NextResponse } from 'next/server'
import { analyzeImage, analyzeText } from '@/lib/ai-parser'

export const maxDuration = 60

type AnalyzeSuccess = {
  success: true
  data: Record<string, unknown>
  ocrText?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.rawText) {
      const result = await analyzeText(body.rawText)
      if (!result.success) return NextResponse.json({ error: result.error }, { status: 422 })
      const success = result as AnalyzeSuccess
      return NextResponse.json(success.data)
    }

    if (body.imageBase64 && body.mimeType) {
      const result = await analyzeImage(body.imageBase64, body.mimeType)
      if (!result.success) return NextResponse.json({ error: result.error, rawText: (result as any).rawText }, { status: 422 })
      const success = result as AnalyzeSuccess
      return NextResponse.json({ ...success.data, _ocrText: success.ocrText })
    }

    return NextResponse.json({ error: '需要提供 imageBase64 或 rawText' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '服务器错误'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
