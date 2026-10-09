-- super_admin(オーナー)は店舗を持たない。
-- staff.store_id を NULL 許可にし、super_admin 以外は store_id 必須であることを CHECK 制約で担保する。

-- 1. NOT NULL を外す
ALTER TABLE public.staff ALTER COLUMN store_id DROP NOT NULL;

-- 2. super_admin 以外は store_id 必須
ALTER TABLE public.staff DROP CONSTRAINT IF EXISTS staff_store_required_unless_super_admin;
ALTER TABLE public.staff
  ADD CONSTRAINT staff_store_required_unless_super_admin
  CHECK (store_id IS NOT NULL OR role_id = '00000000-0000-0000-0001-000000000000');

-- 3. handle_new_user: NOT NULL 違反の握りつぶしを外す。
--    トリガーで作られる staff 行は store_id なし・staff ロールなので CHECK に違反する。
--    auth.users の INSERT 自体は止めたくないため、check_violation を握りつぶして
--    staff 行は API(users.post.ts)の upsert で作る、という従来の挙動を維持する。
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
  WHEN not_null_violation OR check_violation THEN RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 自己更新ポリシー: store_id が NULL(super_admin)でも自分の行を更新できるようにする
DROP POLICY IF EXISTS "Users can update their own profile" ON public.staff;
CREATE POLICY "Users can update their own profile" ON public.staff
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND store_id IS NOT DISTINCT FROM (SELECT s.store_id FROM public.staff s WHERE s.id = auth.uid())
  );
