import type { SessionUser } from '@/features/brhium-platform/types'

export function DashboardShell({
  children,
}: {
  user: SessionUser
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto w-full max-w-[1920px]">
        {children}
      </div>
    </div>
  )
}
