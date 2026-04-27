import { jsonError, jsonOk, requireSession } from '@/features/brhium-platform/server/http'
import { updateAssistantConfig } from '@/features/brhium-platform/server/service'
import type { AssistantConfig } from '@/features/brhium-platform/types'
import { updateRetellAgentConfig } from '@/features/brhium-platform/server/service'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireSession()
  if (!session) return jsonError('Unauthorized', 401)

  const body = (await request.json()) as Partial<AssistantConfig>
  const { id } = await context.params

  try {
    const updatedLocal = await updateAssistantConfig(session, id, body)

    // Sync with Retell if configured
    const retellAgentId = process.env.RETELL_AGENT_ID
    if (retellAgentId) {
      await updateRetellAgentConfig(retellAgentId, body)
    }

    return jsonOk(updatedLocal)
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Cannot update assistant')
  }
}

