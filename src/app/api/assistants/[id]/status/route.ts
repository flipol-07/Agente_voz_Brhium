import { jsonError, jsonOk, requireSession } from '@/features/brhium-platform/server/http'
import { updateAssistantStatus } from '@/features/brhium-platform/server/service'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireSession()
  if (!session) return jsonError('Unauthorized', 401)

  const body = (await request.json()) as { status: 'active' | 'inactive' }
  const { id } = await context.params

  try {
    const updated = await updateAssistantStatus(session, id, body.status)
    return jsonOk(updated)
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Cannot update assistant status')
  }
}
