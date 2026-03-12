# Architecture Research

**Domain:** Premium e-commerce storefront — deal toy customization (Astro 5 + Svelte 5 + Tailwind CSS 4 + Shopify Storefront API)
**Researched:** 2026-03-12
**Confidence:** HIGH — based on direct codebase inspection plus official Astro and Shopify documentation

---

## Standard Architecture

### System Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                            │
│                                                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  Static HTML     │  │  Svelte Islands  │  │  Nanostores      │ │
│  │  (Astro pages,   │  │  (CartDrawer,    │  │  (cart,          │ │
│  │  layouts,        │  │  AddToCartForm,  │  │  isCartOpen,     │ │
│  │  static comps)   │  │  CustomizationUI)│  │  isUpdating)     │ │
│  └──────────────────┘  └────────┬─────────┘  └──────────────────┘ │
│                                  │ fetch / actions                 │
└──────────────────────────────────┼─────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────┐
│                    Vercel Edge / SSR Layer                          │
│                                                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  Astro Pages     │  │  Astro Actions   │  │  API Endpoints   │ │
│  │  (SSR rendered,  │  │  (contact form   │  │  (file upload    │ │
│  │  buyerIP passed) │  │  submission)     │  │  handler)        │ │
│  └─────────┬────────┘  └─────────┬────────┘  └────────┬─────────┘ │
└────────────┼─────────────────────┼────────────────────┼───────────┘
             │                     │                    │
┌────────────▼─────────────────────▼────────────────────▼───────────┐
│                        External Services                           │
│                                                                    │
│  ┌──────────────────────┐          ┌──────────────────────────┐    │
│  │  Shopify Storefront  │          │  Email / CRM             │    │
│  │  API (GraphQL)       │          │  (Resend / Nodemailer    │    │
│  │  - Products          │          │   for contact form)      │    │
│  │  - Cart mutations    │          └──────────────────────────┘    │
│  │  - Recommendations   │                                          │
│  └──────────────────────┘          ┌──────────────────────────┐    │
│                                    │  Vercel Blob (optional)  │    │
│                                    │  Logo upload storage     │    │
│                                    └──────────────────────────┘    │
└────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| `BaseLayout.astro` | Shell: font loading, head meta, CartDrawer mounting, Header, Footer slot | Astro layout, wraps all pages |
| `Header.astro` | Brand nav — logo, site name, page links, CartIcon | Static Astro, CartIcon island |
| `Footer.astro` | Brand info, nav links, legal | Pure static Astro |
| `CartDrawer.svelte` | Cart UI — items, subtotal, checkout link | Svelte island, `client:idle`, reads nanostores |
| `CartIcon.svelte` | Cart count badge in header | Svelte island, `client:load`, reads nanostores |
| `AddToCartForm.svelte` | Add to cart + customization inputs | Svelte island, `client:load`, submits to nanostores actions |
| `ProductCard.astro` | Grid card for product listing | Static Astro, no interactivity needed |
| `ProductImageGallery.astro` | Image carousel on PDP | Static Astro (current), upgrade to Svelte island if interactive zoom needed |
| `stores/cart.ts` | Cart state, Shopify mutations | Nanostores atoms, called from Svelte islands |
| `utils/shopify.ts` | GraphQL request wrapper, Zod parsing | Server utilities, called from Astro pages |
| `utils/graphql.ts` | GraphQL query/mutation strings | Constants, imported by shopify.ts |
| `utils/schemas.ts` | Zod validation schemas | Shared between server and client |

---

## Recommended Project Structure

```
src/
├── actions/                   # Astro Actions (NEW — contact form, inquiry)
│   └── index.ts               # server object export with defineAction()
├── components/
│   ├── brand/                 # Brand UI components (NEW)
│   │   ├── Hero.astro         # Homepage hero section
│   │   ├── HowItWorksSteps.astro
│   │   ├── MissionStatement.astro
│   │   └── PortfolioGrid.astro
│   ├── product/               # Product-related components (refactor existing)
│   │   ├── AddToCartForm.svelte      # existing — extend with customization
│   │   ├── CustomizationForm.svelte  # NEW — deal text fields + logo upload
│   │   ├── ProductCard.astro
│   │   ├── ProductImageGallery.astro
│   │   ├── ProductInformations.astro
│   │   └── ProductRecommendations.astro
│   ├── cart/                  # Cart UI (refactor existing)
│   │   ├── CartDrawer.svelte
│   │   └── CartIcon.svelte
│   ├── forms/                 # Form components (NEW)
│   │   └── ContactForm.svelte # Contact/quote form, client:load
│   ├── Header.astro           # extend with full nav links
│   ├── Footer.astro           # extend with brand content
│   └── AnnouncementBar.astro
├── layouts/
│   └── BaseLayout.astro       # extend with font @font-face, brand colors
├── pages/
│   ├── index.astro            # Homepage — add Hero, Mission, How It Works teaser
│   ├── about.astro            # NEW — Our Story page
│   ├── portfolio.astro        # NEW — Gallery of past deal toys
│   ├── how-it-works.astro     # NEW — Process page
│   ├── contact.astro          # NEW — Quote / Contact form page
│   ├── 404.astro
│   └── products/
│       └── [...handle].astro  # extend with CustomizationForm
├── stores/
│   └── cart.ts                # extend: pass attributes with cartLinesAdd
├── styles/
│   └── global.css             # extend: @font-face Baskerville, brand color tokens
└── utils/
    ├── cache.ts
    ├── click-outside.ts
    ├── config.ts
    ├── graphql.ts             # extend: add attributes to cartLinesAdd mutation
    ├── schemas.ts             # extend: CartLineInput with attributes
    └── shopify.ts             # extend: addCartLines accepts customization payload
```

### Structure Rationale

- **`actions/`:** Astro 5's type-safe server actions handle contact form POST with Zod validation — avoids a raw API route for a simple use case.
- **`components/brand/`:** Isolates brand storytelling components from commerce components. Makes it easy to iterate on brand without touching cart or product logic.
- **`components/product/`:** Groups product UI so CustomizationForm can be co-located with AddToCartForm. They coordinate state via Svelte props/callbacks — not global stores.
- **`components/forms/`:** ContactForm is interactive (validation feedback, submission state) so it's Svelte. Its action target is the Astro Action defined in `actions/index.ts`.
- **Static Astro for brand pages:** About, Portfolio, How It Works, Contact are Astro pages. Interactivity is limited to the ContactForm island. This keeps them fast and SEO-friendly.

---

## Architectural Patterns

### Pattern 1: Astro Islands — Static Shell + Svelte Islands for Interactivity

**What:** Astro renders the page as static HTML at request time. Interactive UI (cart, forms, customization inputs) are Svelte components hydrated client-side with `client:load` or `client:idle`.

**When to use:** Any component that needs event handlers, reactive state, or user input. Static sections — hero, steps, gallery — stay as Astro.

**Trade-offs:** Fast initial load, zero JS for static sections. Constraint: Svelte islands cannot accept Astro component children (slots don't work across the island boundary). Data must flow in as serializable props.

**Existing examples:**
```
// Astro page passes serializable data to Svelte island
<AddToCartForm
  client:load
  variantId={firstVariant?.id}
  variantQuantityAvailable={firstVariant?.quantityAvailable}
  variantAvailableForSale={firstVariant?.availableForSale}
/>
```

**Extension for customization:**
```astro
// Product page passes product handle for reference
<CustomizationForm
  client:load
  variantId={firstVariant?.id}
  productHandle={product.handle}
/>
```

### Pattern 2: Cart Attributes for Customization Data

**What:** Shopify's `cartLinesAdd` mutation accepts an `attributes` array of `{ key: String!, value: String! }` pairs on each line. Use this to pass deal text and logo references to Shopify alongside the add-to-cart action.

**When to use:** Any per-line-item customization that must survive to Shopify's admin order view.

**Trade-offs:** Values are strings only — no binary data. Logo must be stored externally (Vercel Blob URL or base64 data URI for small logos) and the URL passed as the attribute value.

**Example extension to existing `addCartLines`:**
```typescript
// utils/shopify.ts
export const addCartLines = async (
  id: string,
  merchandiseId: string,
  quantity: number,
  attributes?: Array<{ key: string; value: string }>
) => {
  const data = await makeShopifyRequest(AddCartLinesMutation, {
    cartId: id,
    merchandiseId,
    quantity,
    attributes: attributes ?? [],
  });
  // ...
};
```

**Updated GraphQL mutation:**
```graphql
mutation ($cartId: ID!, $merchandiseId: ID!, $quantity: Int, $attributes: [AttributeInput!]) {
  cartLinesAdd(cartId: $cartId, lines: [{
    merchandiseId: $merchandiseId,
    quantity: $quantity,
    attributes: $attributes
  }]) {
    cart { ...cartFragment }
  }
}
```

### Pattern 3: Astro Actions for Contact Form

**What:** Define a server-side action in `src/actions/index.ts` using `defineAction()` with Zod input schema. Call it from a Svelte island using the generated `actions` import. Astro handles POST, CSRF, type-safety, and error serialization automatically.

**When to use:** Any form that submits data to the server without navigating to a new page. Contact / quote form is the primary case.

**Trade-offs:** Requires Astro 5 with SSR — which this project already has. Simpler than a raw API route for form-specific use cases. Cannot handle multipart file uploads directly (use a separate API endpoint for logo upload).

**Example:**
```typescript
// src/actions/index.ts
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export const server = {
  submitInquiry: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      company: z.string().optional(),
      message: z.string().min(10),
    }),
    handler: async (input) => {
      // send email via Resend or similar
      return { success: true };
    },
  }),
};
```

### Pattern 4: Logo Upload — Astro API Endpoint + Vercel Blob

**What:** A separate `src/pages/api/upload-logo.ts` endpoint accepts multipart form data, validates the file (type, size), uploads to Vercel Blob, and returns the public URL. The CustomizationForm Svelte island calls this endpoint before submitting to cart.

**When to use:** File uploads that need persistent storage and a URL reference in cart attributes.

**Trade-offs:** Requires `@vercel/blob` package. Adds a two-step flow: upload first, then add to cart. Simpler alternative for MVP: accept base64 data URI (max ~50KB PNG logo) stored directly in cart attribute — avoids blob storage setup entirely.

**MVP recommendation:** Start with base64 data URI for logo. If logos routinely exceed 50KB, migrate to Vercel Blob. The CustomizationForm interface stays identical either way; only the encoding changes.

---

## Data Flow

### Product Customization Flow

```
User fills CustomizationForm (Svelte island)
    ↓
[deal text fields + logo file input]
    ↓
Logo upload (if file present):
  POST /api/upload-logo → Vercel Blob (or convert to base64)
  ← returns logoUrl string
    ↓
User clicks "Add to Cart"
    ↓
CustomizationForm calls addCartItem() with attributes:
  [
    { key: "Deal Name", value: "Project Thunder" },
    { key: "Closing Date", value: "March 2026" },
    { key: "Deal Value", value: "$2.5B" },
    { key: "Logo URL", value: "https://..." }
  ]
    ↓
stores/cart.ts → addCartLines() → Shopify Storefront API (GraphQL)
  cartLinesAdd mutation with attributes array
    ↓
CartDrawer opens, shows item with customization note
    ↓
User proceeds to Shopify checkout (checkoutUrl)
  Shopify admin sees line item properties in order
```

### Contact Form Flow

```
User fills ContactForm (Svelte island on /contact page)
    ↓
Form submits via Astro Actions (actions.submitInquiry)
    ↓
actions/index.ts handler (server-side):
  - Zod validates input
  - Sends email via Resend / Nodemailer
  ← returns { success: true } or ActionError
    ↓
ContactForm shows success message or inline field errors
(no page navigation required)
```

### Brand Page Data Flow

```
Browser requests /about, /portfolio, /how-it-works, /contact
    ↓
Astro SSR renders page at request time
  - Static brand content: hardcoded in .astro files
  - Portfolio images: src/assets/ (Astro image optimization)
  - No Shopify API calls needed on brand pages
    ↓
HTML streamed to browser
  - ContactForm island hydrated client:load
  - Everything else: zero JS
```

### State Management

```
Nanostores (existing — do not change scope)
  cart (persistentAtom) — cart ID, lines, totals
  isCartDrawerOpen (atom) — drawer toggle
  isCartUpdating (atom) — loading state

CustomizationForm local state (Svelte $state rune)
  dealText fields — local form state, not global
  logoFile — local File object pre-upload
  logoUrl — resolved after upload, passed to addCartItem

ContactForm local state (Svelte $state rune)
  fields — local form state
  submitting — submission in progress
  result — success / error from Astro Action
```

---

## Component Boundaries (What Talks to What)

| Boundary | Communication | Direction | Notes |
|----------|--------------|-----------|-------|
| Astro page → Svelte island | Props (serializable values only) | Page → Island | No Astro components inside Svelte |
| Svelte island → nanostores | Import + `$store` rune | Island → Store | CartDrawer, CartIcon, AddToCartForm all use this |
| CustomizationForm → cart store | Calls `addCartItem(item)` with extended attributes | Island → Store | CustomizationForm is new Svelte island |
| ContactForm → Astro Actions | `import { actions } from 'astro:actions'` | Island → Server | Type-safe, Zod-validated |
| Astro Actions → email service | HTTP to Resend/SMTP | Server → External | Runs server-side only |
| Astro page → shopify.ts | `await getProducts()`, `await getProductByHandle()` | Page → Util | Server-side only, uses private token |
| Svelte islands → shopify.ts | Via cart store actions only | Island → Store → Util | Islands never call Shopify directly |
| shopify.ts → Shopify API | GraphQL over fetch | Server → External (SSR) or Client → External (mutations) | Private token for SSR, public token for client |

Key constraint: **Svelte islands do not call `shopify.ts` directly.** All Shopify interactions go through `stores/cart.ts`. This is the existing pattern and must be preserved — it keeps credentials and fetch logic in one place.

---

## Build Order (Dependency Graph)

Phase dependencies flow strictly in this order. Do not start a phase before its prerequisites are complete.

```
1. Global Design Tokens (BaseLayout, global.css)
   ↓
   Required by: EVERYTHING. Font loading, brand colors, spacing.

2. Header + Footer (Navigation, Brand Frame)
   ↓
   Required by: All pages (they share BaseLayout which includes Header/Footer).

3. Homepage (Hero, Mission, How It Works Teaser)
   ↓
   Required by: Nothing downstream, but validates brand direction before building more pages.

4. Brand Content Pages (About, Portfolio, How It Works, Contact)
   ↓
   Required by: Navigation links (Header must link somewhere real).
   ContactForm depends on: Astro Actions setup (step 5).

5. Astro Actions Setup (src/actions/index.ts)
   ↓
   Required by: ContactForm, potentially logo upload endpoint.

6. Product Page Customization (CustomizationForm.svelte)
   ↓
   Required by: Extended cart store.
   Depends on: Cart store working correctly (already done), graphql.ts extended with attributes.

7. Cart Store Extension (attributes in addCartLines)
   ↓
   Must ship with: CustomizationForm (they are tightly coupled).
   Depends on: graphql.ts mutation updated first.
```

**Recommended phase grouping for roadmap:**

| Phase | Items | Rationale |
|-------|-------|-----------|
| Phase 1 | Global design tokens + Header + Footer | Foundation — everything else depends on it |
| Phase 2 | Homepage | Validates brand direction early; no dependencies on later phases |
| Phase 3 | Brand pages (About, Portfolio, How It Works, Contact) | Content pages, low risk; Contact needs Actions |
| Phase 4 | Product customization (CustomizationForm + cart attribute extension) | Most technically complex; isolated to product detail page |

---

## Anti-Patterns

### Anti-Pattern 1: Putting Interactivity in Astro Components

**What people do:** Add event listeners, form `onsubmit`, reactive state inside `.astro` files.
**Why it's wrong:** Astro components are server-rendered templates. They don't ship JavaScript. Any attempt to add interactivity silently does nothing client-side.
**Do this instead:** Any interactive UI — contact form, customization inputs, cart actions — must be a Svelte component with a `client:*` directive on the Astro page that uses it.

### Anti-Pattern 2: Passing Non-Serializable Data Across the Island Boundary

**What people do:** Pass complex objects, Svelte stores, or DOM references as props to a Svelte island from an Astro page.
**Why it's wrong:** Astro serializes props to HTML attributes for hydration. Only JSON-serializable values work. Passing a store or a class instance causes hydration failures.
**Do this instead:** Pass primitive values and plain objects. Import stores inside the Svelte component. The existing `AddToCartForm` follows this correctly — it receives `variantId: string`, not a product object.

### Anti-Pattern 3: Calling Shopify API Directly from Svelte Islands

**What people do:** Import `getProducts` or `makeShopifyRequest` inside a Svelte component and call it from the browser.
**Why it's wrong:** The private Shopify token would be exposed to the client. The existing pattern correctly separates SSR calls (Astro pages, private token) from client calls (cart store mutations, public token).
**Do this instead:** Shopify read queries belong in Astro pages (SSR, private token). Cart mutations belong in `stores/cart.ts` (client, public token). New features should follow this separation.

### Anti-Pattern 4: Storing Binary File Data in Cart Attributes

**What people do:** Encode a large logo file as base64 and stuff it into a cart attribute.
**Why it's wrong:** Shopify enforces a 250-value limit on cart attributes and has undocumented string length limits. Large base64 strings will hit limits or degrade performance in Shopify admin.
**Do this instead:** Upload logo to external storage first (Vercel Blob), store only the URL in the cart attribute. For a v1 MVP with small logos (under 50KB), base64 is acceptable as a starting point.

### Anti-Pattern 5: Using Global Nanostores for Local Form State

**What people do:** Add deal text fields and logo state to the global cart nanostore.
**Why it's wrong:** Customization state is per-form-session, not per-cart. Pollutes the global store with ephemeral data that needs cleanup logic.
**Do this instead:** Keep `dealText`, `logoFile`, and `logoUrl` as local `$state` runes inside `CustomizationForm.svelte`. Only the resolved attributes array passes into the global `addCartItem()` call.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Shopify Storefront API | GraphQL over fetch in `utils/shopify.ts` | Private token (SSR) + public token (client mutations) — existing |
| Shopify Cart | `cartLinesAdd` mutation with `attributes` array | Extend existing mutation to accept attributes |
| Email / CRM | Server-side call in Astro Action handler | Resend is recommended (simple API, good TypeScript support). Nodemailer works for SMTP. |
| Vercel Blob | REST upload from Astro API endpoint | Only needed if logo upload grows beyond base64 MVP |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `CustomizationForm.svelte` ↔ `AddToCartForm.svelte` | Parent/child props, or single merged component | Simplest: merge into one Svelte component on PDP. Separating them adds coordination complexity without benefit. |
| `pages/contact.astro` ↔ `forms/ContactForm.svelte` | Props (none needed), Astro Action import inside Svelte | ContactForm imports `actions` from `astro:actions` directly |
| `styles/global.css` ↔ All components | CSS custom properties for brand tokens | Define `--color-gold`, `--color-navy`, `--color-slate`, `--color-ivy-green`, `--font-baskerville` as CSS variables in global.css `@layer base`; Tailwind config references them |
| `assets/fonts/` ↔ `BaseLayout.astro` | `@font-face` in global.css, `font-display: swap` | Self-hosted Baskerville loaded via CSS, not Google Fonts |

---

## Scaling Considerations

This project will not scale to millions of users. Scale concerns are product-focused, not infrastructure-focused.

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Current (small catalog, low traffic) | SSR every page is fine. Short cache headers already set via `setCache.short(Astro)`. |
| Growing catalog (100+ products) | Add pagination to `getProducts()`. Product listing already supports `limit` param. |
| Logo upload volume | If many customers upload logos, migrate from base64 to Vercel Blob. API endpoint interface stays the same. |
| Contact form volume | Astro Action + email is fine indefinitely. Only add a CRM integration if the sales team needs it. |

---

## Sources

- [Shopify Storefront API — cartLinesAdd mutation](https://shopify.dev/docs/api/storefront/latest/mutations/cartLinesAdd) — attributes array on CartLineInput
- [Shopify — Create and update a cart](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage)
- [Astro Actions documentation](https://docs.astro.build/en/guides/actions/) — defineAction, accept: 'form', Zod input
- [Astro — Build forms with API routes](https://docs.astro.build/en/recipes/build-forms-api/)
- [Astro Islands architecture](https://docs.astro.build/en/concepts/islands/) — client directives, island boundaries
- [Vercel Blob — server upload](https://vercel.com/docs/vercel-blob/server-upload)

---

*Architecture research for: ABC Deal Toys — branding, brand pages, and product customization milestone*
*Researched: 2026-03-12*
