import { redirect } from 'next/navigation'
import { getSessionFromCookies } from '@/features/brhium-platform/auth'
import { DashboardShell } from '@/features/brhium-platform/components/dashboard-shell'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <InnerMainLayout>{children}</InnerMainLayout>
}

async function InnerMainLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookies()
  if (!session) {
    redirect('/login')
  }

  return (
    <DashboardShell user={session}>
      <main>{children}</main>
    </DashboardShell>
  )
}
