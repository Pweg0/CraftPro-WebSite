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

- (No active requirements — all v1 requirements validated)

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

### Out of Scope

- Login via email/senha ou Microsoft — login será exclusivamente via Discord
- Loja funcional no v1 — será página "em breve"
- App mobile nativo — web-first
- Conteúdo em inglês — site apenas em PT-BR
- Sistema de replay com vídeo — formato será definido posteriormente

## Context

- **Modpack:** AllTheMods 1.21.1 V6 (tech + magia + Pokémon integrados)
- **Imagem de referência:** Background fornecido pelo usuário — cenário Minecraft pixelado com Pokémon, água refletiva, céu azul vibrante, placas de jogos (PokeBrawl, PokeDash, PokeGold)
- **Público:** Jogadores brasileiros de Minecraft que curtem Pokémon e modpacks
- **Loja futura:** Venderá itens cosméticos, ranks/VIP e outros itens do servidor
- **Ranking:** Sistema competitivo tipo League of Legends — elo sobe com vitórias e desce com derrotas

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

---
*Last updated: 2026-03-19 after Phase 4 completion — all v1 phases complete*
