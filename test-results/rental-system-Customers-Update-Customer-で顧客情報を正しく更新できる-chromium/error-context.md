# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rental-system.spec.ts >> Customers >> Update Customer で顧客情報を正しく更新できる
- Location: e2e/rental-system.spec.ts:365:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Update Customer')
Expected: visible
Error: strict mode violation: getByText('Update Customer') resolved to 2 elements:
    1) <h2 data-slot="title" id="reka-dialog-title-v-0-2" class="text-highlighted font-semibold">Update Customer</h2> aka getByRole('heading', { name: 'Update Customer' })
    2) <span class="truncate" data-slot="label">Update Customer</span> aka getByRole('button', { name: 'Update Customer' })

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Update Customer')

```

# Page snapshot

```yaml
- generic:
  - generic:
    - generic:
      - status
    - generic:
      - complementary:
        - generic:
          - generic:
            - heading [level=1]: Rental System
            - paragraph: Vehicle Management
        - navigation:
          - link:
            - /url: /
            - text: Dashboard
          - link:
            - /url: /vehicles
            - text: Vehicle List
          - link:
            - /url: /rentals/new
            - text: Lending
          - link:
            - /url: /rentals/return
            - text: Return
          - link:
            - /url: /customers
            - text: Customers
          - link:
            - /url: /history
            - text: History
        - generic:
          - link:
            - /url: /settings
            - text: Settings
      - generic:
        - banner:
          - generic:
            - heading [level=2]: Customer Management
          - generic:
            - generic:
              - generic: developer
              - generic:
                - img
        - main:
          - generic:
            - generic:
              - generic:
                - generic:
                  - textbox:
                    - /placeholder: Search customers...
              - generic:
                - generic: Status
                - generic:
                  - button: All Statuses
                  - button: Active
                  - button: Unactive
                  - button: Renting
              - button:
                - generic: Add New Customer
            - generic:
              - generic:
                - generic:
                  - table:
                    - rowgroup:
                      - row:
                        - columnheader: Name
                        - columnheader: Contact
                        - columnheader: Docs
                        - columnheader: Status
                        - columnheader: Actions
                    - rowgroup:
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - generic: CW
                            - generic: Cameron Williamson
                        - cell:
                          - generic: cameron.w@example.com
                          - generic: +81-80-5555-6666
                        - cell
                        - cell:
                          - generic:
                            - generic: Active
                        - cell:
                          - generic:
                            - button
                            - button
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - generic: t
                            - generic: test2
                        - cell:
                          - generic: aaa@nex.net
                          - generic: "0909"
                        - cell
                        - cell:
                          - generic:
                            - generic: Active
                        - cell:
                          - generic:
                            - button
                            - button
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - generic: HS
                            - generic: Hanako Sato
                        - cell:
                          - generic: hanako.sato@example.com
                          - generic: +81-80-2222-2222
                        - cell
                        - cell:
                          - generic:
                            - generic: Active
                        - cell:
                          - generic:
                            - button
                            - button
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - generic: LA
                            - generic: Leslie Alexander
                        - cell:
                          - generic: leslie.a@example.com
                          - generic: +81-80-4444-5555
                        - cell
                        - cell:
                          - generic:
                            - generic: Active
                        - cell:
                          - generic:
                            - button
                            - button
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - generic: GH
                            - generic: Guy Hawkins
                        - cell:
                          - generic: guy.h@example.com
                          - generic: +81-70-8888-9999
                        - cell
                        - cell:
                          - generic:
                            - generic: Active
                        - cell:
                          - generic:
                            - button
                            - button
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - generic: RF
                            - generic: Robert Fox
                        - cell:
                          - generic: robert.f@example.com
                          - generic: +81-90-7777-8888
                        - cell
                        - cell:
                          - generic:
                            - generic: Active
                        - cell:
                          - generic:
                            - button
                            - button
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - generic: KW
                            - generic: Kristin Watson
                        - cell:
                          - generic: kristin.w@example.com
                          - generic: +81-80-3333-4444
                        - cell
                        - cell:
                          - generic:
                            - generic: Active
                        - cell:
                          - generic:
                            - button
                            - button
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - generic: DR
                            - generic: Darlene Robertson
                        - cell:
                          - generic: darlene.r@example.com
                          - generic: +81-70-6666-7777
                        - cell
                        - cell:
                          - generic:
                            - generic: Active
                        - cell:
                          - generic:
                            - button
                            - button
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - generic: TY
                            - generic: Taro Yamada
                        - cell:
                          - generic: taro.yamada@example.com
                          - generic: +81-90-1111-1111
                        - cell
                        - cell:
                          - generic:
                            - generic: Active
                        - cell:
                          - generic:
                            - button
                            - button
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - generic: KS
                            - generic: Kenji Suzuki
                        - cell:
                          - generic: kenji.suzuki@example.com
                          - generic: +81-70-3333-3333
                        - cell
                        - cell:
                          - generic:
                            - generic: Active
                        - cell:
                          - generic:
                            - button
                            - button
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - generic: JC
                            - generic: Jane Cooper
                        - cell:
                          - generic: jane.cooper@example.com
                          - generic: +81-90-1234-5678
                        - cell
                        - cell:
                          - generic:
                            - generic: Active
                        - cell:
                          - generic:
                            - button
                            - button
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - generic: TT
                            - generic: Takeshi Tanaka
                        - cell:
                          - generic: takeshi.tanaka@example.com
                          - generic: +81-80-5555-5555
                        - cell
                        - cell:
                          - generic:
                            - generic: Active
                        - cell:
                          - generic:
                            - button
                            - button
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - generic: KI
                            - generic: Kumiko Ito
                        - cell:
                          - generic: kumiko.ito@example.com
                          - generic: +81-70-6666-6666
                        - cell
                        - cell:
                          - generic:
                            - generic: Active
                        - cell:
                          - generic:
                            - button
                            - button
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - generic: HW
                            - generic: Hiroshi Watanabe
                        - cell:
                          - generic: hiroshi.watanabe@example.com
                          - generic: +81-90-7777-7777
                        - cell
                        - cell:
                          - generic:
                            - generic: Active
                        - cell:
                          - generic:
                            - button
                            - button
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - generic: SK
                            - generic: Sakura Kobayashi
                        - cell:
                          - generic: sakura.kobayashi@example.com
                          - generic: +81-80-8888-8888
                        - cell
                        - cell:
                          - generic:
                            - generic: Active
                        - cell:
                          - generic:
                            - button
                            - button
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - generic: RK
                            - generic: Ryo Kato
                        - cell:
                          - generic: ryo.kato@example.com
                          - generic: +81-70-9999-9999
                        - cell
                        - cell:
                          - generic:
                            - generic: Active
                        - cell:
                          - generic:
                            - button
                            - button
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - generic: YY
                            - generic: Yuki Yoshida
                        - cell:
                          - generic: yuki.yoshida@example.com
                          - generic: +81-90-0000-0000
                        - cell
                        - cell:
                          - generic:
                            - generic: Active
                        - cell:
                          - generic:
                            - button
                            - button
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - generic: YT
                            - generic: Yumi Takahashi
                        - cell:
                          - generic: yumi.takahashi@example.com
                          - generic: +81-90-4444-4444
                        - cell
                        - cell:
                          - generic:
                            - generic: Active
                        - cell:
                          - generic:
                            - button
                            - button
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - generic: CF
                            - generic: Cody Fisher
                        - cell:
                          - generic: cody.fisher@example.com
                          - generic: +81-80-9876-5432
                        - cell
                        - cell:
                          - generic:
                            - generic: Active
                        - cell:
                          - generic:
                            - button
                            - button
                      - row:
                        - cell:
                          - generic:
                            - generic:
                              - generic: EH
                            - generic: Esther Howard
                        - cell:
                          - generic: esther.howard@example.com
                          - generic: +81-70-1111-2222
                        - cell
                        - cell:
                          - generic:
                            - generic: Active
                        - cell:
                          - generic:
                            - button
                            - button
              - generic:
                - generic:
                  - paragraph: Showing 1 to 20 of 20 results
                  - generic:
                    - button [disabled]
                    - button [disabled]
  - generic:
    - img
  - generic [ref=e1]:
    - button [ref=e2] [cursor=pointer]:
      - img [ref=e3]
    - generic [ref=e6]:
      - generic [ref=e7]: "44"
      - generic [ref=e8]: ms
    - button [ref=e10] [cursor=pointer]:
      - img [ref=e11]
  - dialog "Update Customer" [ref=e16]:
    - generic [ref=e17]:
      - generic [ref=e18]:
        - heading "Update Customer" [level=2] [ref=e19]
        - paragraph [ref=e20]: Update the information for this customer.
      - button "Close" [active] [ref=e21]
    - generic [ref=e24]:
      - generic [ref=e25]:
        - generic [ref=e28]: Full Name*
        - textbox "Full Name*" [ref=e31]:
          - /placeholder: e.g. John Doe
          - text: Cameron Williamson
      - generic [ref=e32]:
        - generic [ref=e35]: Email Address
        - textbox "Email Address" [ref=e38]:
          - /placeholder: john@example.com
          - text: cameron.w@example.com
      - generic [ref=e39]:
        - generic [ref=e42]: Phone Number
        - textbox "Phone Number" [ref=e45]:
          - /placeholder: +81-XXX-XXXX-XXXX
          - text: +81-80-5555-6666
      - generic [ref=e46]:
        - generic [ref=e47]:
          - generic [ref=e49]: Status
          - paragraph [ref=e50]: Select the customer status.
        - radiogroup [ref=e52]:
          - group [ref=e53]:
            - generic [ref=e54]:
              - radio "Active" [checked] [ref=e56]
              - generic [ref=e59]: Active
            - generic [ref=e60]:
              - radio "Unactive" [ref=e62]
              - generic [ref=e64]: Unactive
          - textbox [ref=e65]: d2a92bb4-9f32-4364-b352-e5a82c7c8c86
      - generic [ref=e66]:
        - button "Cancel" [ref=e67] [cursor=pointer]:
          - generic [ref=e68]: Cancel
        - button "Update Customer" [ref=e69] [cursor=pointer]:
          - generic [ref=e70]: Update Customer
```

# Test source

```ts
  276 |     }
  277 | 
  278 |     // Step 3: Return Schedule
  279 |     await expect(page.getByText('Step 3: Return Schedule')).toBeVisible({ timeout: 10_000 })
  280 | 
  281 |     // 返却日は翌日がデフォルト — そのまま進む
  282 |     await page.getByRole('button', { name: 'Continue to Price Input' }).click()
  283 | 
  284 |     // Step 4: Payment Amount
  285 |     await expect(page.getByText('Step 4: Payment Amount')).toBeVisible()
  286 | 
  287 |     // 価格を入力
  288 |     const priceInput = page.locator('input[type="number"]')
  289 |     await priceInput.fill('1000')
  290 | 
  291 |     await page.getByRole('button', { name: 'Continue to Confirmation' }).click()
  292 | 
  293 |     // Step 5: Confirm
  294 |     await expect(page.getByText('Step 5: Confirm Transaction')).toBeVisible()
  295 | 
  296 |     // Start Lending Now
  297 |     await page.getByRole('button', { name: 'Start Lending Now' }).click()
  298 | 
  299 |     // 成功時にダッシュボードへリダイレクト
  300 |     await expect(page).toHaveURL('/', { timeout: 15_000 })
  301 |   })
  302 | })
  303 | 
  304 | // ============================================================
  305 | // 5. Return Flow Test
  306 | // ============================================================
  307 | test.describe('Return Flow', () => {
  308 |   test('任意のレンタル中車両を正しく返却でき、正常に完了する', async ({ page }) => {
  309 |     await page.goto('/rentals/return')
  310 |     await page.waitForLoadState('networkidle')
  311 |     await waitForLoadingComplete(page)
  312 | 
  313 |     // Step 1: Identify Vehicle
  314 |     await expect(page.getByText('Step 1: Identify Vehicle')).toBeVisible()
  315 | 
  316 |     // Lent vehicles リストから選択
  317 |     await page.waitForTimeout(1500)
  318 |     const lentVehicleCards = page.locator('.space-y-4 .grid .cursor-pointer')
  319 |     const lentCount = await lentVehicleCards.count()
  320 | 
  321 |     if (lentCount > 0) {
  322 |       await lentVehicleCards.first().click()
  323 |     } else {
  324 |       // QRスキャンシミュレーション
  325 |       await page.getByRole('button', { name: 'Simulate QR Scan' }).click()
  326 |       await page.waitForTimeout(3000)
  327 |     }
  328 | 
  329 |     // Step 2: Check Return Details
  330 |     await expect(page.getByText('Step 2: Check Return Details')).toBeVisible({ timeout: 10_000 })
  331 | 
  332 |     // サマリー情報が表示される
  333 |     await expect(page.getByText('Summary')).toBeVisible()
  334 |     await expect(page.getByText('Schedule Status')).toBeVisible()
  335 | 
  336 |     // Complete Return
  337 |     await page.getByRole('button', { name: 'Complete Return Process' }).click()
  338 | 
  339 |     // 成功時にダッシュボードへリダイレクト
  340 |     await expect(page).toHaveURL('/', { timeout: 15_000 })
  341 |   })
  342 | })
  343 | 
  344 | // ============================================================
  345 | // 6. Customers Tests
  346 | // ============================================================
  347 | test.describe('Customers', () => {
  348 |   test('顧客一覧が正しく表示される', async ({ page }) => {
  349 |     await page.goto('/customers')
  350 |     await page.waitForLoadState('networkidle')
  351 |     await waitForLoadingComplete(page)
  352 | 
  353 |     // テーブルヘッダーが存在する
  354 |     await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible()
  355 |     await expect(page.getByRole('columnheader', { name: 'Contact' })).toBeVisible()
  356 |     await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
  357 |     await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible()
  358 | 
  359 |     // 顧客行が1件以上存在する
  360 |     const rows = page.locator('tbody tr')
  361 |     const count = await rows.count()
  362 |     expect(count).toBeGreaterThan(0)
  363 |   })
  364 | 
  365 |   test('Update Customer で顧客情報を正しく更新できる', async ({ page }) => {
  366 |     await page.goto('/customers')
  367 |     await page.waitForLoadState('networkidle')
  368 |     await waitForLoadingComplete(page)
  369 | 
  370 |     // 最初の顧客の編集ボタン（pencilアイコン）をクリック
  371 |     const editButton = page.locator('tbody tr').first().locator('button').first()
  372 |     await expect(editButton).toBeVisible()
  373 |     await editButton.click()
  374 | 
  375 |     // Update モーダルが表示される
> 376 |     await expect(page.getByText('Update Customer')).toBeVisible()
      |                                                     ^ Error: expect(locator).toBeVisible() failed
  377 | 
  378 |     // 名前を取得して更新
  379 |     const fullNameInput = page.getByPlaceholder('e.g. John Doe').first()
  380 |     const currentName = await fullNameInput.inputValue()
  381 |     const updatedName = `${currentName} Updated`
  382 |     await fullNameInput.fill(updatedName)
  383 | 
  384 |     // Update ボタンをクリック
  385 |     await page.getByRole('button', { name: 'Update Customer' }).click()
  386 | 
  387 |     // リストが更新される
  388 |     await page.waitForTimeout(2000)
  389 |     await waitForLoadingComplete(page)
  390 | 
  391 |     // 更新された名前がテーブルに表示される
  392 |     await expect(page.getByText(updatedName)).toBeVisible({ timeout: 10_000 })
  393 | 
  394 |     // 元に戻す（クリーンアップ）
  395 |     const editBtn2 = page.locator('tbody tr').first().locator('button').first()
  396 |     await editBtn2.click()
  397 |     await page.waitForTimeout(1000)
  398 |     const nameField = page.getByPlaceholder('e.g. John Doe').first()
  399 |     await nameField.fill(currentName)
  400 |     await page.getByRole('button', { name: 'Update Customer' }).click()
  401 |     await page.waitForTimeout(1000)
  402 |   })
  403 | 
  404 |   test('Add New Customer で新規顧客を追加できる', async ({ page }) => {
  405 |     await page.goto('/customers')
  406 |     await page.waitForLoadState('networkidle')
  407 |     await waitForLoadingComplete(page)
  408 | 
  409 |     // Add New Customer ボタンをクリック
  410 |     await page.getByRole('button', { name: 'Add New Customer' }).click()
  411 | 
  412 |     // モーダルが表示される
  413 |     await expect(page.getByText('Add New Customer')).toBeVisible()
  414 | 
  415 |     // フォームに入力
  416 |     const testName = `E2E Test Customer ${Date.now()}`
  417 |     await page.getByPlaceholder('e.g. John Doe').fill(testName)
  418 |     await page.getByPlaceholder('john@example.com').fill('e2e-test@example.com')
  419 |     await page.getByPlaceholder('+81-XXX-XXXX-XXXX').fill('+81-90-1234-5678')
  420 | 
  421 |     // Register
  422 |     await page.getByRole('button', { name: 'Register Customer' }).click()
  423 | 
  424 |     // 追加された顧客がリストに表示される
  425 |     await page.waitForTimeout(2000)
  426 |     await waitForLoadingComplete(page)
  427 |     await expect(page.getByText(testName)).toBeVisible({ timeout: 10_000 })
  428 |   })
  429 | 
  430 |   test('顧客を削除できる', async ({ page }) => {
  431 |     await page.goto('/customers')
  432 |     await page.waitForLoadState('networkidle')
  433 |     await waitForLoadingComplete(page)
  434 | 
  435 |     // まず顧客数を取得
  436 |     const rows = page.locator('tbody tr')
  437 |     const initialCount = await rows.count()
  438 |     expect(initialCount).toBeGreaterThan(0)
  439 | 
  440 |     // 最初の行のゴミ箱ボタンをクリック
  441 |     const deleteButton = rows.first().locator('button').last()
  442 |     await deleteButton.click()
  443 | 
  444 |     // 確認モーダルが表示される
  445 |     await expect(page.getByText('Delete Customer')).toBeVisible()
  446 |     await expect(page.getByText('Are you sure you want to delete this customer')).toBeVisible()
  447 | 
  448 |     // Delete を実行
  449 |     await page.getByRole('button', { name: 'Delete' }).click()
  450 | 
  451 |     // リストが更新される
  452 |     await page.waitForTimeout(2000)
  453 |     await waitForLoadingComplete(page)
  454 | 
  455 |     // 顧客数が1減っている
  456 |     const finalCount = await rows.count()
  457 |     expect(finalCount).toBe(initialCount - 1)
  458 |   })
  459 | })
  460 | 
  461 | // ============================================================
  462 | // 7. History Tests
  463 | // ============================================================
  464 | test.describe('History', () => {
  465 |   test('取引履歴一覧が正しく表示される', async ({ page }) => {
  466 |     await page.goto('/history')
  467 |     await page.waitForLoadState('networkidle')
  468 |     await waitForLoadingComplete(page)
  469 | 
  470 |     // テーブルヘッダーが存在する
  471 |     await expect(page.getByRole('columnheader', { name: 'ID' })).toBeVisible()
  472 |     await expect(page.getByRole('columnheader', { name: 'Item' })).toBeVisible()
  473 |     await expect(page.getByRole('columnheader', { name: 'User' })).toBeVisible()
  474 |     await expect(page.getByRole('columnheader', { name: 'Lending Time' })).toBeVisible()
  475 |     await expect(page.getByRole('columnheader', { name: 'Returned Time' })).toBeVisible()
  476 |     await expect(page.getByRole('columnheader', { name: 'Duration' })).toBeVisible()
```