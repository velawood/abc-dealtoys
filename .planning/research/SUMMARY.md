# Project Research Summary

**Project:** ABC Deal Toys — Branding + Customization Milestone
**Domain:** Premium headless e-commerce for deal toys / financial tombstones
**Researched:** 2026-03-12
**Confidence:** HIGH

## Executive Summary

ABC Deal Toys operates in the deal toy / financial tombstone niche — a market that currently runs almost entirely on consultation-and-quote workflows. Every major competitor (Altrum, GoLucites, Corporate Presence, Eclipse Awards) requires prospective buyers to submit an inquiry before getting pricing or placing an order. The ABC opportunity is clear: bring a self-serve, template-product, direct-purchase model with Stripe-level polish to a space that looks and behaves like it was built in 2012. This milestone adds the brand identity, content pages, and product customization layer on top of an already-functional Astro 5 + Svelte 5 + Shopify Storefront API foundation.

The recommended approach is additive and disciplined: no stack changes, three new libraries (Resend for email, @vercel/blob for logo upload storage, svelte-inview for scroll animations), and self-hosted Baskerville via manual @font-face CSS. The design system must be established first — brand tokens, font loading, and animation primitives — before any content pages or interaction components are built. Everything downstream depends on the global.css @theme configuration being correct from the start. The build order flows: design tokens → navigation shell → homepage → brand content pages → product customization.

The primary risks are concentrated in product customization: Shopify's customAttributes field requires deliberate setup to surface correctly in merchant order views, logo upload needs a storage backend decided before any UI is built, and Svelte 5 hydration boundaries on the product detail page need careful design. None of these are novel problems, but all have been documented as "looked done but wasn't" failures. The mitigation strategy is to front-load architectural decisions (logo storage pattern, attribute key naming) before writing any customization UI code.

---

## Key Findings

### Recommended Stack

The existing stack (Astro 5.18, Svelte 5, Tailwind CSS 4, @astrojs/vercel) is locked and correct. Three libraries address the gaps: `resend@^6.9.3` for contact/quote form email delivery (developer-first API, official Astro docs example, 3,000 emails/month free), `@vercel/blob@^2.3.1` for logo file storage (already on Vercel infrastructure, client-upload pattern bypasses the 4.5MB serverless body limit), and `svelte-inview@^4.0.4` for scroll-triggered animations (Svelte 5-compatible, zero deps). Font loading uses manual @font-face CSS — the Astro experimental fonts API has open issues and adds no benefit for self-hosted fonts. Astro Actions (stable in Astro 5, not experimental) handle all form submissions with built-in Zod validation.

**Core technologies:**
- Astro 5.18: SSR framework, routing, server actions — existing, locked
- Svelte 5: Interactive island components — existing, locked
- Tailwind CSS 4: CSS-first design tokens via @theme — existing, locked
- Resend (^6.9.3): Transactional email — simplest developer-friendly option for Astro
- @vercel/blob (^2.3.1): Logo upload storage — zero-config on Vercel, solves the 4.5MB file limit
- svelte-inview (^4.0.4): Scroll animation trigger — community standard for Svelte IntersectionObserver

### Expected Features

The target audience (investment bankers, executive assistants) is time-poor and holds high visual standards. Amateur-feeling UI will lose them. The self-serve e-commerce model with upfront customization is the single strongest differentiator in the space — but it only works if the product page UX for customization is excellent.

**Must have (table stakes):**
- Complete visual rebrand: Baskerville serif, Victory Gold / Heritage Navy / Slate / Ivy Green palette applied site-wide
- Homepage hero with "Celebrate the closers" brand narrative and clear CTAs
- Product customization fields: deal name, parties, deal type, amount, close date as Shopify line item properties
- Logo upload on product detail page with persistent storage
- Portfolio / Gallery page organized by deal type (M&A, IPO, DCM, Real Estate, Fund Close)
- How It Works page: 3-step browse → customize → checkout with timeline expectations
- Contact / Get a Quote form capturing deal type, quantity, deadline, logo, message
- About / Our Story page
- Navigation (header + footer) linking all pages
- Mobile-responsive across the entire purchase flow

**Should have (competitive):**
- Testimonials section — add when real customer quotes are collected
- Client logo / social proof section — add when client relationships confirmed for display
- Micro-interactions: hover states, scroll reveals, button/card transitions using Svelte built-ins
- Rush order prominence and explicit lead time callouts

**Defer (v2+):**
- Deal text preview overlay on product image — complex canvas/SVG work, only justified at volume
- Gallery search/filter by industry — useful at 100+ portfolio items; static curated gallery for v1
- Multi-currency support — when international buyers appear in data
- User accounts / order history — only if repeat buyer patterns and support requests justify it

### Architecture Approach

The existing Astro Islands pattern is correct and must be preserved: Astro renders static HTML at request time; interactive components (cart drawer, add-to-cart, forms, customization inputs) are Svelte islands hydrated client-side. Brand pages (About, Portfolio, How It Works, Contact) are pure Astro — fast, SEO-friendly, zero JS except the ContactForm island. The critical architectural extension is adding Shopify `customAttributes` (array of `{key, value}` pairs) to the `cartLinesAdd` mutation, flowing deal text and logo URL from CustomizationForm.svelte through the cart store to Shopify admin. All Shopify read queries stay in Astro pages (server-side, private token); cart mutations stay in stores/cart.ts (client-side, public token). This boundary must not be crossed.

**Major components:**
1. `global.css @theme block` — brand color tokens, font-face declarations, animation timing tokens; everything else depends on this
2. `Header.astro + Footer.astro` — navigation shell linking all pages; required by every page
3. `CustomizationForm.svelte` — new Svelte island on product detail page; collects deal text fields and logo, assembles cart attributes, coordinates with logo upload API
4. `src/actions/index.ts` — Astro Actions definition for contact/quote form; type-safe, Zod-validated, calls Resend
5. `components/brand/` — new directory for Hero, HowItWorksSteps, MissionStatement, PortfolioGrid; isolated from commerce components

### Critical Pitfalls

1. **Custom attributes not surfacing in Shopify Admin or order emails** — The Storefront API's customAttributes do NOT automatically appear in Shopify's default order confirmation email or clearly in admin. Mitigation: immediately after wiring up customAttributes, place a real test order through Shopify checkout (not just the headless cart) and edit the order notification Liquid template in Admin > Settings > Notifications to render line_item.properties.

2. **Logo upload UI built before storage backend decided** — Shopify's cart API accepts only string key-value pairs; binary files cannot be attached. A file input without a storage backend means every logo upload silently disappears. Mitigation: decide the storage pattern (Vercel Blob client-upload for v1, base64 data URI as fallback MVP) before writing any upload UI.

3. **Font CLS breaking premium brand impression** — Missing `font-display: swap` and no `<link rel="preload">` causes Baskerville to load late, producing visible text swap. CLS above 0.1 = "poor" in Core Web Vitals. Mitigation: add font-display: swap to every @font-face declaration and add a preload link in BaseLayout.astro head on day one of the branding phase.

4. **Tailwind CSS 4 color token misconfiguration** — Brand colors added without the `--color-*` prefix in @theme will not generate utility classes. Adding colors can also silently change the default border color from gray-200 to currentColor across the entire site. Mitigation: use `--color-victory-gold`, `--color-heritage-navy` etc., and run a visual regression pass on borders after adding tokens.

5. **Hydration mismatch on customization form** — File APIs (`FileReader`, file input refs) run in the browser only. Any code that touches these during SSR will cause hydration mismatch errors. Mitigation: isolate all file-related state in `onMount`; use `$state.snapshot()` when passing Svelte 5 rune state to non-reactive APIs like FormData.

---

## Implications for Roadmap

Based on the build-order dependency graph in ARCHITECTURE.md and the pitfall-to-phase mapping in PITFALLS.md, a 4-phase structure is strongly recommended.

### Phase 1: Design System Foundation
**Rationale:** Every component and page in this project depends on global.css @theme tokens and BaseLayout. Building anything before design tokens are correct means doing rework on every component when they change. The font loading pitfall must be addressed here, not later.
**Delivers:** Self-hosted Baskerville (WOFF2) with font-display: swap and preload links; brand color tokens (Victory Gold, Heritage Navy, Slate, Ivy Green) in @theme with correct `--color-*` naming; animation timing tokens (--duration-fast/base/slow, --ease-out); Header and Footer with full navigation links; BaseLayout updated with CSS import instead of inline style block.
**Addresses features:** Visual rebrand, navigation shell, brand typography and colors
**Avoids:** Font CLS (Pitfall 2), Tailwind color token misconfiguration (Pitfall 3), inconsistent micro-interactions (Pitfall 6)
**Research flag:** Standard patterns — skip research-phase

### Phase 2: Homepage
**Rationale:** The homepage validates brand direction before building more pages. It has no downstream dependencies and can be completed in parallel with brand page content writing. A good homepage also confirms that the design tokens from Phase 1 work correctly in context.
**Delivers:** Hero section with "Celebrate the closers" brand narrative; mission statement; product grid preview; How It Works teaser section; CTA to portfolio and contact; scroll-reveal animations using svelte-inview
**Uses stack:** svelte-inview for scroll animations, Svelte built-in transitions for hero text, Astro Image component for hero imagery
**Avoids:** Unoptimized hero images causing LCP failures (Performance Traps in PITFALLS.md)
**Research flag:** Standard patterns — skip research-phase

### Phase 3: Brand Content Pages
**Rationale:** About, Portfolio, How It Works, and Contact are static Astro pages — low risk, no Shopify dependencies. ContactForm requires Astro Actions setup first (actions/index.ts), which is a prerequisite for Phase 4 anyway. Building these pages fills in the navigation links from Phase 1 and positions the brand before the more complex product customization work.
**Delivers:** About / Our Story page; Portfolio / Gallery page organized by deal type with brand photography; How It Works 3-step process page with timeline expectations; Contact page with ContactForm Svelte island; Astro Actions setup (actions/index.ts) with Resend email delivery
**Uses stack:** Astro Actions + Resend (^6.9.3), Astro Image for portfolio assets
**Implements architecture:** Brand components directory (components/brand/), ContactForm Svelte island, Astro Actions server module
**Avoids:** Missing SEO meta on new pages (Looks Done But Isn't checklist item)
**Research flag:** Standard patterns for brand pages. ContactForm + Resend is well-documented — skip research-phase.

### Phase 4: Product Customization
**Rationale:** Most technically complex phase. Requires the cart store extension (attributes in cartLinesAdd mutation), a logo upload backend decision, and careful Svelte 5 hydration boundary design. The architectural decisions for logo storage and attribute key naming must be made explicitly at the start of this phase — both are "looks done but isn't" failure modes. This phase ships last because all brand context is established, reducing risk of needing to rework the customization UI.
**Delivers:** CustomizationForm.svelte island on product detail page (deal name, parties, deal type, amount, close date fields); logo upload with Vercel Blob client-upload pattern (or base64 MVP); cart store extension passing attributes array to cartLinesAdd mutation; validated Shopify Admin display of all customization fields; cart drawer showing customization summary per line item; "Add to Cart" disabled until required fields complete
**Uses stack:** @vercel/blob (^2.3.1) for logo storage, Astro API endpoint for upload token, extended graphql.ts mutation
**Implements architecture:** CustomizationForm.svelte, cartLinesAdd attributes extension, /api/upload-logo.ts endpoint
**Avoids:** Custom attributes not in order emails (Pitfall 1), logo upload without backend (Pitfall 5), hydration mismatch (Pitfall 4), insecure file uploads (Security section of PITFALLS.md)
**Research flag:** Needs research-phase — complex Shopify attributes integration, Vercel Blob client-upload pattern, Svelte 5 SSR hydration with file inputs

### Phase Ordering Rationale

- Phase 1 before everything: @theme tokens and BaseLayout changes are global — any component built before this is wrong or requires rework
- Phase 2 before brand pages: Homepage validates that design tokens and brand voice are correct before committing to 4 more pages; fast feedback loop
- Phase 3 before Phase 4: Actions/index.ts setup in Phase 3 is a dependency for Phase 4's more complex server interactions; brand pages have no risk that could block Phase 4
- Phase 4 last: Logo storage and cart attribute decisions benefit from a confirmed working app; integration complexity is isolated and doesn't block anything else

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Product Customization):** Vercel Blob client-upload token pattern with Astro API endpoints needs concrete code validation; Shopify customAttributes key naming conventions need confirmation for admin display; Svelte 5 $state.snapshot() with FormData needs a tested pattern

Phases with standard patterns (skip research-phase):
- **Phase 1 (Design System):** Manual @font-face CSS and Tailwind @theme are standard; patterns documented in STACK.md
- **Phase 2 (Homepage):** Svelte transitions + Astro Island composition is the existing project pattern
- **Phase 3 (Brand Pages):** Static Astro pages + Resend Actions are well-documented in official Astro docs

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core decisions verified against official Astro, Tailwind, Vercel docs; npm versions confirmed; only medium confidence on Blob client-upload complexity |
| Features | HIGH | Multiple competitor sites verified directly; Shopify patterns confirmed in official docs; buyer persona well-understood |
| Architecture | HIGH | Based on direct codebase inspection of the existing project plus official Astro and Shopify documentation; build order is explicit and dependency-driven |
| Pitfalls | HIGH | Shopify customAttributes behavior verified in community docs; font CLS is a documented Web Vitals issue; Tailwind v4 color token issues confirmed in open GitHub discussions |

**Overall confidence:** HIGH

### Gaps to Address

- **Logo upload storage decision:** Research recommends Vercel Blob client-upload as primary, base64 data URI as MVP fallback. The correct choice depends on typical logo file sizes in practice. Decision should be made explicitly at the start of Phase 4 rather than deferred.
- **Shopify order notification template:** The Liquid email template edit in Admin > Settings > Notifications needs to be confirmed during Phase 4 with a real test order. Cannot be validated in development.
- **Font subsetting scope:** Research flags font subsetting (Latin characters minimum) as required for production. TTF → WOFF2 conversion tooling needs to be confirmed working in the project environment before Phase 1 is marked done.
- **svelte-inview Svelte 5 compatibility:** npm package is listed as v4.x for Svelte 5 support. Verify the exact package name (`svelte-inview` vs `svelte-5-inview`) against current npm registry before install.

---

## Sources

### Primary (HIGH confidence)
- [Astro Actions Guide](https://docs.astro.build/en/guides/actions/) — defineAction, Zod input, Svelte component usage
- [Vercel Blob — Server Upload Docs](https://vercel.com/docs/vercel-blob/server-upload) — 4.5MB body limit, client upload alternative
- [Shopify Storefront API — cartLinesAdd mutation](https://shopify.dev/docs/api/storefront/latest/mutations/cartLinesAdd) — attributes array on CartLineInput
- [Tailwind CSS 4 Theme Variables](https://tailwindcss.com/docs/theme) — @theme block, --color-* prefix pattern
- [Resend + Astro Guide](https://resend.com/docs/send-with-astro) — Actions integration pattern
- [Astro Islands Architecture](https://docs.astro.build/en/concepts/islands/) — client directives, island boundaries

### Secondary (MEDIUM confidence)
- [GoLucites](https://www.golucites.com/), [Altrum](https://www.altrum.com/dealtoys/), [Corporate Presence](https://cpresence.com/deal-toys/), [Eclipse Awards](https://www.eclipseawards.com/collections/deal-toys-financial-tombstones) — competitor feature analysis
- Tailwind CSS GitHub Discussion #16517 — v4 migration breaking changes including border color defaults
- Astro GitHub Issues #14438, #5578 — local font loading behavior, experimental fonts API issues
- Shopify Community — customAttributes display in order notifications (Liquid template edit required)
- Mainmatter: [Svelte 5 Global State](https://mainmatter.com/blog/2025/03/11/global-state-in-svelte-5/) — $state.snapshot() pattern

### Tertiary (LOW confidence)
- npm registry version verification for svelte-inview v4.x Svelte 5 compatibility — needs confirmation at install time

---
*Research completed: 2026-03-12*
*Ready for roadmap: yes*
