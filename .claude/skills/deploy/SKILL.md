---
description: Deploy the rental-system application to production or preview. Use for "デプロイして", "本番に出して", "preview deployment". Frontend is Vercel (project already linked), backend is Supabase. For DB schema changes use the db-migrate skill; for advanced Vercel CLI operations see the vercel-cli skill.
---

# deploy skill — rental-system

## Deployment setup (fixed, do not re-discover)

- **Frontend**: Vercel — already linked (`.vercel/project.json`, project `rental-system`). Vercel's Git integration is **turned off** (`vercel.json` → `git.deploymentEnabled: false`); deployments run only from GitHub Actions.
- **Backend**: Supabase (DB + auth). Schema changes are NOT deployed by Vercel — apply migrations separately via the **db-migrate** skill.
- **Branch policy**:

| Branch | What happens | URL / Supabase |
|--------|--------------|----------------|
| `main` | Nothing is deployed. PRs are merged here. | — |
| `deployment/development` | `.github/workflows/deploy-development.yml` → `vercel deploy` (Preview env) + alias | https://rental-system-dev.vercel.app — dev Supabase (`cxhc…`) |
| `deployment/production` | `.github/workflows/deploy-production.yml` → `vercel deploy --prod` | https://rental-system-chi-lac.vercel.app — prod Supabase (`dyrh…`) |

  Both workflows need the GitHub secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, and can also be started by hand (`workflow_dispatch`).
  The dev URL is behind Vercel Authentication (log in to Vercel to view it).

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

Merge the PR into `main` first (this deploys nothing). Then promote `main` step by step:

```bash
# Development: test on https://rental-system-dev.vercel.app
git push origin main:deployment/development

# Production: only after it has been checked on development
git push origin main:deployment/production

gh run list --limit 4   # check the Deploy to Development / Production runs succeeded
```

Never run `vercel --prod` locally — production goes through `deployment/production` only.

## DB migrations

If the change includes anything under `supabase/migrations/`, apply the migration to each environment **before** pushing to its deployment branch (dev before `deployment/development`, prod before `deployment/production`) — use the **db-migrate** skill.
Exception: when a migration would break the version currently deployed (e.g. it requires a feature the old code lacks, like two-step verification), deploy the code first and apply the migration right after. Say which order applies in the PR.

## Environment variables required in production (Vercel dashboard)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only) |
