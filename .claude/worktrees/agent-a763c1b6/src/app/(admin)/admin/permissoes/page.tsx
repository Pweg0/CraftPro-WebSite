import { auth } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/admin/permissions'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { adminPermissions } from '@/lib/db/schema'
import { PermissionManager } from '@/components/admin/PermissionManager'

export default async function PermissoesPage() {
  const session = await auth()
  if (!isSuperAdmin(session)) redirect('/403')

  const allPermissions = await db.select().from(adminPermissions)

  // Get list of admin discord IDs from env
  const adminIds = (process.env.ADMIN_DISCORD_IDS ?? '').split(',').map(s => s.trim()).filter(Boolean)

  return (
    <div>
      <h1 className="text-xl font-semibold text-white mb-6">Permissoes</h1>
      <PermissionManager
        adminIds={adminIds}
        permissions={allPermissions.map(p => ({ discordId: p.discordId, section: p.section }))}
      />
    </div>
  )
}
