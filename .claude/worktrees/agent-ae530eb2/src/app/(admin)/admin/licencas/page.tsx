import { auth } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/admin/permissions'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { licenses } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { LicensesCrud } from './LicensesCrud'

export default async function LicensesPage() {
  const session = await auth()
  if (!isSuperAdmin(session)) redirect('/admin')

  const allLicenses = await db
    .select()
    .from(licenses)
    .orderBy(desc(licenses.createdAt))

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Licencas do Mod</h1>
      <p className="text-white/60 mb-8">
        Gere e gerencie chaves de ativacao para o CArena. Cada servidor precisa de uma key ativa.
      </p>
      <LicensesCrud licenses={allLicenses} />
    </div>
  )
}
