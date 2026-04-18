-- 1. カラム名の変更 (full_name -> username)
-- すでに username がある場合はエラーを無視するようにします
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff' AND column_name = 'full_name') THEN
        ALTER TABLE public.staff RENAME COLUMN full_name TO username;
    END IF;
END $$;

-- 2. データのクレンジング (ユーザー名として使える形式にする)
UPDATE public.staff
SET username = LOWER(REGEXP_REPLACE(username, '[^a-zA-Z0-9]', '', 'g'))
WHERE username IS NOT NULL;

-- 3. 空白や重複の防止（念のため）
UPDATE public.staff
SET username = 'admin'
WHERE id = '8dc65512-2db8-4592-92df-a2b0e411a1ec' OR username IS NULL OR username = '';
