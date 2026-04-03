# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rental-system.spec.ts >> Dashboard >> Stats cards (Lending, Available, Today's Transactions) が表示される
- Location: e2e/rental-system.spec.ts:72:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Overview"
Error: strict mode violation: locator('h1') resolved to 2 elements:
    1) <h1 class="text-base font-bold leading-tight text-slate-900 dark:text-white">Rental System</h1> aka getByRole('heading', { name: 'Rental System' })
    2) <h1 class="text-2xl font-bold">Overview</h1> aka getByRole('heading', { name: 'Overview', exact: true })

Call log:
  - Expect "toContainText" with timeout 10000ms
  - waiting for locator('h1')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - status [ref=e3]
    - generic [ref=e4]:
      - complementary [ref=e5]:
        - generic [ref=e9]:
          - heading "Rental System" [level=1] [ref=e10]
          - paragraph [ref=e11]: Vehicle Management
        - navigation [ref=e12]:
          - link "Dashboard" [ref=e13] [cursor=pointer]:
            - /url: /
            - text: Dashboard
          - link "Vehicle List" [ref=e15] [cursor=pointer]:
            - /url: /vehicles
            - text: Vehicle List
          - link "Lending" [ref=e17] [cursor=pointer]:
            - /url: /rentals/new
            - text: Lending
          - link "Return" [ref=e19] [cursor=pointer]:
            - /url: /rentals/return
            - text: Return
          - link "Customers" [ref=e21] [cursor=pointer]:
            - /url: /customers
            - text: Customers
          - link "History" [ref=e23] [cursor=pointer]:
            - /url: /history
            - text: History
        - link "Settings" [ref=e26] [cursor=pointer]:
          - /url: /settings
          - text: Settings
      - generic [ref=e28]:
        - banner [ref=e29]:
          - heading "Dashboard Overview" [level=2] [ref=e31]
          - generic [ref=e33] [cursor=pointer]:
            - generic [ref=e34]: developer
            - img "Avatar" [ref=e36]
        - main [ref=e37]:
          - generic [ref=e38]:
            - generic [ref=e39]:
              - generic [ref=e40]:
                - heading "Overview" [level=1] [ref=e41]
                - paragraph [ref=e42]: Check today's rental and return status.
              - link "Lending" [ref=e44] [cursor=pointer]:
                - /url: /rentals/new
                - generic [ref=e46]: Lending
            - generic [ref=e47]:
              - generic [ref=e49]:
                - paragraph [ref=e51]: Lending
                - paragraph [ref=e54]: "0"
              - generic [ref=e56]:
                - paragraph [ref=e58]: Available
                - paragraph [ref=e61]: "21"
              - generic [ref=e63]:
                - paragraph [ref=e65]: Today's Transactions
                - paragraph [ref=e68]: "0"
            - generic [ref=e69]:
              - generic [ref=e71]:
                - heading "Recent Transactions" [level=3] [ref=e72]
                - link "View All" [ref=e73] [cursor=pointer]:
                  - /url: /history
                  - generic [ref=e74]: View All
              - table [ref=e77]:
                - rowgroup [ref=e78]:
                  - row "Item User Action Time Status" [ref=e79]:
                    - columnheader "Item" [ref=e80]
                    - columnheader "User" [ref=e81]
                    - columnheader "Action" [ref=e82]
                    - columnheader "Time" [ref=e83]
                    - columnheader "Status" [ref=e84]
                - rowgroup [ref=e85]:
                  - row "Suzuki Address CW Cameron Williamson Return Apr 3, 12:14 AM Completed" [ref=e86]:
                    - cell "Suzuki Address" [ref=e87]
                    - cell "CW Cameron Williamson" [ref=e88]:
                      - generic [ref=e90]: CW
                      - generic [ref=e91]: Cameron Williamson
                    - cell "Return" [ref=e92]:
                      - generic [ref=e94] [cursor=pointer]: Return
                    - cell "Apr 3, 12:14 AM" [ref=e95]
                    - cell "Completed" [ref=e96]:
                      - generic [ref=e98]: Completed
                  - row "Suzuki Address CW Cameron Williamson Lend Mar 29, 04:24 PM Completed" [ref=e99]:
                    - cell "Suzuki Address" [ref=e100]
                    - cell "CW Cameron Williamson" [ref=e101]:
                      - generic [ref=e103]: CW
                      - generic [ref=e104]: Cameron Williamson
                    - cell "Lend" [ref=e105]:
                      - generic [ref=e107] [cursor=pointer]: Lend
                    - cell "Mar 29, 04:24 PM" [ref=e108]
                    - cell "Completed" [ref=e109]:
                      - generic [ref=e111]: Completed
                  - row "Yamaha Vino HS Hanako Sato Return Mar 29, 04:09 PM Completed" [ref=e112]:
                    - cell "Yamaha Vino" [ref=e113]
                    - cell "HS Hanako Sato" [ref=e114]:
                      - generic [ref=e116]: HS
                      - generic [ref=e117]: Hanako Sato
                    - cell "Return" [ref=e118]:
                      - generic [ref=e120] [cursor=pointer]: Return
                    - cell "Mar 29, 04:09 PM" [ref=e121]
                    - cell "Completed" [ref=e122]:
                      - generic [ref=e124]: Completed
                  - row "Yamaha Vino HS Hanako Sato Lend Mar 29, 04:08 PM Completed" [ref=e125]:
                    - cell "Yamaha Vino" [ref=e126]
                    - cell "HS Hanako Sato" [ref=e127]:
                      - generic [ref=e129]: HS
                      - generic [ref=e130]: Hanako Sato
                    - cell "Lend" [ref=e131]:
                      - generic [ref=e133] [cursor=pointer]: Lend
                    - cell "Mar 29, 04:08 PM" [ref=e134]
                    - cell "Completed" [ref=e135]:
                      - generic [ref=e137]: Completed
  - generic:
    - img
  - generic [ref=e138]:
    - button "Toggle Nuxt DevTools" [ref=e139] [cursor=pointer]:
      - img [ref=e140]
    - generic "Page load time" [ref=e143]:
      - generic [ref=e144]: "40"
      - generic [ref=e145]: ms
    - button "Toggle Component Inspector" [ref=e147] [cursor=pointer]:
      - img [ref=e148]
  - region "Notifications (F8)":
    - list
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
  9   |  *   - 環境変数 E2E_USER_EMAIL と E2E_USER_PASSWORD が設定済み
  10  |  *     または .env に TEST_USER_EMAIL / TEST_USER_PASSWORD が定義済み
  11  |  *
  12  |  * テスト実行:
  13  |  *   E2E_USER_EMAIL=xxx E2E_USER_PASSWORD=yyy npx playwright test
  14  |  *   npx playwright test --ui   (UIモード)
  15  |  */
  16  | 
  17  | // テストユーザー認証情報（環境変数から取得）
  18  | const TEST_EMAIL = process.env.E2E_USER_EMAIL || ''
  19  | const TEST_PASSWORD = process.env.E2E_USER_PASSWORD || ''
  20  | 
  21  | // ============================================================
  22  | // Helper functions
  23  | // ============================================================
  24  | 
  25  | /** ログインしてセッションを確立する */
  26  | async function login(page: Page) {
  27  |   await page.goto('/login')
  28  |   await page.waitForLoadState('networkidle')
  29  | 
  30  |   // 既にログイン済みならスキップ
  31  |   if (!page.url().includes('/login')) return
  32  | 
  33  |   // メール・パスワードを入力
  34  |   await page.getByPlaceholder('name@company.com').fill(TEST_EMAIL)
  35  |   await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD)
  36  | 
  37  |   // Sign In ボタンをクリック
  38  |   await page.getByRole('button', { name: 'Sign In' }).click()
  39  | 
  40  |   // ダッシュボードへリダイレクトされるまで待つ
  41  |   await page.waitForURL('/', { timeout: 15_000 })
  42  |   await page.waitForLoadState('networkidle')
  43  | }
  44  | 
  45  | /** ローディングスピナーが消えるまで待つ */
  46  | async function waitForLoadingComplete(page: Page) {
  47  |   try {
  48  |     await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 15_000 })
  49  |   } catch {
  50  |     // スピナーがそもそも存在しなかった場合は無視
  51  |   }
  52  | }
  53  | 
  54  | // ============================================================
  55  | // Global setup: 全テストの前にログイン
  56  | // ============================================================
  57  | test.beforeEach(async ({ page }) => {
  58  |   if (!TEST_EMAIL || !TEST_PASSWORD) {
  59  |     throw new Error(
  60  |       'テスト用の認証情報が未設定です。\n' +
  61  |       '実行時に環境変数を設定してください:\n' +
  62  |       '  E2E_USER_EMAIL=your@email.com E2E_USER_PASSWORD=yourpass npx playwright test'
  63  |     )
  64  |   }
  65  |   await login(page)
  66  | })
  67  | 
  68  | // ============================================================
  69  | // 1. Dashboard Tests
  70  | // ============================================================
  71  | test.describe('Dashboard', () => {
  72  |   test('Stats cards (Lending, Available, Today\'s Transactions) が表示される', async ({ page }) => {
  73  |     await page.goto('/')
  74  |     await page.waitForLoadState('networkidle')
  75  |     await waitForLoadingComplete(page)
  76  | 
  77  |     // ページ見出し
> 78  |     await expect(page.locator('h1')).toContainText('Overview')
      |                                      ^ Error: expect(locator).toContainText(expected) failed
  79  | 
  80  |     // 3つの統計カードが表示される
  81  |     await expect(page.getByText('Lending').first()).toBeVisible()
  82  |     await expect(page.getByText('Available').first()).toBeVisible()
  83  |     await expect(page.getByText("Today's Transactions")).toBeVisible()
  84  | 
  85  |     // 各カードの値が数値である（ローディング完了後）
  86  |     const statValues = page.locator('.text-3xl.font-bold')
  87  |     const count = await statValues.count()
  88  |     expect(count).toBe(3)
  89  |     for (let i = 0; i < count; i++) {
  90  |       const text = await statValues.nth(i).textContent()
  91  |       expect(text).not.toBeNull()
  92  |       expect(Number(text?.trim())).not.toBeNaN()
  93  |     }
  94  |   })
  95  | 
  96  |   test('Recent Transactions テーブルが表示される', async ({ page }) => {
  97  |     await page.goto('/')
  98  |     await page.waitForLoadState('networkidle')
  99  |     await waitForLoadingComplete(page)
  100 | 
  101 |     await expect(page.getByText('Recent Transactions')).toBeVisible()
  102 | 
  103 |     // テーブルヘッダーが存在する
  104 |     await expect(page.getByRole('columnheader', { name: 'Item' })).toBeVisible()
  105 |     await expect(page.getByRole('columnheader', { name: 'User' })).toBeVisible()
  106 |     await expect(page.getByRole('columnheader', { name: 'Action' })).toBeVisible()
  107 |     await expect(page.getByRole('columnheader', { name: 'Time' })).toBeVisible()
  108 |     await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
  109 |   })
  110 | 
  111 |   test('Lending ボタンが /rentals/new へ遷移する', async ({ page }) => {
  112 |     await page.goto('/')
  113 |     await page.waitForLoadState('networkidle')
  114 | 
  115 |     const lendingButton = page.locator('a[href="/rentals/new"]', { hasText: 'Lending' })
  116 |     await expect(lendingButton).toBeVisible()
  117 |     await lendingButton.click()
  118 |     await page.waitForLoadState('networkidle')
  119 |     await expect(page).toHaveURL('/rentals/new')
  120 |     await expect(page.getByText('New Lending')).toBeVisible()
  121 |   })
  122 | 
  123 |   test('View All リンクが /history へ遷移する', async ({ page }) => {
  124 |     await page.goto('/')
  125 |     await page.waitForLoadState('networkidle')
  126 | 
  127 |     const viewAll = page.getByRole('link', { name: 'View All' })
  128 |     await expect(viewAll).toBeVisible()
  129 |     await viewAll.click()
  130 |     await page.waitForLoadState('networkidle')
  131 |     await expect(page).toHaveURL('/history')
  132 |   })
  133 | })
  134 | 
  135 | // ============================================================
  136 | // 2. Vehicle List Tests
  137 | // ============================================================
  138 | test.describe('Vehicle List', () => {
  139 |   test('車両一覧テーブルが正しく表示される', async ({ page }) => {
  140 |     await page.goto('/vehicles')
  141 |     await page.waitForLoadState('networkidle')
  142 |     await waitForLoadingComplete(page)
  143 | 
  144 |     // テーブルヘッダーが存在する
  145 |     await expect(page.getByRole('columnheader', { name: 'Vehicle Name' })).toBeVisible()
  146 |     await expect(page.getByRole('columnheader', { name: 'Vehicle ID' })).toBeVisible()
  147 |     await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
  148 |     await expect(page.getByRole('columnheader', { name: 'Last Updated' })).toBeVisible()
  149 | 
  150 |     // 車両行が1件以上存在する
  151 |     const rows = page.locator('tbody tr')
  152 |     const count = await rows.count()
  153 |     expect(count).toBeGreaterThan(0)
  154 |   })
  155 | 
  156 |   test('検索フィルタが機能する', async ({ page }) => {
  157 |     await page.goto('/vehicles')
  158 |     await page.waitForLoadState('networkidle')
  159 |     await waitForLoadingComplete(page)
  160 | 
  161 |     const searchInput = page.getByPlaceholder('Search vehicles...')
  162 |     await expect(searchInput).toBeVisible()
  163 |     await searchInput.fill('Honda')
  164 |     await page.waitForTimeout(500)
  165 | 
  166 |     const rows = page.locator('tbody tr')
  167 |     const count = await rows.count()
  168 |     if (count > 0) {
  169 |       const firstRow = await rows.first().textContent()
  170 |       expect(firstRow?.toLowerCase()).toContain('honda')
  171 |     }
  172 |   })
  173 | 
  174 |   test('カテゴリフィルタが機能する', async ({ page }) => {
  175 |     await page.goto('/vehicles')
  176 |     await page.waitForLoadState('networkidle')
  177 |     await waitForLoadingComplete(page)
  178 | 
```