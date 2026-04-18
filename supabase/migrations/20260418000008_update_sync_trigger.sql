-- Auth ユーザー作成・更新時に public.staff を同期する関数を修正
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.staff (id, email, username, role_id)
  VALUES (
    new.id,
    new.email,
    LOWER(COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))),
    '00000000-0000-0000-0001-000000000002' -- デフォルトは user ロール
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    username = LOWER(COALESCE(new.raw_user_meta_data->>'username', EXCLUDED.username)),
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
