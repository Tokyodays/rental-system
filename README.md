# Rental System

マルチテナント対応の車両レンタル管理システム（Nuxt 4 + Supabase）

## デプロイ環境

| 環境 | URL | Supabase | ブランチ |
|------|-----|----------|---------|
| **本番** | https://rental-system-tokyodays-projects.vercel.app | rental-system-prod | `deployment/production` |
| **開発** | https://rental-system-dev.vercel.app | rental-system-dev | `deployment/development` |

### デプロイフロー

```
feature/* → main（PR & merge）
              ↓
  main → deployment/development（PR & merge）→ 開発環境へ自動デプロイ
              ↓ 動作確認後
  deployment/development → deployment/production（PR & merge）→ 本番へ自動デプロイ
```

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Testing

### 前提条件

- 開発サーバーが起動中であること（`yarn dev`）
- Supabase にシードデータ（vehicles, customers 等）が投入済みであること
- テスト用のログインアカウント（メール・パスワード）が存在すること

### E2E テスト（Playwright）

ブラウザ上で実際の画面操作をテストする End-to-End テストです。

#### 1. 開発サーバーを起動

```bash
yarn dev
```

#### 2. 別のターミナルでテストを実行

テスト用のログイン認証情報を環境変数で渡して実行します：

```bash
# 基本実行（ヘッドレス）
E2E_USER_EMAIL=admin E2E_USER_PASSWORD=password123 yarn test:e2e

# ポート番号を指定して実行（例：3001番ポート）
E2E_PORT=3001 E2E_USER_EMAIL=developer@gmail.com E2E_USER_PASSWORD=password123 yarn test:e2e

# ブラウザを表示しながら実行（デバッグ用）
E2E_USER_EMAIL=developer@gmail.com E2E_USER_PASSWORD=password123 yarn test:e2e:headed

# Playwright UI モードで実行（インタラクティブにテスト操作確認）
E2E_USER_EMAIL=developer@gmail.com E2E_USER_PASSWORD=password123 yarn test:e2e:ui
```

#### 3. テストレポートを確認

テスト完了後、HTMLレポートが生成されます：

```bash
npx playwright show-report
```

### テスト項目一覧

| # | カテゴリ | テスト内容 |
|---|---------|-----------|
| 1 | Dashboard | Lending, Available, Today's Transactions が正しく表示される |
| 2 | Dashboard | Recent Transactions テーブルが表示される |
| 3 | Dashboard | Lending ボタンが /rentals/new へ遷移する |
| 4 | Dashboard | View All リンクが /history へ遷移する |
| 5 | Vehicle List | 車両一覧テーブルが正しく表示される |
| 6 | Vehicle List | 検索フィルタが機能する |
| 7 | Vehicle List | カテゴリフィルタが機能する |
| 8 | Vehicle List | Vehicle Details サイドバーが表示される |
| 9 | Add Vehicle | 新しい車両を正しく追加できる |
| 10 | Lending | 任意のユーザーが任意の車両を正しくレンタルできる |
| 11 | Return | 任意のレンタル中車両を正しく返却できる |
| 12 | Customers | 顧客一覧が正しく表示される |
| 13 | Customers | Update Customer で情報を更新できる |
| 14 | Customers | Add New Customer で新規追加できる |
| 15 | Customers | 顧客を削除できる |
| 16 | History | 取引履歴一覧が正しく表示される |
| 17 | History | 検索フィルタが機能する |
| 18 | History | Export モーダルが表示される |
| 19 | Navigation | サイドバーのリンクが正しく遷移する |
| 20 | Navigation | Return Vehicle ページが正しく表示される |
| 21 | Error Handling | 無効な Vehicle ID でエラーになる（Lending） |
| 22 | Error Handling | 無効な Vehicle ID でエラーになる（Return） |
| 23 | Error Handling | 過去日付の返却日でボタンが無効化される |
| 24 | Status Filters | Vehicle 一覧のステータスフィルタが機能する |
| 25 | Status Filters | Customer 一覧のステータスフィルタが機能する |
