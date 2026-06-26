-- 1. カラム名の変更 (full_name -> username)
-- username が既に存在する場合はリネームせず full_name を削除するだけにする
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff' AND column_name = 'full_name') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff' AND column_name = 'username') THEN
            -- username 列が既にある場合は full_name を削除するだけ
            ALTER TABLE public.staff DROP COLUMN full_name;
        ELSE
            ALTER TABLE public.staff RENAME COLUMN full_name TO username;
        END IF;
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
