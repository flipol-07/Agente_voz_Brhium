import { createCallback } from '@/features/brhium-platform/server/service'
import { jsonError, jsonOk, requireSession } from '@/features/brhium-platform/server/http'

export async function POST(request: Request) {
  const session = await requireSession()
  if (!session) return jsonError('Unauthorized', 401)

  const body = (await request.json()) as {
    reason?: string
    preferredWindow?: string
    contactId?: string
    callId?: string
  }

  if (!body.reason || !body.preferredWindow) {
    return jsonError('reason and preferredWindow are required')
  }

  return jsonOk(
    await createCallback(session, {
      reason: body.reason,
      preferredWindow: body.preferredWindow,
      contactId: body.contactId,
      callId: body.callId,
    }),
    { status: 201 }
  )
}
