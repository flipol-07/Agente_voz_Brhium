import { getMetrics } from '@/features/brhium-platform/server/service'
import { jsonError, jsonOk, requireSession } from '@/features/brhium-platform/server/http'
import { fetchRetellCalls } from '@/features/brhium-platform/server/service'

export async function GET() {
  const session = await requireSession()
  if (!session) return jsonError('Unauthorized', 401)

  return jsonOk(await getMetrics(session))
}
