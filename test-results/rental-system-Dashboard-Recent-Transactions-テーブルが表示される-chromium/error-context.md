# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rental-system.spec.ts >> Dashboard >> Recent Transactions テーブルが表示される
- Location: e2e/rental-system.spec.ts:65:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Recent Transactions')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Recent Transactions')

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
          - generic [ref=e18]: Email Address*
          - textbox "Email Address*" [ref=e21]:
            - /placeholder: name@company.com
        - generic [ref=e24]:
          - generic [ref=e27]: Password*
          - textbox "Password*" [ref=e30]:
            - /placeholder: ••••••••
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
      - generic [ref=e45]: "34"
      - generic [ref=e46]: ms
    - button "Toggle Component Inspector" [ref=e48] [cursor=pointer]:
      - img [ref=e49]
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test'
  2   | 
  3   | /**
  4   |  * E2E Tests for Rental System
  5   |  *
  6   |  * 前提条件:
  7   |  *   - `yarn dev` で localhost:3000 が起動済み
  8   |  *   - Supabase にシードデータ（vehicles, customers, transactions）が存在すること
  9   |  *   - ログイン済みセッションが有効であること（supabase redirect: false 設定のため）
  10  |  *
  11  |  * テスト実行:
  12  |  *   npx playwright test
  13  |  *   npx playwright test --ui   (UIモード)
  14  |  */
  15  | 
  16  | // ============================================================
  17  | // Helper functions
  18  | // ============================================================
  19  | 
  20  | /** ページが読み込み完了するまで待つ */
  21  | async function waitForPageLoad(page: Page) {
  22  |   await page.waitForLoadState('networkidle')
  23  | }
  24  | 
  25  | /** ローディングスピナーが消えるまで待つ */
  26  | async function waitForLoadingComplete(page: Page) {
  27  |   // loader-2 (spinner icon) が消えるまで待機
  28  |   try {
  29  |     await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 15_000 })
  30  |   } catch {
  31  |     // スピナーがそもそも存在しなかった場合は無視
  32  |   }
  33  | }
  34  | 
  35  | // ============================================================
  36  | // 1. Dashboard Tests
  37  | // ============================================================
  38  | test.describe('Dashboard', () => {
  39  |   test.beforeEach(async ({ page }) => {
  40  |     await page.goto('/')
  41  |     await waitForPageLoad(page)
  42  |     await waitForLoadingComplete(page)
  43  |   })
  44  | 
  45  |   test('Stats cards (Lending, Available, Today\'s Transactions) が表示される', async ({ page }) => {
  46  |     // ページ見出し
  47  |     await expect(page.locator('h1')).toContainText('Overview')
  48  | 
  49  |     // 3つの統計カードが表示される
  50  |     await expect(page.getByText('Lending')).toBeVisible()
  51  |     await expect(page.getByText('Available')).toBeVisible()
  52  |     await expect(page.getByText("Today's Transactions")).toBeVisible()
  53  | 
  54  |     // 各カードの値が数値である（ローディング完了後）
  55  |     const statValues = page.locator('.text-3xl.font-bold')
  56  |     const count = await statValues.count()
  57  |     expect(count).toBe(3)
  58  |     for (let i = 0; i < count; i++) {
  59  |       const text = await statValues.nth(i).textContent()
  60  |       expect(text).not.toBeNull()
  61  |       expect(Number(text?.trim())).not.toBeNaN()
  62  |     }
  63  |   })
  64  | 
  65  |   test('Recent Transactions テーブルが表示される', async ({ page }) => {
> 66  |     await expect(page.getByText('Recent Transactions')).toBeVisible()
      |                                                         ^ Error: expect(locator).toBeVisible() failed
  67  | 
  68  |     // テーブルヘッダーが存在する
  69  |     await expect(page.getByRole('columnheader', { name: 'Item' })).toBeVisible()
  70  |     await expect(page.getByRole('columnheader', { name: 'User' })).toBeVisible()
  71  |     await expect(page.getByRole('columnheader', { name: 'Action' })).toBeVisible()
  72  |     await expect(page.getByRole('columnheader', { name: 'Time' })).toBeVisible()
  73  |     await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
  74  |   })
  75  | 
  76  |   test('Lending ボタンが /rentals/new へ遷移する', async ({ page }) => {
  77  |     const lendingButton = page.locator('a[href="/rentals/new"]', { hasText: 'Lending' })
  78  |     await expect(lendingButton).toBeVisible()
  79  |     await lendingButton.click()
  80  |     await waitForPageLoad(page)
  81  |     await expect(page).toHaveURL('/rentals/new')
  82  |     await expect(page.getByText('New Lending')).toBeVisible()
  83  |   })
  84  | 
  85  |   test('View All リンクが /history へ遷移する', async ({ page }) => {
  86  |     const viewAll = page.getByRole('link', { name: 'View All' })
  87  |     await expect(viewAll).toBeVisible()
  88  |     await viewAll.click()
  89  |     await waitForPageLoad(page)
  90  |     await expect(page).toHaveURL('/history')
  91  |   })
  92  | })
  93  | 
  94  | // ============================================================
  95  | // 2. Vehicle List Tests
  96  | // ============================================================
  97  | test.describe('Vehicle List', () => {
  98  |   test.beforeEach(async ({ page }) => {
  99  |     await page.goto('/vehicles')
  100 |     await waitForPageLoad(page)
  101 |     await waitForLoadingComplete(page)
  102 |   })
  103 | 
  104 |   test('車両一覧テーブルが正しく表示される', async ({ page }) => {
  105 |     // テーブルヘッダーが存在する
  106 |     await expect(page.getByRole('columnheader', { name: 'Vehicle Name' })).toBeVisible()
  107 |     await expect(page.getByRole('columnheader', { name: 'Vehicle ID' })).toBeVisible()
  108 |     await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
  109 |     await expect(page.getByRole('columnheader', { name: 'Last Updated' })).toBeVisible()
  110 | 
  111 |     // 車両行が1件以上存在する
  112 |     const rows = page.locator('tbody tr')
  113 |     const count = await rows.count()
  114 |     expect(count).toBeGreaterThan(0)
  115 |   })
  116 | 
  117 |   test('検索フィルタが機能する', async ({ page }) => {
  118 |     const searchInput = page.getByPlaceholder('Search vehicles...')
  119 |     await searchInput.fill('Honda')
  120 |     await page.waitForTimeout(500) // debounce wait
  121 | 
  122 |     // フィルタ適用後もテーブルが存在する
  123 |     const rows = page.locator('tbody tr')
  124 |     const count = await rows.count()
  125 |     // Honda を含む行があるか、またはフィルタ結果が0件の表示
  126 |     if (count > 0) {
  127 |       const firstRow = await rows.first().textContent()
  128 |       expect(firstRow?.toLowerCase()).toContain('honda')
  129 |     }
  130 |   })
  131 | 
  132 |   test('カテゴリフィルタが機能する', async ({ page }) => {
  133 |     // "Bike" カテゴリをクリック
  134 |     const bikeFilter = page.locator('button', { hasText: /^Bike$/ })
  135 |     await bikeFilter.click()
  136 |     await page.waitForTimeout(500)
  137 | 
  138 |     // フィルタ結果にBikeカテゴリのみが表示される
  139 |     const rows = page.locator('tbody tr')
  140 |     const count = await rows.count()
  141 |     if (count > 0) {
  142 |       for (let i = 0; i < count; i++) {
  143 |         const text = await rows.nth(i).textContent()
  144 |         expect(text).toContain('Bike')
  145 |       }
  146 |     }
  147 |   })
  148 | 
  149 |   test('Vehicle Details サイドバーが表示される', async ({ page }) => {
  150 |     // 1行目をクリック
  151 |     const firstRow = page.locator('tbody tr').first()
  152 |     await firstRow.click()
  153 | 
  154 |     // サイドバーが表示される
  155 |     await expect(page.getByText('Vehicle Details')).toBeVisible()
  156 | 
  157 |     // サイドバー内の情報
  158 |     await expect(page.locator('aside').getByText('Category')).toBeVisible()
  159 |     await expect(page.locator('aside').getByText('Status Access')).toBeVisible()
  160 |     await expect(page.locator('aside').getByText('Last Mileage')).toBeVisible()
  161 |   })
  162 | })
  163 | 
  164 | // ============================================================
  165 | // 3. Add Vehicle Test
  166 | // ============================================================
```