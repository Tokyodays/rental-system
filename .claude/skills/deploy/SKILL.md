---
description: Deploy the rental-system application
---

# deploy skill — rental-system

## Current deployment target

**Supabase** (backend) + **Vercel / static hosting** (frontend)

> Note: Confirm the actual hosting provider before running deploy commands.

## Pre-deploy checklist

```bash
# 1. All tests pass
npx playwright test --reporter=line

# 2. TypeScript errors
npx nuxt typecheck 2>&1 | grep -E "error|Error" | head -20

# 3. Build succeeds
npm run build
```

## Database migrations

Migrations are in `supabase/migrations/`. Apply via:

```bash
node scripts/migrate.js
```

Or directly via psql for urgent fixes:

```bash
PGPASSWORD='<DB_PASS>' psql -h db.iznvoooqixudvsenqcuj.supabase.co -U postgres -d postgres -c "SQL_HERE"
```

## Environment variables required in production

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only) |

## Branch policy

- `main` → production
- `refactoring_claude` → current development branch
- PRs required for all changes to `main`
