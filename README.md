# Portfolio — Visual Identity, Graphic Design & Data Analysis

Next.js 15 (App Router) · Tailwind CSS v4 · Supabase (database, auth, storage) · GSAP + Lenis · Vercel.

- Public site: `/`, `/design`, `/design/[slug]`, `/data`, `/data/[slug]`, `/about`, `/contact`
- Private dashboard: `/admin` (projects, media, messages, settings) — sign-in required
- Design spec: `../PORTFOLIO_INSTRUCTIONS.md`

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

`npm run build && npm start` runs the production build.

## Environment variables

| Name | Required | What it is |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | The `sb_publishable_…` key (safe in the browser; data is protected by row-level security) |
| `NEXT_PUBLIC_SITE_URL` | production | Your public URL, e.g. `https://yourname.com` — used for canonical links, sitemap and share images. Falls back to the Vercel production URL. |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | optional | Email notification for each contact-form message ([resend.com](https://resend.com)). Messages are always saved in the dashboard either way. |

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel: **Add New → Project**, import the repo. Framework preset **Next.js**; if the repo root is the parent folder, set **Root Directory** to `portfolio`.
3. Add the environment variables above (Production + Preview), then **Deploy**.
4. **Analytics:** in the Vercel project, open **Analytics** and **Speed Insights** and click **Enable** (the code is already installed; it only runs on Vercel and never on `/admin`).
5. **Custom domain:** Project → **Settings → Domains** → add your domain and follow the DNS instructions. Then set `NEXT_PUBLIC_SITE_URL` to it and redeploy.

### After the first deploy — Supabase auth URLs

Dashboard sign-in links must be allowed to return to the live site. In Supabase → **Authentication → URL Configuration**:

- **Site URL:** `https://your-domain`
- **Redirect URLs:** add `https://your-domain/admin/auth/callback` (and keep `http://localhost:3000/admin/auth/callback` for local work)

## Database

Migrations live in `supabase/migrations/` (already applied to the project). Admins are listed in `public.admins`; add another admin with:

```sql
insert into public.admins (user_id) values ('<auth-user-uuid>');
```

## Content notes

- Sample design projects show until you publish your first real design project; the Data section shows "Coming soon" until you publish a data project.
- Site text (name, bio, socials, ticker, portrait, CV) is edited in **/admin/settings**. Services copy lives in `lib/site.ts`.
- Fonts: BBH Bogle (headers, self-hosted from Google Fonts, OFL) and IBM Plex Mono (copy).
