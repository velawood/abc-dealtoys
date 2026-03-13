---
phase: 02-homepage
plan: 01
subsystem: ui
tags: [astro, svelte, svelte-inview, scroll-animations, homepage, hero]

requires:
  - phase: 01-design-system
    provides: Brand tokens (gold/navy/slate/ivy colors), .button/.button-outline CSS classes, BaseLayout with Header+Footer, Baskervville font

provides:
  - Hero section with "Celebrate the Closers" headline, brand copy, CTAs to /products and /contact
  - MissionStatement section with storytelling brand copy
  - ScrollReveal.svelte reusable scroll-triggered animation wrapper using svelte-inview
  - Composed homepage with Hero, MissionStatement, and product grid sections

affects: [03-brand-content-pages, 04-checkout-customization]

tech-stack:
  added: [svelte-inview 4.0.4]
  patterns:
    - ScrollReveal.svelte wrapping pattern for fade-up/fade-in/fade-left/fade-right scroll animations
    - client:visible hydration for Svelte components below the fold
    - Staggered delay props (0/150/300/450ms) for cascading reveal effect
    - Direct ProductCard import in index.astro instead of Products component to avoid double-nested containers

key-files:
  created:
    - src/components/ScrollReveal.svelte
    - src/components/Hero.astro
    - src/components/MissionStatement.astro
    - public/images/hero-deal-toys.jpg
  modified:
    - src/pages/index.astro
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "svelte-inview v4.0.4 installed -- oninview_enter event handler works with Svelte 5 syntax"
  - "ABC Imagery.jpg chosen as hero image pending visual verification at checkpoint"
  - "Direct ProductCard import in index.astro avoids double-nested container from Products.astro wrapper"
  - "client:visible (not client:load) used for ScrollReveal hydration per correct Astro pattern for scroll components"

patterns-established:
  - "ScrollReveal wrapper: import and use with client:visible for any content needing scroll-triggered reveal"
  - "Staggered delay pattern: 0ms, 150ms, 300ms, 450ms for sequential element reveals"

requirements-completed: [HOME-01, HOME-02]

duration: 3min
completed: 2026-03-12
---

# Phase 02 Plan 01: Homepage Build Summary

**Full-width hero with "Celebrate the Closers" narrative, mission storytelling section, and scroll-triggered reveal using svelte-inview 4.0.4**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-12T20:48:27Z
- **Completed:** 2026-03-12T20:49:55Z
- **Tasks:** 2 of 3 (Task 3 is a visual checkpoint awaiting user approval)
- **Files modified:** 7

## Accomplishments
- Installed svelte-inview 4.0.4 and created ScrollReveal.svelte with 4 animation modes and staggered delay support
- Built Hero.astro with "Celebrate the Closers" headline, brand copy, hero image, and CTA buttons (/products and /contact)
- Built MissionStatement.astro with brand storytelling copy reinforcing the "closers" narrative
- Rewrote index.astro to compose Hero, MissionStatement, and branded product grid — all with scroll reveals

## Task Commits

Each task was committed atomically:

1. **Task 1: Install svelte-inview, prepare hero image, create ScrollReveal** - `605a970` (feat)
2. **Task 2: Build Hero, MissionStatement, and compose homepage** - `bacb7a2` (feat)

**Plan metadata:** TBD (pending checkpoint completion)

## Files Created/Modified
- `src/components/ScrollReveal.svelte` - Reusable scroll-triggered animation wrapper using svelte-inview
- `src/components/Hero.astro` - Full-width hero section with headline, copy, CTA, and brand image
- `src/components/MissionStatement.astro` - Mission storytelling section with brand credibility copy
- `public/images/hero-deal-toys.jpg` - Hero image copied from assets/images/Jpgs/ABC Imagery.jpg
- `src/pages/index.astro` - Composed homepage with Hero, MissionStatement, and product grid sections
- `package.json` / `pnpm-lock.yaml` - svelte-inview 4.0.4 added

## Decisions Made
- svelte-inview 4.0.4 uses `oninview_enter` handler (Svelte 5 compatible) — confirmed via package types before writing component
- `ABC Imagery.jpg` chosen as hero image — visual checkpoint will determine if it's appropriate
- Direct `ProductCard` import in `index.astro` instead of `Products` component to avoid double-nested container divs
- `client:visible` hydration for all ScrollReveal instances — correct Astro pattern for intersection-observer-based components

## Deviations from Plan

None — plan executed exactly as written, with one minor implementation confirmation: checked svelte-inview v4 API types before writing ScrollReveal to confirm `oninview_enter` event name (plan noted this as something to verify after install).

## Issues Encountered

None — build passed cleanly on both Task 1 and Task 2 verifications.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Homepage composition complete and building cleanly
- Awaiting visual checkpoint (Task 3) — user must confirm hero image, animations, mobile layout, and product grid
- After checkpoint approval, plan is fully complete and Phase 2 Plan 2 can proceed

---
*Phase: 02-homepage*
*Completed: 2026-03-12*
