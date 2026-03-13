# Technology Stack

**Analysis Date:** 2026-03-12

## Languages

**Primary:**
- TypeScript 5.9.3 - Full codebase type safety, used in utilities, stores, and configuration
- Astro 5.18.0 - Framework for pages, layouts, and components
- Svelte 5.53.6 - Interactive components integrated with Astro

**Markup:**
- Astro (.astro files) - Server-side templating for layouts and pages
- HTML/CSS - Styling with Tailwind CSS

## Runtime

**Environment:**
- Node.js 20+ (required per `package.json` engines)

**Package Manager:**
- pnpm (inferred from `pnpm-lock.yaml` present)
- Lockfile: `pnpm-lock.yaml` (160KB)

## Frameworks

**Core:**
- Astro 5.18.0 - Full-stack meta-framework with server/client rendering
- Svelte 5.53.6 - Reactive component framework for client-side interactivity
- @astrojs/svelte 7.2.5 - Integration layer between Astro and Svelte

**UI & Styling:**
- Tailwind CSS 4.2.1 - Utility-first CSS framework
- @tailwindcss/vite 4.2.1 - Vite plugin for Tailwind integration

**Deployment:**
- @astrojs/vercel 9.0.4 - Adapter for Vercel serverless deployment

## State Management

- nanostores 1.1.1 - Lightweight atom-based state management
- @nanostores/persistent 1.3.3 - Persistent atom storage with localStorage integration
- Usage: Cart state management (`src/stores/cart.ts`)

## Validation & Schema

- zod 4.3.6 - Runtime TypeScript-first schema validation
- Used for: Configuration validation, API response schemas, cart/product data validation
- Located in: `src/utils/schemas.ts`, `src/utils/config.ts`

## Shopify Integration

- @shopify/hydrogen-react 2026.1.1 - Shopify's React components library (included but Svelte used instead)
- Direct: GraphQL API calls via fetch to Shopify Storefront API

## Development & Build Tools

**Code Quality:**
- Prettier 3.8.1 - Code formatter
  - prettier-plugin-astro 0.14.1 - Astro file formatting support
  - prettier-plugin-tailwindcss 0.7.2 - Tailwind class sorting
- TypeScript 5.9.3 - Static type checking (`tsc --noEmit` via typecheck script)

**Configuration:**
- `.prettierrc.cjs` - Prettier configuration with Astro and Tailwind plugins
- `tsconfig.json` - Extends `astro/tsconfigs/strict`
- `astro.config.mjs` - Astro configuration with Vercel adapter and Tailwind Vite plugin
- `.graphqlrc.yml` - GraphQL schema configuration

## Configuration

**Environment:**
- Environment variables prefixed with `PUBLIC_` are exposed to client code
- Environment variables prefixed with `PRIVATE_` are server-only
- Required vars (from `.env.example`):
  - `PUBLIC_SHOPIFY_SHOP` - Shopify store URL (format: `{store}.myshopify.com`)
  - `PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` - Client-side Storefront API token
  - `PRIVATE_SHOPIFY_STOREFRONT_ACCESS_TOKEN` - Server-side private Storefront API token
- API version: Hardcoded as `2023-01` in `src/utils/config.ts`

**Build:**
- `astro.config.mjs` - Main Astro configuration
- Vite server configuration for allowed hosts: `abcdealtoys.up.railway.app`

## Platform Requirements

**Development:**
- Node.js 20 or higher
- Package manager: pnpm (or npm/yarn compatible)

**Production:**
- Deployment target: Vercel (via `@astrojs/vercel` adapter)
- Output mode: Server-side rendering (`output: "server"` in astro.config.mjs)

---

*Stack analysis: 2026-03-12*
