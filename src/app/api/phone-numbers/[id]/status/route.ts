import { jsonError, jsonOk, requireSession } from '@/features/brhium-platform/server/http'
import { updatePhoneNumber } from '@/features/brhium-platform/server/service'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireSession()
  if (!session) return jsonError('Unauthorized', 401)

  const body = (await request.json()) as {
    isActive?: boolean
    assistantId?: string
    forwardTo?: string
  }
  const { id } = await context.params

  try {
    return jsonOk(await updatePhoneNumber(session, id, body))
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Cannot update phone number')
  }
}
