import { redirect } from 'next/navigation'
import { getSessionFromCookies } from '@/features/brhium-platform/auth'

export default async function HomePage() {
  const session = await getSessionFromCookies()
  redirect(session ? '/dashboard' : '/login')
}
