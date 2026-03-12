# Pitfalls Research

**Domain:** Headless Shopify e-commerce redesign — branding, custom fonts, product customization, premium UI
**Researched:** 2026-03-12
**Confidence:** HIGH (font/CSS), HIGH (Shopify API), MEDIUM (UX patterns)

---

## Critical Pitfalls

### Pitfall 1: Custom Attributes Not Surfacing in Shopify Admin or Order Emails

**What goes wrong:**
Deal customization data (deal name, closing date, parties, logo reference) is stored as `customAttributes` on cart line items via the Storefront API. This data flows through checkout to the order, but Shopify's default order confirmation email template does not render line item properties. The merchant receives the order in admin without seeing the customization details the customer entered, which is a catastrophic failure for a made-to-order product.

**Why it happens:**
The Storefront API uses `customAttributes` (array of `{key, value}`) on cart lines — a different field name than Liquid's `line.properties`. Developers assume that passing data to the cart is enough. Nobody checks what the merchant actually sees in the order admin until post-launch.

**How to avoid:**
1. After wiring up customAttributes in the AddToCart flow, immediately open a test order in Shopify Admin and verify every field appears under the line item.
2. Edit the Order Confirmation email template (Admin > Settings > Notifications) to explicitly iterate and render `line.properties` values.
3. Confirm customAttributes keys use underscores (not spaces) — Shopify treats leading underscores as hidden fields in the admin display; use them only for internal metadata, not customer-entered data.

**Warning signs:**
- Testing the cart flow locally shows customAttributes in the API response, but no one has placed a test order through Shopify's actual checkout.
- The order confirmation email template has never been opened or modified.

**Phase to address:** Product customization phase — before launch, place at least one real test order through Shopify checkout (not just the headless cart) and verify admin display.

---

### Pitfall 2: Font Causing Layout Shift (CLS) on First Paint

**What goes wrong:**
Baskerville is self-hosted from `assets/fonts/`. Without explicit `font-display: swap` and a correctly-sized fallback font stack, the browser either shows invisible text (FOIT) or swaps from a wildly different fallback to Baskerville mid-render, causing a jarring layout shift. This is especially damaging for premium branding — it makes the site look broken on first load. CLS scores above 0.1 trigger Google's "poor" rating.

**Why it happens:**
Developers add `@font-face` declarations without `font-display: swap`. The `BaseLayout.astro` currently uses `<style is:global>` with a CSS import — there is no font preloading in the `<head>`. Without `<link rel="preload">`, the browser discovers the font file late in the cascade.

**How to avoid:**
1. Add `font-display: swap` to every `@font-face` declaration in `global.css`.
2. Add `<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/Baskervville-Regular.woff2">` in `BaseLayout.astro`'s `<head>` for the primary weight used in body text.
3. Define a fallback font stack with adjusted metrics using `size-adjust`, `ascent-override`, and `descent-override` CSS descriptors to minimize shift when Baskerville loads in.
4. Convert any TTF/OTF files to WOFF2 (check what format is in `assets/fonts/`).

**Warning signs:**
- No `font-display` property visible in `@font-face` rules.
- No `<link rel="preload">` in `BaseLayout.astro` head section.
- Lighthouse CLS score above 0.1 after font implementation.

**Phase to address:** Branding/typography phase — set up correctly from day one; retrofitting is harder than doing it right initially.

---

### Pitfall 3: Tailwind CSS 4 `@theme` Color Tokens Not Applied Consistently

**What goes wrong:**
Tailwind v4 uses a CSS-first configuration via `@theme` blocks. Brand colors (Victory Gold `#ebbc28`, Heritage Navy `#052a38`, Slate `#1a1b1b`, Ivy Green `#00442e`) defined as custom CSS variables in `@theme` may not generate utility classes unless named with the exact `--color-*` prefix pattern Tailwind v4 expects. Additionally, v4 changed the default border color from gray-200 to `currentColor`, which can break existing component borders across the whole site when brand colors are added.

**Why it happens:**
The existing `global.css` uses `@theme` for animation only. Developers adding brand colors assume the same pattern works for colors, but Tailwind v4's color token resolution requires the `--color-` namespace prefix for utilities to be auto-generated. Also, v4's `@layer base` does not behave identically to v3's — `@font-face` inside a `@layer` block breaks font-weight specificity.

**How to avoid:**
1. Define brand colors as `--color-victory-gold: #ebbc28;`, `--color-heritage-navy: #052a38;`, etc. inside `@theme` — this generates `text-victory-gold`, `bg-victory-gold`, etc. automatically.
2. Place `@font-face` declarations outside any `@layer` block.
3. After adding colors, run a full visual regression check — look specifically at borders, which may shift from gray to `currentColor`.

**Warning signs:**
- Custom color names don't generate utility classes in Tailwind's output.
- Border colors change across unrelated components after color additions.
- Font weights look wrong even though `@font-face` weight values are correct.

**Phase to address:** Branding/typography phase — establish design tokens correctly before building any new components on top of them.

---

### Pitfall 4: Hydration Mismatch Breaks Customization Form State

**What goes wrong:**
The `AddToCartForm.svelte` component is rendered with `client:load`. When a product customization form is built on top of this (adding text fields for deal details, logo upload), the server renders a static snapshot and the client hydrates it. If the form contains any state derived from browser-only APIs (file input refs, localStorage, URL params), the server and client snapshots diverge, causing a hydration mismatch. Svelte 5 proxy objects make this harder to debug — `$state` runes return Proxy objects that cannot be directly passed to non-reactive contexts like file uploads.

**Why it happens:**
Astro renders Svelte components on the server first. Any code in the component that touches `window`, `document`, `FileReader`, or browser file APIs will throw during SSR or produce mismatched HTML. The `AddToCartForm` currently uses `$props()` and `$derived()` from Svelte 5 runes — the pattern is correct, but extending it with file upload state requires careful isolation.

**How to avoid:**
1. Keep all file-related state inside the Svelte component exclusively (no SSR execution for file APIs). Use `onMount` for any browser-API-dependent initialization.
2. Use `$state.snapshot()` when passing reactive state to non-reactive APIs (e.g., assembling FormData from rune state).
3. Add `export const prerender = false` at the product page level (already SSR from Vercel adapter) — confirm SSR is on for product pages so cart updates work.
4. Test the form with JavaScript disabled to see the SSR baseline; verify hydrated form matches.

**Warning signs:**
- Console errors mentioning "hydration" or "HTML mismatch" on product pages.
- File input resets unexpectedly after initial render.
- Svelte 5 proxy-related errors when accessing rune state outside reactive contexts.

**Phase to address:** Product customization phase — design the form architecture first, test SSR/hydration boundary before building the full form.

---

### Pitfall 5: Logo Upload Has No Backend — Customer Expectation Is Unmet

**What goes wrong:**
A logo upload UI is implemented on the product page (file input, preview, drag-and-drop). The customer uploads a file, adds to cart, and checks out. The logo file is never actually persisted anywhere. The Shopify Storefront API's `customAttributes` accepts only string key-value pairs — you cannot attach binary files to a cart line item. After checkout, the merchant has no file to use for production.

**Why it happens:**
Developers implement the frontend file upload experience (which is straightforward) without designing the backend storage and retrieval flow first. Shopify's cart API looks deceptively capable but has no binary file support.

**How to avoid:**
There are two viable approaches:
1. **Pre-upload pattern (recommended):** When the customer selects a file, immediately upload it to a storage service (Vercel Blob, Cloudflare R2, AWS S3) via an Astro API route (`/api/upload`). The API route returns a URL. Store that URL as a `customAttribute` string value on the cart line item. The merchant receives the URL in the order admin.
2. **Post-purchase pattern (acceptable for v1):** Skip file upload entirely. The cart collects the customer's email and a text note that they have a logo to provide. After purchase, an automated email (Shopify Flow or order notification) prompts the customer to reply with their logo. This is lower friction to build but adds friction to the customer experience.

Decide which pattern to implement before building any upload UI — the patterns require different components, API routes, and merchant workflows.

**Warning signs:**
- File upload UI built before deciding where files will actually be stored.
- No `/api/upload` route or equivalent server-side handler exists.
- Customization plan references only `customAttributes` without addressing file persistence.

**Phase to address:** Product customization phase — this architectural decision must be made at the start of the phase, not discovered mid-implementation.

---

### Pitfall 6: Stripe-Level Polish Ships Without Micro-Interaction Budget

**What goes wrong:**
The goal of "Stripe-level UI polish" requires animated hover states, smooth transitions, skeleton loaders, focus rings, and consistent spacing — none of which are in the current template. Developers add these one component at a time as an afterthought, producing inconsistent durations, easing curves, and interaction patterns across the site. The result is a site that looks "almost premium" but feels choppy compared to a Stripe-grade UI.

**Why it happens:**
Micro-interactions require a system — agreed-upon animation durations, easing functions, and a set of transition primitives — before building individual components. Without defining these tokens first, each developer (or each component) invents its own animation style.

**How to avoid:**
1. Before building any new component, define CSS animation tokens in `@theme`: `--duration-fast: 150ms`, `--duration-base: 250ms`, `--duration-slow: 400ms`, `--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1)`.
2. Establish a small set of reusable Tailwind utility classes for transitions: `transition-all duration-[var(--duration-base)] ease-[var(--ease-out)]`.
3. Audit every interactive element (buttons, links, cards, form inputs) against the interaction spec before calling a component done.

**Warning signs:**
- Components have inconsistent `transition-duration` values (some 100ms, some 300ms, some none).
- No shared animation tokens or CSS variables for timing.
- "Polish" pass is planned as a final phase rather than built into each component.

**Phase to address:** Branding/design system phase — establish the motion system before building any components, not as a final pass.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcode brand colors as raw hex in Tailwind classes | Faster to start | Colors scatter across codebase, rebrand is a grep exercise | Never — use `@theme` tokens from day one |
| Use `client:load` on all interactive components | Simpler mental model | Larger JS bundles, slower TTI on product pages | Only for components that genuinely need immediate interactivity; prefer `client:idle` for cart drawer |
| Skip font subsetting | No tooling required | Baskerville full fonts can be 200-400KB each; multiple weights = 1MB+ font payload | Never for production; subset to Latin characters minimum |
| Store customization state in component local state only | Quick to implement | State lost on navigation; no persistence for abandoned carts | Acceptable for v1 if the customization form is on the same page as the cart add |
| Inline `<style is:global>` in BaseLayout | Works in development | Astro cannot optimize or deduplicate global styles injected this way; move to imported CSS file | Replace with proper CSS import during branding phase |
| Skip order notification template edit | No Shopify template work | Merchant receives orders with no customization data visible | Never acceptable for a made-to-order product |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Shopify Storefront API - customAttributes | Using display-friendly key names with spaces (e.g., `"Deal Name"`) | Use snake_case keys (`"deal_name"`); spaces are allowed but cause inconsistent rendering in some Shopify admin views |
| Shopify Storefront API - customAttributes | Assuming properties appear in Shopify order emails automatically | They don't — requires editing the Liquid email template in Admin > Settings > Notifications |
| Shopify Storefront API - customAttributes | Leading underscore keys (e.g., `_logo_url`) are hidden in Shopify admin | Use leading underscore only for internal-only fields; customer-visible customization data must use non-underscore keys |
| Astro `client:load` + Svelte 5 runes | Passing `$state` proxy directly to `FormData` or non-reactive contexts | Use `$state.snapshot()` to get a plain object before passing to non-reactive APIs |
| Vercel SSR + file uploads | Using edge runtime for multipart/form-data | Edge functions have a 1MB size limit and restricted Node APIs; file upload API routes must use the serverless (Node.js) runtime, not edge |
| Tailwind CSS 4 + `@font-face` | Placing `@font-face` inside a `@layer base` block | Font-weight specificity breaks when inside `@layer`; declare `@font-face` at root level outside any layer |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading all Baskerville weights/styles | Font payload exceeds 500KB; LCP degrades | Load only the weights actually used (Regular + Italic for body; Bold for headings); subset to Latin characters | Immediate — every visitor pays the cost |
| Unoptimized hero/product images | LCP above 2.5s; Google Search Console flags | Use Astro's `<Image>` component with `width`, `height`, and `format="webp"`; set explicit dimensions on all `<img>` | Immediate for LCP metric |
| No `font-display: swap` | CLS; text invisible during load | Add to every `@font-face` declaration | Immediate — visible on every page load |
| `client:load` on CartDrawer (already present) | CartDrawer JS loads on every page even when not opened | `client:idle` is better; CartDrawer is already `client:idle` in BaseLayout — do not regress this when redesigning | Scales poorly; adds ~50-100ms TTI per page |
| Shopify API called without ISR/cache headers | Product pages slow on cold requests | `setCache.short(Astro)` is already in place — preserve it when modifying product pages | Under traffic spikes |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Accepting logo uploads without file type validation | SVG uploads can contain embedded JavaScript (XSS vector); malicious files stored in bucket | Validate MIME type server-side (not just file extension); accept only `image/png`, `image/jpeg`, `image/svg+xml` (sanitized) on the API route |
| Exposing Shopify Admin API token on the client side | Full store control to anyone with the token | The existing setup uses Storefront API (public token) — never add Admin API calls to client-side code |
| No file size limit on logo upload | DoS via large file uploads; excessive storage costs | Enforce max file size (e.g., 5MB) both client-side (UX feedback) and server-side (hard limit in the API route) |
| Storing uploaded files at predictable URLs | Competitor or bad actor harvests customer-uploaded logos | Use randomized UUIDs in storage paths; do not use order ID or customer name as the file path |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Customization form with no preview | Customer uncertain whether their deal text/logo looks right; higher return/complaint rate | Show a live text preview of deal details as typed; show logo thumbnail immediately on file select |
| "Add to cart" enabled before customization is complete | Customer adds without entering required deal details; order arrives incomplete | Disable "Add to cart" until required customization fields are filled; show clear field validation inline |
| File upload UI that looks like a form input | Investment banking audience unfamiliar with drag-and-drop; upload rates drop | Use a clear button labeled "Upload Your Logo" with a visible file format note (PNG, JPG, EPS accepted) |
| Mobile customization form unusable | Executive assistants ordering on mobile can't complete required fields | Test the full customization flow on mobile before any phase is marked done; file inputs behave differently on iOS vs. Android |
| No confirmation of what was customized before checkout | Customer questions whether their input was saved; abandoned carts | Show a cart summary that displays customization details per line item (deal name, logo thumbnail, etc.) in the cart drawer |
| Luxury brand positioning with stock template UI | Perceived quality mismatch; target audience (bankers, lawyers) has high visual standards | Every page must be designed to brand spec — including 404, loading states, and error messages; no generic defaults |

---

## "Looks Done But Isn't" Checklist

- [ ] **Baskerville font:** Font loads in Chrome but check Firefox and Safari — fallback rendering differs significantly across browsers; verify all three.
- [ ] **Brand colors:** Utility classes generate correctly in Tailwind output — run `npx @tailwindcss/cli` and search the output CSS for `victory-gold` to confirm.
- [ ] **Customization form:** Data survives page refresh — test by entering deal details, then refreshing; if state is lost, the form needs persistence consideration.
- [ ] **Logo upload:** Uploaded file URL appears in Shopify Admin under the test order's line item properties — verify with a real checkout, not just the cart API response.
- [ ] **Cart drawer:** Customization summary visible in cart drawer — check that custom attributes display next to each product, not just in admin.
- [ ] **Order confirmation email:** Open the Shopify-sent email (not the admin preview) and confirm customization details appear — the admin preview can lie.
- [ ] **Mobile:** Entire purchase flow (browse → customize → add to cart → view cart) works on an actual iPhone Safari and Android Chrome — not just responsive dev tools.
- [ ] **CLS audit:** Run Lighthouse on the homepage and product page with throttling enabled; CLS must be below 0.1 after fonts are in place.
- [ ] **New pages:** About, Portfolio, How It Works, and Contact pages are all linked in navigation AND footer — check both nav states (mobile hamburger and desktop).
- [ ] **SEO meta:** Every new page has a unique `<title>` and `<meta name="description">` — BaseLayout's default placeholder description has not shipped.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Customization data missing from orders | HIGH | Edit Shopify order notification template; manually contact all affected orders to re-collect data; test with a new order |
| Font FOUT causing layout shift in production | MEDIUM | Add `font-display: swap` and `<link rel="preload">`; deploy; CLS improves on next Lighthouse run |
| Wrong Tailwind color token pattern | LOW | Rename `@theme` variables to `--color-*` prefix; Tailwind rebuilds automatically on next dev server start |
| Logo upload UI built before storage backend | HIGH | Pause feature; decide on storage approach (Vercel Blob vs. post-purchase email); rebuild upload handler; re-test full flow |
| Hydration mismatch on customization form | MEDIUM | Isolate browser-only code in `onMount`; test with JS disabled to verify SSR baseline; fix mismatches before adding more state |
| Missing micro-interactions across all components | MEDIUM | Define animation tokens in `@theme`; create a sweep PR that adds consistent `transition` utilities to all interactive elements |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Custom attributes not in order emails | Product customization | Place real test order through checkout; open order in Shopify Admin; open received email |
| Font CLS / FOUT | Branding/typography | Lighthouse CLS < 0.1 on product page with throttling |
| Tailwind color token misconfiguration | Branding/design system | Build Tailwind output and grep for brand color utility classes |
| Hydration mismatch on customization form | Product customization | Run with `astro build && astro preview`; check browser console for hydration errors |
| Logo upload without backend | Product customization | Architectural decision documented before any UI built; API route exists before file input is wired up |
| Inconsistent micro-interactions | Branding/design system | Animation token CSS variables defined; all buttons/links use shared transition utilities |
| Baskerville payload too large | Branding/typography | Network tab shows font files under 100KB each (subset) in WOFF2 format |
| Customization state lost on navigation | Product customization | Enter deal details, navigate to another page, return — verify state handling is intentional |
| Security: unrestricted file uploads | Product customization | API route rejects oversized files and invalid MIME types in automated test |

---

## Sources

- Shopify Community: [Displaying line item properties in order confirmation emails](https://community.shopify.com/t/adding-line-properties-to-order-confirmation-email/552069)
- Shopify Community: [Storefront Cart Line Items vs Checkout Line Items](https://github.com/Shopify/storefront-api-feedback/discussions/154)
- Shopify Docs: [Create and update a cart with the Storefront API](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage)
- Tailwind CSS Discussion: [How to add a custom font in Tailwind 4](https://github.com/tailwindlabs/tailwindcss/discussions/13890)
- Tailwind CSS Issue: [Upgrading to Tailwind v4: Missing Defaults, Broken Dark Mode](https://github.com/tailwindlabs/tailwindcss/discussions/16517)
- Astro GitHub Issue: [Local fonts not loading properly using Experimental fonts API](https://github.com/withastro/astro/issues/14438)
- Astro GitHub Issue: [Astro not serving local font files](https://github.com/withastro/astro/issues/5578)
- Chrome Developers: [Ensure text remains visible during webfont load](https://developer.chrome.com/docs/lighthouse/performance/font-display)
- DebugBear: [Fixing Layout Shifts Caused by Web Fonts](https://www.debugbear.com/blog/web-font-layout-shift)
- Mainmatter: [Svelte 5 Global State: Do's and Don'ts](https://mainmatter.com/blog/2025/03/11/global-state-in-svelte-5/)
- Svelte Docs: [v5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide)
- Vercel Docs: [Astro on Vercel](https://vercel.com/docs/frameworks/frontend/astro)
- LogRocket: [How to build a secure file upload system in Astro](https://blog.logrocket.com/how-to-build-secure-file-upload-system-astro/)
- Xaicode: [7 Costly Mistakes eCommerce Brands Make When Going Headless](https://www.xaicode.com/blog/7-costly-mistakes-ecommerce-brands-make-when-going-headless-and-how-to-avoid-them)

---
*Pitfalls research for: Headless Shopify + Astro/Svelte deal toy e-commerce redesign*
*Researched: 2026-03-12*
