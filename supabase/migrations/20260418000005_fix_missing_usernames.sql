-- ユーザー名が未設定のスタッフを修正する
UPDATE public.staff
SET username = LOWER(REGEXP_REPLACE(split_part(email, '@', 1), '[^a-zA-Z0-9]', '', 'g'))
WHERE username IS NULL;

-- 万が一、特定のUID（8dc65512-2db8-4592-92df-a2b0e411a1ec）が依然として未設定の場合の強制設定
-- (emailが取得できない場合などを想定)
UPDATE public.staff
SET username = 'admin'
WHERE id = '8dc65512-2db8-4592-92df-a2b0e411a1ec' AND username IS NULL;
