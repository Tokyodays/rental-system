# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rental-system.spec.ts >> Multi-tenant Management Flow >> 新規店舗を作成し、その店舗の管理者を登録できる
- Location: e2e/rental-system.spec.ts:743:3

# Error details

```
TimeoutError: locator.click: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('tr').filter({ hasText: 'E2E Store 1776532981934' }).first().getByRole('button', { name: /Add Admin/i })

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
            - text: Vehicles
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
          - link:
            - /url: /admin/stores
            - text: Store Management
        - generic:
          - link:
            - /url: /settings
            - text: Settings
      - generic:
        - banner:
          - generic:
            - heading [level=2]: Rental System
          - generic:
            - generic:
              - generic: "@admin"
              - generic:
                - img
        - main:
          - generic:
            - generic:
              - generic:
                - heading [level=1]: Store Management
                - paragraph: Manage all business locations
              - button:
                - generic: Add Store
            - generic:
              - generic:
                - table:
                  - rowgroup:
                    - row:
                      - columnheader: Name
                      - columnheader: Address
                      - columnheader: Currency
                      - columnheader: Actions
                  - rowgroup:
                    - row:
                      - cell: Main Store
                      - cell: 123 Tokyo St.
                      - cell: LAK
                      - cell:
                        - button:
                          - generic: Add Admin
                    - row:
                      - cell: E2E Store 1776532653436
                      - cell: —
                      - cell: THB
                      - cell:
                        - button:
                          - generic: Add Admin
                    - row:
                      - cell: E2E Store 1776532691115
                      - cell: —
                      - cell: THB
                      - cell:
                        - button:
                          - generic: Add Admin
                    - row:
                      - cell: E2E Store 1776532722134
                      - cell: —
                      - cell: THB
                      - cell:
                        - button:
                          - generic: Add Admin
                    - row:
                      - cell: E2E Store 1776532772601
                      - cell: —
                      - cell: THB
                      - cell:
                        - button:
                          - generic: Add Admin
                    - row:
                      - cell: E2E Store 1776532807107
                      - cell: —
                      - cell: THB
                      - cell:
                        - button:
                          - generic: Add Admin
                    - row:
                      - cell: E2E Store 1776532851474
                      - cell: —
                      - cell: THB
                      - cell:
                        - button:
                          - generic: Add Admin
                    - row:
                      - cell: E2E Store 1776532898109
                      - cell: —
                      - cell: THB
                      - cell:
                        - button:
                          - generic: Add Admin
                    - row:
                      - cell: E2E Store 1776532941549
                      - cell: —
                      - cell: THB
                      - cell:
                        - button:
                          - generic: Add Admin
                    - row:
                      - cell: E2E Store 1776532981934
                      - cell: —
                      - cell: THB
                      - cell:
                        - button:
                          - generic: Add Admin
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - generic: Store Name*
                  - generic:
                    - generic:
                      - textbox:
                        - /placeholder: Branch Name
                - generic:
                  - generic:
                    - generic:
                      - generic: Address
                  - generic:
                    - generic:
                      - textbox:
                        - /placeholder: 123 Street, City
                - generic:
                  - button:
                    - generic: Cancel
                  - button:
                    - generic: Create Store
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - generic: Admin Username*
                  - generic:
                    - generic:
                      - textbox:
                        - /placeholder: branch_admin
                - generic:
                  - generic:
                    - generic:
                      - generic: Password*
                  - generic:
                    - generic:
                      - textbox:
                        - /placeholder: ••••••••
                - generic:
                  - button:
                    - generic: Cancel
                  - button:
                    - generic: Create Admin
  - generic:
    - img
  - generic [ref=e1]:
    - button [ref=e2] [cursor=pointer]:
      - img [ref=e3]
    - generic [ref=e6]:
      - generic [ref=e7]: "55"
      - generic [ref=e8]: ms
    - button [ref=e10] [cursor=pointer]:
      - img [ref=e11]
  - dialog "Add New Store" [ref=e16]:
    - generic [ref=e17]:
      - heading "Add New Store" [level=2] [ref=e19]
      - button "Close" [active] [ref=e20]
```

# Test source

```ts
  661 | 
  662 |     const activeFilter = page.locator('button', { hasText: 'Active' })
  663 |     if (await activeFilter.first().isVisible()) {
  664 |       await activeFilter.first().click()
  665 |       await page.waitForTimeout(500)
  666 | 
  667 |       const rows = page.locator('tbody tr')
  668 |       const count = await rows.count()
  669 |       expect(count).toBeGreaterThanOrEqual(0)
  670 |     }
  671 |   })
  672 | })
  673 | 
  674 | // ============================================================
  675 | // 11. Settings & User Management
  676 | // ============================================================
  677 | test.describe('Settings & User Management', () => {
  678 |   test('言語切替が機能し、UI全体に反映される', async ({ page }) => {
  679 |     await page.goto('/settings')
  680 |     await page.waitForLoadState('networkidle')
  681 |     await waitForLoadingComplete(page)
  682 | 
  683 |     // Bahasa Melayu を選択
  684 |     const malayOption = page.getByText('Bahasa Melayu')
  685 |     await expect(malayOption).toBeVisible()
  686 |     await malayOption.click()
  687 | 
  688 |     // 保存
  689 |     await page.getByRole('button', { name: 'Save' }).click()
  690 |     await page.waitForTimeout(1000)
  691 | 
  692 |     // サイドバーのテキストがマレー語になっているか確認
  693 |     // "Dashboard" -> "Papan Pemuka"
  694 |     await expect(page.locator('aside')).toContainText('Papan Pemuka')
  695 | 
  696 |     // 元の言語（English）に戻す
  697 |     await page.getByText('English').click()
  698 |     await page.getByRole('button', { name: 'Save' }).click()
  699 |     await page.waitForTimeout(1000)
  700 |     await expect(page.locator('aside')).toContainText('Dashboard')
  701 |   })
  702 | 
  703 |   test('スタッフを新規追加および削除できる', async ({ page }) => {
  704 |     await page.goto('/settings')
  705 |     await page.waitForLoadState('networkidle')
  706 |     await waitForLoadingComplete(page)
  707 | 
  708 |     // スタッフ追加モーダルを開く
  709 |     await page.getByRole('button', { name: 'Add Staff' }).click()
  710 |     await expect(page.getByText('Add New Staff')).toBeVisible()
  711 | 
  712 |     const tempUser = `testuser${Date.now()}`
  713 |     await page.getByPlaceholder('John Doe').fill('E2E Test Staff')
  714 |     await page.getByPlaceholder('staff123').fill(tempUser)
  715 |     await page.getByPlaceholder('••••••••').last().fill('password123')
  716 | 
  717 |     // 作成
  718 |     await page.getByRole('button', { name: 'Create Account' }).click()
  719 |     await page.waitForTimeout(3000)
  720 | 
  721 |     // 一覧に表示されるか確認
  722 |     await expect(page.getByText(`@${tempUser}`)).toBeVisible()
  723 | 
  724 |     // 削除
  725 |     const deleteBtn = page.locator('tr', { hasText: tempUser }).getByRole('button').last()
  726 |     await deleteBtn.click()
  727 | 
  728 |     // ダイアログを確認（ブラウザのconfirmをハンドル）
  729 |     page.on('dialog', dialog => dialog.accept())
  730 |     
  731 |     await page.waitForTimeout(2000)
  732 |     await expect(page.getByText(`@${tempUser}`)).not.toBeVisible()
  733 |   })
  734 | })
  735 | 
  736 | // ============================================================
  737 | // 12. Multi-tenant Management Flow
  738 | // ============================================================
  739 | test.describe('Multi-tenant Management Flow', () => {
  740 |   const NEW_STORE_NAME = `E2E Store ${Date.now()}`
  741 |   const NEW_ADMIN_NAME = `admin${Date.now()}`
  742 | 
  743 |   test('新規店舗を作成し、その店舗の管理者を登録できる', async ({ page }) => {
  744 |     await login(page)
  745 |     await page.goto('/admin/stores')
  746 |     await page.waitForLoadState('networkidle')
  747 |     await page.waitForTimeout(1000)
  748 |     
  749 |     // 店舗追加
  750 |     await page.click('#btn-add-store')
  751 |     await page.getByPlaceholder('Branch Name').fill(NEW_STORE_NAME)
  752 |     await page.click('#btn-create-store')
  753 |     
  754 |     // 店舗がリストに現れるまで待機 (テーブル内のセルを確実に特定)
  755 |     await expect(page.locator('td', { hasText: NEW_STORE_NAME }).first()).toBeVisible({ timeout: 15000 })
  756 | 
  757 |     // その店舗にAdminを追加
  758 |     const storeRow = page.locator('tr').filter({ hasText: NEW_STORE_NAME }).first()
  759 |     await storeRow.waitFor({ state: 'visible' })
  760 |     await page.waitForTimeout(500)
> 761 |     await storeRow.getByRole('button', { name: /Add Admin/i }).click()
      |                                                                ^ TimeoutError: locator.click: Timeout 10000ms exceeded.
  762 |     await page.getByPlaceholder('branch_admin').fill(NEW_ADMIN_NAME)
  763 |     await page.getByPlaceholder('••••••••').fill('password123')
  764 |     await page.getByRole('button', { name: 'Create Admin' }).click()
  765 |     await page.waitForTimeout(3000)
  766 | 
  767 |     // ログアウト
  768 |     await page.goto('/')
  769 |     await page.getByRole('button', { name: /@admin/ }).first().click()
  770 |     await page.getByText('Logout').click()
  771 |     await page.waitForURL('/login')
  772 |   })
  773 | 
  774 |   test('作成した新店舗のAdminでログインし、スタッフを管理できる', async ({ page }) => {
  775 |     // 新しいAdminでログイン
  776 |     await page.goto('/login')
  777 |     await page.getByPlaceholder('admin').fill(NEW_ADMIN_NAME)
  778 |     await page.getByPlaceholder('••••••••').fill('password123')
  779 |     await page.getByRole('button', { name: 'Sign In' }).click()
  780 |     await page.waitForURL('/', { timeout: 15_000 })
  781 | 
  782 |     // 設定（スタッフ管理）へ
  783 |     await page.goto('/settings')
  784 |     await page.waitForLoadState('networkidle')
  785 | 
  786 |     // スタッフを追加
  787 |     const staffName = `staff${Date.now()}`
  788 |     await page.getByRole('button', { name: 'Add Staff' }).click()
  789 |     await page.getByPlaceholder('staff123').fill(staffName)
  790 |     await page.getByPlaceholder('••••••••').last().fill('password123')
  791 |     await page.getByRole('button', { name: 'Create Account' }).click()
  792 |     await page.waitForTimeout(2000)
  793 |     await expect(page.getByText(`@${staffName}`)).toBeVisible()
  794 | 
  795 |     // スタッフのロール更新
  796 |     const row = page.locator('tr', { hasText: staffName })
  797 |     await row.locator('button[role="switch"]').click()
  798 |     await page.waitForTimeout(1000)
  799 | 
  800 |     // スタッフの削除
  801 |     await row.getByRole('button').last().click()
  802 |     page.on('dialog', d => d.accept())
  803 |     await page.waitForTimeout(2000)
  804 |     await expect(page.getByText(`@${staffName}`)).not.toBeVisible()
  805 |   })
  806 | })
  807 | 
```