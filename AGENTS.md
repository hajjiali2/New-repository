# AGENTS.md

## Cursor Cloud specific instructions

### What this is
Single-product app: **AI Hub Arabia**, a client-side Vite + React + TypeScript + Tailwind SPA (Arabic, RTL). Package manager is **npm** (`package-lock.json`). There is no custom backend server in the repo — it talks to **Supabase** (auth + Postgres) and the external **OpenRouter** API (the 6 AI tools). No automated test suite exists.

### Standard commands (see `package.json` scripts)
- Dev server: `npm run dev` (Vite, http://localhost:5173)
- Build: `npm run build` · Preview built app: `npm run preview`
- Lint: `npm run lint` · Typecheck: `npm run typecheck`

### Required environment (.env — gitignored, must be recreated each VM)
The app reads `import.meta.env` at module load and calls `createClient(...)` immediately, so **the app will not render without a valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`**. Create `/workspace/.env`:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_OPENROUTER_API_KEY=...
```
- Supabase vars: either point at a hosted Supabase project (apply `supabase/migrations/*.sql`) or run a local stack (below).
- `VITE_OPENROUTER_API_KEY`: only the AI tools need it. Without it, the landing page, auth, and dashboard all work, but any AI tool throws `MISSING_KEY`. It must be a real OpenRouter key (external SaaS) to exercise the tools.

### Local Supabase (to test real auth/dashboard without a hosted project)
Requires Docker + the Supabase CLI (NOT installed by the update script — install on demand):
- Start: `supabase start` (auto-applies migrations, prints keys). Stop: `supabase stop`.
- Get keys: `supabase status -o env` → use legacy `ANON_KEY` for `VITE_SUPABASE_ANON_KEY` and `API_URL` (`http://127.0.0.1:54321`) for `VITE_SUPABASE_URL`.
- `supabase/config.toml` has `enable_confirmations = false`, so email signups auto-confirm and can log in immediately (no email step).
- On this VM, Docker needs `storage-driver: fuse-overlayfs` and iptables-legacy; if the Docker socket isn't accessible as the `ubuntu` user, `sudo chmod 666 /var/run/docker.sock`.

### Hello-world flow (core functionality)
Open auth modal → "إنشاء حساب" (sign up) → log in → navbar shows the user + "الأدوات" → dashboard shows "مرحباً، <name>" with 6 tool cards.

### Pre-existing gotcha
`npm run lint` and `npm run typecheck` currently FAIL on pre-existing issues (unused vars, `any`, and a missing `vite/client` type reference in `src/lib`). These are not environment problems — `npm run build` and `npm run dev` work fine.

### Saudi Discovery platform (current primary app)
`src/main.tsx` boots **Saudi Discovery** (`src/discovery/App.tsx`), a business discovery + advertising platform (Arabic RTL + English toggle, dark/light mode) built on react-router-dom. The earlier "AI Hub" code (`src/App.tsx`, `src/components/*`) is retained but no longer routed.
- Structure: `src/discovery/` → `api.ts` (all Supabase data access), `types.ts`, `context.tsx` (Theme/Locale/Auth providers + hooks), `i18n.ts`, `utils.ts`, `components/`, `pages/` (public) and `pages/dashboard/` (business/admin/affiliate).
- DB: migrations `2026..._discovery_schema.sql` (+ helper `owns_business()`, RLS) and `..._discovery_seed.sql` (categories, cities, plans, ad products, 12 demo businesses, reviews, offers, coupons, leads, blog, sample revenue/analytics). Same grants gotcha applies — new tables need explicit `GRANT`s (see the discovery schema migration).
- Routing: public pages are open; `/dashboard` and `/affiliate` require login; `/admin` requires `profiles.role='admin'`. Promote a user via SQL to test admin (see below). New businesses are created with `owner_id = auth.uid()` and `status='pending'` (admins activate them in the admin dashboard).
- Non-obvious: demo images use `picsum.photos` / `ui-avatars.com` (external); business creation uses native `<select>` dropdowns (fine for users, but automated/computer-use testing struggles with native selects). Stripe is modeled in the schema (invoices/subscriptions) but real charging needs `STRIPE` keys; current checkout records a paid invoice as a mock.

### MVP structure (admin + business dashboards) — legacy AI Hub
- Backend: SQL migrations under `supabase/migrations/` define `profiles.role`/`organization_id`, plus `organizations`, `organization_members`, `usage_logs`, RLS policies, helper functions (`is_admin()`, `is_org_owner()`, `can_view_usage()`), and RPCs (`create_organization`, `add_org_member`, `remove_org_member`, `admin_stats`). Client service layer is in `src/lib/api/*` with shared types in `src/lib/types.ts`.
- Frontend: `src/components/admin/AdminDashboard.tsx` (admin-only) and `src/components/business/BusinessDashboard.tsx`, routed via `view` state in `src/App.tsx` and reached from `Navbar` links ("الإدارة" shows only when `profile.role === 'admin'`; "فريقي" for any logged-in user). The 6 AI tools call `logUsage(...)` to populate `usage_logs`.
- Non-obvious gotcha: in this local stack, RLS policies are NOT sufficient on their own — table-level `GRANT`s to `anon`/`authenticated` are also required, which is why `supabase/migrations/20260617211000_mvp_grants.sql` exists. New tables need matching grants or PostgREST returns "permission denied".
- Testing admin features: new signups default to `role='user'`. To exercise the admin dashboard locally, promote a user with SQL, e.g. `docker exec -i supabase_db_<dir> psql -U postgres -d postgres -c "update public.profiles set role='admin' where email='you@example.com';"`.
