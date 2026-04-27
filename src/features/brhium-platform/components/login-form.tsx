'use client'

import { startTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, LoaderCircle, ShieldCheck, UserRound } from 'lucide-react'

const DEMO_USERS = [
  {
    label: 'Admin agencia',
    email: 'admin@brhium.demo',
    password: 'brhium2026',
  },
  {
    label: 'Cliente Brhium',
    email: 'cliente@brhium.demo',
    password: 'brhium2026',
  },
]

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState(DEMO_USERS[0].email)
  const [password, setPassword] = useState(DEMO_USERS[0].password)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        throw new Error(payload.error || 'No se pudo iniciar sesion.')
      }

      startTransition(() => {
        router.push('/dashboard')
        router.refresh()
      })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="panel panel-strong flex w-full max-w-md flex-col gap-6 p-8">
      <div className="space-y-2">
        <p className="font-display text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Entorno demo
        </p>
        <h1 className="font-display text-3xl text-[var(--deep)]">Brhium Voice Hub</h1>
        <p className="text-sm leading-6 text-[var(--muted)]">
          Accede al panel operativo para probar el agente, revisar llamadas y editar la configuracion
          guiada.
        </p>
      </div>

      <div className="grid gap-2">
        {DEMO_USERS.map((user) => (
          <button
            key={user.email}
            type="button"
            onClick={() => {
              setEmail(user.email)
              setPassword(user.password)
            }}
            className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-white/70 px-4 py-3 text-left transition hover:border-[var(--teal)]"
          >
            <span className="text-sm font-medium text-[var(--deep)]">{user.label}</span>
            <span className="text-xs text-[var(--muted)]">{user.email}</span>
          </button>
        ))}
      </div>

      <label className="grid gap-2 text-sm">
        <span className="text-[var(--muted)]">Email</span>
        <div className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-white px-4 py-3">
          <UserRound className="h-4 w-4 text-[var(--muted)]" />
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full border-none bg-transparent outline-none"
            placeholder="tu@email.com"
            autoComplete="username"
          />
        </div>
      </label>

      <label className="grid gap-2 text-sm">
        <span className="text-[var(--muted)]">Password</span>
        <div className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-white px-4 py-3">
          <KeyRound className="h-4 w-4 text-[var(--muted)]" />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border-none bg-transparent outline-none"
            placeholder="********"
            autoComplete="current-password"
          />
        </div>
      </label>

      {error ? (
        <div className="rounded-lg border border-[#e8c4b8] bg-[#fff2ed] px-4 py-3 text-sm text-[#8d4a35]">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-lg bg-[var(--deep)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#10271f] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        Entrar al panel
      </button>

      <a
        href="/presentacion"
        className="text-center text-xs font-semibold text-[var(--muted)] transition hover:text-[var(--teal)]"
      >
        Ver presentación de qué es un agente de voz →
      </a>
    </form>
  )
}
