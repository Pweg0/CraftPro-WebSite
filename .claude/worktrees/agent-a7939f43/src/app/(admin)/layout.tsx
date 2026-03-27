import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isAdmin, isSuperAdmin, getAdminSections } from '@/lib/admin/permissions'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/admin')
  if (!isAdmin(session)) redirect('/403')

  const superAdmin = isSuperAdmin(session)
  const sections = superAdmin
    ? (['itens-banidos', 'servidores', 'loja', 'pedidos', 'beneficios', 'vendas', 'leaderboard', 'licencas', 'permissoes'] as const)
    : await getAdminSections(session.user.discordId!)

  return (
    <div className="flex min-h-screen bg-brand-primary">
      <AdminSidebar
        isSuperAdmin={superAdmin}
        sections={[...sections]}
        userName={session.user.name ?? 'Admin'}
        userImage={session.user.image ?? undefined}
      />
      <main className="flex-1 lg:p-6 p-4 overflow-auto">
        {children}
      </main>
    </div>
  )
}
