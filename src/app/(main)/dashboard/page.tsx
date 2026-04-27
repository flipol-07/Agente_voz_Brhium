import { redirect } from 'next/navigation'
import { getSessionFromCookies } from '@/features/brhium-platform/auth'
import { DashboardClient } from '@/features/brhium-platform/components/dashboard-client'
import { getDashboardSnapshot } from '@/features/brhium-platform/server/service'

export default async function DashboardPage() {
  const session = await getSessionFromCookies()
  if (!session) {
    redirect('/login')
  }

  const snapshot = await getDashboardSnapshot(session)
  return <DashboardClient snapshot={snapshot} />
}
