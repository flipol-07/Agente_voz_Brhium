import { converseWithAssistant } from '@/features/brhium-platform/server/service'
import { jsonError, jsonOk, requireSession } from '@/features/brhium-platform/server/http'

export async function POST(request: Request) {
  const session = await requireSession()
  if (!session) return jsonError('Unauthorized', 401)

  const body = (await request.json()) as {
    assistantId?: string
    message?: string
    conversationId?: string
  }

  if (!body.assistantId || !body.message) {
    return jsonError('assistantId and message are required')
  }

  try {
    return jsonOk(
      await converseWithAssistant(session, {
        assistantId: body.assistantId,
        message: body.message,
        conversationId: body.conversationId,
      })
    )
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Demo conversation failed')
  }
}
