-- 貸出・返却の 3 操作をアトミックに実行する RPC 関数
--
-- 問題: insert/update が 3 回の別々の DB 書き込みになっており、
--       途中失敗時にデータが不整合になる（例: transactions は作成されたが
--       vehicles.status_id が更新されないまま）。
-- 解決: PostgreSQL 関数内ですべての操作を 1 トランザクションにまとめる。

-- 貸出: transactions INSERT + vehicles UPDATE + customers UPDATE をアトミックに実行
-- 戻り値: 作成した transaction の id
CREATE OR REPLACE FUNCTION public.complete_lending(
  p_vehicle_id    uuid,
  p_customer_id   uuid,
  p_staff_id      uuid,
  p_store_id      uuid,
  p_start_at      timestamptz,
  p_end_at        timestamptz,
  p_start_mileage integer,
  p_price         numeric
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_transaction_id    uuid;
  v_lent_status_id    uuid;
  v_renting_status_id uuid;
  v_user_store_id     uuid;
BEGIN
  -- 呼び出しユーザーが p_store_id に所属しているか確認
  v_user_store_id := get_auth_store_id();
  IF v_user_store_id IS DISTINCT FROM p_store_id THEN
    RAISE EXCEPTION 'Access denied: store mismatch';
  END IF;

  SELECT id INTO v_lent_status_id    FROM public.vehicle_statuses  WHERE name = 'Lent';
  SELECT id INTO v_renting_status_id FROM public.customer_statuses WHERE name = 'Renting';

  INSERT INTO public.transactions (
    vehicle_id, customer_id, staff_id, store_id,
    start_at, end_at, start_mileage, price, status
  )
  VALUES (
    p_vehicle_id, p_customer_id, p_staff_id, p_store_id,
    p_start_at, p_end_at, p_start_mileage, p_price, 'Active'
  )
  RETURNING id INTO v_transaction_id;

  UPDATE public.vehicles  SET status_id = v_lent_status_id    WHERE id = p_vehicle_id;
  UPDATE public.customers SET status_id = v_renting_status_id WHERE id = p_customer_id;

  RETURN v_transaction_id;
END;
$$;

-- 返却: transactions UPDATE + vehicles UPDATE + customers UPDATE をアトミックに実行
CREATE OR REPLACE FUNCTION public.complete_return(
  p_transaction_id uuid,
  p_end_at         timestamptz,
  p_vehicle_id     uuid,
  p_customer_id    uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_available_status_id uuid;
  v_active_status_id    uuid;
  v_store_id            uuid;
  v_user_store_id       uuid;
BEGIN
  -- 呼び出しユーザーがそのトランザクションの store に所属しているか確認
  SELECT store_id INTO v_store_id FROM public.transactions WHERE id = p_transaction_id;
  v_user_store_id := get_auth_store_id();
  IF v_user_store_id IS DISTINCT FROM v_store_id THEN
    RAISE EXCEPTION 'Access denied: store mismatch';
  END IF;

  SELECT id INTO v_available_status_id FROM public.vehicle_statuses  WHERE name = 'Available';
  SELECT id INTO v_active_status_id    FROM public.customer_statuses WHERE name = 'Active';

  UPDATE public.transactions SET status = 'Completed', end_at = p_end_at WHERE id = p_transaction_id;
  UPDATE public.vehicles     SET status_id = v_available_status_id         WHERE id = p_vehicle_id;
  UPDATE public.customers    SET status_id = v_active_status_id            WHERE id = p_customer_id;
END;
$$;

-- 認証済みユーザーに実行権限を付与
GRANT EXECUTE ON FUNCTION public.complete_lending TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_return  TO authenticated;
