# Phase 6: Blog e Eventos - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin publica posts (markdown) e eventos; visitantes leem /blog com cards e /eventos com calendário visual filtrado por tipo. Posts fixáveis no topo. Eventos informativos (sem inscrição — inscrição via Discord).

</domain>

<decisions>
## Implementation Decisions

### Conteúdo do Blog
- **D-01:** Editor rich text (WYSIWYG) para escrita de posts — não textarea markdown puro
- **D-02:** Campos do post: título, slug (auto-gerado), corpo (rich text), thumbnail (URL), resumo curto, tags (text array), pinned (boolean), publishedAt (nullable — null = rascunho)
- **D-03:** Markdown armazenado no Neon DB (tabela blogPosts) — sem headless CMS, sem MDX files
- **D-04:** Renderização via react-markdown@9.x na página pública

### Eventos/Calendário
- **D-05:** Calendário visual (grid mensal) na página /eventos — não lista cronológica
- **D-06:** Tipos de evento: torneio, update, manutenção, especial (campo type no banco)
- **D-07:** Eventos são informativos — sem inscrição pelo site (inscrição via Discord)
- **D-08:** Campos do evento: título, descrição, tipo, data início, data fim (nullable), eventUrl (nullable — link pro Discord do evento)

### Página Pública do Blog
- **D-09:** Layout de cards com thumbnail — grid similar ao layout da loja (ProductCard pattern)
- **D-10:** Posts fixados (pinned) aparecem no topo da listagem, acima dos demais
- **D-11:** Cada card mostra: thumbnail, título, resumo, data, tags

### Admin
- **D-12:** /admin/blog para CRUD de posts — mesmo pattern de Server Actions + forms do admin existente
- **D-13:** /admin/eventos para CRUD de eventos — mesmo pattern
- **D-14:** Permissões 'blog' e 'eventos' adicionadas ao sistema de permissões granulares
- **D-15:** Todas as ações admin logadas no audit_log existente

### Claude's Discretion
- Escolha do editor rich text (TipTap, react-quill, ou outra lib)
- Design exato dos cards de blog e calendário
- Paginação da listagem
- ISR/revalidação timing
- Skeleton/loading states
- Filtro por tags na listagem

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Pesquisa de Stack
- `.planning/research/STACK.md` — react-markdown@9.x para renderização
- `.planning/research/ARCHITECTURE.md` — ISR patterns, blog in Neon DB

### Padrões Estabelecidos
- `.planning/phases/04-painel-admin/04-CONTEXT.md` — Admin CRUD patterns, sidebar, permissions, audit log
- `.planning/phases/05-loja-funcional/05-CONTEXT.md` — ProductCard pattern (reusar para BlogCard)

### Schema
- `src/lib/db/schema.ts` — Schema existente, admin patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Admin layout + sidebar: `src/app/(admin)/admin/layout.tsx`
- Server Actions pattern: `src/lib/admin/actions/`
- adminPermissions + adminAuditLog tables
- ProductCard/ShopItemCard pattern para BlogCard
- ISR pattern das páginas públicas existentes

### Established Patterns
- Server Actions para mutações admin com revalidatePath
- ISR para páginas públicas
- Client Component islands
- AlertDialog para ações destrutivas
- Badge para status/tags

### Integration Points
- Admin sidebar: adicionar seções Blog e Eventos
- Navbar: adicionar links Blog e Eventos
- adminPermissions: adicionar seções 'blog' e 'eventos'

</code_context>

<specifics>
## Specific Ideas

- Cards de blog visualmente similares aos ProductCards da loja — consistência visual
- Calendário visual de eventos (grid mensal) — referência de calendários de gaming communities
- Editor rich text pra facilitar a vida do admin (não precisa saber markdown)
- Eventos informativos — link pro Discord pra inscrição quando aplicável

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-blog-e-eventos*
*Context gathered: 2026-03-26*
