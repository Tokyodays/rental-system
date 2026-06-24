# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rental-system.spec.ts >> Multi-tenant Management Flow >> 作成した新店舗のAdminでログインし、スタッフを管理できる
- Location: e2e/rental-system.spec.ts:909:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation to "/" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - status [ref=e3]
    - generic [ref=e5]:
      - generic [ref=e9]:
        - heading "Rental System" [level=1] [ref=e10]
        - paragraph [ref=e11]: Mobility Management SaaS
      - generic [ref=e14]:
        - generic [ref=e15]:
          - generic [ref=e18]: Username (英数字)*
          - textbox "Username (英数字)*" [ref=e21]:
            - /placeholder: admin
            - text: admin1782218963986
        - generic [ref=e24]:
          - generic [ref=e27]: Password*
          - textbox "Password*" [ref=e30]:
            - /placeholder: ••••••••
            - text: password123
        - button "Sign In" [ref=e33] [cursor=pointer]:
          - generic [ref=e34]: Sign In
        - button "Forgot password?" [ref=e36] [cursor=pointer]:
          - generic [ref=e37]: Forgot password?
      - paragraph [ref=e38]: © 2026 Slate Precision. All rights reserved.
  - region "Notifications (F8)":
    - list
  - generic:
    - img
  - generic [ref=e39]:
    - button "Toggle Nuxt DevTools" [ref=e40] [cursor=pointer]:
      - img [ref=e41]
    - generic "Page load time" [ref=e44]:
      - generic [ref=e45]: "44"
      - generic [ref=e46]: ms
    - button "Toggle Component Inspector" [ref=e48] [cursor=pointer]:
      - img [ref=e49]
```

# Test source

```ts
  1   | import { test, expect, type Page, type BrowserContext } from '@playwright/test'
  2   | 
  3   | /**
  4   |  * E2E Tests for Rental System
  5   |  *
  6   |  * 前提条件:
  7   |  *   - `yarn dev` で localhost:3000 が起動済み
  8   |  *   - Supabase にシードデータ（vehicles, customers, transactions）が存在すること
  9   |  *   - 環境変数 E2E_USER_EMAIL と E2E_USER_PASSWORD が設定済み
  10  |  *     または .env に TEST_USER_EMAIL / TEST_USER_PASSWORD が定義済み
  11  |  *
  12  |  * テスト実行:
  13  |  *   E2E_USER_EMAIL=xxx E2E_USER_PASSWORD=yyy npx playwright test
  14  |  *   npx playwright test --ui   (UIモード)
  15  |  *
  16  |  * 改善内容:
  17  |  *   - セレクタの正確性向上
  18  |  *   - waitForTimeout の削減
  19  |  *   - エラーメッセージ確認の追加
  20  |  *   - 認証・ユーザー管理テストの追加
  21  |  */
  22  | 
  23  | // テストユーザー認証情報（環境変数から取得）
  24  | const TEST_EMAIL = process.env.E2E_USER_EMAIL || ''
  25  | const TEST_PASSWORD = process.env.E2E_USER_PASSWORD || ''
  26  | const TEST_USERNAME = TEST_EMAIL.split('@')[0] // ユーザー名部分を抽出
  27  | 
  28  | // ============================================================
  29  | // Helper functions
  30  | // ============================================================
  31  | 
  32  | /** ログインしてセッションを確立する */
  33  | async function login(page: Page, username: string = TEST_USERNAME, password: string = TEST_PASSWORD) {
  34  |   await page.goto('/login')
  35  |   await page.waitForLoadState('networkidle')
  36  | 
  37  |   // 既にログイン済みならスキップ
  38  |   if (!page.url().includes('/login')) return
  39  | 
  40  |   // ユーザー名・パスワードを入力
  41  |   await page.getByPlaceholder('admin').fill(username)
  42  |   await page.getByPlaceholder('••••••••').fill(password)
  43  | 
  44  |   // Sign In ボタンをクリック
  45  |   await page.getByRole('button', { name: 'Sign In' }).click()
  46  | 
  47  |   // ダッシュボードへリダイレクトされるまで待つ
> 48  |   await page.waitForURL('/', { timeout: 15_000 })
      |              ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  49  |   await page.waitForLoadState('networkidle')
  50  | }
  51  | 
  52  | /** ローディングスピナーが消えるまで待つ（改善版） */
  53  | async function waitForLoadingComplete(page: Page, timeout: number = 5000) {
  54  |   try {
  55  |     await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout })
  56  |   } catch {
  57  |     // スピナーが見つからなかった場合は無視
  58  |   }
  59  | }
  60  | 
  61  | /** ログアウトする */
  62  | async function logout(page: Page) {
  63  |   // ユーザーメニュー（header の @xxx）をクリック
  64  |   const userMenu = page.locator('header').locator('text=/^@/').first()
  65  |   await expect(userMenu).toBeVisible()
  66  |   await userMenu.click()
  67  | 
  68  |   // Logout ボタンをクリック
  69  |   await page.getByRole('menuitem', { name: 'Logout' }).click()
  70  |   await page.waitForURL('/login', { timeout: 10_000 })
  71  | }
  72  | 
  73  | /** セッション情報をクリアする */
  74  | async function clearSession(page: Page, context: BrowserContext) {
  75  |   await context.clearCookies()
  76  |   await page.evaluate(() => {
  77  |     localStorage.clear()
  78  |     sessionStorage.clear()
  79  |   })
  80  | }
  81  | 
  82  | /** テスト用の顧客を作成する */
  83  | async function createTestCustomer(page: Page, name: string, email: string = 'test@example.com') {
  84  |   const customerCount = await page.locator('tbody tr').count()
  85  | 
  86  |   await page.getByRole('button', { name: 'Add New Customer' }).click()
  87  |   await expect(page.getByRole('heading', { name: 'Add New Customer' })).toBeVisible()
  88  | 
  89  |   await page.getByPlaceholder(/john|John/i).fill(name)
  90  |   await page.getByPlaceholder(/email|example.com/i).fill(email)
  91  |   await page.getByRole('button', { name: /register|add/i }).click()
  92  | 
  93  |   // 新規顧客がテーブルに追加されるまで待機
  94  |   await expect(page.locator('tbody').getByText(name)).toBeVisible({ timeout: 10_000 })
  95  |   return name
  96  | }
  97  | 
  98  | /** テスト用の顧客を削除する */
  99  | async function deleteTestCustomer(page: Page, name: string) {
  100 |   const row = page.locator('tr').filter({ hasText: name }).first()
  101 |   await expect(row).toBeVisible()
  102 | 
  103 |   // 削除ボタン（ゴミ箱アイコン）をクリック
  104 |   const deleteButton = row.locator('button').last()
  105 |   await deleteButton.click()
  106 | 
  107 |   // 確認ダイアログをハンドル
  108 |   page.on('dialog', dialog => dialog.accept())
  109 | 
  110 |   // 削除完了を待機
  111 |   await expect(page.locator('tbody').getByText(name)).not.toBeVisible({ timeout: 10_000 })
  112 | }
  113 | 
  114 | // ============================================================
  115 | // Global setup: 全テストの前にログイン
  116 | // ============================================================
  117 | test.beforeEach(async ({ page }) => {
  118 |   if (!TEST_EMAIL || !TEST_PASSWORD) {
  119 |     throw new Error(
  120 |       'テスト用の認証情報が未設定です。\n' +
  121 |       '実行時に環境変数を設定してください:\n' +
  122 |       '  E2E_USER_EMAIL=your@email.com E2E_USER_PASSWORD=yourpass npx playwright test'
  123 |     )
  124 |   }
  125 |   await login(page, TEST_USERNAME, TEST_PASSWORD)
  126 | })
  127 | 
  128 | // ============================================================
  129 | // 1. Dashboard Tests
  130 | // ============================================================
  131 | test.describe('Dashboard', () => {
  132 |   test('Stats cards (Lending, Available, Today\'s Transactions) が表示される', async ({ page }) => {
  133 |     await page.goto('/')
  134 |     await page.waitForLoadState('networkidle')
  135 |     await waitForLoadingComplete(page)
  136 | 
  137 |     // ページ見出し
  138 |     await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible()
  139 | 
  140 |     // 3つの統計カードが表示される
  141 |     await expect(page.getByText('Lending').first()).toBeVisible()
  142 |     await expect(page.getByText('Available').first()).toBeVisible()
  143 |     await expect(page.getByText("Today's Transactions")).toBeVisible()
  144 | 
  145 |     // 各カードの値が数値である（ローディング完了後）
  146 |     const statValues = page.locator('.text-3xl.font-bold')
  147 |     const count = await statValues.count()
  148 |     expect(count).toBe(3)
```