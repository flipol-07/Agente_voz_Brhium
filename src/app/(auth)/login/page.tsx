import { redirect } from 'next/navigation'
import { getSessionFromCookies } from '@/features/brhium-platform/auth'
import { LoginForm } from '@/features/brhium-platform/components/login-form'

export default async function LoginPage() {
  const session = await getSessionFromCookies()
  if (session) {
    redirect('/dashboard')
  }

  return <LoginForm />
}
