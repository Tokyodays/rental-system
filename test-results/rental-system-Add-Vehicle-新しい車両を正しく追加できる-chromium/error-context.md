# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rental-system.spec.ts >> Add Vehicle >> 新しい車両を正しく追加できる
- Location: e2e/rental-system.spec.ts:168:3

# Error details

```
Error: locator.click: Test ended.
Call log:
  - waiting for getByRole('button', { name: 'Add Vehicle' })

```

# Test source

```ts
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
  167 | test.describe('Add Vehicle', () => {
  168 |   test('新しい車両を正しく追加できる', async ({ page }) => {
  169 |     await page.goto('/vehicles')
  170 |     await waitForPageLoad(page)
  171 |     await waitForLoadingComplete(page)
  172 | 
  173 |     // Add Vehicle ボタンをクリック
> 174 |     await page.getByRole('button', { name: 'Add Vehicle' }).click()
      |                                                             ^ Error: locator.click: Test ended.
  175 | 
  176 |     // モーダルが表示される
  177 |     await expect(page.getByText('Register New Vehicle')).toBeVisible()
  178 | 
  179 |     // フォームに入力
  180 |     const testName = `E2E Test Vehicle ${Date.now()}`
  181 |     await page.getByPlaceholder('e.g. Honda PCX 150').fill(testName)
  182 | 
  183 |     // カテゴリ選択（Bikeがデフォルト）
  184 |     // Save
  185 |     await page.getByRole('button', { name: 'Save Vehicle' }).click()
  186 | 
  187 |     // モーダルが閉じてリストが更新される
  188 |     await waitForLoadingComplete(page)
  189 |     await page.waitForTimeout(2000)
  190 | 
  191 |     // 追加した車両がテーブルに含まれる
  192 |     await expect(page.getByText(testName)).toBeVisible()
  193 |   })
  194 | })
  195 | 
  196 | // ============================================================
  197 | // 4. Lending Flow Test
  198 | // ============================================================
  199 | test.describe('Lending Flow', () => {
  200 |   test('任意のユーザーが任意の車両を正しくレンタルでき、正常に完了する', async ({ page }) => {
  201 |     await page.goto('/rentals/new')
  202 |     await waitForPageLoad(page)
  203 |     await waitForLoadingComplete(page)
  204 | 
  205 |     // Step 1: Customer Selection
  206 |     await expect(page.getByText('Step 1: Select Customer')).toBeVisible()
  207 | 
  208 |     // 最初の顧客カードをクリック
  209 |     const customerCards = page.locator('[class*="cursor-pointer"]').filter({ hasText: /\S+/ }).locator('visible=true')
  210 |     const firstCustomerCard = page.locator('.space-y-4 .grid .cursor-pointer').first()
  211 |     await firstCustomerCard.click()
  212 | 
  213 |     // Step 2: Select Vehicle
  214 |     await expect(page.getByText('Step 2: Select Vehicle')).toBeVisible({ timeout: 10_000 })
  215 | 
  216 |     // Available vehicles リストから選択
  217 |     await waitForLoadingComplete(page)
  218 |     await page.waitForTimeout(1000)
  219 |     
  220 |     const vehicleCards = page.locator('.space-y-4 .grid .cursor-pointer')
  221 |     const vehicleCount = await vehicleCards.count()
  222 |     
  223 |     if (vehicleCount > 0) {
  224 |       // リストから最初の車両を選択
  225 |       await vehicleCards.first().click()
  226 |     } else {
  227 |       // リストに車両がない場合はQRスキャンシミュレーション
  228 |       await page.getByRole('button', { name: 'Simulate QR Scan' }).click()
  229 |       await page.waitForTimeout(2000)
  230 |     }
  231 | 
  232 |     // Step 3: Return Schedule
  233 |     await expect(page.getByText('Step 3: Return Schedule')).toBeVisible({ timeout: 10_000 })
  234 | 
  235 |     // 返却日は翌日がデフォルト — そのまま進む
  236 |     await page.getByRole('button', { name: 'Continue to Price Input' }).click()
  237 | 
  238 |     // Step 4: Payment Amount
  239 |     await expect(page.getByText('Step 4: Payment Amount')).toBeVisible()
  240 |     
  241 |     // 価格を入力
  242 |     const priceInput = page.locator('input[type="number"]')
  243 |     await priceInput.fill('1000')
  244 |     
  245 |     await page.getByRole('button', { name: 'Continue to Confirmation' }).click()
  246 | 
  247 |     // Step 5: Confirm
  248 |     await expect(page.getByText('Step 5: Confirm Transaction')).toBeVisible()
  249 | 
  250 |     // Start Lending Now
  251 |     await page.getByRole('button', { name: 'Start Lending Now' }).click()
  252 | 
  253 |     // 成功時にダッシュボードへリダイレクト
  254 |     await expect(page).toHaveURL('/', { timeout: 15_000 })
  255 |   })
  256 | })
  257 | 
  258 | // ============================================================
  259 | // 5. Return Flow Test
  260 | // ============================================================
  261 | test.describe('Return Flow', () => {
  262 |   test('任意のレンタル中車両を正しく返却でき、正常に完了する', async ({ page }) => {
  263 |     await page.goto('/rentals/return')
  264 |     await waitForPageLoad(page)
  265 |     await waitForLoadingComplete(page)
  266 | 
  267 |     // Step 1: Identify Vehicle
  268 |     await expect(page.getByText('Step 1: Identify Vehicle')).toBeVisible()
  269 | 
  270 |     // Lent vehicles リストから選択
  271 |     await page.waitForTimeout(1000)
  272 |     const lentVehicleCards = page.locator('.space-y-4 .grid .cursor-pointer')
  273 |     const lentCount = await lentVehicleCards.count()
  274 | 
```