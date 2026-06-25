---
description: Launch and interact with the rental-system dev server
---

# run skill — rental-system

## Start the dev server

```bash
cd /Users/takeshi/Documents/GitHub/rental-system
npm run dev
```

The server starts on **http://localhost:3000**.

## Environment requirements

- Node.js 18+
- `.env` file present (copy from `.env.example` if missing)
- Required env vars: `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Verify it's running

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

Expected: `200`

## Check if already running

```bash
lsof -i :3000 | grep LISTEN
```

## Run e2e tests (requires dev server)

```bash
npx playwright test
```

## Key routes

| Path | Description |
|------|-------------|
| `/login` | Staff / branch-admin login |
| `/` | Dashboard (staff interface) |
| `/admin/login` | Super-admin (owner) login |
| `/admin/stores` | Store management console |
| `/settings` | Staff management (admin role) |
| `/vehicles` | Vehicle list |
| `/history` | Transaction history |
