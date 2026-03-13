# Coding Conventions

**Analysis Date:** 2026-03-12

## Naming Patterns

**Files:**
- Component files: PascalCase (e.g., `AddToCartForm.svelte`, `ProductCard.astro`)
- Utility files: kebab-case (e.g., `click-outside.ts`, `cache.ts`)
- Store files: kebab-case (e.g., `cart.ts`)
- Schema/config files: kebab-case (e.g., `schemas.ts`, `config.ts`)

**Functions:**
- Regular functions: camelCase (e.g., `addCartItem`, `getProductByHandle`, `clickOutside`)
- Async functions: camelCase with clear action verbs (e.g., `initCart`, `getProducts`, `createCart`)
- Object methods: camelCase (e.g., `setCache.long`, `setCache.short`)

**Variables:**
- Local variables: camelCase (e.g., `sessionStarted`, `variantInCart`, `noQuantityLeft`)
- Constants: camelCase (e.g., `emptyCart`, `CART_FRAGMENT`, `PRODUCT_FRAGMENT`)
- Boolean variables: prefix with `is` or `no` (e.g., `isCartDrawerOpen`, `isCartUpdating`, `variantAvailableForSale`, `noQuantityLeft`)
- Store atoms: camelCase prefixed with descriptor (e.g., `isCartDrawerOpen`, `isCartUpdating`, `cart`)

**Types:**
- Zod schemas: PascalCase with `Result` suffix (e.g., `CartResult`, `ProductResult`, `MoneyV2Result`, `ImageResult`)
- Zod objects (intermediate): PascalCase with `Result` suffix (e.g., `CartItemResult`, `VariantResult`)
- Config schemas: camelCase (e.g., `configSchema`)
- TypeScript interfaces: PascalCase with `Props` suffix for component props (e.g., `Props`)

**GraphQL:**
- Query constants: UPPER_CASE (e.g., `ProductsQuery`, `GetCartQuery`, `CreateCartMutation`)
- Fragment constants: snake_case prefixed with `FRAGMENT` (e.g., `CART_FRAGMENT`, `PRODUCT_FRAGMENT`)

## Code Style

**Formatting:**
- Tool: Prettier 3.8.1 with Astro and Tailwind plugins
- Configuration file: `.prettierrc.cjs`
- Plugins used:
  - `prettier-plugin-astro` - handles Astro file formatting
  - `prettier-plugin-tailwindcss` - sorts Tailwind CSS classes

**Linting:**
- No ESLint config detected - relies on TypeScript compiler for type checking only

**Language:**
- Primary: TypeScript with strict mode (extends `astro/tsconfigs/strict`)
- Also: Astro, Svelte (with TypeScript support), CSS (Tailwind)

## Import Organization

**Order:**
1. Type imports from external packages (e.g., `import type { z } from "zod"`)
2. Regular imports from external packages (e.g., `import { atom } from "nanostores"`)
3. Type imports from local modules (e.g., `import type { CartResult } from "../utils/schemas"`)
4. Regular imports from local modules (e.g., `import { getCart } from "../utils/shopify"`)
5. Relative imports in order: parent directories first, then sibling directories

**Example from `src/components/ProductCard.astro`:**
```typescript
import type { z } from "zod";
import type { ProductResult } from "../utils/schemas";

import ShopifyImage from "./ShopifyImage.svelte";
import Money from "./Money.svelte";
```

**Example from `src/stores/cart.ts`:**
```typescript
import type { z } from "zod";
import { atom } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";
import {
  getCart,
  addCartLines,
  createCart,
  removeCartLines,
} from "../utils/shopify";
import type { CartResult } from "../utils/schemas";
```

**Path Aliases:**
- No path aliases configured - all imports use relative paths (e.g., `../utils/shopify`, `../stores/cart`)

## Error Handling

**Patterns:**
- Explicit error throwing in API functions: `throw new Error(message)` (see `src/utils/shopify.ts`)
- API response validation: throw immediately if response is not OK
- GraphQL error handling: extract error messages and throw as single error
- Console error logging for developer-facing issues (see line 27-29 in `src/utils/shopify.ts`: `console.error()` when buyerIP not provided on SSR)
- No try-catch blocks in async functions - errors propagate to caller
- Zod validation: `schema.parse()` throws automatically on validation failure

**Examples:**
```typescript
// Response validation error (src/utils/shopify.ts, line 56-59)
if (!response.ok) {
  const body = await response.text();
  throw new Error(`${response.status} ${body}`);
}

// GraphQL error handling (src/utils/shopify.ts, line 62-64)
if (json.errors) {
  throw new Error(json.errors.map((e: Error) => e.message).join("\n"));
}

// Data presence validation (src/utils/shopify.ts, line 83-85)
if (!products) {
  throw new Error("No products found");
}

// Zod validation (src/utils/shopify.ts, line 89)
const parsedProducts = ProductsResult.parse(productsList);
```

## Logging

**Framework:** `console.error()` only

**Patterns:**
- Developer-facing errors: `console.error()` with emoji prefix (🔴) for visibility
- Error messages follow format: `console.error("🔴 [context] [message]")`
- No info, debug, or warning logs in codebase - only errors for exceptional conditions

**Example from `src/utils/shopify.ts` (line 27-29):**
```typescript
isSSR &&
  !buyerIP &&
  console.error(
    `🔴 No buyer IP provided => make sure to pass the buyer IP when making a server side Shopify request.`
  );
```

## Comments

**When to Comment:**
- Explain WHY, not WHAT - code should be self-documenting
- Use for important business logic (e.g., cart behavior in `src/stores/cart.ts`)
- Use for non-obvious Shopify API behavior and constraints

**Example patterns from `src/stores/cart.ts`:**
```typescript
// Cart drawer state (open or closed) with initial value (false) and no persistent state (local storage)
export const isCartDrawerOpen = atom(false);

// Fetch cart data if a cart exists in local storage, this is called during session start only
// This is useful to validate if the cart still exists in Shopify and if it's not empty
// Shopify automatically deletes the cart when the customer completes the checkout or if the cart is unused or abandoned after 10 days
// https://shopify.dev/custom-storefronts/cart#considerations
export async function initCart() {
```

**JSDoc/TSDoc:**
- Not used in codebase
- TypeScript inference and explicit types handle documentation

## Function Design

**Size:** Functions are concise, typically 10-30 lines max

**Parameters:**
- Accept object parameters when multiple related options needed (e.g., `options: { limit?: number; buyerIP: string }`)
- Inline inline type definitions within function signature or extract to interface above

**Return Values:**
- Async functions return parsed Zod types or void
- Always validate return values with Zod before returning (e.g., `ProductResult.parse(product)`)
- No null-safe optional returns - throw on unexpected data

**Example function from `src/utils/shopify.ts`:**
```typescript
export const getProductByHandle = async (options: {
  handle: string;
  buyerIP: string;
}) => {
  const { handle, buyerIP } = options;

  const data = await makeShopifyRequest(
    ProductByHandleQuery,
    { handle },
    buyerIP
  );
  const { product } = data;

  const parsedProduct = ProductResult.parse(product);

  return parsedProduct;
};
```

## Module Design

**Exports:**
- Named exports for all public functions and constants
- `export const` for atoms, stores, and utility functions
- `export` keyword placed at start of declaration (not `export default`)

**Barrel Files:**
- Not used - each utility/store file imported directly

**Example exports from `src/stores/cart.ts`:**
```typescript
export const isCartDrawerOpen = atom(false);
export const isCartUpdating = atom(false);
export const cart = persistentAtom<z.infer<typeof CartResult>>(...);
export async function initCart() { ... }
export async function addCartItem(item: { id: string; quantity: number }) { ... }
export async function removeCartItems(lineIds: string[]) { ... }
```

**Module organization:**
- One responsibility per module
- Store/state logic isolated in `src/stores/`
- API/integration logic in `src/utils/`
- UI components in `src/components/`
- Pages in `src/pages/`

## Astro-Specific Patterns

**Component structure:**
- Frontmatter section (---) for imports, logic, and prop definitions
- HTML template section below
- No style blocks (use Tailwind CSS instead)

**Props:**
- Define `Props` interface in frontmatter
- Access via `Astro.props as Props` for type safety

**Example from `src/components/ProductCard.astro`:**
```typescript
---
import type { z } from "zod";
import type { ProductResult } from "../utils/schemas";

import ShopifyImage from "./ShopifyImage.svelte";
import Money from "./Money.svelte";

export interface Props {
  product: z.infer<typeof ProductResult>;
}
const { product } = Astro.props as Props;
---

<a href={`/products/${product?.handle}`} class="...">
  <!-- template -->
</a>
```

## Svelte-Specific Patterns

**Component structure:**
- `<script lang="ts">` block at top with reactive variables
- HTML template in middle using reactive bindings
- Svelte 5 rune syntax: `$props()`, `$derived`, `$derived.by()`

**Props:**
- Define `interface Props` within script block
- Destructure using `let { variantId, ... }: Props = $props()`

**Reactivity:**
- Use `$derived` for computed values
- Use `$derived.by()` for complex derived calculations

**Example from `src/components/AddToCartForm.svelte`:**
```typescript
<script lang="ts">
  interface Props {
    variantId: string;
    variantQuantityAvailable: number;
    variantAvailableForSale: boolean;
  }

  let { variantId, variantQuantityAvailable, variantAvailableForSale }: Props = $props();

  let variantInCart = $derived(
    $cart && $cart.lines?.nodes.filter((item) => item.merchandise.id === variantId)[0]
  );
```

**Store subscriptions:**
- Use `$cart` to subscribe to persistent atoms
- Use `$isCartUpdating` for boolean state subscriptions

---

*Convention analysis: 2026-03-12*
