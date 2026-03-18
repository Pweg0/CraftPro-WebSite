# Feature Research

**Domain:** Minecraft Server Network Community Website (Modpack + Pokemon Competitive)
**Researched:** 2026-03-18
**Confidence:** MEDIUM — based on competitor analysis (Hypixel, Pixelmon servers, CraftersLand, ModdedMC), community patterns, and technical documentation. Pokemon ELO specifics based on PixelmonShowdown plugin patterns.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Hero section with server identity | Every gaming site has a branded landing; users expect to immediately know what CraftPro Brasil is | LOW | Use provided Minecraft/Pokemon background image. Show server name, tagline, "play now" CTA with IP copy |
| Server listing with connection info | Players need the server IP/address to join — this is the #1 reason they visit the site | LOW | Show IP, port, modpack version (ATM 1.21.1 V6), game mode label per server |
| Live player count / server status | Players check if the server is online before logging in | MEDIUM | Poll Minecraft server status API (mcstatus.io-style). Show online/offline badge + player count |
| Navigation with clear sections | Servers, Rankings, Store, Profile — standard gaming site nav | LOW | Sticky header. Mobile hamburger menu |
| Discord login / OAuth | Gaming communities are Discord-native. Users expect social login with zero friction | MEDIUM | Discord OAuth2 flow. Scopes: identify + email. Supabase has built-in Discord provider |
| User profile page | Players want to see their own stats, rank, avatar | MEDIUM | Pull Discord avatar/username. Show ELO, win/loss record, linked server stats |
| ELO leaderboard (top players by rank) | Competitive players need a scoreboard — it drives engagement and session returns | MEDIUM | Paginated or top-N table. Player rank, ELO score, wins, losses, ratio |
| Top 10 most wins leaderboard | Complements ELO. Shows grinding accomplishment separate from skill rank | LOW | Simple sorted list. Can share backend with ELO leaderboard |
| Banned items page | Modded Minecraft servers universally maintain a banned items list — players need this to avoid bans | LOW | Static or CMS-driven list. Filter by category/modpack. CraftersLand and ModdedMC Network both have this |
| Rules / community standards page | Players expect to know what behavior is acceptable | LOW | Static page is fine for v1 |
| Mobile-responsive design | Over 40% of casual browsing is mobile; players share links on Discord from phones | MEDIUM | Tailwind responsive utilities cover this if used from start |
| PT-BR language throughout | Brazilian audience — English text feels foreign and reduces trust | LOW | All copy, labels, error messages in PT-BR |

### Differentiators (Competitive Advantage)

Features that set CraftPro Brasil apart. These align with the core ATM + Pokemon fusion identity.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Pokemon competitive ELO ranking system | Almost no Minecraft server has a website-integrated competitive ranking system. PixelmonShowdown plugin provides ELO data — surfacing it on a polished web UI is rare and immediately impressive | HIGH | Requires: backend to receive ELO data from game server, store match history, compute rankings. PixelmonShowdown (GitHub: landonjw/PixelmonShowdown) outputs ELO per match |
| Battle replay viewer | Pokemon Showdown's replay format is the web standard. Displaying replays on the site closes the loop between in-game battles and community bragging rights | HIGH | Format is undefined per PROJECT.md — defer full viewer to v1.x. Start with replay links list per player. Full viewer requires parsing Showdown .log format |
| Rank badges / tiers on profiles | LoL-style rank visualization (Bronze → Diamond → etc.) gives players identity beyond a number | MEDIUM | Purely visual layer on top of ELO. Define tier thresholds. Custom pixel-art badges would be on-brand |
| Server-specific game mode cards (PokeBrawl, PokeDash, PokeGold) | The reference image shows three game modes. Dedicated cards per mode explain what's unique, not just "join and figure it out" | LOW | Static content per mode with description, player count, screenshot |
| Coming-soon store page with hype | A placeholder store done right (countdown, preview of items, VIP ranks teaser) builds anticipation instead of disappointment | LOW | Animated "em breve" page. Can collect email/Discord interest list |
| Match history per player | Per-profile battle history (opponent, outcome, ELO delta) is standard on esports platforms but absent from virtually all Minecraft server sites | MEDIUM | Requires storing per-match records. Pagination needed for active players |
| Pokemon team showcase on profile | Players show off their competitive team on their profile page | MEDIUM | Requires structured data from game server. Could be manual input at first via profile edit |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems at this stage.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time leaderboard (WebSocket live updates) | "The ranking should update instantly" | Massive over-engineering for a community site. Adds infra complexity (Redis sorted sets, WebSocket connections) with no meaningful UX gain — rankings change slowly | Refresh on page load + cache for 5 minutes. Add a "last updated" timestamp |
| In-site Pokemon battle simulator | Players want to practice builds | This is literally Pokemon Showdown — building it from scratch is months of work and will never match Showdown's quality | Link to Pokemon Showdown. Integrate ELO results from the existing PixelmonShowdown plugin |
| Forum / community posts system | "Players need a place to talk" | Discord already exists. A second forum fractures the community and requires heavy moderation tooling | Embed Discord widget or deep-link to Discord server. Keep discussion on Discord |
| Email/password authentication | Some users don't have Discord | PROJECT.md explicitly out-of-scopes this. Adding it doubles auth complexity, adds password reset flows, security surface | Discord OAuth only. Non-Discord users can still browse without logging in |
| Full-featured store (v1) | Players want to buy ranks/items | Tebex handles payment processing, fraud, tax compliance — building a custom store is high-risk. The v1 store would need PCI compliance | Tebex integration for the real store. Ship "em breve" page in v1, Tebex-powered store in v2 |
| Native mobile app | "A lot of players use phones" | Web-first with responsive design covers the use case. An app adds a second codebase, App Store approval, and push notification infra | PWA if notifications become needed. Responsive web is sufficient |
| Video replay system | Watching battles as video | Extremely high storage/bandwidth cost. No existing tooling maps Pixelmon battles to video format | Text/JSON log format replay viewer. Start with plain match summary cards |
| Multi-language support (EN + PT-BR) | "International players might visit" | CraftPro Brasil is explicitly a Brazilian server. Adding i18n doubles translation maintenance. The target audience reads PT-BR | PT-BR only. If server goes international, add i18n then |
| Custom anti-cheat dashboard | "Show ban records publicly" | Public ban lists are legally and reputationally risky. Disputed bans become PR incidents | Keep ban appeals internal on Discord. Banned items list (which items are disabled) is fine publicly |

---

## Feature Dependencies

```
Discord OAuth Login
    └──required by──> User Profile Page
    └──required by──> ELO Leaderboard (player identity)
    └──required by──> Battle Replays (associate replays to user)
    └──required by──> Match History

Game Server ELO Data (API/webhook from PixelmonShowdown plugin)
    └──required by──> Pokemon ELO Ranking System
                          └──required by──> ELO Leaderboard Page
                          └──required by──> Top 10 Wins Leaderboard
                          └──required by──> ELO shown on User Profile
                          └──required by──> Match History per Player
                          └──required by──> Rank Badges / Tiers

User Profile Page
    └──enhanced by──> Match History
    └──enhanced by──> Rank Badge display
    └──enhanced by──> Pokemon Team Showcase

Server Status API (mcstatus-style poll)
    └──required by──> Live Player Count on Server Listing Page

Battle Replay Data (from game server)
    └──required by──> Battle Replay Viewer Page
    └──enhanced by──> Match History (link replay to match record)

Store "Em Breve" Page
    └──independent (static page, no dependencies)

Banned Items Page
    └──independent (static or CMS-driven, no auth needed)
```

### Dependency Notes

- **Discord OAuth required before profile/leaderboard:** Without auth, there is no player identity to attach ELO data to. OAuth is Phase 1 infrastructure.
- **Game server integration is the critical path for ELO:** The PixelmonShowdown plugin must be configured to POST match results to the web backend. This is a server-admin task that blocks all ranking features.
- **Replays depend on format decision:** PROJECT.md defers the replay format. Until the game server emits replay data in a defined format, the replay viewer is blocked. Ship a stub page first.
- **Leaderboards enhance engagement but are non-blocking for launch:** The site can launch with a static landing page + server listing before ELO data is flowing.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what players need on day one.

- [ ] Hero landing page with Minecraft/Pokemon background — establishes identity, gives server IP
- [ ] Server listing with live status + player count — core utility, reason #1 to visit
- [ ] Banned items page — reduces support load, players need this before joining
- [ ] Discord OAuth login — foundation for all personalized features
- [ ] User profile page (basic: Discord avatar, username, ELO placeholder) — players need to log in and see themselves
- [ ] Pokemon ELO leaderboard (top N by ELO) — the signature differentiator; needs game server integration to be real
- [ ] Top 10 most wins leaderboard — quick win once ELO data flows
- [ ] Store "em breve" page — placeholder prevents "where do I buy ranks?" confusion
- [ ] PT-BR throughout, vibrant Minecraft/Pokemon design

### Add After Validation (v1.x)

Features to add once the core is stable and players are using it.

- [ ] Match history per player — add once ELO data has accumulated; requires storing per-match records from day one even if UI comes later
- [ ] Rank badges / tier visualization on profile — cosmetic layer, high engagement payoff, low risk
- [ ] Battle replay list page (stub) — even a simple list of "Replay #1234" links is valuable once replay format is defined
- [ ] Game mode cards (PokeBrawl, PokeDash, PokeGold) — flesh out server listing with mode-specific pages

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Full store (Tebex integration) — PROJECT.md explicit: functional store is future scope
- [ ] Battle replay viewer (interactive) — depends on format decision + parsing implementation
- [ ] Pokemon team showcase on profile — needs structured team data from game server
- [ ] PWA / push notifications for rank changes — only if retention becomes a problem to solve

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Hero landing page | HIGH | LOW | P1 |
| Server listing + live status | HIGH | LOW | P1 |
| Discord OAuth login | HIGH | MEDIUM | P1 |
| Banned items page | HIGH | LOW | P1 |
| Pokemon ELO leaderboard | HIGH | HIGH | P1 (gated on game server integration) |
| User profile page | HIGH | MEDIUM | P1 |
| Top 10 wins leaderboard | MEDIUM | LOW | P1 (once ELO data exists) |
| Store "em breve" page | MEDIUM | LOW | P1 |
| Match history per player | HIGH | MEDIUM | P2 |
| Rank badges / tiers | MEDIUM | MEDIUM | P2 |
| Game mode detail cards | MEDIUM | LOW | P2 |
| Battle replay list | MEDIUM | MEDIUM | P2 (blocked on format) |
| Battle replay viewer | HIGH | HIGH | P3 |
| Full Tebex store | HIGH | HIGH | P3 |
| Pokemon team showcase | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Hypixel (hypixel.net) | CraftersLand / ModdedMC | Our Approach |
|---------|----------------------|------------------------|--------------|
| Server status | Dedicated status.hypixel.net | Basic uptime page | Inline on server listing card |
| Leaderboards | Per-game leaderboards, guild stats (Plancke.io third-party) | Minimal or none | First-class ELO + wins leaderboard, signature feature |
| User profiles | Stats via third-party (Plancke) | Forum accounts | Discord-native profiles with ELO on-site |
| Store | Hypixel store (custom) | Tebex | "Em breve" v1, Tebex v2 |
| Banned items | Not visible (network-level) | Dedicated banned items page (CraftersLand pattern) | Dedicated banned items page, filterable |
| Battle replays | Not applicable | Not applicable | Unique feature for Pokemon competitive |
| Auth | Microsoft account | Forum registration | Discord OAuth only |
| Mobile | Responsive | Variable | Responsive-first, PT-BR |

---

## Sources

- [PixelmonShowdown GitHub - Competitive ELO System for Pixelmon](https://github.com/landonjw/PixelmonShowdown) — MEDIUM confidence (official repo, last activity verified)
- [Pokemon Showdown Replays](https://replay.pokemonshowdown.com/) — HIGH confidence (official site, replay format reference)
- [CraftersLand Banned Items List (updated 2025)](https://forum.craftersland.net/topic/43760-banned-items-list-modded-servers-landing-page-updated-2025/) — HIGH confidence (live page)
- [ModdedMC Network Banned Items](https://moddedmc.net/banned-items) — HIGH confidence (live page, competitor pattern)
- [Hypixel Network Wikipedia](https://en.wikipedia.org/wiki/Hypixel) — HIGH confidence (documented features)
- [Tebex - Monetize your Game Server](https://www.tebex.io/server) — HIGH confidence (official site)
- [Discord OAuth2 Official Docs](https://docs.discord.com/developers/topics/oauth2) — HIGH confidence (official)
- [Supabase Discord Login](https://supabase.com/docs/guides/auth/social-login/auth-discord) — HIGH confidence (official docs)
- [TrackScore - Gaming Leaderboards Guide](https://trackscore.online/blog/gaming-leaderboards-essential-guide-for-developers-and-communities) — LOW confidence (single source, informational)
- [Pixelmon Servers competitive listing](https://pixelmonservers.com/) — MEDIUM confidence (community listing, pattern evidence)

---

*Feature research for: CraftPro Brasil — Minecraft Network Community Website*
*Researched: 2026-03-18*
