# Pitfalls Research

**Domain:** Minecraft server community website — competitive Pokémon ranking, Discord auth, leaderboards, user profiles
**Researched:** 2026-03-18
**Confidence:** MEDIUM-HIGH (verified through official Discord docs, multiple community sources, and established pattern analysis)

---

## Critical Pitfalls

### Pitfall 1: Discord OAuth Refresh Token Not Stored After Each Use

**What goes wrong:**
Discord issues a new refresh token on every token refresh call. If the application stores the original refresh token and reuses it after the first refresh, all subsequent refreshes return `invalid_grant` errors, silently logging users out — or worse, breaking their session mid-use with no clear error message.

**Why it happens:**
Developers treat OAuth refresh tokens like static credentials. The Discord API issues rotating refresh tokens, meaning the old token is invalidated the moment a new one is issued. This is documented but easy to miss when adapting generic OAuth2 boilerplate.

**How to avoid:**
After every token refresh call, immediately overwrite the stored refresh token with the new one returned in the response. Never reuse a refresh token. Use server-side session storage (not JWTs alone) to hold the current valid refresh token. Implement proactive refresh: check if the access token expires within 24 hours (tokens last 7 days / 604,800 seconds) and refresh before expiry, not after.

**Warning signs:**
- Users report being randomly logged out after about a week
- Auth errors appearing only for older accounts, not new ones
- Logs showing `invalid_grant` on refresh attempts

**Phase to address:**
Authentication phase — before any other feature that depends on user identity. Get the token lifecycle right before building profiles or rankings.

---

### Pitfall 2: Elo Rating Manipulation via Selective Abandonment

**What goes wrong:**
Players discover they can protect their ranking by abandoning or going AFK in matches they are losing. Since the elo system only moves rating on recorded win/loss results, a forfeit or disconnect with no registered result acts as a free shield. High-rated players have strong incentive to do this to protect top-leaderboard positions.

**Why it happens:**
Classic elo implementations only process completed matches. The "avoid playing to protect rating" problem caused Magic: The Gathering to abandon the elo system entirely in 2012. It is a well-known failure mode for any game where participation is optional.

**How to avoid:**
Define a clear policy for abandoned/disconnected battles at the design stage:
- Option A: Treat abandonment as a loss for the abandoning player.
- Option B: Use a timeout — if no result is submitted within N minutes, auto-record as a loss for the initiating player.
- Never leave the "match in progress" state unresolved. Every started match must produce a result record.
Communicate the policy visibly to players so the expectation is set upfront.

**Warning signs:**
- Growing number of matches with no recorded outcome
- Top-ranked players with suspiciously low total game counts
- Community complaints about rank-dodging

**Phase to address:**
Ranking system design phase — the match lifecycle and result resolution rules must be designed before implementing the elo calculation logic.

---

### Pitfall 3: No CSRF Protection on Discord OAuth State Parameter

**What goes wrong:**
The OAuth2 callback endpoint accepts authorization codes without verifying the `state` parameter. An attacker can craft a malicious link that, when clicked by a victim, logs the victim into the attacker's account (account takeover via OAuth CSRF). The user's Discord account becomes linked to the wrong site account.

**Why it happens:**
Tutorial-grade OAuth2 implementations omit the state parameter check to keep code simple. Discord's documentation requires it, but many copy-paste examples skip it.

**How to avoid:**
Generate a cryptographically random `state` value per login attempt. Store it in the user's server-side session before redirecting to Discord. On callback, reject any request where the returned `state` does not match the stored value. Expire unverified states after 10 minutes.

**Warning signs:**
- No `state` parameter being set in the OAuth redirect URL
- Callback handler not comparing `state` before processing the code

**Phase to address:**
Authentication phase — before launch, as a non-negotiable security requirement.

---

### Pitfall 4: Hero Section Killing Mobile Performance

**What goes wrong:**
The provided reference image (high-resolution Minecraft/Pokémon panoramic scene) is used directly as the hero background. On mobile devices (which account for a large share of the Brazilian audience, especially younger Minecraft players), this creates a 3-8 second first paint on 4G connections. The site feels broken before it starts.

**Why it happens:**
Developers design on desktop with fast connections. The visually rich Minecraft + Pokémon aesthetic naturally leads to large background images. Without explicit image optimization, the original asset gets shipped as-is.

**How to avoid:**
- Export the hero background at multiple sizes: 400px (mobile), 800px (tablet), 1600px (desktop)
- Use `<picture>` with `srcset` or CSS `image-set()` to serve the right size
- Compress to WebP format — typically 60-80% smaller than PNG/JPEG with no visible quality loss
- Lazy-load everything below the fold
- Set explicit `width` and `height` attributes on images to prevent layout shift (CLS)

**Warning signs:**
- Hero image file size above 500KB
- Lighthouse mobile score below 50
- No WebP variants in the assets folder
- `<img src="background.png">` without srcset

**Phase to address:**
Landing page / hero phase — build image optimization into the asset pipeline from the start, not as an afterthought.

---

### Pitfall 5: Leaderboard That Feels "Frozen" or Untrustworthy

**What goes wrong:**
The leaderboard shows ranks based on data that is stale by hours or days. Players check their rank, win a battle, refresh, and see no change. This destroys trust in the system and makes competitive play feel unrewarding. On the flip side, adding real-time WebSocket updates to the leaderboard for a small server adds infrastructure complexity without meaningful benefit.

**Why it happens:**
Two failure modes pull in opposite directions: (1) caching rankings aggressively without showing when data was last updated, and (2) over-engineering real-time updates via WebSockets when simple periodic polling is sufficient.

**How to avoid:**
For the scale of a Brazilian modpack community server, use simple database queries with short-lived cache (60 seconds). Display a visible "last updated X seconds ago" timestamp on the leaderboard page. Invalidate the leaderboard cache immediately after any match result is recorded. This gives near-real-time results without WebSocket complexity. Add a manual "refresh" button as a fallback.

**Warning signs:**
- Leaderboard has no timestamp indicating freshness
- Ranked players report their elo not updating for hours after a match
- Cache TTL set to 10+ minutes without visible staleness indicator

**Phase to address:**
Leaderboard / ranking display phase — design the cache invalidation strategy alongside the ranking write path.

---

### Pitfall 6: "Coming Soon" Store Page That Feels Abandoned

**What goes wrong:**
The store placeholder page ships as a blank page or a wall of text saying "em breve." Players click it from the navigation, land on nothing, and assume the project is dead or the team doesn't care. Worse, if the page stays in this state for months, it actively damages the brand.

**Why it happens:**
The store is deferred because it's not MVP. But the page still appears in navigation, so it gets a minimal placeholder with zero investment. The placeholder itself becomes a signal of project health.

**How to avoid:**
Make the "coming soon" page a first-class marketing asset:
- Show mockup previews of what will be sold (cosmetic items, VIP ranks)
- Include an email or Discord notification sign-up ("notify me when store opens")
- Show a rough timeline (Q3 2026, etc.)
- Reuse the vibrant design language — not a grey "em breve" box

**Warning signs:**
- Store page is a single paragraph of text on a white background
- No call to action on the placeholder
- No link to the Discord server for updates

**Phase to address:**
Store placeholder phase — design the "coming soon" page with the same production quality as the rest of the site.

---

### Pitfall 7: User Profile That Shows Nothing Until the Player Has Done Everything

**What goes wrong:**
User profile pages are built assuming a player has: a rank, battle history, replays, and a win streak. New users or low-activity users see empty sections, broken tables with zero rows, and "no data" placeholders everywhere. This makes the profile feel broken and discourages continued play.

**Why it happens:**
Profiles are built against the "ideal" data state during development. Edge cases (new user, no battles played, no rank yet) are only discovered when real users complain.

**How to avoid:**
Design every profile section for the empty state explicitly:
- "Você ainda não disputou batalhas. [Junte-se ao servidor]"
- Show rank as "Não rankeado" with an explanation of how to start
- Display a checklist of "next steps" for new players on their first profile visit
Empty states should be encouraging, not just absent.

**Warning signs:**
- Profile page only tested with seeded data
- No explicit empty state components in the UI code
- Tables that render with zero rows and no message

**Phase to address:**
User profile phase — write empty state UI for every dynamic section before considering the feature complete.

---

### Pitfall 8: Replay System Format Left Undefined Until Build Time

**What goes wrong:**
Battle replays are listed as a feature but "format a definir" (format to be decided). If the replay format is designed after the battle system is already built, the result is either: (a) no structured data was stored during battles making replay impossible, or (b) a painful rewrite of the data model to add replay support retroactively.

**Why it happens:**
Replay feels like a display feature, so teams defer it. In reality, replay requires the battle system to emit structured event logs from the very first battle. Pokémon Showdown's replay system requires storing the entire team and full move log server-side — it cannot be reconstructed from a simple win/loss record.

**How to avoid:**
Decide the minimum replay data structure before writing any battle recording code. Even if the playback UI is deferred, the event log schema must be locked. At minimum: timestamp, player A/B Discord IDs, Pokémon used, moves per turn, outcome. Store as JSON in the database from battle one.

**Warning signs:**
- Battle records table only has: player_a, player_b, winner, timestamp
- Replay page exists in the navigation before the data model is defined
- "Format to be decided" is still unresolved when battle recording starts

**Phase to address:**
Battle system / replay phase — define replay data schema in the same phase as battle recording, not separately.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing Discord access token in a cookie (not server-side) | Simpler auth implementation | Token exposed to XSS; CSRF risk; rotation logic breaks | Never for production |
| Skipping image optimization for the hero section | Faster initial development | Mobile users bounce; Lighthouse score tanks | Never — WebP conversion is a one-time 10-minute task |
| Hardcoding elo K-factor without a config | Less code | Cannot tune balance without a redeploy | Acceptable in MVP if the config is a single env variable |
| Single leaderboard table query with no caching | Simple to implement | Slow page loads under concurrent access | Acceptable until the server has >50 concurrent users |
| Using Discord username as the display name directly | No extra UI needed | Discord usernames change; historical records break | Only if storing Discord ID (not name) as the canonical key |
| No empty state design on profile pages | Faster to build | New users see broken-looking profiles | Never — takes 1 hour to add empty state copy |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Discord OAuth | Using `implicit` grant type (token in URL fragment) | Always use `authorization_code` grant — token never touches the browser URL |
| Discord OAuth | Storing `access_token` in `localStorage` | Store server-side; use httpOnly session cookie for the session ID |
| Discord OAuth | Not requesting the `identify` scope | `identify` is required to get the user's Discord ID, username, and avatar |
| Discord OAuth | Reusing same refresh token after first refresh | Each refresh call returns a new refresh token — store the new one immediately |
| Discord API | Fetching user data on every page request | Cache the Discord profile data in your DB; refresh only when the user actively logs in |
| Discord API | Not handling `401` responses from the API | Access tokens expire; all API calls to Discord must handle token expiry and trigger refresh |
| Minecraft Server Status | Polling the Minecraft server directly from the browser | Query server status server-side, cache result for 30 seconds, serve from your API |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Unoptimized hero image | 4-8 second first paint on mobile, high CLS score | Export to WebP, use srcset, add explicit dimensions | From day 1 on slow connections |
| Leaderboard query scanning all battle records | Leaderboard page loads in 3+ seconds | Index on `elo_score DESC`, pre-aggregate top-N | Around 500+ battles stored |
| Fetching Discord profile on every profile page load | Slow profiles, Discord API rate limits hit | Cache Discord avatar URL and username in your own DB | After ~50 concurrent users |
| No database index on battle results by player | Player profile battle history is slow | Add compound index on `(player_id, created_at DESC)` | Around 1000+ battles stored |
| Importing all Pokémon sprites as a single sprite sheet | Large upfront download even for pages with no Pokémon | Serve sprites individually, lazy-load on scroll | From first mobile page load |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| No `state` parameter in OAuth2 flow | Account takeover via CSRF — attacker links their Discord to victim's site account | Generate random state per login, verify on callback |
| Client secret in frontend code or public repo | Full OAuth application compromise | Store in environment variables, never in source code |
| Trusting Discord username for identity matching | Username changes break identity, can be hijacked | Always use immutable Discord `id` (snowflake) as the canonical user key |
| No rate limiting on the auth callback endpoint | Brute force / token stuffing | Rate-limit `/auth/callback` — max 10 requests per minute per IP |
| Storing elo changes without an audit log | Impossible to investigate disputes or detect manipulation | Append-only `battle_results` table; never UPDATE elo directly, derive it from the log |
| Exposing internal user IDs in API responses | Enumeration attacks on user profiles | Use Discord snowflake ID as the public-facing user identifier (already non-sequential) |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Rank displayed as a raw number ("1847 elo") with no context | Players don't know if 1847 is good or bad | Show rank tier name + visual badge (Bronze/Silver/Gold/Diamond inspired by competitive games) |
| Battle history table with no pagination | Profile pages freeze when a player has 200+ battles | Paginate or virtualise battle history lists from the start |
| No Portuguese BR error messages on auth failure | Brazilian players see English error messages, assume the site is broken | All user-facing strings, including error states, must be in PT-BR |
| Navigation shows "Loja" leading to an empty page | Players assume the site is unfinished | Either hide the store link until launch, or make the placeholder high-quality |
| Leaderboard showing Discord avatars that have changed | Stale/broken avatar images from cached old URLs | Store avatar hash, not full URL; refresh on login; fallback to initials avatar |
| Profile page accessible before the user is ranked | Confusing empty ranking section | Show a prominent "start competing" CTA for unranked users |

---

## "Looks Done But Isn't" Checklist

- [ ] **Discord Login:** Verify that refresh tokens are rotated and stored after every use — not just that login works on first attempt
- [ ] **Elo System:** Verify that abandoned/disconnected matches produce a defined outcome — not just that win/loss updates work
- [ ] **Leaderboard:** Verify that the cache invalidates immediately after a battle result is recorded — not just that the page loads
- [ ] **User Profiles:** Verify all sections render correctly when a player has zero battles, no rank, and no replays
- [ ] **Hero Section:** Verify Lighthouse mobile score is above 70 and the hero image is WebP with srcset
- [ ] **Battle Replays:** Verify that the replay data schema is stored from the first battle — not just that a replay UI page exists
- [ ] **Store Placeholder:** Verify the page has a real CTA and matches the site's design language — not just placeholder text
- [ ] **Banned Items Page:** Verify the page loads when the banned items list is empty (server just launched edge case)
- [ ] **PT-BR:** Verify all error states, empty states, and auth failure messages are in Portuguese — not just main content

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Broken refresh token rotation | MEDIUM | Audit token storage logic; force all users to re-authenticate; fix rotation before re-enabling auth |
| Elo manipulation via abandonment | HIGH | Retroactively void affected matches (requires audit log); redesign abandonment handling; announce policy change to community |
| Missing CSRF state check on OAuth | HIGH | Patch immediately; audit session logs for suspicious account links; consider forcing re-auth for all users |
| Unoptimized hero image causing high bounce | LOW | Compress to WebP + add srcset — this is a 2-hour fix that has immediate impact |
| Replay data not stored from the start | HIGH | No recovery without replaying battles — replay feature must be scoped out until data collection is retrofitted |
| Stale leaderboard destroying trust | LOW | Add cache invalidation trigger on battle result write + add "last updated" timestamp to UI |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Refresh token rotation | Auth phase | Integration test: perform 3 consecutive token refreshes; confirm all succeed |
| OAuth CSRF state parameter | Auth phase | Code review: confirm state is set, stored, and validated on callback |
| Elo abandonment manipulation | Ranking design phase | Design doc: every match lifecycle state (in-progress, completed, abandoned) maps to a defined outcome |
| Leaderboard staleness | Leaderboard phase | Test: record a battle result, confirm leaderboard reflects it within 5 seconds |
| Hero image performance | Landing page phase | Lighthouse mobile audit: score must be 70+ before phase is complete |
| Profile empty states | User profile phase | Manual test: create fresh account with no battle history; verify all sections have graceful empty states |
| Replay schema undefined | Battle system phase | Schema review: battle record must contain full event log fields before any battles are recorded |
| Store placeholder quality | Store placeholder phase | Design review: placeholder must match site's design quality, include a CTA and a Discord link |

---

## Sources

- Discord OAuth2 official documentation: https://docs.discord.com/developers/topics/oauth2
- Discord refresh token rotation bug report confirming rotating token behavior: https://github.com/discord/discord-api-docs/issues/5942
- Elo system limitations — Hacker News discussion: https://news.ycombinator.com/item?id=23908560
- "Elo Rating Systems Are Terrible For MOBAs" — analysis of abandonment/avoidance incentive: https://mmos.com/editorials/elo-rating-systems-are-terrible-for-mobas
- Pokémon Showdown replay data requirements (full team storage): https://www.smogon.com/forums/threads/full-information-replays-for-random-battles.3652886/
- Building a Multiplayer Elo Rating System — Gautam Narula: https://gautamnarula.com/rating/
- Player retention — Minecraft server community patterns: https://www.pixelmine.com/posts/player-retention-guide-for-your-minecraft-server
- Cobblemon server community best practices: https://cobblemon.com/en/servers
- Designing a Leaderboard System — Beamable: https://beamable.com/blog/designing-a-leaderboard-system
- 5 Common Mistakes New Minecraft Server Owners Make: https://www.pixelmine.com/posts/5-common-mistakes-new-minecraft-server-owners-make-and-how-to-avoid-them

---

*Pitfalls research for: CraftPro Brasil — Minecraft/Pokémon community website with competitive elo ranking, Discord OAuth, leaderboards, user profiles, battle replays*
*Researched: 2026-03-18*
