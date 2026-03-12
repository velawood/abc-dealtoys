# Stack Research

**Domain:** Premium headless e-commerce — branding, customization, and content pages
**Researched:** 2026-03-12
**Confidence:** HIGH (core decisions), MEDIUM (image upload approach)

## Context

This is an additive milestone on an existing Astro 5.18 + Svelte 5 + Tailwind CSS 4 + Shopify Storefront API store deployed on Vercel. The existing stack is locked. This research covers only what needs to be added: custom font loading, image upload handling, form submissions (email), and premium UI polish.

---

## Recommended Stack

### Core Technologies (Existing — Do Not Change)

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| Astro | 5.18.x | SSR framework, routing, server actions | Locked |
| Svelte | 5.x | Interactive UI components | Locked |
| Tailwind CSS | 4.x | Utility-first styling | Locked |
| @astrojs/vercel | 9.x | Vercel SSR adapter | Locked |
| Shopify Storefront API | 2023-01 | Product/cart data | Locked |

### New Libraries to Add

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| `resend` | ^6.9.3 | Transactional email for contact/quote forms | Developer-first API, native Astro Actions support, generous free tier (3,000 emails/month), official Astro docs example uses Resend |
| `@vercel/blob` | ^2.3.1 | Logo file upload storage | Already on Vercel infra, zero config with Vercel project, client-upload path bypasses the 4.5MB serverless body limit for files up to 5TB |
| `svelte-inview` | ^4.0.4 | Intersection Observer scroll animations | Maintained Svelte 5 compatible fork (`svelte-5-inview`), zero-dep, wraps IntersectionObserver cleanly as a Svelte action |

---

## Detailed Decisions

### 1. Font Loading: Self-Hosted Variable TTF → CSS @font-face

**Decision:** Use manual `@font-face` declarations in `global.css`. Do NOT use the Astro experimental fonts API.

**Rationale:**
- Astro 5.7+ introduced an experimental fonts API, but "experimental" flags carry breakage risk and the feature has open issues (GitHub #15515 as of late 2025). The manual approach is stable and already works in this project's CSS architecture.
- Baskervville is a variable font (two files: regular + italic variable fonts). The manual `@font-face` approach handles variable fonts perfectly with `font-weight: 100 900`.
- The TTF files are already in `assets/fonts/`. For best performance, convert to WOFF2 before deploying — WOFF2 is 60–70% smaller than TTF with identical quality. Use `npx fontsource-convert` or the Fontsource online converter.
- Place converted WOFF2 files in `public/fonts/` so Astro serves them as static assets.

**CSS pattern (in `global.css` @layer base or directly in @theme):**
```css
@font-face {
  font-family: 'Baskervville';
  src: url('/fonts/Baskervville-VariableFont_wght.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Baskervville';
  src: url('/fonts/Baskervville-Italic-VariableFont_wght.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-style: italic;
  font-display: swap;
}
```

**Tailwind 4 theme integration:**
```css
@theme {
  --font-serif: 'Baskervville', Georgia, 'Times New Roman', serif;
  --color-victory-gold: #ebbc28;
  --color-heritage-navy: #052a38;
  --color-slate: #1a1b1b;
  --color-ivy-green: #00442e;
}
```

This makes `font-serif`, `text-victory-gold`, `bg-heritage-navy`, etc. available as Tailwind utilities throughout the project.

**Confidence: HIGH** — Standard CSS specification, fully supported in all modern browsers, no dependency risk.

---

### 2. Image Upload: Vercel Blob (Client Upload)

**Decision:** Use `@vercel/blob` with the **client upload** pattern, not server upload.

**Rationale:**
- Vercel serverless functions have a hard 4.5MB request body limit. Logo files from design agencies commonly exceed this.
- Client upload with `@vercel/blob` generates a presigned token on the server, then the browser uploads directly to Vercel's CDN — bypassing the function size limit entirely. Files up to 5TB are supported.
- Already on Vercel infrastructure — no separate storage service to provision, no additional vendor.
- The Blob SDK is minimal (`@vercel/blob` is ~10KB), type-safe, and returns permanent public URLs immediately after upload.

**Upload pattern:**
1. Svelte component renders `<input type="file">` (accepts image/*)
2. On file select, call an Astro server endpoint (`POST /api/upload-token`) to get a client upload token
3. Use `upload()` from `@vercel/blob` in the browser to push directly to Blob storage
4. Store the returned URL in component state, include it with the order form submission

**Confidence: MEDIUM** — Client upload pattern is documented and stable, but requires provisioning a Blob store in Vercel dashboard and setting `BLOB_READ_WRITE_TOKEN`. The 4.5MB body limit is confirmed in Vercel docs.

---

### 3. Form Submissions: Astro Actions + Resend

**Decision:** Use Astro Actions (stable in Astro 5) for all form handling. Use Resend for email delivery.

**Rationale:**
- Astro Actions provide type-safe, Zod-validated form handling built into the framework — no external form library needed. They work directly from Svelte components via `import { actions } from 'astro:actions'`.
- Actions handle multipart form data natively, including `z.instanceof(File)` validation for file inputs. Astro 5.18 specifically added configurable `actionBodySizeLimit`.
- Resend is the standard choice for developer-friendly transactional email in 2025 (official Astro docs point to Resend). Free tier covers 3,000 emails/month which is ample for a quote/contact form.
- The contact/quote form needs: customer name, email, company, deal details, logo upload URL, inquiry type. All are straightforward Zod types.

**Action pattern:**
```typescript
// src/actions/index.ts
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema'; // Astro re-exports Zod
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const server = {
  submitQuote: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      company: z.string().optional(),
      dealDetails: z.string().min(10),
      logoUrl: z.string().url().optional(),
    }),
    handler: async (input) => {
      await resend.emails.send({
        from: 'quotes@abcdealtoys.com',
        to: 'team@abcdealtoys.com',
        subject: `New Quote Request from ${input.name}`,
        html: `...`,
      });
      return { success: true };
    },
  }),
};
```

**Confidence: HIGH** — Astro Actions are stable (not experimental) in Astro 5.x. Resend is well-documented with an official Astro integration guide.

---

### 4. Micro-Animations and UI Polish

**Decision:** Use Svelte's built-in `svelte/transition` and `svelte/motion` plus `svelte-inview` for scroll-triggered animations. No external animation library.

**Rationale:**
- Stripe-level polish comes from *timing and easing*, not from complex animation libraries. Svelte's built-in `fade`, `fly`, `scale` transitions plus `spring` and `tweened` motion stores cover everything needed.
- `svelte-inview` (Svelte 5 compatible) provides IntersectionObserver as a Svelte action — needed for the scroll-triggered reveal animations that make content pages feel premium.
- Tailwind 4's `@theme` block supports `--animate-*` custom keyframes (already used in the existing `global.css` for the shake animation). Custom enter animations for hero text, staggered product cards, and section reveals follow this same pattern.
- The `motion-safe:` and `motion-reduce:` Tailwind variants should wrap all decorative animations for accessibility compliance.
- Do NOT add Motion (Framer Motion for Svelte) — it's 40KB of unnecessary complexity when Svelte's built-ins handle the same effects.

**Key animation patterns for premium feel:**
- Hero text: `fly` transition with `y: 20, duration: 600, easing: cubicOut`
- Section reveals: `svelte-inview` triggering `fade` + `fly` on scroll
- Button hover: CSS `transition-all duration-150` with `scale-[1.02]` transform
- Card hover: CSS `shadow-lg` → `shadow-xl` + `translate-y-[-2px]` on hover
- Loading states: Tailwind `animate-pulse` on skeleton loaders

**Confidence: HIGH** — Built-in Svelte APIs, no external dependency risk.

---

## Installation

```bash
# New dependencies
pnpm add resend @vercel/blob svelte-inview

# No new dev dependencies required
```

**Environment variables to add:**
```bash
RESEND_API_KEY=re_...         # From resend.com dashboard
BLOB_READ_WRITE_TOKEN=...     # From Vercel project > Storage > Blob
```

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| Manual `@font-face` CSS | Astro experimental fonts API | Experimental flag = breakage risk; API still evolving (issues open as of late 2025); no benefit over CSS for self-hosted fonts |
| `@vercel/blob` client upload | Cloudinary | Cloudinary adds a new vendor, monthly cost, and SDK complexity; Vercel Blob is already in the infrastructure |
| `@vercel/blob` client upload | Astro Action server upload | 4.5MB Vercel body limit would reject any logo file from a design agency or high-res scan |
| Resend | SendGrid / Mailgun | SendGrid/Mailgun have heavyweight SDKs and complex setup; Resend is purpose-built for developers, 5-minute setup |
| Resend | Nodemailer + SMTP | SMTP credentials in env vars, deliverability issues, no tracking; Resend handles all this |
| Svelte built-in transitions | Motion (Framer Motion for Svelte) | 40KB bundle addition for capabilities Svelte provides natively; overhead not justified |
| svelte-inview | Custom IntersectionObserver | svelte-inview is the community standard and saves ~30 lines of boilerplate per component |
| WOFF2 format | Keep TTF files | WOFF2 is 60-70% smaller, directly impacts Largest Contentful Paint (LCP) which affects Core Web Vitals |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `astro:experimental.fonts` | Still experimental as of 5.18, active open issues, no benefit over manual CSS for self-hosted fonts | Manual `@font-face` in `global.css` |
| Server-side file uploads (via Astro Action) for logos | Vercel's 4.5MB serverless body limit will reject files from professional logo exports | `@vercel/blob` client upload with presigned token |
| Motion / svelte-animations package | Adds 40KB+ bundle weight for effects Svelte provides natively | `svelte/transition`, `svelte/motion`, `svelte-inview` |
| Google Fonts API | Baskervville must be self-hosted per brand requirements; Google Fonts adds DNS lookup latency | Self-hosted WOFF2 in `public/fonts/` |
| Formik / React Hook Form | React-oriented libraries with no Svelte bindings | Astro Actions with native Zod validation |
| `tailwind.config.js` | Tailwind 4 dropped the JS config file; it's a CSS-first system now | `@theme {}` block in `global.css` |

---

## Stack Patterns by Variant

**For the contact/quote form (no file upload):**
- Use Astro Action with `accept: 'form'` directly
- Progressive enhancement: form works without JS, enhanced with Svelte for instant validation feedback

**For the product customization form (text input + logo upload):**
- Text fields: Astro Action handles them
- Logo file: `@vercel/blob` client upload first, store URL in hidden input, then submit form
- Split into two steps if UX requires: upload logo → get URL → include URL in order notes (Shopify line item property)

**For content-only pages (About, Portfolio, How It Works):**
- Pure Astro components — no Svelte needed, no interactivity required
- Static generation via `export const prerender = true` on each page

**For scroll animations on content pages:**
- Use `svelte-inview` action on Svelte island components wrapping each section
- Keep animation logic in Svelte, static HTML structure in Astro

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|----------------|-------|
| `resend@^6.9.3` | Node ≥18, Astro 5.x | Uses native fetch, no polyfill needed |
| `@vercel/blob@^2.3.1` | Vercel platform only | Requires `BLOB_READ_WRITE_TOKEN` env var; does not work on non-Vercel hosts |
| `svelte-inview@^4.0.4` | Svelte 5 | v4.x added Svelte 5 runes support; v3.x was Svelte 4 only |
| Tailwind `@theme` colors | Tailwind CSS 4.x | `@theme` block replaces `tailwind.config.js`; do not mix with v3 config file |
| Astro Actions | Astro 5.x | Stable (not experimental) since Astro 5.0; `actionBodySizeLimit` configurable since 5.18 |

---

## Font Conversion Step

The fonts in `assets/fonts/` are TTF. Before serving them on the web, convert to WOFF2:

```bash
# Using fontsource CLI (install once)
npx @fontsource-variable/baskervville  # OR convert manually:

# Using Python fonttools (if available)
pip install fonttools brotli
python -m fonttools ttLib -o public/fonts/Baskervville-Variable.woff2 \
  "assets/fonts/Baskervville.zip (Unzipped Files)/Baskervville-VariableFont_wght.ttf"
```

Alternatively, use the [Fontsource online converter](https://fontsource.org/tools/converter) — it correctly handles variable font metadata unlike generic converters.

Use only the two variable font files (regular + italic) — skip the static weight files (Regular, Bold, SemiBold, etc.) since the variable font covers all weights.

---

## Sources

- [Astro Experimental Fonts API Docs](https://docs.astro.build/en/reference/experimental-flags/fonts/) — confirmed local font support, identified experimental risk
- [Astro Actions Guide](https://docs.astro.build/en/guides/actions/) — verified file upload with `z.instanceof(File)`, Svelte component usage
- [Vercel Blob Server Upload Docs](https://vercel.com/docs/vercel-blob/server-upload) — confirmed 4.5MB server limit, client upload alternative
- [Resend + Astro Guide](https://resend.com/docs/send-with-astro) — verified Astro Actions integration pattern
- [Tailwind CSS 4 Theme Variables](https://tailwindcss.com/docs/theme) — confirmed `@theme` block replaces JS config for colors and fonts
- [svelte/motion Docs](https://svelte.dev/docs/svelte/svelte-motion) — confirmed built-in spring/tweened for Svelte 5
- [Astro 5.7 Blog Post](https://astro.build/blog/astro-570/) — confirmed experimental fonts API release date and scope
- npm registry — `@vercel/blob@2.3.1`, `resend@6.9.3`, `svelte-inview@4.0.4` (verified current versions)

---

*Stack research for: ABC Deal Toys — Branding + Customization milestone*
*Researched: 2026-03-12*
