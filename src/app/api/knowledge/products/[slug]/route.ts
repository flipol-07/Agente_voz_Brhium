import { getKnowledgeProduct } from '@/features/brhium-platform/server/service'
import { jsonError, jsonOk, requireSession } from '@/features/brhium-platform/server/http'

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const session = await requireSession()
  if (!session) return jsonError('Unauthorized', 401)

  const { slug } = await context.params
  const product = await getKnowledgeProduct(session, slug)

  if (!product) return jsonError('Product not found', 404)
  return jsonOk(product)
}
