# Codebase Concerns

**Analysis Date:** 2026-03-12

## Tech Debt

**Unsafe type assertion in Shopify API response:**
- Issue: Using `any` type to extract product nodes from GraphQL response
- Files: `src/utils/shopify.ts:87`
- Impact: No type safety for dynamic edge.node extraction, could fail silently if API response structure changes
- Fix approach: Create a proper type for the GraphQL edge response and parse accordingly instead of using `any`

**Hardcoded pagination limits in GraphQL fragments:**
- Issue: Fixed pagination limits (10 for images/variants, 100 for cart lines) are hardcoded in GraphQL queries
- Files: `src/utils/graphql.ts:12, 56, 64`
- Impact: Cannot display more than 10 product images or variants; carts with >100 items will be truncated without warning
- Fix approach: Make pagination limits configurable parameters or increase defaults with proper documentation of Shopify API limits

**Outdated Shopify API version:**
- Issue: API version hardcoded to "2023-01" (over 2 years old as of 2026)
- Files: `src/utils/config.ts:11`
- Impact: Missing newer API features, potential deprecation warnings, security updates not applied
- Fix approach: Update to current stable Shopify API version and test all integrations; document API version strategy for future maintenance

**Console.error used instead of structured logging:**
- Issue: Missing buyer IP logged to console instead of proper error tracking
- Files: `src/utils/shopify.ts:27-29`
- Impact: No production visibility into missing buyer IP issues, no error aggregation
- Fix approach: Implement proper logging service (Sentry, DataDog, etc.) and log structured errors

## Known Issues

**Missing error handling in cart operations:**
- Problem: Cart operations (addCartItem, removeCartItems) set `isCartUpdating` to `false` only on success, never on error
- Files: `src/stores/cart.ts:70-102`
- Trigger: API failure during cart add/remove operations leaves UI in loading state indefinitely
- Workaround: Refresh page to reset state
- Fix approach: Add try-catch blocks around all Shopify API calls with error state management

**Session storage persistence logic only runs once per session:**
- Problem: Cart validation only occurs on first page load due to sessionStorage flag
- Files: `src/stores/cart.ts:40-63`
- Trigger: If cart is deleted from Shopify backend after page load (via admin or expiry), local copy persists as stale data
- Workaround: Users must clear browser storage or wait 10 days for Shopify to auto-delete
- Fix approach: Periodically revalidate cart data or validate before checkout redirect

## Security Considerations

**Private Shopify access token exposed in environment:**
- Risk: Credential leaked if .env file accidentally committed or exposed in logs
- Files: `.env` (not tracked), `src/utils/config.ts:8-10`
- Current mitigation: .env in .gitignore, no logging of tokens
- Recommendations: Implement token rotation schedule, audit environment variable access in deployment logs, consider server-side-only token storage for private token

**Missing CORS/CSRF protection:**
- Risk: Shopify Storefront API calls made from client without additional verification
- Files: `src/utils/shopify.ts:54`
- Current mitigation: Public token scoped to Storefront API with minimal permissions
- Recommendations: Implement request signing or server relay for cart mutations; document that this setup is suitable for public storefronts only

**No input validation on product handle:**
- Risk: SQL injection-like attack via product handle in URL (if backend vulnerable)
- Files: `src/pages/products/[...handle].astro:15`
- Current mitigation: Relay on Shopify API to return 404, no local validation
- Recommendations: Validate handle format server-side before API call; implement rate limiting on product detail requests

## Performance Bottlenecks

**No caching strategy for product data:**
- Problem: Every page load fetches fresh product data from Shopify, no cache layer
- Files: `src/utils/cache.ts:3-16`, `src/pages/products/[...handle].astro:18`
- Cause: Cache headers set to 1-9 second TTL (very short); no edge caching
- Improvement path: Increase cache TTL for product pages (at least 1 hour), use ISR (Incremental Static Regeneration) or Shopify webhooks to invalidate on product updates

**Cart initialization makes blocking API call on every client-side navigation:**
- Problem: `initCart()` makes network request that blocks interaction until completion
- Files: `src/stores/cart.ts:40-63`
- Cause: Synchronous cart validation during session startup
- Improvement path: Implement lazy cart validation; fetch cart data in background; show optimistic UI from localStorage

**No pagination on homepage products:**
- Problem: Fetching fixed 10 products; no infinite scroll or load more
- Files: `src/utils/shopify.ts:70-92`
- Cause: Hardcoded `limit: 10` default with no pagination controls
- Improvement path: Implement cursor-based pagination or offset pagination; add product filtering/sorting

**Product recommendations fetched on every product page load:**
- Problem: Synchronous API call in page component blocks render
- Files: `src/pages/products/[...handle].astro:70`, `src/components/ProductRecommendations.astro`
- Cause: No async boundary or deferred loading
- Improvement path: Lazy load recommendations below the fold; pre-fetch on link hover

## Fragile Areas

**ProductReviews component contains hardcoded mock data:**
- Files: `src/components/ProductReviews.astro:1-348`
- Why fragile: Static reviews don't reflect actual product feedback; misleading users; component has no integration point for real review data
- Safe modification: Create abstraction layer for review data source (could be Shopify app, external service); pass real data as prop
- Test coverage: No tests for review display; hardcoded data makes testing impossible

**AddToCartForm depends on specific merchandise ID structure:**
- Files: `src/components/AddToCartForm.svelte:15-17`
- Why fragile: Assumes item.merchandise.id matches Shopify variant ID format; breaks if Shopify API changes ID structure
- Safe modification: Add type guards and validate IDs before use; test with various Shopify stores
- Test coverage: No unit tests for form; logic relies on external store state

**Empty cart state in store has mismatched shape:**
- Files: `src/stores/cart.ts:18-24`
- Why fragile: `emptyCart` doesn't include all CartResult fields (missing `lines.nodes` array initialization); could cause type errors
- Safe modification: Ensure emptyCart matches full CartResult schema exactly; add Zod parse validation
- Test coverage: No tests validating cart state initialization

**Direct DOM manipulation via document.querySelector:**
- Files: `src/components/CartDrawer.svelte:25-26, 35`
- Why fragile: Brittle selectors ("body"); could break if parent DOM structure changes; not SSR-safe
- Safe modification: Use Svelte's body-level transitions instead of manual class manipulation
- Test coverage: No tests for drawer state synchronization

## Scaling Limits

**Fixed product list limit to 10 items:**
- Current capacity: Homepage displays exactly 10 products, no pagination
- Limit: Stores with many products won't show all inventory; poor discoverability
- Scaling path: Implement cursor-based pagination, infinite scroll, or search functionality; increase default limit to 20-50 with pagination controls

**Cart limited to 100 line items:**
- Current capacity: GraphQL fragment requests only first 100 cart lines
- Limit: Bulk orders >100 items will be truncated, checkout will be incomplete
- Scaling path: Implement pagination for cart lines with "Load more" button; notify user if cart is truncated

**No database for caching or session management:**
- Current capacity: Relies entirely on Shopify API and browser storage
- Limit: No ability to track user sessions, personalize results, or implement recommendations
- Scaling path: Add Vercel KV or similar for session data; implement Redis caching layer for product data

**API version 2023-01 may reach end of support:**
- Current capacity: Shopify typically supports 12-month API versions
- Limit: 2023-01 may be deprecated by end of 2026; fields/endpoints could be removed
- Scaling path: Establish quarterly API version audit process; upgrade to latest stable version annually

## Dependencies at Risk

**@shopify/hydrogen-react at 2026.1.1:**
- Risk: Hydrogen framework ties implementation to Shopify's component library; tight coupling
- Impact: Major version upgrades could require significant refactoring; framework roadmap drives feature availability
- Migration plan: Document all Hydrogen components in use; if migration needed, map to Headless UI or custom components

**Astro 5.18.0 (very recent version):**
- Risk: Rapid iteration; edge cases may not be fully tested; deprecations frequent
- Impact: Minor version bumps could introduce breaking changes; LTS not guaranteed
- Migration plan: Pin to stable version range (5.x.x); test thoroughly before upgrading; consider moving to Astro 6 when it reaches stable release

**Svelte 5.53.6 (latest major version):**
- Risk: Major version (5.x) is very new; ecosystem not fully matured
- Impact: Community packages may not support Svelte 5; limited third-party component libraries
- Migration plan: Document all custom Svelte patterns used; if needed, fall back to Svelte 4 (LTS) with subset of features

## Missing Critical Features

**No search functionality:**
- Problem: Users cannot search for products by name or SKU; must browse homepage only
- Blocks: Customers on non-homepage cannot discover relevant products; poor user experience for large catalogs

**No product filtering or sorting:**
- Problem: Products shown in fixed order; no price/rating/category filters
- Blocks: Impossible to compare products or narrow choices; users bounce to competitors

**No user authentication:**
- Problem: No login/registration; cannot track order history or save favorites
- Blocks: Repeat customer experience poor; no personalization; cannot implement loyalty features

**No analytics integration:**
- Problem: No tracking of user behavior, conversion funnels, or traffic sources
- Blocks: Cannot measure campaign effectiveness; product data to improve UX; business metrics unknown

**No checkout recovery:**
- Problem: Abandoned carts not tracked; no email notifications
- Blocks: Lost sales opportunity; no way to win back hesitant customers

## Test Coverage Gaps

**No unit tests for Shopify API layer:**
- What's not tested: Error handling in `makeShopifyRequest`, response parsing, type validation
- Files: `src/utils/shopify.ts`
- Risk: API integration regressions undetected; type errors surface in production only
- Priority: High

**No tests for cart state management:**
- What's not tested: Cart initialization, add/remove operations, error recovery, concurrent operations
- Files: `src/stores/cart.ts`
- Risk: Lost carts, duplicated items, race conditions undetected
- Priority: High

**No tests for AddToCartForm component:**
- What's not tested: Form submission, validation, loading states, error handling
- Files: `src/components/AddToCartForm.svelte`
- Risk: Form could silently fail; users unaware if add-to-cart doesn't work
- Priority: Medium

**No tests for CartDrawer component:**
- What's not tested: Open/close interactions, item removal, keyboard navigation
- Files: `src/components/CartDrawer.svelte`
- Risk: UX breakage undetected; accessibility issues not caught
- Priority: Medium

**No integration tests for product page:**
- What's not tested: Product loading, fallback for missing products, recommend data load
- Files: `src/pages/products/[...handle].astro`
- Risk: 404 handling could be broken; could serve wrong product data
- Priority: Medium

**No E2E tests:**
- What's not tested: Full user flow (browse, add to cart, checkout redirect)
- Files: All components and pages
- Risk: Complete checkout flow could be broken; business-critical path untested
- Priority: High

---

*Concerns audit: 2026-03-12*
