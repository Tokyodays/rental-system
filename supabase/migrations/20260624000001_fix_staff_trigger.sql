-- Fix handle_new_user trigger: remove reference to non-existent updated_at column
-- The staff table does not have an updated_at column, causing auth.admin.createUser to fail
-- with "Database error saving new user" whenever a new user is created via the API.
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
    username = LOWER(COALESCE(new.raw_user_meta_data->>'username', EXCLUDED.username));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
