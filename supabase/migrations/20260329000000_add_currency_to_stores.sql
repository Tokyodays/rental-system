-- stores テーブルに currency カラムを追加（デフォルトはバーツ 'THB'）
ALTER TABLE stores ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'THB';

-- 既存の店舗にデフォルト値を設定
UPDATE stores SET currency = 'THB' WHERE currency IS NULL;
