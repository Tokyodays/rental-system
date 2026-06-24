# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rental-system.spec.ts >> Multi-tenant Management Flow >> 新規店舗を作成し、その店舗の管理者を登録できる
- Location: e2e/rental-system.spec.ts:866:3

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('button', { name: /Add|add/ }) resolved to 13 elements:
    1) <button type="button" data-slot="base" id="btn-add-store" class="rounded-md font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 transition-colors px-2.5 py-1.5 text-sm gap-1.5 text-inverted bg-primary hover:bg-primary/75 active:bg-primary/75 disabled:bg-primary aria-disabled:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer">…</button> aka getByRole('button', { name: 'Add Store' })
    2) <button type="button" data-slot="base" class="rounded-md font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 transition-colors px-2 py-1 text-xs gap-1 text-primary hover:bg-primary/10 active:bg-primary/10 focus:outline-none focus-visible:bg-primary/10 disabled:bg-transparent aria-disabled:bg-transparent dark:disabled:bg-transparent dark:aria-disabled:bg-transparent">…</button> aka getByRole('row', { name: 'Main Store 123 Tokyo St. LAK' }).getByRole('button')
    3) <button type="button" data-slot="base" class="rounded-md font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 transition-colors px-2 py-1 text-xs gap-1 text-primary hover:bg-primary/10 active:bg-primary/10 focus:outline-none focus-visible:bg-primary/10 disabled:bg-transparent aria-disabled:bg-transparent dark:disabled:bg-transparent dark:aria-disabled:bg-transparent">…</button> aka getByRole('row', { name: 'E2E Store 1776532653436 — THB' }).getByRole('button')
    4) <button type="button" data-slot="base" class="rounded-md font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 transition-colors px-2 py-1 text-xs gap-1 text-primary hover:bg-primary/10 active:bg-primary/10 focus:outline-none focus-visible:bg-primary/10 disabled:bg-transparent aria-disabled:bg-transparent dark:disabled:bg-transparent dark:aria-disabled:bg-transparent">…</button> aka getByRole('row', { name: 'E2E Store 1776532691115 — THB' }).getByRole('button')
    5) <button type="button" data-slot="base" class="rounded-md font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 transition-colors px-2 py-1 text-xs gap-1 text-primary hover:bg-primary/10 active:bg-primary/10 focus:outline-none focus-visible:bg-primary/10 disabled:bg-transparent aria-disabled:bg-transparent dark:disabled:bg-transparent dark:aria-disabled:bg-transparent">…</button> aka getByRole('row', { name: 'E2E Store 1776532722134 — THB' }).getByRole('button')
    6) <button type="button" data-slot="base" class="rounded-md font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 transition-colors px-2 py-1 text-xs gap-1 text-primary hover:bg-primary/10 active:bg-primary/10 focus:outline-none focus-visible:bg-primary/10 disabled:bg-transparent aria-disabled:bg-transparent dark:disabled:bg-transparent dark:aria-disabled:bg-transparent">…</button> aka getByRole('row', { name: 'E2E Store 1776532772601 — THB' }).getByRole('button')
    7) <button type="button" data-slot="base" class="rounded-md font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 transition-colors px-2 py-1 text-xs gap-1 text-primary hover:bg-primary/10 active:bg-primary/10 focus:outline-none focus-visible:bg-primary/10 disabled:bg-transparent aria-disabled:bg-transparent dark:disabled:bg-transparent dark:aria-disabled:bg-transparent">…</button> aka getByRole('button', { name: 'Add Admin' }).nth(5)
    8) <button type="button" data-slot="base" class="rounded-md font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 transition-colors px-2 py-1 text-xs gap-1 text-primary hover:bg-primary/10 active:bg-primary/10 focus:outline-none focus-visible:bg-primary/10 disabled:bg-transparent aria-disabled:bg-transparent dark:disabled:bg-transparent dark:aria-disabled:bg-transparent">…</button> aka locator('tr:nth-child(7) > .px-6.py-4.text-right > .rounded-md')
    9) <button type="button" data-slot="base" class="rounded-md font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 transition-colors px-2 py-1 text-xs gap-1 text-primary hover:bg-primary/10 active:bg-primary/10 focus:outline-none focus-visible:bg-primary/10 disabled:bg-transparent aria-disabled:bg-transparent dark:disabled:bg-transparent dark:aria-disabled:bg-transparent">…</button> aka locator('tr:nth-child(8) > .px-6.py-4.text-right > .rounded-md')
    10) <button type="button" data-slot="base" class="rounded-md font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 transition-colors px-2 py-1 text-xs gap-1 text-primary hover:bg-primary/10 active:bg-primary/10 focus:outline-none focus-visible:bg-primary/10 disabled:bg-transparent aria-disabled:bg-transparent dark:disabled:bg-transparent dark:aria-disabled:bg-transparent">…</button> aka locator('tr:nth-child(9) > .px-6.py-4.text-right > .rounded-md')
    ...

Call log:
  - waiting for getByRole('button', { name: /Add|add/ })

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
          - link "Vehicles" [ref=e15] [cursor=pointer]:
            - /url: /vehicles
            - text: Vehicles
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
          - link "Store Management" [ref=e25] [cursor=pointer]:
            - /url: /admin/stores
            - text: Store Management
        - link "Settings" [ref=e28] [cursor=pointer]:
          - /url: /settings
          - text: Settings
      - generic [ref=e30]:
        - banner [ref=e31]:
          - heading "Rental System" [level=2] [ref=e33]
          - generic [ref=e35] [cursor=pointer]:
            - generic [ref=e36]: "@admin"
            - img "Avatar" [ref=e38]
        - main [ref=e39]:
          - generic [ref=e40]:
            - generic [ref=e41]:
              - generic [ref=e42]:
                - heading "Store Management" [level=1] [ref=e43]
                - paragraph [ref=e44]: Manage all business locations
              - button "Add Store" [ref=e45] [cursor=pointer]:
                - generic [ref=e47]: Add Store
            - table [ref=e50]:
              - rowgroup [ref=e51]:
                - row "Name Address Currency Actions" [ref=e52]:
                  - columnheader "Name" [ref=e53]
                  - columnheader "Address" [ref=e54]
                  - columnheader "Currency" [ref=e55]
                  - columnheader "Actions" [ref=e56]
              - rowgroup [ref=e57]:
                - row "Main Store 123 Tokyo St. LAK Add Admin" [ref=e58]:
                  - cell "Main Store" [ref=e59]
                  - cell "123 Tokyo St." [ref=e60]
                  - cell "LAK" [ref=e61]
                  - cell "Add Admin" [ref=e62]:
                    - button "Add Admin" [ref=e63]:
                      - generic [ref=e65]: Add Admin
                - row "E2E Store 1776532653436 — THB Add Admin" [ref=e66]:
                  - cell "E2E Store 1776532653436" [ref=e67]
                  - cell "—" [ref=e68]
                  - cell "THB" [ref=e69]
                  - cell "Add Admin" [ref=e70]:
                    - button "Add Admin" [ref=e71]:
                      - generic [ref=e73]: Add Admin
                - row "E2E Store 1776532691115 — THB Add Admin" [ref=e74]:
                  - cell "E2E Store 1776532691115" [ref=e75]
                  - cell "—" [ref=e76]
                  - cell "THB" [ref=e77]
                  - cell "Add Admin" [ref=e78]:
                    - button "Add Admin" [ref=e79]:
                      - generic [ref=e81]: Add Admin
                - row "E2E Store 1776532722134 — THB Add Admin" [ref=e82]:
                  - cell "E2E Store 1776532722134" [ref=e83]
                  - cell "—" [ref=e84]
                  - cell "THB" [ref=e85]
                  - cell "Add Admin" [ref=e86]:
                    - button "Add Admin" [ref=e87]:
                      - generic [ref=e89]: Add Admin
                - row "E2E Store 1776532772601 — THB Add Admin" [ref=e90]:
                  - cell "E2E Store 1776532772601" [ref=e91]
                  - cell "—" [ref=e92]
                  - cell "THB" [ref=e93]
                  - cell "Add Admin" [ref=e94]:
                    - button "Add Admin" [ref=e95]:
                      - generic [ref=e97]: Add Admin
                - row "E2E Store 1776532807107 — THB Add Admin" [ref=e98]:
                  - cell "E2E Store 1776532807107" [ref=e99]
                  - cell "—" [ref=e100]
                  - cell "THB" [ref=e101]
                  - cell "Add Admin" [ref=e102]:
                    - button "Add Admin" [ref=e103]:
                      - generic [ref=e105]: Add Admin
                - row "E2E Store 1776532851474 — THB Add Admin" [ref=e106]:
                  - cell "E2E Store 1776532851474" [ref=e107]
                  - cell "—" [ref=e108]
                  - cell "THB" [ref=e109]
                  - cell "Add Admin" [ref=e110]:
                    - button "Add Admin" [ref=e111]:
                      - generic [ref=e113]: Add Admin
                - row "E2E Store 1776532898109 — THB Add Admin" [ref=e114]:
                  - cell "E2E Store 1776532898109" [ref=e115]
                  - cell "—" [ref=e116]
                  - cell "THB" [ref=e117]
                  - cell "Add Admin" [ref=e118]:
                    - button "Add Admin" [ref=e119]:
                      - generic [ref=e121]: Add Admin
                - row "E2E Store 1776532941549 — THB Add Admin" [ref=e122]:
                  - cell "E2E Store 1776532941549" [ref=e123]
                  - cell "—" [ref=e124]
                  - cell "THB" [ref=e125]
                  - cell "Add Admin" [ref=e126]:
                    - button "Add Admin" [ref=e127]:
                      - generic [ref=e129]: Add Admin
                - row "E2E Store 1776532981934 — THB Add Admin" [ref=e130]:
                  - cell "E2E Store 1776532981934" [ref=e131]
                  - cell "—" [ref=e132]
                  - cell "THB" [ref=e133]
                  - cell "Add Admin" [ref=e134]:
                    - button "Add Admin" [ref=e135]:
                      - generic [ref=e137]: Add Admin
                - row "E2E Store 1776751354150 — THB Add Admin" [ref=e138]:
                  - cell "E2E Store 1776751354150" [ref=e139]
                  - cell "—" [ref=e140]
                  - cell "THB" [ref=e141]
                  - cell "Add Admin" [ref=e142]:
                    - button "Add Admin" [ref=e143]:
                      - generic [ref=e145]: Add Admin
                - row "E2E Store 1776936225045 — THB Add Admin" [ref=e146]:
                  - cell "E2E Store 1776936225045" [ref=e147]
                  - cell "—" [ref=e148]
                  - cell "THB" [ref=e149]
                  - cell "Add Admin" [ref=e150]:
                    - button "Add Admin" [ref=e151]:
                      - generic [ref=e153]: Add Admin
  - generic:
    - img
  - generic [ref=e154]:
    - button "Toggle Nuxt DevTools" [ref=e155] [cursor=pointer]:
      - img [ref=e156]
    - generic "Page load time" [ref=e159]:
      - generic [ref=e160]: "121"
      - generic [ref=e161]: ms
    - button "Toggle Component Inspector" [ref=e163] [cursor=pointer]:
      - img [ref=e164]
  - region "Notifications (F8)":
    - list
```

# Test source

```ts
  774 | 
  775 |       const statusBadges = page.locator('tbody tr td:nth-child(3) span')
  776 |       const count = await statusBadges.count()
  777 |       for (let i = 0; i < count; i++) {
  778 |         const text = await statusBadges.nth(i).textContent()
  779 |         expect(text?.trim()).toBe('Available')
  780 |       }
  781 |     }
  782 |   })
  783 | 
  784 |   test('Customer一覧のステータスフィルタが機能する', async ({ page }) => {
  785 |     await page.goto('/customers')
  786 |     await page.waitForLoadState('networkidle')
  787 |     await waitForLoadingComplete(page)
  788 | 
  789 |     const activeFilter = page.locator('button', { hasText: 'Active' })
  790 |     if (await activeFilter.first().isVisible()) {
  791 |       await activeFilter.first().click()
  792 |       await page.waitForTimeout(500)
  793 | 
  794 |       const rows = page.locator('tbody tr')
  795 |       const count = await rows.count()
  796 |       expect(count).toBeGreaterThanOrEqual(0)
  797 |     }
  798 |   })
  799 | })
  800 | 
  801 | // ============================================================
  802 | // 11. Settings & User Management
  803 | // ============================================================
  804 | test.describe('Settings & User Management', () => {
  805 |   test('言語切替が機能し、UI全体に反映される', async ({ page }) => {
  806 |     await page.goto('/settings')
  807 |     await page.waitForLoadState('networkidle')
  808 |     await waitForLoadingComplete(page)
  809 | 
  810 |     // Bahasa Melayu を選択
  811 |     const malayOption = page.getByText('Bahasa Melayu')
  812 |     await expect(malayOption).toBeVisible()
  813 |     await malayOption.click()
  814 | 
  815 |     // 保存
  816 |     await page.getByRole('button', { name: 'Save' }).click()
  817 |     // 言語の変更が反映されるまで待機
  818 |     await expect(page.locator('aside')).toContainText('Papan Pemuka', { timeout: 5000 })
  819 | 
  820 |     // 元の言語（English）に戻す
  821 |     await page.getByText('English').click()
  822 |     await page.getByRole('button', { name: 'Save' }).click()
  823 |     await expect(page.locator('aside')).toContainText('Dashboard', { timeout: 5000 })
  824 |   })
  825 | 
  826 |   test('スタッフを新規追加および削除できる', async ({ page }) => {
  827 |     await page.goto('/settings')
  828 |     await page.waitForLoadState('networkidle')
  829 |     await waitForLoadingComplete(page)
  830 | 
  831 |     // スタッフ追加モーダルを開く
  832 |     await page.getByRole('button', { name: 'Add Staff' }).click()
  833 |     await expect(page.getByText('Add New Staff')).toBeVisible()
  834 | 
  835 |     const tempUser = `testuser${Date.now()}`
  836 |     const inputs = page.locator('input')
  837 |     await inputs.filter({ hasText: /staff|username/ }).first().fill(tempUser)
  838 |     await inputs.filter({ hasText: /password/ }).last().fill('password123')
  839 | 
  840 |     // 作成
  841 |     const createButton = page.getByRole('button', { name: /Create|create/ })
  842 |     await createButton.click()
  843 | 
  844 |     // 一覧に表示されるまで待機
  845 |     await expect(page.locator('tbody').getByText(tempUser)).toBeVisible({ timeout: 10_000 })
  846 | 
  847 |     // ダイアログ（window.confirm）はクリック前にハンドラを登録する必要がある
  848 |     page.on('dialog', dialog => dialog.accept())
  849 | 
  850 |     // 削除
  851 |     const deleteBtn = page.locator('tr').filter({ hasText: tempUser }).locator('button').last()
  852 |     await deleteBtn.click()
  853 | 
  854 |     // 削除が完了するまで待機
  855 |     await expect(page.locator('tbody').getByText(tempUser)).not.toBeVisible({ timeout: 10_000 })
  856 |   })
  857 | })
  858 | 
  859 | // ============================================================
  860 | // 12. Multi-tenant Management Flow
  861 | // ============================================================
  862 | test.describe('Multi-tenant Management Flow', () => {
  863 |   const NEW_STORE_NAME = `E2E Store ${Date.now()}`
  864 |   const NEW_ADMIN_NAME = `admin${Date.now()}`
  865 | 
  866 |   test('新規店舗を作成し、その店舗の管理者を登録できる', async ({ page }) => {
  867 |     await login(page, TEST_USERNAME, TEST_PASSWORD)
  868 |     await page.goto('/admin/stores')
  869 |     await page.waitForLoadState('networkidle')
  870 |     await waitForLoadingComplete(page)
  871 | 
  872 |     // 店舗追加
  873 |     const addStoreButton = page.getByRole('button', { name: /Add|add/ })
> 874 |     await addStoreButton.click()
      |                          ^ Error: locator.click: Error: strict mode violation: getByRole('button', { name: /Add|add/ }) resolved to 13 elements:
  875 | 
  876 |     // 店舗名を入力
  877 |     const storeNameInput = page.locator('input[type="text"]').first()
  878 |     await storeNameInput.fill(NEW_STORE_NAME)
  879 | 
  880 |     // 作成ボタンをクリック
  881 |     const createButton = page.getByRole('button', { name: /Create|create/ })
  882 |     await createButton.click()
  883 | 
  884 |     // 店舗がリストに現れるまで待機
  885 |     await expect(page.locator('tbody').getByText(NEW_STORE_NAME)).toBeVisible({ timeout: 15000 })
  886 | 
  887 |     // その店舗にAdminを追加
  888 |     const storeRow = page.locator('tr').filter({ hasText: NEW_STORE_NAME }).first()
  889 |     await expect(storeRow).toBeVisible()
  890 | 
  891 |     const addAdminButton = storeRow.getByRole('button', { name: /Add|add/ })
  892 |     await addAdminButton.click()
  893 | 
  894 |     // 管理者情報を入力
  895 |     const inputs = page.locator('input[type="text"], input[type="password"]')
  896 |     await inputs.first().fill(NEW_ADMIN_NAME)
  897 |     await inputs.last().fill('password123')
  898 | 
  899 |     const createAdminButton = page.getByRole('button', { name: /Create|create/ })
  900 |     await createAdminButton.click()
  901 | 
  902 |     // 管理者作成完了を待機
  903 |     await page.locator('tbody').getByText(NEW_ADMIN_NAME).waitFor({ state: 'visible', timeout: 10000 })
  904 | 
  905 |     // ログアウト
  906 |     await logout(page)
  907 |   })
  908 | 
  909 |   test('作成した新店舗のAdminでログインし、スタッフを管理できる', async ({ page, context }) => {
  910 |     // セッションを明示的にクリア
  911 |     await clearSession(page, context)
  912 |     await page.goto('/login')
  913 |     await page.waitForURL('/login')
  914 | 
  915 |     // 新しいAdminでログイン
  916 |     await login(page, NEW_ADMIN_NAME, 'password123')
  917 | 
  918 |     // 設定（スタッフ管理）へ
  919 |     await page.goto('/settings')
  920 |     await page.waitForLoadState('networkidle')
  921 |     await waitForLoadingComplete(page)
  922 | 
  923 |     // スタッフを追加
  924 |     const staffName = `staff${Date.now()}`
  925 |     const addStaffButton = page.getByRole('button', { name: /Add|add/ })
  926 |     await addStaffButton.click()
  927 | 
  928 |     const inputs = page.locator('input[type="text"], input[type="password"]')
  929 |     await inputs.first().fill(staffName)
  930 |     await inputs.last().fill('password123')
  931 | 
  932 |     const createButton = page.getByRole('button', { name: /Create|create/ })
  933 |     await createButton.click()
  934 | 
  935 |     // スタッフが作成されるまで待機
  936 |     await expect(page.locator('tbody').getByText(staffName)).toBeVisible({ timeout: 10_000 })
  937 | 
  938 |     // スタッフのロール更新（オプション）
  939 |     const row = page.locator('tr').filter({ hasText: staffName })
  940 |     const roleSwitch = row.locator('button[role="switch"]')
  941 |     if (await roleSwitch.isVisible()) {
  942 |       await roleSwitch.click()
  943 | 
  944 |       // window.confirm ハンドラはクリック前に登録する
  945 |       page.on('dialog', d => d.accept())
  946 |     }
  947 | 
  948 |     // スタッフの削除
  949 |     const deleteButton = row.getByRole('button').last()
  950 |     await deleteButton.click()
  951 | 
  952 |     // 削除が完了するまで待機
  953 |     await expect(page.locator('tbody').getByText(staffName)).not.toBeVisible({ timeout: 10_000 })
  954 |   })
  955 | })
  956 | 
  957 | // ============================================================
  958 | // 13. Authentication & Security Tests (改善: 要件定義書の問題対応)
  959 | // ============================================================
  960 | test.describe('Authentication & Security', () => {
  961 |   test('無効なパスワードでログイン失敗する', async ({ page }) => {
  962 |     await page.goto('/login')
  963 |     await page.waitForLoadState('networkidle')
  964 | 
  965 |     // 無効なパスワードを入力
  966 |     await page.getByPlaceholder('admin').fill(TEST_USERNAME)
  967 |     await page.getByPlaceholder('••••••••').fill('wrongpassword123')
  968 |     await page.getByRole('button', { name: 'Sign In' }).click()
  969 | 
  970 |     // エラーメッセージが表示される
  971 |     await expect(page.locator('[role="alert"], .text-red-500, .text-error').first())
  972 |       .toBeVisible({ timeout: 5000 })
  973 | 
  974 |     // ログイン画面のままであることを確認
```