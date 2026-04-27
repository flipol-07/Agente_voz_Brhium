import { NextResponse } from 'next/server'
import Retell from 'retell-sdk'
import { requireSession } from '@/features/brhium-platform/server/http'

// Initialize Retell client
const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY || '',
})

export async function POST(req: Request) {
  try {
    const session = await requireSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.RETELL_API_KEY) {
      return NextResponse.json({ error: 'RETELL_API_KEY is not configured on the server' }, { status: 500 })
    }

    const agentId = process.env.RETELL_AGENT_ID

    if (!agentId) {
      return NextResponse.json({ error: 'RETELL_AGENT_ID is not configured in env' }, { status: 500 })
    }

    // Check if assistant is active in our store
    const { readStore } = await import('@/features/brhium-platform/server/store')
    const store = await readStore()
    const assistant = store.assistants.find(a => a.workspaceId === session.workspaceId)
    
    if (assistant && assistant.status === 'inactive') {
      return NextResponse.json({ error: 'El asistente esta desactivado en este momento.' }, { status: 403 })
    }

    // Create web call
    const webCallResponse = await retell.call.createWebCall({
      agent_id: agentId,
      metadata: {
        workspaceId: session.workspaceId,
        userId: session.id,
        userName: session.name,
      }
    })

    return NextResponse.json(webCallResponse)
  } catch (error: any) {
    console.error('Error creating Retell web call:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to create web call' },
      { status: 500 }
    )
  }
}
