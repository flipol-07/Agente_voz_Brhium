import { jsonError, jsonOk, requireSession } from '@/features/brhium-platform/server/http'
import { syncAssistantConfigFromRetell } from '@/features/brhium-platform/server/service'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireSession()
  if (!session) return jsonError('Unauthorized', 401)

  const { id } = await context.params
  const retellAgentId = process.env.RETELL_AGENT_ID

  if (!retellAgentId) {
    return jsonError('ID de agente no configurado', 400)
  }

  try {
    const updatedConfig = await syncAssistantConfigFromRetell(id, retellAgentId)
    return jsonOk(updatedConfig)
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'No se pudo sincronizar')
  }
}
