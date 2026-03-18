# Phase 4: Painel Admin — Research

**Researched:** 2026-03-18
**Domain:** Next.js App Router admin panel, Drizzle ORM schema migration, role-based access control, CRUD UI patterns
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Controle de Acesso**
- Lista de admins via env var `ADMIN_DISCORD_IDS` (IDs separados por vírgula)
- Super-admin via env var `SUPER_ADMIN_DISCORD_ID` — tem acesso total e gerencia permissões dos outros admins
- Permissões granulares por seção armazenadas em tabela no banco (admin_permissions com discordId + section)
- Middleware compara discordId da sessão com as env vars e tabela de permissões
- Link "Admin" visível na navbar apenas para usuários admin logados
- Usuário logado sem permissão de admin vê página 403 com visual temático Minecraft/Pokémon e botão pra voltar
- Todo admin tem acesso às seções que foram atribuídas; super-admin tem acesso a tudo + seção de permissões
- Log básico de auditoria: tabela com quem, ação, quando (admin_audit_log)

**Migração de Dados — Itens Banidos**
- Dados migrados de `src/data/banned-items.ts` para tabela `banned_items` no Neon PostgreSQL
- Seed com os 12 itens banidos atuais (nome, razão, categoria)
- Admin faz CRUD completo
- Página pública `/itens-banidos` passa a ler do banco

**Migração de Dados — Servidores**
- Dados migrados de `src/data/servers.ts` para tabela `servers` no Neon PostgreSQL
- Seed com os 3 servidores atuais (id, name, ip, description, bannerPath)
- Admin faz CRUD completo
- Página pública `/servidores` passa a ler do banco

**Loja — Configuração Preview**
- Tabela `shop_items` com campos: nome, descrição, categoria
- Admin faz CRUD de itens preview
- Sem campo de preço por agora
- Página pública `/loja` exibe itens preview do banco

**Layout do Painel Admin**
- Sidebar fixa com links: Dashboard, Itens Banidos, Servidores, Loja, Leaderboard, Permissões (só super-admin)
- Dashboard como página inicial com stats: total de jogadores, partidas do dia, servidores online, total de itens banidos, logs recentes
- Visual segue o mesmo tema vibrante Minecraft/Pokémon do site público
- Mobile: sidebar vira drawer deslizante (mesmo padrão do Sheet já usado na navbar pública)

**Gerenciamento do Leaderboard**
- Dados de ELO são somente leitura — ELO vem do mod CobblemonArena, admin NÃO edita
- Admin pode banir jogadores do ranking (flag `banned` no arena_players)
- Tabela de partidas filtrável por jogador, data, arena
- Admin pode deletar partidas específicas

### Claude's Discretion
- Design exato dos componentes de CRUD (modais vs inline editing vs formulários em página separada)
- Esquema de cores dos cards do dashboard
- Paginação e ordenação das tabelas admin
- Loading states e skeleton screens
- Confirmação de ações destrutivas (deletar item, banir jogador)
- Formato exato do log de auditoria (quais ações são logadas)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

## Summary

Phase 4 builds a fully protected admin panel at `/admin` within the existing Next.js 16 / App Router codebase. The tech stack is already decided: Drizzle ORM with Neon PostgreSQL, shadcn/ui components, Auth.js v5 Discord sessions, Tailwind v4. The work decomposes into four independent concern areas: (1) schema migration — adding 5 new tables and seeding from static files; (2) access control — env-var-based admin list + granular per-section DB permissions + middleware enforcement; (3) admin UI shell — sidebar layout, route group, 403 page; (4) CRUD sections — one per domain (banned items, servers, shop items, leaderboard, permissions).

The core pattern throughout is Next.js Server Actions for mutations (no separate REST API layer needed), Server Components for data fetching, and Client Component islands only for interactive UI (dialogs, forms). This matches the established pattern in the codebase. The biggest architectural risk is the middleware: it currently only checks `isLoggedIn` — the admin check must be added without breaking the existing `/perfil` protection.

**Primary recommendation:** Use Server Actions for all CRUD mutations with `revalidatePath`, Server Components for reads, and a single `isAdmin(session)` / `hasPermission(session, section)` utility consumed by both middleware and page-level guards.

---

## Standard Stack

All packages below are already installed. No new npm dependencies are required for this phase.

### Core (Already Installed)
| Library | Version | Purpose | Role in Phase 4 |
|---------|---------|---------|-----------------|
| next | 16.2.0 | App Router, Server Actions, route groups | Admin route group, Server Actions for CRUD |
| drizzle-orm | ^0.45.1 | ORM for PostgreSQL | 5 new tables, queries, seed |
| @neondatabase/serverless | ^1.0.2 | Neon HTTP driver | Existing db connection — no change |
| next-auth | ^5.0.0-beta.30 | Auth.js v5 — session access | `auth()` in Server Components + middleware |
| shadcn (components) | installed | Badge, Table, Sheet, Input, Button, DropdownMenu | All CRUD UI reuses existing components |
| sonner | ^2.0.7 | Toast notifications | Success/error feedback after CRUD mutations |
| lucide-react | ^0.577.0 | Icons | Sidebar icons, action buttons |

### What Needs to Be Added
| Component | Source | Install? |
|-----------|--------|---------|
| `dialog.tsx` (shadcn) | shadcn CLI | `npx shadcn add dialog` — for CRUD modals |
| `select.tsx` (shadcn) | shadcn CLI | `npx shadcn add select` — for category selects in forms |
| `textarea.tsx` (shadcn) | shadcn CLI | `npx shadcn add textarea` — for description fields |
| `alert-dialog.tsx` (shadcn) | shadcn CLI | `npx shadcn add alert-dialog` — for destructive confirmation |

**Installation:**
```bash
npx shadcn add dialog select textarea alert-dialog
```

These are the only additions. The project already has `@base-ui/react` which underlies some existing components — continue using `shadcn` CLI for consistency.

---

## Architecture Patterns

### Recommended Project Structure
```
src/app/(admin)/
├── layout.tsx              # Admin shell: auth guard + sidebar layout
├── admin/
│   ├── page.tsx            # Dashboard — stats overview
│   ├── itens-banidos/
│   │   └── page.tsx        # Banned items CRUD table
│   ├── servidores/
│   │   └── page.tsx        # Servers CRUD table
│   ├── loja/
│   │   └── page.tsx        # Shop items CRUD table
│   ├── leaderboard/
│   │   └── page.tsx        # Leaderboard view + ban players + delete matches
│   └── permissoes/
│       └── page.tsx        # Permission management (super-admin only)
src/components/admin/
├── AdminSidebar.tsx        # Sidebar with section links + mobile Sheet drawer
├── AdminStatCard.tsx       # Dashboard stat card component
├── CrudTable.tsx           # Generic or per-domain CRUD tables
├── BannedItemForm.tsx      # Create/edit form for banned items
├── ServerForm.tsx          # Create/edit form for servers
├── ShopItemForm.tsx        # Create/edit form for shop items
├── PermissionManager.tsx   # Grant/revoke section permissions UI
src/lib/admin/
├── permissions.ts          # isAdmin(), isSuperAdmin(), hasPermission(), getAdminSection()
├── actions/
│   ├── banned-items.ts     # Server Actions: createBannedItem, updateBannedItem, deleteBannedItem
│   ├── servers.ts          # Server Actions: createServer, updateServer, deleteServer
│   ├── shop-items.ts       # Server Actions: createShopItem, updateShopItem, deleteShopItem
│   ├── leaderboard.ts      # Server Actions: banPlayer, unbanPlayer, deleteMatch
│   └── permissions.ts      # Server Actions: grantPermission, revokePermission
src/lib/db/queries/
├── admin.ts                # DB queries for admin panel data
└── (existing: leaderboard.ts, player.ts)
```

### Pattern 1: Admin Route Group with Layout Guard

The `(admin)` route group uses a layout that server-side checks the session for admin status. Non-admins are redirected to `/403`.

```typescript
// src/app/(admin)/layout.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin/permissions'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/admin')
  if (!isAdmin(session)) redirect('/403')

  return (
    <div className="flex min-h-screen bg-brand-primary">
      <AdminSidebar session={session} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
```

### Pattern 2: Server Actions for CRUD Mutations

All create/update/delete operations use Next.js Server Actions. No separate API routes needed. Each action:
1. Re-validates admin permission server-side (never trust client)
2. Performs the DB mutation
3. Inserts an audit log entry
4. Calls `revalidatePath` to bust the page cache

```typescript
// src/lib/admin/actions/banned-items.ts
'use server'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/admin/permissions'
import { db } from '@/lib/db'
import { bannedItems, adminAuditLog } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function deleteBannedItem(id: number) {
  const session = await auth()
  if (!hasPermission(session, 'itens-banidos')) throw new Error('Forbidden')

  await db.delete(bannedItems).where(eq(bannedItems.id, id))
  await logAudit(session!, 'DELETE_BANNED_ITEM', { id })
  revalidatePath('/admin/itens-banidos')
  revalidatePath('/itens-banidos') // public page
}
```

### Pattern 3: Permission Utility Functions

Centralize all admin checks in `src/lib/admin/permissions.ts`. This module is used by middleware, layouts, and Server Actions.

```typescript
// src/lib/admin/permissions.ts
import type { Session } from 'next-auth'

export type AdminSection = 'itens-banidos' | 'servidores' | 'loja' | 'leaderboard' | 'permissoes'

export function isSuperAdmin(session: Session | null): boolean {
  const superAdminId = process.env.SUPER_ADMIN_DISCORD_ID
  return !!session?.user && session.user.discordId === superAdminId
}

export function isAdmin(session: Session | null): boolean {
  if (!session?.user?.discordId) return false
  if (isSuperAdmin(session)) return true
  const adminIds = (process.env.ADMIN_DISCORD_IDS ?? '').split(',').map(s => s.trim())
  return adminIds.includes(session.user.discordId)
}

// hasPermission requires DB check for section-level access — call from Server Components
export async function hasPermission(session: Session | null, section: AdminSection): Promise<boolean> {
  if (isSuperAdmin(session)) return true
  if (!isAdmin(session)) return false
  // DB lookup for granular section permission
  const { db } = await import('@/lib/db')
  const { adminPermissions } = await import('@/lib/db/schema')
  const { eq, and } = await import('drizzle-orm')
  const [row] = await db.select()
    .from(adminPermissions)
    .where(and(
      eq(adminPermissions.discordId, session!.user!.discordId!),
      eq(adminPermissions.section, section)
    ))
    .limit(1)
  return !!row
}
```

**CRITICAL:** The `session.user.discordId` field is set by the Phase 2 `signIn` callback. It is present in the DB but NOT automatically in the Auth.js session object. The session callback in `src/lib/auth.ts` must be extended to expose `discordId` alongside the existing `id`.

### Pattern 4: Middleware Admin Check

The existing middleware only checks `isLoggedIn`. It must be extended to also check admin status for `/admin` routes. However, the per-section permission check requires a DB call — middleware should only do the coarse-grained `isAdmin` check (env var lookup, no DB). The fine-grained section permission check happens in the layout or page.

```typescript
// middleware.ts — extended
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  const isProtectedRoute = pathname.startsWith("/perfil") || pathname.startsWith("/admin")
  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Coarse admin check — fine-grained permission in layout
  if (pathname.startsWith("/admin") && isLoggedIn) {
    const discordId = req.auth?.user?.discordId
    const superAdminId = process.env.SUPER_ADMIN_DISCORD_ID
    const adminIds = (process.env.ADMIN_DISCORD_IDS ?? '').split(',').map(s => s.trim())
    const isAdmin = discordId === superAdminId || adminIds.includes(discordId ?? '')
    if (!isAdmin) return NextResponse.redirect(new URL('/403', req.nextUrl.origin))
  }

  return NextResponse.next()
})
```

**IMPORTANT:** `req.auth.user.discordId` is only available if the Auth.js session callback exposes it. This requires updating the session callback in `src/lib/auth.ts`.

### Pattern 5: Drizzle Schema Addition

Five new tables added to the existing `src/lib/db/schema.ts`. Follow the exact existing patterns (pgTable, text pk, timestamps).

```typescript
// New tables to add to src/lib/db/schema.ts

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
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
})

export const adminPermissions = pgTable("admin_permissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  discordId: text("discord_id").notNull(),
  section: text("section").notNull(), // 'itens-banidos' | 'servidores' | 'loja' | 'leaderboard'
  grantedAt: timestamp("granted_at", { mode: "date" }).defaultNow(),
  grantedBy: text("granted_by").notNull(), // discordId of super-admin
})

export const adminAuditLog = pgTable("admin_audit_log", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  discordId: text("discord_id").notNull(),
  discordName: text("discord_name"),
  action: text("action").notNull(), // e.g. 'CREATE_BANNED_ITEM', 'DELETE_MATCH', 'BAN_PLAYER'
  targetId: text("target_id"), // nullable — ID of affected resource
  metadata: jsonb("metadata"), // optional extra context
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
})
```

Also: `arenaPlayers` needs a `banned` column (boolean/integer flag):
```typescript
// Add to arenaPlayers table definition:
banned: integer("banned").notNull().default(0),
```

### Anti-Patterns to Avoid
- **Doing DB queries in middleware:** Middleware runs on the Edge runtime in Next.js — Neon's neon-http driver can work on Edge, BUT it adds latency to every request. Use env-var-only checks in middleware; save DB permission checks for layouts/Server Components.
- **Exposing admin Server Actions without re-validating session:** Always call `auth()` at the top of every Server Action. The client-side UI check is cosmetic only.
- **Using route handlers (API routes) for CRUD:** Server Actions in this codebase are the established pattern. Using `route.ts` files for admin CRUD adds boilerplate without benefit.
- **Making AdminSidebar a Server Component for conditional rendering:** The sidebar needs to know if the user is super-admin (to show/hide Permissoes link). Pass session data as props from the Server Component layout — don't call `auth()` inside the client sidebar.
- **Reading from static files after migration:** After creating `banned_items` and `servers` tables and seeding, the public pages `/itens-banidos` and `/servidores` must be updated immediately. Leaving the static imports in place creates a split truth.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Confirmation dialogs for destructive actions | Custom modal state + portal | `alert-dialog.tsx` (shadcn) | Accessible focus trap, keyboard dismiss, consistent styling |
| Toast notifications after mutations | Custom toast state | `sonner` (already installed) | Already set up in layout, 1 import away |
| Form validation | Manual field checks | Native HTML5 validation + server-side throw | Sufficient for admin-only forms; no end-user schema validation library needed |
| Pagination logic | Custom offset math | Drizzle `.limit().offset()` + URL search params | Simple and server-rendered, no client state needed |
| Role-based rendering | Complex permission tree | `isSuperAdmin()` / `hasPermission()` utility pattern | Simple 4-section model doesn't warrant a library |
| Mobile sidebar | Custom drawer | `Sheet` from `shadcn/ui` (already used in Navbar) | Exact same pattern already proven in this codebase |

---

## Common Pitfalls

### Pitfall 1: `discordId` Not in Session Object
**What goes wrong:** `session.user.discordId` is undefined in all components and middleware even though the column exists in the DB.
**Why it happens:** Auth.js v5 only exposes what you explicitly put in the session callback. The Phase 2 session callback only adds `id` (the internal DB user ID), not `discordId`.
**How to avoid:** Extend the session callback in `src/lib/auth.ts` to also query and expose `discordId`:
```typescript
async session({ session, user }) {
  if (session.user) {
    session.user.id = user.id
    // Add this:
    const dbUser = await db.select({ discordId: users.discordId })
      .from(users).where(eq(users.id, user.id)).limit(1)
    session.user.discordId = dbUser[0]?.discordId ?? null
  }
  return session
}
```
Also extend the TypeScript module augmentation for `Session` to include `discordId`.
**Warning signs:** `req.auth?.user?.discordId` is always `undefined` in middleware.

### Pitfall 2: Middleware Edge Runtime Incompatibility
**What goes wrong:** Adding Drizzle/Neon DB calls to middleware causes a build error or runtime crash.
**Why it happens:** Next.js middleware runs on the Edge runtime by default. The `neon-http` driver technically supports Edge, but the existing `db` instance in `src/lib/db/index.ts` was not designed for this context and importing it adds node-only dependencies.
**How to avoid:** Keep middleware to env-var-only checks (string comparison on `discordId`). Move all DB permission lookups to the route layout. This is fast enough — env var checks are O(n) on a tiny comma-separated list.
**Warning signs:** Build error mentioning `Module not found: Can't resolve 'net'` or similar Node.js modules.

### Pitfall 3: Public Pages Cache Not Invalidated After CRUD
**What goes wrong:** Admin updates a banned item but the public `/itens-banidos` page still shows old data.
**Why it happens:** Next.js App Router caches Server Component renders. After a DB mutation, the old render is stale unless explicitly revalidated.
**How to avoid:** Every Server Action that mutates data affecting a public page must call `revalidatePath` for both the admin route AND the public route:
```typescript
revalidatePath('/admin/itens-banidos')
revalidatePath('/itens-banidos')
```
**Warning signs:** Admin makes changes, refreshes public page, sees old data.

### Pitfall 4: `arenaPlayers.banned` Filter Missing From Public Leaderboard
**What goes wrong:** After banning a player in the admin panel, they still appear on the public leaderboard.
**Why it happens:** The existing `getLeaderboard()` query in `src/lib/db/queries/leaderboard.ts` has no `banned` filter because the column didn't exist.
**How to avoid:** After adding `banned` column to `arenaPlayers` in schema, run migration, then update `getLeaderboard()` and `getTop10Wins()` to add `.where(eq(arenaPlayers.banned, 0))` to all public queries.
**Warning signs:** Banned players still visible on `/ranking`.

### Pitfall 5: Section Permission Check Is Async But Used in Sync Contexts
**What goes wrong:** `hasPermission()` is called as if it were synchronous in a component, causing unhandled promise or type error.
**Why it happens:** The permission check requires a DB call (async), but developers may try to use it in a way that expects a boolean.
**How to avoid:** Always `await hasPermission(session, section)` in Server Components or Server Actions. For the sidebar link visibility (client-side), pass a pre-fetched `adminSections: string[]` prop from the server layout rather than calling the check again client-side.

### Pitfall 6: Drizzle Migration Not Run After Schema Change
**What goes wrong:** Code references `banned_items` or `servers` table, but the table doesn't exist in Neon — runtime DB error on first request.
**Why it happens:** Drizzle requires running `drizzle-kit generate` + `drizzle-kit migrate` (or `push`) to sync DB with schema changes.
**How to avoid:** Each plan wave that adds schema changes must run `npx drizzle-kit push` as a task step before implementing queries/actions that depend on new tables.

---

## Code Examples

### Adding `discordId` to Session Type
```typescript
// src/types/next-auth.d.ts (create if not exists)
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      discordId: string | null
    } & DefaultSession["user"]
  }
}
```

### Server Action with Audit Log Pattern
```typescript
// Canonical pattern for all admin mutations
'use server'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/admin/permissions'
import { db } from '@/lib/db'
import { bannedItems, adminAuditLog } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'

export async function createBannedItem(data: { name: string; reason: string; category: string }) {
  const session = await auth()
  if (!(await hasPermission(session, 'itens-banidos'))) throw new Error('Forbidden')

  const [newItem] = await db.insert(bannedItems).values(data).returning()

  await db.insert(adminAuditLog).values({
    discordId: session!.user!.discordId!,
    discordName: session!.user!.name ?? null,
    action: 'CREATE_BANNED_ITEM',
    targetId: String(newItem.id),
    metadata: { name: data.name },
  })

  revalidatePath('/admin/itens-banidos')
  revalidatePath('/itens-banidos')
  return newItem
}
```

### Seeding from Static Data (banned items)
```typescript
// scripts/seed-admin-data.ts
import { db } from '@/lib/db'
import { bannedItems, servers, shopItems } from '@/lib/db/schema'
import { BANNED_ITEMS } from '@/data/banned-items'
import { SERVERS } from '@/data/servers'

async function seed() {
  // Idempotent: only seed if table is empty
  const existingBanned = await db.select().from(bannedItems).limit(1)
  if (existingBanned.length === 0) {
    await db.insert(bannedItems).values(BANNED_ITEMS)
    console.log('Seeded banned_items')
  }

  const existingServers = await db.select().from(servers).limit(1)
  if (existingServers.length === 0) {
    await db.insert(servers).values(SERVERS)
    console.log('Seeded servers')
  }
}

seed().catch(console.error)
```

### Dashboard Stats Query
```typescript
// src/lib/db/queries/admin.ts
import { db } from '@/lib/db'
import { arenaPlayers, arenaMatches, bannedItems, servers } from '@/lib/db/schema'
import { count, gte, sql } from 'drizzle-orm'

export async function getDashboardStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayEpoch = Math.floor(today.getTime() / 1000)

  const [players] = await db.select({ total: count() }).from(arenaPlayers)
  const [matchesToday] = await db.select({ total: count() }).from(arenaMatches)
    .where(gte(arenaMatches.startedAt, todayEpoch))
  const [bannedCount] = await db.select({ total: count() }).from(bannedItems)
  const [serverCount] = await db.select({ total: count() }).from(servers)

  return {
    totalPlayers: players.total,
    matchesToday: matchesToday.total,
    totalBannedItems: bannedCount.total,
    totalServers: serverCount.total,
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact for Phase 4 |
|--------------|------------------|--------------------|
| API routes for mutations (`route.ts`) | Server Actions (`'use server'`) | Use Server Actions — simpler, already the project pattern |
| `getServerSideProps` | `async` Server Components + `auth()` | All admin pages are Server Components |
| Manual DB migrations | `drizzle-kit push` for dev | Use `npx drizzle-kit push` after schema changes |
| Hardcoded static data | DB-backed tables with admin CRUD | Phase 4 goal — migration from static to dynamic |

---

## Open Questions

1. **How should the `loja` public page change after adding DB-backed shop items?**
   - What we know: Currently it has 3 hardcoded category cards (Cosméticos, Ranks & VIP, Itens do Servidor) with icons/colors defined in the component. The `shop_items` table stores name/description/category.
   - What's unclear: Should the existing visual category cards be replaced by DB rows, or should the DB rows be an additional "featured items" section below the existing category overview?
   - Recommendation: Keep the existing category card visual as-is (it's a teaser, not a real catalog) and add a DB-backed "preview items" section below. This requires no breaking change to the existing loja page design.

2. **Does the `servers` table `id` field remain a text slug or become an integer?**
   - What we know: Static data uses slugs like `'pokebrawl'`. The server cards reference `server.id` for keying and for banner image paths.
   - What's unclear: Admin creating a new server would need to manually provide a slug, which is error-prone.
   - Recommendation: Keep text slug as PK for the servers table (matches the existing data shape and avoids changing the banner path convention), but add validation in the Server Action to auto-generate slugs from the name.

3. **Is `req.auth.user.discordId` available in middleware with Auth.js v5 beta?**
   - What we know: Auth.js v5 exposes `req.auth` in the middleware handler. The `session` callback controls what's in `req.auth.user`.
   - What's unclear: Whether the session callback runs before middleware in all cases with the beta version.
   - Recommendation: Test this during Wave 1 (schema + auth extension). If `discordId` is not available in `req.auth`, fall back to looking up by `req.auth.user.id` against the env var list — this requires a DB call but could be done via the neon-http fetch API directly without importing the full drizzle setup.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

Phase 4 introduces new admin requirements (ADMIN-XX). These are internal requirements derived from CONTEXT.md locked decisions:

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADMIN-01 | `isAdmin()` returns true for env var match | unit | `npx vitest run tests/admin-permissions.test.ts -t "isAdmin"` | ❌ Wave 0 |
| ADMIN-02 | `isSuperAdmin()` returns true only for SUPER_ADMIN_DISCORD_ID | unit | `npx vitest run tests/admin-permissions.test.ts -t "isSuperAdmin"` | ❌ Wave 0 |
| ADMIN-03 | Admin layout redirects non-admin to /403 | unit | `npx vitest run tests/admin-layout.test.tsx` | ❌ Wave 0 |
| ADMIN-04 | Navbar shows Admin link only when isAdmin | unit | `npx vitest run tests/navbar.test.tsx -t "Admin link"` | ❌ (add to existing) |
| ADMIN-05 | Server Action `createBannedItem` rejects non-admin | unit | `npx vitest run tests/admin-actions.test.ts -t "createBannedItem forbidden"` | ❌ Wave 0 |
| ADMIN-06 | Dashboard stats query returns expected shape | unit | `npx vitest run tests/admin-queries.test.ts` | ❌ Wave 0 |
| ADMIN-07 | Public `/itens-banidos` reads from DB (mock) | unit | `npx vitest run tests/banned-items.test.tsx` (extend existing) | extend existing |
| ADMIN-08 | Ban player sets `banned=1` on arena_players | unit | `npx vitest run tests/admin-actions.test.ts -t "banPlayer"` | ❌ Wave 0 |
| ADMIN-09 | Public leaderboard excludes banned players | unit | `npx vitest run tests/ranking.test.tsx` (extend existing) | extend existing |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/admin-permissions.test.ts tests/admin-actions.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/admin-permissions.test.ts` — covers ADMIN-01, ADMIN-02
- [ ] `tests/admin-layout.test.tsx` — covers ADMIN-03
- [ ] `tests/admin-actions.test.ts` — covers ADMIN-05, ADMIN-08
- [ ] `tests/admin-queries.test.ts` — covers ADMIN-06
- [ ] Extend `tests/navbar.test.tsx` — covers ADMIN-04
- [ ] Extend `tests/banned-items.test.tsx` — covers ADMIN-07
- [ ] Extend `tests/ranking.test.tsx` — covers ADMIN-09

---

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis: `src/lib/db/schema.ts`, `middleware.ts`, `src/lib/auth.ts`, `src/data/banned-items.ts`, `src/data/servers.ts` — direct source code inspection
- `src/app/(public)/itens-banidos/page.tsx`, `/servidores/page.tsx`, `/loja/page.tsx` — migration targets
- `src/components/layout/Navbar.tsx` — integration point for Admin link
- `.planning/phases/04-painel-admin/04-CONTEXT.md` — locked decisions

### Secondary (MEDIUM confidence)
- Next.js 15/16 App Router patterns: Server Actions, route groups, revalidatePath — established Next.js docs patterns applied to this codebase
- Auth.js v5 beta session callback pattern — derived from existing `src/lib/auth.ts` implementation

### Tertiary (LOW confidence)
- Exact behavior of `req.auth.user` fields in Auth.js v5 beta middleware — needs runtime verification (Open Question 3)

---

## Metadata

**Confidence breakdown:**
- Schema design: HIGH — derived directly from existing schema patterns and CONTEXT.md decisions
- Access control pattern: HIGH — env var + DB permissions is standard, no external dependencies
- Server Actions pattern: HIGH — established pattern in this Next.js version
- Middleware extension: MEDIUM — Auth.js v5 beta session shape in middleware needs runtime verification
- shadcn component additions: HIGH — standard shadcn CLI installation

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable stack — Next.js 16, Drizzle ORM, Auth.js v5 beta; re-verify if auth dependency bumped)
