# Roadmap: ABC Deal Toys Store

## Overview

Starting from a functional but bare-bones Astro + Shopify scaffold, this milestone adds the complete brand identity, content pages, and product customization layer needed to launch a world-class premium deal toy storefront. The build order flows from global design tokens (which everything depends on) through homepage validation, brand content pages, and finally the most complex piece: deal text customization wired to Shopify's cart.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Design System** - Establish brand tokens, typography, and navigation shell that everything else builds on
- [ ] **Phase 2: Homepage** - Deliver the brand narrative hero and mission storytelling that validates the design system in context
- [ ] **Phase 3: Brand Content Pages** - Build the About, How It Works, and Contact pages that complete the site's content skeleton
- [ ] **Phase 4: Product Customization** - Wire deal text customization fields to Shopify cart so buyers can personalize their order

## Phase Details

### Phase 1: Design System
**Goal**: The brand identity is applied globally — every page renders in Baskerville with brand colors, a complete header/footer navigation, mobile-responsive layout, and polished micro-interactions
**Depends on**: Nothing (first phase)
**Requirements**: BRAND-01, BRAND-02, BRAND-03, BRAND-04, BRAND-05, BRAND-06
**Success Criteria** (what must be TRUE):
  1. Every page uses Baskerville as the primary typeface with no visible flash of unstyled text on load
  2. Brand colors (Victory Gold, Heritage Navy, Slate, Ivy Green) render as utility classes across all pages via Tailwind theme tokens
  3. The header links to all site pages with branded styling; the footer shows company info and navigation links
  4. The site is fully usable on a 375px mobile viewport with touch-friendly tap targets
  5. Interactive elements (buttons, links, cards) have visible hover states and smooth transitions
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — Font conversion, Tailwind v4 theme tokens, and BaseLayout preloading
- [ ] 01-02-PLAN.md — Branded Header with full navigation and branded Footer
- [ ] 01-03-PLAN.md — Micro-interaction button styles and visual verification checkpoint

### Phase 2: Homepage
**Goal**: A visitor landing on the homepage immediately understands what ABC Deal Toys sells, why it's premium, and where to go next
**Depends on**: Phase 1
**Requirements**: HOME-01, HOME-02
**Success Criteria** (what must be TRUE):
  1. The hero section presents "Celebrate the closers" brand narrative with brand imagery and a clear call-to-action
  2. The mission statement is woven into the homepage copy in a way that reinforces brand credibility
  3. Scroll-triggered animations load content progressively without layout shift
**Plans**: 1 plan

Plans:
- [ ] 02-01-PLAN.md — Hero section, mission statement storytelling, scroll animations, and visual verification

### Phase 3: Brand Content Pages
**Goal**: The About, How It Works, and Contact pages are live and fully navigable, filling out the site's content structure and enabling inbound inquiries
**Depends on**: Phase 2
**Requirements**: PAGE-01, PAGE-02, PAGE-03
**Success Criteria** (what must be TRUE):
  1. A visitor can read the About / Our Story page and understand the company's mission and credibility
  2. A visitor can read How It Works and understand the 3-step process (browse -> customize -> order) with realistic timeline expectations
  3. A visitor can submit the Contact / Get a Quote form and the inquiry is delivered to the business via email
**Plans**: 2 plans

Plans:
- [ ] 03-01-PLAN.md — About / Our Story page and How It Works process page
- [ ] 03-02-PLAN.md — Contact / Get a Quote page with Astro Action and Resend email delivery

### Phase 4: Product Customization
**Goal**: A buyer can enter their deal details on a product page and check out knowing their customization is captured in the Shopify order
**Depends on**: Phase 3
**Requirements**: PROD-01, PROD-02, PROD-03
**Success Criteria** (what must be TRUE):
  1. The product detail page shows branded deal text input fields (deal name, parties, deal type, amount, close date) and the Add to Cart button is disabled until required fields are filled
  2. After checkout, the Shopify admin order view shows all customization fields associated with the correct line item
  3. The product grid and detail pages match the brand identity established in Phase 1
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Design System | 1/3 | In Progress|  |
| 2. Homepage | 0/1 | Planning complete | - |
| 3. Brand Content Pages | 0/2 | Planning complete | - |
| 4. Product Customization | 0/TBD | Not started | - |
