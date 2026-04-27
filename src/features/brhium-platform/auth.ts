import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { readStore } from '@/features/brhium-platform/server/store'
import type { SessionUser, User } from '@/features/brhium-platform/types'

const SESSION_COOKIE = 'brhium_voice_hub_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 12

interface SessionPayload extends SessionUser {
  expiresAt: number
}

function getSessionSecret() {
  return process.env.APP_SESSION_SECRET || 'brhium-dev-secret'
}

export function hashPassword(password: string) {
  return createHash('sha256').update(password).digest('hex')
}

function sign(value: string) {
  return createHmac('sha256', getSessionSecret()).update(value).digest('base64url')
}

function serialize(payload: SessionPayload) {
  const base = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${base}.${sign(base)}`
}

function deserialize(cookieValue?: string | null): SessionPayload | null {
  if (!cookieValue) return null

  const [base, signature] = cookieValue.split('.')
  if (!base || !signature) return null

  const expected = sign(base)
  const isValid = timingSafeEqual(Buffer.from(signature), Buffer.from(expected))

  if (!isValid) return null

  const payload = JSON.parse(Buffer.from(base, 'base64url').toString()) as SessionPayload
  if (payload.expiresAt < Date.now()) return null
  return payload
}

function toSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    workspaceId: user.workspaceId,
    role: user.role,
    email: user.email,
    name: user.name,
    title: user.title,
  }
}

export async function authenticateUser(email: string, password: string) {
  const store = await readStore()
  const user = store.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase())

  if (!user) return null
  if (user.passwordHash !== hashPassword(password)) return null

  return toSessionUser(user)
}

export function createSessionCookieValue(user: SessionUser) {
  return serialize({
    ...user,
    expiresAt: Date.now() + SESSION_TTL_MS,
  })
}

export async function getSessionFromCookies() {
  const cookieStore = await cookies()
  return deserialize(cookieStore.get(SESSION_COOKIE)?.value)
}

export function getSessionCookieName() {
  return SESSION_COOKIE
}
