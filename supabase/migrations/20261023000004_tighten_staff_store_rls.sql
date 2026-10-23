-- 権限まわりの RLS を見直す
-- 従来は同じ店舗の全スタッフが staff を追加・変更・削除でき（自分を admin に昇格できた）、
-- 店舗情報も全スタッフが更新できた。また reservations / vehicle_categories は RLS が無効で、
-- 未ログイン（anon キー）でも読み書きできた。

-- ---- ロール判定 ----
-- search_path を固定する（SECURITY DEFINER 関数の定石）
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff
    WHERE id = auth.uid() AND role_id = '00000000-0000-0000-0001-000000000001'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff
    WHERE id = auth.uid() AND role_id = '00000000-0000-0000-0001-000000000000'
  );
$$;

-- ---- staff ----
-- 閲覧（自分と同じ店舗のスタッフ）は "Staff can see colleagues in their own store" のまま
DROP POLICY IF EXISTS "Admins can manage staff in their own store" ON public.staff;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.staff;

-- クライアントからの変更は「店舗 admin による自店舗スタッフのロール変更（staff / admin のみ）」だけ
DROP POLICY IF EXISTS "Admins can update staff roles in their store" ON public.staff;
CREATE POLICY "Admins can update staff roles in their store" ON public.staff FOR UPDATE
  USING (public.is_admin() AND store_id = public.get_auth_store_id())
  WITH CHECK (
    store_id = public.get_auth_store_id()
    AND role_id IN ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0001-000000000002')
  );

-- 作成・削除はサーバー API（service role）、言語は RPC set_my_locale で行うため、列単位でもロールだけに絞る
REVOKE INSERT, UPDATE, DELETE ON public.staff FROM anon, authenticated;
GRANT UPDATE (role_id) ON public.staff TO authenticated;

-- ---- stores ----
DROP POLICY IF EXISTS "Allow public read on stores" ON public.stores;
DROP POLICY IF EXISTS "Staff can read their own store" ON public.stores;
CREATE POLICY "Staff can read their own store" ON public.stores FOR SELECT
  USING (id = public.get_auth_store_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Staff can update their own store" ON public.stores;
DROP POLICY IF EXISTS "Admins can update their own store" ON public.stores;
CREATE POLICY "Admins can update their own store" ON public.stores FOR UPDATE
  USING (public.is_admin() AND id = public.get_auth_store_id())
  WITH CHECK (id = public.get_auth_store_id());

-- 店舗の作成・削除はサーバー API（service role）。設定画面で変更する列だけ更新を許可する
REVOKE INSERT, UPDATE, DELETE ON public.stores FROM anon, authenticated;
GRANT UPDATE (name, address, currency_id, default_locale) ON public.stores TO authenticated;

-- ---- reservations（現状アプリからは未使用） ----
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage reservations in their store" ON public.reservations;
CREATE POLICY "Staff can manage reservations in their store" ON public.reservations FOR ALL
  USING (store_id = public.get_auth_store_id())
  WITH CHECK (store_id = public.get_auth_store_id());

-- ---- vehicle_categories（全店舗共通のマスタ。変更は管理者が DB で行う） ----
ALTER TABLE public.vehicle_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read vehicle categories" ON public.vehicle_categories;
CREATE POLICY "Anyone can read vehicle categories" ON public.vehicle_categories FOR SELECT
  USING (true);
