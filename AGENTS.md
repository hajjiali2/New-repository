# AGENTS.md

## Cursor Cloud specific instructions

### What this is
A single Vite + React + TypeScript frontend SPA ("AI Hub Arabia", an Arabic RTL marketing site + AI tools dashboard). There is no in-repo backend: auth and the contact form use a hosted Supabase project, and the AI tools (`src/components/tools/*`) call the OpenRouter API directly from the browser. The `supabase/migrations` are for the external Supabase project, not a local DB.

### Commands (defined in `package.json`)
- Dev server: `npm run dev` (Vite, serves on `http://localhost:5173`).
- Build: `npm run build`.
- Lint: `npm run lint`. Typecheck: `npm run typecheck`.

### Required environment variables
The app reads these via `import.meta.env` (`src/lib/supabase.ts`, `src/lib/openrouter.ts`):
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — required for the app to boot. `createClient` throws at startup if `VITE_SUPABASE_URL` is missing/empty, so the page is blank without it.
- `VITE_OPENROUTER_API_KEY` — required for the AI tools (chat/writer/translator/etc.) to return real responses; without it the tools show a "missing key" message instead of failing the build.

Provide them as Cloud Agent Secrets (Vite picks up `VITE_`-prefixed shell env vars) or via a local gitignored `.env`. A placeholder `.env` with a valid-format `VITE_SUPABASE_URL` (e.g. `https://placeholder.supabase.co`) is enough to boot the landing page and exercise the UI, but real Supabase credentials are needed to log in, and reaching the AI tools dashboard requires being logged in (the tools button/dashboard only render for authenticated users).

### Gotchas
- `npm run lint` and `npm run typecheck` fail on the current `main` (unused vars, `no-explicit-any`, and missing `vite/client` types for `import.meta.env`). These are pre-existing and unrelated to environment setup — do not treat them as regressions you introduced.
- `npm run build` uses Vite (not `tsc`) and succeeds despite the typecheck errors.
