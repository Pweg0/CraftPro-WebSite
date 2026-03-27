# Phase 2: Autenticação - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Login via Discord OAuth2, sessão persistente entre refreshes do navegador, logout de qualquer página. Integração do estado de autenticação na Navbar existente. Middleware para proteger rotas que requerem login. Nenhuma funcionalidade de ranking, perfil com dados, ou loja nesta fase.

</domain>

<decisions>
## Implementation Decisions

### Login UX
- Botão "Entrar com Discord" no canto direito da navbar
- Login via redirect full — redireciona pro Discord, autoriza, volta pro site logado
- Substitui o botão de login pelo avatar quando logado

### Estado Logado na Navbar
- Avatar redondo do Discord no canto direito da navbar
- Clica no avatar e abre dropdown com: "Perfil" (link) e "Sair" (ação)
- Dropdown fecha ao clicar fora

### Acesso Restrito
- Visitante não logado que tenta acessar /perfil é redirecionado automaticamente pro login Discord
- Após login, retorna pra página que tentou acessar originalmente
- Middleware preparado pra proteger /perfil e rotas futuras (/admin, etc.)

### Claude's Discretion
- Loading state durante o processo de login/redirect
- Design exato do dropdown do avatar (cores, sombras, animação)
- Tratamento de erros de OAuth (token expirado, usuário cancela)
- Refresh token rotation handling (pitfall identificado na pesquisa)
- Schema da tabela de usuários no Drizzle (campos além do discordId)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — Constraint: Discord como único método de login
- `.planning/REQUIREMENTS.md` — AUTH-01, AUTH-02, AUTH-03
- `.planning/research/STACK.md` — Auth.js v5 + Discord provider + Drizzle adapter
- `.planning/research/PITFALLS.md` — Discord OAuth refresh token rotation pitfall
- `.planning/research/ARCHITECTURE.md` — Auth architecture, discordId como FK estável

### Phase 1 context
- `.planning/phases/01-hub-p-blico/01-CONTEXT.md` — Navbar decisions (sticky, 7 links, mobile drawer)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/layout/Navbar.tsx` — Navbar existente onde o botão de login/avatar será integrado
- `src/app/layout.tsx` — Root layout onde SessionProvider será adicionado
- `src/types/index.ts` — Tipos compartilhados, adicionar User type aqui

### Established Patterns
- Client Component islands: componentes interativos usam 'use client', pages são Server Components
- shadcn/ui: Sheet já em uso pra mobile nav — usar DropdownMenu pro avatar dropdown
- Tailwind v4 design tokens: cores da marca já definidas em globals.css

### Integration Points
- Navbar.tsx precisa receber estado de sessão e renderizar login button ou avatar dropdown
- Middleware em middleware.ts pra proteger rotas /perfil e /admin
- Auth.js route handler em src/app/api/auth/[...nextauth]/route.ts
- Drizzle schema precisa de tabela users com discordId como FK

</code_context>

<specifics>
## Specific Ideas

- Dropdown do avatar deve seguir o estilo gaming/vibrante do resto do site
- Redirect após login deve voltar pra página original (callbackUrl)
- discordId (snowflake numérico) como FK estável — não usar username que é mutável

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-autentica-o*
*Context gathered: 2026-03-18*
