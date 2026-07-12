# リファクタリング ベースライン記録

計測日: 2026-07-12 / ブランチ: `refactor/plan-2026-07`（親コミット `40ed6ba`, ベース `21c1120` + REFACTORING_PLAN.md追加のみ）

## 1. TypeScript 型チェック

`npx nuxt typecheck` はこの環境では実行不能（npx が自動取得した `vue-tsc@3.3.7` と `typescript@7.0.2` の組み合わせが
`ERR_PACKAGE_PATH_NOT_EXPORTED` で即座にクラッシュする。プロジェクトに typescript/vue-tsc の devDependency 自体が
存在しないための環境起因の問題であり、コードの問題ではない）。

代わりに、`.nuxt/tsconfig.json` を対象に既知の互換バージョンを一時指定して実行:

```
npx --yes -p typescript@5.6.3 -p vue-tsc@2.1.10 vue-tsc --noEmit -p tsconfig.json
```

**結果: エラー0件（exit code 0, 出力なし）**

以後の各項目の「typecheck ベースライン同等」は、このコマンドの結果と比較する。

## 2. ビルド

```
npm run build
```

**結果: 成功（exit code 0）**。`.output/` 一式生成、Nitro server / client chunk とも正常出力。

## 3. E2E（Playwright, 全36テスト）

dev サーバー起動（`npm run dev`, http://localhost:3000）済みの状態で実行。

```
npx playwright test --reporter=line
```

**結果: 32 passed / 4 failed（7.1分）**

失敗した4件を個別に再実行して再現性を確認した結果:

| # | テスト名 | 行 | 再現性 | 備考 |
|---|---|---|---|---|
| 1 | Dashboard › Recent Transactions テーブルが表示される | :181 | **flaky**（単独再実行では pass） | タイミング依存と推定。既存の不安定挙動で今回の計画のスコープ外 |
| 2 | Customers › Update Customer で顧客情報を正しく更新できる | :480 | **常に失敗** | 顧客更新後、リストに反映されない |
| 3 | Customers › Add New Customer で新規顧客を追加できる | :517 | **常に失敗** | "Register Customer" クリック後もモーダルが閉じず、顧客が登録されない（`handleAddCustomer` が失敗している可能性。error-context のスナップショットでモーダルが開いたままなのを確認） |
| 4 | Customers › 顧客を削除できる | :546 | **常に失敗** | 上記 #3 と同根（`createTestCustomer` ヘルパーが顧客作成を前提にしており、登録自体が失敗するため） |

**重要**: #2〜#4 は customers/index.vue の顧客登録処理そのものに起因する**既存のアプリケーションバグ**であり、
本リファクタリング計画のどの項目（R1〜R23）もこの根本原因（`handleAddCustomer` の実際の失敗要因）を修正対象にしていない。
このバグの原因調査・修正は本計画のスコープ外（新規調査が必要で、計画書に記載のない変更になるため）。

### 以後の完了条件への適用

- R5, R8, R12, R15, R17（R17はvehicles側なので影響なし）, R22 など `customers/index.vue` / `dashboard.vue` に触れる項目の
  「E2E 全パス」は、**このベースラインの3件の恒常的失敗（#2〜#4）を除いた32件が pass し続けること、かつ新たな失敗が
  増えないこと**と読み替える。Dashboard の#1はflakyなため、単発失敗は許容し2回実行して再現するかで判断する。
- 上記以外の項目（R1〜R4, R6, R7, R9〜R11, R13, R14, R16, R18〜R21, R23）は customers/dashboard に触れないため、
  文字通り「変更前と同じ32 passed / 4 failed（内訳同一）」を維持することが完了条件。

## 4. 環境メモ

- dev サーバー: `npm run dev`（PID管理はバックグラウンドプロセスとして起動、port 3000）
- `.env` 存在確認済み
- `.nuxt/` は `nuxt prepare` 相当で既に生成済み（tsconfig 参照可能）
- playwright は `@playwright/test` としてローカル devDependency 済み、`node_modules/.bin` 経由で実行される（新規インストールなし）

---

## 5. 最終結果（R1〜R23 全23項目完了後）

計測日: 2026-07-12 / 最終コミット: `a8351e6`（`refactor/plan-2026-07`, ベースラインから24コミット）

dev サーバーをクリーン再起動した状態で再計測。

| 項目 | ベースライン | 最終 | 判定 |
|---|---|---|---|
| typecheck エラー数 | 0件 | **0件** | 同等 ✅ |
| build | 成功 | **成功** | 同等 ✅ |
| E2E | 32 passed / 4 failed（うち1件flaky） | **33 passed / 3 failed** | **改善**（flakyだったDashboardテストが今回・前回とも再現せずpass。Customers 3件の恒常的失敗のみ残存、新規失敗なし）✅ |

### E2E失敗3件（ベースラインと完全一致、R1〜R23のどれも修正対象にしていない既存バグ）

- Customers › Update Customer で顧客情報を正しく更新できる（:480）
- Customers › Add New Customer で新規顧客を追加できる（:517）
- Customers › 顧客を削除できる（:546）

いずれも `handleAddCustomer`（顧客登録処理）自体の失敗に起因し、R5/R8/R12/R15/R22 は関連ファイルに触れたが
この根本原因（新規顧客登録がなぜ失敗するか）はどの項目のスコープにも含まれていなかった。次回の課題として残す。

### 実施した唯一の挙動変更（ユーザー承認済み）

- R20: 貸出・返却完了後のリダイレクト先を `/`→`/dashboard` に変更（E2E 2アサーション込み）
- R23: サイドバー設定リンクの表示条件を `isAdmin` に一本化

### 手動確認が必要だが本環境で実施できなかった項目

- R22: customers ページのカメラ撮影フロー（新旧とも E2E は到達しない領域）。カメラハードウェアがない実行環境のため
  実機確認は未実施。設計は既存の VehiclePhotoManager.vue と同一の CameraCapture 連携パターンを踏襲。
- R21: CSV エクスポートのダウンロード内容の目視確認は未実施（ブラウザダウンロード機構が本環境で検証しづらいため）。
  ロジックの妥当性は個別に手計算・スクリプトで検証済み（BASELINE 追記時点のコミット履歴参照）。
