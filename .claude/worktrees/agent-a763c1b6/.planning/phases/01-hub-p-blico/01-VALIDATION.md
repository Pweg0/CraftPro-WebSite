---
phase: 1
slug: hub-p-blico
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run && npx next build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run && npx next build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | LAND-05 | build | `npx next build` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 2 | LAND-01 | visual | Manual — hero renders | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 2 | LAND-02 | e2e | Manual — navbar links work | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 2 | LAND-04 | visual | Manual — parallax animates | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | SERV-01 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 2 | SERV-02 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 2 | SERV-03 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-03-04 | 03 | 2 | EXTRA-01 | visual | Manual — banned items render | ❌ W0 | ⬜ pending |
| 01-03-05 | 03 | 2 | EXTRA-02 | visual | Manual — store placeholder | ❌ W0 | ⬜ pending |
| 01-03-06 | 03 | 2 | EXTRA-03 | visual | Manual — replays stub | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` + `@testing-library/react` — install test framework
- [ ] `vitest.config.ts` — configure with Next.js support
- [ ] Stub test files for server status API integration

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Hero parallax animation | LAND-04 | Visual animation cannot be unit tested | Open site, scroll down, verify parallax effect on hero image |
| Navbar responsive hamburger | LAND-02, LAND-05 | Mobile layout requires visual check | Resize to mobile, tap hamburger, verify menu opens |
| Server card glow effect | SERV-01 | CSS visual effect | Check server cards have green glow (online) or gray (offline) |
| Hero image quality | LAND-01 | Visual quality check | Verify WebP renders crisp at full viewport width |
| Store teaser visual | EXTRA-02 | Design quality check | Verify store page shows category previews |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
