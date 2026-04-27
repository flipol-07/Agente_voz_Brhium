import { jsonOk, requireSession } from '@/features/brhium-platform/server/http'
import { fetchRetellVoices } from '@/features/brhium-platform/server/service'

export async function GET() {
  const session = await requireSession()
  if (!session) return new Response('Unauthorized', { status: 401 })

  try {
    const voices = await fetchRetellVoices()
    // Deduplicate by voice_id to avoid React duplicate key warnings
    const seen = new Set<string>()
    const unique = (Array.isArray(voices) ? voices : []).filter((v: { voice_id: string }) => {
      if (seen.has(v.voice_id)) return false
      seen.add(v.voice_id)
      return true
    })
    return jsonOk(unique)
  } catch (error) {
    return new Response('Error fetching voices', { status: 500 })
  }
}
