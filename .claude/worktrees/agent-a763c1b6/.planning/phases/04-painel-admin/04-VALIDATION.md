---
phase: 4
slug: painel-admin
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x + @testing-library/react |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | Schema + seed | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | Auth middleware | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | CRUD banned items | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 2 | CRUD servers | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 04-02-03 | 02 | 2 | CRUD shop items | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 3 | Leaderboard view | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 04-03-02 | 03 | 3 | Player ban | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 04-03-03 | 03 | 3 | Audit log | unit | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/admin/` — test directory for admin-related tests
- [ ] Test stubs for schema validation, auth checks, CRUD operations

*Existing vitest infrastructure covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin sidebar responsive drawer | Layout | Visual layout check | Open /admin on mobile viewport, verify drawer opens |
| Dashboard stats display | Layout | Visual composition | Open /admin dashboard, verify stats cards render |
| 403 page visual theme | Access | Visual styling | Access /admin as non-admin, verify themed 403 page |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
