import { jsonError, jsonOk, requireSession } from '@/features/brhium-platform/server/http'
import { deleteRetellKnowledgeSource } from '@/features/brhium-platform/server/service'

export async function DELETE(
  request: Request,
  context: { params: Promise<{ sourceId: string }> }
) {
  const session = await requireSession()
  if (!session) return jsonError('Unauthorized', 401)

  const { sourceId } = await context.params
  const { searchParams } = new URL(request.url)
  const kbId = searchParams.get('kbId')

  if (!kbId) return jsonError('kbId is required', 400)

  try {
    await deleteRetellKnowledgeSource(kbId, sourceId)
    return jsonOk({ success: true })
  } catch (error) {
    console.error('[knowledge/sources DELETE]', error)
    return jsonError(error instanceof Error ? error.message : 'No se pudo eliminar la fuente')
  }
}
