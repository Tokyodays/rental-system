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
