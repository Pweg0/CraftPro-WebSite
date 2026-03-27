# Phase 3: Sistema Competitivo - Research

**Researched:** 2026-03-18
**Domain:** Next.js 16 App Router — display layer for competitive ranking (leaderboard, profiles, ISR caching, tier badges)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Fonte de Dados**
- Plugin CobblemonArena calcula ELO, delta e divisão — site NÃO calcula ELO
- Dados chegam via POST /api/replays (já implementado) com Bearer token auth
- ranking_snapshot no payload atualiza arena_players via upsert (já implementado)
- Site é camada de exibição + armazenamento, não lógica de negócio

**Divisões & Tiers (definidos pelo mod)**
- 7 divisões: UNRANKED, BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, MASTER
- Thresholds: Bronze 0-999, Silver 1000-1199, Gold 1200-1399, Platinum 1400-1599, Diamond 1600-1799, Master 1800+
- UNRANKED = placement incompleto (precisa de 10 partidas em 7 dias)
- Cores definidas: UNRANKED #888888, BRONZE #cd7f32, SILVER #c0c0c0, GOLD #f59e0b, PLATINUM #00d4ff, DIAMOND #b9f2ff, MASTER #ff4444

**Placement**
- 10 partidas necessárias, prazo de 7 dias
- ELO inicial: 800
- Jogador fica UNRANKED até completar placement

**Leaderboard & Top-10**
- Página única /ranking com duas abas: "Leaderboard (ELO)" e "Top 10 Vitórias"
- Informações por jogador na tabela: posição, avatar (mc-heads.net 24px), nome, ELO, divisão badge colorida, wins, losses, win rate
- Paginação de 20 jogadores por página
- Jogadores UNRANKED aparecem no final da lista, separados dos rankeados, com badge "Em Classificação"
- ISR 60 segundos (definido no ROADMAP)

**Perfil do Jogador**
- Perfil público: qualquer visitante acessa /perfil/[uuid] e vê stats + histórico
- Clicar no nome no leaderboard abre o perfil do jogador
- Avatar: skin 3D corpo inteiro via crafatar.com/renders/body/{uuid}?size=200
- Cabeça 2D (mc-heads.net 48px) como fallback/complemento
- Histórico: 20 últimas batalhas com paginação pra ver mais
- Cada batalha mostra: adversário (avatar+nome), resultado (V/D), ELO antes/depois (+delta), razão (victory/timeout/flee/etc), data, duração, link pro replay
- Empty state limpo para conta nova sem batalhas

**Perfil — Extras Privados (jogador logado vendo próprio perfil)**
- Seção Discord: mostra nome/avatar do Discord vinculado
- Stats detalhados: win rate por arena, win streak atual, melhor ELO atingido
- Visitantes NÃO veem essas seções

**Skin Avatars**
- Cabeça 24px (leaderboard): https://mc-heads.net/avatar/{uuid}/24
- Cabeça 48px (perfil/detalhes): https://mc-heads.net/avatar/{uuid}/48
- Corpo 3D (perfil): https://crafatar.com/renders/body/{uuid}?size=200

### Claude's Discretion
- Design exato dos tier badges (formato, brilho, animação)
- Layout do perfil (seções, espaçamento, responsivo)
- Design das abas no ranking
- Loading states e skeleton screens
- Empty states visuais
- Cache strategy para imagens de skin externas

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RANK-01 | Página de leaderboard mostrando jogadores ordenados por ELO | Server Component com query Drizzle `ORDER BY elo DESC`, ISR 60s via `export const revalidate = 60`, tabela com componentes existentes (Table, Badge) |
| RANK-02 | Página Top 10 jogadores com mais vitórias | Segunda aba na mesma /ranking page — mesma rota, query separada `ORDER BY wins DESC LIMIT 10`, Client Component island para troca de aba |
| RANK-03 | Tiers/ranks visuais (Bronze, Silver, Gold, Diamond, etc.) | `TierBadge` component com cores fixas do spec, `badgeVariants` extensíveis via `className`, cores hardcoded da divisão como inline style ou CSS variable |
| RANK-04 | Sistema de cálculo ELO (sobe com vitória, desce com derrota) | ELO já é calculado pelo mod — site só exibe o valor armazenado em `arena_players.elo`. Req satisfeito pela ingestão via POST /api/replays que já funciona |
| PROF-01 | Página de perfil com stats de batalha (wins, losses, win rate, elo atual) | Server Component /perfil/[uuid] (public) + /perfil (protected redirect), query `arena_players WHERE uuid = ?`, win_rate calculado na query ou em código |
| PROF-02 | Histórico de batalhas recentes no perfil | Query `arena_matches WHERE winner_uuid = ? OR loser_uuid = ? ORDER BY started_at DESC LIMIT 20`, paginação via searchParams, cada linha mostra adversário/resultado/ELO delta |
</phase_requirements>

---

## Summary

Phase 3 é inteiramente uma camada de display. O mod CobblemonArena já calculou o ELO e enviou os dados via POST /api/replays — o schema `arena_players` e `arena_matches` já existe e já está sendo populado. O trabalho desta fase é construir as páginas de consulta: leaderboard com duas abas, perfis públicos com histórico, e os tier badges visuais.

O stack já está completo: Next.js 16.2 App Router, Drizzle ORM com Neon, shadcn/ui (Badge, Table, Button), Tailwind v4. Não há nada a instalar. O foco é na estrutura das páginas (Server Components com ISR 60s), nas queries Drizzle corretas, na rota dinâmica `/perfil/[uuid]`, no tratamento de autorização para extras privados do perfil, e nos remote patterns do `next.config.ts` para mc-heads.net e crafatar.com.

A única complexidade não-trivial é o tratamento de três casos no perfil: visitante público, jogador logado vendo perfil alheio, e jogador logado vendo o próprio perfil (que exibe seção Discord e stats privados). Isso exige comparar o UUID do Minecraft do perfil com o UUID linkado ao usuário da sessão.

**Primary recommendation:** Build as Server Components with ISR 60s. Use Client Component islands only for tab switching (ranking) and pagination (profile history). All data fetching lives in the Server Component, passed down as props.

---

## Standard Stack

### Core (tudo já instalado)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.0 | App Router, Server Components, ISR, route groups | Já instalado, padrão do projeto |
| Drizzle ORM | ^0.45.1 | Query builder type-safe para PostgreSQL/Neon | Já instalado, schema já definido |
| @neondatabase/serverless | ^1.0.2 | Driver HTTP para Neon (serverless-compatible) | Já instalado, neon-http escolhido em Phase 2 |
| next-auth | ^5.0.0-beta.30 | `auth()` para detectar sessão no Server Component | Já instalado, padrão do projeto |
| tailwindcss | ^4 | Styling via brand tokens definidos em globals.css | Já instalado |

### UI (todos já instalados via shadcn/base-ui)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Badge (shadcn) | existente | Tier badges coloridos | Tier badge por divisão |
| Table (shadcn) | existente | Tabela do leaderboard | Leaderboard rows |
| Button (shadcn) | existente | Paginação, navegação entre abas | Controles interativos |
| lucide-react | ^0.577.0 | Ícones (Trophy, User, ChevronLeft/Right) | Decoração UI |
| next/image | built-in | Avatar heads (mc-heads.net, crafatar.com) | Todas as imagens de skin |

### Nada a instalar

Não há nenhuma dependência nova nesta fase. Tudo que é necessário já está no `package.json`.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── (public)/
│   │   ├── ranking/
│   │   │   └── page.tsx          # Server Component, revalidate = 60, substituir stub
│   │   └── perfil/
│   │       └── [uuid]/
│   │           └── page.tsx      # Server Component, rota dinâmica pública
│   └── (protected)/
│       └── perfil/
│           └── page.tsx          # Redireciona para /perfil/[uuid] do próprio jogador
├── components/
│   ├── ranking/
│   │   ├── LeaderboardTable.tsx  # 'use client' — paginação e tab state
│   │   ├── TierBadge.tsx         # Server-safe, sem estado
│   │   └── PlayerRow.tsx         # Linha da tabela, link para perfil
│   └── profile/
│       ├── ProfileHeader.tsx     # Avatar corpo 3D, nome, ELO, tier badge
│       ├── MatchHistoryTable.tsx # 'use client' — paginação
│       └── PrivateStatsSection.tsx # Só renderiza se isOwner === true
├── lib/
│   └── db/
│       ├── schema.ts             # Já existe — arenaPlayers + arenaMatches
│       └── queries/
│           ├── leaderboard.ts    # getLeaderboard(), getTop10Wins()
│           └── player.ts        # getPlayerProfile(), getPlayerMatches()
```

### Pattern 1: Server Component com ISR 60s

**What:** Página que busca dados no build/revalidação, não em runtime per-request.
**When to use:** Leaderboard e perfil — dados mudam com cada batalha, mas toleramos até 60s de defasagem (conforme SUCCESS CRITERIA #3).

```typescript
// src/app/(public)/ranking/page.tsx
import { db } from '@/lib/db'
import { arenaPlayers } from '@/lib/db/schema'
import { desc, asc, sql } from 'drizzle-orm'

// ISR: regenera a cada 60 segundos
export const revalidate = 60

export default async function RankingPage() {
  const ranked = await db
    .select()
    .from(arenaPlayers)
    .where(sql`${arenaPlayers.placementComplete} = 1`)
    .orderBy(desc(arenaPlayers.elo))

  const unranked = await db
    .select()
    .from(arenaPlayers)
    .where(sql`${arenaPlayers.placementComplete} = 0`)
    .orderBy(asc(arenaPlayers.name))

  return <LeaderboardTable ranked={ranked} unranked={unranked} />
}
```

### Pattern 2: Client Component Island para interatividade

**What:** Tab switching e paginação como 'use client', recebe dados do Server Component pai via props.
**When to use:** Qualquer estado de UI (aba ativa, página atual) sem round-trip ao servidor.

```typescript
// src/components/ranking/LeaderboardTable.tsx
'use client'
import { useState } from 'react'

type Tab = 'elo' | 'wins'

interface Props {
  ranked: ArenaPlayer[]
  unranked: ArenaPlayer[]
  top10Wins: ArenaPlayer[]
}

export function LeaderboardTable({ ranked, unranked, top10Wins }: Props) {
  const [tab, setTab] = useState<Tab>('elo')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

  // Paginar apenas os ranked na aba ELO
  const allPlayers = tab === 'elo'
    ? [...ranked, ...unranked]
    : top10Wins

  const total = ranked.length // unranked não contam para paginação ELO
  const slice = allPlayers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (/* ... */)
}
```

### Pattern 3: Rota Dinâmica Pública + Perfil Protegido com Redirect

**What:** `/perfil/[uuid]` é público. `/perfil` (protected) detecta o uuid do jogador logado e redireciona.
**When to use:** Separação entre perfil público (qualquer visita) e "meu perfil" (atalho autenticado).

```typescript
// src/app/(protected)/perfil/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { arenaPlayers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { users } from '@/lib/db/schema'

export default async function PerfilRedirectPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/perfil')

  // Precisa encontrar o minecraftUuid associado ao discordId do usuário
  // NOTA: A associação discordId <-> minecraftUuid requer uma tabela de link
  // (ver Pitfall 2 abaixo)
  redirect(`/perfil/${minecraftUuid}`)
}
```

### Pattern 4: TierBadge com cores fixas

**What:** Componente que recebe uma divisão e renderiza badge com cor específica.
**When to use:** Em toda ocorrência de divisão no leaderboard e perfil.

```typescript
// src/components/ranking/TierBadge.tsx
const DIVISION_CONFIG = {
  UNRANKED:  { label: 'Em Classificação', color: '#888888' },
  BRONZE:    { label: 'Bronze',           color: '#cd7f32' },
  SILVER:    { label: 'Prata',            color: '#c0c0c0' },
  GOLD:      { label: 'Ouro',             color: '#f59e0b' },
  PLATINUM:  { label: 'Platina',          color: '#00d4ff' },
  DIAMOND:   { label: 'Diamante',         color: '#b9f2ff' },
  MASTER:    { label: 'Master',           color: '#ff4444' },
} as const

type Division = keyof typeof DIVISION_CONFIG

interface Props {
  division: Division
  size?: 'sm' | 'md'
}

export function TierBadge({ division, size = 'sm' }: Props) {
  const { label, color } = DIVISION_CONFIG[division] ?? DIVISION_CONFIG.UNRANKED
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border"
      style={{ color, borderColor: `${color}60`, backgroundColor: `${color}15` }}
    >
      {label}
    </span>
  )
}
```

### Pattern 5: Query de histórico de batalhas

**What:** Buscar partidas onde o jogador foi vencedor OU perdedor, ordenadas por data.

```typescript
// src/lib/db/queries/player.ts
import { db } from '@/lib/db'
import { arenaMatches } from '@/lib/db/schema'
import { or, eq, desc } from 'drizzle-orm'

export async function getPlayerMatches(uuid: string, limit = 20, offset = 0) {
  return db
    .select()
    .from(arenaMatches)
    .where(or(
      eq(arenaMatches.winnerUuid, uuid),
      eq(arenaMatches.loserUuid, uuid)
    ))
    .orderBy(desc(arenaMatches.startedAt))
    .limit(limit)
    .offset(offset)
}
```

### Anti-Patterns to Avoid

- **Calcular ELO no site:** O mod é a fonte de verdade. Nunca recalcular ou modificar ELO no código do site.
- **Data fetching em Client Components:** Nunca fazer `fetch('/api/ranking')` num client component — buscar no Server Component e passar como prop.
- **next/image sem remotePatterns:** Qualquer `<Image src="https://mc-heads.net/...">` falha sem adicionar o hostname em `next.config.ts`.
- **ISR em rotas dinâmicas sem `generateStaticParams`:** Sem `generateStaticParams`, perfis dinâmicos renderizam em SSR por padrão, não ISR. Para perfis, SSR é aceitável (não precisa de ISR).
- **Expor replay_log completo no endpoint de ranking:** A query do leaderboard deve selecionar apenas as colunas necessárias, não `SELECT *` com jsonb de replay.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tier badge colorido | Switch/if chain inline em JSX | `TierBadge` component com DIVISION_CONFIG | Reutilizado em 3+ lugares, fácil de atualizar |
| Paginação | Lógica de slice + state manual | State local em Client Component (simples, dados já carregados) | Dados já estão no cliente via props do Server Component |
| Win rate display | `(wins / (wins + losses) * 100).toFixed(1)` espalhado | Helper `calcWinRate(wins, losses)` em `src/lib/utils.ts` | Edge case: zero losses deve retornar 0, não NaN |
| Avatar com fallback | `<img>` com onError handler | `next/image` com `unoptimized` ou `onError` fallback para head 2D se body 3D falhar | next/image otimiza, mas mc-heads.net e crafatar.com são externos e podem falhar |
| Separação UNRANKED no leaderboard | Lógica de sort complexa | Duas queries separadas (ranked + unranked) concatenadas | Mais simples e legível; OR no WHERE seria menos óbvio |

**Key insight:** O trabalho pesado (ELO, divisões, histórico) já está no banco. A complexidade desta fase é inteiramente de layout e composição de componentes.

---

## Common Pitfalls

### Pitfall 1: next.config.ts sem remotePatterns para mc-heads.net e crafatar.com

**What goes wrong:** `next/image` lança erro `hostname not configured` em produção. Em dev pode funcionar com `unoptimized` mas produção falha.
**Why it happens:** Next.js 16 exige allowlist explícita de hostnames externos para `next/image`.
**How to avoid:** Adicionar ambos os hostnames ao `next.config.ts` no plano 03-01 (antes de qualquer uso de imagem).

```typescript
// next.config.ts — adicionar aos remotePatterns existentes
{ protocol: 'https', hostname: 'mc-heads.net', pathname: '/**' },
{ protocol: 'https', hostname: 'crafatar.com', pathname: '/**' },
```

**Warning signs:** `Error: Invalid src prop` ou `hostname not configured` no console.

### Pitfall 2: Não há tabela de link discordId <-> minecraftUuid

**What goes wrong:** `/perfil` (protected) precisa redirecionar para `/perfil/[uuid]` do Minecraft do jogador logado. Mas `session.user.id` é o ID interno Auth.js e `discordId` é o snowflake Discord — nenhum deles é o UUID do Minecraft.
**Why it happens:** O mod envia dados usando UUID Minecraft (`arena_players.uuid`). O Discord OAuth fornece o Discord ID. Não há tabela de vinculação entre os dois.
**How to avoid:** A rota `/perfil` (protected) deve mostrar o perfil Discord do usuário (seção privada) mas também oferecer uma forma de buscar pelo nome Minecraft. Alternativa: mostrar uma busca por nome + link pro perfil. Documentar essa limitação explicitamente no plano.
**Warning signs:** Não há FK entre `users.discordId` e `arena_players.uuid` — são sistemas separados.

**Recomendação para o plano:** A rota `/perfil` (protected) exibe os dados Discord (nome, avatar) e permite o usuário buscar/digitar seu nickname Minecraft para ver seus stats. OU: simplificar — `/perfil` mostra info Discord + busca. `/perfil/[uuid]` é o perfil competitivo acessado via leaderboard.

### Pitfall 3: `revalidate = 60` não invalida cache sob demanda

**What goes wrong:** Após o mod enviar dados via POST /api/replays, o leaderboard ainda mostra dados antigos por até 60 segundos. O SUCCESS CRITERIA #3 exige "até 60 segundos" — portanto ISR 60s satisfaz o requisito, mas cache on-demand (`revalidatePath`) exigiria importar `revalidatePath` no route handler.
**Why it happens:** ISR temporal revalida no intervalo, não em cada write.
**How to avoid:** Para satisfazer o requisito (até 60s), `export const revalidate = 60` é suficiente. Se quiser invalidação imediata: adicionar `revalidatePath('/ranking')` no POST /api/replays handler após upsert bem-sucedido.
**Warning signs:** Leaderboard mostrando ELO antigo mais de 60s após uma batalha.

### Pitfall 4: Win rate NaN quando jogador não tem batalhas

**What goes wrong:** `wins / (wins + losses)` retorna `NaN` quando wins=0 e losses=0 (division by zero).
**Why it happens:** JavaScript: `0 / 0 === NaN`.
**How to avoid:** Helper com guard: `total === 0 ? 0 : Math.round((wins / total) * 100)`.
**Warning signs:** "NaN%" exibido no perfil de conta nova.

### Pitfall 5: Imagens externas lentas bloqueiam First Contentful Paint

**What goes wrong:** mc-heads.net e crafatar.com são serviços externos — podem estar lentos ou fora do ar. Se `next/image` aguardar a imagem para renderizar, o layout trava.
**Why it happens:** Sem tamanho fixo reservado para imagens, o layout sofre Cumulative Layout Shift.
**How to avoid:** Sempre especificar `width` e `height` em `next/image`. Usar `loading="lazy"` para avatares abaixo do fold. Manter `alt` descritivo. Adicionar fallback visual (inicial do nome) caso a imagem falhe.

### Pitfall 6: Perfil de jogador não encontrado (uuid inexistente)

**What goes wrong:** `/perfil/abc-uuid-falso` busca no banco e não encontra nada — precisa retornar 404, não página em branco.
**Why it happens:** Rotas dinâmicas sem validação de existência renderizam vazio.
**How to avoid:** `notFound()` do Next.js quando `getPlayerProfile()` retornar `undefined`.

```typescript
import { notFound } from 'next/navigation'
// ...
const player = await getPlayerProfile(params.uuid)
if (!player) notFound()
```

---

## Code Examples

Verified patterns from existing codebase:

### Drizzle query existente (pattern do schema)

```typescript
// Leaderboard query — SELECT players ordenados por ELO
// Source: src/lib/db/schema.ts (arenaPlayers table)
import { db } from '@/lib/db'
import { arenaPlayers } from '@/lib/db/schema'
import { desc, sql } from 'drizzle-orm'

const ranked = await db
  .select({
    uuid: arenaPlayers.uuid,
    name: arenaPlayers.name,
    elo: arenaPlayers.elo,
    wins: arenaPlayers.wins,
    losses: arenaPlayers.losses,
    division: arenaPlayers.division,
  })
  .from(arenaPlayers)
  .where(sql`${arenaPlayers.placementComplete} = 1`)
  .orderBy(desc(arenaPlayers.elo))
```

### ISR em Server Component (Next.js 16 App Router)

```typescript
// Source: Next.js 16 official docs — segment config options
export const revalidate = 60 // segundos

// Para rotas dinâmicas que DEVEM ser SSR (sem cache estático):
export const dynamic = 'force-dynamic'
```

### Pattern de badge existente (BannedItemsTable como referência)

```typescript
// Source: src/components/banned-items/BannedItemsTable.tsx
// Padrão: className com brand colors via Tailwind v4 tokens
<span className="text-xs bg-brand-card text-brand-blue px-2 py-1 rounded-full">
  {item.category}
</span>
// Para TierBadge, usar inline style para color dinâmico (não tokenizável via Tailwind)
```

### `notFound()` em rota dinâmica

```typescript
// Source: Next.js 16 App Router docs
import { notFound } from 'next/navigation'

export default async function PerfilPage({ params }: { params: { uuid: string } }) {
  const player = await getPlayerProfile(params.uuid)
  if (!player) notFound()
  // ...
}
```

### `auth()` em Server Component para extras privados

```typescript
// Source: src/lib/auth.ts + src/app/(protected)/perfil/page.tsx
import { auth } from '@/lib/auth'

export default async function PerfilUuidPage({ params }: { params: { uuid: string } }) {
  const session = await auth() // null se não logado, Session se logado
  const player = await getPlayerProfile(params.uuid)
  if (!player) notFound()

  // NOTA: comparação direta session<->player uuid não é possível sem tabela de link
  // Estratégia: mostrar seção privada apenas se session existe E uuid bate com algum campo
  const isOwner = false // v1: seção privada sempre oculta em /perfil/[uuid]
  // Os "extras privados" ficam em /perfil (protected) que mostra info Discord

  return <ProfileView player={player} matches={matches} isOwner={isOwner} />
}
```

### Win rate helper

```typescript
// src/lib/utils.ts — adicionar
export function calcWinRate(wins: number, losses: number): number {
  const total = wins + losses
  if (total === 0) return 0
  return Math.round((wins / total) * 100)
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getServerSideProps` | Server Components com `async/await` direto | Next.js 13+ | Sem prop drilling, dados no componente |
| `revalidateTag` complexo | `export const revalidate = 60` | Next.js 13+ App Router | ISR temporal simples para leaderboard |
| `pages/ranking.tsx` | `app/(public)/ranking/page.tsx` | Phase 1 | Route groups funcionando |
| shadcn CLI | base-ui + CVA (já configurado) | Phase 1 setup | Badge usa `useRender` do base-ui, não radix |

**Deprecated/outdated:**
- `lib/elo.ts` mencionado no roadmap original: NÃO implementar — mod é a fonte de verdade, site não calcula ELO.
- `endpoint /api/elo/update` mencionado no roadmap original: NÃO implementar — o endpoint `/api/replays` já recebe tudo incluindo ELO calculado.

---

## Open Questions

1. **Como /perfil (protected) encontra o UUID Minecraft do usuário logado?**
   - What we know: `session.user.id` é o ID Auth.js; `session.user.discordId` (se exposto) é o Discord snowflake; `arena_players.uuid` é o UUID Minecraft
   - What's unclear: Não existe tabela de vinculação `discordId <-> minecraftUuid`. O mod não envia Discord IDs.
   - Recommendation: Para v1, `/perfil` (protected) mostra dados do Discord (nome, avatar) da sessão, e uma busca por nome Minecraft para navegar ao perfil competitivo. A "seção privada" (stats, Discord link) vive em `/perfil` como página separada do perfil competitivo público `/perfil/[uuid]`. O planner deve decidir a separação de responsabilidades.

2. **Cache de imagens de skin (mc-heads.net / crafatar.com)**
   - What we know: next/image otimiza imagens locais mas para externas age como proxy quando `remotePatterns` configurado
   - What's unclear: Taxa de falha dos serviços mc-heads.net e crafatar.com não é conhecida
   - Recommendation: Usar `next/image` com dimensões fixas e fallback visual (iniciais do nome) via `onError`. Não implementar cache layer próprio — over-engineering para v1.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` (raiz do projeto) |
| Quick run command | `npx vitest run tests/ranking.test.tsx tests/profile.test.tsx` |
| Full suite command | `npx vitest run` |

### Phase Requirements — Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RANK-01 | Leaderboard renderiza jogadores ordenados por ELO com tier badge | unit (component) | `npx vitest run tests/ranking.test.tsx` | ❌ Wave 0 |
| RANK-02 | Tab Top 10 Vitórias mostra 10 jogadores ordenados por wins | unit (component) | `npx vitest run tests/ranking.test.tsx` | ❌ Wave 0 |
| RANK-03 | TierBadge renderiza cor e label corretos para cada divisão | unit (component) | `npx vitest run tests/tier-badge.test.tsx` | ❌ Wave 0 |
| RANK-04 | ELO já calculado pelo mod — ingestão via POST /api/replays | manual-only | N/A — lógica de negócio no mod | N/A |
| PROF-01 | Perfil exibe ELO, wins, losses, win rate | unit (component) | `npx vitest run tests/profile.test.tsx` | ❌ Wave 0 |
| PROF-02 | Histórico de batalhas renderiza resultado V/D, delta ELO, adversário | unit (component) | `npx vitest run tests/profile.test.tsx` | ❌ Wave 0 |

**RANK-04 justification (manual-only):** ELO é calculado pelo mod CobblemonArena externo. A satisfação deste requisito depende do mod enviar dados via webhook, não de lógica no site. O site só lê o valor armazenado. Teste de integração real exigiria um servidor Minecraft com o mod — fora do escopo de testes automatizados.

### Sampling Rate

- **Per task commit:** `npx vitest run tests/ranking.test.tsx tests/tier-badge.test.tsx tests/profile.test.tsx`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green antes de `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/ranking.test.tsx` — cobre RANK-01 e RANK-02 (LeaderboardTable component com mock data)
- [ ] `tests/tier-badge.test.tsx` — cobre RANK-03 (TierBadge renderiza cor correta por divisão)
- [ ] `tests/profile.test.tsx` — cobre PROF-01 e PROF-02 (ProfileView com stats e histórico)

*(Framework vitest + testing-library já instalado e configurado — `tests/setup.ts` existente)*

---

## Sources

### Primary (HIGH confidence)

- Codebase — `src/lib/db/schema.ts` — arenaPlayers e arenaMatches schemas confirmados
- Codebase — `src/app/api/replays/route.ts` — endpoint POST implementado com upsert
- Codebase — `package.json` — stack confirmado (Next.js 16.2.0, Drizzle 0.45.1, vitest 4.1.0)
- Codebase — `vitest.config.ts` + `tests/setup.ts` — framework de teste configurado
- Codebase — `src/app/globals.css` — brand tokens confirmados (brand-primary, brand-card, etc.)
- `.planning/phases/03-sistema-competitivo/arena-integration-spec.json` — spec completa de divisões, cores, thresholds, queries

### Secondary (MEDIUM confidence)

- Next.js 16 App Router docs — `export const revalidate = N` para ISR temporal em Server Components
- Next.js 16 docs — `notFound()` para 404 em rotas dinâmicas
- Drizzle ORM docs — `or()`, `eq()`, `desc()`, `.offset()`, `.limit()` para queries de histórico

### Tertiary (LOW confidence)

- mc-heads.net e crafatar.com — disponibilidade e rate limits dos serviços de avatar não verificados oficialmente. Serviços conhecidos na comunidade Minecraft mas sem SLA documentado.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — tudo confirmado via `package.json` e codebase existente
- Architecture: HIGH — padrões confirmados via fases 1 e 2 já implementadas (Server Components, client islands, ISR)
- Pitfalls: HIGH para next.config.ts e NaN rate; MEDIUM para link discordId<->minecraftUuid (confirmado ausente mas solução ainda a definir)
- Tier badge colors: HIGH — definidos no arena-integration-spec.json

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stack estável; spec do mod pode mudar se plugin atualizar)
