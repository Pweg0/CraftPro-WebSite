---
phase: 09-mod-neoforge-e-dashboard-de-beneficios
plan: 02
subsystem: mod-neoforge
tags: [neoforge, java, mod, delivery, benefits, ftb-ranks]
requirements-completed: [MOD-01, MOD-02, MOD-03]

dependency_graph:
  requires:
    - mod/build.gradle (NeoGradle build config)
  provides:
    - mod/ NeoForge mod project (compilable)
    - /api/deliveries/pending polling every 30s
    - /api/deliveries/confirm delivery confirmation
    - /api/deliveries/expired expiration notification
    - benefits.json local persistence
  affects:
    - orders table (delivery status updated via confirm/expired endpoints)
    - FTB Ranks permissions on game server

tech_stack:
  added:
    - NeoForge 21.1.84
    - NeoGradle 7.1.21
    - Java 21 (HttpClient, CompletableFuture)
    - Gson (JSON serialization for config + benefits persistence)
  patterns:
    - ServerTickEvent.Post for tick-based polling (never block game thread)
    - CompletableFuture.runAsync for all HTTP calls
    - synchronized methods on BenefitManager for thread safety
    - CopyOnWriteArrayList for DeliveryQueue (lock-free reads)
    - JSON config file auto-generated on first run

key_files:
  created:
    - mod/build.gradle
    - mod/settings.gradle
    - mod/gradle.properties
    - mod/src/main/resources/META-INF/neoforge.mods.toml
    - mod/src/main/java/com/craftprobrasil/craftpro/CraftProMod.java
    - mod/src/main/java/com/craftprobrasil/craftpro/config/CraftProConfig.java
    - mod/src/main/java/com/craftprobrasil/craftpro/api/SiteApiClient.java
    - mod/src/main/java/com/craftprobrasil/craftpro/delivery/PendingDelivery.java
    - mod/src/main/java/com/craftprobrasil/craftpro/delivery/ActiveBenefit.java
    - mod/src/main/java/com/craftprobrasil/craftpro/delivery/PendingRevocation.java
    - mod/src/main/java/com/craftprobrasil/craftpro/delivery/BenefitManager.java
    - mod/src/main/java/com/craftprobrasil/craftpro/delivery/DeliveryQueue.java
    - mod/src/main/java/com/craftprobrasil/craftpro/scheduler/TickScheduler.java
    - mod/src/main/java/com/craftprobrasil/craftpro/command/CraftProCommand.java
  modified: []

decisions:
  - "FTB Ranks commands use player name (not UUID) — /ftbranks add/remove playerName rankSlug"
  - "rankSlug derived from itemName.toLowerCase().replace(' ', '_') — no separate slug field in PendingDelivery"
  - "AtomicBoolean polling flag prevents concurrent API polls if previous request is still in flight"
  - "Default itemDuration is 30 days when null or zero — safe fallback for items without duration"

metrics:
  duration: 4 minutes
  completed: 2026-03-27
  tasks_completed: 2
  files_created: 14
  files_modified: 0
---

# Phase 9 Plan 02: NeoForge Mod — Delivery and Benefit Management Summary

**One-liner:** NeoForge 1.21.1 mod that polls site API every 30s, delivers FTB Ranks via commands, persists active benefits to JSON, handles expirations via tick scheduler, and confirms all state changes back to the site.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Gradle project scaffold + config + API client + data POJOs | 19399d7e | mod/build.gradle, mod/settings.gradle, mod/gradle.properties, neoforge.mods.toml, CraftProMod.java, CraftProConfig.java, SiteApiClient.java, PendingDelivery.java, ActiveBenefit.java, PendingRevocation.java |
| 2 | BenefitManager + DeliveryQueue + TickScheduler + Commands | 85eac80d | BenefitManager.java, DeliveryQueue.java, TickScheduler.java, CraftProCommand.java |

## What Was Built

**NeoForge Mod Project (`mod/`)** — A complete server-side mod for NeoForge 1.21.1 that replaces the RCON-based delivery system.

### Architecture

```
CraftProMod (@Mod entrypoint)
  ├── Registers TickScheduler on NeoForge event bus
  ├── Loads CraftProConfig on ServerStarting
  └── Loads BenefitManager (restores benefits.json on restart)

TickScheduler (ServerTickEvent.Post)
  ├── Every 600 ticks (30s): polls /api/deliveries/pending via CompletableFuture.runAsync
  │     └── Queues new orders in DeliveryQueue (handles offline players)
  │     └── Processes online players immediately after poll
  └── Every 1200 ticks (60s): BenefitManager.checkExpirations()

DeliveryQueue
  ├── CopyOnWriteArrayList for orders + revocations
  ├── processQueue(): delivers /ftbranks add to online players
  └── processRevocations(): executes /ftbranks remove for admin revocations

BenefitManager
  ├── synchronized List<ActiveBenefit> in-memory state
  ├── Persists to config/craftpro/benefits.json via Gson
  ├── Restored on server start (survives server restarts)
  └── checkExpirations(): removes expired, executes /ftbranks remove, notifies site + player

CraftProCommand
  ├── /craftpro status — shows active benefits count and pending queue (any player)
  └── /craftpro reload — reloads config and benefits from disk (op-only)
```

### Key API Interactions

- `GET /api/deliveries/pending` — Bearer auth, fetches paid orders + admin revocations
- `POST /api/deliveries/confirm` — Sends `{orderId, expiresAt}` after successful /ftbranks add
- `POST /api/deliveries/expired` — Sends `{orderId}` when benefit expires naturally

### Offline Player Handling (D-03)

When a player is offline at poll time, the order is queued in `DeliveryQueue`. On every subsequent poll (every 30s), online players are checked and the queued order is delivered. This ensures no orders are lost.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All delivery, expiration, and confirmation logic is fully implemented. The mod depends on the site's API endpoints (`/api/deliveries/pending`, `/api/deliveries/confirm`, `/api/deliveries/expired`) which are implemented in a separate plan (09-01 or 09-03).

## Self-Check: PASSED

All created files verified:
- mod/build.gradle: exists, contains NeoGradle + neoforge dependency
- mod/src/main/resources/META-INF/neoforge.mods.toml: exists, modId = "craftpro", side = "SERVER"
- All 10 Java source files: exist under correct package paths
- No Thread.sleep() anywhere in mod source
- All HTTP calls wrapped in CompletableFuture.runAsync
- BenefitManager: 8 synchronized methods
- FTB Ranks commands use player name (not UUID)
