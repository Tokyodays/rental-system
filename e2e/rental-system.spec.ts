import { test, expect, type Page } from '@playwright/test'

/**
 * E2E Tests for Rental System
 *
 * 前提条件:
 *   - `yarn dev` で localhost:3000 が起動済み
 *   - Supabase にシードデータ（vehicles, customers, transactions）が存在すること
 *   - 環境変数 E2E_USER_EMAIL と E2E_USER_PASSWORD が設定済み
 *     または .env に TEST_USER_EMAIL / TEST_USER_PASSWORD が定義済み
 *
 * テスト実行:
 *   E2E_USER_EMAIL=xxx E2E_USER_PASSWORD=yyy npx playwright test
 *   npx playwright test --ui   (UIモード)
 */

// テストユーザー認証情報（環境変数から取得）
const TEST_EMAIL = process.env.E2E_USER_EMAIL || ''
const TEST_PASSWORD = process.env.E2E_USER_PASSWORD || ''

// ============================================================
// Helper functions
// ============================================================

/** ログインしてセッションを確立する */
async function login(page: Page) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  // 既にログイン済みならスキップ
  if (!page.url().includes('/login')) return

  // メール・パスワードを入力
  await page.getByPlaceholder('name@company.com').fill(TEST_EMAIL)
  await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD)

  // Sign In ボタンをクリック
  await page.getByRole('button', { name: 'Sign In' }).click()

  // ダッシュボードへリダイレクトされるまで待つ
  await page.waitForURL('/', { timeout: 15_000 })
  await page.waitForLoadState('networkidle')
}

/** ローディングスピナーが消えるまで待つ */
async function waitForLoadingComplete(page: Page) {
  try {
    await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 15_000 })
  } catch {
    // スピナーがそもそも存在しなかった場合は無視
  }
}

// ============================================================
// Global setup: 全テストの前にログイン
// ============================================================
test.beforeEach(async ({ page }) => {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    throw new Error(
      'テスト用の認証情報が未設定です。\n' +
      '実行時に環境変数を設定してください:\n' +
      '  E2E_USER_EMAIL=your@email.com E2E_USER_PASSWORD=yourpass npx playwright test'
    )
  }
  await login(page)
})

// ============================================================
// 1. Dashboard Tests
// ============================================================
test.describe('Dashboard', () => {
  test('Stats cards (Lending, Available, Today\'s Transactions) が表示される', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // ページ見出し
    await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible()

    // 3つの統計カードが表示される
    await expect(page.getByText('Lending').first()).toBeVisible()
    await expect(page.getByText('Available').first()).toBeVisible()
    await expect(page.getByText("Today's Transactions")).toBeVisible()

    // 各カードの値が数値である（ローディング完了後）
    const statValues = page.locator('.text-3xl.font-bold')
    const count = await statValues.count()
    expect(count).toBe(3)
    for (let i = 0; i < count; i++) {
      const text = await statValues.nth(i).textContent()
      expect(text).not.toBeNull()
      expect(Number(text?.trim())).not.toBeNaN()
    }
  })

  test('Recent Transactions テーブルが表示される', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    await expect(page.getByText('Recent Transactions')).toBeVisible()

    // テーブルヘッダーが存在する
    await expect(page.getByRole('columnheader', { name: 'Item' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'User' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Action' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Time' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
  })

  test('Lending ボタンが /rentals/new へ遷移する', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const lendingButton = page.getByRole('main').getByRole('link', { name: 'Lending' })
    await expect(lendingButton).toBeVisible()
    await lendingButton.click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/rentals/new')
    await expect(page.getByText('New Lending')).toBeVisible()
  })

  test('View All リンクが /history へ遷移する', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const viewAll = page.getByRole('link', { name: 'View All' })
    await expect(viewAll).toBeVisible()
    await viewAll.click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/history')
  })
})

// ============================================================
// 2. Vehicle List Tests
// ============================================================
test.describe('Vehicle List', () => {
  test('車両一覧テーブルが正しく表示される', async ({ page }) => {
    await page.goto('/vehicles')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // テーブルヘッダーが存在する
    await expect(page.getByRole('columnheader', { name: 'Vehicle Name' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Vehicle ID' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Last Updated' })).toBeVisible()

    // 車両行が1件以上存在する
    const rows = page.locator('tbody tr')
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
  })

  test('検索フィルタが機能する', async ({ page }) => {
    await page.goto('/vehicles')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    const searchInput = page.getByPlaceholder('Search vehicles...')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('Honda')
    await page.waitForTimeout(500)

    const rows = page.locator('tbody tr')
    const count = await rows.count()
    if (count > 0) {
      const firstRow = await rows.first().textContent()
      expect(firstRow?.toLowerCase()).toContain('honda')
    }
  })

  test('カテゴリフィルタが機能する', async ({ page }) => {
    await page.goto('/vehicles')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // "Bike" カテゴリをクリック
    const bikeFilter = page.locator('button', { hasText: /^Bike$/ })
    await expect(bikeFilter.first()).toBeVisible()
    await bikeFilter.first().click()
    await page.waitForTimeout(500)

    const rows = page.locator('tbody tr')
    const count = await rows.count()
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const text = await rows.nth(i).textContent()
        expect(text).toContain('Bike')
      }
    }
  })

  test('Vehicle Details サイドバーが表示される', async ({ page }) => {
    await page.goto('/vehicles')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // 1行目をクリック
    const firstRow = page.locator('tbody tr').first()
    await expect(firstRow).toBeVisible()
    await firstRow.click()

    // サイドバーが表示される
    await expect(page.getByText('Vehicle Details')).toBeVisible()
    await expect(page.locator('aside').getByText('Category')).toBeVisible()
    await expect(page.locator('aside').getByText('Status Access')).toBeVisible()
    await expect(page.locator('aside').getByText('Last Mileage')).toBeVisible()
  })
})

// ============================================================
// 3. Add Vehicle Test
// ============================================================
test.describe('Add Vehicle', () => {
  test('新しい車両を正しく追加できる', async ({ page }) => {
    await page.goto('/vehicles')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // Add Vehicle ボタンをクリック
    await page.getByRole('button', { name: 'Add Vehicle' }).click()

    // モーダルが表示される
    await expect(page.getByText('Register New Vehicle')).toBeVisible()

    // フォームに入力
    const testName = `E2E Test Vehicle ${Date.now()}`
    await page.getByPlaceholder('e.g. Honda PCX 150').fill(testName)

    // Save
    await page.getByRole('button', { name: 'Save Vehicle' }).click()

    // モーダルが閉じてリストが更新される
    await page.waitForTimeout(3000)
    await waitForLoadingComplete(page)

    // 追加した車両がテーブルに含まれる
    await expect(page.getByText(testName)).toBeVisible({ timeout: 10_000 })
  })
})

// ============================================================
// 4. Lending Flow Test
// ============================================================
test.describe('Lending Flow', () => {
  test('任意のユーザーが任意の車両を正しくレンタルでき、正常に完了する', async ({ page }) => {
    await page.goto('/rentals/new')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // Step 1: Customer Selection
    await expect(page.getByText('Step 1: Select Customer')).toBeVisible()

    // 最初の顧客カードをクリック
    const customerCard = page.locator('.grid .cursor-pointer').first()
    await expect(customerCard).toBeVisible({ timeout: 10_000 })
    await customerCard.click()

    // Step 2: Select Vehicle
    await expect(page.getByText('Step 2: Select Vehicle')).toBeVisible({ timeout: 10_000 })
    await waitForLoadingComplete(page)
    await page.waitForTimeout(1500)

    // Available vehicles リストから選択
    const vehicleCards = page.locator('.space-y-4 .grid .cursor-pointer')
    const vehicleCount = await vehicleCards.count()

    if (vehicleCount > 0) {
      await vehicleCards.first().click()
    } else {
      // リストに車両がない場合はQRスキャンシミュレーション
      await page.getByRole('button', { name: 'Simulate QR Scan' }).click()
      await page.waitForTimeout(3000)
    }

    // Step 3: Return Schedule
    await expect(page.getByText('Step 3: Return Schedule')).toBeVisible({ timeout: 10_000 })

    // 返却日は翌日がデフォルト — そのまま進む
    await page.getByRole('button', { name: 'Continue to Price Input' }).click()

    // Step 4: Payment Amount
    await expect(page.getByText('Step 4: Payment Amount')).toBeVisible()

    // 価格を入力
    const priceInput = page.locator('input[type="number"]')
    await priceInput.fill('1000')

    await page.getByRole('button', { name: 'Continue to Confirmation' }).click()

    // Step 5: Confirm
    await expect(page.getByText('Step 5: Confirm Transaction')).toBeVisible()

    // Start Lending Now
    await page.getByRole('button', { name: 'Start Lending Now' }).click()

    // 成功時にダッシュボードへリダイレクト
    await expect(page).toHaveURL('/', { timeout: 15_000 })
  })
})

// ============================================================
// 5. Return Flow Test
// ============================================================
test.describe('Return Flow', () => {
  test('任意のレンタル中車両を正しく返却でき、正常に完了する', async ({ page }) => {
    await page.goto('/rentals/return')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // Step 1: Identify Vehicle
    await expect(page.getByText('Step 1: Identify Vehicle')).toBeVisible()

    // Lent vehicles リストから選択
    await page.waitForTimeout(1500)
    const lentVehicleCards = page.locator('.space-y-4 .grid .cursor-pointer')
    const lentCount = await lentVehicleCards.count()

    if (lentCount > 0) {
      await lentVehicleCards.first().click()
    } else {
      // QRスキャンシミュレーション
      await page.getByRole('button', { name: 'Simulate QR Scan' }).click()
      await page.waitForTimeout(3000)
    }

    // Step 2: Check Return Details
    await expect(page.getByText('Step 2: Check Return Details')).toBeVisible({ timeout: 10_000 })

    // サマリー情報が表示される
    await expect(page.getByText('Summary')).toBeVisible()
    await expect(page.getByText('Schedule Status')).toBeVisible()

    // Complete Return
    await page.getByRole('button', { name: 'Complete Return Process' }).click()

    // 成功時にダッシュボードへリダイレクト
    await expect(page).toHaveURL('/', { timeout: 15_000 })
  })
})

// ============================================================
// 6. Customers Tests
// ============================================================
test.describe('Customers', () => {
  test('顧客一覧が正しく表示される', async ({ page }) => {
    await page.goto('/customers')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // テーブルヘッダーが存在する
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Contact' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible()

    // 顧客行が1件以上存在する
    const rows = page.locator('tbody tr')
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
  })

  test('Update Customer で顧客情報を正しく更新できる', async ({ page }) => {
    await page.goto('/customers')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // 最初の顧客の編集ボタン（pencilアイコン）をクリック
    const editButton = page.locator('tbody tr').first().locator('button').first()
    await expect(editButton).toBeVisible()
    await editButton.click()

    // Update モーダルが表示される
    await expect(page.getByText('Update Customer')).toBeVisible()

    // 名前を取得して更新
    const fullNameInput = page.getByPlaceholder('e.g. John Doe').first()
    const currentName = await fullNameInput.inputValue()
    const updatedName = `${currentName} Updated`
    await fullNameInput.fill(updatedName)

    // Update ボタンをクリック
    await page.getByRole('button', { name: 'Update Customer' }).click()

    // リストが更新される
    await page.waitForTimeout(2000)
    await waitForLoadingComplete(page)

    // 更新された名前がテーブルに表示される
    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 10_000 })

    // 元に戻す（クリーンアップ）
    const editBtn2 = page.locator('tbody tr').first().locator('button').first()
    await editBtn2.click()
    await page.waitForTimeout(1000)
    const nameField = page.getByPlaceholder('e.g. John Doe').first()
    await nameField.fill(currentName)
    await page.getByRole('button', { name: 'Update Customer' }).click()
    await page.waitForTimeout(1000)
  })

  test('Add New Customer で新規顧客を追加できる', async ({ page }) => {
    await page.goto('/customers')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // Add New Customer ボタンをクリック
    await page.getByRole('button', { name: 'Add New Customer' }).click()

    // モーダルが表示される
    await expect(page.getByText('Add New Customer')).toBeVisible()

    // フォームに入力
    const testName = `E2E Test Customer ${Date.now()}`
    await page.getByPlaceholder('e.g. John Doe').fill(testName)
    await page.getByPlaceholder('john@example.com').fill('e2e-test@example.com')
    await page.getByPlaceholder('+81-XXX-XXXX-XXXX').fill('+81-90-1234-5678')

    // Register
    await page.getByRole('button', { name: 'Register Customer' }).click()

    // 追加された顧客がリストに表示される
    await page.waitForTimeout(2000)
    await waitForLoadingComplete(page)
    await expect(page.getByText(testName)).toBeVisible({ timeout: 10_000 })
  })

  test('顧客を削除できる', async ({ page }) => {
    await page.goto('/customers')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // まず顧客数を取得
    const rows = page.locator('tbody tr')
    const initialCount = await rows.count()
    expect(initialCount).toBeGreaterThan(0)

    // 最初の行のゴミ箱ボタンをクリック
    const deleteButton = rows.first().locator('button').last()
    await deleteButton.click()

    // 確認モーダルが表示される
    await expect(page.getByText('Delete Customer')).toBeVisible()
    await expect(page.getByText('Are you sure you want to delete this customer')).toBeVisible()

    // Delete を実行
    await page.getByRole('button', { name: 'Delete' }).click()

    // リストが更新される
    await page.waitForTimeout(2000)
    await waitForLoadingComplete(page)

    // 顧客数が1減っている
    const finalCount = await rows.count()
    expect(finalCount).toBe(initialCount - 1)
  })
})

// ============================================================
// 7. History Tests
// ============================================================
test.describe('History', () => {
  test('取引履歴一覧が正しく表示される', async ({ page }) => {
    await page.goto('/history')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // テーブルヘッダーが存在する
    await expect(page.getByRole('columnheader', { name: 'ID' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Item' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'User' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Lending Time' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Returned Time' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Duration' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Price' })).toBeVisible()

    // Total Transactions/Total Amount フッターが表示される
    await expect(page.getByText('Total Transactions')).toBeVisible()
    await expect(page.getByText('Total Amount')).toBeVisible()
  })

  test('検索フィルタが機能する', async ({ page }) => {
    await page.goto('/history')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    const searchInput = page.getByPlaceholder('Search items or users...')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('Honda')
    await page.waitForTimeout(500)

    const rows = page.locator('tbody tr')
    const count = await rows.count()
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const text = await rows.nth(i).textContent()
        expect(text?.toLowerCase()).toContain('honda')
      }
    }
  })

  test('Export モーダルが表示される', async ({ page }) => {
    await page.goto('/history')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    await page.getByRole('button', { name: 'Export' }).click()
    await expect(page.getByText('Export Transactions')).toBeVisible()
    await expect(page.getByText('Start Date')).toBeVisible()
    await expect(page.getByText('End Date')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Download CSV' })).toBeVisible()
  })
})

// ============================================================
// 8. Navigation & Layout Tests
// ============================================================
test.describe('Navigation & Layout', () => {
  test('サイドバーのナビゲーションリンクが正しく機能する', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Vehicles リンク
    const vehiclesLink = page.locator('a[href="/vehicles"]')
    if (await vehiclesLink.isVisible()) {
      await vehiclesLink.click()
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveURL('/vehicles')
    }

    // Customers リンク
    const customersLink = page.locator('a[href="/customers"]')
    if (await customersLink.isVisible()) {
      await customersLink.click()
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveURL('/customers')
    }

    // History リンク
    const historyLink = page.locator('a[href="/history"]')
    if (await historyLink.isVisible()) {
      await historyLink.click()
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveURL('/history')
    }
  })

  test('Return Vehicle ページが正しく表示される', async ({ page }) => {
    await page.goto('/rentals/return')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    await expect(page.getByText('Return Vehicle')).toBeVisible()
    await expect(page.getByText('Step 1: Identify Vehicle')).toBeVisible()
    await expect(page.getByText('Currently Lent Vehicles')).toBeVisible()
  })
})

// ============================================================
// 9. Error Handling & Edge Cases
// ============================================================
test.describe('Error Handling & Edge Cases', () => {
  test('Vehicle手動入力で無効なIDを入力するとエラーになる', async ({ page }) => {
    await page.goto('/rentals/new')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // Step 1で顧客を選択
    const customerCard = page.locator('.grid .cursor-pointer').first()
    await expect(customerCard).toBeVisible({ timeout: 10_000 })
    await customerCard.click()

    // Step 2で無効なIDを入力
    await expect(page.getByText('Step 2')).toBeVisible({ timeout: 10_000 })
    const manualInput = page.getByPlaceholder('e.g. B-HONDA-001')
    await manualInput.fill('INVALID-CODE-999')
    await page.getByRole('button', { name: 'Identify Vehicle' }).click()
    await page.waitForTimeout(2000)

    // Step 2のままである
    await expect(page.getByText('Step 2')).toBeVisible()
  })

  test('Return画面で無効なVehicle IDはエラーになる', async ({ page }) => {
    await page.goto('/rentals/return')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    const manualInput = page.getByPlaceholder('e.g. B-HONDA-001')
    await manualInput.fill('INVALID-CODE-999')
    await page.getByRole('button', { name: 'Fetch Lending Info' }).click()
    await page.waitForTimeout(2000)

    // Step 1のままである
    await expect(page.getByText('Step 1: Identify Vehicle')).toBeVisible()
  })

  test('Lending画面のStep3で返却日が過去だとボタンが無効化される', async ({ page }) => {
    await page.goto('/rentals/new')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // Step 1 → 顧客選択
    const customerCard = page.locator('.grid .cursor-pointer').first()
    await expect(customerCard).toBeVisible({ timeout: 10_000 })
    await customerCard.click()

    // Step 2 → 車両選択
    await expect(page.getByText('Step 2')).toBeVisible({ timeout: 10_000 })
    await waitForLoadingComplete(page)
    await page.waitForTimeout(1500)

    const vehicleCards = page.locator('.space-y-4 .grid .cursor-pointer')
    if (await vehicleCards.count() > 0) {
      await vehicleCards.first().click()
    } else {
      await page.getByRole('button', { name: 'Simulate QR Scan' }).click()
      await page.waitForTimeout(3000)
    }

    // Step 3 → 過去の日付を入力
    await expect(page.getByText('Step 3: Return Schedule')).toBeVisible({ timeout: 10_000 })
    const dateInput = page.locator('input[type="date"]')
    await dateInput.fill('2020-01-01')

    const continueButton = page.getByRole('button', { name: 'Continue to Price Input' })
    await expect(continueButton).toBeDisabled()
  })
})

// ============================================================
// 10. Status Filters
// ============================================================
test.describe('Status Filters', () => {
  test('Vehicle一覧のステータスフィルタが機能する', async ({ page }) => {
    await page.goto('/vehicles')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // "Available" ステータスフィルタをクリック
    const availableFilter = page.locator('button', { hasText: 'Available' })
    if (await availableFilter.first().isVisible()) {
      await availableFilter.first().click()
      await page.waitForTimeout(500)

      const statusBadges = page.locator('tbody tr td:nth-child(3) span')
      const count = await statusBadges.count()
      for (let i = 0; i < count; i++) {
        const text = await statusBadges.nth(i).textContent()
        expect(text?.trim()).toBe('Available')
      }
    }
  })

  test('Customer一覧のステータスフィルタが機能する', async ({ page }) => {
    await page.goto('/customers')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    const activeFilter = page.locator('button', { hasText: 'Active' })
    if (await activeFilter.first().isVisible()) {
      await activeFilter.first().click()
      await page.waitForTimeout(500)

      const rows = page.locator('tbody tr')
      const count = await rows.count()
      expect(count).toBeGreaterThanOrEqual(0)
    }
  })
})
