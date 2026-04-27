import { createLead } from '@/features/brhium-platform/server/service'
import { jsonError, jsonOk, requireSession } from '@/features/brhium-platform/server/http'

export async function POST(request: Request) {
  const session = await requireSession()
  if (!session) return jsonError('Unauthorized', 401)

  const body = (await request.json()) as {
    fullName?: string
    phone?: string
    email?: string
    interest?: string
    notes?: string
  }

  if (!body.fullName || !body.phone || !body.interest) {
    return jsonError('fullName, phone and interest are required')
  }

  return jsonOk(
    await createLead(session, {
      fullName: body.fullName,
      phone: body.phone,
      email: body.email,
      interest: body.interest,
      notes: body.notes,
    }),
    { status: 201 }
  )
}
