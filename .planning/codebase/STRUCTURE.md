# Codebase Structure

**Analysis Date:** 2026-03-12

## Directory Layout

```
abc-dealtoys/
├── src/                          # Application source code
│   ├── pages/                    # Route definitions (Astro file-based routing)
│   │   ├── index.astro          # Home page - product listing
│   │   ├── 404.astro            # 404 not found page
│   │   └── products/
│   │       └── [...handle].astro # Dynamic product detail route
│   ├── components/              # Reusable UI components
│   │   ├── *.astro             # Static/server components (Header, Footer, Cards, etc.)
│   │   └── *.svelte            # Interactive client components (AddToCartForm, CartDrawer, etc.)
│   ├── layouts/                 # Page layout templates
│   │   ├── BaseLayout.astro    # Default layout with header, footer, cart drawer
│   │   └── NotFoundLayout.astro # 404 layout
│   ├── stores/                  # State management (nanostores)
│   │   └── cart.ts             # Cart state, cart operations
│   ├── utils/                   # Helper functions and integrations
│   │   ├── shopify.ts          # Shopify API client and queries
│   │   ├── graphql.ts          # GraphQL query and mutation definitions
│   │   ├── schemas.ts          # Zod validation schemas
│   │   ├── config.ts           # Environment configuration
│   │   ├── cache.ts            # HTTP cache control utilities
│   │   └── click-outside.ts    # DOM utility (directive)
│   ├── styles/                  # Global styles
│   │   └── global.css          # Tailwind + custom CSS
│   └── env.d.ts                # TypeScript environment definitions
├── public/                       # Static assets (favicons, images)
├── astro.config.mjs            # Astro build configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
├── pnpm-lock.yaml             # Dependency lock file
├── .prettierrc.cjs            # Code formatting rules
├── .graphqlrc.yml             # GraphQL IDE configuration
└── .env.example               # Environment variable template
```

## Directory Purposes

**src/pages/:**
- Purpose: Astro file-based routing - each `.astro` file becomes a route
- Contains: Page components that handle routing, server-side data fetching, layout composition
- Key files: `index.astro` (home), `products/[...handle].astro` (product detail), `404.astro`
- Pattern: Pages import layouts and compose sub-components

**src/components/:**
- Purpose: Reusable UI components shared across pages
- Contains: Astro components (static HTML) and Svelte components (interactive)
- Astro components: Render HTML server-side, no hydration cost
- Svelte components: Marked with `client:load` to hydrate on page load
- Pattern: Components receive props, components named descriptively (ProductCard, CartDrawer, etc.)

**src/layouts/:**
- Purpose: Page templates providing common structure (header, footer, navigation)
- Contains: BaseLayout wraps normal pages, NotFoundLayout for 404 pages
- Pattern: Layouts define `<slot />` where page content is injected

**src/stores/:**
- Purpose: Client-side state management using nanostores library
- Contains: Cart state atoms and async cart operation functions
- Cart atom: Persistent (localStorage) with Shopify cart data
- UI state atoms: Non-persistent (drawer open/close, updating status)
- Pattern: Svelte components import and subscribe to atoms via `$store` syntax

**src/utils/:**
- Purpose: Business logic, integrations, and shared utilities
- Shopify integration: API client with proper auth for SSR vs client
- GraphQL: Query/mutation definitions as template strings
- Schemas: Zod validation for type-safe API responses
- Config: Environment-based configuration loading and validation
- Cache/Click: Low-level utilities for HTTP headers and DOM interactions

**src/styles/:**
- Purpose: Global CSS, Tailwind configuration and custom styles
- Contains: global.css only (Tailwind imports, custom utilities)
- Pattern: Tailwind classes used inline in components, global.css for global overrides

## Key File Locations

**Entry Points:**
- `src/pages/index.astro`: Home page - product listing
- `src/pages/products/[...handle].astro`: Product detail page (dynamic)
- `src/pages/404.astro`: 404 error page

**Configuration:**
- `astro.config.mjs`: Build config (SSR mode, Vercel adapter, integrations)
- `tsconfig.json`: TypeScript strict mode
- `.prettierrc.cjs`: Prettier formatting (Astro + Tailwind plugins)
- `src/utils/config.ts`: Runtime config loading from env vars

**Core Logic:**
- `src/utils/shopify.ts`: All Shopify API interactions
- `src/utils/graphql.ts`: GraphQL operation definitions
- `src/stores/cart.ts`: Cart state and operations
- `src/utils/schemas.ts`: Zod schemas for API response validation

**Testing:**
- No test files detected

**Styles:**
- `src/styles/global.css`: Global CSS
- Component styles: Inline Tailwind classes in `.astro` and `.svelte` files

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `ProductCard.astro`, `AddToCartForm.svelte`)
- Pages: kebab-case or index for routes (e.g., `index.astro`, `[...handle].astro`)
- Utilities: camelCase (e.g., `shopify.ts`, `click-outside.ts`)
- Stores: camelCase (e.g., `cart.ts`)

**Directories:**
- All lowercase, plural for collections (e.g., `pages/`, `components/`, `stores/`, `utils/`)
- Dynamic routes use brackets (e.g., `products/[...handle].astro` for catch-all)

**Functions:**
- camelCase (e.g., `getProducts()`, `addCartItem()`, `setCache()`)
- Async functions: same convention (e.g., `getProductByHandle()`)

**Variables:**
- camelCase for primitives and objects (e.g., `cartId`, `buyerIP`, `firstVariant`)
- UPPER_CASE for constants (none detected currently)
- Svelte: `$atom` prefix for store subscriptions (e.g., `$cart`, `$isCartUpdating`)

**Types:**
- PascalCase with "Result" suffix for API response types (e.g., `ProductResult`, `CartResult`)
- PascalCase for schemas (e.g., `configSchema`)
- Props interfaces: `Props` or component-specific (e.g., `interface Props { ... }`)

## Where to Add New Code

**New Feature (e.g., wishlist, reviews):**
- Primary code: `src/stores/wishlist.ts` (for state) or new component
- Server queries: Add new functions to `src/utils/shopify.ts`
- GraphQL operations: Add to `src/utils/graphql.ts`
- Schemas: Add validation schemas to `src/utils/schemas.ts`

**New Component/Module:**
- Interactive component: Create `src/components/YourComponent.svelte` with `client:load` directive
- Static component: Create `src/components/YourComponent.astro`
- Import and compose in pages as needed

**Utilities:**
- Shared helpers: `src/utils/your-helper.ts`
- DOM utilities: `src/utils/your-directive.ts`
- No subdirectories within utils/ (keep flat)

**New Page:**
- File: `src/pages/your-route.astro` or `src/pages/your-route/index.astro`
- Dynamic routes: Use brackets (e.g., `src/pages/products/[category]/index.astro`)
- Import layout (BaseLayout or NotFoundLayout)
- Fetch data in frontmatter (top of file between `---`)

## Special Directories

**public/:**
- Purpose: Static assets served as-is
- Generated: No
- Committed: Yes
- Contains: favicon.svg, images

**assets/:**
- Purpose: Untracked assets folder (likely for build artifacts or temporary files)
- Generated: Yes
- Committed: No (in .gitignore)

**node_modules/:**
- Purpose: Installed dependencies
- Generated: Yes (by pnpm)
- Committed: No (in .gitignore)

**.planning/:**
- Purpose: GSD mapping and planning documents
- Generated: Yes
- Committed: Yes
- Contains: codebase analysis docs

## TypeScript Configuration

**tsconfig.json:**
- Extends: `astro/tsconfigs/strict`
- Strict type checking enabled
- Aliases: None configured (relative imports used)

**Path Aliases:**
- Not configured - use relative imports (e.g., `../utils/shopify`)
- Could be added to tsconfig if deep nesting becomes problematic

## Build & Runtime Configuration

**Astro Configuration (astro.config.mjs):**
- Output: `server` (SSR mode)
- Adapter: Vercel (`@astrojs/vercel`)
- Integrations: Svelte (`@astrojs/svelte`)
- Vite plugins: Tailwind CSS plugin
- Allowed hosts: `abcdealtoys.up.railway.app` (for dev server)

**Package Manager:**
- pnpm (lockfile: `pnpm-lock.yaml`)

**Scripts:**
- `npm run dev`: Start dev server with default host
- `npm run start`: Dev server with `0.0.0.0` host (for Docker/Railway)
- `npm run build`: Production build
- `npm run preview`: Preview production build locally
- `npm run typecheck`: Type checking without emitting code

---

*Structure analysis: 2026-03-12*
