---
description: Create and apply Supabase database migrations for rental-system. Use for "マイグレーション作成/適用", schema changes, new tables, RLS policy changes, or seed data updates. Not for deploying the app itself (use the deploy skill).
---

# db-migrate skill — rental-system

## Where migrations live

- Migration files: `supabase/migrations/*.sql` — applied in filename order
- Seed data: `supabase/seed.sql` — **destructive** (contains `TRUNCATE ... CASCADE` on vehicles etc.). Never run it against an existing dev/prod database.

## Projects

| Env | Project ref | Notes |
|-----|-------------|-------|
| dev | `cxhcmsfgmzcqfxejzfor` | `.env` SUPABASE_URL. The CLI should normally be linked here. |
| prod | `dyrhkvdmzcvslgbqofgh` | Link only for the duration of a prod push, then switch back to dev. |

Both are on the free tier and auto-pause when idle; if the CLI or app can't reach a project, check `supabase projects list` for `INACTIVE` first.

## Creating a migration

1. Name the file with a sortable prefix following the existing convention in `supabase/migrations/` (check the latest file there first).
2. Every new table needs:
   - RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
   - Policies covering the three roles: `super_admin`, `admin`, `staff` (role IDs are in CLAUDE.md)
   - Multi-tenant scoping (store/branch isolation) where applicable
3. Migrations must be idempotent so a partially-diverged database can re-run them:
   - `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`
   - `DROP POLICY IF EXISTS ...` before `CREATE POLICY` (Postgres has no `CREATE POLICY IF NOT EXISTS`)
   - `DROP TRIGGER IF EXISTS ...` before `CREATE TRIGGER`
   - `INSERT ... ON CONFLICT` for backfills

## Applying migrations

Use the Supabase CLI. It applies only migrations missing from the remote history table and never runs `seed.sql`.

```bash
cat supabase/.temp/project-ref          # confirm which project is linked
supabase migration list --linked        # Local vs Remote columns should match except the new file(s)
supabase db push --linked --dry-run     # must list ONLY the migration(s) you intend to apply
supabase db push --linked               # (= npm run db:migrate) asks [Y/n] before applying
```

If the dry run lists unexpected older migrations, stop and investigate. The remote has drifted, and `db push` would apply all of them.

### Applying to prod

```bash
supabase link --project-ref dyrhkvdmzcvslgbqofgh
supabase db push --linked --dry-run
supabase db push --linked
supabase migration list --linked        # confirm 0 mismatches
supabase link --project-ref cxhcmsfgmzcqfxejzfor   # always switch back to dev
```

## Verifying

- `supabase migration list --linked` shows Local and Remote identical.
- Inspect the schema with the postgres MCP tool. It connects to dev via the `DEV_DATABASE_URL` environment variable (see `.mcp.json`), so check that it points at the project you think it does.
  - Check the table exists and columns are correct
  - Check `pg_policies` for the new RLS policies
- Confirm seed users still work (`admin`, `branchadmin` — see CLAUDE.md).

Then run the E2E suite (see e2e-testing skill) to catch regressions.

## Rules

- Never run `seed.sql` or ad-hoc `psql` with inline passwords against dev/prod. Credentials stay in environment variables or the CLI's login, never in tracked files.
- Apply migrations to dev and prod before merging the corresponding PR to `main` (production deploys from `main` expect the schema to already exist).
- For query/index/RLS performance guidance, consult the supabase-postgres-best-practices skill.
