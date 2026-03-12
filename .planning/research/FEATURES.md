# Feature Research

**Domain:** Deal toy / financial tombstone premium e-commerce store
**Researched:** 2026-03-12
**Confidence:** HIGH (multiple competitor sites verified, Shopify patterns confirmed in docs)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete. Target audience is investment bankers and executive assistants — they are time-poor, high-standard, and intolerant of amateur experiences.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Product grid with imagery | Every e-commerce store has this; already exists in codebase | LOW | Needs visual redesign to match brand; grid layout exists |
| Product detail page with variants | Users must understand what they're ordering before customizing | LOW | Exists; needs rebrand and customization fields added |
| Add to cart + cart management | Non-negotiable for purchase flow | LOW | Exists via nanostores; needs styled cart drawer |
| Shopify checkout handoff | Trust signal; users expect Shopify-powered checkout | LOW | Already configured |
| Mobile-responsive layout | More than 50% of browsing is mobile, including executive assistants on phones | MEDIUM | Tailwind CSS 4 makes this achievable; must be validated |
| Contact / Get a Quote form | ALL competitor sites have this; deal toy buyers often have questions before committing | LOW | Needs to capture: deal type, quantity, deadline, logo, message |
| Portfolio / Gallery page | Every competitor (Altrum, Bennett, GoLucites, Corporate Presence) has an extensive gallery | MEDIUM | Must categorize past work; images available in assets/ |
| How It Works page | Competitor sites universally explain the inquiry-design-delivery flow; reduces buyer anxiety | LOW | Step-by-step (inquiry → design → delivery) with timelines |
| Navigation linking all pages | Users cannot find pages they don't know exist | LOW | Needs header nav + footer links |
| Footer with brand info | Trust signal; brand legitimacy for high-value purchases | LOW | Company info, navigation, contact |
| Brand typography and colors | Premium audience immediately recognizes cut-rate templates vs. professional identity | MEDIUM | Baskerville + Victory Gold/Heritage Navy/Slate/Ivy Green palette |
| Product customization: deal text fields | Deal toys require custom deal text (deal name, parties, amount, date); THIS IS THE CORE PRODUCT | MEDIUM | Shopify line item properties; fields: deal name, parties, deal type, amount, close date |
| Product customization: logo upload | Customers supply firm logos; ALL competitors support this | MEDIUM | Shopify file upload via line item properties or Shopify Files API |
| Clear pricing on product pages | Premium buyers need price transparency before investing time in customization | LOW | Shopify variant pricing already works; just needs to display clearly |

### Differentiators (Competitive Advantage)

Features that create the "Stripe-level" premium feeling described in PROJECT.md. Most competitor sites look dated; the opportunity is a dramatically more polished experience.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Homepage hero with brand storytelling | "Celebrate the closers" brand narrative at first impression; competitors have generic or cluttered homepages | MEDIUM | Use brand images from assets/images/; mission statement integration; confident, slightly irreverent copy tone |
| About / Our Story page | Builds trust with high-value buyers who are researching vendors; competitors either skip or make this generic | LOW | Brand narrative, craft/quality emphasis, team credibility |
| Premium micro-interactions | Hover states, subtle transitions, scroll reveals; competitors have zero animation — static pages throughout | HIGH | Svelte transitions + CSS animations; must feel controlled not flashy |
| Gallery with industry/deal-type organization | GoLucites organizes by industry; Corporate Presence has a "mix and match" search system; most organized gallery wins | MEDIUM | Categories: M&A, IPO, Debt Capital Markets, Real Estate, Fund Close, etc. |
| Social proof / client logos section | Altrum displays Goldman, JP Morgan, Barclays prominently; 80% of top investment banks claim | LOW | If ABC has client relationships, list them; even listing deal types closed adds credibility |
| Testimonials | Every top competitor (Altrum, Eclipse Awards) uses testimonials; validates quality for first-time buyers | LOW | Need actual quotes; placeholder is insufficient |
| Rush order / timeline clarity | Eclipse Awards calls out "20-day delivery" and rush availability prominently; deal toy buyers often have deadlines | LOW | Make lead times and rush options explicit on product pages and How It Works |
| "Glengarry" brand voice in copy | No competitor has a distinctive, confident, "Coffee's for closers" voice — most are corporate-generic | LOW | Copywriting; low dev cost but high brand differentiation |
| Contextual deal text preview | Show users a mock preview of their customized text on the product image as they type | HIGH | Complex: requires canvas or SVG overlay; deferred to v2 unless pre-built solution found |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem like good ideas but create disproportionate cost or complexity for v1.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time product configurator / 3D preview | Looks impressive; some competitors hint at "see your design" | Requires 3D assets per product, complex WebGL/Canvas code, backend rendering; 6-12 week build; overkill for template products | Static product photography + deal text preview in the order confirmation flow; use a simple text-on-image overlay if needed |
| User accounts / order history | Repeat buyers want to see past orders | Shopify handles post-purchase emails and order lookup natively; custom accounts add auth complexity for no clear benefit in v1 | Direct buyers to Shopify order confirmation and tracking emails |
| Live chat support | Perceived as high-service signal | Requires staffing or bot; contact form + phone number achieves same result for this buyer segment without operational burden | Contact form with explicit response time promise (e.g., "We respond within 2 hours") |
| Blog / content marketing | "Content is king" advice | Not core to the purchase flow; investment bankers don't read deal toy blogs before buying | About page + How It Works page covers the educational content need |
| Bespoke custom design flow | Some buyers will want truly one-of-a-kind designs beyond templates | Requires design team involvement, file exchange, multi-round approval workflow — months of custom build | "Get a Quote" inquiry form routes bespoke requests to human; template products handle standard orders |
| Multi-currency / international | Some investment banks operate globally | Shopify handles this but requires additional configuration; deal toy market is primarily US-based at launch | USD-only at launch; Shopify Markets can be enabled later with a config change |
| Social media share / referral | "Viral" mechanics | Deal toys are internal awards; recipients don't publicly post them; sharing features add complexity with near-zero conversion impact | Instagram-ready product photography that buyers can screenshot if they want to share |
| Product comparison table | Common for commodity products | Deal toys are not compared on a spec sheet; buyers choose by aesthetics and materials | Gallery with clear category browsing serves this need without a comparison table |

## Feature Dependencies

```
[Product customization: deal text fields]
    └──requires──> [Product detail page]
                       └──requires──> [Shopify Storefront API product data]

[Product customization: logo upload]
    └──requires──> [Product detail page]
    └──requires──> [Shopify line item properties or file upload mechanism]

[Portfolio / Gallery page]
    └──requires──> [Brand photography / past work assets]
    └──enhances──> [Contact / Get a Quote form]
                       (gallery inspires inquiries for custom work)

[Homepage hero]
    └──requires──> [Brand imagery from assets/images/]
    └──enhances──> [Brand storytelling (About page)]

[Social proof / client logos]
    └──enhances──> [Contact / Get a Quote form]
    └──enhances──> [Product detail page] (trust at point of purchase)

[Micro-interactions]
    └──enhances──> [All page types]
    └──conflicts──> [Performance] (must be kept lightweight; use Svelte transitions not heavy libraries)

[Cart management]
    └──requires──> [Product customization fields]
    (custom fields must be attached as line item properties so they pass through to Shopify checkout)
```

### Dependency Notes

- **Product customization requires line item properties:** Custom text and logo must be attached to cart line items using Shopify's `properties` mechanism so they appear in the Shopify admin order and pass through to whoever fulfills the order. This is a critical implementation detail — if done wrong, order details are lost at checkout.
- **Gallery enhances quote form:** Buyers who browse the portfolio convert better on the inquiry form. The gallery page should have a CTA linking to the quote form.
- **Micro-interactions conflict with performance:** Svelte's built-in transition system (`transition:fade`, `transition:slide`) is the right tool here — no heavy animation libraries. Keep animations under 300ms.
- **Logo upload requires validation:** Logo files (EPS, AI, PNG, SVG) must be high-resolution for production. The upload UX should communicate acceptable formats and size limits.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed for the site to represent the brand credibly and drive purchases.

- [ ] Complete visual rebrand (Baskerville, Victory Gold/Heritage Navy/Slate/Ivy Green) applied site-wide
- [ ] Homepage with hero, brand statement ("Celebrate the closers"), product preview, and CTAs
- [ ] Product grid page with redesigned cards
- [ ] Product detail page with deal text customization fields (deal name, parties, type, amount, date)
- [ ] Logo upload on product detail page
- [ ] Cart drawer styled to brand
- [ ] How It Works page (3-step: browse → customize → checkout, plus timeline expectations)
- [ ] Portfolio / Gallery page with past work organized by deal type
- [ ] Contact / Get a Quote form (for bespoke requests and questions)
- [ ] About / Our Story page
- [ ] Navigation (header + footer) linking all pages
- [ ] Mobile-responsive across all pages

### Add After Validation (v1.x)

Features to add once the core store is live and converting.

- [ ] Testimonials section — add when real customer quotes are collected
- [ ] Client logo / social proof section — add when client relationships are confirmed for display
- [ ] Rush order prominence — add explicit lead time and rush callouts when process details are confirmed
- [ ] Micro-interactions refinement — enhance hover states and scroll reveals after base experience is solid

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Deal text preview overlay — complex; only worth building once volume justifies the engineering cost
- [ ] Gallery with search/filter by industry — useful at 100+ portfolio items; start with curated static gallery
- [ ] Multi-currency support — when international buyers appear in data
- [ ] User accounts — only if repeat buyer patterns emerge and order history is a common support request

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Visual rebrand (typography, colors) | HIGH | MEDIUM | P1 |
| Homepage hero + brand storytelling | HIGH | MEDIUM | P1 |
| Product customization: deal text fields | HIGH | MEDIUM | P1 |
| Product customization: logo upload | HIGH | MEDIUM | P1 |
| How It Works page | HIGH | LOW | P1 |
| Portfolio / Gallery page | HIGH | MEDIUM | P1 |
| Contact / Get a Quote form | HIGH | LOW | P1 |
| About / Our Story page | MEDIUM | LOW | P1 |
| Navigation (header + footer) | HIGH | LOW | P1 |
| Mobile-responsive layout | HIGH | MEDIUM | P1 |
| Social proof / testimonials | HIGH | LOW | P2 |
| Client logo display | MEDIUM | LOW | P2 |
| Micro-interactions | MEDIUM | MEDIUM | P2 |
| Rush order / timeline callouts | MEDIUM | LOW | P2 |
| Gallery filtering by industry | LOW | MEDIUM | P3 |
| Deal text preview overlay | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | GoLucites | Altrum | Corporate Presence | Eclipse Awards | Our Approach |
|---------|-----------|--------|-------------------|----------------|--------------|
| Gallery / portfolio | By industry category | By material + industry, 3000+ examples | Mix & match search, 6 global offices | 27 products, filter/sort | Curated gallery by deal type; quality over quantity |
| Quote / inquiry form | Contact form | "Get free design" — 48hr response | "Request a Quote" throughout | Phone + email | Contact form with deal details + logo upload; explicit response time |
| How It Works | 4-step process page | Dedicated resources section | 3-step inquiry process | "How to Order" page | 3-step visual process page; emphasize template = fast |
| Brand storytelling | Minimal | "Original inventor of deal toys" heritage | 60-year history narrative | 25 years experience | "Celebrate the closers" — Glengarry Glen Ross brand voice, distinctive |
| Pricing transparency | $65-$300+ range shown | No pricing; quote-based | FAQ reference only | $75-$250 range shown | Show variant pricing clearly; template products enable upfront pricing |
| Product customization | Custom design inquiry only | Custom design via consultation | Custom via inquiry | File upload + digital proof | Self-serve text fields + logo upload on product page; unique in the space |
| Social proof | None visible | Goldman, JP Morgan logos; 10K transactions | Portfolio as proof | Microsoft, Amazon, Toyota logos | Client logos + testimonials when available |
| E-commerce (buy now) | No | No | No | Shopify-based | Yes — this IS the differentiator; template products enable direct purchase |
| Premium UI | Dated | Moderate | Dated | Clean/functional | Stripe-level polish; distinguishes us from all competitors |

**Critical insight:** The ABC Deal Toys template-product + direct-purchase model is genuinely rare in this space. Every major competitor uses a consultation/quote flow. The self-serve e-commerce model with upfront customization fields is a meaningful differentiator — but it only works if the product page UX for customization is excellent. This is the highest-leverage feature to get right.

## Sources

- [GoLucites — Financial Tombstones](https://www.golucites.com/deal-toys/financial-tombstones/)
- [GoLucites — 4-Step Ordering Process](https://www.golucites.com/process-to-order/)
- [Eclipse Awards — Deal Toys Collection](https://www.eclipseawards.com/collections/deal-toys-financial-tombstones)
- [Altrum — Deal Toys](https://www.altrum.com/dealtoys/)
- [Altrum — Deal Toy Order Guide](https://www.altrum.com/resources/dealtoys/deal-toy-order-guide/)
- [The Corporate Presence — Deal Toys](https://cpresence.com/deal-toys/)
- [deal-toys.com](https://deal-toys.com/)
- [lucitetombstones.com](https://lucitetombstones.com/)
- [Vervaunt — Luxury Brand-Led eCommerce](https://vervaunt.com/examples-of-luxury-brand-led-ecommerce-websites-premium-ecommerce-ux-technology)
- [Baymard — Luxury Goods UX Research](https://baymard.com/research/luxury-goods)
- [Shopify — Metafields Guide](https://help.shopify.com/en/manual/custom-data/metafields)
- [Shopify — Custom Text Field on Product Pages (2026)](https://litextension.com/blog/how-to-add-custom-text-field-on-shopify-product-page/)

---
*Feature research for: deal toy / financial tombstone premium e-commerce store*
*Researched: 2026-03-12*
