# Phase 2: Autenticação - Research

**Researched:** 2026-03-18
**Domain:** Discord OAuth2 authentication — Auth.js v5, Drizzle adapter, Next.js 16 proxy-based route protection
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Botão "Entrar com Discord" no canto direito da navbar
- Login via redirect full — redireciona pro Discord, autoriza, volta pro site logado
- Substitui o botão de login pelo avatar quando logado
- Avatar redondo do Discord no canto direito da navbar
- Clica no avatar e abre dropdown com: "Perfil" (link) e "Sair" (ação)
- Dropdown fecha ao clicar fora
- Visitante não logado que tenta acessar /perfil é redirecionado automaticamente pro login Discord
- Após login, retorna pra página que tentou acessar originalmente
- Middleware preparado pra proteger /perfil e rotas futuras (/admin, etc.)

### Claude's Discretion
- Loading state durante o processo de login/redirect
- Design exato do dropdown do avatar (cores, sombras, animação)
- Tratamento de erros de OAuth (token expirado, usuário cancela)
- Refresh token rotation handling (pitfall identificado na pesquisa)
- Schema da tabela de usuários no Drizzle (campos além do discordId)

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | Usuário pode fazer login via Discord OAuth2 | Auth.js v5 Discord provider + DrizzleAdapter — full OAuth2 redirect flow verified |
| AUTH-02 | Sessão persiste entre refreshes do navegador | Auth.js database sessions via Drizzle adapter — sessions table in PostgreSQL, cookie-based session ID |
| AUTH-03 | Usuário pode fazer logout de qualquer página | `signOut()` Server Action callable from any Client Component — Navbar dropdown "Sair" button |
</phase_requirements>

---

## Summary

This phase adds Discord OAuth2 login to the existing Next.js 16 project. Auth.js v5 (`next-auth@beta`) with the Discord provider and `@auth/drizzle-adapter` is the correct stack — it is the same stack already locked in the project decisions and confirmed against official Auth.js docs. The Drizzle adapter persists sessions to PostgreSQL (Neon), satisfying AUTH-02. The `signOut()` function from Auth.js works as a Server Action callable from any Client Component, satisfying AUTH-03.

The biggest structural challenge is that this project has **no database yet**. Phase 2 must bootstrap: Neon PostgreSQL connection, Drizzle ORM config, Drizzle Kit migrations, and the Auth.js schema tables — before any auth logic can run. This is Wave 0 work, not optional.

Next.js 16 renamed `middleware.ts` to `proxy.ts` and `middleware` export to `proxy`. Auth.js v5's protecting docs show both patterns — the correct file for this project is `proxy.ts` at the root with `export { auth as proxy }` plus a matcher config.

**Primary recommendation:** Bootstrap DB (Neon + Drizzle) in Wave 0, then layer Auth.js config, then Navbar UI integration, then proxy protection.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-auth | 4.24.13 (beta) | Auth.js v5 — Discord OAuth2, session management | Official Auth.js package; only option compatible with Next.js 16 App Router; handles CSRF, token rotation, session cookies |
| @auth/drizzle-adapter | 1.11.1 | Persists Auth.js sessions/accounts/users to Drizzle DB | Required for AUTH-02 (persistent sessions); official adapter from Auth.js team |
| drizzle-orm | 0.45.1 | Type-safe DB queries for auth schema + future phases | Already decided in project stack; same package used by adapter |
| drizzle-kit | 0.26.x | Schema migrations | Generates SQL from Drizzle TypeScript schema |
| @neondatabase/serverless | latest | Neon PostgreSQL driver | Serverless-compatible; no cold-start issues on Vercel; already in project stack decisions |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/image | (built-in) | Render Discord avatar with optimization | Required — Discord CDN domain must be added to next.config.ts |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @auth/drizzle-adapter | JWT-only sessions | JWT sessions don't require a DB but can't be server-side revoked; logout is unreliable across tabs |
| Database sessions | Cookie-only JWT | Database sessions allow true logout (delete session row); required for correct AUTH-03 |

**Installation (new packages only — drizzle-orm already in project):**
```bash
npm install next-auth@beta @auth/drizzle-adapter @neondatabase/serverless
npm install -D drizzle-kit
```

**Version verification (confirmed 2026-03-18):**
- `next-auth`: 4.24.13 (beta channel — this is Auth.js v5)
- `@auth/drizzle-adapter`: 1.11.1
- `drizzle-orm`: 0.45.1

---

## Architecture Patterns

### Recommended Project Structure (additions to existing src/)
```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # Auth.js route handler
│   ├── layout.tsx                    # ADD: wrap children in <Providers>
│   └── (public)/
│       └── login/                    # Optional: /login page (or use built-in)
├── components/
│   ├── layout/
│   │   └── Navbar.tsx                # MODIFY: add login button / avatar dropdown
│   └── auth/
│       └── AvatarDropdown.tsx        # NEW: Client Component, useSession
├── lib/
│   ├── auth.ts                       # NEW: NextAuth config (Discord provider + DrizzleAdapter)
│   ├── db/
│   │   ├── index.ts                  # NEW: Neon client + Drizzle instance
│   │   └── schema.ts                 # NEW: Auth tables + users extension
│   └── providers.tsx                 # NEW: SessionProvider wrapper ('use client')
├── types/
│   └── index.ts                      # MODIFY: add User type with discordId
proxy.ts                              # NEW: Route protection (Next.js 16 pattern)
drizzle.config.ts                     # NEW: Drizzle Kit config
.env.local                            # NEW: AUTH_DISCORD_ID, AUTH_DISCORD_SECRET, DATABASE_URL, AUTH_SECRET
```

### Pattern 1: Auth.js v5 Config with Discord + Drizzle Adapter
**What:** Single `src/lib/auth.ts` exports `{ handlers, auth, signIn, signOut }`. Used everywhere — server components, route handlers, and proxy.
**When to use:** This is the only auth entry point; all other files import from here.

```typescript
// src/lib/auth.ts
// Source: https://authjs.dev/getting-started/providers/discord
import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID!,
      clientSecret: process.env.AUTH_DISCORD_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Expose discordId and internal id to session for future phases
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
})
```

### Pattern 2: Auth.js Route Handler
**What:** Delegates all `/api/auth/*` routes to Auth.js handlers.
**When to use:** Required; without this file, OAuth callbacks have nowhere to land.

```typescript
// src/app/api/auth/[...nextauth]/route.ts
// Source: https://authjs.dev/getting-started/installation?framework=Next.js
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

### Pattern 3: SessionProvider Wrapper
**What:** Client Component wrapper so `useSession()` works in any child Client Component.
**When to use:** Required to let Navbar.tsx (already 'use client') read session state.

```typescript
// src/lib/providers.tsx
'use client'
import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

Then in `src/app/layout.tsx`, wrap `<Navbar />` and `{children}` inside `<Providers>`.

### Pattern 4: Next.js 16 Proxy for Route Protection
**What:** `proxy.ts` at project root (renamed from middleware.ts in Next.js 16). Exports `auth as proxy`. Uses `authorized` callback to redirect unauthenticated users.
**When to use:** Protects /perfil, /admin, and any future auth-gated routes.

```typescript
// proxy.ts (project root — same level as package.json)
// Source: https://authjs.dev/getting-started/session-management/protecting
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/perfil") ||
    req.nextUrl.pathname.startsWith("/admin")

  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL("/api/auth/signin/discord", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

**IMPORTANT:** The proxy must not protect `/api/auth/*` — doing so causes an infinite redirect loop.

### Pattern 5: AvatarDropdown Client Component
**What:** Client Component that reads session via `useSession()`. Renders login button when logged out, avatar + dropdown when logged in.
**When to use:** This replaces the right side of Navbar.tsx. Navbar is already 'use client', so no boundary crossing is needed.

```typescript
// src/components/auth/AvatarDropdown.tsx
'use client'
import { useSession, signOut, signIn } from "next-auth/react"
import Image from "next/image"
// Use shadcn/ui DropdownMenu (same pattern as Sheet already in Navbar)

export function AvatarDropdown() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    // Loading state — show skeleton or disabled button
    return <div className="h-8 w-8 rounded-full bg-white/20 animate-pulse" />
  }

  if (!session) {
    return (
      <button onClick={() => signIn("discord")} className="...">
        Entrar com Discord
      </button>
    )
  }

  return (
    // DropdownMenu from shadcn/ui
    // Trigger: rounded avatar Image from session.user.image
    // Items: "Perfil" link to /perfil, "Sair" button that calls signOut()
  )
}
```

### Pattern 6: Drizzle Schema for Auth.js Tables
**What:** PostgreSQL table definitions required by `@auth/drizzle-adapter`. Must include Auth.js required tables plus project-specific `users` extension.
**When to use:** Wave 0 — must exist before running migrations or starting auth.

```typescript
// src/lib/db/schema.ts
import {
  pgTable, text, timestamp, integer, primaryKey
} from "drizzle-orm/pg-core"

// Auth.js required tables
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  // Project extension fields
  discordId: text("discordId").unique(), // Discord snowflake — FK for future phases
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
})

export const accounts = pgTable("accounts", {
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),   // CRITICAL: must be stored & rotated
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (account) => ({
  compoundKey: primaryKey({
    columns: [account.provider, account.providerAccountId],
  }),
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
```

### Pattern 7: Neon DB Connection
**What:** Serverless Neon client connected to Drizzle.
**When to use:** Single export from `src/lib/db/index.ts`, imported everywhere.

```typescript
// src/lib/db/index.ts
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

### Pattern 8: next.config.ts — Discord CDN Domain
**What:** Next.js Image must allow `cdn.discordapp.com` to render Discord avatars with `<Image>`.
**When to use:** Required; without this, `next/image` throws a domain error at runtime.

```typescript
// next.config.ts (add to images.remotePatterns)
images: {
  remotePatterns: [
    { protocol: "https", hostname: "cdn.discordapp.com" },
  ],
},
```

### Anti-Patterns to Avoid
- **Importing `next-auth` (v4 style) instead of `next-auth/react` for client hooks:** In Auth.js v5, client hooks (`useSession`, `signIn`, `signOut`) come from `next-auth/react`. Server-side `auth()` comes from your `@/lib/auth` export.
- **Putting `<SessionProvider>` directly in layout.tsx Server Component:** layout.tsx is a Server Component. Wrap it in a `providers.tsx` Client Component and import that instead.
- **Using `middleware.ts` instead of `proxy.ts`:** Next.js 16 renamed Middleware to Proxy. The file must be `proxy.ts` and the export must be named `proxy`.
- **Setting `matcher` to protect `/api/auth/*`:** This causes infinite redirects. Always exclude `/api/*` from the proxy matcher.
- **Calling `signIn()` from a Server Component:** `signIn` from `next-auth/react` is client-only. Server-side sign-in uses the imported `signIn` from `@/lib/auth` inside a Server Action.
- **Storing Discord username as the identity key:** Username is mutable. Always use `discordId` (snowflake) as the stable FK.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OAuth2 flow (redirect, state, code exchange) | Custom OAuth handler | Auth.js v5 Discord provider | CSRF state, PKCE, token exchange, redirect URI validation — all handled; missing any one is a security hole |
| Session cookies | Custom httpOnly cookie management | Auth.js database sessions via DrizzleAdapter | Secure cookie attributes, CSRF protection, session rotation — non-trivial to get right |
| Refresh token rotation | Manual token refresh logic | Auth.js + DrizzleAdapter accounts table | Auth.js stores and rotates the refresh_token column; custom code almost always reuses stale tokens (Pitfall 1) |
| Avatar dropdown close-on-outside-click | Custom event listener | shadcn/ui DropdownMenu | Already used in project (Sheet component); accessible, keyboard-navigable, focus trap handled |
| Route protection redirect logic | Custom fetch + redirect | Auth.js proxy pattern with `authorized` callback | Handles edge cases: loops, callbackUrl encoding, API route exclusions |

**Key insight:** OAuth2 is deceptively simple to start and catastrophically complex to secure. Auth.js exists precisely to absorb this complexity.

---

## Common Pitfalls

### Pitfall 1: Discord Refresh Token Rotation (CRITICAL)
**What goes wrong:** Discord issues a new refresh token on every refresh call. Reusing the old token after the first refresh returns `invalid_grant`, silently logging users out after ~7 days.
**Why it happens:** The Auth.js DrizzleAdapter stores `refresh_token` in the `accounts` table. If Auth.js handles the refresh automatically (it does for OAuth providers with database adapters), the rotation is handled. The risk is custom token refresh code that bypasses the adapter.
**How to avoid:** Do NOT write custom token refresh logic. Let Auth.js + DrizzleAdapter own the token lifecycle. The `accounts` table's `refresh_token` column gets overwritten automatically on each refresh.
**Warning signs:** Users randomly logged out after 7+ days; `invalid_grant` in server logs.

### Pitfall 2: middleware.ts vs proxy.ts (Next.js 16)
**What goes wrong:** Creating `middleware.ts` instead of `proxy.ts`. Next.js 16 silently ignores `middleware.ts` (or raises a deprecation warning), leaving routes unprotected.
**How to avoid:** Use `proxy.ts` at project root. Export named `proxy`, not `middleware`.

### Pitfall 3: OAuth CSRF State Parameter
**What goes wrong:** Missing or improperly validated `state` parameter in the OAuth callback enables account takeover.
**How to avoid:** Auth.js handles the state parameter automatically. Do not implement a custom OAuth callback — use Auth.js route handler exclusively (`src/app/api/auth/[...nextauth]/route.ts`).

### Pitfall 4: Infinite Redirect Loop in Proxy
**What goes wrong:** The proxy protects `/api/*` routes, including `/api/auth/callback/discord`. Discord callback triggers the proxy, which redirects to login, which triggers Discord callback, creating an infinite loop.
**How to avoid:** Always include `(?!api|...)` in the matcher regex to exclude all API routes.

### Pitfall 5: Discord Avatar 403 in next/image
**What goes wrong:** `<Image src={session.user.image} />` throws a build-time or runtime error because `cdn.discordapp.com` is not in the allowed domains list.
**How to avoid:** Add `cdn.discordapp.com` to `next.config.ts` `images.remotePatterns` before rendering any avatar.

### Pitfall 6: SessionProvider Boundary
**What goes wrong:** `useSession()` throws `"useSession must be wrapped in a <SessionProvider>"` because the Navbar is inside a layout that doesn't wrap `<SessionProvider>`.
**How to avoid:** Create `src/lib/providers.tsx` as a `'use client'` wrapper containing `<SessionProvider>`, import it in `layout.tsx`, wrap the Navbar and page content.

### Pitfall 7: Discord Developer Portal Callback URL
**What goes wrong:** OAuth fails with `redirect_uri_mismatch` because the Discord app's allowed redirect URIs don't include the local dev URL.
**How to avoid:** Add both:
- `http://localhost:3000/api/auth/callback/discord` (development)
- `https://craftprobrasil.com/api/auth/callback/discord` (production)
to the Discord app's "Redirects" list in the Developer Portal.

---

## Code Examples

### signIn() from Navbar Button (Client Component)
```typescript
// Source: https://authjs.dev/getting-started/providers/discord
import { signIn } from "next-auth/react"

<button onClick={() => signIn("discord", { callbackUrl: window.location.pathname })}>
  Entrar com Discord
</button>
```

### signOut() from Dropdown (Client Component)
```typescript
// Source: https://authjs.dev/getting-started/session-management/custom-pages
import { signOut } from "next-auth/react"

<button onClick={() => signOut({ callbackUrl: "/" })}>
  Sair
</button>
```

### Session Check in Server Component (future phases)
```typescript
// Source: https://authjs.dev/getting-started/session-management/get-session
import { auth } from "@/lib/auth"

export default async function PerfilPage() {
  const session = await auth()
  if (!session) redirect("/api/auth/signin/discord")
  return <ProfileContent user={session.user} />
}
```

### Discord Avatar URL Construction (when image is null)
```typescript
// Discord avatars are nullable (user may have no avatar set)
// Fallback: use Discord's default avatar endpoint
const avatarUrl = session.user.image
  ?? `https://cdn.discordapp.com/embed/avatars/${Number(session.user.discordId) % 5}.png`
```

### drizzle.config.ts
```typescript
// drizzle.config.ts (project root)
import type { Config } from "drizzle-kit"

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
```

### Environment Variables (.env.local)
```bash
# Auth.js v5 — auto-detected variable names (no NEXTAUTH_ prefix)
AUTH_SECRET="generate with: openssl rand -base64 32"
AUTH_DISCORD_ID="your-discord-client-id"
AUTH_DISCORD_SECRET="your-discord-client-secret"

# Neon PostgreSQL
DATABASE_URL="postgresql://user:pass@host.neon.tech/dbname?sslmode=require"
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` + export `middleware` | `proxy.ts` + export `proxy` | Next.js 16 | Must rename file and export; old file is silently ignored |
| `NEXTAUTH_*` env vars | `AUTH_*` env vars | Auth.js v5 | `AUTH_DISCORD_ID` and `AUTH_DISCORD_SECRET` are auto-detected |
| Wrapping `SessionProvider` in `_app.tsx` | Wrap in `providers.tsx` Client Component → import in `layout.tsx` | App Router | Required because layout.tsx is a Server Component |
| `import { signIn } from "next-auth/react"` for server | `import { signIn } from "@/lib/auth"` for server | Auth.js v5 | Two different `signIn` functions — client vs server |
| Prisma adapter (common in tutorials) | Drizzle adapter (`@auth/drizzle-adapter`) | Project decision | Drizzle is already the project ORM; no Prisma |

**Deprecated/outdated:**
- `next-auth` v4: Not compatible with Next.js 16 App Router patterns; do not use
- `NEXTAUTH_URL` env var: No longer required in Auth.js v5 (auto-detected from request)
- `pages` option in NextAuth config: App Router uses route handlers, not `pages/api/auth`

---

## Open Questions

1. **Does Next.js 16 have `proxy.ts` stable or still experimental?**
   - What we know: Multiple sources confirm Next.js 16 renamed middleware → proxy, matching the project's Next.js 16.2.0 version
   - What's unclear: Whether Auth.js v5 has an updated export specifically for proxy (vs `export { auth as middleware }`)
   - Recommendation: Use `export { auth as proxy }` pattern. If Auth.js complains, fall back to the manual wrapper pattern shown in Pattern 4.

2. **Neon database provisioning is a manual step**
   - What we know: The project uses Neon (per stack research); no `DATABASE_URL` exists yet
   - What's unclear: Whether the user has already created a Neon project
   - Recommendation: Wave 0 task must include instruction to create Neon project at neon.tech and copy the connection string to `.env.local`.

3. **discordId population via DrizzleAdapter**
   - What we know: Auth.js DrizzleAdapter handles `users` table but maps only the standard Auth.js fields (id, name, email, image). `discordId` is a project extension.
   - What's unclear: Whether Auth.js v5's signIn callback can reliably backfill `discordId` into the custom column on first login
   - Recommendation: Use `signIn` callback to upsert `discordId` from `profile.id` (Discord snowflake). Verified pattern from ARCHITECTURE.md. The `profile` object contains `id` (string) — store as `text("discordId")`.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.x + Testing Library React |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Login button renders when logged out | unit | `npx vitest run tests/auth.test.tsx -t "login button"` | ❌ Wave 0 |
| AUTH-01 | Calls `signIn("discord")` on click | unit | `npx vitest run tests/auth.test.tsx -t "signIn called"` | ❌ Wave 0 |
| AUTH-02 | Avatar renders when session exists | unit | `npx vitest run tests/auth.test.tsx -t "avatar shown"` | ❌ Wave 0 |
| AUTH-02 | Login button hidden when session exists | unit | `npx vitest run tests/auth.test.tsx -t "button hidden"` | ❌ Wave 0 |
| AUTH-03 | Dropdown "Sair" calls `signOut()` | unit | `npx vitest run tests/auth.test.tsx -t "signOut called"` | ❌ Wave 0 |
| AUTH-03 | Dropdown renders "Perfil" link | unit | `npx vitest run tests/auth.test.tsx -t "perfil link"` | ❌ Wave 0 |

**Note:** OAuth redirect flow (Discord → site → callback) is an integration test that cannot be automated in jsdom. It is verified manually during development.

### Mocking Strategy
Auth.js v5 functions must be mocked in test files:
```typescript
// tests/auth.test.tsx pattern
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))
```

### Sampling Rate
- **Per task commit:** `npx vitest run tests/auth.test.tsx`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/auth.test.tsx` — covers AUTH-01, AUTH-02, AUTH-03 (AvatarDropdown unit tests)
- [ ] `next-auth/react` mock added to `tests/setup.ts` or per-test vi.mock
- [ ] Neon DB provisioned (manual step, not automatable)
- [ ] `.env.local` populated with real Discord credentials and DATABASE_URL

---

## Sources

### Primary (HIGH confidence)
- [Auth.js Discord Provider docs](https://authjs.dev/getting-started/providers/discord) — env vars, callback URL, Discord app setup
- [Auth.js Drizzle Adapter docs](https://authjs.dev/getting-started/adapters/drizzle) — adapter config, required tables, DrizzleAdapter import
- [Auth.js Protecting routes docs](https://authjs.dev/getting-started/session-management/protecting) — proxy.ts pattern, authorized callback, matcher config
- [Auth.js Discord provider API reference](https://authjs.dev/reference/core/providers/discord) — DiscordProfile shape, available fields (id, username, avatar, global_name)
- npm registry — `next-auth@4.24.13`, `@auth/drizzle-adapter@1.11.1`, `drizzle-orm@0.45.1` (verified 2026-03-18)

### Secondary (MEDIUM confidence)
- [Next.js 16 proxy.ts docs](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) — middleware → proxy rename confirmed for Next.js 16
- [Auth.js migration to v5](https://authjs.dev/getting-started/migrating-to-v5) — env var naming, session API changes, App Router patterns
- Multiple community sources confirming SessionProvider wrapper pattern for App Router

### Tertiary (LOW confidence)
- Community blog posts on Auth.js v5 + Drizzle schema — schema column types cross-referenced with official adapter source; specific column names may vary from Auth.js version to version

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified against npm registry and official docs
- Architecture patterns: HIGH — Auth.js official docs, Next.js official docs
- Drizzle schema: MEDIUM-HIGH — pattern from official adapter docs; exact column types from community sources (official schema page didn't render fully)
- Proxy/middleware: HIGH — confirmed Next.js 16 renamed middleware.ts → proxy.ts
- Pitfalls: HIGH — refresh token rotation documented in official Discord API docs + Auth.js GitHub issues

**Research date:** 2026-03-18
**Valid until:** 2026-04-17 (Auth.js v5 beta moves fast — re-verify if > 30 days elapsed)
