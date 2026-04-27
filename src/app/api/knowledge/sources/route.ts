import { jsonError, jsonOk, requireSession } from '@/features/brhium-platform/server/http'
import { addRetellKnowledgeSource } from '@/features/brhium-platform/server/service'

export async function POST(request: Request) {
  const session = await requireSession()
  if (!session) return jsonError('Unauthorized', 401)

  try {
    const { kbId, name, text } = (await request.json()) as { kbId?: string; name?: string; text?: string }
    if (!kbId || !name || !text) return jsonError('kbId, name y text son obligatorios', 400)

    const result = await addRetellKnowledgeSource(kbId, { name, text })
    return jsonOk(result)
  } catch (error) {
    console.error('[knowledge/sources POST]', error)
    return jsonError(error instanceof Error ? error.message : 'No se pudo añadir la fuente')
  }
}
