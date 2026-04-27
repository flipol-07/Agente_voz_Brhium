import { createCase } from '@/features/brhium-platform/server/service'
import { jsonError, jsonOk, requireSession } from '@/features/brhium-platform/server/http'

export async function POST(request: Request) {
  const session = await requireSession()
  if (!session) return jsonError('Unauthorized', 401)

  const body = (await request.json()) as {
    topic?: string
    notes?: string
    priority?: 'normal' | 'alta'
    contactId?: string
    callId?: string
  }

  if (!body.topic || !body.notes) {
    return jsonError('topic and notes are required')
  }

  return jsonOk(
    await createCase(session, {
      topic: body.topic,
      notes: body.notes,
      priority: body.priority,
      contactId: body.contactId,
      callId: body.callId,
    }),
    { status: 201 }
  )
}
