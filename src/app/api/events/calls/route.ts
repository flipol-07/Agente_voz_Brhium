import { jsonError, jsonOk, requireSession } from '@/features/brhium-platform/server/http'
import { logExternalCallEvent } from '@/features/brhium-platform/server/service'
import type { CallTranscriptEntry } from '@/features/brhium-platform/types'
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await requireSession()
  if (!session) return jsonError('Unauthorized', 401)

  const body = (await request.json()) as {
    source?: 'phone' | 'web_demo'
    callerDisplay?: string
    summary?: string
    durationSeconds?: number
    status?: 'completed' | 'transferred' | 'scheduled_callback' | 'needs_followup' | 'active'
    assistantId?: string
    phoneNumberId?: string
    transcript?: Array<{ speaker: CallTranscriptEntry['speaker']; text: string }>
  }

  if (!body.source || !body.callerDisplay || !body.summary || !body.durationSeconds || !body.status) {
    return jsonError('Missing required call event fields')
  }

  return jsonOk(
    {
      callId: await logExternalCallEvent(session, {
        source: body.source,
        callerDisplay: body.callerDisplay,
        summary: body.summary,
        durationSeconds: body.durationSeconds,
        status: body.status,
        assistantId: body.assistantId,
        phoneNumberId: body.phoneNumberId,
        transcript: body.transcript,
      }),
    },
    { status: 201 }
  )
}
