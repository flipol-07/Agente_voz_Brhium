'use client'

import { useEffect, useRef, useState, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RetellWebClient } from 'retell-client-js-sdk'
import { LoaderCircle, Mic, PhoneOff, AlertCircle } from 'lucide-react'

type DemoStatus = 'idle' | 'connecting' | 'connected' | 'error'

function statusLabel(status: DemoStatus, isAgentTalking: boolean) {
  if (status === 'connecting') return 'Conectando...'
  if (status === 'error') return 'Error de conexión'
  if (status === 'connected') {
    return isAgentTalking ? 'Agente hablando' : 'Escuchando...'
  }
  return 'Listo para llamar'
}

export function VoiceDemoPanel({ assistantId }: { assistantId: string }) {
  const router = useRouter()
  const [status, setStatus] = useState<DemoStatus>('idle')
  const [isAgentTalking, setIsAgentTalking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Initialize retell client just once
  const retellWebClientRef = useRef<RetellWebClient | null>(null)

  useEffect(() => {
    // We instantiate it here to avoid SSR issues
    const client = new RetellWebClient()
    retellWebClientRef.current = client

    // Listeners
    client.on('call_started', () => {
      setStatus('connected')
      setError(null)
    })

    client.on('call_ended', () => {
      setStatus('idle')
      setIsAgentTalking(false)
      // Refresh to fetch any new calls in history
      startTransition(() => {
        router.refresh()
      })
    })

    client.on('agent_start_talking', () => {
      setIsAgentTalking(true)
    })

    client.on('agent_stop_talking', () => {
      setIsAgentTalking(false)
    })

    client.on('error', (err) => {
      console.error('Error de voz:', err)
      setStatus('error')
      setError('Hubo un problema con la llamada.')
      client.stopCall()
    })

    return () => {
      client.stopCall()
    }
  }, [router])

  async function toggleCall() {
    const client = retellWebClientRef.current
    if (!client) return

    if (status === 'connected' || status === 'connecting') {
      client.stopCall()
      setStatus('idle')
      return
    }

    try {
      setStatus('connecting')
      setError(null)
      
      const response = await fetch('/api/retell/web-call', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('No se pudo iniciar la llamada (Error de API)')
      }

      const data = await response.json()
      
      if (!data.access_token) {
        throw new Error('No se recibió el token de conexión')
      }

      await client.startCall({
        accessToken: data.access_token,
      })
      
    } catch (err: any) {
      console.error('Call initialization failed:', err)
      setStatus('error')
      setError(err.message || 'Error al conectar con el agente.')
    }
  }

  return (
    <section id="demo" className="panel panel-strong flex h-full flex-col gap-6 p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-2xl text-[var(--deep)] tracking-tight">Demo interactiva</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
            Haz clic en "Iniciar Llamada" para probar el agente de voz real a través de tu micrófono.
            Asegúrate de conceder los permisos del navegador.
          </p>
        </div>
        <div className={`rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide ${
          status === 'connected' ? 'border-[var(--teal)] bg-[#eef6f5] text-[var(--teal)]' :
          status === 'error' ? 'border-red-200 bg-red-50 text-red-600' :
          'border-white/60 bg-white/50 text-[var(--muted)] shadow-sm'
        }`}>
          {statusLabel(status, isAgentTalking)}
        </div>
      </div>

      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-white/60 bg-white/40 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        
        {/* Pulsing animation when connected */}
        <div className="relative mb-8 flex items-center justify-center">
          {status === 'connected' && (
            <>
              <div className="absolute inset-0 animate-ping rounded-full bg-[var(--teal)] opacity-20" />
              <div className={`absolute -inset-4 animate-pulse rounded-full bg-[var(--teal)] opacity-10 ${isAgentTalking ? 'scale-150' : 'scale-100'} transition-transform duration-500`} />
            </>
          )}
          <div className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full transition-colors ${
            status === 'connected' ? 'bg-[var(--teal)] text-white shadow-lg' : 'bg-[#eef6f5] text-[var(--muted)]'
          }`}>
            {status === 'connected' ? <Mic className="h-8 w-8" /> : <PhoneOff className="h-8 w-8" />}
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={toggleCall}
          disabled={status === 'connecting'}
          className={`flex min-w-[200px] items-center justify-center gap-2 rounded-lg px-6 py-4 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
            status === 'connected'
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-[var(--deep)] hover:bg-[#10271f]'
          }`}
        >
          {status === 'connecting' ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : status === 'connected' ? (
            <>
              <PhoneOff className="h-5 w-5" />
              Cortar Llamada
            </>
          ) : (
            <>
              <Mic className="h-5 w-5" />
              Iniciar Llamada
            </>
          )}
        </button>
      </div>
    </section>
  )
}
