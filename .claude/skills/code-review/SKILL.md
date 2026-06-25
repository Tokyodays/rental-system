---
description: Review code changes in the rental-system project
---

# code-review skill — rental-system

Performs a code review of the current branch's changes against `main`.

## What to check

### Security
- Supabase RLS policies for new tables/queries
- API routes: verify role checks (`super_admin` / `admin` / `staff`)
- No secrets or credentials in committed code
- Input validation at system boundaries

### Architecture
- `useStaff()` composable used for auth state (not `useSupabaseUser()` directly)
- Middleware: `auth.global.ts` for routing, page-level middleware for granular control
- `super_admin` → `/admin/*` routes only
- `admin` / `staff` → `/` (staff interface) only
- New pages: confirm correct `layout` and `middleware` in `definePageMeta`

### Code quality
- No `console.log` left in production paths
- Vue composables called at setup level (not inside functions)
- `onAuthStateChange` listener registered only once (guarded by `useState`)
- TypeScript types correct for Supabase responses

### Tests
- New features have e2e test coverage
- No hardcoded test data that conflicts with `branchadmin` / `admin` users
- Multi-tenant tests use `adminLogin()` / `adminLogout()` helpers

## Run the review

```bash
git diff main...HEAD --stat
git log main..HEAD --oneline
npx playwright test --reporter=line
```
