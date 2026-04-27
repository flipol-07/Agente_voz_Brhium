import { jsonError, jsonOk, requireSession } from '@/features/brhium-platform/server/http'
import { listCalls } from '@/features/brhium-platform/server/service'

export async function GET() {
  const session = await requireSession()
  if (!session) return jsonError('Unauthorized', 401)

  return jsonOk(await listCalls(session))
}
