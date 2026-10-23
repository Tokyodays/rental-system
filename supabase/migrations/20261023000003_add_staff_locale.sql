-- スタッフごとの表示言語。NULL のときは店舗のデフォルト言語（stores.default_locale）に従う
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS locale TEXT;

ALTER TABLE public.staff DROP CONSTRAINT IF EXISTS staff_locale_check;
ALTER TABLE public.staff ADD CONSTRAINT staff_locale_check
  CHECK (locale IS NULL OR locale IN ('en', 'th', 'lo', 'vi', 'ms'));

-- 自分の言語だけを変更する。staff 行の UPDATE 権限（ロールなど他の列も変えられる）に頼らないよう RPC にする
-- 空文字は NULL（店舗のデフォルトに従う）として保存する
CREATE OR REPLACE FUNCTION public.set_my_locale(p_locale TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.staff SET locale = NULLIF(p_locale, '') WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.set_my_locale(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_my_locale(TEXT) TO authenticated;
