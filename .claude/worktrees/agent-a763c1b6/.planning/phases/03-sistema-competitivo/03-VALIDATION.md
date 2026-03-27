---
phase: 3
slug: sistema-competitivo
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x |
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
| 03-01-01 | 01 | 1 | RANK-04 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | RANK-01 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | RANK-02 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 1 | RANK-03 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 2 | PROF-01 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 2 | PROF-02 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test stubs for leaderboard API/page rendering (RANK-01, RANK-02)
- [ ] Test stubs for tier badge rendering (RANK-03)
- [ ] Test stubs for profile page rendering (PROF-01, PROF-02)

*Existing vitest infrastructure covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Tier badge visual appearance | RANK-03 | Visual correctness (colors, positioning) | Open /ranking, verify each tier shows correct color badge |
| ISR revalidation within 60s | RANK-04 | Timing-dependent behavior | POST a match via /api/replays, refresh /ranking within 60s, verify updated ELO |
| 3D skin render loads | PROF-01 | External service (crafatar.com) | Open /perfil/[uuid], verify 3D body render displays |
| Empty state for new profile | PROF-01 | Visual/UX check | Access profile of player with 0 matches, verify clean empty state |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
