-- 1. 古いトリガーを一度削除してクリーンにする
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. 同期関数を最新のカラム（username）に合わせて再定義
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.staff (id, email, username, role_id, store_id)
  VALUES (
    new.id,
    new.email,
    LOWER(COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))),
    '00000000-0000-0000-0001-000000000001', -- admin ロールをデフォルトで付与（修復用）
    (SELECT id FROM public.stores LIMIT 1) -- 最初の店舗に所属
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. トリガーを再登録
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
