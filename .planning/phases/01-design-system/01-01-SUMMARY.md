---
phase: 01-design-system
plan: 01
subsystem: ui
tags: [tailwindcss, fonts, woff2, baskervville, astro, css-variables]

# Dependency graph
requires: []
provides:
  - WOFF2 variable font files for Baskervville (normal and italic) in public/fonts/
  - "@theme block with brand color tokens: --color-gold (#ebbc28), --color-navy (#052a38), --color-slate (#1a1b1b), --color-ivy (#00442e)"
  - Tailwind v4 utility classes bg-gold, text-navy, text-slate, bg-ivy, etc.
  - Font preloading in BaseLayout via <link rel="preload"> with crossorigin attribute
  - Default font family set to Baskervville across entire site
affects: [02-design-system, 03-design-system, 04-design-system, header, footer, micro-interactions]

# Tech tracking
tech-stack:
  added: [fonttools, brotli (for WOFF2 compression via uv)]
  patterns:
    - "@theme at top-level (not nested in @layer) for Tailwind v4 utility generation"
    - "@font-face in @layer base with font-weight range syntax (100 900) for variable fonts"
    - "Font preload links with crossorigin before stylesheet in <head>"

key-files:
  created:
    - public/fonts/Baskervville-VariableFont_wght.woff2
    - public/fonts/Baskervville-Italic-VariableFont_wght.woff2
  modified:
    - src/styles/global.css
    - src/layouts/BaseLayout.astro

key-decisions:
  - "Used uv run --with fonttools to convert TTF to WOFF2 without a pyproject.toml — avoids adding Python project infrastructure"
  - "@theme block kept top-level (not inside @layer) per Tailwind v4 requirement for utility class generation"
  - "AnnouncementBar removed from BaseLayout per plan — component still exists but no longer rendered"
  - "font-display: swap used on @font-face to prevent invisible text during font load (FOIT → FOUT trade-off)"

patterns-established:
  - "Brand colors: always use --color-gold (#ebbc28), --color-navy (#052a38), --color-slate (#1a1b1b), --color-ivy (#00442e)"
  - "Default body text is text-slate (#1a1b1b), not browser-default black"
  - "Container: max-width 80rem with 1.5rem padding-inline"

requirements-completed: [BRAND-01, BRAND-02]

# Metrics
duration: 2min
completed: 2026-03-12
---

# Phase 1 Plan 01: Brand Foundation Summary

**Baskervville WOFF2 variable fonts with Tailwind v4 @theme color tokens (gold, navy, slate, ivy) and FOUT-preventing preload links in BaseLayout**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-13T01:40:36Z
- **Completed:** 2026-03-13T01:42:40Z
- **Tasks:** 2
- **Files modified:** 4 (including 2 new binary font files)

## Accomplishments

- Converted two Baskervville TTF variable fonts to WOFF2 format (57K normal, 49K italic — ~58% size reduction from source TTFs)
- Defined brand color tokens in Tailwind v4 @theme block: gold (#ebbc28), navy (#052a38), slate (#1a1b1b), ivy (#00442e)
- Set Baskervville as the default site font via --default-font-family token
- Added font preload links with crossorigin to BaseLayout — prevents double-fetch browser bug
- Removed AnnouncementBar from BaseLayout and updated title/description/viewport meta

## Task Commits

Each task was committed atomically:

1. **Task 1: Convert fonts to WOFF2 and define brand theme tokens** - `8564b6e` (feat)
2. **Task 2: Update BaseLayout with font preloading and cleanup** - `59bb63e` (feat)

## Files Created/Modified

- `public/fonts/Baskervville-VariableFont_wght.woff2` - Variable font, normal style, all weights (57K)
- `public/fonts/Baskervville-Italic-VariableFont_wght.woff2` - Variable font, italic style, all weights (49K)
- `src/styles/global.css` - Rewrote with @theme tokens, @font-face rules, updated body/container styles
- `src/layouts/BaseLayout.astro` - Font preload links, removed AnnouncementBar, updated title/description/viewport

## Decisions Made

- Used `uv run --with fonttools` for font conversion — no pyproject.toml required, no permanent Python project overhead
- Placed @theme block top-level (not inside @layer) per Tailwind v4 spec — nesting would silently break utility generation
- Used `font-display: swap` — acceptable FOUT trade-off given preloading minimizes flash duration
- `crossorigin` attribute on preload links is required — without it, browsers fetch fonts twice (preload vs @font-face)

## Deviations from Plan

None - plan executed exactly as written. The only minor issue was missing `public/fonts/` directory (created before conversion) and missing node_modules (installed via pnpm install). Both were routine setup steps.

## Issues Encountered

- `pnpm build` failed initially because node_modules were missing — ran `pnpm install` to resolve (Rule 3: blocking issue)
- `public/fonts/` directory didn't exist yet — created before running fonttools conversion

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Brand foundation complete: Baskervville renders on every page, brand color utilities available as Tailwind classes
- Header (01-02) and Footer (01-03) can now use `text-navy`, `bg-gold`, `text-slate`, `font-baskervville` utilities
- Micro-interactions plan (01-03) can add `.button` class building on this theme foundation

---
*Phase: 01-design-system*
*Completed: 2026-03-12*
