# External Integrations

**Analysis Date:** 2026-03-12

## APIs & External Services

**Shopify Storefront API:**
- Service: Shopify's GraphQL Storefront API (v2023-01)
- What it's used for: Product catalog, inventory, shopping cart operations, product recommendations
  - SDK/Client: Direct GraphQL fetch calls (no official SDK used)
  - Auth: Token-based authentication with two token types:
    - `PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` - Client-side requests
    - `PRIVATE_SHOPIFY_STOREFRONT_ACCESS_TOKEN` - Server-side requests
  - Endpoint: `https://{shop}.myshopify.com/api/2023-01/graphql.json`

## Data Storage

**Databases:**
- None - Application is headless, all product/catalog data comes from Shopify

**Client-Side Storage:**
- localStorage - Used via `@nanostores/persistent` for cart state persistence
  - Key: `"cart"` (defined in `src/stores/cart.ts`)
  - Purpose: Persist shopping cart between sessions
  - Format: JSON encoded/decoded

**Session Storage:**
- sessionStorage - Used to track session initialization (`"sessionStarted"` flag)
  - Purpose: Prevent redundant cart validation on page reload
  - Cleared on browser close

## Authentication & Identity

**Auth Provider:**
- None - Application is unauthenticated storefront
- All API calls use public/private access tokens, not user authentication
- Shopify cart operations are anonymous (cart ID based, not user based)

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Console only
  - Error logging for missing buyer IP in server-side requests: `src/utils/shopify.ts:27-29`
  - Pattern: Direct `console.error()` calls with emoji indicators

## CI/CD & Deployment

**Hosting:**
- Vercel (via `@astrojs/vercel` adapter in `astro.config.mjs`)
- Server-side rendering enabled (`output: "server"`)

**CI Pipeline:**
- Dependabot enabled (`.github/dependabot.yml`)
  - Automatically checks for dependency updates
  - No custom GitHub Actions workflows detected

## Environment Configuration

**Required env vars:**
- `PUBLIC_SHOPIFY_SHOP` - Storefront shop URL (example format: `store-name.myshopify.com`)
- `PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` - Public Storefront API access token
- `PRIVATE_SHOPIFY_STOREFRONT_ACCESS_TOKEN` - Private Storefront API access token (server-side only)

**Secrets location:**
- `.env` file (not committed, see `.env.example` for template)
- Vercel environment variable configuration for production deployments

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## GraphQL Operations

The application implements the following GraphQL queries and mutations via `src/utils/graphql.ts`:

**Queries:**
- `ProductsQuery` - Fetch paginated product list with images and variants
- `ProductByHandleQuery` - Fetch single product by URL handle
- `ProductRecommendationsQuery` - Fetch recommended products based on product ID
- `GetCartQuery` - Fetch cart details by cart ID

**Mutations:**
- `CreateCartMutation` - Create new cart with initial line item
- `AddCartLinesMutation` - Add merchandise to existing cart
- `RemoveCartLinesMutation` - Remove line items from cart

All queries/mutations include full cart/product fragment definitions with image URLs, pricing, inventory status, and checkout information.

## API Communication Flow

**Server-Side (SSR) Requests:**
- Uses `PRIVATE_SHOPIFY_STOREFRONT_ACCESS_TOKEN` header
- Requires `Shopify-Storefront-Buyer-IP` header for Shopify tracking
- Made from Astro server routes and during page generation
- Implementation: `src/utils/shopify.ts:15-67`

**Client-Side Requests:**
- Uses `PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` header via `X-Shopify-Storefront-Access-Token`
- Made from Svelte components and browser code
- Implementation: `src/utils/shopify.ts:46-49`

**Error Handling:**
- HTTP error responses: Throw with status and response text
- GraphQL errors: Throw with concatenated error messages from response
- Runtime validation: Zod schema validation on responses

---

*Integration audit: 2026-03-12*
