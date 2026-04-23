# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rental-system.spec.ts >> Multi-tenant Management Flow >> 作成した新店舗のAdminでログインし、スタッフを管理できる
- Location: e2e/rental-system.spec.ts:784:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation to "/" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - status [ref=e3]
    - generic [ref=e5]:
      - generic [ref=e9]:
        - heading "Rental System" [level=1] [ref=e10]
        - paragraph [ref=e11]: Mobility Management SaaS
      - generic [ref=e14]:
        - generic [ref=e15]:
          - generic [ref=e18]: Username (英数字)*
          - textbox "Username (英数字)*" [ref=e21]:
            - /placeholder: admin
        - generic [ref=e24]:
          - generic [ref=e27]: Password*
          - textbox "Password*" [ref=e30]:
            - /placeholder: ••••••••
        - button "Sign In" [active] [ref=e33] [cursor=pointer]:
          - generic [ref=e34]: Sign In
        - button "Forgot password?" [ref=e36] [cursor=pointer]:
          - generic [ref=e37]: Forgot password?
      - paragraph [ref=e38]: © 2026 Slate Precision. All rights reserved.
  - region "Notifications (F8)":
    - list
  - generic:
    - img
  - generic [ref=e39]:
    - button "Toggle Nuxt DevTools" [ref=e40] [cursor=pointer]:
      - img [ref=e41]
    - generic "Page load time" [ref=e44]:
      - generic [ref=e45]: "16"
      - generic [ref=e46]: ms
    - button "Toggle Component Inspector" [ref=e48] [cursor=pointer]:
      - img [ref=e49]
```

# Test source

```ts
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
  779 |     await page.locator('header').getByText(/^@/).first().click()
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
> 800 |     await page.waitForURL('/', { timeout: 15_000 })
      |                ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
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