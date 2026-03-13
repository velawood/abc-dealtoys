# Architecture

**Analysis Date:** 2026-03-12

## Pattern Overview

**Overall:** Hybrid Static + Server-Side Rendering (SSR) with Client-Side Interactivity

**Key Characteristics:**
- Server-rendered (SSR) Astro framework for performance and SEO
- Headless commerce pattern via Shopify Storefront API (GraphQL)
- Client-side interactive components using Svelte for state management
- Buyer IP tracking for personalized product recommendations
- Cart state persisted to browser local storage via nanostores

## Layers

**Presentation Layer:**
- Purpose: Render pages and components with HTML/CSS, handle client interactivity
- Location: `src/pages/`, `src/components/`, `src/layouts/`
- Contains: Astro components (static/dynamic), Svelte components (interactive), layouts
- Depends on: State management (stores), utility functions, data from API layer
- Used by: Browser directly

**State Management Layer:**
- Purpose: Manage client-side state (cart, UI toggles) with persistence
- Location: `src/stores/cart.ts`
- Contains: nanostores atoms and persistent atoms, async cart operations
- Depends on: Shopify API utility functions
- Used by: Svelte components, Astro pages via Svelte integration

**API Integration Layer:**
- Purpose: Fetch and transform data from Shopify Storefront API
- Location: `src/utils/shopify.ts`, `src/utils/graphql.ts`
- Contains: GraphQL queries/mutations, fetch wrapper, API response parsing
- Depends on: Configuration, validation schemas (Zod)
- Used by: Server-side components, client-side stores

**Validation & Configuration Layer:**
- Purpose: Type-safe configuration and API response validation
- Location: `src/utils/schemas.ts`, `src/utils/config.ts`
- Contains: Zod schemas for all API responses, environment-based config
- Depends on: Zod library
- Used by: API integration layer, components

**Utility Layer:**
- Purpose: Cross-cutting concerns and shared helpers
- Location: `src/utils/cache.ts`, `src/utils/click-outside.ts`
- Contains: HTTP caching directives, DOM utilities
- Depends on: None (low-level)
- Used by: Pages, components

## Data Flow

**Product Listing Page:**

1. User visits `/` (home page)
2. `src/pages/index.astro` runs on server, extracts buyer IP from request headers
3. Calls `getProducts({ buyerIP })` from `src/utils/shopify.ts`
4. `makeShopifyRequest()` sends GraphQL `ProductsQuery` to Shopify API with buyer IP
5. Shopify returns product array, parsed via `ProductResult` Zod schema
6. Products rendered via `<Products>` component which maps to `<ProductCard>` components
7. Cache headers set to short TTL (1 second with 9s stale-while-revalidate)
8. Client receives static HTML + Tailwind CSS

**Product Detail Page:**

1. User visits `/products/[...handle]` (dynamic route)
2. `src/pages/products/[...handle].astro` extracts handle param and buyer IP
3. Calls `getProductByHandle({ handle, buyerIP })` from API layer
4. Returns single product with variants, images, featured image
5. Page composes multiple sub-components: images, info, add-to-cart form, recommendations, reviews, accordions
6. `AddToCartForm` (Svelte) marked with `client:load` for immediate interactivity
7. `ProductRecommendations` component server-fetches recommendations using product ID and buyer IP
8. Returns 404 if product not found

**Add to Cart Flow:**

1. User clicks "Add to bag" button in `AddToCartForm.svelte`
2. Component calls `addCartItem(item)` from cart store
3. Store calls `createCart()` or `addCartLines()` Shopify API function (SSR-only)
4. `isCartUpdating` atom set to true, disables button, shows spinner
5. New cart stored in persistent atom (local storage)
6. `CartDrawer.svelte` component observes cart state and renders items
7. `isCartUpdating` reset to false, drawer opens automatically

**Cart Management:**

1. On page load, `initCart()` checks if cart exists in local storage (client-side only)
2. If cart exists, validates it with Shopify API (in case it expired after 10 days)
3. Resets cart if Shopify no longer recognizes it
4. Renders persisted cart data to user

**State Management:**

- `cart` atom: Persistent, stores full cart object from Shopify (local storage)
- `isCartDrawerOpen` atom: Non-persistent, tracks UI state
- `isCartUpdating` atom: Non-persistent, tracks async operation state
- Svelte components subscribe to atoms via `$store` syntax

## Key Abstractions

**Shopify Request Abstraction:**
- Purpose: Single entry point for all Shopify API calls with proper auth headers
- Examples: `src/utils/shopify.ts` - `makeShopifyRequest()`
- Pattern: Detects SSR vs client (via `import.meta.env.SSR`), applies appropriate headers:
  - Server: `Shopify-Storefront-Private-Token` + `Shopify-Storefront-Buyer-IP`
  - Client: `X-Shopify-Storefront-Access-Token`

**Zod Schema Validation:**
- Purpose: Parse and validate all Shopify API responses at type level
- Examples: `ProductResult`, `CartResult`, `MoneyV2Result` in `src/utils/schemas.ts`
- Pattern: All API responses parsed immediately after fetch, errors thrown if invalid

**Component Composition:**
- Purpose: Break product detail page into reusable, independently fetching components
- Examples: `ProductImageGallery.astro`, `ProductInformations.astro`, `ProductRecommendations.astro`
- Pattern: Each component responsible for its own data fetching and rendering

**Buyer IP Tracking:**
- Purpose: Personalize product recommendations and storefront behavior per user
- Pattern: Extracted from `x-vercel-forwarded-for` header (production) or `Astro.clientAddress` (fallback)
- Passed to Shopify API in every server-side GraphQL request

## Entry Points

**Home Page:**
- Location: `src/pages/index.astro`
- Triggers: Direct visit to `/`
- Responsibilities: Fetch 10 products, render grid, set cache headers

**Product Detail Page:**
- Location: `src/pages/products/[...handle].astro`
- Triggers: Direct visit to `/products/{product-handle}`
- Responsibilities: Fetch product by handle, handle 404, render multi-section product page

**404 Page:**
- Location: `src/pages/404.astro`
- Triggers: Route not found
- Responsibilities: Render not-found layout

**Client-Side Initialization:**
- No explicit entrypoint, but Svelte `client:load` directives trigger hydration
- Components: `AddToCartForm.svelte`, `CartDrawer.svelte`, `CartIcon.svelte` (all client-rendered)

## Error Handling

**Strategy:** Throw errors from API layer, catch and render 404 responses in pages

**Patterns:**

- **API Errors:** `makeShopifyRequest()` throws if response not ok or contains GraphQL errors
  - File: `src/utils/shopify.ts` lines 56-64

- **Validation Errors:** Zod schema parsing throws if response doesn't match expected type
  - File: `src/utils/schemas.ts`
  - Pattern: `.parse()` throws, `.safeParse()` returns result object

- **Not Found:** Pages check parsed result and set HTTP 404 status
  - File: `src/pages/products/[...handle].astro` lines 20-22
  - Pattern: `if (!product) { Astro.response.status = 404; }`

- **Cart Expiration:** `initCart()` detects when Shopify cart no longer exists
  - File: `src/stores/cart.ts` lines 46-60
  - Pattern: Reset to empty cart object if validation fails

## Cross-Cutting Concerns

**Logging:** None detected. Console errors only in `makeShopifyRequest()` for missing buyer IP.

**Validation:** Zod schemas applied to all API responses. Input validation via TypeScript types.

**Authentication:**
- Server-side: Private Shopify Storefront token from `PRIVATE_SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- Client-side: Public token from `PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- Both configured via `src/utils/config.ts`

**Performance Optimization:**
- Cache headers set per-route (short TTL for dynamic product pages, managed by Astro)
- Buyer IP header required for Shopify to apply personalization
- Svelte components hydrated only when needed (`client:load` directive)

---

*Architecture analysis: 2026-03-12*
