# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rental-system.spec.ts >> History >> 検索フィルタが機能する
- Location: e2e/rental-system.spec.ts:484:3

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "honda"
Received string:    " no transactions found. "
```

# Page snapshot

```yaml
- generic [ref=e1]:
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
          - heading "Transaction History" [level=2] [ref=e31]
          - generic [ref=e33] [cursor=pointer]:
            - generic [ref=e34]: developer
            - img "Avatar" [ref=e36]
        - main [ref=e37]:
          - generic [ref=e38]:
            - generic [ref=e39]:
              - generic [ref=e40]:
                - textbox "Search items or users..." [active] [ref=e42]: Honda
                - generic [ref=e45]:
                  - generic [ref=e46]: "Month:"
                  - combobox [ref=e47]:
                    - generic: 2026-04
              - button "Export" [ref=e50] [cursor=pointer]:
                - generic [ref=e52]: Export
            - table [ref=e55]:
              - rowgroup [ref=e56]:
                - row "ID Item User Lending Time Returned Time Duration Price" [ref=e57]:
                  - columnheader "ID" [ref=e58]
                  - columnheader "Item" [ref=e59]
                  - columnheader "User" [ref=e60]
                  - columnheader "Lending Time" [ref=e61]
                  - columnheader "Returned Time" [ref=e62]
                  - columnheader "Duration" [ref=e63]
                  - columnheader "Price" [ref=e64]
              - rowgroup [ref=e65]:
                - row "No transactions found." [ref=e66]:
                  - cell "No transactions found." [ref=e67]
            - generic [ref=e69]:
              - generic [ref=e70]:
                - generic [ref=e71]: Total Transactions
                - generic [ref=e72]: "0"
              - generic [ref=e74]:
                - generic [ref=e75]: Total Amount
                - generic [ref=e76]: ₭ 0
  - generic:
    - img
  - generic [ref=e77]:
    - button "Toggle Nuxt DevTools" [ref=e78] [cursor=pointer]:
      - img [ref=e79]
    - generic "Page load time" [ref=e82]:
      - generic [ref=e83]: "47"
      - generic [ref=e84]: ms
    - button "Toggle Component Inspector" [ref=e86] [cursor=pointer]:
      - img [ref=e87]
  - region "Notifications (F8)":
    - list
```

# Test source

```ts
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
  477 |     await expect(page.getByRole('columnheader', { name: 'Price' })).toBeVisible()
  478 | 
  479 |     // Total Transactions/Total Amount フッターが表示される
  480 |     await expect(page.getByText('Total Transactions')).toBeVisible()
  481 |     await expect(page.getByText('Total Amount')).toBeVisible()
  482 |   })
  483 | 
  484 |   test('検索フィルタが機能する', async ({ page }) => {
  485 |     await page.goto('/history')
  486 |     await page.waitForLoadState('networkidle')
  487 |     await waitForLoadingComplete(page)
  488 | 
  489 |     const searchInput = page.getByPlaceholder('Search items or users...')
  490 |     await expect(searchInput).toBeVisible()
  491 |     await searchInput.fill('Honda')
  492 |     await page.waitForTimeout(500)
  493 | 
  494 |     const rows = page.locator('tbody tr')
  495 |     const count = await rows.count()
  496 |     if (count > 0) {
  497 |       for (let i = 0; i < Math.min(count, 3); i++) {
  498 |         const text = await rows.nth(i).textContent()
> 499 |         expect(text?.toLowerCase()).toContain('honda')
      |                                     ^ Error: expect(received).toContain(expected) // indexOf
  500 |       }
  501 |     }
  502 |   })
  503 | 
  504 |   test('Export モーダルが表示される', async ({ page }) => {
  505 |     await page.goto('/history')
  506 |     await page.waitForLoadState('networkidle')
  507 |     await waitForLoadingComplete(page)
  508 | 
  509 |     await page.getByRole('button', { name: 'Export' }).click()
  510 |     await expect(page.getByText('Export Transactions')).toBeVisible()
  511 |     await expect(page.getByText('Start Date')).toBeVisible()
  512 |     await expect(page.getByText('End Date')).toBeVisible()
  513 |     await expect(page.getByRole('button', { name: 'Download CSV' })).toBeVisible()
  514 |   })
  515 | })
  516 | 
  517 | // ============================================================
  518 | // 8. Navigation & Layout Tests
  519 | // ============================================================
  520 | test.describe('Navigation & Layout', () => {
  521 |   test('サイドバーのナビゲーションリンクが正しく機能する', async ({ page }) => {
  522 |     await page.goto('/')
  523 |     await page.waitForLoadState('networkidle')
  524 | 
  525 |     // Vehicles リンク
  526 |     const vehiclesLink = page.locator('a[href="/vehicles"]')
  527 |     if (await vehiclesLink.isVisible()) {
  528 |       await vehiclesLink.click()
  529 |       await page.waitForLoadState('networkidle')
  530 |       await expect(page).toHaveURL('/vehicles')
  531 |     }
  532 | 
  533 |     // Customers リンク
  534 |     const customersLink = page.locator('a[href="/customers"]')
  535 |     if (await customersLink.isVisible()) {
  536 |       await customersLink.click()
  537 |       await page.waitForLoadState('networkidle')
  538 |       await expect(page).toHaveURL('/customers')
  539 |     }
  540 | 
  541 |     // History リンク
  542 |     const historyLink = page.locator('a[href="/history"]')
  543 |     if (await historyLink.isVisible()) {
  544 |       await historyLink.click()
  545 |       await page.waitForLoadState('networkidle')
  546 |       await expect(page).toHaveURL('/history')
  547 |     }
  548 |   })
  549 | 
  550 |   test('Return Vehicle ページが正しく表示される', async ({ page }) => {
  551 |     await page.goto('/rentals/return')
  552 |     await page.waitForLoadState('networkidle')
  553 |     await waitForLoadingComplete(page)
  554 | 
  555 |     await expect(page.getByText('Return Vehicle')).toBeVisible()
  556 |     await expect(page.getByText('Step 1: Identify Vehicle')).toBeVisible()
  557 |     await expect(page.getByText('Currently Lent Vehicles')).toBeVisible()
  558 |   })
  559 | })
  560 | 
  561 | // ============================================================
  562 | // 9. Error Handling & Edge Cases
  563 | // ============================================================
  564 | test.describe('Error Handling & Edge Cases', () => {
  565 |   test('Vehicle手動入力で無効なIDを入力するとエラーになる', async ({ page }) => {
  566 |     await page.goto('/rentals/new')
  567 |     await page.waitForLoadState('networkidle')
  568 |     await waitForLoadingComplete(page)
  569 | 
  570 |     // Step 1で顧客を選択
  571 |     const customerCard = page.locator('.grid .cursor-pointer').first()
  572 |     await expect(customerCard).toBeVisible({ timeout: 10_000 })
  573 |     await customerCard.click()
  574 | 
  575 |     // Step 2で無効なIDを入力
  576 |     await expect(page.getByText('Step 2')).toBeVisible({ timeout: 10_000 })
  577 |     const manualInput = page.getByPlaceholder('e.g. B-HONDA-001')
  578 |     await manualInput.fill('INVALID-CODE-999')
  579 |     await page.getByRole('button', { name: 'Identify Vehicle' }).click()
  580 |     await page.waitForTimeout(2000)
  581 | 
  582 |     // Step 2のままである
  583 |     await expect(page.getByText('Step 2')).toBeVisible()
  584 |   })
  585 | 
  586 |   test('Return画面で無効なVehicle IDはエラーになる', async ({ page }) => {
  587 |     await page.goto('/rentals/return')
  588 |     await page.waitForLoadState('networkidle')
  589 |     await waitForLoadingComplete(page)
  590 | 
  591 |     const manualInput = page.getByPlaceholder('e.g. B-HONDA-001')
  592 |     await manualInput.fill('INVALID-CODE-999')
  593 |     await page.getByRole('button', { name: 'Fetch Lending Info' }).click()
  594 |     await page.waitForTimeout(2000)
  595 | 
  596 |     // Step 1のままである
  597 |     await expect(page.getByText('Step 1: Identify Vehicle')).toBeVisible()
  598 |   })
  599 | 
```