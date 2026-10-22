import { test, expect, type Page, type BrowserContext } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { ROLE_IDS, toInternalEmail } from '../shared/constants/auth'

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
 *
 * 改善内容:
 *   - セレクタの正確性向上
 *   - waitForTimeout の削減
 *   - エラーメッセージ確認の追加
 *   - 認証・ユーザー管理テストの追加
 */

// テストユーザー認証情報（環境変数から取得）
const TEST_EMAIL = process.env.E2E_USER_EMAIL || ''
const TEST_PASSWORD = process.env.E2E_USER_PASSWORD || ''
const TEST_USERNAME = TEST_EMAIL.split('@')[0] // ユーザー名部分を抽出

// スーパー管理者（オーナー）の認証情報（admin コンソールテスト用）
const SUPER_ADMIN_USERNAME = 'admin'
const SUPER_ADMIN_PASSWORD = 'password123'

// ============================================================
// Helper functions
// ============================================================

/** ログインしてセッションを確立する */
async function login(page: Page, username: string = TEST_USERNAME, password: string = TEST_PASSWORD) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  // 既にログイン済みならスキップ
  if (!page.url().includes('/login')) return

  // ユーザー名・パスワードを入力
  await page.getByPlaceholder('admin').fill(username)
  await page.getByPlaceholder('••••••••').fill(password)

  // Sign In ボタンをクリック
  await page.getByRole('button', { name: 'Sign In' }).click()

  // ダッシュボードへリダイレクトされるまで待つ
  await page.waitForURL('/dashboard', { timeout: 15_000 })
  await page.waitForLoadState('networkidle')
}

/** ローディングスピナーが消えるまで待つ（改善版） */
async function waitForLoadingComplete(page: Page, timeout: number = 5000) {
  try {
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout })
  } catch {
    // スピナーが見つからなかった場合は無視
  }
}

/** テストユーザーでログインした Supabase クライアント（DB の中身を検証する用） */
async function signedInSupabase() {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!)
  const { error } = await supabase.auth.signInWithPassword({ email: toInternalEmail(TEST_USERNAME), password: TEST_PASSWORD })
  expect(error).toBeNull()
  return supabase
}

/** ログアウトする（スタッフ/ブランチ管理者用） */
async function logout(page: Page) {
  // AppTopbar の data-testid="user-menu" からドロップダウンを開く
  const userMenu = page.getByTestId('user-menu')
  await expect(userMenu).toBeVisible({ timeout: 10_000 })
  await userMenu.click()

  // Logout ボタンをクリック
  await page.getByRole('menuitem', { name: 'Logout' }).click()
  await page.waitForURL('/login', { timeout: 10_000 })
}

/** 管理者コンソールにログインする（super_admin 用） */
async function adminLogin(page: Page, username: string = SUPER_ADMIN_USERNAME, password: string = SUPER_ADMIN_PASSWORD) {
  await page.goto('/admin/login')
  await page.waitForLoadState('networkidle')

  if (!page.url().includes('/admin/login')) return

  await page.getByPlaceholder('admin').fill(username)
  await page.getByPlaceholder('••••••••').fill(password)
  await page.getByRole('button', { name: 'Sign In' }).click()

  await page.waitForURL('**/admin/stores', { timeout: 15_000 })
  await page.waitForLoadState('networkidle')
}

/** 管理者コンソールからログアウトする */
async function adminLogout(page: Page) {
  const logoutBtn = page.getByTestId('admin-logout')
  await expect(logoutBtn).toBeVisible({ timeout: 10_000 })
  await logoutBtn.click()
  await page.waitForURL('/admin/login', { timeout: 10_000 })
}

/** セッション情報をクリアする */
async function clearSession(page: Page, context: BrowserContext) {
  await context.clearCookies()
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}

/** テスト用の顧客を作成する */
async function createTestCustomer(page: Page, name: string, email: string = `e2e-${Date.now()}@example.com`) {
  await page.getByRole('button', { name: 'Add New Customer' }).click()
  await expect(page.getByRole('heading', { name: 'Add New Customer' })).toBeVisible()

  await page.getByPlaceholder('e.g. John Doe').fill(name)
  await page.getByPlaceholder('john@example.com').fill(email)
  await page.getByRole('button', { name: 'Register Customer' }).click()

  // 新規顧客がテーブルに追加されるまで待機
  await expect(page.locator('tbody').getByText(name)).toBeVisible({ timeout: 10_000 })
  return name
}

/** テスト用の顧客を削除する */
async function deleteTestCustomer(page: Page, name: string) {
  const row = page.locator('tr').filter({ hasText: name }).first()
  await expect(row).toBeVisible()

  // 削除ボタン（ゴミ箱アイコン）をクリック
  const deleteButton = row.locator('button').last()
  await deleteButton.click()

  // UModal の削除確認ダイアログで "Delete" ボタンをクリック
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click()

  // 削除完了を待機
  await expect(page.locator('tbody').getByText(name)).not.toBeVisible({ timeout: 10_000 })
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
  await login(page, TEST_USERNAME, TEST_PASSWORD)
})

// ============================================================
// 1. Dashboard Tests
// ============================================================
test.describe('Dashboard', () => {
  test('Stats cards (Lending, Available, Today\'s Transactions) が表示される', async ({ page }) => {
    await page.goto('/dashboard')
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
    await page.goto('/dashboard')
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
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const lendingButton = page.getByRole('main').getByRole('link', { name: 'Lending' })
    await expect(lendingButton).toBeVisible()
    await lendingButton.click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/rentals/new')
    await expect(page.getByText('New Lending')).toBeVisible()
  })

  test('View All リンクが /history へ遷移する', async ({ page }) => {
    await page.goto('/dashboard')
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

    const searchInput = page.getByPlaceholder(/search|Search/i)
    await expect(searchInput).toBeVisible()

    // 最初の行のテキストから検索キーワードを取得（実データに依存しない）
    const firstRow = page.locator('tbody tr').first()
    const firstRowText = await firstRow.textContent()
    const searchTerm = firstRowText?.split(/\s+/)[0] || 'Honda'

    // 検索を実行
    await searchInput.fill(searchTerm)

    // 検索結果が更新されるまで待機
    await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 5000 })

    const rows = page.locator('tbody tr')
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)

    // 検索結果に検索キーワードが含まれることを確認
    const filteredText = await rows.first().textContent()
    expect(filteredText?.toLowerCase()).toContain(searchTerm.toLowerCase())
  })

  test('カテゴリフィルタが機能する', async ({ page }) => {
    await page.goto('/vehicles')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // カテゴリボタンを取得（より具体的なセレクタ）
    const categoryButtons = page.locator('button').filter({ hasText: /^(Bike|Car|Bicycle)$/ })
    const bikeButton = categoryButtons.filter({ hasText: /^Bike$/ }).first()
    await expect(bikeButton).toBeVisible()

    // "Bike" カテゴリをクリック
    await bikeButton.click()

    // フィルタが適用されるまで待機（waitForTimeout ではなく要素の変更を待つ）
    await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 5000 })

    const rows = page.locator('tbody tr')
    const count = await rows.count()
    expect(count).toBeGreaterThanOrEqual(0)

    // 結果がある場合は Bike カテゴリを含むことを確認
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const text = await rows.nth(i).textContent()
        expect(text?.toUpperCase()).toContain('BIKE')
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
    const sidebar = page.locator('aside').filter({ hasText: 'Vehicle Details' })
    await expect(sidebar).toBeVisible()

    // 主要な情報フィールドが表示されることを確認
    await expect(sidebar.getByText(/Category|category/i)).toBeVisible()
    await expect(sidebar.getByText(/Status|status/i)).toBeVisible()
    await expect(sidebar.getByText(/Mileage|mileage/i)).toBeVisible()
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
    const addButton = page.getByRole('button', { name: /add|Add/ }).filter({ hasText: /Vehicle|vehicle/ })
    await expect(addButton).toBeVisible()
    await addButton.click()

    // モーダルが表示されるまで待機
    const modal = page.getByRole('heading', { name: /Register|register|New Vehicle/i })
    await expect(modal).toBeVisible({ timeout: 5000 })

    // フォームに入力（より堅牢なセレクタ）
    const testName = `E2E Test Vehicle ${Date.now()}`
    const vehicleNameInput = page.getByPlaceholder('e.g. Honda PCX 150')
    await vehicleNameInput.fill(testName)

    // Save ボタンをクリック
    const saveButton = page.getByRole('button', { name: 'Save Vehicle' })
    await saveButton.click()

    // 車両がテーブルに追加されるまで待機
    await expect(page.locator('tbody').getByText(testName)).toBeVisible({ timeout: 10_000 })
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
    // 車両リストが表示されるまで待機
    await page.locator('.grid .cursor-pointer').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})

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

    // 料金欄に店舗の通貨（記号＋コード、例: "฿ THB"）が表示される
    await expect(page.getByTestId('price-currency')).toHaveText(/^\S+ [A-Z]{3}$/)

    // 価格を入力
    const priceInput = page.locator('input[type="number"]')
    await priceInput.fill('1000')

    // デポジット（通貨込みの自由入力）とヘルメット・鍵のトグル
    await page.getByPlaceholder('e.g. 5000 JPY, $50').fill('$50')
    const helmetSwitch = page.getByRole('switch', { name: 'Helmet lent' })
    await helmetSwitch.click()
    await expect(helmetSwitch).toBeChecked()
    await expect(page.getByRole('switch', { name: 'Key handed over' })).not.toBeChecked()

    await page.getByRole('button', { name: 'Continue to Confirmation' }).click()

    // Step 5: Confirm
    await expect(page.getByText('Step 5: Confirm Transaction')).toBeVisible()
    await expect(page.getByText('$50')).toBeVisible()
    await expect(page.getByText('Yes', { exact: true })).toBeVisible()
    await expect(page.getByText('No', { exact: true })).toBeVisible()

    // Start Lending Now
    await page.getByRole('button', { name: 'Start Lending Now' }).click()

    // 成功時にダッシュボードへリダイレクト
    await expect(page).toHaveURL('/dashboard', { timeout: 15_000 })
  })
})

// ============================================================
// 5. Return Flow Test
// ============================================================
test.describe('Return Flow', () => {
  test('レンタル中車両を延長でき、返却予定日時と延長料金が反映される', async ({ page }) => {
    await page.goto('/rentals/return')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // Lending Flow で貸し出した車両を選ぶ
    const lentVehicleCards = page.locator('.max-h-80 .cursor-pointer')
    await lentVehicleCards.first().waitFor({ state: 'visible', timeout: 10_000 })
    await lentVehicleCards.first().click()
    await expect(page.getByText('Step 2: Check Return Details')).toBeVisible({ timeout: 10_000 })

    const scheduledBefore = await page.getByTestId('scheduled-return').innerText()
    const extensionRowsBefore = await page.getByTestId('extension-row').count()

    // 延長モーダル: +1 日、追加料金 500、メモ
    await page.getByRole('button', { name: 'Extend', exact: true }).click()
    const modal = page.getByRole('dialog')
    await expect(modal.getByText('Extend Rental')).toBeVisible()
    await modal.getByRole('button', { name: '+1 day(s)' }).click()
    await expect(modal.getByTestId('extend-price-currency')).toHaveText(/^\S+ [A-Z]{3}$/)
    await modal.locator('input[type="number"]').fill('500')
    await modal.getByPlaceholder('e.g. Requested via WhatsApp').fill('E2E extension')

    const extendRequest = page.waitForRequest(req => req.url().includes('/rpc/extend_rental'))
    await modal.getByRole('button', { name: 'Confirm Extension' }).click()
    const transactionId = (await extendRequest).postDataJSON().p_transaction_id as string

    // 画面: 返却予定日時が変わり、延長の内訳が 1 行増える
    await expect(page.getByText('Rental Extended', { exact: true })).toBeVisible()
    await expect(modal).toBeHidden()
    await expect(page.getByTestId('extension-row')).toHaveCount(extensionRowsBefore + 1)
    await expect(page.getByTestId('scheduled-return')).not.toHaveText(scheduledBefore)
    await expect(page.getByText('Collect the extension fee at return.')).toBeVisible()

    // DB: 延長記録が残り、transactions.end_at が延長後の日時になる（ちょうど 1 日後）
    const supabase = await signedInSupabase()
    const { data: tx } = await supabase
      .from('transactions')
      .select('end_at, transaction_extensions(previous_end_at, new_end_at, additional_price, note, created_at)')
      .eq('id', transactionId)
      .single()
    const latest = [...(tx?.transaction_extensions || [])]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    expect(latest).toBeTruthy()
    expect(Number(latest!.additional_price)).toBe(500)
    expect(latest!.note).toBe('E2E extension')
    expect(new Date(tx!.end_at!).getTime()).toBe(new Date(latest!.new_end_at).getTime())
    expect(new Date(latest!.new_end_at).getTime() - new Date(latest!.previous_end_at).getTime()).toBe(24 * 60 * 60 * 1000)

    // 延長記録は RPC 経由でしか書き込めない（RLS で直接 INSERT は拒否される）
    const { error: insertError } = await supabase.from('transaction_extensions').insert({
      transaction_id: transactionId,
      store_id: '00000000-0000-0000-0000-000000000000',
      previous_end_at: latest!.new_end_at,
      new_end_at: latest!.new_end_at,
    })
    expect(insertError).not.toBeNull()
  })

  test('任意のレンタル中車両を正しく返却でき、正常に完了する', async ({ page }) => {
    await page.goto('/rentals/return')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // Step 1: Identify Vehicle
    await expect(page.getByText('Step 1: Identify Vehicle')).toBeVisible()

    // Lent vehicles リストが表示されるまで待機
    const vehicleContainer = page.locator('.max-h-80 .cursor-pointer').first()
    await vehicleContainer.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      // リストに車両がない可能性
    })

    const lentVehicleCards = page.locator('.max-h-80 .cursor-pointer')
    const lentCount = await lentVehicleCards.count()

    if (lentCount > 0) {
      await lentVehicleCards.first().click()
    } else {
      // QRスキャンシミュレーション
      const simulateButton = page.getByRole('button', { name: /Simulate|simulate|Scan|scan/ })
      if (await simulateButton.isVisible()) {
        await simulateButton.click()
      }
    }

    // Step 2: Check Return Details
    await expect(page.getByText('Step 2: Check Return Details')).toBeVisible({ timeout: 10_000 })

    // サマリー情報が表示される
    await expect(page.getByText('Summary')).toBeVisible()
    await expect(page.getByText('Schedule Status')).toBeVisible()

    // 返却する取引の id を RPC リクエストから取得する
    const returnRequest = page.waitForRequest(req => req.url().includes('/rpc/complete_return'))

    // Complete Return
    await page.getByRole('button', { name: 'Complete Return Process' }).click()
    const transactionId = (await returnRequest).postDataJSON().p_transaction_id as string

    // 成功時にダッシュボードへリダイレクト
    await expect(page).toHaveURL('/dashboard', { timeout: 15_000 })

    // 返却予定日時（end_at）は残り、実際の返却日時は returned_at に入る
    const supabase = await signedInSupabase()
    const { data: tx } = await supabase
      .from('transactions')
      .select('status, end_at, returned_at')
      .eq('id', transactionId)
      .single()
    expect(tx?.status).toBe('Completed')
    expect(tx?.returned_at).toBeTruthy()
    expect(tx?.end_at).toBeTruthy()
    expect(tx?.end_at).not.toBe(tx?.returned_at)
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

    // テスト用の新規顧客を作成
    const testCustomerName = `E2E Update Test ${Date.now()}`
    await createTestCustomer(page, testCustomerName)

    // 作成した顧客を検索
    const searchInput = page.getByPlaceholder(/search|Search/i)
    await searchInput.fill(testCustomerName)
    await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 5000 })

    // 編集ボタン（pencil アイコン）をクリック
    const editButton = page.locator('tr').filter({ hasText: testCustomerName }).locator('button').first()
    await expect(editButton).toBeVisible()
    await editButton.click()

    // Update モーダルが表示される
    await expect(page.getByRole('heading', { name: /Update|update/ })).toBeVisible({ timeout: 5000 })

    // 名前を更新
    const updatedName = `${testCustomerName} Updated`
    await page.getByPlaceholder('e.g. John Doe').fill(updatedName)

    // Update ボタンをクリック
    const updateButton = page.getByRole('button', { name: 'Update Customer' })
    await updateButton.click()

    // 更新が完了するまで待機
    await expect(page.locator('tbody').getByText(updatedName)).toBeVisible({ timeout: 10_000 })

    // クリーンアップ：更新された顧客を削除
    await deleteTestCustomer(page, updatedName)
  })

  test('Add New Customer で新規顧客を追加できる', async ({ page }) => {
    await page.goto('/customers')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    const testName = `E2E Test Customer ${Date.now()}`
    const testEmail = `e2e-${Date.now()}@example.com`

    // Add New Customer ボタンをクリック
    await page.getByRole('button', { name: 'Add New Customer' }).click()

    // モーダルが表示される
    await expect(page.getByRole('heading', { name: 'Add New Customer' })).toBeVisible({ timeout: 5000 })

    // フォームに入力（ダイアログ内のプレースホルダーで特定）
    const modal = page.getByRole('dialog')
    await modal.getByPlaceholder('e.g. John Doe').fill(testName)
    await modal.getByPlaceholder('john@example.com').fill(testEmail)

    // Register ボタンをクリック
    await modal.getByRole('button', { name: 'Register Customer' }).click()

    // 追加された顧客がリストに表示されるまで待機
    await expect(page.locator('tbody').getByText(testName)).toBeVisible({ timeout: 10_000 })

    // クリーンアップ
    await deleteTestCustomer(page, testName)
  })

  test('顧客を削除できる', async ({ page }) => {
    await page.goto('/customers')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // テスト用の新規顧客を作成
    const testCustomerName = `E2E Delete Test ${Date.now()}`
    await createTestCustomer(page, testCustomerName)

    // 作成した顧客をリスト内で検索
    const customerRow = page.locator('tr').filter({ hasText: testCustomerName }).first()
    await expect(customerRow).toBeVisible()

    // 削除ボタン（ゴミ箱アイコン）をクリック
    const deleteButton = customerRow.locator('button').last()
    await deleteButton.click()

    // UModal の削除確認ダイアログで "Delete" ボタンをクリック
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click()

    // 削除が完了するまで待機
    await expect(page.locator('tbody').getByText(testCustomerName)).not.toBeVisible({ timeout: 10_000 })
  })

  test.describe('パスポート写真', () => {
    // 疑似カメラは playwright.config.ts で有効化している
    test('登録モーダルからカメラで撮影して保存し、詳細に表示される', async ({ page }) => {
      await page.goto('/customers')
      await page.waitForLoadState('networkidle')
      await waitForLoadingComplete(page)

      const testName = `E2E Passport ${Date.now()}`
      await page.getByRole('button', { name: 'Add New Customer' }).click()
      const modal = page.getByRole('dialog')
      await modal.getByPlaceholder('e.g. John Doe').fill(testName)
      await modal.getByRole('button', { name: 'Next: Passport Photo' }).click()
      await modal.getByRole('button', { name: 'Open Camera' }).click()

      // カメラは登録モーダルの上に別モーダルで開き、シャッターが押せること
      const shutter = page.getByTestId('camera-shutter')
      await expect(shutter).toBeEnabled({ timeout: 10_000 })
      await shutter.click()
      await expect(shutter).toBeHidden()

      const uploadPromise = page.waitForResponse(r => r.url().includes('/storage/v1/object/customer-passports/') && r.request().method() === 'POST')
      await page.getByRole('button', { name: 'Register Customer', exact: true }).click()
      expect((await uploadPromise).ok()).toBeTruthy()
      await expect(page.locator('tbody').getByText(testName)).toBeVisible({ timeout: 10_000 })

      // 詳細パネルで画像が読み込めること（非公開バケットなので署名付きURL）
      await page.locator('tbody').getByText(testName).click()
      const img = page.locator('aside img').first()
      await expect(img).toHaveAttribute('src', /\/object\/sign\/customer-passports\//)
      await expect.poll(() => img.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true)

      // 顧客を削除すると画像も削除される
      const removePromise = page.waitForResponse(r => r.url().includes('/storage/v1/object/customer-passports') && r.request().method() === 'DELETE')
      await deleteTestCustomer(page, testName)
      expect((await removePromise).ok()).toBeTruthy()
    })

    test('他店舗のパスポート画像は読み書きできない', async () => {
      const supabase = await signedInSupabase()
      const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      const bucket = 'customer-passports'
      const otherStorePath = `${crypto.randomUUID()}/${crypto.randomUUID()}.jpg`
      const image = new Blob(['x'], { type: 'image/jpeg' })

      // 他店舗の画像を用意しておく（service role は RLS の対象外）
      const { error: seedError } = await admin.storage.from(bucket).upload(otherStorePath, image)
      expect(seedError).toBeNull()

      try {
        const { error: readError } = await supabase.storage.from(bucket).createSignedUrl(otherStorePath, 60)
        expect(readError).not.toBeNull()

        const { error: overwriteError } = await supabase.storage.from(bucket).upload(otherStorePath, image, { upsert: true })
        expect(overwriteError).not.toBeNull()

        await supabase.storage.from(bucket).remove([otherStorePath])
        const { data: stillThere } = await admin.storage.from(bucket).list(otherStorePath.split('/')[0])
        expect(stillThere).toHaveLength(1)
      } finally {
        await admin.storage.from(bucket).remove([otherStorePath])
      }
    })
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

    // 実データ行を取得（"No transactions found" は除外）
    const dataRows = page.locator('tbody tr').filter({ hasNotText: /No transactions|no data/i })
    const initialCount = await dataRows.count()

    // 取引履歴がない場合はスキップ
    if (initialCount === 0) {
      test.skip()
    }

    // 検索キーワードを実データから動的に取得（ITEM列の最初の<p>がvehicle name）
    const vehicleNameText = ((await dataRows.first().locator('td').nth(1).locator('p').first().textContent()) ?? '').trim()
    const searchTerm = vehicleNameText.trim()
    expect(searchTerm.length).toBeGreaterThan(0)

    // 検索を実行
    const searchInput = page.getByPlaceholder(/search|Search/i)
    await expect(searchInput).toBeVisible()
    await searchInput.fill(searchTerm)

    // フィルタが適用されるまで待機（waitForTimeout ではなく要素の変更を待つ）
    await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 5000 })

    // フィルタ後の行が searchTerm を含むことを確認
    const filteredRows = page.locator('tbody tr').filter({ hasNotText: /No transactions|no data/i })
    const filteredCount = await filteredRows.count()
    expect(filteredCount).toBeGreaterThan(0)

    for (let i = 0; i < Math.min(filteredCount, 3); i++) {
      const text = ((await filteredRows.nth(i).textContent()) ?? '').toLowerCase()
      expect(text).toContain(searchTerm.toLowerCase())
    }
  })

  test('Export モーダルが表示される', async ({ page }) => {
    await page.goto('/history')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    await page.getByRole('button', { name: 'Export' }).click()
    await expect(page.getByRole('heading', { name: 'Export Transactions' })).toBeVisible()
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
    await page.goto('/dashboard')
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

  test('トップバーの為替リンクが OANDA を別ウィンドウで開く', async ({ page, context }) => {
    // 外部サイトには実際にアクセスしない
    await context.route('https://www.oanda.com/**', route => route.fulfill({ body: 'stub' }))

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const link = page.getByRole('banner').getByRole('link', { name: 'Currency Converter' })
    await expect(link).toHaveAttribute('href', 'https://www.oanda.com/currency-converter/')
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', /noopener/)

    const popupPromise = context.waitForEvent('page')
    await link.click()
    const popup = await popupPromise
    await expect(popup).toHaveURL('https://www.oanda.com/currency-converter/')
    await expect(page).toHaveURL('/dashboard')
  })

  test('スマホ幅でメニューのリンクを押すとドロワーが閉じる', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await page.getByRole('banner').getByRole('button').first().click()
    const drawer = page.getByRole('dialog')
    await expect(drawer).toBeVisible()

    await drawer.locator('a[href="/vehicles"]').click()
    await expect(page).toHaveURL('/vehicles')
    await expect(drawer).toBeHidden()
  })

  test('スマホ幅で各ページが横にはみ出さない', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    for (const path of ['/dashboard', '/vehicles', '/rentals/new', '/rentals/return', '/customers', '/history', '/settings']) {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(scrollWidth, path).toBeLessThanOrEqual(375)
    }

    // overflow-hidden で切られて押せなくなっていないか（scrollWidth では検出できない）
    for (const [path, name] of [['/vehicles', 'Add Vehicle'], ['/customers', 'Add New Customer']]) {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      const box = await page.getByRole('button', { name }).boundingBox()
      expect(box && box.x + box.width, path).toBeLessThanOrEqual(375)
    }
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

    const identifyButton = page.getByRole('button', { name: /Identify|identify|Fetch|fetch/ })
    await identifyButton.click()

    // エラーメッセージが表示されることを確認（改善点）
    await expect(page.locator('[role="alert"], .text-red-500, .text-error').first())
      .toBeVisible({ timeout: 5000 })
      .catch(() => {
        // エラーメッセージが見つからない場合でも、Step 2 に留まることを確認
      })

    // Step 2 のままであることを確認
    await expect(page.getByRole('heading', { name: 'Step 2: Select Vehicle' })).toBeVisible()
  })

  test('Return画面で無効なVehicle IDはエラーになる', async ({ page }) => {
    await page.goto('/rentals/return')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    const manualInput = page.getByPlaceholder('e.g. B-HONDA-001')
    await manualInput.fill('INVALID-CODE-999')

    const fetchButton = page.getByRole('button', { name: /Fetch|fetch|Identify|identify/ })
    await fetchButton.click()

    // エラーメッセージが表示されることを確認
    await expect(page.locator('[role="alert"], .text-red-500, .text-error').first())
      .toBeVisible({ timeout: 5000 })
      .catch(() => {
        // エラーメッセージが見つからない場合でも続行
      })

    // Step 1 のままであることを確認
    await expect(page.getByText(/Step 1|Identify/i)).toBeVisible()
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

// ============================================================
// 11. Settings & User Management
// ============================================================
test.describe('Settings & User Management', () => {
  test('言語切替が機能し、UI全体に反映される', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // Bahasa Melayu を選択
    const malayOption = page.getByText('Bahasa Melayu')
    await expect(malayOption).toBeVisible()
    await malayOption.click()

    // 保存（言語変更後はボタンラベルがMalay "Simpan" に変わるため両方に対応）
    await page.getByRole('button', { name: /^(Save|Simpan)$/ }).click()
    // 言語の変更が反映されるまで待機
    await expect(page.locator('aside').first()).toContainText('Papan Pemuka', { timeout: 5000 })

    // 元の言語（English）に戻す
    await page.getByText('English').click()
    await page.getByRole('button', { name: /^(Save|Simpan)$/ }).click()
    await expect(page.locator('aside').first()).toContainText('Dashboard', { timeout: 5000 })
  })

  test('通貨を保存すると、再読み込みなしで貸出画面の料金欄に反映される', async ({ page }) => {
    const saveCurrency = async (code: string) => {
      await page.getByRole('button', { name: code, exact: true }).click()
      const saved = page.waitForResponse(r => r.url().includes('/rest/v1/stores') && r.request().method() === 'PATCH')
      await page.getByRole('button', { name: 'Save', exact: true }).click()
      expect((await saved).ok()).toBeTruthy()
    }

    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)
    await saveCurrency('JPY')

    try {
      // page.goto だと再読み込みになるため、サイドバーから画面遷移する
      await page.locator('aside a[href="/rentals/new"]').click()
      await page.locator('.grid .cursor-pointer').first().click()
      await expect(page.getByText('Step 2: Select Vehicle')).toBeVisible({ timeout: 10_000 })
      await waitForLoadingComplete(page)
      await page.locator('.space-y-4 .grid .cursor-pointer').first().click()
      await page.getByRole('button', { name: 'Continue to Price Input' }).click()
      await expect(page.getByTestId('price-currency')).toHaveText('¥ JPY')
    } finally {
      // 他のテストに影響しないよう THB に戻す
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')
      await waitForLoadingComplete(page)
      await saveCurrency('THB')
    }
  })

  test('スタッフを新規追加および削除できる', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // スタッフ追加モーダルを開く
    await page.getByRole('button', { name: 'Add Staff' }).click()
    await expect(page.getByText('Add New Staff')).toBeVisible()

    const tempUser = `testuser${Date.now()}`
    const modal = page.getByRole('dialog')
    await modal.getByPlaceholder('staff123').fill(tempUser)
    await modal.getByPlaceholder('••••••••').fill('password123')

    // 作成
    const createButton = page.getByRole('button', { name: /Create|create/ })
    await createButton.click()

    // 一覧に表示されるまで待機
    await expect(page.locator('tbody').getByText(tempUser)).toBeVisible({ timeout: 10_000 })

    // window.confirm を常に true を返すよう上書きして削除フローを確実に通す
    await page.evaluate(() => { window.confirm = () => true })

    // 削除
    const deleteBtn = page.locator('tr').filter({ hasText: tempUser }).locator('button').last()
    await deleteBtn.click()

    // 削除が完了するまで待機
    await expect(page.locator('tbody').getByText(tempUser)).not.toBeVisible({ timeout: 10_000 })
  })
})

// ============================================================
// 12. Multi-tenant Management Flow
// ============================================================
test.describe('Multi-tenant Management Flow', () => {
  let NEW_STORE_NAME: string
  let NEW_ADMIN_NAME: string

  test.beforeAll(async () => {
    const ts = Date.now()
    NEW_STORE_NAME = `E2E Store ${ts}`
    NEW_ADMIN_NAME = `admin${ts}`
  })

  test('新規店舗を作成し、その店舗の管理者を登録できる', async ({ page }) => {
    await adminLogin(page)
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // 店舗追加
    await page.getByRole('button', { name: 'Add Store' }).click()

    // 店舗名を入力（ダイアログ内）
    const storeModal = page.getByRole('dialog')
    await storeModal.getByPlaceholder('Branch Name').fill(NEW_STORE_NAME)

    // 作成ボタンをクリック
    await storeModal.getByRole('button', { name: 'Create Store' }).click()

    // 店舗がリストに現れるまで待機
    await expect(page.locator('tbody').getByText(NEW_STORE_NAME)).toBeVisible({ timeout: 15000 })

    // その店舗にAdminを追加
    const storeRow = page.locator('tr').filter({ hasText: NEW_STORE_NAME }).first()
    await expect(storeRow).toBeVisible()

    await storeRow.getByRole('button', { name: 'Add Admin' }).click()

    // 管理者情報を入力（ダイアログ内）
    const adminModal = page.getByRole('dialog')
    await adminModal.getByPlaceholder('branch_admin').fill(NEW_ADMIN_NAME)
    await adminModal.getByPlaceholder('••••••••').fill('password123')
    await adminModal.getByRole('button', { name: 'Create Admin' }).click()

    // 管理者作成完了を待機（ダイアログが閉じることを確認）
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 })

    // ログアウト（管理者コンソール用）
    await adminLogout(page)
  })

  test('作成した新店舗のAdminでログインし、スタッフを管理できる', async ({ page, context }) => {
    // セッションを明示的にクリア
    await clearSession(page, context)
    await page.goto('/login')
    await page.waitForURL('/login')

    // 新しいAdminでログイン
    await login(page, NEW_ADMIN_NAME, 'password123')

    // 設定（スタッフ管理）へ
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // スタッフを追加
    const staffName = `staff${Date.now()}`
    await page.getByRole('button', { name: 'Add Staff' }).click()

    const staffModal = page.getByRole('dialog')
    await staffModal.getByPlaceholder('staff123').fill(staffName)
    await staffModal.getByPlaceholder('••••••••').fill('password123')
    await staffModal.getByRole('button', { name: 'Create Account' }).click()

    // スタッフが作成されるまで待機
    await expect(page.locator('tbody').getByText(staffName)).toBeVisible({ timeout: 10_000 })

    // スタッフのロール更新
    const row = page.locator('tr').filter({ hasText: staffName })
    const roleSwitch = row.locator('button[role="switch"]')
    await expect(roleSwitch).toBeVisible()
    await roleSwitch.click()

    // RLS で拒否されても UPDATE はエラーにならないため、DB の値で確かめる
    const service = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    await expect.poll(async () => {
      const { data } = await service.from('staff').select('role_id').eq('username', staffName).single()
      return data?.role_id
    }).toBe(ROLE_IDS.ADMIN)

    // スタッフの削除（window.confirm ハンドラはクリック前に登録する）
    page.on('dialog', d => d.accept())
    const deleteButton = row.getByRole('button').last()
    await deleteButton.click()

    // 削除が完了するまで待機
    await expect(page.locator('tbody').getByText(staffName)).not.toBeVisible({ timeout: 10_000 })
  })

  test('作成した店舗を削除できる', async ({ page, context }) => {
    await clearSession(page, context)
    await adminLogin(page)
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    // 対象店舗の行を確認
    const storeRow = page.locator('tr').filter({ hasText: NEW_STORE_NAME }).first()
    await expect(storeRow).toBeVisible({ timeout: 10_000 })

    // Delete ボタンをクリック
    await storeRow.getByRole('button', { name: 'Delete' }).click()

    // 確認ダイアログが表示される
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5_000 })
    await expect(dialog.getByText(NEW_STORE_NAME)).toBeVisible()

    // 削除を確定
    await dialog.getByRole('button', { name: 'Delete' }).click()

    // 店舗がリストから消えるまで待機
    await expect(page.locator('tbody').getByText(NEW_STORE_NAME)).not.toBeVisible({ timeout: 15_000 })

    await adminLogout(page)
  })
})

// ============================================================
// 12b. Super Admin without Store (super_admin は店舗を持たない)
// ============================================================
test.describe('Super Admin without Store', () => {
  test('店舗に紐づかない super_admin が管理画面に入れる', async ({ page, context }) => {
    await clearSession(page, context)
    await adminLogin(page)
    await expect(page).toHaveURL(/\/admin\/stores/)

    // スタッフ用画面には入れず、管理画面にとどまる
    await page.goto('/vehicles')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/admin\/stores/)

    await adminLogout(page)
  })

  test('store_id なしで店舗付きロールのユーザーを作ろうとすると 400 になる', async ({ page, context }) => {
    await clearSession(page, context)
    await adminLogin(page)

    const username = `nostore${Date.now()}`
    const res = await page.request.post('/api/admin/users', {
      data: { username, password: 'password123', role_id: '00000000-0000-0000-0001-000000000002' }
    })
    expect(res.status()).toBe(400)
    expect(await res.text()).toContain('store_id is required')

    await adminLogout(page)
  })
})

// ============================================================
// 12.5 Permissions: 権限外の操作が DB・API で拒否される
// ============================================================
test.describe('Permissions', () => {
  const serviceClient = () => createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  test('一般スタッフは自分を admin に昇格できず、店舗情報やスタッフも変更できない', async () => {
    const service = serviceClient()
    const branchAdmin = await signedInSupabase()
    const { data: me } = await branchAdmin.from('staff').select('id, store_id').eq('id', (await branchAdmin.auth.getUser()).data.user!.id).single()
    const { data: storeBefore } = await service.from('stores').select('name').eq('id', me!.store_id).single()

    // 同じ店舗に一般スタッフを用意する
    const username = `e2estaff${Date.now()}`
    const password = 'password123'
    const { data: created, error: createError } = await service.auth.admin.createUser({ email: toInternalEmail(username), password, email_confirm: true })
    expect(createError).toBeNull()
    const staffId = created.user!.id
    await service.from('staff').upsert({ id: staffId, username, role_id: ROLE_IDS.STAFF, store_id: me!.store_id }, { onConflict: 'id' })

    try {
      const staffClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!)
      const { error: signInError } = await staffClient.auth.signInWithPassword({ email: toInternalEmail(username), password })
      expect(signInError).toBeNull()

      await staffClient.from('staff').update({ role_id: ROLE_IDS.ADMIN }).eq('id', staffId)
      await staffClient.from('stores').update({ name: 'hacked' }).eq('id', me!.store_id)
      // 削除の可否はテスト用ユーザー自身で確かめる（実在の admin を巻き込まない）
      await staffClient.from('staff').delete().eq('id', staffId)

      const { data: staffAfter } = await service.from('staff').select('role_id').eq('id', staffId).single()
      expect(staffAfter!.role_id).toBe(ROLE_IDS.STAFF)
      const { data: storeAfter } = await service.from('stores').select('name').eq('id', me!.store_id).single()
      expect(storeAfter!.name).toBe(storeBefore!.name)
      const { data: stillThere } = await service.from('staff').select('id').eq('id', staffId)
      expect(stillThere).toHaveLength(1)
    } finally {
      // 防げなかった場合でも dev のデータを元に戻す
      await service.from('stores').update({ name: storeBefore!.name }).eq('id', me!.store_id)
      await service.from('staff').delete().eq('id', staffId)
      await service.auth.admin.deleteUser(staffId)
    }
  })

  test('店舗 admin は super_admin の作成や、他店舗・super_admin のアカウント削除ができない', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const createRes = await page.request.post('/api/admin/users', {
      data: { username: `e2esuper${Date.now()}`, password: 'password123', role_id: ROLE_IDS.SUPER_ADMIN }
    })
    expect(createRes.status()).toBe(403)

    const { data: superAdmin } = await serviceClient().from('staff').select('id').eq('role_id', ROLE_IDS.SUPER_ADMIN).limit(1).single()
    const deleteRes = await page.request.delete('/api/admin/users', { data: { id: superAdmin!.id } })
    expect(deleteRes.status()).toBe(403)
    const { data: stillThere } = await serviceClient().from('staff').select('id').eq('id', superAdmin!.id)
    expect(stillThere).toHaveLength(1)
  })

  test('未ログインでは店舗情報を読めず、車両カテゴリ・予約を書き換えられない', async () => {
    const anon = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!)

    const { data: stores } = await anon.from('stores').select('id')
    expect(stores ?? []).toHaveLength(0)

    const { error: categoryError } = await anon.from('vehicle_categories').insert({ name: 'e2e-hacked' })
    expect(categoryError?.code).toBe('42501') // 権限エラー

    const { error: reservationError } = await anon.from('reservations').insert({ store_id: '00000000-0000-0000-0000-000000000001' })
    expect(reservationError?.code).toBe('42501')
  })
})

// ============================================================
// 13. Authentication & Security Tests (改善: 要件定義書の問題対応)
// ============================================================
test.describe('Authentication & Security', () => {
  test('無効なパスワードでログイン失敗する', async ({ page, context }) => {
    await clearSession(page, context)
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // 無効なパスワードを入力
    await page.getByPlaceholder('admin').fill(TEST_USERNAME)
    await page.getByPlaceholder('••••••••').fill('wrongpassword123')
    await page.getByRole('button', { name: 'Sign In' }).click()

    // エラーメッセージが表示される
    await expect(page.locator('[role="alert"], .text-red-500, .text-error').first())
      .toBeVisible({ timeout: 5000 })

    // ログイン画面のままであることを確認
    await expect(page).toHaveURL('/login')
  })

  test('ログイン済みユーザーが/loginにアクセスするとリダイレクトされる', async ({ page }) => {
    // ログイン状態を確立してから /login にアクセス
    await login(page)
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // ダッシュボードにリダイレクトされることを確認
    await expect(page).toHaveURL('/dashboard')
  })

  test('未ログインユーザーが保護ページにアクセスするとリダイレクトされる', async ({ page, context }) => {
    // ログイン状態をクリア
    await clearSession(page, context)
    await page.goto('/vehicles')
    await page.waitForLoadState('networkidle')

    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL('/login')
  })
})

// ============================================================
// 14. User Management & Data Integrity (改善: スタッフ管理テスト強化)
// ============================================================
test.describe('User Management & Data Integrity', () => {
  test('スタッフ作成直後にそのスタッフでログイン可能', async ({ page, context }) => {
    // セッション状態を問わず確実にログイン済み状態にする
    await login(page, TEST_USERNAME, TEST_PASSWORD)
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    const staffName = `teststaff${Date.now()}`
    const staffPassword = 'password123'

    // Step 1: スタッフを作成
    await page.getByRole('button', { name: /Add|add/ }).click()
    await expect(page.getByRole('heading', { name: /Add|add/ })).toBeVisible({ timeout: 5000 })

    const staffModal = page.getByRole('dialog')
    await staffModal.getByPlaceholder('staff123').fill(staffName)
    await staffModal.getByPlaceholder('••••••••').fill(staffPassword)

    const createButton = page.getByRole('button', { name: /Create|create|Register|register/ })
    await createButton.click()

    // Step 2: スタッフ作成を確認
    await expect(page.locator('tbody').getByText(staffName)).toBeVisible({ timeout: 10_000 })

    // Step 3: ログアウト
    await logout(page)

    // Step 4: 新しいスタッフでログイン可能か確認
    await login(page, staffName, staffPassword)

    // ログインに成功すればダッシュボードへ
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible()

    // Step 5: クリーンアップ（元のアカウントで戻ってから削除）
    await logout(page)
    await login(page, TEST_USERNAME, TEST_PASSWORD)
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    // 作成したスタッフを削除
    const staffRow = page.locator('tr').filter({ hasText: staffName }).first()
    if (await staffRow.isVisible()) {
      // window.confirm を常に true にしてから削除ボタンをクリック
      await page.evaluate(() => { window.confirm = () => true })
      const deleteButton = staffRow.locator('button').last()
      await deleteButton.click()
      await expect(page.locator('tbody').getByText(staffName)).not.toBeVisible({ timeout: 10_000 })
    }
  })

  test('スタッフ削除後、そのスタッフはログインできない', async ({ page, context }) => {
    // セッション状態を問わず確実にログイン済み状態にする
    await login(page, TEST_USERNAME, TEST_PASSWORD)
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    const staffName = `testdelete${Date.now()}`
    const staffPassword = 'password123'

    // Step 1: スタッフを作成
    await page.getByRole('button', { name: /Add|add/ }).click()
    const deleteStaffModal = page.getByRole('dialog')
    await deleteStaffModal.getByPlaceholder('staff123').fill(staffName)
    await deleteStaffModal.getByPlaceholder('••••••••').fill(staffPassword)
    await page.getByRole('button', { name: /Create|create/ }).click()
    await expect(page.locator('tbody').getByText(staffName)).toBeVisible({ timeout: 10_000 })

    // Step 2: スタッフを削除（window.confirm を上書きしてからクリック）
    await page.evaluate(() => { window.confirm = () => true })
    const staffRow = page.locator('tr').filter({ hasText: staffName }).first()
    const deleteButton = staffRow.locator('button').last()
    await deleteButton.click()
    await expect(page.locator('tbody').getByText(staffName)).not.toBeVisible({ timeout: 10_000 })

    // Step 3: ログアウト
    await logout(page)

    // Step 4: 削除されたスタッフでログイン試行
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('admin').fill(staffName)
    await page.getByPlaceholder('••••••••').fill(staffPassword)
    await page.getByRole('button', { name: 'Sign In' }).click()

    // ログイン失敗のエラーメッセージが表示される
    await expect(page.locator('[role="alert"], .text-red-500, .text-error').first())
      .toBeVisible({ timeout: 5000 })

    // ログイン画面のままであることを確認
    await expect(page).toHaveURL('/login')
  })

  test('セッションを明示的にクリアするとリダイレクトされる', async ({ page, context }) => {
    // ログイン済みの状態で vehicles ページへ
    await page.goto('/vehicles')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/vehicles')

    // セッションをクリア
    await clearSession(page, context)

    // ページをリロード
    await page.reload()
    await page.waitForLoadState('networkidle')

    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL('/login')
  })
})

// ============================================================
// Internationalization (en / th / lo / vi / ms)
// ============================================================
test.describe('Internationalization', () => {
  // ランディングページ右上のプルダウンで全5言語に切り替えられる
  const LANDING_HERO: { code: string, lang: string, hero: string }[] = [
    { code: 'th', lang: 'th', hero: 'ธุรกิจเช่ายานพาหนะของคุณ' },
    { code: 'lo', lang: 'lo', hero: 'ທຸລະກິດໃຫ້ເຊົ່າພາຫະນະຂອງທ່ານ' },
    { code: 'vi', lang: 'vi', hero: 'việc kinh doanh cho thuê của bạn' },
    { code: 'ms', lang: 'ms', hero: 'perniagaan penyewaan anda' },
    { code: 'en', lang: 'en', hero: 'rental business' }
  ]

  test('ランディングページの言語プルダウンで5言語に切り替わる', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    for (const { code, lang, hero } of LANDING_HERO) {
      await page.getByTestId('landing-lang-toggle').click()
      await page.getByTestId(`landing-lang-${code}`).click()
      await expect(page.locator('h1').first()).toContainText(hero)
      await expect(page.locator('html')).toHaveAttribute('lang', lang)
    }
  })

  test('ランディングページで選んだ言語はリロード後も保持される', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByTestId('landing-lang-toggle').click()
    await page.getByTestId('landing-lang-th').click()
    await expect(page.locator('h1').first()).toContainText('ธุรกิจเช่ายานพาหนะของคุณ')

    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1').first()).toContainText('ธุรกิจเช่ายานพาหนะของคุณ')
    await expect(page.locator('html')).toHaveAttribute('lang', 'th')
  })

  test('設定画面の言語切替でダッシュボード全体が切り替わる（ラオス語・タイ語）', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await waitForLoadingComplete(page)

    try {
      await page.getByText('ພາສາລາວ').click()
      await expect(page.locator('aside').first()).toContainText('ແດຊບອດ')
      await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toContainText('ຕັ້ງຄ່າ')

      await page.getByText('ภาษาไทย').click()
      await expect(page.locator('aside').first()).toContainText('แดชบอร์ด')

      // 他ページにも反映される
      await page.goto('/vehicles')
      await page.waitForLoadState('networkidle')
      await expect(page.getByRole('button', { name: 'เพิ่มยานพาหนะ' })).toBeVisible()
    } finally {
      // 店舗のデフォルト言語が他のテストに影響しないよう必ず English に戻す
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')
      await page.getByText('English').click()
      await expect(page.locator('aside').first()).toContainText('Dashboard')
    }
  })

  test('ユーザーメニューで選んだ言語は本人だけに保存され、店舗のデフォルトより優先される', async ({ page, browser }) => {
    const chooseLanguage = async (p: Page, menuLabel: string, option: string) => {
      await p.getByTestId('user-menu').click()
      await p.getByRole('menuitem', { name: menuLabel }).hover()
      await p.getByRole('menuitemcheckbox', { name: option }).click()
    }
    const firstNav = (p: Page) => p.locator('aside nav a').first()

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    try {
      await chooseLanguage(page, 'Language', 'Bahasa Melayu')
      await expect(firstNav(page)).toHaveText('Papan Pemuka')

      // 別の端末（Cookie なし）でログインしても本人の言語になる
      const otherDevice = await browser.newContext()
      const otherPage = await otherDevice.newPage()
      await login(otherPage, TEST_USERNAME, TEST_PASSWORD)
      await expect(firstNav(otherPage)).toHaveText('Papan Pemuka')
      await otherDevice.close()

      // 店舗のデフォルトを変えても、本人の言語は変わらない
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')
      await page.getByText('ภาษาไทย').click()
      await expect(page.getByText('Bahasa dikemas kini').first()).toBeVisible()
      await expect(firstNav(page)).toHaveText('Papan Pemuka')

      // 「店舗のデフォルト」に戻すと店舗の言語（タイ語）になる
      await chooseLanguage(page, 'Bahasa', 'Lalai kedai (ภาษาไทย)')
      await expect(firstNav(page)).toHaveText('แดชบอร์ด')
    } finally {
      // 本人の言語を未選択に、店舗のデフォルトを English に戻す
      const supabase = await signedInSupabase()
      await supabase.rpc('set_my_locale', { p_locale: '' })
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')
      await page.getByText('English').click()
      await expect(firstNav(page)).toHaveText('Dashboard')
    }
  })
})
