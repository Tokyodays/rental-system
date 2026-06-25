# スーパー管理者UI分離 実装指示書

## 概要

オーナー（スーパー管理者）とレンタル業務スタッフを完全に異なる画面に分離する。
ログイン後、ロールによって自動的に適切なUIへ遷移させる。

---

## 現状と課題

- 全ロール（スーパー管理者・ブランチ管理者・スタッフ）が同一レイアウト・サイドバーを共有
- `/admin/stores` はサイドバーに常に表示されているがアクセス制御が不十分
- スーパー管理者がレンタル画面を見る必要はなく、混乱のもと

---

## 目標アーキテクチャ

| ロール | ログイン後の遷移 | 利用可能画面 |
|--------|-----------------|-------------|
| スーパー管理者（オーナー） | `/admin` | 店舗管理のみ |
| ブランチ管理者 | `/` | レンタル業務全体 + スタッフ設定 |
| スタッフ | `/` | レンタル業務全体 |

---

## ロール設計

### 現状
- `admin` role (ADMIN_ROLE_ID)：ブランチ管理者・スーパー管理者が同一ロール
- `staff` role：一般スタッフ

### 変更後
| role_id | name | 説明 |
|---------|------|------|
| `00000000-0000-0000-0001-000000000000` | `super_admin` | オーナー（新規追加） |
| `00000000-0000-0000-0001-000000000001` | `admin` | ブランチ管理者（変更なし） |
| `00000000-0000-0000-0002-000000000002` | `staff` | スタッフ（変更なし） |

---

## 実装タスク一覧

### Phase 1: データベース変更

#### Task 1-1: `staff_roles` テーブルに `super_admin` ロールを追加（Supabase）
```sql
INSERT INTO staff_roles (id, name)
VALUES ('00000000-0000-0000-0001-000000000000', 'super_admin');
```

#### Task 1-2: `@admin` ユーザーのロールを更新（Supabase）
```sql
UPDATE staff
SET role_id = '00000000-0000-0000-0001-000000000000'
WHERE username = 'admin';
```

#### Task 1-3: `/api/admin/stores` と `/api/admin/users` の権限チェックを更新
- `stores.post.ts`：`role_id IN (SUPER_ADMIN_ID, ADMIN_ID)` に変更（ブランチ管理者も店舗内管理者作成できる場合はそのまま）
- `users.post.ts`：同様

---

### Phase 2: `useStaff` composable 拡張

#### Task 2-1: `isSuperAdmin` computed を追加

**ファイル**: `app/composables/useStaff.ts`

```typescript
const SUPER_ADMIN_ROLE_ID = '00000000-0000-0000-0001-000000000000'

const isSuperAdmin = computed(() => {
  return staff.value?.role_id === SUPER_ADMIN_ROLE_ID
})

// 既存の isAdmin を「ブランチ管理者」専用に変更
const isAdmin = computed(() => {
  return staff.value?.role_id === ADMIN_ROLE_ID
})
```

---

### Phase 3: 管理者専用レイアウト作成

#### Task 3-1: `app/layouts/admin.vue` を新規作成

シンプルなトップナビゲーションのみのレイアウト。サイドバーなし。

```
+------------------------------------------+
| [Rental System Admin] [@admin]  [Logout]  |
+------------------------------------------+
|                                            |
|   Store Management Content Here           |
|                                            |
+------------------------------------------+
```

---

### Phase 4: ルートミドルウェア更新

#### Task 4-1: `app/middleware/auth.global.ts` を更新

ログイン後のリダイレクト先をロールによって分岐させる。

```
未ログイン → /login
super_admin + /login → /admin/stores
admin/staff + /login → /
super_admin + /（レンタル画面） → /admin/stores（アクセス拒否）
admin/staff + /admin/* → /（アクセス拒否）
```

#### Task 4-2: `app/middleware/super-admin-only.ts` を新規作成

`/admin/*` ページに適用。super_admin 以外は `/` へリダイレクト。

#### Task 4-3: `app/middleware/settings-only-admin.ts` を更新

super_admin は `/settings` にアクセスできないよう修正（不要なため）。

---

### Phase 5: 管理者ページ更新

#### Task 5-1: `app/pages/admin/stores.vue` にレイアウト指定を追加

```typescript
definePageMeta({
  layout: 'admin',
  middleware: 'super-admin-only'
})
```

#### Task 5-2: `AppSidebar.vue` から `/admin/stores` リンクを削除

ブランチ管理者・スタッフのサイドバーには店舗管理リンクは不要。

---

### Phase 6: ログインページ更新

#### Task 6-1: `app/pages/login.vue` のログイン後リダイレクトを更新

現状は常に `/` へリダイレクト。ロール取得後に分岐させる。

```typescript
// ログイン成功後
await syncUser()
if (isSuperAdmin.value) {
  await navigateTo('/admin/stores')
} else {
  await navigateTo('/')
}
```

---

### Phase 7: E2E テスト更新

#### Task 7-1: Multi-tenant テストを新アーキテクチャに合わせて更新

- `admin` ユーザーでログイン → `/admin/stores` へ自動遷移するよう修正
- `/` へのリダイレクト期待を削除

---

## ファイル変更一覧

| ファイル | 変更種類 |
|---------|---------|
| Supabase `staff_roles` テーブル | SQL INSERT + UPDATE |
| `app/composables/useStaff.ts` | `isSuperAdmin` 追加 |
| `app/layouts/admin.vue` | **新規作成** |
| `app/middleware/auth.global.ts` | ロールベースリダイレクト追加 |
| `app/middleware/super-admin-only.ts` | **新規作成** |
| `app/middleware/settings-only-admin.ts` | super_admin 除外追加 |
| `app/pages/admin/stores.vue` | `definePageMeta` 追加 |
| `app/components/AppSidebar.vue` | `/admin/stores` リンク削除 |
| `app/pages/login.vue` | リダイレクト先分岐 |
| `server/api/admin/stores.post.ts` | 権限チェック更新 |
| `server/api/admin/users.post.ts` | 権限チェック更新 |
| `e2e/rental-system.spec.ts` | Multi-tenant テスト更新 |

---

## 実装の注意点

1. **Phase 1 → Phase 2 → Phase 4 の順で実装する**。DB変更前にコードを変更すると既存ログインが壊れる。
2. **`isSuperAdmin` は `isAdmin` と排他的**。ブランチ管理者は `isAdmin = true, isSuperAdmin = false`。
3. **既存スタッフへの影響なし**。`admin` ロールは変更しないため、既存ブランチ管理者・スタッフは影響を受けない。
4. **将来の拡張**：スーパー管理者を複数設定する場合も `super_admin` ロールを付与するだけで対応可能。
