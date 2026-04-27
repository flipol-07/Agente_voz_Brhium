import { jsonError, jsonOk, requireSession } from '@/features/brhium-platform/server/http'
import { getCall } from '@/features/brhium-platform/server/service'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireSession()
  if (!session) return jsonError('Unauthorized', 401)

  const { id } = await context.params
  const call = await getCall(session, id)

  if (!call) return jsonError('Call not found', 404)
  return jsonOk(call)
}
