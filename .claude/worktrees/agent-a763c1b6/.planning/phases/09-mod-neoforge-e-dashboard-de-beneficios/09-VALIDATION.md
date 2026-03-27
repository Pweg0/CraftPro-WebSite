---
phase: 9
slug: mod-neoforge-e-dashboard-de-beneficios
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | MOD-01 | unit | `npx vitest run tests/deliveries-api.test.ts` | ❌ W0 | ⬜ pending |
| 09-01-02 | 01 | 1 | MOD-03 | unit | `npx vitest run tests/admin-beneficios.test.ts` | ❌ W0 | ⬜ pending |
| 09-02-01 | 02 | 2 | MOD-04 | unit | `npx vitest run tests/admin-vendas.test.ts` | ❌ W0 | ⬜ pending |
| 09-03-01 | 03 | 3 | MOD-01 | manual | N/A (Java mod) | N/A | ⬜ pending |
| 09-03-02 | 03 | 3 | MOD-02 | manual | N/A (Java mod) | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/deliveries-api.test.ts` — stubs for MOD-01 API endpoints
- [ ] `tests/admin-beneficios.test.ts` — stubs for MOD-03 benefits dashboard
- [ ] `tests/admin-vendas.test.ts` — stubs for MOD-04 sales log

*Existing vitest infrastructure covers framework setup.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mod polling + FTB Ranks delivery | MOD-01 | Java mod runs on Minecraft server | Deploy mod, create test order, verify rank applied |
| Expiration timer + rank removal | MOD-02 | Requires running Minecraft server + time passage | Set short expiry, wait, verify rank removed |
| Chat notification on expiry | MOD-02 | In-game chat output | Be online when benefit expires, check chat message |
| Revocation via admin | MOD-03 | End-to-end: admin action → mod picks up → rank removed | Revoke in admin, verify mod removes rank |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
