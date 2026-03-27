---
phase: 5
slug: loja-funcional
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 + Testing Library |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose` (affected test file only)
- **After every plan wave:** Run `npx vitest run` (full suite)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | SHOP-01 | unit | `npx vitest run src/app/(public)/loja/` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 2 | SHOP-02 | unit (mock MP SDK) | `npx vitest run src/lib/shop/` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 2 | SHOP-03 | unit | `npx vitest run src/lib/shop/rcon.test.ts` | ❌ W0 | ⬜ pending |
| 05-02-03 | 02 | 2 | SHOP-06 | unit | `npx vitest run src/app/api/webhooks/` | ❌ W0 | ⬜ pending |
| 05-02-04 | 02 | 2 | SHOP-05 | unit (mock DB) | `npx vitest run src/app/api/cron/` | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | 3 | SHOP-04 | unit | `npx vitest run src/app/(public)/loja/pedido/` | ❌ W0 | ⬜ pending |
| 05-03-02 | 03 | 3 | SHOP-07 | unit | `npx vitest run src/app/(admin)/admin/pedidos/` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/shop/rcon.test.ts` — stubs for SHOP-03 (resolveRconCommand logic)
- [ ] `src/app/api/webhooks/mercadopago/route.test.ts` — stubs for SHOP-06 (HMAC validation, idempotency)
- [ ] `src/app/api/cron/process-orders/route.test.ts` — stubs for SHOP-05 (48h cutoff, batch limit)
- [ ] `src/lib/shop/actions.test.ts` — stubs for SHOP-02 (MP preference creation with mocked SDK)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| MercadoPago sandbox end-to-end | SHOP-02 | Requires real sandbox credentials + webhook delivery | Create test payment in sandbox, verify webhook fires and order status updates |
| RCON delivery to game server | SHOP-03 | Requires live Minecraft server connection | Connect to RCON, send test command, verify LuckPerms applied rank |
| cron-job.org trigger | SHOP-05 | External service configuration | Set up cron-job.org to hit /api/cron/process-orders, verify orders are processed |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
