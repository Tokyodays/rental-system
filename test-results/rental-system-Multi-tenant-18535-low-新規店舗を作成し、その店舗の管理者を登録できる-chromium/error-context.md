# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rental-system.spec.ts >> Multi-tenant Management Flow >> 新規店舗を作成し、その店舗の管理者を登録できる
- Location: e2e/rental-system.spec.ts:751:3

# Error details

```
TimeoutError: locator.click: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('header').getByText(/^@/).first()

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
                - paragraph [ref=e63]: "3"
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
                  - row "E2E Test Vehicle 1776531624725 CF Cody Fisher Return Apr 23, 06:21 PM Completed" [ref=e88]:
                    - cell "E2E Test Vehicle 1776531624725" [ref=e89]
                    - cell "CF Cody Fisher" [ref=e90]:
                      - generic [ref=e92]: CF
                      - generic [ref=e93]: Cody Fisher
                    - cell "Return" [ref=e94]:
                      - generic [ref=e96] [cursor=pointer]: Return
                    - cell "Apr 23, 06:21 PM" [ref=e97]
                    - cell "Completed" [ref=e98]:
                      - generic [ref=e100]: Completed
                  - row "E2E Test Vehicle 1776531624725 CF Cody Fisher Lend Apr 23, 06:21 PM Completed" [ref=e101]:
                    - cell "E2E Test Vehicle 1776531624725" [ref=e102]
                    - cell "CF Cody Fisher" [ref=e103]:
                      - generic [ref=e105]: CF
                      - generic [ref=e106]: Cody Fisher
                    - cell "Lend" [ref=e107]:
                      - generic [ref=e109] [cursor=pointer]: Lend
                    - cell "Apr 23, 06:21 PM" [ref=e110]
                    - cell "Completed" [ref=e111]:
                      - generic [ref=e113]: Completed
                  - row "E2E Test Vehicle 1776531624725 CF Cody Fisher Return Apr 21, 02:59 PM Completed" [ref=e114]:
                    - cell "E2E Test Vehicle 1776531624725" [ref=e115]
                    - cell "CF Cody Fisher" [ref=e116]:
                      - generic [ref=e118]: CF
                      - generic [ref=e119]: Cody Fisher
                    - cell "Return" [ref=e120]:
                      - generic [ref=e122] [cursor=pointer]: Return
                    - cell "Apr 21, 02:59 PM" [ref=e123]
                    - cell "Completed" [ref=e124]:
                      - generic [ref=e126]: Completed
                  - row "E2E Test Vehicle 1776531624725 CF Cody Fisher Lend Apr 21, 02:59 PM Completed" [ref=e127]:
                    - cell "E2E Test Vehicle 1776531624725" [ref=e128]
                    - cell "CF Cody Fisher" [ref=e129]:
                      - generic [ref=e131]: CF
                      - generic [ref=e132]: Cody Fisher
                    - cell "Lend" [ref=e133]:
                      - generic [ref=e135] [cursor=pointer]: Lend
                    - cell "Apr 21, 02:59 PM" [ref=e136]
                    - cell "Completed" [ref=e137]:
                      - generic [ref=e139]: Completed
                  - row "E2E Test Vehicle 1776531624725 CF Cody Fisher Return Apr 19, 02:00 AM Completed" [ref=e140]:
                    - cell "E2E Test Vehicle 1776531624725" [ref=e141]
                    - cell "CF Cody Fisher" [ref=e142]:
                      - generic [ref=e144]: CF
                      - generic [ref=e145]: Cody Fisher
                    - cell "Return" [ref=e146]:
                      - generic [ref=e148] [cursor=pointer]: Return
                    - cell "Apr 19, 02:00 AM" [ref=e149]
                    - cell "Completed" [ref=e150]:
                      - generic [ref=e152]: Completed
  - generic:
    - img
  - generic [ref=e153]:
    - button "Toggle Nuxt DevTools" [ref=e154] [cursor=pointer]:
      - img [ref=e155]
    - generic "Page load time" [ref=e158]:
      - generic [ref=e159]: "49"
      - generic [ref=e160]: ms
    - button "Toggle Component Inspector" [ref=e162] [cursor=pointer]:
      - img [ref=e163]
  - region "Notifications (F8)":
    - list
```

# Test source

```ts
  679 |     }
  680 |   })
  681 | })
  682 | 
  683 | // ============================================================
  684 | // 11. Settings & User Management
  685 | // ============================================================
  686 | test.describe('Settings & User Management', () => {
  687 |   test('言語切替が機能し、UI全体に反映される', async ({ page }) => {
  688 |     await page.goto('/settings')
  689 |     await page.waitForLoadState('networkidle')
  690 |     await waitForLoadingComplete(page)
  691 | 
  692 |     // Bahasa Melayu を選択
  693 |     const malayOption = page.getByText('Bahasa Melayu')
  694 |     await expect(malayOption).toBeVisible()
  695 |     await malayOption.click()
  696 | 
  697 |     // 保存
  698 |     await page.getByRole('button', { name: 'Save' }).click()
  699 |     await page.waitForTimeout(1000)
  700 | 
  701 |     // サイドバーのテキストがマレー語になっているか確認
  702 |     // "Dashboard" -> "Papan Pemuka"
  703 |     await expect(page.locator('aside')).toContainText('Papan Pemuka')
  704 | 
  705 |     // 元の言語（English）に戻す
  706 |     await page.getByText('English').click()
  707 |     await page.getByRole('button', { name: 'Save' }).click()
  708 |     await page.waitForTimeout(1000)
  709 |     await expect(page.locator('aside')).toContainText('Dashboard')
  710 |   })
  711 | 
  712 |   test('スタッフを新規追加および削除できる', async ({ page }) => {
  713 |     await page.goto('/settings')
  714 |     await page.waitForLoadState('networkidle')
  715 |     await waitForLoadingComplete(page)
  716 | 
  717 |     // スタッフ追加モーダルを開く
  718 |     await page.getByRole('button', { name: 'Add Staff' }).click()
  719 |     await expect(page.getByText('Add New Staff')).toBeVisible()
  720 | 
  721 |     const tempUser = `testuser${Date.now()}`
  722 |     await page.getByPlaceholder('staff123').fill(tempUser)
  723 |     await page.getByPlaceholder('••••••••').last().fill('password123')
  724 | 
  725 |     // 作成
  726 |     await page.getByRole('button', { name: 'Create Account' }).click()
  727 |     await page.waitForTimeout(3000)
  728 | 
  729 |     // 一覧に表示されるか確認
  730 |     await expect(page.getByText(`@${tempUser}`)).toBeVisible()
  731 | 
  732 |     // ダイアログ（window.confirm）はクリック前にハンドラを登録する必要がある
  733 |     page.on('dialog', dialog => dialog.accept())
  734 | 
  735 |     // 削除
  736 |     const deleteBtn = page.locator('tr', { hasText: tempUser }).getByRole('button').last()
  737 |     await deleteBtn.click()
  738 | 
  739 |     await page.waitForTimeout(2000)
  740 |     await expect(page.getByText(`@${tempUser}`)).not.toBeVisible()
  741 |   })
  742 | })
  743 | 
  744 | // ============================================================
  745 | // 12. Multi-tenant Management Flow
  746 | // ============================================================
  747 | test.describe('Multi-tenant Management Flow', () => {
  748 |   const NEW_STORE_NAME = `E2E Store ${Date.now()}`
  749 |   const NEW_ADMIN_NAME = `admin${Date.now()}`
  750 | 
  751 |   test('新規店舗を作成し、その店舗の管理者を登録できる', async ({ page }) => {
  752 |     await login(page)
  753 |     await page.goto('/admin/stores')
  754 |     await page.waitForLoadState('networkidle')
  755 |     await page.waitForTimeout(1000)
  756 |     
  757 |     // 店舗追加
  758 |     await page.click('#btn-add-store')
  759 |     await page.getByPlaceholder('Branch Name').fill(NEW_STORE_NAME)
  760 |     await page.click('#btn-create-store')
  761 |     
  762 |     // 店舗がリストに現れるまで待機 (テーブル内のセルを確実に特定)
  763 |     await expect(page.locator('td', { hasText: NEW_STORE_NAME }).first()).toBeVisible({ timeout: 15000 })
  764 | 
  765 |     // その店舗にAdminを追加
  766 |     const storeRow = page.locator('tr').filter({ hasText: NEW_STORE_NAME }).first()
  767 |     await storeRow.waitFor({ state: 'visible' })
  768 |     await page.waitForTimeout(500)
  769 |     await storeRow.getByRole('button', { name: /Add Admin/i }).click()
  770 |     await page.getByPlaceholder('branch_admin').fill(NEW_ADMIN_NAME)
  771 |     await page.getByPlaceholder('••••••••').fill('password123')
  772 |     await page.getByRole('button', { name: 'Create Admin' }).click()
  773 |     await page.waitForTimeout(3000)
  774 | 
  775 |     // ログアウト
  776 |     await page.goto('/')
  777 |     await page.waitForLoadState('networkidle')
  778 |     // Topbar のユーザーメニュートリガーは <div>（generic role）なのでテキストで特定する
> 779 |     await page.locator('header').getByText(/^@/).first().click()
      |                                                          ^ TimeoutError: locator.click: Timeout 10000ms exceeded.
  780 |     await page.getByText('Logout').click()
  781 |     await page.waitForURL('/login')
  782 |   })
  783 | 
  784 |   test('作成した新店舗のAdminでログインし、スタッフを管理できる', async ({ page, context }) => {
  785 |     // beforeEach でデフォルト admin としてログイン済みのため、
  786 |     // auth.global.ts のリダイレクト対策としてセッションを明示的に破棄してから /login に遷移する
  787 |     await context.clearCookies()
  788 |     await page.goto('/login')
  789 |     await page.evaluate(() => {
  790 |       localStorage.clear()
  791 |       sessionStorage.clear()
  792 |     })
  793 |     await page.reload()
  794 |     await page.waitForURL('/login')
  795 | 
  796 |     // 新しいAdminでログイン
  797 |     await page.getByPlaceholder('admin').fill(NEW_ADMIN_NAME)
  798 |     await page.getByPlaceholder('••••••••').fill('password123')
  799 |     await page.getByRole('button', { name: 'Sign In' }).click()
  800 |     await page.waitForURL('/', { timeout: 15_000 })
  801 | 
  802 |     // 設定（スタッフ管理）へ
  803 |     await page.goto('/settings')
  804 |     await page.waitForLoadState('networkidle')
  805 | 
  806 |     // スタッフを追加
  807 |     const staffName = `staff${Date.now()}`
  808 |     await page.getByRole('button', { name: 'Add Staff' }).click()
  809 |     await page.getByPlaceholder('staff123').fill(staffName)
  810 |     await page.getByPlaceholder('••••••••').last().fill('password123')
  811 |     await page.getByRole('button', { name: 'Create Account' }).click()
  812 |     await page.waitForTimeout(2000)
  813 |     await expect(page.getByText(`@${staffName}`)).toBeVisible()
  814 | 
  815 |     // スタッフのロール更新
  816 |     const row = page.locator('tr', { hasText: staffName })
  817 |     await row.locator('button[role="switch"]').click()
  818 |     await page.waitForTimeout(1000)
  819 | 
  820 |     // window.confirm ハンドラはクリック前に登録する
  821 |     page.on('dialog', d => d.accept())
  822 | 
  823 |     // スタッフの削除
  824 |     await row.getByRole('button').last().click()
  825 |     await page.waitForTimeout(2000)
  826 |     await expect(page.getByText(`@${staffName}`)).not.toBeVisible()
  827 |   })
  828 | })
  829 | 
```