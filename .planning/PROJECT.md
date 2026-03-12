# ABC Deal Toys Store

## What This Is

A premium e-commerce storefront for ABC Deal Toys, a company that crafts custom deal toys, financial tombstones, and awards for investment bankers, lawyers, and professionals who close big deals. Built on a Shopify-backed Astro/Svelte stack, the store lets buyers browse template deal toy designs, customize them with deal details and logos, and purchase directly online.

## Core Value

Customers can browse, customize, and purchase premium deal toys through a polished, world-class shopping experience that reflects the prestige of the deals being celebrated.

## Requirements

### Validated

- ✓ Shopify Storefront API integration (GraphQL) — existing
- ✓ Product listing page with grid layout — existing
- ✓ Product detail page with variants and images — existing
- ✓ Add to cart / cart drawer functionality — existing
- ✓ Server-side rendering via Astro with Vercel deployment — existing
- ✓ Zod-validated API responses — existing

### Active

- [ ] ABC Deal Toys branding (Victory Gold, Heritage Navy, Slate, Ivy Green color palette)
- [ ] Baskerville typography integration
- [ ] Homepage hero and brand storytelling
- [ ] Mission statement integration
- [ ] About / Our Story page
- [ ] Portfolio / Gallery page showcasing past work
- [ ] How It Works page (inquiry → design → delivery)
- [ ] Contact / Get a Quote page with inquiry form
- [ ] Product customization: text/deal details input on product pages
- [ ] Product customization: logo upload capability
- [ ] Navigation with all pages linked
- [ ] Footer with brand info and links
- [ ] Responsive, mobile-first design
- [ ] Stripe-level UI polish and micro-interactions

### Out of Scope

- Custom (non-template) deal toy design flow — complexity too high for v1, use quote form instead
- User accounts / order history — Shopify handles post-purchase
- Blog / content marketing — not core to purchase flow
- Real-time chat support — contact form sufficient for v1
- Payment processing changes — Shopify checkout handles this

## Context

**Brand Identity:**
- Mission: "Celebrate the closers" — premium, confident, slightly irreverent tone inspired by Glengarry Glen Ross ("Coffee's for closers")
- Colors: Victory Gold (#ebbc28), Heritage Navy (#052a38), Slate (#1a1b1b), Ivy Green (#00442e)
- Font: Baskerville (all weights available in assets/fonts/)
- Brand images available in assets/images/ (logos, product shots, lifestyle images, quote graphics)

**Target Audience:**
- Investment bankers, M&A lawyers, PE/VC professionals
- Executive assistants ordering on behalf of deal teams
- Both direct buyers and admin staff placing orders

**Product Model:**
- Template-based deal toys with customization (text/deal details + logo upload)
- Full e-commerce checkout (not quote-based)
- Products managed in Shopify admin, displayed via Storefront API

**Existing Codebase:**
- Astro 5.18 + Svelte 5 + Tailwind CSS 4 + TypeScript
- Shopify Storefront API with nanostores cart management
- Deployed on Vercel with SSR
- Bare-bones template — needs complete visual redesign and new pages

## Constraints

- **Tech Stack**: Must use existing Astro/Svelte/Tailwind/Shopify stack — no framework changes
- **Deployment**: Vercel via @astrojs/vercel adapter
- **Shopify API**: Storefront API version 2023-01 (existing config)
- **Font**: Baskerville must be the primary typeface (self-hosted from assets)
- **Brand Colors**: Must use the four specified brand colors consistently
- **Design Quality**: Must meet Stripe-level UI/UX polish standards

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full e-commerce (not quote-based) | Lower friction for template products, faster conversion | — Pending |
| Template deal toys only (no bespoke) | Simplifies product model, bespoke handled via contact form | — Pending |
| Self-hosted Baskerville font | Brand requirement, included in assets | — Pending |
| Existing Astro/Svelte stack | Already built and deployed, no reason to change | — Pending |

---
*Last updated: 2026-03-12 after initialization*
