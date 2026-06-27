// Landing page screenshot capture script
// Requires: local dev server running on :3000 (yarn dev)
// Usage: E2E_USER_EMAIL=branchadmin E2E_USER_PASSWORD=password123 node scripts/take-screenshots.cjs

const { chromium } = require('playwright')
const path = require('path')

const BASE_URL = 'http://localhost:3000'
const OUT_DIR = path.join(__dirname, '..', 'docs', 'screenshots')
const USERNAME = process.env.E2E_USER_EMAIL || 'branchadmin'
const PASSWORD = process.env.E2E_USER_PASSWORD || 'password123'

const HIDE_DEV_BANNER = '[class*="bg-amber-400"] { display: none !important; }'

async function login(page) {
  await page.goto(`${BASE_URL}/login`)
  await page.waitForLoadState('networkidle')

  if (!page.url().includes('/login')) {
    console.log('  Already authenticated')
    return
  }

  // Same selectors as E2E tests
  await page.getByPlaceholder('admin').fill(USERNAME)
  await page.getByPlaceholder('••••••••').fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 15000 })
  await page.waitForLoadState('networkidle')

  // Wait for useStaff() to fully initialize store_id before navigating away
  console.log('  Waiting for staff context to initialize...')
  await page.waitForTimeout(5000)
}

async function waitForLoadingComplete(page) {
  try {
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 15000 })
  } catch {
    // no spinner found, continue
  }
  await page.waitForTimeout(500)
}

async function shot(page, name) {
  await waitForLoadingComplete(page)
  await page.addStyleTag({ content: HIDE_DEV_BANNER })
  await page.waitForTimeout(300)
  await page.screenshot({
    path: path.join(OUT_DIR, `${name}.png`),
    clip: { x: 0, y: 0, width: 1280, height: 800 }
  })
  console.log(`  ✓ ${name}.png`)
}

async function main() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2
  })
  const page = await context.newPage()

  console.log('Logging in...')
  await login(page)

  console.log('Taking screenshots...')

  // 1. Dashboard
  await page.goto(`${BASE_URL}/dashboard`)
  await page.waitForLoadState('networkidle')
  await shot(page, '01_dashboard')

  // 2. Vehicles list
  await page.goto(`${BASE_URL}/vehicles`)
  await page.waitForLoadState('networkidle')
  await shot(page, '02_vehicles')

  // 3. Lending flow
  await page.goto(`${BASE_URL}/rentals/new`)
  await page.waitForLoadState('networkidle')
  await shot(page, '03_lending_flow')

  // 4. Customers list
  await page.goto(`${BASE_URL}/customers`)
  await page.waitForLoadState('networkidle')
  await shot(page, '04_customers')

  // 5. Transaction history
  await page.goto(`${BASE_URL}/history`)
  await page.waitForLoadState('networkidle')
  await shot(page, '05_history')

  await browser.close()
  console.log('\nDone! Saved to docs/screenshots/')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
