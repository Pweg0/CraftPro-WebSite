---
phase: 2
slug: autentica-o
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (exists from Phase 1) |
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
| 02-01-01 | 01 | 1 | AUTH-01 | integration | `npx vitest run tests/auth.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | AUTH-02 | integration | `npx vitest run tests/auth.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | AUTH-01 | unit | `npx vitest run tests/navbar-auth.test.tsx` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | AUTH-03 | unit | `npx vitest run tests/navbar-auth.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/auth.test.ts` — stubs for auth flow tests
- [ ] `tests/navbar-auth.test.tsx` — stubs for navbar auth state tests
- [ ] Neon DATABASE_URL provisioned in `.env.local`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Discord OAuth redirect flow | AUTH-01 | External OAuth provider | Click login, authorize on Discord, verify redirect back |
| Session persists after browser close | AUTH-02 | Browser state required | Login, close browser, reopen, verify still logged in |
| Avatar dropdown renders correctly | AUTH-01 | Visual check | Login, verify avatar + dropdown with Perfil/Sair |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
