import { chromium, type FullConfig } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { STAFF_STORAGE_STATE, completeMfa, prepareMfa } from './mfa'

/**
 * テスト開始前に主要なページを一度開き、開発サーバー（Vite）にコンパイルさせておく。
 * 起動直後やコード変更直後は初回アクセスでコンパイルが走り、最初のテストのログイン待ち（15 秒）を超えることがあるため。
 * 準備に失敗してもテストは止めない（警告だけ出す）。
 */
const STAFF_PAGES = ['/dashboard', '/vehicles', '/rentals/new', '/rentals/return', '/customers', '/history', '/settings', '/howtouse']
const PUBLIC_PAGES = ['/', '/login', '/admin/login']
const WARMUP_TIMEOUT = 120_000

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL
  const username = (process.env.E2E_USER_EMAIL || '').split('@')[0]
  const password = process.env.E2E_USER_PASSWORD || ''
  // 設定がこのファイルを参照するため、準備をしない・失敗した場合も空のログイン状態を用意しておく
  mkdirSync(dirname(STAFF_STORAGE_STATE), { recursive: true })
  writeFileSync(STAFF_STORAGE_STATE, JSON.stringify({ cookies: [], origins: [] }))
  if (!baseURL || !username || !password) return

  const startedAt = Date.now()
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ baseURL })
    page.setDefaultTimeout(WARMUP_TIMEOUT)

    for (const path of PUBLIC_PAGES) {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
    }

    await prepareMfa(username)
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('admin').fill(username)
    await page.getByPlaceholder('••••••••').fill(password)
    await page.getByRole('button', { name: 'Sign In' }).click()
    await completeMfa(page, username)
    await page.waitForURL('**/dashboard')
    // 二段階認証まで済んだログイン状態を保存し、各テストはここから始める（毎回コードを入力しない）
    await page.context().storageState({ path: STAFF_STORAGE_STATE })

    for (const path of STAFF_PAGES) {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
    }
    console.log(`[e2e warm-up] ${PUBLIC_PAGES.length + STAFF_PAGES.length} pages in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`)
  } catch (err) {
    console.warn('[e2e warm-up] skipped:', err instanceof Error ? err.message.split('\n')[0] : err)
  } finally {
    await browser.close()
  }
}
