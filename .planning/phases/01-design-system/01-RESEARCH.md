# Phase 1: Design System - Research

**Researched:** 2026-03-12
**Domain:** Tailwind CSS v4 theming, self-hosted fonts (WOFF2), Astro layout system, mobile-responsive design, CSS micro-interactions
**Confidence:** HIGH

## Summary

This phase transforms a bare-bones Astro/Svelte/Tailwind starter into a fully branded design system. The codebase is already established (Astro 5.18, Svelte 5, Tailwind CSS 4.2, @tailwindcss/vite plugin) with a working BaseLayout, Header, Footer, and global.css. No framework installation is needed — the work is pure theming, font integration, and component refactoring.

The most consequential technical decision is font format conversion. The assets directory contains Baskervville TTF files (both variable and static weights). These must be converted to WOFF2 before deployment — WOFF2 is 60–70% smaller and is the only format that needs to be served to modern browsers. Tailwind CSS v4 uses a CSS-first `@theme` block (no `tailwind.config.js`) to define color and font tokens that automatically generate utility classes.

Two credible paths exist for font integration: (1) manual `@font-face` declarations in `global.css` with `<link rel="preload">` tags in `BaseLayout.astro`, or (2) the Astro Font API (experimental as of Astro 5.7), which automates preloading and fallback generation. Given the experimental status and additional complexity of the Font API, the manual approach is recommended for v1 — it is well-understood, stable, and gives full control over `font-display: swap`.

**Primary recommendation:** Convert Baskervville TTF to WOFF2 using fonttools/pyftsubset, declare `@font-face` rules in `global.css` inside `@layer base`, register font/color tokens in `@theme`, and preload the regular and italic WOFF2 files via `<link rel="preload">` in `BaseLayout.astro`.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BRAND-01 | Site uses Baskerville as primary typeface (self-hosted from assets, all weights, font-display: swap, preloading) | TTF→WOFF2 conversion via fonttools; @font-face in @layer base; preload links in BaseLayout.astro; --default-font-family in @theme |
| BRAND-02 | Brand colors applied site-wide via Tailwind theme tokens (Victory Gold #ebbc28, Heritage Navy #052a38, Slate #1a1b1b, Ivy Green #00442e) | Tailwind v4 @theme with --color-* namespace generates bg-*, text-*, border-* utilities automatically |
| BRAND-03 | All pages are mobile-responsive with touch-friendly interactions | Tailwind mobile-first breakpoints (sm:, md:, lg:); v4 hover only applies on hover-capable devices by default; min 44x44px tap targets |
| BRAND-04 | Header navigation links to all pages with branded styling | Refactor existing Header.astro: add nav links, apply brand color utilities, sticky behavior already present |
| BRAND-05 | Footer with company info, navigation links, and brand identity | Refactor existing Footer.astro: replace Astro-starter boilerplate with brand content, columns layout |
| BRAND-06 | Micro-interactions on interactive elements (hover states, scroll reveals, subtle transitions) | Tailwind `transition` utilities + CSS custom properties; `transition-all duration-200` pattern; GPU-accelerated properties (opacity, transform) |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | 4.2.1 | Utility-first CSS framework | Already installed via @tailwindcss/vite |
| Astro | 5.18.0 | Page rendering and layout | Already installed; BaseLayout.astro is the shell |
| Svelte | 5.x | Interactive component framework | Already installed; CartDrawer, CartIcon use it |
| TypeScript | 5.9.x | Type safety | Already installed |

### Supporting (needs adding for font conversion)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| fonttools + brotli | latest (pip) | TTF → WOFF2 conversion | One-time conversion of Baskervville TTF files before serving |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual @font-face | Astro Font API (experimental) | Font API automates preloads/fallbacks but is marked experimental in Astro 5.7; manual is stable and sufficient |
| fonttools CLI | Online converters (transfonter.org) | Online tools work but CLI is reproducible and scriptable |
| @layer base for @font-face | @layer components | base is correct layer for element-level resets and font declarations |

**Font conversion (one-time, not a package install):**
```bash
pip install fonttools brotli
# Convert variable font (covers all weights dynamically)
python -m fonttools.ttLib.woff2 compress "assets/fonts/Baskervville.zip (Unzipped Files)/Baskervville-VariableFont_wght.ttf"
python -m fonttools.ttLib.woff2 compress "assets/fonts/Baskervville.zip (Unzipped Files)/Baskervville-Italic-VariableFont_wght.ttf"
# Move output woff2 files to public/fonts/
```

## Architecture Patterns

### Recommended Project Structure
```
public/
└── fonts/                      # WOFF2 files served statically (no build processing)
    ├── Baskervville-Regular.woff2
    ├── Baskervville-Italic.woff2
    └── Baskervville-Bold.woff2
src/
├── styles/
│   └── global.css              # @font-face + @theme tokens + @layer base resets
├── layouts/
│   └── BaseLayout.astro        # Preload link tags + global font applied to <html>
├── components/
│   ├── Header.astro            # Branded nav with all page links
│   └── Footer.astro            # Brand footer with company info
└── pages/                      # Existing pages; pick up brand styles automatically
```

### Pattern 1: Tailwind CSS v4 Theme Tokens

**What:** Define brand colors and font family as CSS custom properties inside `@theme` in global.css. Tailwind automatically generates utility classes for all `--color-*` and `--font-*` variables.

**When to use:** Always — this is the v4 replacement for `tailwind.config.js` theme extension.

**Example:**
```css
/* src/styles/global.css */
/* Source: https://tailwindcss.com/docs/theme */

@import "tailwindcss";

@theme {
  /* Brand colors — generate bg-gold, text-navy, etc. */
  --color-gold: #ebbc28;
  --color-navy: #052a38;
  --color-slate: #1a1b1b;
  --color-ivy: #00442e;

  /* Font family — generates font-baskervville utility class */
  --font-baskervville: "Baskervville", "Georgia", serif;

  /* Apply as the global default */
  --default-font-family: var(--font-baskervville);
}
```

Resulting utilities automatically available:
- `bg-gold`, `text-gold`, `border-gold`, `fill-gold`, `ring-gold`
- `bg-navy`, `text-navy`, `bg-slate`, `text-slate`, `bg-ivy`, `text-ivy`
- `font-baskervville` (also applied globally via `--default-font-family`)

### Pattern 2: Self-Hosted Font with font-display: swap

**What:** `@font-face` declarations in `@layer base` reference WOFF2 files in `/public/fonts/`. `font-display: swap` prevents invisible text.

**When to use:** BRAND-01 — required for Baskervville across all weights.

**Example:**
```css
/* src/styles/global.css */

@layer base {
  @font-face {
    font-family: "Baskervville";
    src: url("/fonts/Baskervville-VariableFont_wght.woff2") format("woff2");
    font-weight: 100 900;    /* Variable font supports full range */
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: "Baskervville";
    src: url("/fonts/Baskervville-Italic-VariableFont_wght.woff2") format("woff2");
    font-weight: 100 900;
    font-style: italic;
    font-display: swap;
  }
}
```

### Pattern 3: Font Preloading in BaseLayout.astro

**What:** `<link rel="preload">` in `<head>` tells the browser to fetch fonts before layout — eliminates FOUT on first load.

**When to use:** BRAND-01 — preload only the weights needed above the fold (regular + italic).

**Example:**
```astro
<!-- src/layouts/BaseLayout.astro -->
<head>
  <!-- Preload critical font weights -->
  <link
    rel="preload"
    href="/fonts/Baskervville-VariableFont_wght.woff2"
    as="font"
    type="font/woff2"
    crossorigin
  />
  <link
    rel="preload"
    href="/fonts/Baskervville-Italic-VariableFont_wght.woff2"
    as="font"
    type="font/woff2"
    crossorigin
  />
</head>
```

### Pattern 4: Branded Header with Full Navigation

**What:** Replace the placeholder `Header.astro` with branded nav using brand color utilities.

**When to use:** BRAND-04 — existing header links only to `/`; needs links to all v1 pages.

**Example:**
```astro
<!-- src/components/Header.astro -->
<header class="sticky top-0 z-40 bg-navy border-b border-gold/20">
  <div class="container flex items-center justify-between py-4">
    <a href="/" class="flex items-center gap-2">
      <Logo />
    </a>
    <nav class="hidden md:flex items-center gap-8 text-sm font-medium">
      <a href="/products" class="text-white/80 hover:text-gold transition-colors duration-200">Shop</a>
      <a href="/how-it-works" class="text-white/80 hover:text-gold transition-colors duration-200">How It Works</a>
      <a href="/about" class="text-white/80 hover:text-gold transition-colors duration-200">Our Story</a>
      <a href="/contact" class="text-white/80 hover:text-gold transition-colors duration-200">Get a Quote</a>
    </nav>
    <CartIcon client:load />
  </div>
</header>
```

### Pattern 5: CSS Micro-Interactions (BRAND-06)

**What:** Use Tailwind `transition` utilities on interactive elements. Stick to GPU-accelerated properties (`opacity`, `transform`, `color`, `background-color`) for smooth 60fps animations.

**When to use:** All buttons, links, cards, and nav items.

**Example:**
```css
/* src/styles/global.css — update .button utility */
@layer base {
  .button {
    @apply inline-flex items-center justify-center rounded-sm px-8 py-3;
    @apply bg-gold text-navy font-semibold text-sm tracking-wide;
    @apply transition-all duration-200 ease-in-out;
    @apply hover:bg-gold/90 hover:shadow-md;
    @apply focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:outline-none;
    @apply disabled:cursor-not-allowed disabled:opacity-60;
  }
}
```

### Anti-Patterns to Avoid

- **Serving TTF files directly:** WOFF2 is 60–70% smaller. Never reference `.ttf` files in `@font-face` for web delivery.
- **Preloading all font weights:** Preload only the critical path (regular + italic). Preloading too many files degrades performance.
- **Using `:root` instead of `@theme` for brand tokens:** `:root` variables do NOT generate Tailwind utility classes. Must use `@theme`.
- **`tailwind.config.js` for theme extension:** Tailwind CSS v4 uses CSS-first configuration; the JS config file is no longer standard.
- **Hover states without `transition`:** Abrupt color/background changes without transition feel cheap. Always pair hover state changes with `transition-colors` or `transition-all`.
- **Animation on layout properties (width, height, padding):** These trigger reflow. Use `transform` and `opacity` instead.
- **Hardcoding colors in component styles:** All brand colors must come from Tailwind utility classes (e.g., `text-navy`) so they update globally when the theme changes.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WOFF2 conversion | Custom build script | fonttools CLI (`pip install fonttools brotli`) | fonttools handles variable fonts, subsetting, and correct Brotli compression |
| Font preloading | JavaScript font loader | Native `<link rel="preload">` + `font-display: swap` | Browser-native, zero JS overhead, works in SSR context |
| Color system | Hardcoded hex values in components | Tailwind `@theme` tokens (`--color-gold`, etc.) | Changes propagate everywhere; IDE autocomplete works |
| Responsive nav toggle | Custom JS event listeners | CSS-only approach or Svelte component with `bind:checked` | Less complexity; Svelte's reactivity handles state cleanly |
| Scroll reveal animations | Custom IntersectionObserver in every component | CSS `@keyframes` + `animation-timeline: scroll()` OR defer to Phase 2 with svelte-inview | IntersectionObserver is boilerplate-heavy; svelte-inview v4 noted for Phase 2 in STATE.md |

**Key insight:** Tailwind CSS v4's `@theme` block does the heavy lifting of a design token system — no additional library (style-dictionary, tokens-studio) is needed at this scale.

## Common Pitfalls

### Pitfall 1: FOUT (Flash of Unstyled Text) Despite `font-display: swap`

**What goes wrong:** Even with `font-display: swap`, if the font file is large and the network is slow, users see a flash of the fallback serif (Georgia/Times) before Baskervville loads, causing layout shift.

**Why it happens:** `font-display: swap` replaces invisible text with fallback immediately, but doesn't eliminate the swap moment. Without preloading, the font is discovered late.

**How to avoid:** Always pair `font-display: swap` with `<link rel="preload">` for the critical weight. The variable font file covers all weights in one request — preloading it eliminates the most common FOUT scenario.

**Warning signs:** Lighthouse "Avoid large layout shifts" warning; fonts listed under "Render-blocking resources" in DevTools.

### Pitfall 2: Tailwind v4 `@theme` Must Be Top-Level

**What goes wrong:** Nesting `@theme` inside `@layer base` or any selector causes tokens to be ignored — no utility classes are generated.

**Why it happens:** The `@theme` directive has a special parser in Tailwind v4 that expects top-level declarations.

**How to avoid:** Keep `@theme` at the top level of global.css, directly under `@import "tailwindcss"`.

**Warning signs:** `bg-gold` or `text-navy` classes have no effect; no `--color-gold` CSS variable appears in computed styles.

### Pitfall 3: `public/` vs `src/assets/` Font Placement

**What goes wrong:** Placing WOFF2 files in `src/assets/` (Astro's processed asset directory) causes incorrect URL paths at runtime in SSR mode; font 404s in production.

**Why it happens:** Astro processes and fingerprints files in `src/assets/` — the output URL changes. Font files referenced in CSS `@font-face` need stable, predictable URLs.

**How to avoid:** Place all font files in `public/fonts/`. They are served as-is at the path `/fonts/filename.woff2` in both dev and production.

**Warning signs:** 404 errors in the browser network tab for font files; fonts load locally but fail on Vercel.

### Pitfall 4: Variable Font `font-weight` Range Declaration

**What goes wrong:** Declaring `font-weight: 400` for a variable font causes only regular-weight text to render correctly. Bold and other weights fall back to faux-bold.

**Why it happens:** Variable fonts support a weight range. Without declaring the range, the browser doesn't know to use the variable axis.

**How to avoid:** Declare `font-weight: 100 900` in the `@font-face` rule (note the space-separated range syntax, not a single value).

**Warning signs:** Bold text looks slightly different from regular — slightly thicker but not true bold; no font-weight variation visible.

### Pitfall 5: Tailwind v4 Hover on Touch Devices

**What goes wrong:** In Tailwind v3, `hover:` styles applied on touch devices and got "stuck" after tap. In v4, this is fixed — hover utilities are wrapped in `@media (hover: hover)` by default.

**Why it happens:** This is correct behavior in v4, but developers may be surprised when testing on touch simulators that hover states don't trigger.

**How to avoid:** Don't fight this behavior — it is correct. For touch-specific feedback, use `active:` utilities instead.

**Warning signs:** Hover styles not visually triggering in Chrome DevTools touch emulation — this is expected and correct.

### Pitfall 6: Missing `crossorigin` Attribute on Font Preload

**What goes wrong:** The preloaded font file is fetched twice — once for the preload hint and again when the `@font-face` rule loads it — wasting bandwidth.

**Why it happens:** Fonts are always fetched with CORS. Without `crossorigin` on the preload link, the browser treats the preload and the actual font request as different resources.

**How to avoid:** Always include `crossorigin` (anonymous) on `<link rel="preload" as="font">` tags.

**Warning signs:** Network tab shows two requests for the same font file; "preload resource was not used" warning in DevTools console.

## Code Examples

### Complete global.css Structure

```css
/* src/styles/global.css */
/* Source: https://tailwindcss.com/docs/theme */

@import "tailwindcss";

/* 1. Theme tokens — generate all brand utility classes */
@theme {
  /* Brand colors */
  --color-gold: #ebbc28;        /* Victory Gold */
  --color-navy: #052a38;        /* Heritage Navy */
  --color-slate: #1a1b1b;       /* Slate */
  --color-ivy: #00442e;         /* Ivy Green */

  /* Font */
  --font-baskervville: "Baskervville", "Georgia", "Times New Roman", serif;
  --default-font-family: var(--font-baskervville);

  /* Existing animation — keep */
  --animate-shake: shake 0.5s infinite;
  @keyframes shake { /* ... */ }
}

/* 2. Base layer — font declarations and element resets */
@layer base {
  @font-face {
    font-family: "Baskervville";
    src: url("/fonts/Baskervville-VariableFont_wght.woff2") format("woff2");
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: "Baskervville";
    src: url("/fonts/Baskervville-Italic-VariableFont_wght.woff2") format("woff2");
    font-weight: 100 900;
    font-style: italic;
    font-display: swap;
  }

  html {
    @apply scroll-smooth;
  }

  body {
    @apply flex min-h-screen flex-col bg-white text-slate;
  }

  main {
    @apply flex-1;
  }
}

/* 3. Custom utilities */
@utility container {
  margin-inline: auto;
  padding-inline: 1.5rem;
  max-width: 80rem; /* 1280px */
}

/* 4. Component layer */
@layer base {
  .button {
    @apply inline-flex items-center justify-center;
    @apply bg-gold text-navy font-semibold text-sm tracking-wider uppercase;
    @apply px-8 py-3 rounded-sm;
    @apply transition-all duration-200 ease-in-out;
    @apply hover:bg-gold/85 hover:shadow-lg;
    @apply focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:outline-none;
    @apply disabled:cursor-not-allowed disabled:opacity-60;
  }
}
```

### BaseLayout.astro with Preload

```astro
---
// src/layouts/BaseLayout.astro
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";
import CartDrawer from "../components/CartDrawer.svelte";

export interface Props {
  title: string;
  description?: string;
}

const defaultDesc = "Custom deal toys and financial tombstones for closers.";
const { title, description = defaultDesc } = Astro.props;
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content={Astro.generator} />
    <title>{title} | ABC Deal Toys</title>
    <meta name="description" content={description} />

    <!-- Font preloads — must come BEFORE stylesheet link -->
    <link
      rel="preload"
      href="/fonts/Baskervville-VariableFont_wght.woff2"
      as="font"
      type="font/woff2"
      crossorigin
    />
    <link
      rel="preload"
      href="/fonts/Baskervville-Italic-VariableFont_wght.woff2"
      as="font"
      type="font/woff2"
      crossorigin
    />

    <style is:global>
      @import "../styles/global.css";
    </style>
  </head>
  <body>
    <CartDrawer client:idle />
    <Header />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

### Brand Color Usage in Components

```astro
<!-- Navy background, gold accent, white text -->
<header class="bg-navy text-white border-b border-gold/20">

<!-- Gold CTA button — uses .button class from global.css -->
<button class="button">Get a Quote</button>

<!-- Ivy green accent text -->
<span class="text-ivy font-semibold">Celebrate the Closers</span>

<!-- Card with hover micro-interaction -->
<div class="bg-white border border-slate/10 rounded-sm
            transition-shadow duration-200 hover:shadow-md hover:-translate-y-0.5">
```

### Mobile-Responsive Nav Pattern

```astro
<!-- Hidden on mobile, shown at md+ -->
<nav class="hidden md:flex items-center gap-8">
  <!-- desktop links -->
</nav>

<!-- Mobile menu toggle (Svelte component for state) -->
<button class="md:hidden p-2 min-w-[44px] min-h-[44px]" aria-label="Menu">
  <!-- hamburger icon -->
</button>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` theme.extend.colors | `@theme { --color-* }` in CSS | Tailwind v4 (early 2025) | No JS config file needed; colors are CSS variables at runtime |
| Multiple font format fallbacks (woff, woff2, ttf) | WOFF2 only | 2023+ | 97% browser support; simpler @font-face rules |
| Separate font-weight @font-face per weight | Single variable font @font-face with `font-weight: 100 900` | Variable fonts mainstream ~2022 | One HTTP request serves all weights |
| `font-display: optional` (no FOUT) | `font-display: swap` + preload (no FOUT, no delay) | Combination pattern | Best of both worlds when preload is available |
| Hover styles apply on touch | `@media (hover: hover)` wrapping (Tailwind v4 default) | Tailwind v4 | Eliminates "stuck hover" bug on mobile |

**Deprecated/outdated:**
- `tailwind.config.js`: No longer generated by default in v4 projects
- Multiple font format fallbacks (`.woff`, `.ttf` in `@font-face` src): Unnecessary for modern browsers
- `@astrojs/tailwind` integration: Replaced by `@tailwindcss/vite` plugin (already used in this project)

## Open Questions

1. **Baskervville font origin — is it truly "Baskerville"?**
   - What we know: The font in assets is "Baskervville" (note the double 'v'), which is a Google Fonts open-source approximation of Baskerville, not the commercial ITC Baskerville
   - What's unclear: Whether the brand requirement for "Baskerville" means this specific open-source font or a licensed version
   - Recommendation: Proceed with the Baskervville font already in assets — it matches the brand intent and is already provided. No action needed.

2. **Font subsetting requirement**
   - What we know: The STATE.md notes "Font subsetting (TTF → WOFF2 conversion) tooling needs confirmation before Phase 1 is marked done"
   - What's unclear: Whether to subset to Latin characters only or include full Unicode range
   - Recommendation: For the initial implementation, convert the full variable font to WOFF2 without subsetting. The variable font files are large (~300KB TTF → ~150KB WOFF2) but cover all weights. Subsetting can be a follow-up optimization if Lighthouse flags font size.

3. **Mobile hamburger menu implementation**
   - What we know: The existing Header.astro has no mobile navigation
   - What's unclear: Whether to use a pure CSS toggle (checkbox hack) or a Svelte component
   - Recommendation: Use a Svelte component (`MobileNav.svelte`) with `client:load` for the toggle state. This is consistent with the existing pattern (CartIcon is already a Svelte component with `client:load`).

4. **AnnouncementBar disposition**
   - What we know: `AnnouncementBar.astro` is imported in BaseLayout but contains generic starter content
   - What's unclear: Whether to keep, brand, or remove it in Phase 1
   - Recommendation: Remove it in Phase 1 (it's boilerplate) unless the client specifically wants one. If kept, brand it with `bg-gold text-navy`.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no test config files, no test directory |
| Config file | None — Wave 0 must create if automated tests required |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements — Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BRAND-01 | Baskervville loads, no FOUT | manual-only | N/A — requires browser visual verification | N/A |
| BRAND-02 | Brand color utilities render correctly | manual-only | Visual inspection in browser at 3 viewports | N/A |
| BRAND-03 | 375px mobile viewport is usable | manual-only | Chrome DevTools device emulation at 375px | N/A |
| BRAND-04 | Header links to all site pages | smoke | `astro build && grep -r 'href="/about"' dist/` (build-time check) | ❌ Wave 0 |
| BRAND-05 | Footer renders company info | smoke | `astro build && grep -r 'ABC Deal Toys' dist/` | ❌ Wave 0 |
| BRAND-06 | Interactive elements have hover states | manual-only | Visual inspection required | N/A |

**Note on manual-only tests:** BRAND-01, BRAND-02, BRAND-03, BRAND-06 are visual/perceptual requirements that cannot be meaningfully automated without a visual regression tool (e.g., Playwright + Percy). These are best verified manually during the `/gsd:verify-work` step.

### Sampling Rate

- **Per task commit:** `pnpm build` — confirms no TypeScript or Astro compilation errors
- **Per wave merge:** `pnpm build && pnpm preview` — confirms production build renders correctly
- **Phase gate:** Manual visual review at 375px, 768px, 1280px viewports before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] No test framework installed — visual regression testing would require Playwright; defer to after Phase 1 unless added as explicit requirement
- [ ] `pnpm build` smoke tests for link presence can be added as bash scripts if desired

*If no automated test framework is warranted for a design-only phase, the manual review checklist in `/gsd:verify-work` covers all BRAND-* requirements adequately.*

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS — Theme Variables](https://tailwindcss.com/docs/theme) — `@theme` directive, `--color-*` and `--font-*` namespaces, utility generation
- [Tailwind CSS — Font Family](https://tailwindcss.com/docs/font-family) — `--font-*` token syntax, `--default-font-family`
- [Astro Docs — Custom Fonts](https://docs.astro.build/en/guides/fonts/) — self-hosted font setup, Font API overview
- [Astro 5.7 Blog Post](https://astro.build/blog/astro-570/) — Font API experimental status, `<Font>` component syntax

### Secondary (MEDIUM confidence)
- [Custom fonts in Tailwind v4 — Harrison Broadbent](https://harrisonbroadbent.com/blog/tailwind-custom-fonts/) — verified against official Tailwind docs; `@layer base` + `@theme` pattern
- [Tailwind CSS Discussion #13890](https://github.com/tailwindlabs/tailwindcss/discussions/13890) — community-confirmed pattern for custom fonts in v4
- [How to Manage and Preload Local Fonts with Tailwind in Astro — BRAZY](https://brazy.one/blog/how-to-manage-and-preload-local-fonts-with-tailwind-in-astro/) — preload pattern, `crossorigin` requirement
- [fonttools — PyPI](https://pypi.org/project/fonttools/3.25.0/) — TTF to WOFF2 conversion

### Tertiary (LOW confidence — flag for validation)
- [Tailwind v4 hover on touch devices — BorderMedia](https://bordermedia.org/blog/tailwind-css-4-hover-on-touch-device) — `@media (hover: hover)` wrapping behavior (should verify against Tailwind v4 changelog)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed, verified against package.json
- Tailwind v4 @theme syntax: HIGH — verified against official tailwindcss.com/docs/theme
- Font architecture: HIGH — verified against Astro official docs and Tailwind v4 docs
- WOFF2 conversion tooling: MEDIUM — fonttools is well-established but variable font conversion path needs testing
- Micro-interaction patterns: HIGH — standard CSS transition utilities, no novel API

**Research date:** 2026-03-12
**Valid until:** 2026-06-12 (stable stack; Tailwind v4 and Astro 5 are unlikely to break these patterns within 90 days)
