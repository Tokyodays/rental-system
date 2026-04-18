-- 店舗間の隔離（マルチテナント）を強化するためのポリシー修正

-- 1. スタッフ情報の参照範囲を「同じ店舗のスタッフのみ」に制限
DROP POLICY IF EXISTS "Allow authenticated read all staff" ON public.staff;
CREATE POLICY "Staff can see colleagues in their own store" ON public.staff
  FOR SELECT TO authenticated
  USING (
    store_id = (SELECT store_id FROM public.staff WHERE id = auth.uid())
  );

-- 2. 管理者による操作範囲を「自分の店舗のスタッフのみ」に制限
DROP POLICY IF EXISTS "Admins can manage staff" ON public.staff;
CREATE POLICY "Admins can manage staff in their own store" ON public.staff
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff AS admins
      WHERE admins.id = auth.uid()
      AND admins.role_id = '00000000-0000-0000-0001-000000000001' -- admin role
      AND admins.store_id = public.staff.store_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff AS admins
      WHERE admins.id = auth.uid()
      AND admins.role_id = '00000000-0000-0000-0001-000000000001'
      AND admins.store_id = public.staff.store_id
    )
  );

-- 3. 自分自身のプロファイル更新ポリシーも、念のため store_id の変更を禁止するように強化（WITH CHECK）
DROP POLICY IF EXISTS "Users can update their own profile" ON public.staff;
CREATE POLICY "Users can update their own profile" ON public.staff
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND store_id = (SELECT store_id FROM public.staff WHERE id = auth.uid()));
