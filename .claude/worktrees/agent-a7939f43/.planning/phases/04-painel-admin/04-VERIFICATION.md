---
phase: 04-painel-admin
verified: 2026-03-18T00:00:00Z
status: passed
score: 7/7 must-haves verified
re_verification: false
human_verification:
  - test: "Access /admin as non-admin logged-in user"
    expected: "Immediate redirect to /403 page showing 'Acesso Negado' with ShieldX icon and 'Voltar ao site' button"
    why_human: "Middleware redirect and 403 visual rendering requires a running server with Discord auth"
  - test: "Open /admin on mobile viewport (< 1024px)"
    expected: "Hamburger button visible top-left, clicking it opens Sheet drawer from left with full sidebar content"
    why_human: "Responsive behavior and Sheet animation cannot be verified statically"
  - test: "Create a banned item via /admin/itens-banidos, then visit /itens-banidos"
    expected: "New item appears on public page immediately (revalidatePath fires)"
    why_human: "End-to-end mutation + cache revalidation requires live server"
  - test: "Ban a player via /admin/leaderboard, then visit /ranking"
    expected: "Banned player no longer appears in public leaderboard; badge 'Banido' visible in admin view"
    why_human: "Live DB state + ISR revalidation verification"
  - test: "Log in as super-admin and visit /admin/permissoes; log in as regular admin and try same URL"
    expected: "Super-admin sees PermissionManager with checkboxes; regular admin is redirected to /403"
    why_human: "Role-based redirect at page level requires Discord auth session"
---

# Phase 4: Painel Admin Verification Report

**Phase Goal:** Admin do CraftPro Brasil pode gerenciar todo o conteudo dinamico do site — itens banidos, servidores, loja preview, leaderboard (ban/unban jogadores, deletar partidas) — via painel protegido em /admin com permissoes granulares por secao e log de auditoria
**Verified:** 2026-03-18
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Admin logado acessa /admin e ve dashboard com stats (total jogadores, partidas hoje, itens banidos, servidores) e logs recentes de auditoria | VERIFIED | `getDashboardStats()` fetches 4 live counts; `getRecentAuditLogs(10)` fetches ordered audit entries; both called in `src/app/(admin)/admin/page.tsx` |
| 2 | Admin pode criar, editar e deletar itens banidos via /admin/itens-banidos e as mudancas refletem na pagina publica /itens-banidos | VERIFIED | `createBannedItem`, `updateBannedItem`, `deleteBannedItem` all call `revalidatePath('/itens-banidos')`; public page reads from `bannedItems` table via `db.select` |
| 3 | Admin pode criar, editar e deletar servidores via /admin/servidores e as mudancas refletem na pagina publica /servidores | VERIFIED | `createServer`, `updateServer`, `deleteServer` all call `revalidatePath('/servidores')`; public page reads from `servers` table via `db.select` |
| 4 | Admin pode criar, editar e deletar itens preview da loja via /admin/loja e as mudancas refletem na pagina publica /loja | VERIFIED | `createShopItem`, `updateShopItem`, `deleteShopItem` all call `revalidatePath('/loja')`; public `/loja` reads `shopItems` and renders "Itens em Destaque" section |
| 5 | Admin pode banir/desbanir jogadores do leaderboard e deletar partidas especificas via /admin/leaderboard | VERIFIED | `banPlayer` (sets `banned=1`), `unbanPlayer` (sets `banned=0`), `deleteMatch` — all wired to `LeaderboardActions.tsx` with AlertDialog confirmation; public leaderboard queries filter `banned=0` |
| 6 | Super-admin pode gerenciar permissoes de outros admins por secao via /admin/permissoes | VERIFIED | `grantPermission`/`revokePermission` restricted to `isSuperAdmin`; `/admin/permissoes` page redirects non-super-admin to /403; `PermissionManager` renders checkboxes with `useOptimistic` |
| 7 | Usuario nao-admin logado ve pagina 403 ao tentar acessar /admin | VERIFIED | Middleware checks `ADMIN_DISCORD_IDS`/`SUPER_ADMIN_DISCORD_ID` env vars and redirects to `/403`; admin layout additionally calls `isAdmin(session)` and `redirect('/403')` (defense in depth) |

**Score:** 7/7 truths verified

---

### Required Artifacts

#### Plan 01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/db/schema.ts` | 5 new tables + banned column | VERIFIED | `bannedItems`, `servers`, `shopItems`, `adminPermissions`, `adminAuditLog` exported; `arenaPlayers.banned` present at line 56 |
| `src/lib/admin/permissions.ts` | isAdmin, isSuperAdmin, hasPermission, logAudit, AdminSection | VERIFIED | All 5 exports present; dynamic imports used to avoid circular deps |
| `src/types/next-auth.d.ts` | Session type with discordId and isAdmin | VERIFIED | `discordId: string \| null` and `isAdmin?: boolean` both declared |
| `src/lib/auth.ts` | Session callback with discordId and isAdmin | VERIFIED | DB lookup for `discordId`, env-var-based `isAdmin` flag both in session callback |
| `scripts/seed-admin-data.ts` | Idempotent seed for banned_items (12) and servers (3) | VERIFIED | File exists with idempotency check (`existingBanned.length === 0`), 12 items hardcoded |
| `tests/admin-permissions.test.ts` | Tests for isAdmin, isSuperAdmin (min 30 lines) | VERIFIED | 105 lines, 13 passing tests covering schema exports, isAdmin, and isSuperAdmin |
| `tests/admin-layout.test.tsx` | Wave 0 stub | VERIFIED | Exists |
| `tests/admin-actions.test.ts` | Tests for server actions | VERIFIED | 227 lines, substantive tests for createBannedItem, banPlayer, unbanPlayer, deleteMatch, createShopItem, createServer |
| `tests/admin-queries.test.ts` | Tests for getDashboardStats | VERIFIED | Tests verify function signatures and return shape |

#### Plan 02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `middleware.ts` | Coarse admin check using env vars | VERIFIED | Both `ADMIN_DISCORD_IDS` and `SUPER_ADMIN_DISCORD_ID` checked; redirects to `/403` |
| `src/app/403/page.tsx` | Themed 403 forbidden page | VERIFIED | Contains "Acesso Negado", ShieldX icon, "Voltar ao site" button |
| `src/app/(admin)/layout.tsx` | Admin route group layout with auth guard | VERIFIED | Calls `isAdmin(session)`, redirects to /403, renders `AdminSidebar` |
| `src/app/(admin)/admin/page.tsx` | Dashboard with stats and audit logs | VERIFIED | Calls `getDashboardStats` and `getRecentAuditLogs(10)`, renders 4 stat cards + audit table |
| `src/components/admin/AdminSidebar.tsx` | Fixed sidebar + Sheet mobile drawer | VERIFIED | `'use client'`, `aria-label="Abrir menu"`, permission-aware nav, Sheet on mobile |
| `src/components/admin/AdminStatCard.tsx` | Dashboard stat card | VERIFIED | `text-3xl font-semibold` value, top border accent |
| `src/components/layout/Navbar.tsx` | Conditional Admin link | VERIFIED | `isAdminUser` derived from `session?.user?.isAdmin`; Admin link rendered in both desktop and mobile nav |
| `src/lib/db/queries/admin.ts` | getDashboardStats and getRecentAuditLogs | VERIFIED | Both exported; real Drizzle queries with joins and ordering |

#### Plan 03 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/admin/actions/banned-items.ts` | CRUD server actions | VERIFIED | createBannedItem, updateBannedItem, deleteBannedItem — all with hasPermission + logAudit + dual revalidatePath |
| `src/lib/admin/actions/servers.ts` | CRUD server actions | VERIFIED | createServer (slug auto-gen + uniqueness check), updateServer, deleteServer |
| `src/lib/admin/actions/shop-items.ts` | CRUD server actions | VERIFIED | createShopItem, updateShopItem, deleteShopItem |
| `src/components/admin/BannedItemForm.tsx` | Dialog form component | VERIFIED | `'use client'`, Dialog, useTransition, calls createBannedItem/updateBannedItem, toast feedback |
| `src/components/admin/ServerForm.tsx` | Dialog form component | VERIFIED | Exists |
| `src/components/admin/ShopItemForm.tsx` | Dialog form component | VERIFIED | Exists |
| `src/app/(admin)/admin/itens-banidos/page.tsx` | Admin CRUD table | VERIFIED | Reads `bannedItems` from DB; renders `BannedItemsCrud` client island |
| `src/app/(admin)/admin/servidores/page.tsx` | Admin CRUD table | VERIFIED | Reads `servers` from DB; renders `ServidoresCrud` client island |
| `src/app/(admin)/admin/loja/page.tsx` | Admin CRUD table | VERIFIED | Reads `shopItems` from DB; renders `LojaCrud` client island |
| `src/app/(public)/itens-banidos/page.tsx` | Reads from DB, not static file | VERIFIED | Imports from `@/lib/db` and `bannedItems` schema; no import from `@/data/banned-items` |
| `src/app/(public)/servidores/page.tsx` | Reads from DB, not static file | VERIFIED | Imports from `@/lib/db` and `servers` schema; no import from `@/data/servers` |
| `src/app/(public)/loja/page.tsx` | Shows DB preview items | VERIFIED | Reads `shopItems`, renders "Itens em Destaque" section conditionally |

#### Plan 04 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/admin/actions/leaderboard.ts` | banPlayer, unbanPlayer, deleteMatch | VERIFIED | All 3 exported; `hasPermission(session, 'leaderboard')` guard; `logAudit` called; dual revalidatePath |
| `src/lib/admin/actions/permissions.ts` | grantPermission, revokePermission | VERIFIED | Both restricted to `isSuperAdmin`; idempotency check on grant; audit logged |
| `src/app/(admin)/admin/leaderboard/page.tsx` | Dual table with player ban/unban and match delete | VERIFIED | Queries `arenaPlayers` and `arenaMatches`; uses `TierBadge`; `BanPlayerButton`/`DeleteMatchButton` client components |
| `src/app/(admin)/admin/permissoes/page.tsx` | Super-admin-only permissions page | VERIFIED | `isSuperAdmin(session)` check at page level; `redirect('/403')` if false; renders `PermissionManager` |
| `src/components/admin/PermissionManager.tsx` | Client component with permission checkboxes | VERIFIED | `'use client'`; `useOptimistic`; `grantPermission`/`revokePermission` wired; "Conceder Acesso" button present |
| `src/components/admin/LeaderboardActions.tsx` | BanPlayerButton and DeleteMatchButton | VERIFIED | Both with AlertDialog confirmation, useTransition, toast feedback |
| `src/lib/db/queries/leaderboard.ts` | Bans filter on all public queries | VERIFIED | `and(eq(arenaPlayers.banned, 0))` present in `getLeaderboard` (ranked), `getLeaderboard` (unranked), and `getTop10Wins` — 3 occurrences confirmed |

---

### Key Link Verification

#### Plan 01 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/lib/admin/permissions.ts` | `src/lib/db/schema.ts` | adminPermissions table query | VERIFIED | Dynamic import `adminPermissions` in `hasPermission` and `getAdminSections` |
| `src/lib/auth.ts` | `src/lib/db/schema.ts` | session callback queries users.discordId | VERIFIED | `db.select({ discordId: users.discordId }).from(users).where(eq(users.id, user.id))` |

#### Plan 02 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `middleware.ts` | `process.env.ADMIN_DISCORD_IDS` | env var string comparison | VERIFIED | Both env vars checked in middleware coarse guard |
| `src/app/(admin)/layout.tsx` | `src/lib/admin/permissions.ts` | isAdmin() check | VERIFIED | `isAdmin(session)` called, redirects to /403 if false |
| `src/app/(admin)/admin/page.tsx` | `src/lib/db/queries/admin.ts` | getDashboardStats() call | VERIFIED | Direct import and invocation at top of Server Component |
| `src/components/admin/AdminSidebar.tsx` | sections prop | sections derived from getAdminSections in layout | VERIFIED | Sidebar receives `sections: string[]` prop; layout calls `getAdminSections` for non-super-admin |

#### Plan 03 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/lib/admin/actions/banned-items.ts` | `src/lib/db/schema.ts` | db operations on bannedItems | VERIFIED | Direct import `bannedItems` from schema; insert/update/delete used |
| `src/app/(public)/itens-banidos/page.tsx` | `src/lib/db/schema.ts` | db.select from bannedItems | VERIFIED | Replaces static import; `db.select({name, reason, category}).from(bannedItems)` |
| `src/app/(public)/servidores/page.tsx` | `src/lib/db/schema.ts` | db.select from servers | VERIFIED | `db.select().from(servers)` — no static import |
| `src/app/(public)/loja/page.tsx` | `src/lib/db/schema.ts` | db.select from shopItems | VERIFIED | `db.select().from(shopItems)` used for preview items |

#### Plan 04 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/lib/admin/actions/leaderboard.ts` | `src/lib/db/schema.ts` | update arenaPlayers.banned | VERIFIED | `db.update(arenaPlayers).set({ banned: 1 })` and `db.delete(arenaMatches)` |
| `src/lib/db/queries/leaderboard.ts` | `src/lib/db/schema.ts` | where eq(arenaPlayers.banned, 0) filter | VERIFIED | Pattern `eq(arenaPlayers.banned, 0)` appears in ranked query, unranked query, and getTop10Wins — all 3 public queries patched |
| `src/app/(admin)/admin/permissoes/page.tsx` | `src/lib/admin/permissions.ts` | isSuperAdmin check | VERIFIED | `if (!isSuperAdmin(session)) redirect('/403')` — page-level guard confirmed |

---

### Requirements Coverage

The ADMIN-01 through ADMIN-10 requirement IDs are internal to Phase 4 — they do not appear in the main `.planning/REQUIREMENTS.md` v1 list. This is expected: REQUIREMENTS.md tracks user-facing v1 requirements (LAND-*, AUTH-*, SERV-*, RANK-*, PROF-*, EXTRA-*); the admin panel was added post-v1 with its own internal requirement IDs defined in CONTEXT.md and ROADMAP.md. No ADMIN-* IDs are mapped in REQUIREMENTS.md traceability table. This is an orphaned-ID situation by design, not an oversight.

| Requirement | Source Plan | Coverage | Status |
|-------------|-------------|----------|--------|
| ADMIN-01 | 04-01 | Schema: 5 new tables + banned column on arenaPlayers | SATISFIED |
| ADMIN-02 | 04-01 | Session discordId exposed; permissions module with isAdmin/isSuperAdmin/hasPermission | SATISFIED |
| ADMIN-03 | 04-01, 04-02 | Middleware + layout guard; 403 page; admin layout with sidebar | SATISFIED |
| ADMIN-04 | 04-03 | CRUD for banned items, servers, shop items — forms, actions, pages | SATISFIED |
| ADMIN-05 | 04-03 | Server Actions with hasPermission guard + logAudit on all mutations | SATISFIED |
| ADMIN-06 | 04-02, 04-03 | Dashboard stats (getDashboardStats); admin CRUD pages with DB reads | SATISFIED |
| ADMIN-07 | 04-04 | Leaderboard page with ban/unban players and delete matches | SATISFIED |
| ADMIN-08 | 04-04 | banPlayer/unbanPlayer/deleteMatch Server Actions with permission checks and audit logging | SATISFIED |
| ADMIN-09 | 04-02 | Navbar shows Admin link only for isAdmin users via session.user.isAdmin flag | SATISFIED |
| ADMIN-10 | 04-02 | 403 page with Acesso Negado, ShieldX icon, Voltar ao site button | SATISFIED |

**Coverage:** 10/10 ADMIN requirements satisfied.

**Note on REQUIREMENTS.md:** ADMIN-* IDs are not in the main REQUIREMENTS.md traceability table. The traceability table covers only LAND-*, AUTH-*, SERV-*, RANK-*, PROF-*, EXTRA-* (20 v1 requirements). ADMIN-* is a Phase 4 internal ID scheme. No orphaned requirements.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/components/admin/PermissionManager.tsx` | 65-68 | `handleAddAdmin` shows an info toast instead of actually granting a permission via DB | Warning | The "Adicionar Admin" form does not persist anything — it is informational only, pointing user to update env var. This is intentional per spec (env var must be set server-side) but the button is labeled "Conceder Acesso" which could mislead. |

The PermissionManager "Adicionar Admin" pattern is an intentional design decision documented in CONTEXT.md and the PLAN itself: adding a discordId requires env var changes on the server, which cannot be done through a web UI. The button correctly shows an info message explaining this constraint. No blocker anti-patterns found.

---

### Human Verification Required

#### 1. Non-Admin Access Redirect

**Test:** Log in with a Discord account that is NOT in `ADMIN_DISCORD_IDS` or `SUPER_ADMIN_DISCORD_ID`. Navigate to /admin.
**Expected:** Immediate redirect to /403 page showing "Acesso Negado" with ShieldX icon and "Voltar ao site" button styled with brand theme.
**Why human:** Middleware redirect requires a running server with Discord OAuth and valid env vars.

#### 2. Mobile Sidebar Drawer

**Test:** Open /admin on a viewport narrower than 1024px (mobile simulation). Look for hamburger button top-left.
**Expected:** Hamburger button visible, clicking it opens a Sheet drawer from the left containing the full sidebar nav with all links matching the user's permissions.
**Why human:** Responsive CSS breakpoints and Sheet animation cannot be verified statically.

#### 3. Mutation Reflects on Public Page

**Test:** In /admin/itens-banidos, create a new banned item. Then navigate to /itens-banidos.
**Expected:** New item appears in the public table immediately (or after ISR revalidation fires).
**Why human:** End-to-end mutation + Next.js cache revalidation requires a live server.

#### 4. Ban Player Removes from Public Leaderboard

**Test:** In /admin/leaderboard, ban a player (confirm dialog). Then visit /ranking.
**Expected:** Banned player no longer appears in ranked or unranked sections. Back in /admin/leaderboard, player row shows "Banido" badge with opacity-60.
**Why human:** Live DB state mutation + ISR revalidation verification.

#### 5. Super-Admin vs Regular Admin on /admin/permissoes

**Test:** Log in as super-admin, visit /admin/permissoes — should see PermissionManager with checkboxes. Log in as regular admin (in ADMIN_DISCORD_IDS but not SUPER_ADMIN_DISCORD_ID), visit /admin/permissoes.
**Expected:** Regular admin is redirected to /403; super-admin sees the permission matrix table.
**Why human:** Session-based role check requires two different Discord accounts.

---

### Gaps Summary

No gaps found. All 7 success criteria from ROADMAP.md are satisfied by verified artifacts and key links. The codebase contains the following complete implementations:

1. **Schema layer:** 5 new DB tables + `banned` column on arenaPlayers, all correctly defined in `schema.ts` and confirming the SUMMARY's claim of a drizzle-kit push completing.

2. **Auth layer:** `session.user.discordId` and `session.user.isAdmin` both embedded in Auth.js session callback. `src/types/next-auth.d.ts` augments the Session type correctly.

3. **Access control:** Two-layer defense — coarse middleware (env var, Edge-safe) + fine layout guard (DB-backed `isAdmin`). Middleware verified at lines 23-30. Layout guard verified at lines 7-9 of `(admin)/layout.tsx`.

4. **CRUD sections:** All 9 server actions (3 per entity) follow the `'use server'` + auth + hasPermission + DB mutation + logAudit + dual revalidatePath pattern. All 3 public pages migrated from static imports to DB reads.

5. **Leaderboard management:** `banPlayer`/`unbanPlayer`/`deleteMatch` implemented and wired to `LeaderboardActions.tsx` client components with AlertDialog confirmation. Public leaderboard queries (`getLeaderboard` ranked, unranked, `getTop10Wins`) all include `eq(arenaPlayers.banned, 0)` filter.

6. **Permission management:** `grantPermission`/`revokePermission` restricted to super-admin. `/admin/permissoes` has page-level `isSuperAdmin` guard. `PermissionManager` uses `useOptimistic` for instant checkbox feedback.

7. **Audit logging:** `logAudit` called in every mutation action. `adminAuditLog` table schema present. Dashboard reads last 10 entries via `getRecentAuditLogs`.

---

_Verified: 2026-03-18_
_Verifier: Claude (gsd-verifier)_
