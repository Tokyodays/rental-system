# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rental-system.spec.ts >> Multi-tenant Management Flow >> 新規店舗を作成し、その店舗の管理者を登録できる
- Location: e2e/rental-system.spec.ts:742:3

# Error details

```
TimeoutError: locator.click: Timeout 10000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /@admin/ }).first()

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
                - paragraph [ref=e63]: "2"
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
                  - row "E2E Test Vehicle 1776531624725 CF Cody Fisher Return Apr 21, 02:59 PM Completed" [ref=e88]:
                    - cell "E2E Test Vehicle 1776531624725" [ref=e89]
                    - cell "CF Cody Fisher" [ref=e90]:
                      - generic [ref=e92]: CF
                      - generic [ref=e93]: Cody Fisher
                    - cell "Return" [ref=e94]:
                      - generic [ref=e96] [cursor=pointer]: Return
                    - cell "Apr 21, 02:59 PM" [ref=e97]
                    - cell "Completed" [ref=e98]:
                      - generic [ref=e100]: Completed
                  - row "E2E Test Vehicle 1776531624725 CF Cody Fisher Lend Apr 21, 02:59 PM Completed" [ref=e101]:
                    - cell "E2E Test Vehicle 1776531624725" [ref=e102]
                    - cell "CF Cody Fisher" [ref=e103]:
                      - generic [ref=e105]: CF
                      - generic [ref=e106]: Cody Fisher
                    - cell "Lend" [ref=e107]:
                      - generic [ref=e109] [cursor=pointer]: Lend
                    - cell "Apr 21, 02:59 PM" [ref=e110]
                    - cell "Completed" [ref=e111]:
                      - generic [ref=e113]: Completed
                  - row "E2E Test Vehicle 1776531624725 CF Cody Fisher Return Apr 19, 02:00 AM Completed" [ref=e114]:
                    - cell "E2E Test Vehicle 1776531624725" [ref=e115]
                    - cell "CF Cody Fisher" [ref=e116]:
                      - generic [ref=e118]: CF
                      - generic [ref=e119]: Cody Fisher
                    - cell "Return" [ref=e120]:
                      - generic [ref=e122] [cursor=pointer]: Return
                    - cell "Apr 19, 02:00 AM" [ref=e123]
                    - cell "Completed" [ref=e124]:
                      - generic [ref=e126]: Completed
                  - row "E2E Test Vehicle 1776531624725 CF Cody Fisher Lend Apr 19, 02:00 AM Completed" [ref=e127]:
                    - cell "E2E Test Vehicle 1776531624725" [ref=e128]
                    - cell "CF Cody Fisher" [ref=e129]:
                      - generic [ref=e131]: CF
                      - generic [ref=e132]: Cody Fisher
                    - cell "Lend" [ref=e133]:
                      - generic [ref=e135] [cursor=pointer]: Lend
                    - cell "Apr 19, 02:00 AM" [ref=e136]
                    - cell "Completed" [ref=e137]:
                      - generic [ref=e139]: Completed
  - generic:
    - img
  - generic [ref=e140]:
    - button "Toggle Nuxt DevTools" [ref=e141] [cursor=pointer]:
      - img [ref=e142]
    - generic "Page load time" [ref=e145]:
      - generic [ref=e146]: "48"
      - generic [ref=e147]: ms
    - button "Toggle Component Inspector" [ref=e149] [cursor=pointer]:
      - img [ref=e150]
  - region "Notifications (F8)":
    - list
```

# Test source

```ts
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
  713 |     await page.getByPlaceholder('staff123').fill(tempUser)
  714 |     await page.getByPlaceholder('••••••••').last().fill('password123')
  715 | 
  716 |     // 作成
  717 |     await page.getByRole('button', { name: 'Create Account' }).click()
  718 |     await page.waitForTimeout(3000)
  719 | 
  720 |     // 一覧に表示されるか確認
  721 |     await expect(page.getByText(`@${tempUser}`)).toBeVisible()
  722 | 
  723 |     // ダイアログ（window.confirm）はクリック前にハンドラを登録する必要がある
  724 |     page.on('dialog', dialog => dialog.accept())
  725 | 
  726 |     // 削除
  727 |     const deleteBtn = page.locator('tr', { hasText: tempUser }).getByRole('button').last()
  728 |     await deleteBtn.click()
  729 | 
  730 |     await page.waitForTimeout(2000)
  731 |     await expect(page.getByText(`@${tempUser}`)).not.toBeVisible()
  732 |   })
  733 | })
  734 | 
  735 | // ============================================================
  736 | // 12. Multi-tenant Management Flow
  737 | // ============================================================
  738 | test.describe('Multi-tenant Management Flow', () => {
  739 |   const NEW_STORE_NAME = `E2E Store ${Date.now()}`
  740 |   const NEW_ADMIN_NAME = `admin${Date.now()}`
  741 | 
  742 |   test('新規店舗を作成し、その店舗の管理者を登録できる', async ({ page }) => {
  743 |     await login(page)
  744 |     await page.goto('/admin/stores')
  745 |     await page.waitForLoadState('networkidle')
  746 |     await page.waitForTimeout(1000)
  747 |     
  748 |     // 店舗追加
  749 |     await page.click('#btn-add-store')
  750 |     await page.getByPlaceholder('Branch Name').fill(NEW_STORE_NAME)
  751 |     await page.click('#btn-create-store')
  752 |     
  753 |     // 店舗がリストに現れるまで待機 (テーブル内のセルを確実に特定)
  754 |     await expect(page.locator('td', { hasText: NEW_STORE_NAME }).first()).toBeVisible({ timeout: 15000 })
  755 | 
  756 |     // その店舗にAdminを追加
  757 |     const storeRow = page.locator('tr').filter({ hasText: NEW_STORE_NAME }).first()
  758 |     await storeRow.waitFor({ state: 'visible' })
  759 |     await page.waitForTimeout(500)
  760 |     await storeRow.getByRole('button', { name: /Add Admin/i }).click()
  761 |     await page.getByPlaceholder('branch_admin').fill(NEW_ADMIN_NAME)
  762 |     await page.getByPlaceholder('••••••••').fill('password123')
  763 |     await page.getByRole('button', { name: 'Create Admin' }).click()
  764 |     await page.waitForTimeout(3000)
  765 | 
  766 |     // ログアウト
  767 |     await page.goto('/')
> 768 |     await page.getByRole('button', { name: /@admin/ }).first().click()
      |                                                                ^ TimeoutError: locator.click: Timeout 10000ms exceeded.
  769 |     await page.getByText('Logout').click()
  770 |     await page.waitForURL('/login')
  771 |   })
  772 | 
  773 |   test('作成した新店舗のAdminでログインし、スタッフを管理できる', async ({ page }) => {
  774 |     // 新しいAdminでログイン
  775 |     await page.goto('/login')
  776 |     await page.getByPlaceholder('admin').fill(NEW_ADMIN_NAME)
  777 |     await page.getByPlaceholder('••••••••').fill('password123')
  778 |     await page.getByRole('button', { name: 'Sign In' }).click()
  779 |     await page.waitForURL('/', { timeout: 15_000 })
  780 | 
  781 |     // 設定（スタッフ管理）へ
  782 |     await page.goto('/settings')
  783 |     await page.waitForLoadState('networkidle')
  784 | 
  785 |     // スタッフを追加
  786 |     const staffName = `staff${Date.now()}`
  787 |     await page.getByRole('button', { name: 'Add Staff' }).click()
  788 |     await page.getByPlaceholder('staff123').fill(staffName)
  789 |     await page.getByPlaceholder('••••••••').last().fill('password123')
  790 |     await page.getByRole('button', { name: 'Create Account' }).click()
  791 |     await page.waitForTimeout(2000)
  792 |     await expect(page.getByText(`@${staffName}`)).toBeVisible()
  793 | 
  794 |     // スタッフのロール更新
  795 |     const row = page.locator('tr', { hasText: staffName })
  796 |     await row.locator('button[role="switch"]').click()
  797 |     await page.waitForTimeout(1000)
  798 | 
  799 |     // window.confirm ハンドラはクリック前に登録する
  800 |     page.on('dialog', d => d.accept())
  801 | 
  802 |     // スタッフの削除
  803 |     await row.getByRole('button').last().click()
  804 |     await page.waitForTimeout(2000)
  805 |     await expect(page.getByText(`@${staffName}`)).not.toBeVisible()
  806 |   })
  807 | })
  808 | 
```