# E2E テスト吟味レポート

**作成日**: 2026-06-22  
**対象ファイル**: `e2e/rental-system.spec.ts`  
**総テストケース数**: 25+

---

## 1. 概要

E2E テストコードは要件定義書の機能要件とよく対応しており、全体的に包括的です。ただし、以下の改善が必要です：

### 評価
| 項目 | 評価 | コメント |
|------|------|---------|
| 機能カバレッジ | ⭐⭐⭐⭐ | 主要機能はカバー |
| コード品質 | ⭐⭐⭐ | セレクタと待機処理の改善が必要 |
| エラーハンドリング | ⭐⭐⭐ | エラーメッセージ確認が不足 |
| 認証・ユーザー管理 | ⭐⭐ | 要件定義書で指摘した問題が未テスト |
| メンテナンス性 | ⭐⭐⭐ | waitForTimeout が多用されている |

---

## 2. 問題点と改善提案

### 問題 1: セレクタの不正確性 ❌

#### 箇所 1: Line 208
```typescript
await expect(page.locator('aside').getByText('Status Access')).toBeVisible()
```

**問題**: `'Status Access'` というテキストが実際に存在するのか確認が必要
- 要件定義書の機能仕様ではこのテキストが明記されていない
- Sidebar のラベルが異なる可能性がある

**改善案**:
```typescript
// 実装済みの場合
await expect(page.locator('aside').getByText('Status')).toBeVisible()
// または
await expect(page.locator('aside')).toContainText(/status|access/i)
```

#### 箇所 2: Line 230
```typescript
await page.getByPlaceholder('e.g. Honda PCX 150').fill(testName)
```

**問題**: プレースホルダテキストが正確か不明
- Vue コンポーネントが更新されると、プレースホルダも変更される
- 複数の入力フィールドがある場合、セレクタが曖昧

**改善案**:
```typescript
// より堅牢なセレクタ（label またはフォームフィールドから）
await page.locator('input[placeholder*="vehicle"]').fill(testName)
// または
const vehicleNameField = page.getByLabel('Vehicle Name')
await vehicleNameField.fill(testName)
```

#### 箇所 3: Line 180
```typescript
const bikeFilter = page.locator('button', { hasText: /^Bike$/ })
await expect(bikeFilter.first()).toBeVisible()
await bikeFilter.first().click()
```

**問題**: 複数の "Bike" ボタンがマッチする可能性がある
- カテゴリフィルタボタンのセレクタが曖昧
- UI の構造に依存している

**改善案**:
```typescript
// より具体的なセレクタ
const categoryFilters = page.locator('nav').getByRole('button', { name: /Bike|Car|Bicycle/ })
const bikeFilter = categoryFilters.getByText(/^Bike$/)
await bikeFilter.click()
```

---

### 問題 2: 待機処理の不安定性 ❌

#### 多用されている `waitForTimeout()`

複数箇所で時間ベースの待機が使用されており、ネットワーク遅延に弱い：

| 行番号 | 箇所 | 問題 |
|--------|------|------|
| 164 | 検索フィルタテスト | 500ms は固定值。本来は検索結果の変更を待つべき |
| 236 | 車両追加テスト | 3000ms は長すぎる可能性 |
| 264 | 貸出フロー | 1500ms のハードコード |
| 500 | 履歴検索フィルタ | 500ms |

**改善案**:
```typescript
// Before（不安定）
await page.waitForTimeout(500)

// After（堅牢）
await page.waitForFunction(() => {
  return document.querySelectorAll('tbody tr').length > 0
}, { timeout: 5000 })

// または、特定の要素の変更を待つ
await expect(page.getByText(testName)).toBeVisible({ timeout: 5000 })
```

---

### 問題 3: エラーメッセージの確認不足 ⚠️

#### 箇所 1: Line 574-593（Lending で無効な ID）

```typescript
test('Vehicle手動入力で無効なIDを入力するとエラーになる', async ({ page }) => {
  // ... 省略 ...
  await page.getByRole('button', { name: 'Identify Vehicle' }).click()
  await page.waitForTimeout(2000)
  
  // Step 2のままである
  await expect(page.getByText('Step 2')).toBeVisible()
})
```

**問題**: 
- エラーメッセージ自体の表示を確認していない
- ユーザーに何が間違っていたかが不明確

**改善案**:
```typescript
await page.getByRole('button', { name: 'Identify Vehicle' }).click()

// エラーメッセージが表示されることを確認
await expect(page.getByText(/vehicle.*not found|invalid.*vehicle|unknown.*vehicle/i)).toBeVisible({
  timeout: 5000
})

// Step 2 のままであることも確認
await expect(page.getByText('Step 2')).toBeVisible()
```

#### 箇所 2: Line 595-607（Return で無効な ID）

```typescript
test('Return画面で無効なVehicle IDはエラーになる', async ({ page }) => {
  // ... 省略 ...
  await page.getByRole('button', { name: 'Fetch Lending Info' }).click()
  await page.waitForTimeout(2000)
  
  // Step 1のままである
  await expect(page.getByText('Step 1: Identify Vehicle')).toBeVisible()
})
```

**改善案**: 同様にエラーメッセージを確認する

---

### 問題 4: 要件定義書で指摘した認証・ユーザー管理の問題が未テスト ❌

要件定義書 Section 5 で指摘した「認証・ユーザー管理の潜在的な問題」がテストされていません：

#### 未テストの問題:

1. **スタッフアカウント新規作成時の同期不全**
   - auth.users と public.staff テーブルが確実に同期されるか
   - 作成直後にログイン可能か
   - store_id が正しく設定されるか

2. **スタッフ削除後の整合性**
   - auth.users 削除時に public.staff も削除されるか
   - 孤立レコードが残らないか

3. **セッション管理**
   - 複数タブでのセッション同期
   - セッション有効期限切れ後の再ログイン

4. **ユーザー名のメール変換**
   - ユーザー名を `username@rental.local` に正しく変換しているか
   - 内部メール形式が正しいか

---

### 問題 5: テストデータの汚染リスク ⚠️

#### 箇所: Line 365-402（Update Customer テスト）

```typescript
test('Update Customer で顧客情報を正しく更新できる', async ({ page }) => {
  // ... 省略 ...
  
  // 元に戻す（クリーンアップ）
  const editBtn2 = page.locator('tbody tr').first().locator('button').first()
  await editBtn2.click()
  // ... 更新して元に戻す ...
})
```

**問題**:
- テストが途中で失敗した場合、データが汚染される
- `first()` に依存しているため、テスト順序に影響を受ける可能性

**改善案**:
```typescript
test('Update Customer で顧客情報を正しく更新できる', async ({ page }) => {
  await page.goto('/customers')
  
  // テスト用の新規顧客を作成
  const testCustomerName = `E2E Customer ${Date.now()}`
  await createTestCustomer(page, testCustomerName)
  
  // その顧客を更新
  await updateCustomer(page, testCustomerName, `${testCustomerName} Updated`)
  
  // 確認
  await expect(page.getByText(`${testCustomerName} Updated`)).toBeVisible()
  
  // クリーンアップ（テスト用顧客を削除）
  await deleteCustomer(page, `${testCustomerName} Updated`)
})

// ヘルパー関数
async function createTestCustomer(page: Page, name: string) {
  await page.getByRole('button', { name: 'Add New Customer' }).click()
  await page.getByPlaceholder('e.g. John Doe').fill(name)
  await page.getByRole('button', { name: 'Register Customer' }).click()
  await expect(page.getByText(name)).toBeVisible({ timeout: 10_000 })
}

async function deleteCustomer(page: Page, name: string) {
  const row = page.locator('tr').filter({ hasText: name })
  const deleteBtn = row.getByRole('button').last()
  await deleteBtn.click()
  page.on('dialog', dialog => dialog.accept())
  await page.waitForTimeout(1000)
  await expect(page.getByText(name)).not.toBeVisible()
}
```

#### 箇所: Line 430-458（Delete Customer テスト）

```typescript
test('顧客を削除できる', async ({ page }) => {
  // ... 省略 ...
  
  // 最初の行のゴミ箱ボタンをクリック
  const deleteButton = rows.first().locator('button').last()
  await deleteButton.click()
})
```

**問題**: 
- 最初の行を削除しているため、テスト実行順序や前のテストの結果に依存
- `first()` は常に同じ顧客とは限らない

---

### 問題 6: スタッフ・ユーザー管理テストの不完全性 ⚠️

#### Line 712-741（スタッフ追加・削除）

```typescript
test('スタッフを新規追加および削除できる', async ({ page }) => {
  // ... スタッフ作成 ...
  
  // 削除
  const deleteBtn = page.locator('tr', { hasText: tempUser }).getByRole('button').last()
  await deleteBtn.click()
  
  await page.waitForTimeout(2000)
  await expect(page.getByText(`@${tempUser}`)).not.toBeVisible()
})
```

**問題**:
- スタッフ作成直後にすぐ削除している
- **作成したスタッフで実際にログインできるか** テストされていない
- **削除後に auth.users と public.staff が正しく削除されたか** 確認されていない
- **スタッフの権限が正しく適用されるか** テストされていない

**改善案**:
```typescript
test('スタッフ作成直後にログインできるか確認', async ({ page, context }) => {
  // Step 1: スタッフを作成
  await page.goto('/settings')
  const staffName = `teststaff${Date.now()}`
  const staffPass = 'password123'
  
  await page.getByRole('button', { name: 'Add Staff' }).click()
  await page.getByPlaceholder('staff123').fill(staffName)
  await page.getByPlaceholder('••••••••').last().fill(staffPass)
  await page.getByRole('button', { name: 'Create Account' }).click()
  
  // Step 2: 作成を確認
  await expect(page.getByText(`@${staffName}`)).toBeVisible({ timeout: 10_000 })
  
  // Step 3: ログアウト
  await page.locator('header').getByText(/^@/).first().click()
  await page.getByText('Logout').click()
  await page.waitForURL('/login')
  
  // Step 4: 新しいスタッフでログイン可能か確認
  await page.getByPlaceholder('admin').fill(staffName)
  await page.getByPlaceholder('••••••••').fill(staffPass)
  await page.getByRole('button', { name: 'Sign In' }).click()
  
  // ログインに成功すればダッシュボードへ
  await expect(page).toHaveURL('/', { timeout: 15_000 })
  
  // Step 5: クリーンアップ（元のアカウントで戻ってから削除）
  await context.clearCookies()
  // 元のアカウントで再ログイン
  // ... スタッフを削除 ...
})
```

---

### 問題 7: マルチテナント機能の不完全なテスト ⚠️

#### Line 747-827（Multi-tenant Management Flow）

```typescript
test.describe('Multi-tenant Management Flow', () => {
  const NEW_STORE_NAME = `E2E Store ${Date.now()}`
  const NEW_ADMIN_NAME = `admin${Date.now()}`
  
  test('新規店舗を作成し、その店舗の管理者を登録できる', async ({ page }) => {
    // ... 店舗作成と管理者登録 ...
  })
  
  test('作成した新店舗のAdminでログインし、スタッフを管理できる', async ({ page }) => {
    // ... ログインしてスタッフ管理 ...
  })
})
```

**問題**:
1. 2 つのテストが同じ状態変数 `NEW_STORE_NAME`, `NEW_ADMIN_NAME` に依存
   - テスト実行順序に依存
   - 並列実行時にエラーの可能性

2. `new Set<string>()` でテストデータを管理していない
   - テストが重複して実行される可能性
   - クリーンアップが不完全

**改善案**:
```typescript
// テストコンテキストレベルで管理
const testData = {
  store: null as { id: string; name: string } | null,
  admin: null as { username: string; password: string } | null
}

test.describe('Multi-tenant Management Flow', () => {
  test('新規店舗を作成し、その店舗の管理者を登録できる', async ({ page }) => {
    // 店舗を作成
    const storeName = `E2E Store ${Date.now()}`
    // ... 店舗作成処理 ...
    testData.store = { id: 'store-id', name: storeName }
    
    // 管理者を作成
    const adminName = `admin${Date.now()}`
    // ... 管理者作成処理 ...
    testData.admin = { username: adminName, password: 'password123' }
  })
  
  test('作成した新店舗のAdminでログインし、スタッフを管理できる', async ({ page }) => {
    // testData から値を取得
    expect(testData.admin).toBeTruthy()
    
    // ... ログインしてスタッフ管理 ...
  })
  
  // クリーンアップ
  test.afterAll(async ({ page }) => {
    if (testData.admin?.username) {
      // 管理者アカウントを削除
      // ...
    }
  })
})
```

---

## 3. 追加すべきテストケース

### 3.1 認証・セキュリティ関連

```typescript
test.describe('Authentication & Security', () => {
  test('無効なパスワードでログイン失敗する', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('admin').fill('testuser')
    await page.getByPlaceholder('••••••••').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    // エラーメッセージが表示される
    await expect(page.getByText(/incorrect|invalid|failed/i)).toBeVisible()
    
    // ログイン画面のまま
    await expect(page).toHaveURL('/login')
  })
  
  test('ログイン済みユーザーが/loginにアクセスするとリダイレクトされる', async ({ page }) => {
    // beforeEach でログイン済みの状態
    await page.goto('/login')
    
    // ダッシュボードにリダイレクトされる
    await expect(page).toHaveURL('/')
  })
  
  test('未ログインユーザーが保護ページにアクセスするとリダイレクトされる', async ({ page, context }) => {
    // ログイン状態をクリア
    await context.clearCookies()
    await page.goto('/vehicles')
    
    // ログインページにリダイレクト
    await expect(page).toHaveURL('/login')
  })
})
```

### 3.2 ユーザー管理関連

```typescript
test.describe('User Management & Data Integrity', () => {
  test('スタッフ作成直後にそのスタッフでログイン可能', async ({ page, context }) => {
    // スタッフ作成 → ログアウト → 新規スタッフで再ログイン → ログイン成功確認
  })
  
  test('スタッフ削除後、そのスタッフはログインできない', async ({ page }) => {
    // スタッフ作成 → 削除 → ログイン試行 → ログイン失敗確認
  })
  
  test('スタッフロール変更が正しく反映される', async ({ page }) => {
    // スタッフ作成 → ロール変更 → ロール確認
  })
})
```

### 3.3 データベース整合性関連

```typescript
test.describe('Database Integrity', () => {
  test('顧客削除時に関連する取引もクリーンアップされるか', async ({ page }) => {
    // 顧客を作成 → 取引を作成 → 顧客を削除 → 取引履歴を確認
  })
  
  test('車両削除時に関連データがクリーンアップされるか', async ({ page }) => {
    // 車両を作成 → 取引を作成 → 車両を削除 → 取引履歴を確認
  })
})
```

### 3.4 店舗隔離（マルチテナント）関連

```typescript
test.describe('Multi-tenant Isolation', () => {
  test('ストア A のスタッフはストア B の車両を見ることができない', async ({ page }) => {
    // ストア A でログイン → 車両数を確認
    // ストア B のスタッフでログイン → 異なる車両数を確認
  })
})
```

---

## 4. テストの再構成提案

### 現在の構成
```
test.describe('Dashboard')
test.describe('Vehicle List')
test.describe('Add Vehicle')
test.describe('Lending Flow')
test.describe('Return Flow')
test.describe('Customers')
test.describe('History')
test.describe('Navigation & Layout')
test.describe('Error Handling & Edge Cases')
test.describe('Status Filters')
test.describe('Settings & User Management')
test.describe('Multi-tenant Management Flow')
```

### 推奨される再構成

```typescript
// グループ 1: 認証・ログイン（全テストの前提）
test.describe('Authentication', () => {
  // ✅ ログイン成功
  // ✅ ログイン失敗
  // ✅ セッション管理
})

// グループ 2: 基本機能（実装済み）
test.describe('Core Features', () => {
  test.describe('Dashboard')
  test.describe('Vehicles')
  test.describe('Customers')
  test.describe('History')
  test.describe('Rentals')
})

// グループ 3: ユーザー管理（改善予定）
test.describe('User Management', () => {
  // スタッフ作成・削除
  // ロール管理
  // セッション管理
})

// グループ 4: マルチテナント
test.describe('Multi-Tenant', () => {
  // 店舗管理
  // データ隔離
})

// グループ 5: セキュリティ・エラーハンドリング
test.describe('Security & Error Handling', () => {
  // 入力バリデーション
  // エラーメッセージ
  // 権限チェック
})

// グループ 6: 統合テスト
test.describe('Integration Flows', () => {
  // エンドツーエンドの完全なフロー
})
```

---

## 5. テストのメンテナンス性改善

### 5.1 ページオブジェクトモデル（POM）導入

```typescript
// pages/BasePage.ts
export class BasePage {
  constructor(protected page: Page) {}
  
  async goto(path: string) {
    await this.page.goto(path)
    await this.page.waitForLoadState('networkidle')
  }
  
  async waitForLoadingComplete() {
    try {
      await this.page.waitForSelector('.animate-spin', { state: 'detached', timeout: 5000 })
    } catch {}
  }
}

// pages/LoginPage.ts
export class LoginPage extends BasePage {
  async login(username: string, password: string) {
    await this.goto('/login')
    await this.page.getByPlaceholder('admin').fill(username)
    await this.page.getByPlaceholder('••••••••').fill(password)
    await this.page.getByRole('button', { name: 'Sign In' }).click()
    await this.page.waitForURL('/', { timeout: 15_000 })
  }
}

// pages/VehiclesPage.ts
export class VehiclesPage extends BasePage {
  async addVehicle(name: string) {
    await this.goto('/vehicles')
    await this.page.getByRole('button', { name: 'Add Vehicle' }).click()
    await this.page.getByPlaceholder(/vehicle name|Honda/i).fill(name)
    await this.page.getByRole('button', { name: 'Save Vehicle' }).click()
    await expect(this.page.getByText(name)).toBeVisible({ timeout: 10_000 })
  }
}

// テストコード
test('新しい車両を追加できる', async ({ page }) => {
  const loginPage = new LoginPage(page)
  const vehiclesPage = new VehiclesPage(page)
  
  await loginPage.login(TEST_USERNAME, TEST_PASSWORD)
  await vehiclesPage.addVehicle('E2E Test Vehicle')
})
```

---

## 6. チェックリスト

改善を実施する場合の優先度：

### 🔴 高優先度（実装必須）
- [ ] 問題 4: 認証・ユーザー管理テストの追加
- [ ] 問題 5: テストデータ汚染の防止
- [ ] 問題 3: エラーメッセージの確認追加
- [ ] 問題 2: waitForTimeout の削減

### 🟡 中優先度（推奨）
- [ ] 問題 6: スタッフ作成直後のログインテスト
- [ ] 問題 7: マルチテナント テストの改善
- [ ] セキュリティテストの追加
- [ ] ページオブジェクトモデルの導入

### 🟢 低優先度（改善）
- [ ] 問題 1: セレクタの正確性向上
- [ ] テストの再構成
- [ ] テストレポートの拡張

---

## 7. 実装例

### セレクタの改善例

**Before**:
```typescript
await page.getByPlaceholder('e.g. Honda PCX 150').fill(testName)
```

**After**:
```typescript
// より堅牢な方法 1: role による
const vehicleNameInput = page.getByRole('textbox', { name: /name|vehicle/i })
await vehicleNameInput.fill(testName)

// より堅牢な方法 2: test ID を使用（UI に test-id を追加）
const vehicleNameInput = page.locator('[data-testid="vehicle-name-input"]')
await vehicleNameInput.fill(testName)

// より堅牢な方法 3: 複合セレクタ
const vehicleNameInput = page.locator('form')
  .locator('input[type="text"]')
  .first()
await vehicleNameInput.fill(testName)
```

### 待機処理の改善例

**Before**:
```typescript
await page.waitForTimeout(500)
const rows = page.locator('tbody tr')
const count = await rows.count()
```

**After**:
```typescript
// 方法 1: 要素の存在を待つ
await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 5000 })

// 方法 2: テキストの出現を待つ
await expect(page.getByText(searchTerm)).toBeVisible({ timeout: 5000 })

// 方法 3: ネットワーク待機
await page.waitForLoadState('networkidle')

// 方法 4: 関数ベース（複雑な条件）
await page.waitForFunction(() => {
  const rows = document.querySelectorAll('tbody tr')
  return rows.length > 0 && Array.from(rows).every(r => !r.textContent?.includes('Loading'))
}, { timeout: 5000 })
```

---

## 結論

E2E テストは **基本的な機能カバレッジは達成しているが、要件定義書で指摘した認証・ユーザー管理の問題が未テスト** です。

### 優先して実施すべき改善：

1. **認証・ユーザー管理テストの追加** → 潜在的なバグを事前に検出
2. **テストデータ汚染の防止** → テスト信頼性の向上
3. **エラーメッセージ確認** → ユーザー体験の検証
4. **waitForTimeout の削減** → テスト実行時間の短縮と安定性向上

これらの改善により、テストスイートの品質と保守性が大幅に向上します。

---

**文書終了**
