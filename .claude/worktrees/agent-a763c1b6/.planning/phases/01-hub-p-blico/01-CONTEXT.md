# Phase 1: Hub Público - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Toda a experiência pública do CraftPro Brasil — hero imersivo, navegação entre páginas, listagem de servidores com status ao vivo, página de itens banidos, loja placeholder, replays stub. Design colorido vibrante Minecraft/Pokémon, site em PT-BR, responsivo mobile-first. Nenhuma funcionalidade de auth ou competitivo nesta fase.

</domain>

<decisions>
## Implementation Decisions

### Hero Section
- Fullscreen imersivo — imagem de background ocupa 100vh
- Imagem fornecida pelo usuário como background (cenário Minecraft com Pokémon, água, céu azul)
- Gradiente escuro de baixo para cima para dar legibilidade ao texto
- Texto principal: "CraftPro Brasil" grande + tagline (tipo "Pokémon, Tech & Magia no Minecraft")
- 4 botões CTA: "Jogar Agora" (copia IP), "Discord" (link externo), "Ver Servidores" (scroll suave), "Loja" (link pra página)
- Animação parallax com Motion no hero

### Navegação
- Navbar fixa no topo (sticky), sempre visível
- Links no menu principal: Início, Servidores, Ranking, Loja, Itens Banidos, Replays, Perfil — todos visíveis na navbar
- Mobile: Hamburger menu (☰) que abre menu lateral deslizante
- Footer com links úteis e convite Discord

### Lista de Servidores
- Cards grandes por servidor com banner/screenshot próprio
- Cada card mostra: imagem/banner do servidor, nome, descrição, status, player count, IP copiável
- Status visual: glow/borda verde no card quando online, cinza quando offline
- Player count ao vivo por servidor

### Itens Banidos
- Tabela pesquisável com busca
- Colunas: nome do item, razão do ban, categoria
- Filtro/busca para encontrar itens rapidamente

### Loja (Em Breve)
- Teaser visual com preview de categorias (cosméticos, ranks/VIP, itens do servidor)
- Visual bonito com "Em Breve" ou countdown
- Não é uma página vazia — mostra o que virá

### Replays (Stub)
- Página "Em Breve" com preview/mockup de como será a página de replays
- Visual consistente com o resto do site

### Claude's Discretion
- Fontes específicas (pixel font vs moderna gaming font)
- Esquema exato de cores (derivar da imagem de background)
- Estrutura do footer (colunas, links)
- Loading states e skeleton screens
- Animações secundárias (hover, transições de página)
- Layout exato do grid de server cards

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — Visão do projeto, constraints, decisões chave
- `.planning/REQUIREMENTS.md` — Requirements v1 mapeados para esta fase (LAND-01..05, SERV-01..03, EXTRA-01..03)

### Research
- `.planning/research/STACK.md` — Stack recomendado: Next.js 16 + Tailwind v4 + shadcn/ui + Motion v12
- `.planning/research/ARCHITECTURE.md` — Arquitetura de componentes, server status integration
- `.planning/research/PITFALLS.md` — Hero image optimization para mobile BR, empty states
- `.planning/research/FEATURES.md` — Features table stakes vs diferenciadores

### Assets
- Imagem de background do hero fornecida pelo usuário (precisa ser otimizada WebP/srcset)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Nenhum — projeto greenfield

### Established Patterns
- Nenhum — primeiro código a ser escrito

### Integration Points
- mcsrvstat.us API ou TCP direto para status dos servidores Minecraft
- Imagem de background precisa ser colocada em /public ou equivalente e otimizada via next/image

</code_context>

<specifics>
## Specific Ideas

- Imagem de background fornecida: cenário Minecraft pixelado com Pokémon construídos em blocos, água refletiva, céu azul vibrante, placas de jogos (PokeBrawl, PokeDash, PokeGold) — usar como hero background
- Estilo visual colorido vibrante — as cores devem remeter à fusão Minecraft + Pokémon
- Server cards com glow verde/cinza é uma referência a painéis de status de servidores gaming
- Loja teaser deve mostrar categorias reais (cosméticos, ranks, itens) mesmo sem funcionalidade

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-hub-p-blico*
*Context gathered: 2026-03-18*
