// src/lib/auth.ts
import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  pages: {
    signIn: "/login",
  },
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID!,
      clientSecret: process.env.AUTH_DISCORD_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Upsert discordId from Discord profile.id (snowflake) into users table
      // profile.id is the stable Discord user ID — never changes unlike username
      if (account?.provider === "discord" && profile?.id && user.id) {
        await db
          .update(users)
          .set({ discordId: String(profile.id) })
          .where(eq(users.id, user.id))
      }
      return true
    },
    async session({ session, user }) {
      // Expose internal user id to session so Phase 3 can look up ELO by userId
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
})
