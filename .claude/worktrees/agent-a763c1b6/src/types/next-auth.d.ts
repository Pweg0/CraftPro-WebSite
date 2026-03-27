import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      discordId: string | null
      isAdmin?: boolean
      minecraftUuid: string | null
      minecraftName: string | null
    } & DefaultSession["user"]
  }
}
