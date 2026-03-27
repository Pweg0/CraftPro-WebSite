import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { UsuariosCrud } from './UsuariosCrud'

export default async function AdminUsuariosPage() {
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      discordId: users.discordId,
      minecraftUuid: users.minecraftUuid,
      minecraftName: users.minecraftName,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))

  return <UsuariosCrud users={allUsers} />
}
