# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rental-system.spec.ts >> Multi-tenant Management Flow >> 作成した新店舗のAdminでログインし、スタッフを管理できる
- Location: e2e/rental-system.spec.ts:774:3

# Error details

```
TimeoutError: locator.fill: Timeout 10000ms exceeded.
Call log:
  - waiting for getByPlaceholder('admin')

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
          - heading "Dashboard Overview" [level=2] [ref=e33]
          - generic [ref=e35] [cursor=pointer]:
            - generic [ref=e36]: "@admin"
            - img "Avatar" [ref=e38]
        - main [ref=e39]:
          - generic [ref=e40]:
            - generic [ref=e41]:
              - generic [ref=e42]:
                - heading "Overview" [level=1] [ref=e43]
                - paragraph [ref=e44]: Check today's rental and return status.
              - link "Lending" [ref=e46] [cursor=pointer]:
                - /url: /rentals/new
                - generic [ref=e48]: Lending
            - generic [ref=e49]:
              - generic [ref=e51]:
                - paragraph [ref=e53]: Lending
                - paragraph [ref=e56]: "0"
              - generic [ref=e58]:
                - paragraph [ref=e60]: Available
                - paragraph [ref=e63]: "1"
              - generic [ref=e65]:
                - paragraph [ref=e67]: Today's Transactions
                - paragraph [ref=e70]: "2"
            - generic [ref=e71]:
              - generic [ref=e73]:
                - heading "Recent Transactions" [level=3] [ref=e74]
                - link "View All" [ref=e75] [cursor=pointer]:
                  - /url: /history
                  - generic [ref=e76]: View All
              - table [ref=e79]:
                - rowgroup [ref=e80]:
                  - row "Item User Action Time Status" [ref=e81]:
                    - columnheader "Item" [ref=e82]
                    - columnheader "User" [ref=e83]
                    - columnheader "Action" [ref=e84]
                    - columnheader "Time" [ref=e85]
                    - columnheader "Status" [ref=e86]
                - rowgroup [ref=e87]:
                  - row "E2E Test Vehicle 1776531624725 CF Cody Fisher Return Apr 19, 02:00 AM Completed" [ref=e88]:
                    - cell "E2E Test Vehicle 1776531624725" [ref=e89]
                    - cell "CF Cody Fisher" [ref=e90]:
                      - generic [ref=e92]: CF
                      - generic [ref=e93]: Cody Fisher
                    - cell "Return" [ref=e94]:
                      - generic [ref=e96] [cursor=pointer]: Return
                    - cell "Apr 19, 02:00 AM" [ref=e97]
                    - cell "Completed" [ref=e98]:
                      - generic [ref=e100]: Completed
                  - row "E2E Test Vehicle 1776531624725 CF Cody Fisher Lend Apr 19, 02:00 AM Completed" [ref=e101]:
                    - cell "E2E Test Vehicle 1776531624725" [ref=e102]
                    - cell "CF Cody Fisher" [ref=e103]:
                      - generic [ref=e105]: CF
                      - generic [ref=e106]: Cody Fisher
                    - cell "Lend" [ref=e107]:
                      - generic [ref=e109] [cursor=pointer]: Lend
                    - cell "Apr 19, 02:00 AM" [ref=e110]
                    - cell "Completed" [ref=e111]:
                      - generic [ref=e113]: Completed
  - generic:
    - img
  - generic [ref=e114]:
    - button "Toggle Nuxt DevTools" [ref=e115] [cursor=pointer]:
      - img [ref=e116]
    - generic "Page load time" [ref=e119]:
      - generic [ref=e120]: "48"
      - generic [ref=e121]: ms
    - button "Toggle Component Inspector" [ref=e123] [cursor=pointer]:
      - img [ref=e124]
  - region "Notifications (F8)":
    - list
```

# Test source

```ts
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
  761 |     await storeRow.getByRole('button', { name: /Add Admin/i }).click()
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
> 777 |     await page.getByPlaceholder('admin').fill(NEW_ADMIN_NAME)
      |                                          ^ TimeoutError: locator.fill: Timeout 10000ms exceeded.
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