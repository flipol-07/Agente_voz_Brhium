import { createWhatsappFollowup } from '@/features/brhium-platform/server/service'
import { jsonError, jsonOk, requireSession } from '@/features/brhium-platform/server/http'

export async function POST(request: Request) {
  const session = await requireSession()
  if (!session) return jsonError('Unauthorized', 401)

  const body = (await request.json()) as {
    to?: string
    template?: string
    callId?: string
    contactId?: string
  }

  if (!body.to || !body.template) {
    return jsonError('to and template are required')
  }

  return jsonOk(
    await createWhatsappFollowup(session, {
      to: body.to,
      template: body.template,
      callId: body.callId,
      contactId: body.contactId,
    }),
    { status: 201 }
  )
}
