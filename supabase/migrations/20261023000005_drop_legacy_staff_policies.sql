-- 20260323000002_multi_tenancy_rls.sql で作られた古い staff ポリシーが prod にだけ残っていた（dev では削除済み）。
-- "manage members" は同じ店舗の全スタッフに ALL を許可するため、20261023000004 の制限を OR で打ち消し、
-- 一般スタッフが自分のロールを admin に変更できてしまう。"view members" は
-- "Staff can see colleagues in their own store" と同じ範囲なので、揃えるためにあわせて削除する。
DROP POLICY IF EXISTS "Staff can manage members in their store" ON public.staff;
DROP POLICY IF EXISTS "Staff can view members in their store" ON public.staff;
