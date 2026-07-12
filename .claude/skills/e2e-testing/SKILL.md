---
description: Run, write, and debug Playwright E2E tests for rental-system. Use for "E2Eテスト実行", "テスト書いて", "テスト落ちた", or after any feature change that needs test coverage. Requires the dev server (see run skill).
---

# e2e-testing skill — rental-system

## Where everything lives

- All tests: `e2e/rental-system.spec.ts` (single file, 36 tests, 12 describe blocks)
- Config: `playwright.config.ts` — `workers: 1` (tests are order-sensitive and share DB state; never parallelize)

## Running

```bash
# Dev server must be running first (see run skill)
npx playwright test --reporter=line

# Single describe block / test by name
npx playwright test -g "Lending Flow"

# Debug a failure with headed browser
npx playwright test -g "test name" --headed --debug
```

## Helpers (use these, never hand-roll login)

Defined at the top of `e2e/rental-system.spec.ts`:

| Helper | Purpose |
|--------|---------|
| `login(page, username?, password?)` | Staff/branch-admin login via `/login` (defaults: `branchadmin`) |
| `adminLogin(page, username?, password?)` | Super-admin login via `/admin/login` (defaults: `admin`) |
| `logout(page)` / `adminLogout(page)` | Corresponding logouts |
| `clearSession(page, context)` | Reset auth state between role switches |
| `createTestCustomer(page, name, email?)` / `deleteTestCustomer(page, name)` | Test data lifecycle — always delete what you create |
| `waitForLoadingComplete(page, timeout?)` | Wait for spinners before asserting |

Test users: `branchadmin` / `password123` (admin role, Main Store) and `admin` / `password123` (super_admin). Do not create tests that mutate these users.

## Writing new tests

- Add to the matching existing `test.describe` block; create a new block only for a genuinely new feature area.
- Multi-tenant tests: use `adminLogin()` / `adminLogout()` and clean up any stores/staff you create.
- Test data must not conflict with seeded users; use `Date.now()`-suffixed emails like `createTestCustomer` does.
- Every new user-facing feature needs at least one E2E test before the PR (checked by the code-review skill).

## Debugging failures

1. Reproduce with `-g` on the failing test alone — but remember shared-state ordering: if it passes alone but fails in the suite, a previous test leaked data.
2. Check the dev server is actually running and `.env` is loaded (see run skill).
3. Auth-related flakiness: usually a leaked session — ensure the previous test's logout/`clearSession` ran.
4. If test count changes, update the count in CLAUDE.md and in this file.
