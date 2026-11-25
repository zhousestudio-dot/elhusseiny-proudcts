# Elhusseiny Products (منتجات الحسيني) — Project Notes

## Decisions Made
- **Framework:** **Astro + TypeScript + Tailwind CSS v4** (no React) for maximum mobile PageSpeed (zero JS by default).
- **Font:** Self-hosted **Cairo** via `@fontsource/cairo` (weights 400, 500, 600, 700).
- **Language & Direction:** Arabic-first with `lang="ar" dir="rtl"` in `BaseLayout.astro`.
- **Colors:** Deep Emerald (`emerald-700`) primary, Warm Amber (`amber-100` / `amber-800`) accents, white/soft-gray backgrounds, `gray-900` text.
- **Images:** Astro `<Image />` from `astro:assets` with `remotePatterns` for `**.supabase.co` and explicit `width`/`height`.
- **Cart & Pricing Security:** Small vanilla TypeScript cart in `localStorage` (`src/lib/cart.ts`) loaded only on product/cart/checkout pages. Server-side `create-checkout.ts` recalculates all prices and verifies stock directly from Supabase before calling Paymob.
- **Payments & Security:** Paymob Egypt **Intentions API v1** + **Unified Checkout** redirect. Orders are marked `paid`/`failed` **only** inside `netlify/functions/paymob-webhook.ts` after verifying Paymob's 20-field **HMAC-SHA512** signature (`timingSafeEqual`), checking paid amount, and enforcing idempotency.
- **Admin Security:** `/admin` authenticates via Supabase Auth (`signInWithPassword`) and every action goes through `netlify/functions/admin-api.ts`, which verifies the JWT and enforces `user.email === ADMIN_EMAIL` on the server.
- **Emails:** Resend HTTP API inside `paymob-webhook.ts` for customer & admin order confirmations.
- **Backend:** Standalone **Netlify Functions** in `netlify/functions/` configured via `netlify.toml`.
- **Database:** Supabase (Postgres) with strict Row Level Security (RLS), foreign-key/partial indexes, and `paymob_intention_id` tracking.

## Current Stack
- **Pages:** Astro (latest) + TypeScript
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Cart:** Vanilla TypeScript (`src/lib/cart.ts`)
- **Backend:** Netlify Functions
- **Database / Auth / Storage:** Supabase (Postgres + Auth + Storage)
- **Payments:** Paymob Intentions API + Unified Checkout + HMAC-SHA512 Webhook
- **Emails:** Resend
- **Hosting:** Netlify

## What Is Finished
- **Step 1:** Astro + TypeScript + Tailwind CSS v4 project setup (`BaseLayout.astro`, self-hosted Cairo font, `netlify.toml`, `.env.example`, `netlify/functions/health.ts`).
- **Step 2:** Supabase Postgres schema in `supabase/schema.sql` (`categories`, `products`, `orders`, `order_items`, `payments`, indexes, `updated_at` triggers, and RLS policies).
- **Step 3:** Arabic RTL Home page (`Hero.astro`, `CategoriesSection.astro`, `ProductCard.astro`, `Footer.astro` with WhatsApp link).
- **Step 4:** Supabase build-time data fetching (`src/lib/supabase.ts`, `src/lib/products.ts`), `/products` catalog with category filter + search, `/products/[slug]` pre-rendered product pages via `getStaticPaths()`, Astro `<Image />` optimization, and full SEO + Open Graph tags.
- **Step 5:** Vanilla TS shopping cart (`src/lib/cart.ts`, `CartConnector.astro`, `/cart` page, and `netlify/functions/validate-cart.ts`).
- **Step 6:** Checkout page (`src/pages/checkout.astro`), Paymob Intentions API function (`netlify/functions/create-checkout.ts`), and payment redirect landing page (`src/pages/payment/complete.astro`).
- **Step 7:** Paymob webhook (`netlify/functions/paymob-webhook.ts`) with HMAC-SHA512 verification, idempotency, stock deduction, Resend confirmation emails, and error logging.
- **Step 8:** Private admin panel (`src/pages/admin.astro` + `netlify/functions/admin-api.ts`) protected by Supabase Auth (`ADMIN_EMAIL`), with product CRUD + Supabase Storage upload, order management, and Netlify rebuild trigger.
- **Performance Audit:** Added immutable `/_astro/*` and `/images/*` caching headers in `netlify.toml`, trimmed unused Cairo `500` font weight, enforced `webp` image optimization, and added `idx_orders_created_at_desc` index.
- **Media & Branding Imported:** Copied 32 real product photos from `Elhussainy/media` into `public/images/products/`, updated `Header.astro`, `Hero.astro`, `Footer.astro` (real WhatsApp/phones: `01093452806`, `01010231211`), `src/lib/data.ts` (16 real products & offers from the official menu), and created `supabase/seed.sql`.

## What Is Next
- Import your real product photos and info from `media/` (once added to the workspace), deploy to Netlify, and run a live PageSpeed + end-to-end test.
