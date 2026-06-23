# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rental-system.spec.ts >> Multi-tenant Management Flow >> 新規店舗を作成し、その店舗の管理者を登録できる
- Location: e2e/rental-system.spec.ts:866:3

# Error details

```
Error: テスト用の認証情報が未設定です。
実行時に環境変数を設定してください:
  E2E_USER_EMAIL=your@email.com E2E_USER_PASSWORD=yourpass npx playwright test
```

# Test source

```ts
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
  48  |   await page.waitForURL('/', { timeout: 15_000 })
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
> 119 |     throw new Error(
      |           ^ Error: テスト用の認証情報が未設定です。
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
  149 |     for (let i = 0; i < count; i++) {
  150 |       const text = await statValues.nth(i).textContent()
  151 |       expect(text).not.toBeNull()
  152 |       expect(Number(text?.trim())).not.toBeNaN()
  153 |     }
  154 |   })
  155 | 
  156 |   test('Recent Transactions テーブルが表示される', async ({ page }) => {
  157 |     await page.goto('/')
  158 |     await page.waitForLoadState('networkidle')
  159 |     await waitForLoadingComplete(page)
  160 | 
  161 |     await expect(page.getByText('Recent Transactions')).toBeVisible()
  162 | 
  163 |     // テーブルヘッダーが存在する
  164 |     await expect(page.getByRole('columnheader', { name: 'Item' })).toBeVisible()
  165 |     await expect(page.getByRole('columnheader', { name: 'User' })).toBeVisible()
  166 |     await expect(page.getByRole('columnheader', { name: 'Action' })).toBeVisible()
  167 |     await expect(page.getByRole('columnheader', { name: 'Time' })).toBeVisible()
  168 |     await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
  169 |   })
  170 | 
  171 |   test('Lending ボタンが /rentals/new へ遷移する', async ({ page }) => {
  172 |     await page.goto('/')
  173 |     await page.waitForLoadState('networkidle')
  174 | 
  175 |     const lendingButton = page.getByRole('main').getByRole('link', { name: 'Lending' })
  176 |     await expect(lendingButton).toBeVisible()
  177 |     await lendingButton.click()
  178 |     await page.waitForLoadState('networkidle')
  179 |     await expect(page).toHaveURL('/rentals/new')
  180 |     await expect(page.getByText('New Lending')).toBeVisible()
  181 |   })
  182 | 
  183 |   test('View All リンクが /history へ遷移する', async ({ page }) => {
  184 |     await page.goto('/')
  185 |     await page.waitForLoadState('networkidle')
  186 | 
  187 |     const viewAll = page.getByRole('link', { name: 'View All' })
  188 |     await expect(viewAll).toBeVisible()
  189 |     await viewAll.click()
  190 |     await page.waitForLoadState('networkidle')
  191 |     await expect(page).toHaveURL('/history')
  192 |   })
  193 | })
  194 | 
  195 | // ============================================================
  196 | // 2. Vehicle List Tests
  197 | // ============================================================
  198 | test.describe('Vehicle List', () => {
  199 |   test('車両一覧テーブルが正しく表示される', async ({ page }) => {
  200 |     await page.goto('/vehicles')
  201 |     await page.waitForLoadState('networkidle')
  202 |     await waitForLoadingComplete(page)
  203 | 
  204 |     // テーブルヘッダーが存在する
  205 |     await expect(page.getByRole('columnheader', { name: 'Vehicle Name' })).toBeVisible()
  206 |     await expect(page.getByRole('columnheader', { name: 'Vehicle ID' })).toBeVisible()
  207 |     await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
  208 |     await expect(page.getByRole('columnheader', { name: 'Last Updated' })).toBeVisible()
  209 | 
  210 |     // 車両行が1件以上存在する
  211 |     const rows = page.locator('tbody tr')
  212 |     const count = await rows.count()
  213 |     expect(count).toBeGreaterThan(0)
  214 |   })
  215 | 
  216 |   test('検索フィルタが機能する', async ({ page }) => {
  217 |     await page.goto('/vehicles')
  218 |     await page.waitForLoadState('networkidle')
  219 |     await waitForLoadingComplete(page)
```