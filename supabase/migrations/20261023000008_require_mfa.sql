-- 二段階認証（TOTP）を済ませたセッション（JWT の aal = 'aal2'）だけが店舗のデータにアクセスできるようにする。
-- パスワードだけのログイン（aal1）では、顧客・パスポート画像・取引などを読み書きできない。

-- ---- 店舗・ロール判定の関数で aal2 を必須にする ----
-- 店舗のデータの RLS（顧客・車両・取引・延長・予約・店舗・パスポート画像）と、貸出・返却・延長の RPC は
-- get_auth_store_id() で店舗を判定しているため、ここで aal1 なら NULL を返せば一括で拒否される
CREATE OR REPLACE FUNCTION public.get_auth_store_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT store_id FROM public.user_store_map
  WHERE user_id = auth.uid() AND coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(auth.jwt() ->> 'aal', '') = 'aal2' AND EXISTS (
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
  SELECT coalesce(auth.jwt() ->> 'aal', '') = 'aal2' AND EXISTS (
    SELECT 1 FROM public.staff
    WHERE id = auth.uid() AND role_id = '00000000-0000-0000-0001-000000000000'
  );
$$;

-- ---- get_auth_store_id() を経由しない古い transactions のポリシーを削除 ----
-- "Staff can manage rentals in their store"（get_auth_store_id 経由）と重複しており、残すと aal の制限を迂回できる
DROP POLICY IF EXISTS "Staff can view their store's transactions" ON public.transactions;
DROP POLICY IF EXISTS "Staff can insert their store's transactions" ON public.transactions;
DROP POLICY IF EXISTS "Staff can update their store's transactions" ON public.transactions;

-- ---- 同僚の一覧も aal2 のときだけ（自分の行はログイン直後の判定に使うため aal1 でも読める） ----
DROP POLICY IF EXISTS "Staff can see colleagues in their own store" ON public.staff;
CREATE POLICY "Staff can see colleagues in their own store" ON public.staff FOR SELECT
  USING (id = auth.uid() OR store_id = public.get_auth_store_id());

-- ---- 個人情報を含むテーブルには、二段階認証を必須にする制限ポリシーを重ねる ----
-- 今後 get_auth_store_id() を使わないポリシーが追加されても、aal1 では読み書きできないようにするための保険
DROP POLICY IF EXISTS "Require MFA" ON public.customers;
CREATE POLICY "Require MFA" ON public.customers AS RESTRICTIVE FOR ALL
  USING (coalesce(auth.jwt() ->> 'aal', '') = 'aal2')
  WITH CHECK (coalesce(auth.jwt() ->> 'aal', '') = 'aal2');

DROP POLICY IF EXISTS "Require MFA" ON public.transactions;
CREATE POLICY "Require MFA" ON public.transactions AS RESTRICTIVE FOR ALL
  USING (coalesce(auth.jwt() ->> 'aal', '') = 'aal2')
  WITH CHECK (coalesce(auth.jwt() ->> 'aal', '') = 'aal2');

DROP POLICY IF EXISTS "Require MFA" ON public.transaction_extensions;
CREATE POLICY "Require MFA" ON public.transaction_extensions AS RESTRICTIVE FOR ALL
  USING (coalesce(auth.jwt() ->> 'aal', '') = 'aal2')
  WITH CHECK (coalesce(auth.jwt() ->> 'aal', '') = 'aal2');

DROP POLICY IF EXISTS "Require MFA" ON public.reservations;
CREATE POLICY "Require MFA" ON public.reservations AS RESTRICTIVE FOR ALL
  USING (coalesce(auth.jwt() ->> 'aal', '') = 'aal2')
  WITH CHECK (coalesce(auth.jwt() ->> 'aal', '') = 'aal2');
