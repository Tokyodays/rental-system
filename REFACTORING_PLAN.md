# rental-system リファクタリング計画書

作成日: 2026-07-12（同日改訂: ユーザー判断3件を反映済み） / 対象コミット: `21c1120`（ブランチ `18-fable5によりリファクタリング`）
本計画は **機能追加・仕様変更を一切含まない**。例外は R20（リダイレクト先修正）と R23（サイドバー表示条件の是正）の2件のみで、**いずれもユーザー承認済み**（§6参照）。実行者が追加の確認を取る必要はない。

---

## 1. 現状理解（実行者への文脈共有）

### 1.1 何のシステムか

マルチテナントの車両レンタル SaaS。**Nuxt 4 + @nuxt/ui v4 + Supabase**（DB / Auth / Storage）。
ユーザーは「ユーザー名 + パスワード」でログインするが、内部的には `<username>@rental.local` というメールアドレスに変換して Supabase Auth に渡す。

ロールは3つ。ロールIDは DB シードで固定された UUID:

| ロール | role_id | 入口 | 行き先 |
|---|---|---|---|
| `super_admin`（オーナー） | `00000000-0000-0000-0001-000000000000` | `/admin/login` | `/admin/stores`（店舗管理コンソールのみ） |
| `admin`（店舗管理者） | `00000000-0000-0000-0001-000000000001` | `/login` | `/dashboard` 以下 + `/settings` |
| `staff`（一般スタッフ） | `00000000-0000-0000-0001-000000000002` | `/login` | `/dashboard` 以下（`/settings` 不可） |

`/`（`app/pages/index.vue`）は**公開ランディングページ**であり、業務画面ではない。業務ダッシュボードは `/dashboard`。

### 1.2 主要ファイルと依存関係

```
app/composables/useStaff.ts     … 認証状態の単一情報源。user/staff/isAdmin/isSuperAdmin を useState で共有。
                                   onAuthStateChange リスナーは useState('staff-auth-listener') ガードで1回だけ登録。
app/middleware/auth.global.ts   … 全ルートで実行。「/」は素通し。未ログイン→/login or /admin/login、
                                   super_admin→/admin/* へ強制、admin/staff→/admin/* から排除。
app/middleware/super-admin-only.ts / settings-only-admin.ts … ページ単位の追加制御。
app/layouts/default.vue         … スタッフ画面レイアウト（AppSidebar + AppTopbar）。
app/layouts/admin.vue           … 管理コンソールレイアウト（サイドバーなし）。
app/pages/…                     … 各画面は「setup 内で Supabase を直接クエリする」自己完結型。
server/api/admin/*.ts           … Service Role キーで RLS をバイパスする管理 API（店舗作成/削除、ユーザー作成/削除）。
                                   各ファイル冒頭で呼び出し元のロールを DB 照会して認可する（実装が4通りに分裂←本計画で統一）。
server/utils/supabaseAdmin.ts   … Service Role クライアント生成。
app/types/database.types.ts     … 手書きの DB 型。6テーブル分しかなく、不足分を `as any`（55箇所）で握り潰している。
supabase/migrations/*.sql       … スキーマ。scripts/migrate.js（npm run db:migrate）で適用。
e2e/rental-system.spec.ts       … Playwright E2E 全36テスト。これが本計画の安全網。
```

### 1.3 データフローの型（例: 貸出）

1. `customer_statuses` / `vehicle_statuses` テーブルから **名前（'Active' 等）で status の UUID を引く**（このパターンがアプリ中に10箇所以上コピペされている）
2. `transactions` に INSERT →
3. `vehicles.status_id` を UPDATE → 4. `customers.status_id` を UPDATE
   （2〜4 は非アトミックで、3・4 のエラーは現状無視される←本計画で検査を入れる。DB トランザクション化は仕様変更のためやらない）

### 1.4 テスト環境

- E2E は **dev サーバーが別途起動している前提**（playwright.config.ts に webServer 設定なし）。
- `playwright.config.ts` は `workers: 1`。テストは共有 DB 状態に依存するため**並列化禁止**。
- テストユーザー: `branchadmin` / `password123`（admin, Main Store）、`admin` / `password123`（super_admin）。
- `npm run test`（vitest）はスクリプト定義のみで、ユニットテストは1本も存在しない。

---

## 2. 項目0: 安全網の構築（最初に必ず実行）

### R0-1. 作業ブランチとベースラインコミット

```bash
cd /Users/takeshi/Documents/GitHub/rental-system
git status --short          # 空であること。空でなければ中断して報告
git checkout -b refactor/plan-2026-07
git log -1 --oneline        # 21c1120 であること。違うコミットなら中断して報告
```

### R0-2. ベースライン計測（結果を BASELINE.md に記録してコミット）

dev サーバーを起動（別ターミナル or バックグラウンド）:

```bash
npm run dev   # http://localhost:3000 で起動。.env が必要（なければ中断して報告）
```

計測:

```bash
# 1. TypeScript エラー数（現状ゼロとは限らない。数を記録する）
npx nuxt typecheck 2>&1 | tail -5

# 2. ビルド成功可否
npm run build 2>&1 | tail -5

# 3. E2E 全36テストの結果（全パスが期待値。落ちるテストがあれば名前を記録）
npx playwright test --reporter=line 2>&1 | tail -10
```

3つの結果（typecheck のエラー件数 / build の成否 / E2E の pass 数と落ちたテスト名）を `BASELINE.md` に書き、`chore: record refactoring baseline` としてコミットする。
**以後すべての項目の完了条件は「このベースラインから悪化していないこと」を含む。**

### R0-3. 特性テストについて

この計画で触る動作は E2E 36本（Dashboard / Vehicle List / Add Vehicle / Lending Flow / Return Flow / Customers / History / Navigation / Error Handling / Status Filters / Settings / Multi-tenant）でほぼ固定済みのため、**新規の特性テスト作成は不要**。ただし E2E が担保しない2箇所は各項目内に手動確認手順を明記した:

- **カメラ撮影**（headless では getUserMedia 不可）→ R22 に手動手順
- **CSV エクスポート** → R21 に手動手順

---

## 3. 作業項目リスト（実行順）

> 共通ルール: 1項目 = 1コミット。各項目の「確認」は dev サーバー起動済みの状態で実行する。
> 共通の戻し方: `git revert <該当コミット>`（すべての項目は独立に revert 可能な粒度で切ってある）。

---

### R1. バックアップファイルの削除

- **対象**: `app/pages/rentals/new.vue.bak`（438行）
- **問題**: `.bak` ファイルが pages/ 配下に残置。Nuxt のルーティング対象ではないが、grep 汚染と誤編集の温床。
- **変更**: `git rm app/pages/rentals/new.vue.bak`
- **確認**: `npx nuxt typecheck` がベースライン同等。`ls app/pages/rentals/` に `new.vue`, `return.vue`, `success.vue` のみ残ること（success.vue は R2 で消す）。
- **リスク**: なし（ビルド対象外のファイル）。
- **依存**: R0

### R2. モックページ2枚の削除

- **対象**: `app/pages/qr-scanner/index.vue`（111行）、`app/pages/rentals/success.vue`（52行）
- **問題**: 両方ともハードコードされた偽データを表示するだけのモック。qr-scanner は `'MBP-2023-042'` を返す「Simulate Scan (Mock)」ボタンのみ、success.vue は固定の `TXN-8829-001` / `Oct 25, 2023` を表示する。**アプリ内のどこからもリンクされておらず**（`grep -rn "qr-scanner\|rentals/success" app` で自己参照以外ゼロを確認済み）、E2E も参照していない。実際の QR 相当機能は rentals/new.vue / return.vue 内の手入力+リスト選択で実現されている。
- **変更**: 2ファイルを `git rm`。空になった `app/pages/qr-scanner/` ディレクトリも消えることを確認。
- **確認**: `grep -rn "qr-scanner\|rentals/success" app e2e` が0件。E2E 全パス。
- **リスク**: 直接 URL アクセスしていた人がいる場合404になるが、モック画面なので実害なし。
- **依存**: R0

### R3. ワンオフ修復スクリプト17本の削除

- **対象**: `scripts/` 配下の以下17本:
  `add-locale-column.js` `check-auth.js` `check_currency.js` `debug_rentals.js` `fix-admin-email.js` `fix-stores-column.js` `force-fix-trigger.js` `force-fix.js` `inspect-roles.js` `patch_return_fix.js` `patch_vehicle_code.js` `promote-admin.js` `repair-developer.js` `reset-admin.js` `total-fix-admin-api.js` `total-fix-admin.js` `update_existing_vehicle_codes.js`
- **残すもの（消さない）**: `migrate.js`（`npm run db:migrate` が参照）、`take-screenshots.cjs`（LP画像の再生成用）、`create_dev_user.js`（**ユーザー確認済み: 初期ユーザー作成に現役で使用中。絶対に消さない**）
- **問題**: 過去の障害対応で書き捨てられた DB 直叩きスクリプト群。中には本番 DB を破壊的に変更するもの（force-fix 系）が含まれ、誤実行リスクがある。`package.json` からの参照は `migrate.js` のみ（確認済み）。
- **変更**: 17本を `git rm`。
- **確認**: `npm run db:migrate --help` 相当で migrate.js が残っていること（実行はしない）。`grep -rn "scripts/" package.json` に消したファイルへの参照がないこと。ビルド・E2E に影響なし（Node スクリプトはバンドル対象外）。
- **リスク**: 過去スクリプトを再利用したくなる可能性 → git 履歴から復元可能。
- **依存**: R0

### R4. デバッグ用 console.log の削除

- **対象と変更**（`console.error` は残す。消すのは `console.log` とデバッグ用 watch のみ）:
  - `app/components/AppSidebar.vue:20-28` … 「デバッグ用: 現在の権限状態をログ出力」の watch ブロック全体を削除
  - `app/components/AppTopbar.vue:16-19` … 「デバッグ用: ロード完了時にログを出す」の watch ブロック全体を削除
  - `app/pages/admin/stores.vue:51` … `console.log('DEBUG API ERROR:', ...)` の行を削除（次行の toast は残す）
  - `app/pages/vehicles/index.vue:65` … `console.log('Fetched vehicles:', data)` を削除
  - `app/composables/useStaff.ts:120` … `console.log('[useStaff] auth event context:', event)` を削除
- **問題**: 本番パスにデバッグログが残っており、プロジェクト規約（code-review skill の「No console.log left in production paths」）違反。
- **確認**: `grep -rn "console\.log" app --include="*.vue" --include="*.ts"` が0件。E2E 全パス。
- **リスク**: なし（副作用のない出力の削除のみ。watch のコールバックはログ出力しかしていないことを削除前に目視確認すること）。
- **依存**: R0

### R5. customers ページ内の死んだコードの削除

- **対象**: `app/pages/customers/index.vue`
- **問題**: 使われない変数と重複 DOM 参照が残っている:
  - `selectedFile`（L109。`ref<File | null>(0 as any)` という異常な初期化。どこからも読まれない）
  - `fileInput`（L110。テンプレートに対応する `<input type="file">` が存在しない）
  - `handleFileChange`（L169-182。テンプレートから一切呼ばれない）
  - テンプレート末尾 L913 の `<canvas ref="canvasRef" class="hidden"></canvas>`（L806 に同じ ref の canvas があり二重。Vue では同名 ref は後勝ちのため挙動が不定になりうる）
- **変更**: 上記4箇所を削除。L806 の canvas（Add モーダル内のもの）は**残す**。
- **確認**: `npx nuxt typecheck` ベースライン同等。E2E の `Customers` describe（4テスト）全パス。ブラウザで /customers → Add New Customer → 写真なしで Register が成功すること（E2E がカバー済み）。
- **リスク**: L913 の canvas 削除で「Update モーダルからの撮影」が壊れる可能性は低い（撮影処理は videoRef/canvasRef を使うが、Add モーダル内 canvas が生きている限り takePhoto は機能する）。カメラ実機確認は R22 でまとめて行う。
- **依存**: R0

### R6. ロールID・内部メールドメインの一元化

- **対象箇所**（同じ UUID / 文字列が7ファイルに直書きされている）:
  - `app/composables/useStaff.ts:34-35`
  - `app/pages/settings.vue:117-118, 126`
  - `app/pages/admin/stores.vue:64`
  - `server/api/admin/users.post.ts:62`
  - `server/api/admin/users.delete.ts:20`
  - `@rental.local`: `app/pages/login.vue:29`、`app/pages/admin/login.vue:27`、`server/api/admin/users.post.ts:39`
- **変更**: `shared/constants/auth.ts` を新規作成（Nuxt 4 の `shared/` はクライアント・サーバー両方から import 可能）:

```ts
// shared/constants/auth.ts
export const ROLE_IDS = {
  SUPER_ADMIN: '00000000-0000-0000-0001-000000000000',
  ADMIN: '00000000-0000-0000-0001-000000000001',
  STAFF: '00000000-0000-0000-0001-000000000002'
} as const

export const INTERNAL_EMAIL_DOMAIN = 'rental.local'

export const toInternalEmail = (username: string) =>
  `${username.toLowerCase()}@${INTERNAL_EMAIL_DOMAIN}`
```

  各ファイルで `import { ROLE_IDS, toInternalEmail } from '~~/shared/constants/auth'`（サーバー側も同じパスで可。エイリアス `#shared` が使える場合はそちらでもよいが、**全ファイルで同じ書き方に統一する**）に置換。ローカル定数 `SUPER_ADMIN_ROLE_ID` / `ADMIN_ROLE_ID` / `USER_ROLE_ID` / `internalEmail` の組み立て式は削除。
  注意: `settings.vue` のテンプレート内 `USER_ROLE_ID` / `ADMIN_ROLE_ID` 参照（L451-452）は `ROLE_IDS.STAFF` / `ROLE_IDS.ADMIN` に置換。`newStaff.role_id` の初期値（L126 の直書き UUID）も `ROLE_IDS.STAFF` に。
- **確認**: `grep -rn "00000000-0000-0000-0001" app server | grep -v shared` が0件。`grep -rn "@rental.local" app server` が `shared/constants/auth.ts` 以外0件。typecheck ベースライン同等。E2E 全パス（特に Settings & User Management、Multi-tenant Management Flow）。
- **リスク**: import パス誤り → dev サーバーのコンソールに即エラーが出るので気づける。
- **依存**: R0

### R7. サーバーAPI の認可チェックの共通化

- **対象**: `server/api/admin/` の4ファイル。呼び出し元ロールの確認コードが4通りの微妙に違う実装でコピペされている（stores.post / stores.delete はロール**名**で判定、users.delete はロール**ID**で判定、users.post は名前の配列で判定）。
- **変更**: `server/utils/requireStaffRole.ts` を新規作成。**現行の許可範囲を1ミリも変えない**こと:

| ルート | 現行の許可ロール（変えない） |
|---|---|
| stores.post | super_admin のみ |
| stores.delete | super_admin のみ |
| users.post | admin, super_admin |
| users.delete | **admin のみ**（super_admin 不可。これは現行仕様なので維持する） |

```ts
// server/utils/requireStaffRole.ts
import { serverSupabaseUser } from '#supabase/server'

/**
 * 認証済みユーザーの staff レコードを取得し、ロール名が allowedRoles に
 * 含まれることを検証する。失敗時は 401/403 を throw。
 * 戻り値: { userId, staff }（staff は role 名と store_id を含む）
 */
export const requireStaffRole = async (event: any, allowedRoles: string[]) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const adminClient = useSupabaseAdmin()
  const userId = (user as any).sub || user.id
  const { data: staff, error } = await adminClient
    .from('staff')
    .select('store_id, role_id, staff_roles(name)')
    .eq('id', userId)
    .single()

  const roleName = ((staff?.staff_roles as any)?.name || '').toLowerCase()
  if (error || !allowedRoles.includes(roleName)) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }
  return { userId, staff: staff! }
}
```

  4ファイルの冒頭 20行前後（認証+ロール照会+判定）をこの1呼び出しに置換:
  - stores.post / stores.delete → `await requireStaffRole(event, ['super_admin'])`
  - users.post → `const { userId, staff: adminStaff } = await requireStaffRole(event, ['admin', 'super_admin'])`
  - users.delete → `requireStaffRole(event, ['admin'])`。**注意**: 現行 users.delete は role_id 直接比較だが、`admin` の role_id とロール名 `admin` は1対1対応（staff_roles テーブルのシード）なので名前判定への統一は挙動同一。
  - users.post の「admin は store_id 必須」チェック（L26-28）はルート側に残す。
- **確認**: E2E 全パス（特に Settings & User Management の追加・削除、Multi-tenant の店舗作成・削除）。`curl -X POST localhost:3000/api/admin/stores` （未認証）で 401 が返ること。
- **リスク**: 認可の挙動が変わると即セキュリティ問題 → 上表との一致を置換後に必ず目視で再確認。E2E が admin/super_admin 両系統をカバーしている。
- **依存**: R6（ROLE_IDS 定数を使う場合。名前判定に統一するなら直接依存はないが、実行順として R6 の後）

### R8. ステータスID解決の composable 化

- **対象**: 「`vehicle_statuses` / `customer_statuses` テーブルから名前で UUID を引く」クエリが以下に散在:
  - `app/pages/rentals/new.vue`: L18, L58, L92, L119, L179-180
  - `app/pages/rentals/return.vue`: L24, L156-157
  - `app/pages/customers/index.vue`: L248-252
  - `app/pages/vehicles/index.vue`: L104-108（+ L52 の全件取得）
  - `app/pages/dashboard.vue`: L28, L35-36
- **問題**: 同一クエリのコピペが10箇所以上。ステータス名のタイポ（'Unactive' 等）がコンパイル時に検出されない。
- **変更**: `app/composables/useStatusIds.ts` を新規作成:

```ts
// app/composables/useStatusIds.ts
type StatusRow = { id: string; name: string; color?: string }

export const useStatusIds = () => {
  const supabase = useSupabaseClient()
  const vehicleStatuses = useState<StatusRow[]>('vehicle-statuses', () => [])
  const customerStatuses = useState<StatusRow[]>('customer-statuses', () => [])

  const ensureLoaded = async () => {
    if (vehicleStatuses.value.length && customerStatuses.value.length) return
    const [v, c] = await Promise.all([
      supabase.from('vehicle_statuses').select('id, name, color'),
      supabase.from('customer_statuses').select('id, name, color')
    ])
    vehicleStatuses.value = (v.data as StatusRow[]) || []
    customerStatuses.value = (c.data as StatusRow[]) || []
  }

  const vehicleStatusId = (name: 'Available' | 'Lent' | 'Unavailable' | 'Reserved') =>
    vehicleStatuses.value.find(s => s.name === name)?.id
  const customerStatusId = (name: 'Active' | 'Unactive' | 'Renting') =>
    customerStatuses.value.find(s => s.name === name)?.id

  return { vehicleStatuses, customerStatuses, ensureLoaded, vehicleStatusId, customerStatusId }
}
```

  各ページで `await ensureLoaded()` を fetch 系関数の冒頭で呼び、インラインの status 照会クエリを `vehicleStatusId('Available')` 等に置換する。**ID が undefined の場合のガード（現行コードの `if (!statusData) return` 相当）は置換先でも維持する**こと。
  `vehicles/index.vue` と `customers/index.vue` はステータス一覧そのもの（フィルタ UI 用）も使っているので、ローカルの `vehicleStatuses` / `statuses` ref を composable の state 参照に置換してよい（表示に `color` が必要な点に注意）。
- **確認**: typecheck ベースライン同等。E2E 全パス（Lending Flow / Return Flow / Status Filters が主対象）。
- **リスク**: キャッシュ導入により「別店舗でステータス定義が変わる」ケースが心配になるが、statuses はグローバルなマスタテーブルで店舗別ではない（migrations で確認済み）ので安全。
- **依存**: R0

### R9. 期間計算ロジックの共通化

- **対象**: ミリ秒差→「日+時間」変換が3箇所に別実装:
  - `app/pages/rentals/new.vue:144-157`（`durationText`）
  - `app/pages/rentals/return.vue:126-141`（`timeDiffText`）
  - `app/pages/history.vue:19-33`（`calculateDurationText`）
- **変更**: 表示フォーマットは3箇所で異なる（"2 days 3 hours" / "Delayed by 2d 3h" / "2d 3h"）ため、**フォーマットは各所に残し、計算コアのみ**を `app/utils/duration.ts` に抽出:

```ts
// app/utils/duration.ts
/** ミリ秒差を {days, hours} に分解（負値は絶対値で計算し sign で返す） */
export const diffToDaysHours = (diffMs: number) => {
  const sign = Math.sign(diffMs)
  const totalHours = Math.floor(Math.abs(diffMs) / 3_600_000)
  return { sign, days: Math.floor(totalHours / 24), hours: totalHours % 24 }
}
```

  3箇所の `Math.floor(diffMs / (1000 * 60 * 60))` 系の計算をこの関数呼び出しに置換。各所の表示文字列組み立ては**変更前と完全一致**させる（E2E が "Delayed by" 等の文言を見ている可能性があるため、文言を1文字も変えない）。
- **確認**: E2E 全パス（Lending Flow / Return Flow / History）。
- **リスク**: 端数処理の差異 → 置換前後で `diffMs = 90,000,000`（25h）を手計算し、旧: days=1, hours=1 / 新: 同一 であることを確認してから着手。
- **依存**: R8（同じファイルを触るため実行順を固定。論理依存はない）

### R10. `process.client` → `import.meta.client`

- **対象**: `app/composables/useStaff.ts:107`、`useCurrency.ts:27`、`useI18n.ts:195`、`useSupabaseConnection.ts:62`
- **問題**: `process.client` は Nuxt 3.x 以降非推奨。Nuxt 4 では `import.meta.client` が正。
- **変更**: 4箇所を機械的に置換。
- **確認**: typecheck ベースライン同等。dev サーバー再起動後に /login → ログイン → /dashboard が正常表示（認証初期化が client 分岐に依存しているため）。E2E 全パス。
- **リスク**: なし（意味は同一）。
- **依存**: R0

### R11. database.types.ts の不足テーブル型を補完

- **対象**: `app/types/database.types.ts`。現在 `stores` `staff_roles` `staff` `vehicles` `customers` `transactions` の6テーブルのみ定義され、`vehicle_statuses` `customer_statuses` `vehicle_categories` `currency` が欠落。これが全域55箇所の `as any` の根本原因。
- **変更**:
  1. `supabase/migrations/` の SQL（特に `20240320000000_initial_schema.sql`、`20240320000002_normalize_categories.sql`、`20240320000008_vehicle_status_refactor.sql` と currency/locale 系の後続 migration）を読み、欠落4テーブルの Row/Insert/Update 型を既存テーブルと同じ形式で追記する。列とその nullability は **migration の SQL に書かれているものだけ**を反映する（推測で列を足さない）。
  2. 型を追加した上で、`as any` を外すのは**次の低リスク箇所のみ**: `useCurrency.ts` の `from('currency' as any)` と `settings.vue` の `from('stores' as any)` / `from('staff' as any)`（`useSupabaseClient<Database>()` を使う）。ページ内の残り約50箇所の `as any` は今回外さない（型不整合の連鎖リスクがあるため。将来課題として残す）。
- **確認**: `npx nuxt typecheck` のエラー数が**ベースライン以下**であること（増えたら as any を外しすぎ。型追加のみに戻す）。E2E 全パス。
- **リスク**: 手書き型と実スキーマの乖離 → migration 由来に限定することで抑制。postgres MCP ツールが使える環境なら `\d vehicle_statuses` 相当でスキーマを照合するとなお良い（**要確認**: 実行環境で DB 接続可能か）。
- **依存**: R0

### R12. 貸出・返却処理のエラー握り潰し修正

- **対象**:
  - `app/pages/rentals/new.vue:205-208` … `handleCompleteLending` で transactions INSERT 後の vehicles / customers UPDATE の error を捨てている
  - `app/pages/rentals/return.vue:166-169` … `handleCompleteReturn` も同様
- **問題**: 車両/顧客のステータス更新が失敗しても Success トーストが出る。DB 上は「取引レコードはあるが車両は Available のまま」という不整合が黙って発生する。
- **変更**（new.vue 側のスケッチ。return.vue も同型）:

```ts
// 変更前
await ((supabase.from('vehicles') as any).update({ status_id: vStatus?.id }).eq('id', scannedVehicle.value.id) as any)
await ((supabase.from('customers') as any).update({ status_id: cStatus?.id }).eq('id', selectedCustomer.value.id) as any)

// 変更後（error を検査して throw。catch 節は既存のものが受ける）
const { error: vehicleError } = await (supabase.from('vehicles') as any)
  .update({ status_id: vStatus?.id }).eq('id', scannedVehicle.value.id)
if (vehicleError) throw new Error(`Vehicle status update failed: ${vehicleError.message}`)

const { error: customerError } = await (supabase.from('customers') as any)
  .update({ status_id: cStatus?.id }).eq('id', selectedCustomer.value.id)
if (customerError) throw new Error(`Customer status update failed: ${customerError.message}`)
```

  ※ INSERT → UPDATE の実行順は変えない。完全なアトミック化（DB 関数化）はスキーマ変更を伴うため**やらない**（§4参照）。R8 適用後は `vStatus?.id` が `vehicleStatusId('Lent')` 等になっているはずなので、その形に合わせる。
- **確認**: E2E の Lending Flow（4テスト）/ Return Flow（3テスト）全パス。正常系の挙動は不変。
- **リスク**: throw の追加により、これまで「半分成功」していたケースがエラー表示になる（それが正しい挙動）。
- **依存**: R8

### R13. users.post.ts の孤児 auth ユーザー防止

- **対象**: `server/api/admin/users.post.ts:57-70`
- **問題**: auth ユーザー作成成功後、staff レコードの upsert が失敗しても `console.error` するだけで **200 を返す**。結果、staff テーブルに存在しない auth ユーザー（ログインできるが所属もロールもない）が残る。
- **変更**:

```ts
// 変更前
if (upsertError) {
  console.error('[AdminAPI] Failed to upsert staff record:', upsertError)
}

// 変更後: 作成済み auth ユーザーを掃除してから 500 を返す
if (upsertError) {
  console.error('[AdminAPI] Failed to upsert staff record:', upsertError)
  await adminClient.auth.admin.deleteUser(authData.user.id)
  throw createError({ statusCode: 500, message: `Failed to create staff record: ${upsertError.message}` })
}
```

- **確認**: E2E の Settings & User Management（スタッフ追加）と Multi-tenant（admin 作成）全パス。正常系は不変。
- **リスク**: deleteUser 自体が失敗する可能性はあるが、その場合も 500 が返り呼び出し側にエラーが見えるので現状より悪化しない。
- **依存**: R7（同ファイルを触るため実行順を固定）

### R14. stores.delete.ts の中間削除エラー検査

- **対象**: `server/api/admin/stores.delete.ts:31-68`
- **問題**: transactions → reservations → vehicle_photos → vehicles → customers → staff の連鎖削除で、**最後の stores 削除以外は error を一切見ていない**。途中で失敗すると「中身が半分消えた店舗」が残り、再実行しても気づけない。
- **変更**: 各削除の戻り値の `error` を検査し、失敗したら即 `createError({ statusCode: 500, message: '<table> delete failed: ...' })` を throw する。ループ内の `auth.admin.deleteUser(member.id)` も同様に error を検査（deleteUser は `{ error }` を含むオブジェクトを返す）。削除の**順序は変えない**（FK 制約順）。
- **確認**: E2E の Multi-tenant Management Flow（店舗削除を含む）全パス。
- **リスク**: これまで黙って部分成功していたケースがエラーになる（正しい挙動）。店舗削除は E2E が作成→削除を通しで検証している。
- **依存**: R7（同ファイル・実行順固定）

### R15. パスポート画像アップロードの contentType 修正

- **対象**: `app/pages/customers/index.vue:240` と `365`
- **問題**: `canvas.toBlob(..., 'image/webp', 0.8)` で **WebP** の Blob を作っているのに、Storage へのアップロードで `contentType: 'image/jpeg'` を指定している。拡張子も `.webp`。配信時の Content-Type が実体と食い違う。
- **変更**: 2箇所とも `contentType: 'image/webp'` に修正。
- **確認**: typecheck ベースライン同等。E2E の Customers 全パス。（カメラ実機確認は R22 と併せて実施）
- **リスク**: なし。既存の誤 Content-Type で保存済みのオブジェクトはそのまま（表示には影響していない）。
- **依存**: R5（同ファイル・実行順固定）

### R16. Nuxt UI v4 に存在しない color 指定の修正

- **対象と変更**（@nuxt/ui v4 の color は `primary/secondary/success/info/warning/error/neutral` のみ。`red`/`white` は無効値):
  - `app/app.vue:20` … `color="red"` → `color="error"`
  - `app/pages/settings.vue:406` … 削除ボタンの `color="red"` → `color="error"`
  - `app/components/VehiclePhotoManager.vue:29, 56` … toast の `color: 'red'` → `color: 'error'`
  - `app/components/CameraCapture.vue:84, 112` … `color="white"` → `color="neutral"`
  - `app/components/VehiclePhotoCarousel.vue:35, 41, 76` … `color: 'white'` / `color="white"` → `'neutral'`
  - `app/pages/admin/stores.vue:125` … `:ui="{ body: { padding: 'p-0' } }"`（v2記法・無効）→ `:ui="{ body: 'p-0' }"`
- **確認**: dev サーバーで /settings（削除ボタンが赤系表示）、/admin/stores（テーブルが枠にぴったり収まる）、/vehicles の写真編集（ボタン表示）を目視。E2E 全パス。
- **リスク**: 見た目のみ。機能への影響なし。
- **依存**: R0

### R17. vehicles ページの alert() 排除

- **対象**: `app/pages/vehicles/index.vue:136`
- **問題**: 追加失敗時に `alert('Failed to add vehicle. Check console for details.')`。同ファイルの他のエラーは全部 toast なのにここだけネイティブ alert（E2E をブロックする挙動でもある）。
- **変更**:

```ts
// 変更前
console.error('Add failed:', e)
alert('Failed to add vehicle. Check console for details.')

// 変更後
console.error('Add failed:', e)
toast.add({ title: 'Add Failed', description: (e as any)?.message || 'Failed to add vehicle.', color: 'error' })
```

  ※ `settings.vue:163` の `confirm()` は**今回は変更しない**（モーダル化はUI変更を伴うため。§4参照）。
- **確認**: E2E の Add Vehicle 全パス。
- **リスク**: なし。
- **依存**: R8（同ファイル・実行順固定）

### R18. AppTopbar のハードコード外部アバターURL除去

- **対象**: `app/components/AppTopbar.vue:67`
- **問題**: `staff?.avatar_url`（**StaffRecord に存在しないプロパティ**）のフォールバックとして、`lh3.googleusercontent.com` の500文字近い署名付きURLが直書きされている。外部依存かつ期限切れで壊れる。
- **変更**: `:src` を削除し、UAvatar の `alt` によるイニシャル表示に任せる:

```vue
<!-- 変更前 -->
<UAvatar :src="staff?.avatar_url || 'https://lh3.googleusercontent.com/…'" alt="Avatar" size="sm" />
<!-- 変更後 -->
<UAvatar :alt="staff?.username || 'User'" size="sm" />
```

- **確認**: /dashboard 右上にユーザー名イニシャルのアバターが出ること（目視）。E2E 全パス（`data-testid="user-menu"` は変更しないこと）。
- **リスク**: 見た目のみ。
- **依存**: R4（同ファイル・実行順固定）

### R19. settings.vue の関数内 useStaff() 呼び出し修正

- **対象**: `app/pages/settings.vue:105`
- **問題**: `saveStore()` 関数の中で `const { fetchStaff } = useStaff()` を呼んでいる。プロジェクト規約「`useStaff()` must be called at component setup level, never inside functions」違反（composable のライフサイクルフックが関数呼び出しタイミングで登録される恐れ）。
- **変更**: L10 の既存呼び出しを `const { staff, fetchStaff } = useStaff()` に拡張し、L105 の行を削除して既存の `fetchStaff` を使う。
- **確認**: E2E の Settings & User Management 全パス。/settings で店名を変更して Save → サイドバー左上の店舗名が更新されること（目視）。
- **リスク**: なし。
- **依存**: R6（同ファイル・実行順固定）

### R20. 貸出・返却完了後のリダイレクト先修正 【挙動変更・ユーザー承認済み・E2E も同時修正】

- **対象**: `app/pages/rentals/new.vue:211`、`app/pages/rentals/return.vue:172`、`e2e/rental-system.spec.ts:409, 455`
- **問題**: 取引完了後 `router.push('/')` している。`/` は**公開ランディングページ**であり、ログイン済みスタッフが業務フロー完了後にマーケティングページへ飛ばされる。auth.global.ts は `/` を素通しするため、リダイレクトもされない。業務画面のホームは `/dashboard`。
- **変更**: 2ページの `router.push('/')` → `router.push('/dashboard')`。同一コミットで E2E の2アサーションを更新:

```ts
// e2e/rental-system.spec.ts L409, L455
// 変更前
await expect(page).toHaveURL('/', { timeout: 15_000 })
// 変更後
await expect(page).toHaveURL('/dashboard', { timeout: 15_000 })
```

- **確認**: E2E の Lending Flow / Return Flow 全パス（更新後のアサーションで）。
- **リスク**: 可視の挙動変更だが、**2026-07-12 にユーザー承認済み**。確認を取り直さずそのまま実施すること。
- **依存**: R12（同ファイル・実行順固定）

### R21. history ページの細部修正

- **対象**: `app/pages/history.vue`
- **問題**: 3点。
  1. L8-17: `useAsyncData` の結果を同期的に `rentals.value` へ写し `isLoading` を即 false にしている。CSR 遷移時にローディングスケルトンが機能していない上、`refresh` は未使用。
  2. L262: 空状態の `colspan="6"` だが列は**7列**（ヘッダは ID〜Price の7つ）。L229-230 のローディング行も6列分しか描画していない。
  3. L163: CSV 生成でセル値をエスケープせず `"${cell}"` している。車両名等に `"` が含まれると CSV が壊れる。
- **変更**:
  1. `const { data, pending } = await useAsyncData(...)` とし、`rentals` は `computed(() => data.value || [])` に、テンプレートの `isLoading` を `pending` に置換。ローカルの `rentals` ref / `isLoading` ref / `refresh` を削除。
  2. `colspan="6"` → `colspan="7"`、ローディング行の `v-for="j in 6"` → `v-for="j in 7"`。
  3. CSV セルを `` `"${String(cell).replace(/"/g, '""')}"` `` でエスケープ。
- **確認**: E2E の History（3テスト）全パス。**手動**: /history → Export → 当月範囲で Download CSV → ファイルを開き、ヘッダ7列・行が揃っていること、`"` 入りデータがないなら列ズレがないことだけ確認。
- **リスク**: 1 の書き換えで表示データの流れが変わる → E2E の History が担保。
- **依存**: R9（同ファイル・実行順固定）

### R22. customers ページのインラインカメラ実装を CameraCapture コンポーネントへ統一

- **対象**: `app/pages/customers/index.vue` の L113-167（videoRef/canvasRef/cameraStream/capturedPhoto ほかカメラ制御一式）とテンプレートの Add モーダル Step2（L733-807）・Update モーダル内撮影 UI（L862-881）
- **問題**: `app/components/CameraCapture.vue` という完成済みの再利用コンポーネント（VehiclePhotoManager が使用中）が存在するのに、customers ページはほぼ同じカメラ制御を約150行インラインで再実装している。二重 video ref など構造も脆い。
- **変更方針**（判断が入るため、以下の設計に固定する):
  1. script からカメラ制御（`startCamera` `stopCamera` `takePhoto` `videoRef` `canvasRef` `cameraStream` `isCameraLoading`）を削除。残すのは `capturedPhoto`（プレビュー DataURL）と `capturedBlob`（アップロード用）と `resetPhoto` のみ。
  2. `isCameraOpen = ref(false)` を追加し、撮影 UI を `<CameraCapture v-if="isCameraOpen" @capture="onCapture" @close="isCameraOpen = false" />` に置換。

```ts
function onCapture(blob: Blob) {
  capturedBlob.value = blob
  capturedPhoto.value = URL.createObjectURL(blob)   // プレビュー用
  isCameraOpen.value = false
}
```

  3. Add モーダルの Step2 は「CameraCapture を開くボタン + 撮影済みプレビュー + Retake/Register ボタン」に簡素化。Update モーダル内の撮影 UI も同じ部品に置換。「Skip and Register」ボタン（写真なし登録）は**必ず残す**（E2E が使用）。
  4. `handleAddCustomer` / `handleUpdateCustomer` のアップロード処理は無変更（`capturedBlob` を読むだけなので）。
- **確認**:
  - E2E の Customers（4テスト）全パス（写真なしの登録・更新・削除フロー）。
  - typecheck ベースライン同等。
  - **手動（カメラは E2E 不可）**: カメラ付き端末の Chrome で /customers → Add New Customer → Next: Passport Photo → 撮影 → プレビュー表示 → Register → 一覧の Docs 列にチェックアイコンが付き、行クリックで右ペインにパスポート画像が表示されること。Update モーダルでも同様に撮影→ Done → Update で画像が差し替わること。手動確認ができない環境の場合は、その旨をコミットメッセージに明記して報告する。
- **リスク**: 本計画で最大。UI 構造が変わるため E2E のセレクタが壊れる可能性 → 変更前に Customers describe（L462-573）を読み、**テストが参照するボタンラベル（"Add New Customer" / "Register Customer" / "Skip and Register" 等）を1字も変えない**こと。失敗したら `git revert` で丸ごと戻す。
- **依存**: R5, R15（同ファイル）

### R23. サイドバー設定リンクの表示条件是正 —「adminロール」と「ユーザー名が admin」の混同解消 【挙動変更・ユーザー承認済み】

- **対象**: `app/components/AppSidebar.vue` の設定リンク表示条件（元コード L63。R4 で直上の watch を消すため行番号はずれる。「救済措置」というコメントが目印）:

```vue
<!-- 変更前（コメントごと置換する） -->
<!-- 救済措置: isAdmin判定がNGでも、ユーザー名がadminなら表示する -->
<div v-if="isAdmin || staff?.username === 'admin' || staff?.staff_roles?.name === 'admin'" class="p-4 …">

<!-- 変更後 -->
<div v-if="isAdmin" class="p-4 …">
```

- **問題**: 権限 UI の表示可否を**ロールではなくユーザー名**で判定するフォールバックが混入している。これにより:
  1. たまたまユーザー名が `admin` の **staff ロール**のユーザーにも設定リンクが表示される（クリックすると `settings-only-admin` ミドルウェアに弾かれて /dashboard へ戻される＝リンクが「押せるのに機能しない」状態）。
  2. 「admin ロールである」ことと「名前が admin である」ことがコード上区別できず、権限判定の単一情報源が `useStaff().isAdmin` に一本化されていない。
     なお3つ目の条件 `staff?.staff_roles?.name === 'admin'` は `isAdmin` の定義（`useStaff.ts:48-52` — role_id 一致 **または** ロール名 'admin'）に既に含まれており、純粋な重複。
- **変更**: 表示条件を `v-if="isAdmin"` のみにする。これでリンク表示（AppSidebar）とアクセス制御（settings-only-admin ミドルウェア）の判定基準が同一になり、「名前が admin なだけのユーザー」はリンク非表示・アクセス不可で一貫する。`useStaff.ts` の `isAdmin` 定義自体は変更しない。
- **確認**:
  - E2E 全36テストパス。特に Settings & User Management（branchadmin = admin ロールで設定画面を操作する）が通れば、正規の admin にリンクが出続けていることの担保になる。
  - **手動**: `branchadmin` でログイン → サイドバー最下部に Settings リンクが表示されること。
  - （可能なら）staff ロールのテストユーザーでログインし、Settings リンクが**表示されない**こと。staff ロールのシードユーザーが環境にない場合はこの手動確認を省略してよい（ミドルウェアがアクセス自体は防いでいるため）。
- **リスク**: かつて isAdmin 判定が不安定だった時期の応急処置を外すため、判定遅延時にリンクが一瞬出ない可能性はある。ただし現行の `useStaff` は `fetchStaff` を AppSidebar の onMounted でも同期しており、E2E の Settings 系テストが退行を検出する。失敗時は `git revert`。
- **依存**: R4（同ファイル・実行順固定）

---

### 実行順まとめ

```
R0 → R1 → R2 → R3 → R4 → R5 → R6 → R7 → R8 → R9 → R10 → R11
   → R12 → R13 → R14 → R15 → R16 → R17 → R18 → R19 → R20 → R21 → R22 → R23
```

トレース済みの依存関係: R7←R6 / R12←R8 / R20←R12(同ファイル) / R22←R5,R15(同ファイル) / R23←R4(同ファイル)。
その他は独立だが、同一ファイルを触る項目のコンフリクトを避けるため**必ずこの順で1項目ずつ**行う。

---

## 4. やらないことリスト（実行者への禁止事項）

以下は「気づいても直さない」。発見しても手を付けず、最終報告に「気づいた点」として書くだけにすること。

1. **機能追加・仕様変更の一切**（例外は R20 と R23 の2件のみ。いずれもユーザー承認済みで項目内に明記済み）
2. **依存ライブラリの追加・更新・削除**。`package.json` の dependencies/devDependencies を変更しない。QR の実スキャン機能（jsQR 等の導入）もやらない。
3. **DB スキーマ変更・migration 追加**。貸出/返却のトランザクション化（Postgres 関数化）は正しい改善だがスキーマ変更なので今回はやらない。
4. **RLS ポリシーの変更**。
5. **`app/pages/index.vue`（ランディングページ）の変更**。412行あるが公開マーケティングページであり業務コードと独立。デザインは直近の PR で意図的に作り込まれている。
6. **useI18n の @nuxtjs/i18n への置き換え**。現行の自作 composable は5言語×40キーで機能しており、置き換えは依存追加になる。
7. **`settings.vue` の `confirm()` のモーダル化**（UI 変更を伴うため）。
8. **ページ内に残る約50箇所の `as any` の全面除去**（R11 で範囲を限定した理由の通り、連鎖リスクが読めないため）。
9. **customers/vehicles ページの「Pagination Mock」（disabled の前後ボタン）を実ページネーション化すること**（機能追加）。
10. **`api.qrserver.com`（外部 QR 生成 API）のローカル化**（依存追加になるため）。
11. **E2E テストの追加・削除・並列化**。既存36本の変更は R20 の2アサーションのみ許可。
12. **フォーマッタ/リンタの一括適用**（diff が爆発しレビュー不能になるため。触った行以外の整形はしない)。
13. コミットの squash や履歴改変。`git push` はユーザーの指示があるまでしない。
14. **`useStaff.ts` の `isAdmin` / `isSuperAdmin` の判定ロジック自体の変更**。R23 はサイドバーの表示条件を `isAdmin` に一本化するだけで、`isAdmin` の定義（role_id 一致 or ロール名一致）には触れない。

---

## 5. 実行者への指示文（このままコピペして渡す）

> あなたはこのリポジトリのリファクタリング実行者です。`REFACTORING_PLAN.md` だけを唯一の指示書として作業してください。
>
> ルール:
> 1. まず計画書の §1（現状理解）を読み、§2 の R0 を実行してベースラインを記録すること。
> 2. 作業項目は **R1 から番号順に、1項目ずつ** 実施する。項目の順序を入れ替えない。並行作業しない。
> 3. **1項目 = 1コミット**。コミットメッセージは `refactor(R<番号>): <計画書の項目名>` とする。
> 4. 各項目の「確認」に書かれたコマンドをすべて実行し、**期待結果を満たせない場合はその項目の変更を破棄（`git checkout -- .`）して作業を中断し、何がどう失敗したかを報告する**。自己判断で回避策を実装しない。
> 5. E2E 実行前に dev サーバー（`npm run dev`、port 3000）が起動していることを確認する。`.env` がない場合は中断して報告。
> 6. §4「やらないことリスト」に該当する変更は、どれほど正しく見えても行わない。気づいた改善点は最終報告に書く。
> 7. R20 と R23 は挙動変更を含むが**ユーザー承認済み**である。追加の確認を取らず、そのまま実施する。
> 8. 計画書に書かれていないファイルの変更が必要になった場合は、中断して報告する。
> 9. 全項目完了後、`npx nuxt typecheck` / `npm run build` / `npx playwright test --reporter=line` を最終実行し、ベースラインとの比較表を添えて完了報告する。

---

## 6. 確定済みのユーザー判断（2026-07-12 確認済み・実行者は再確認不要）

1. **R3**: `scripts/create_dev_user.js` は**残す**。初期ユーザー作成に現役で使用中（ユーザー回答）。
2. **R20**: 貸出/返却完了後の遷移先 `/` → `/dashboard` への変更は**承認済み**。E2E 2本のアサーション更新込みで実施する。
3. **R23**: サイドバーの「救済措置」ハックは単純削除ではなく、**「admin ロール」と「ユーザー名が admin」をきちんと区別する**方針で是正する（ユーザー回答）。表示条件を `isAdmin`（ロールベースの単一情報源）に一本化する R23 として作業項目化した。
4. **R11 の DB 照合**（未確定・実行者向けの条件分岐）: 実行環境で postgres MCP ツール等により DB に接続できる場合は、型追記前に実スキーマと照合すること。接続できない場合は migration の SQL のみを根拠とする（R11 本文の通り）。どちらで実施したかを完了報告に書く。

---

## 付録: 発見済みだが今回スコープ外の問題（次回計画の種）

- 貸出/返却の非アトミック3段書き込み（DB 関数化が本筋。スキーマ変更を伴うため見送り）
- `users.delete.ts` が super_admin を許可していない仕様の妥当性（現行維持した）
- customers ページ 915行 / vehicles 614行の本格的なコンポーネント分割（R22 はカメラ部分のみ）
- `vehicles/index.vue` が `v.code` を `id` と呼んで内部モデルを混乱させている命名問題
- カテゴリ一覧のハードコード（`['All', 'Bike', 'Car', 'Bicycle']`）と DB の `vehicle_categories` の二重管理
- `customers` の `passport_image_url` 正規化コード（L199-202）が示すレガシー列の残骸（スキーマ確認の上で除去可能）
- LP（index.vue）内の言語切替がダミー（`currentLang` は表示のみで useI18n と未接続）
- E2E の webServer 自動起動設定がない（playwright.config.ts に `webServer` を足せば手動起動が不要になる）
