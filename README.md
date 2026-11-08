# Emteyt: Mauritanian women's fashion store

Next.js 15 (App Router) · Tailwind · Supabase (Postgres, Auth, Storage) · Arabic RTL.

## Setup (all steps)

1. **Supabase project**: create one at supabase.com.
2. **Database**: SQL Editor, paste and run `supabase/migrations/001_schema.sql` (tables, RLS, order functions, storage bucket, profile trigger).
3. **Owner account**: Authentication, Users, "Add user" (email and password, tick auto-confirm). Then run:
   `update profiles set role = 'admin' where id = '<that user id>';`
4. **Env**: `cp .env.example .env.local` and fill the URL and anon key (Project Settings, API). Set `NEXT_PUBLIC_SITE_URL` to your domain in production.
5. **Run**: `npm install` then `npm run dev`.
6. **First use**: open `/admin/login`.
   1. Settings: store name, logo, WhatsApp (international format without `+`, e.g. `22212345678`), phone, social links, delivery info.
   2. Categories: e.g. الملاحف, الأزياء, الإكسسوارات.
   3. Products: add with images, price, stock. They appear on the site immediately, with no code changes.
7. **Deploy**: push to GitHub, import in Vercel, add the three env vars, deploy.

## How it works

- Public pages read through a cookie-less anon client and are cached (ISR). Every admin write calls `revalidatePath("/", "layout")`, so changes show at once.
- Orders go through the `create_order()` SQL function: prices come from the database, stock is checked and decremented in one transaction, and customers have no direct write access to `orders`.
- Cancelling an order (`admin_set_order_status`) returns stock automatically. A cancelled order cannot be reopened.
- "Best sellers" are computed from real order quantities (cancelled orders excluded).
- Admin is protected twice: middleware and `requireAdmin()` inside every page and action. Admin rows are protected by RLS (`is_admin()`).
- Photos (products and logo) never pass through the server: the browser shrinks each one (max 1600 px, about 300 KB) and uploads it straight to Supabase Storage, then sends only the link. This avoids Vercel's 4.5 MB request limit, so phone photos work. The server accepts only links that point into your own bucket.
- WhatsApp: the order confirmation opens a prefilled message to the store number (click-to-send). Fully automatic WhatsApp notifications need the paid WhatsApp Business API, which is not included.

## Before launch (recommended)

- Add rate limiting or a captcha on checkout (e.g. Vercel Firewall or Cloudflare Turnstile) to block spam orders.
- Add a custom domain and set `NEXT_PUBLIC_SITE_URL`.
- Review the Supabase Auth settings: disable public sign-ups so only you can create accounts.
