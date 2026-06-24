-- Fix handle_new_user trigger:
-- 1. Remove 'email' column reference (staff table has no email column)
-- 2. Add EXCEPTION handling so trigger doesn't abort auth.users INSERT
--    when store_id (NOT NULL, no default) is missing
-- The API (users.post.ts) now uses UPSERT to set store_id after user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.staff (id, username, role_id)
  VALUES (
    new.id,
    LOWER(COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))),
    '00000000-0000-0000-0001-000000000002'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    username = LOWER(COALESCE(new.raw_user_meta_data->>'username', EXCLUDED.username));
  RETURN new;
EXCEPTION
  WHEN not_null_violation THEN RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
