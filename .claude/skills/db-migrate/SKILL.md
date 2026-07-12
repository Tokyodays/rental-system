---
description: Create and apply Supabase database migrations for rental-system. Use for "マイグレーション作成/適用", schema changes, new tables, RLS policy changes, or seed data updates. Not for deploying the app itself (use the deploy skill).
---

# db-migrate skill — rental-system

## Where migrations live

- Migration files: `supabase/migrations/*.sql` — applied in filename order
- Seed data: `supabase/seed.sql`

## Creating a migration

1. Name the file with a sortable prefix following the existing convention in `supabase/migrations/` (check the latest file there first).
2. Every new table needs:
   - RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
   - Policies covering the three roles: `super_admin`, `admin`, `staff` (role IDs are in CLAUDE.md)
   - Multi-tenant scoping (store/branch isolation) where applicable
3. Migrations must be idempotent where possible (`IF NOT EXISTS`, `OR REPLACE`).

## Applying migrations

```bash
node scripts/migrate.js
```

The script reads DB credentials from `.env` (`DB_HOST`, `DB_PASS`, optional `DB_PORT` / `DB_NAME` / `DB_USER`), runs every file in `supabase/migrations/` in order, then applies `supabase/seed.sql`. It fails fast if `DB_HOST` or `DB_PASS` is missing.

## Verifying

Use the postgres MCP tool to inspect the resulting schema and policies:

- Check the table exists and columns are correct
- Check `pg_policies` for the new RLS policies
- Confirm seed users still work (`admin`, `branchadmin` — see CLAUDE.md)

Then run the E2E suite (see e2e-testing skill) to catch regressions.

## Rules

- Never run ad-hoc `psql` with inline passwords; credentials stay in `.env` and go through `scripts/migrate.js` or the postgres MCP tool.
- Apply migrations before merging the corresponding PR to `main` (production deploys from `main` expect the schema to already exist).
- For query/index/RLS performance guidance, consult the supabase-postgres-best-practices skill.
