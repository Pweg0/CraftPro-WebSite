# CraftPro Brasil — Landing Page

## What This Is

Site/landing page para o network de servidores Minecraft **CraftPro Brasil**. O servidor roda o modpack AllTheMods 1.21.1 V6, combinando tech, magia e Pokémon. O site serve como hub central para jogadores: informações dos servidores, sistema de rankeadas competitivo de Pokémon, perfis de usuário, replays de batalhas, rankings, loja e mais.

## Core Value

Transmitir a fusão Minecraft + Pokémon de forma vibrante e colorida, sendo o ponto central onde jogadores encontram tudo sobre o CraftPro Brasil — desde rankings até a loja.

## Requirements

### Validated

- ✓ Landing page com hero section imersiva (background Minecraft/Pokémon) — Phase 1
- ✓ Página de servidores (listar servidores do network) — Phase 1
- ✓ Página da loja (coming soon — preparada para futuro) — Phase 1
- ✓ Página de itens banidos — Phase 1
- ✓ Página de replays de batalhas Pokémon (stub) — Phase 1
- ✓ Design colorido vibrante com estética Minecraft/Pokémon — Phase 1
- ✓ Site em Português BR — Phase 1

### Active

- Loja funcional com pagamento MercadoPago (Pix/boleto/cartão), entrega via RCON + fila no banco
- Ranks/VIP temporários via LuckPerms, itens cosméticos, itens in-game, keys para caixas
- Blog de notícias/patch notes com publicação admin + calendário de eventos/torneios
- Notificações Discord via bot (compras, novos jogadores, resultados de batalhas)
- Temporadas de ranking com reset de ELO e hall da fama
- Dashboard do jogador com gráfico de evolução ELO e Pokémon mais usados

### Recently Validated

- ✓ Sistema de ranking competitivo de Pokémon (elo sobe/desce por vitórias/derrotas) — Phase 3
- ✓ Página de ranking por elo (leaderboard) — Phase 3
- ✓ Página Top 10 jogadores com mais vitórias — Phase 3
- ✓ Sistema de perfil de usuário — Phase 3
- ✓ Login via Discord — Phase 2
- ✓ Painel admin com CRUD de itens banidos, servidores, loja preview — Phase 4
- ✓ Gerenciamento de leaderboard (ban/unban jogadores, deletar partidas) — Phase 4
- ✓ Permissões granulares por seção com super-admin — Phase 4
- ✓ Log de auditoria para ações admin — Phase 4
- ✓ Página de detalhes de partida com replay log formatado — Post-Phase
- ✓ Página de replays listando partidas recentes do banco — Post-Phase
- ✓ Vinculação Discord ↔ Minecraft via admin — Post-Phase
- ✓ Deploy em produção (craftprobrasil.com.br via Vercel + Neon) — Post-Phase

### Out of Scope

- Login via email/senha ou Microsoft — login será exclusivamente via Discord
- App mobile nativo — web-first
- Conteúdo em inglês — site apenas em PT-BR
- ~~Sistema de replay com vídeo~~ — replay log do protocolo Showdown implementado (v1)
- Plugins Bukkit/Spigot — servidor é NeoForge, só aceita mods

## Context

- **Modpack:** AllTheMods 1.21.1 V6 (tech + magia + Pokémon integrados)
- **Imagem de referência:** Background fornecido pelo usuário — cenário Minecraft pixelado com Pokémon, água refletiva, céu azul vibrante, placas de jogos (PokeBrawl, PokeDash, PokeGold)
- **Público:** Jogadores brasileiros de Minecraft que curtem Pokémon e modpacks
- **Loja futura:** Venderá itens cosméticos, ranks/VIP e outros itens do servidor — entrega via RCON + fila no banco
- **Ranking:** Sistema competitivo tipo League of Legends — elo sobe com vitórias e desce com derrotas
- **Servidor:** NeoForge (não suporta plugins, apenas mods) — modpack AllTheMods 1.21.1 V6
- **Permissões:** LuckPerms (substituindo FTB Ranks) — integra com FTB Chunks e suporta ranks temporários
- **Pagamento:** MercadoPago (Pix, boleto, cartão) — público brasileiro

## Constraints

- **Idioma**: Português BR — público brasileiro
- **Auth**: Discord como único método de login
- **Visual**: Colorido e vibrante, remetendo à fusão Minecraft + Pokémon
- **Background**: Usar imagem fornecida como base do hero/header

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Login via Discord | Comunidade já usa Discord, reduz fricção | Implemented (Phase 2) |
| Estilo colorido vibrante | Combina com a imagem de referência e o tema Pokémon/Minecraft | Implemented (Phase 1) |
| Loja como "coming soon" | Funcionalidade virá depois, mas página precisa existir | Implemented (Phase 1), admin CRUD (Phase 4) |
| Ranking tipo elo competitivo | Referência LoL — sobe/desce com win/loss | Implemented (Phase 3) |
| Admin via env var + DB permissions | Acesso restrito, permissões granulares por seção | Implemented (Phase 4) |
| Banner aceita URL externa ou local | Flexibilidade para admin usar imagens externas | Implemented (Post-Phase) |
| "Ver Servidores" navega para /servidores | Melhor UX — leva direto à página completa | Implemented (Post-Phase) |
| RCON + fila no banco para loja | NeoForge não suporta plugins; RCON já vem no Minecraft | Decided (v2.0) |
| LuckPerms substituindo FTB Ranks | Ranks temporários, API rica, integra com FTB Chunks | Decided (v2.0) |
| MercadoPago como gateway | Público brasileiro, suporta Pix/boleto/cartão | Decided (v2.0) |

## Deployment

- **URL**: https://craftprobrasil.com.br
- **Hosting**: Vercel (hobby plan)
- **Database**: Neon PostgreSQL (free tier, sa-east-1)
- **Auth**: Discord OAuth2 via Auth.js v5
- **DNS**: Domínio .com.br via nameservers Vercel

## Stack

- Next.js 16 (Turbopack) + TypeScript
- Tailwind CSS v4 + shadcn/ui (base-ui)
- Drizzle ORM + Neon PostgreSQL
- Auth.js v5 (Discord provider)
- Vitest + Testing Library

## Current Milestone: v2.0 Loja e Blog

**Goal:** Tornar o CraftPro Brasil um hub funcional completo — loja com pagamento real, blog com eventos, notificações Discord, temporadas competitivas e dashboard do jogador.

**Target features:**
- Loja funcional — Ranks/VIP temporários (LuckPerms), itens cosméticos, itens in-game, keys. MercadoPago (Pix/boleto/cartão). Entrega via RCON + fila no banco.
- Blog + Eventos — Admin publica notícias, patch notes, announcements. Calendário de eventos/torneios.
- Notificações Discord — Bot notifica compras, novos jogadores, resultados de batalhas.
- Temporadas de ranking — Reset de ELO por temporada, hall da fama dos campeões.
- Dashboard do jogador — Gráfico de evolução ELO, Pokémon mais usados, stats detalhados.

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-26 — v2.0 milestone started (Loja, Blog, Notificações, Temporadas, Dashboard).*
