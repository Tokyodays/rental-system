# rental-system — Claude Code Guidelines

## Project overview

Multi-tenant vehicle rental SaaS built with **Nuxt 4** + **Supabase**.

- Staff interface: `/login` → `/` (branch admin & staff)
- Admin console: `/admin/login` → `/admin/stores` (super_admin / owner only)
- E2E tests: Playwright (`npx playwright test`)

## Key files

| File | Role |
|------|------|
| `app/composables/useStaff.ts` | Auth state composable (single source of truth) |
| `app/middleware/auth.global.ts` | Global routing middleware |
| `app/layouts/admin.vue` | Admin console layout (no sidebar) |
| `app/layouts/default.vue` | Staff interface layout (with sidebar) |
| `e2e/rental-system.spec.ts` | All E2E tests (36 tests) |
| `server/api/admin/` | Admin-only API routes |
| `supabase/migrations/` | DB schema migrations |

## Roles

| Role | ID | Access |
|------|----|--------|
| `super_admin` | `00000000-0000-0000-0001-000000000000` | Admin console only |
| `admin` | `00000000-0000-0000-0001-000000000001` | Staff interface + settings |
| `staff` | `00000000-0000-0000-0001-000000000002` | Staff interface only |

## Test users

| Username | Password | Role | Notes |
|----------|----------|------|-------|
| `admin` | `password123` | super_admin | Owner / admin console |
| `branchadmin` | `password123` | admin | E2E test user (Main Store) |

## Sub-agent guidelines

### When to use the Explore agent
- Finding where a feature is implemented across multiple files
- Searching for all usages of a composable, type, or API endpoint
- Mapping the data flow for a new feature before implementing

### When to use the Plan agent
- Before implementing a feature that touches middleware, layouts, and DB
- When changes might affect RLS policies or auth flows

### When to use the code-reviewer agent
- After completing a feature branch, before raising a PR
- When changes affect auth middleware or role-based access

### When NOT to spawn agents
- For single-file edits or simple grep lookups — do it inline
- When the answer is already in this file or in recent conversation context

## MCP tools in use

- **context7**: Nuxt 3 / Supabase / Vue 3 live documentation
- **filesystem**: Project file access
- **postgres**: Direct DB queries (schema inspection, seed data)
- **github**: Issue / PR operations (requires GITHUB_PERSONAL_ACCESS_TOKEN)
- **serena**: Code intelligence — symbol search, go-to-definition, references

## Coding conventions

- `useStaff()` must be called at component setup level, never inside functions
- `onAuthStateChange` is guarded by `useState('staff-auth-listener')` — do not add more listeners
- Page middleware order: `auth.global.ts` runs first, then page-level middleware
- All new admin pages: `definePageMeta({ layout: 'admin', middleware: 'super-admin-only' })`
- E2E test helpers: `login()` for staff/branch-admin, `adminLogin()` for super_admin
