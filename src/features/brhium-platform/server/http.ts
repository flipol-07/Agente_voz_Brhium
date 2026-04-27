import { NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/features/brhium-platform/auth'

export async function requireSession() {
  return getSessionFromCookies()
}

export function jsonOk(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init)
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}
