# Landing Page

Plain HTML/CSS/JS landing page (no build step) with a lead-capture form
that inserts directly into Supabase from the browser, deployed on
Cloudflare Pages via GitHub integration. RTL (Hebrew) layout.

## Structure

- `index.html` — the page (3 sections: hook, video portfolio, CTA/form)
- `css/styles.css` — mobile-first styles, CSS custom properties for the
  color palette, logical properties throughout for RTL
- `js/config.js` — Supabase URL/anon key (placeholders — see below)
- `js/form.js` — form validation, honeypot, Supabase insert
- `js/portfolio.js` — portfolio video lightbox (click-to-play, lazy)
- `js/decor.js` — decorative background parallax (respects
  `prefers-reduced-motion`)
- `supabase/schema.sql` — table + Row Level Security policy

## Before this goes live, fill in

1. **Copy** — every `TODO:` in `index.html` (headline, portfolio section,
   CTA, social-proof line, `<title>`/meta description).
2. **Portfolio videos (Cloudflare R2)**:
   - Create an R2 bucket and either use its public bucket URL or attach a
     custom subdomain (e.g. `media.yourdomain.com`) via a Cloudflare
     Worker/Custom Domain route.
   - Upload the real portfolio videos (from `reference/portfolio-videos/`
     locally — that folder is gitignored and never committed) plus poster
     images to `assets/images/portfolio/`.
   - Replace each `data-video-src`/`data-video-poster` `TODO:` placeholder
     in `index.html` with the real R2 URL/object key and poster path.
   - Native `<video>` playback doesn't require CORS on the bucket, but
     enabling it anyway is a cheap, forward-compatible step.
3. **Supabase**:
   - Create a Supabase project.
   - Run `supabase/schema.sql` in the Supabase SQL editor.
   - Copy the Project URL and `anon` public key (Project Settings → API)
     into `js/config.js`, replacing the `TODO_...` placeholders.
   - Never put the `service_role` key anywhere in this repo — only `anon`.
4. **GitHub + Cloudflare Pages**:
   - Push this repo to GitHub.
   - In the Cloudflare dashboard: Workers & Pages → Create → Pages →
     Connect to Git → select this repo.
   - Build settings: Framework preset **None**, build command **empty**,
     output directory **`/`**.
   - No environment variables are needed for the build — the anon key is
     meant to be public and lives in the committed `js/config.js`.
5. **Custom domain** — once you have one, add it under the Pages project's
   Custom Domains tab.

## Local preview

```
python3 -m http.server 8000
```
Then open http://localhost:8000. Note the form won't actually submit
until `js/config.js` has real Supabase values.

## Verifying RLS is locked down

New tables on Supabase need two things before the anon key can use them:
a table-level `GRANT` (see the bottom of `schema.sql`) and the RLS
policy. Without the `GRANT`, PostgREST returns `401 permission denied
for table` for every operation, including legitimate inserts — that's
not RLS, that's a missing grant, so don't mistake one for the other.

With your real project URL/anon key, confirm inserts work and
reads/deletes are blocked:

```bash
# INSERT should succeed (201) — use return=minimal, matching what
# supabase-js's insert() sends by default. return=representation would
# also require SELECT privilege (to read the row back), which we
# deliberately don't grant, and would 401 even though the insert itself
# is fine.
curl -X POST "https://<project>.supabase.co/rest/v1/leads" \
  -H "apikey: <anon-key>" \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"name":"Test","phone":"555-0100","email":"test@example.com"}'

# SELECT and DELETE should both fail with 401 permission denied for table
curl "https://<project>.supabase.co/rest/v1/leads?select=*" \
  -H "apikey: <anon-key>" \
  -H "Authorization: Bearer <anon-key>"
```

A successful INSERT alongside blocked SELECT/DELETE confirms the anon
key and connection are fine, and it's the grants/policy — not a broken
key — restricting reads/deletes.
