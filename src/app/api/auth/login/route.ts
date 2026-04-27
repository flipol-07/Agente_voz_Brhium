import { NextResponse } from 'next/server'
import {
  authenticateUser,
  createSessionCookieValue,
  getSessionCookieName,
} from '@/features/brhium-platform/auth'
import { jsonError } from '@/features/brhium-platform/server/http'

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string }

  if (!body.email || !body.password) {
    return jsonError('Email y password son obligatorios.')
  }

  const sessionUser = await authenticateUser(body.email, body.password)

  if (!sessionUser) {
    return jsonError('Credenciales invalidas.', 401)
  }

  const response = NextResponse.json({ ok: true, user: sessionUser })
  response.cookies.set(getSessionCookieName(), createSessionCookieValue(sessionUser), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  })

  return response
}
