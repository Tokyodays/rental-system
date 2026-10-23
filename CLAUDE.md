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
| `app/composables/useMfa.ts` | Two-step verification (TOTP) — required for every user |
| `app/middleware/auth.global.ts` | Global routing middleware |
| `app/layouts/admin.vue` | Admin console layout (no sidebar) |
| `app/layouts/default.vue` | Staff interface layout (with sidebar) |
| `e2e/rental-system.spec.ts` | All E2E tests (64 tests) |
| `e2e/mfa.ts` | E2E TOTP helpers (secrets in `e2e/.auth/`, gitignored) |
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

Two-step verification (TOTP) is required for every user. After the password, the app sends you to
`/mfa/setup` (first time: scan the QR or use the shown key) or `/mfa/verify` (6-digit code).
Without it (JWT `aal` ≠ `aal2`) the DB returns no store data (`get_auth_store_id()` is NULL) and admin APIs return 403.
E2E handles this automatically: `e2e/mfa.ts` saves each test user's TOTP secret to `e2e/.auth/totp.json`
and generates codes; if a secret is unknown it deletes the user's factors (service role) so they re-enroll.
To use a test user by hand, register its key in an authenticator app, or reset it from Settings / the admin console.

## Deploy

`main` deploys nothing. Push `main` to `deployment/development` (→ https://rental-system-dev.vercel.app, dev Supabase)
or `deployment/production` (→ https://rental-system-chi-lac.vercel.app, prod Supabase); GitHub Actions deploys it.
Vercel's Git auto-deploy is off (`vercel.json`). Details: `.claude/skills/deploy/SKILL.md`.

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
- E2E test helpers: `login()` for staff/branch-admin, `adminLogin()` for super_admin (both complete two-step verification)
- E2E tests start from the saved, already-verified session (`e2e/.auth/staff.json`); use `browser.newContext({ storageState: LOGGED_OUT })` for a fresh device
- `onAuthStateChange` callbacks run while the auth lock is held — never `await` Supabase calls inside them (defer with `setTimeout`)
