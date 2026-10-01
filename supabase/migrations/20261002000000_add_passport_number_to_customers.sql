-- customers.passport_number を追加
-- 画面（顧客の追加/更新フォーム・一覧・詳細ペイン）は passport_number を読み書きするが、
-- 列を作るマイグレーションが欠けていたため insert/update が PGRST204 で失敗していた。
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS passport_number TEXT;

-- PostgREST のスキーマキャッシュを更新
NOTIFY pgrst, 'reload schema';
