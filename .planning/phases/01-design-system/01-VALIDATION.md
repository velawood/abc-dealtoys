---
phase: 1
slug: design-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — design-only phase; `pnpm build` is the primary automated check |
| **Config file** | none — Wave 0 adds build-smoke scripts if needed |
| **Quick run command** | `pnpm build` |
| **Full suite command** | `pnpm build && pnpm preview` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm build`
- **After every plan wave:** Run `pnpm build && pnpm preview`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | BRAND-01 | manual-only | N/A — requires browser visual verification | N/A | ⬜ pending |
| 1-01-02 | 01 | 1 | BRAND-02 | manual-only | Visual inspection at 3 viewports | N/A | ⬜ pending |
| 1-02-01 | 02 | 1 | BRAND-04 | smoke | `pnpm build && grep -r 'href="/about"' dist/` | ❌ W0 | ⬜ pending |
| 1-02-02 | 02 | 1 | BRAND-05 | smoke | `pnpm build && grep -r 'ABC Deal Toys' dist/` | ❌ W0 | ⬜ pending |
| 1-03-01 | 03 | 2 | BRAND-03 | manual-only | Chrome DevTools 375px emulation | N/A | ⬜ pending |
| 1-03-02 | 03 | 2 | BRAND-06 | manual-only | Visual inspection required | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Convert Baskervville TTF → WOFF2 and place in `public/fonts/`
- [ ] Verify `pnpm build` passes cleanly before any changes

*No test framework installation required — this is a design/theming phase where `pnpm build` catches compilation errors and manual visual review covers brand requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Baskervville renders with no FOUT | BRAND-01 | Visual/perceptual — requires browser rendering | Load page, observe no flash of fallback font; check Network tab for preload hits |
| Brand colors render correctly | BRAND-02 | Visual — color accuracy requires human judgment | Inspect elements, verify gold=#ebbc28, navy=#052a38, slate=#1a1b1b, ivy=#00442e |
| Mobile viewport usable at 375px | BRAND-03 | Layout/interaction — requires touch simulation | DevTools → 375px viewport; verify all content visible, tap targets ≥44px |
| Hover states and transitions | BRAND-06 | Animation smoothness requires visual verification | Hover buttons/links/cards; confirm smooth transitions, no jank |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
