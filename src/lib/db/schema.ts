// src/lib/db/schema.ts
import { pgTable, text, timestamp, integer, bigint, primaryKey, index, jsonb, boolean } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  discordId: text("discordId").unique(), // Project extension — Discord snowflake, stable FK for Phase 3
  minecraftUuid: text("minecraftUuid"), // Linked Minecraft UUID (set by admin)
  minecraftName: text("minecraftName"), // Linked Minecraft username (set by admin)
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
})

export const accounts = pgTable("accounts", {
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"), // CRITICAL: Auth.js rotates this — do NOT write custom refresh logic
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}))

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable("verificationTokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}))

// ============================================================
// Arena — Competitive System (replays, leaderboard, matches)
// ============================================================

export const arenaPlayers = pgTable("arena_players", {
  uuid: text("uuid").primaryKey(), // Minecraft UUID
  name: text("name").notNull(),
  elo: integer("elo").notNull().default(800),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  division: text("division").notNull().default("UNRANKED"),
  placementComplete: integer("placement_complete").notNull().default(0),
  banned: integer("banned").notNull().default(0),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
})

export const arenaMatches = pgTable("arena_matches", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  matchId: text("match_id").unique().notNull(), // UUID from mod (idempotency key)
  arenaName: text("arena_name"),
  matchType: text("match_type"),
  reason: text("reason"),
  startedAt: bigint("started_at", { mode: "number" }), // epoch seconds
  durationMs: bigint("duration_ms", { mode: "number" }),
  winnerUuid: text("winner_uuid"),
  winnerName: text("winner_name"),
  loserUuid: text("loser_uuid"),
  loserName: text("loser_name"),
  winnerEloBefore: integer("winner_elo_before"),
  winnerEloAfter: integer("winner_elo_after"),
  winnerDelta: integer("winner_delta"),
  loserEloBefore: integer("loser_elo_before"),
  loserEloAfter: integer("loser_elo_after"),
  loserDelta: integer("loser_delta"),
  winnerDivision: text("winner_division"),
  loserDivision: text("loser_division"),
  replayLog: jsonb("replay_log"), // Array of Showdown protocol lines
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
}, (table) => ({
  winnerIdx: index("idx_winner").on(table.winnerUuid),
  loserIdx: index("idx_loser").on(table.loserUuid),
  startedIdx: index("idx_started").on(table.startedAt),
}))

// ============================================================
// Admin Panel — Phase 4 tables
// ============================================================

export const bannedItems = pgTable("banned_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  reason: text("reason").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
})

export const servers = pgTable("servers", {
  id: text("id").primaryKey(), // slug: 'pokebrawl', 'pokedash', etc.
  name: text("name").notNull(),
  ip: text("ip").notNull(),
  description: text("description").notNull(),
  bannerPath: text("banner_path").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
})

export const shopItems = pgTable("shop_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  price: integer("price").notNull().default(0), // price in cents (BRL), e.g. 1990 = R$19,90
  imageUrl: text("image_url"),                  // optional product image URL
  available: integer("available").notNull().default(1), // 1 = visible in store, 0 = hidden
  type: text("type"),                           // 'rank' | 'key' | 'cosmetic' — null for legacy items
  rconTemplate: text("rcon_template"),          // auto-generated by system; NOT exposed in admin UI
  duration: integer("duration"),                // days; only for rank type (nullable)
  active: boolean("active").notNull().default(true), // true = purchasable; replaces available for Phase 5 buy flow
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
})

// ============================================================
// Loja Funcional — Phase 5 tables
// ============================================================

export const orders = pgTable("orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),  // nullable — guest checkout allowed
  shopItemId: integer("shop_item_id").notNull().references(() => shopItems.id),
  minecraftName: text("minecraft_name"),                                       // name entered at checkout (for guest orders)
  status: text("status").notNull().default("pending"), // pending | paid | delivering | delivered | failed | refunded | revoked | expired
  mercadopagoId: text("mercadopago_id"),               // MP preference ID (set at checkout creation)
  mercadopagoPaymentId: text("mercadopago_payment_id").unique(), // MP payment ID — UNIQUE for idempotency (set by webhook)
  amountCents: integer("amount_cents").notNull(),       // snapshot of price at time of order
  retryCount: integer("retry_count").notNull().default(0),           // how many RCON attempts have been made
  nextRetryAt: timestamp("next_retry_at", { mode: "date" }),         // earliest time for next attempt (backoff)
  minecraftUuid: text("minecraft_uuid"),                             // snapshot of player UUID at purchase time
  deliveredAt: timestamp("delivered_at", { mode: "date" }),          // when mod confirmed delivery
  expiresAt: timestamp("expires_at", { mode: "date" }),              // when rank/benefit expires (set by mod on confirm)
  revokedAt: timestamp("revoked_at", { mode: "date" }),              // when admin revoked the benefit
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
}, (table) => ({
  userIdx: index("idx_orders_user").on(table.userId),
  statusIdx: index("idx_orders_status").on(table.status),
  mpPaymentIdIdx: index("idx_orders_mp_payment_id").on(table.mercadopagoPaymentId),
}))

export const adminPermissions = pgTable("admin_permissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  discordId: text("discord_id").notNull(),
  section: text("section").notNull(), // 'itens-banidos' | 'servidores' | 'loja' | 'leaderboard'
  grantedAt: timestamp("granted_at", { mode: "date" }).defaultNow(),
  grantedBy: text("granted_by").notNull(), // discordId of super-admin
})

// ============================================================
// Licenses — Mod activation keys
// ============================================================

export const licenses = pgTable("licenses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  key: text("key").unique().notNull(),
  ownerName: text("owner_name").notNull(),
  status: text("status").notNull().default("active"), // active | revoked
  serverIp: text("server_ip"), // last known server IP (filled on validate)
  lastValidatedAt: timestamp("last_validated_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  note: text("note"), // admin notes
})

export const adminAuditLog = pgTable("admin_audit_log", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  discordId: text("discord_id").notNull(),
  discordName: text("discord_name"),
  action: text("action").notNull(),
  targetId: text("target_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
})
