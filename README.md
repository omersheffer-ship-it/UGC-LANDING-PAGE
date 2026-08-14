# Landing Page

Plain HTML/CSS/JS landing page (no build step) with a lead-capture form
that inserts directly into Supabase from the browser, deployed on
Cloudflare Pages via GitHub integration.

## Structure

- `index.html` — the page (3 sections: hook, proof, CTA/form)
- `css/styles.css` — mobile-first styles
- `js/config.js` — Supabase URL/anon key (placeholders — see below)
- `js/form.js` — form validation, honeypot, Supabase insert
- `supabase/schema.sql` — table + Row Level Security policy

## Before this goes live, fill in

1. **Copy** — every `TODO:` in `index.html` (headline, proof section, CTA,
   social-proof line, `<title>`/meta description).
2. **Supabase**:
   - Create a Supabase project.
   - Run `supabase/schema.sql` in the Supabase SQL editor.
   - Copy the Project URL and `anon` public key (Project Settings → API)
     into `js/config.js`, replacing the `TODO_...` placeholders.
   - Never put the `service_role` key anywhere in this repo — only `anon`.
3. **GitHub + Cloudflare Pages**:
   - Push this repo to GitHub.
   - In the Cloudflare dashboard: Workers & Pages → Create → Pages →
     Connect to Git → select this repo.
   - Build settings: Framework preset **None**, build command **empty**,
     output directory **`/`**.
   - No environment variables are needed for the build — the anon key is
     meant to be public and lives in the committed `js/config.js`.
4. **Custom domain** — once you have one, add it under the Pages project's
   Custom Domains tab.

## Local preview

```
python3 -m http.server 8000
```
Then open http://localhost:8000. Note the form won't actually submit
until `js/config.js` has real Supabase values.

## Verifying RLS is locked down

With your real project URL/anon key, confirm reads/deletes are blocked:

```bash
curl "https://<project>.supabase.co/rest/v1/leads?select=*" \
  -H "apikey: <anon-key>" \
  -H "Authorization: Bearer <anon-key>"
```

This should not return existing row data (Supabase/PostgREST typically
returns an empty `[]` when no SELECT policy exists, rather than a
401/403 — RLS silently filters to zero rows). A DELETE request with the
same headers should likewise have no effect. A test INSERT (e.g. via the
live form) should still succeed — confirming the anon key and connection
are fine, and it's the policy, not the key, restricting reads/deletes.
