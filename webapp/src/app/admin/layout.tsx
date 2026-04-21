import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { parseSessionToken } from '@/lib/auth'
import Sidebar from '@/components/admin/Sidebar'
import NotificationBell from '@/components/admin/NotificationBell'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('nanucell_admin_session')?.value

  if (!token) {
    redirect('/admin-login')
  }

  const session = parseSessionToken(token)
  if (!session) {
    redirect('/admin-login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar userRole={session.role} userName={session.name} />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Welcome back, {session.name}</h2>
            <p className="text-sm text-slate-500">Here&apos;s what&apos;s happening today</p>
          </div>
          <NotificationBell />
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
