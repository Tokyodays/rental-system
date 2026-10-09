// 取扱説明書 (/howtouse) 用の画面キャプチャを public/howtouse/ に出力する。
// 使い方: npm run dev を起動した状態で `node scripts/capture-howtouse-screenshots.mjs`
// 環境変数: CAPTURE_BASE_URL (既定 http://localhost:3000) / CAPTURE_USER / CAPTURE_PASSWORD
// データは作成・更新しない（フォームは入力途中で閉じ、貸出・返却も確認画面で止める）。
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const BASE_URL = process.env.CAPTURE_BASE_URL || 'http://localhost:3000'
const USER = process.env.CAPTURE_USER || 'branchadmin'
const PASSWORD = process.env.CAPTURE_PASSWORD || 'password123'
const OUT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/howtouse')
const CARD = '.cursor-pointer.hover\\:border-blue-500'
const LENT_CARD = '.cursor-pointer.hover\\:border-orange-500'

mkdirSync(OUT_DIR, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 860 } })

async function open(route) {
  await page.goto(`${BASE_URL}${route}`)
  await page.waitForLoadState('networkidle')
  await page.addStyleTag({ content: '.bg-amber-400 { display: none !important; }' })
  await page.locator('.animate-spin').first().waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {})
}

async function shot(name) {
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`) })
  console.log(`saved ${name}.png`)
}

await page.goto(`${BASE_URL}/login`)
await page.waitForLoadState('networkidle')
await page.getByPlaceholder('admin').fill(USER)
await page.getByPlaceholder('••••••••').fill(PASSWORD)
await page.getByRole('button', { name: 'Sign In' }).click()
await page.waitForURL('**/dashboard', { timeout: 20000 })

await open('/dashboard')
await shot('overview-dashboard')

await open('/vehicles')
await shot('vehicles-list')
await page.locator('tbody tr').first().click()
await shot('vehicles-detail')
await page.getByRole('button', { name: 'Add Vehicle' }).click()
await page.getByPlaceholder('e.g. Honda PCX 150').fill('Honda PCX 150')
await shot('vehicles-add')
await page.keyboard.press('Escape')

await open('/customers')
await shot('customers-list')
await page.getByRole('button', { name: 'Add New Customer' }).click()
await page.getByPlaceholder('e.g. John Doe').fill('John Doe')
await page.getByPlaceholder('john@example.com').fill('john@example.com')
await page.getByPlaceholder('+81-XXX-XXXX-XXXX').fill('+81-90-1234-5678')
await page.getByPlaceholder('e.g. TK1234567').fill('TK1234567')
await shot('customers-add')
await page.keyboard.press('Escape')

await open('/rentals/new')
await shot('lending-step1')
await page.locator(CARD).first().click()
await page.locator(CARD).first().waitFor()
await shot('lending-step2')
await page.locator(CARD).first().click()
await page.getByText('Step 3: Return Schedule').waitFor()
await shot('lending-step3')
await page.getByRole('button', { name: 'Continue to Price Input' }).click()
await page.locator('input[type="number"]').fill('5000')
await shot('lending-step4')
await page.getByRole('button', { name: 'Continue to Confirmation' }).click()
await page.getByText('Step 5: Confirm Transaction').waitFor()
await shot('lending-step5')

await open('/rentals/return')
if (await page.locator(LENT_CARD).count()) {
  await shot('returning-step1')
  await page.locator(LENT_CARD).first().click()
  await page.getByText('Step 2: Check Return Details').waitFor()
  await shot('returning-step2')
} else {
  console.warn('No lent vehicles: skipped returning-step1/2')
}

await open('/history')
await shot('history-list')
await page.getByRole('button', { name: 'Export' }).click()
await shot('history-export')

await browser.close()
