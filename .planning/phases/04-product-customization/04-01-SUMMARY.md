---
phase: 04-product-customization
plan: 01
subsystem: ui
tags: [shopify, graphql, zod, svelte, astro, cart, attributes, brand-identity]

# Dependency graph
requires:
  - phase: 01-design-system
    provides: Brand tokens (text-navy, text-gold, .button) and Tailwind v4 theme
  - phase: 02-homepage
    provides: ProductCard component and product grid layout
provides:
  - Cart line item attributes pipeline (GraphQL mutation -> Zod schema -> shopify.ts -> cart store)
  - Brand-restyled ProductCard (navy text, gold price)
  - Brand-restyled ProductInformations (navy title, gold price, no fake reviews)
  - Brand-restyled CartDrawer (navy heading, gold CTAs, attributes display)
affects: [05-customization-form, checkout-integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Shopify AttributeInput passed as $attributes variable in cart mutations"
    - "Zod CartAttributeResult schema validates key/value attribute pairs"
    - "attributes default to [] everywhere to maintain backward compatibility"

key-files:
  created: []
  modified:
    - src/utils/graphql.ts
    - src/utils/schemas.ts
    - src/utils/shopify.ts
    - src/stores/cart.ts
    - src/components/ProductCard.astro
    - src/components/ProductInformations.astro
    - src/components/CartDrawer.svelte

key-decisions:
  - "attributes default to [] in createCart, addCartLines, and addCartItem — zero-change to existing non-customized add-to-cart flow"
  - "Fake star reviews and demo-store disclaimer removed from ProductInformations — irrelevant to deal toys brand"
  - "CartDrawer checkout button spans full width (w-full text-center) for better CTA prominence"

patterns-established:
  - "Attributes flow: GraphQL mutation variable -> shopify.ts parameter -> cart store parameter -> CartDrawer render"
  - "Brand colors: replace zinc/emerald with text-navy (body/headings) and text-gold (prices/CTAs)"

requirements-completed: [PROD-02, PROD-03]

# Metrics
duration: 5min
completed: 2026-03-12
---

# Phase 4 Plan 01: Cart Attributes Pipeline and Brand Restyle Summary

**Shopify cart line item attributes wired end-to-end (GraphQL -> Zod -> store -> UI) and all product-facing pages restyled to ABC Deal Toys navy/gold brand identity**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-12T21:08:13Z
- **Completed:** 2026-03-12T21:11:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Full attributes pipeline: `CART_FRAGMENT` returns `attributes { key value }`, mutations accept `$attributes: [AttributeInput!]`, Zod `CartItemResult` includes `attributes`, `createCart`/`addCartLines`/`addCartItem` all thread attributes through with `[]` defaults
- Brand restyle: ProductCard uses `text-navy` body and `text-gold` price, ProductInformations uses `text-navy` title and `text-gold` price, CartDrawer heading is `text-navy` and CTAs are `text-gold`
- Removed fake 4-star reviews and demo-store disclaimer from ProductInformations — cleaned component down to title + price
- CartDrawer renders customization attributes as `<dl>` under each line item when present; checkout button spans full width

## Task Commits

Each task was committed atomically:

1. **Task 1: Add cart line item attributes to GraphQL, Zod schemas, and cart store** - `823f032` (feat)
2. **Task 2: Restyle product grid, detail page, and cart drawer to brand identity** - `ece7f21` (feat)

## Files Created/Modified

- `src/utils/graphql.ts` - Added `attributes { key value }` to CART_FRAGMENT, `$attributes: [AttributeInput!]` to CreateCartMutation and AddCartLinesMutation
- `src/utils/schemas.ts` - Added `CartAttributeResult` schema, added `attributes` field to `CartItemResult`
- `src/utils/shopify.ts` - Updated `createCart` and `addCartLines` to accept and pass `attributes` parameter
- `src/stores/cart.ts` - Updated `addCartItem` to accept optional `attributes` array, passes through to both create and add-lines paths
- `src/components/ProductCard.astro` - Replaced zinc/orange styles with `text-navy`, `text-gold`, `border-navy/10`
- `src/components/ProductInformations.astro` - Replaced emerald/zinc with `text-navy`/`text-gold`, removed fake reviews and demo disclaimer
- `src/components/CartDrawer.svelte` - Replaced zinc/emerald with `text-navy`/`text-gold`, added attributes display, full-width checkout button

## Decisions Made

- attributes default to `[]` everywhere — existing non-customized add-to-cart calls continue working with zero changes to callers
- Fake star reviews and demo-store disclaimer removed from ProductInformations since ABC Deal Toys is a real luxury store, not a Shopify demo
- Checkout button gets `w-full text-center` for better CTA prominence in the cart drawer footer

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

6 pre-existing TypeScript errors in `src/pages/products/[...handle].astro` and `src/components/ProductCard.astro` (optional chaining on variant props) exist before and after this plan's changes. The build succeeds regardless. Logged to deferred-items.

## Next Phase Readiness

- Attributes pipeline complete — ready for Phase 4 Plan 02 (customization form) which will call `addCartItem` with a populated `attributes` array
- Brand restyle complete on all product-facing pages — consistent navy/gold identity throughout shopping flow

---
*Phase: 04-product-customization*
*Completed: 2026-03-12*

## Self-Check: PASSED

All created/modified files verified present. Both task commits (823f032, ece7f21) verified in git log.
