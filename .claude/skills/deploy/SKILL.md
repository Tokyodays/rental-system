---
description: Deploy the rental-system application to production or preview. Use for "デプロイして", "本番に出して", "preview deployment". Frontend is Vercel (project already linked), backend is Supabase. For DB schema changes use the db-migrate skill; for advanced Vercel CLI operations see the vercel-cli skill.
---

# deploy skill — rental-system

## Deployment setup (fixed, do not re-discover)

- **Frontend**: Vercel — already linked (`.vercel/project.json`, project `rental-system`). Git pushes trigger deployments automatically.
- **Backend**: Supabase (DB + auth). Schema changes are NOT deployed by Vercel — apply migrations separately via the **db-migrate** skill.
- **Branch policy**: `main` → production. All other branches (issue branches named `NN-<title>`) get preview deployments. PRs are required for all changes to `main`.

## Pre-deploy checklist

```bash
# 1. All tests pass (requires dev server, see run skill)
npx playwright test --reporter=line

# 2. TypeScript errors
npx nuxt typecheck 2>&1 | grep -E "error|Error" | head -20

# 3. Build succeeds
npm run build
```

## Deploy

**Preview** (default): push the current issue branch and open/update a PR. Vercel builds it automatically. Get the preview URL from the PR's commit status checks, or:

```bash
vercel ls --format json   # latest entry's url = preview URL
```

**Production**: merge the PR into `main`. Never deploy to production with `vercel --prod` directly — production goes through `main` only.

## DB migrations

If the change includes anything under `supabase/migrations/`, apply migrations **before** merging to `main` — use the **db-migrate** skill.

## Environment variables required in production (Vercel dashboard)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only) |
