-- staff テーブルに username カラムを追加
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS username TEXT;

-- 既存のデータを email に基づいてバックフィル
UPDATE public.staff
SET username = LOWER(REGEXP_REPLACE(split_part(email, '@', 1), '[^a-zA-Z0-9]', '', 'g'))
WHERE username IS NULL AND email IS NOT NULL;

-- 特定の admin ユーザーへの強制設定
UPDATE public.staff
SET username = 'admin'
WHERE id = '8dc65512-2db8-4592-92df-a2b0e411a1ec' AND username IS NULL;

-- ユニーク制約の追加（重複防止）
-- 重複がある場合はエラーになるため、事前にバックフィルを行っています
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'staff_username_key'
    ) THEN
        ALTER TABLE public.staff ADD CONSTRAINT staff_username_key UNIQUE (username);
    END IF;
END $$;
