# Deployment Guide — Vercel × Supabase

## ブランチ戦略

| ブランチ | 環境 | Supabase | Vercel |
|---------|------|----------|--------|
| `deployment/development` | 開発環境 | Development プロジェクト | Preview デプロイ |
| `deployment/production` | 本番環境 | Production プロジェクト | Production デプロイ |
| `main` | 開発の最新 | — | 自動デプロイなし |

---

## Supabase 環境分離について

**結論: 開発と本番で Supabase プロジェクトを分けることを強く推奨します。**

### 理由

- 本番 DB に対してマイグレーションをテストする事故を防ぐ
- RLS ポリシーの変更を安全に検証できる
- Storage バケット・Edge Functions も環境ごとに独立する
- シードデータ（テストユーザー等）を本番に混入させない

### Supabase プロジェクト構成

```
rental-system-dev    ← development ブランチが接続
rental-system-prod   ← production ブランチが接続
```

---

## Step 1: Supabase プロジェクトを2つ作成する

1. [Supabase Dashboard](https://supabase.com/dashboard) で新規プロジェクトを2つ作成
   - `rental-system-dev`（開発用）
   - `rental-system-prod`（本番用）

2. 各プロジェクトの **Settings → API** から以下を控える：
   - `SUPABASE_URL`
   - `SUPABASE_KEY`（anon key）
   - `SUPABASE_SERVICE_ROLE_KEY`（マイグレーション用）

3. **マイグレーションを適用する**（各プロジェクトに対して実行）：

```bash
# Supabase CLI でリモートに接続してマイグレーション適用
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
```

   または Supabase Dashboard の **SQL Editor** で `supabase/migrations/` の SQL を順番に実行する。

4. **シードデータを本番には入れない**
   - `supabase/seed.sql` は開発プロジェクトにのみ適用する
   - 本番の初期データは別途 `supabase/seed.prod.sql` を作成して管理推奨

---

## Step 2: Vercel プロジェクトをセットアップする

### 2-1. Vercel CLI でログイン・プロジェクト作成

```bash
vercel login
vercel link   # または vercel --cwd . でプロジェクト初期化
```

### 2-2. 環境変数を登録する

Vercel Dashboard の **Settings → Environment Variables** で以下を設定：

#### 開発環境（Preview）

| 変数名 | 値 |
|--------|-----|
| `SUPABASE_URL` | rental-system-dev の URL |
| `SUPABASE_KEY` | rental-system-dev の anon key |

#### 本番環境（Production）

| 変数名 | 値 |
|--------|-----|
| `SUPABASE_URL` | rental-system-prod の URL |
| `SUPABASE_KEY` | rental-system-prod の anon key |

> Vercel の環境変数は「Production」「Preview」「Development」で別々に設定できる。

### 2-3. CLI で環境変数を設定する場合

```bash
# 本番環境用
vercel env add SUPABASE_URL production
vercel env add SUPABASE_KEY production

# プレビュー（開発）環境用
vercel env add SUPABASE_URL preview
vercel env add SUPABASE_KEY preview
```

---

## Step 3: Vercel のブランチデプロイ設定

Vercel Dashboard の **Settings → Git** で以下を設定：

| 項目 | 設定値 |
|------|--------|
| Production Branch | `deployment/production` |
| Preview Branches | `deployment/development`（および他ブランチ） |

> **注意**: Vercel のデフォルトの Production Branch は `main` になっている。  
> `deployment/production` に変更すること。

---

## Step 4: 自動デプロイの動作確認

設定完了後のデプロイフロー：

```
feature/* → main（PR & merge で開発最新を管理）
                ↓
main → deployment/development（PR & merge でdev環境に反映）
                ↓
deployment/development → deployment/production（PR & merge で本番リリース）
```

### 各ブランチへの push 時の動作

| push 先 | Vercel の動作 |
|---------|--------------|
| `deployment/production` | Production デプロイ（本番URL） |
| `deployment/development` | Preview デプロイ（dev用URL） |
| その他ブランチ | Preview デプロイ（一時的なURL） |

---

## Step 5: ローカル開発の .env 設定

`.env.local`（gitignore 済み）を作成：

```bash
# 開発時はdev環境のSupabaseを使う
SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Step 6: マイグレーション運用ルール

本番への DB 変更は以下の手順で行う：

1. `supabase/migrations/` に新しいマイグレーションファイルを追加
2. `deployment/development` にマージして dev 環境で動作確認
3. dev Supabase に対して `npx supabase db push` でマイグレーション適用・検証
4. 問題なければ `deployment/production` にマージし、prod Supabase に手動で適用

```bash
# prod に接続して適用
npx supabase link --project-ref <PROD_PROJECT_REF>
npx supabase db push
```

> 本番マイグレーションの自動化（CI/CD）は安定後に検討する。

---

## チェックリスト

### 初回セットアップ

- [ ] Supabase dev プロジェクト作成・マイグレーション適用
- [ ] Supabase prod プロジェクト作成・マイグレーション適用
- [ ] Vercel プロジェクト作成（`vercel link`）
- [ ] Vercel に dev 環境変数を設定（Preview）
- [ ] Vercel に prod 環境変数を設定（Production）
- [ ] Vercel の Production Branch を `deployment/production` に変更
- [ ] `deployment/development` に push してプレビューURLを確認
- [ ] `deployment/production` に push して本番URLを確認

### リリースのたびに

- [ ] `main` → `deployment/development` へ PR を作成・マージ
- [ ] dev 環境の Vercel プレビューで動作確認
- [ ] `deployment/development` → `deployment/production` へ PR を作成・マージ
- [ ] 本番でリリース確認
